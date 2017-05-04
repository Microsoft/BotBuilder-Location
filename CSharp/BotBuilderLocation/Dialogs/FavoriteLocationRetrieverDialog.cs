namespace Microsoft.Bot.Builder.Location.Dialogs
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using Bing;
    using Builder.Dialogs;
    using Connector;
    using Internals.Fibers;

    [Serializable]
    class FavoriteLocationRetrieverDialog : LocationRetrieverDialogBase
    {
        private readonly bool supportsKeyboard;
        private readonly IFavoritesManager favoritesManager;
        private readonly ILocationDialogFactory locationDialogFactory;
        private readonly ILocationCardBuilder cardBuilder;
        private IList<FavoriteLocation> locations = new List<FavoriteLocation>();
        private FavoriteLocation selectedLocation;

        public FavoriteLocationRetrieverDialog(
            bool supportsKeyboard,
            IFavoritesManager favoritesManager,
            ILocationDialogFactory locationDialogFactory,
            ILocationCardBuilder cardBuilder,
            IGeoSpatialService geoSpatialService,
            LocationOptions options,
            LocationRequiredFields requiredFields,
            LocationResourceManager resourceManager)
            : base(geoSpatialService, options, requiredFields, resourceManager)
        {
            SetField.NotNull(out this.favoritesManager, nameof(favoritesManager), favoritesManager);
            SetField.NotNull(out this.locationDialogFactory, nameof(locationDialogFactory), locationDialogFactory);
            SetField.NotNull(out this.cardBuilder, nameof(cardBuilder), cardBuilder);
            this.supportsKeyboard = supportsKeyboard;
        }

        public override async Task StartAsync(IDialogContext context)
        {
            this.locations = this.favoritesManager.GetFavorites(context);

            if (locations.Count == 0)
            {
                // The user has no favorite locations
                // switch to a normal location retriever dialog
                await context.PostAsync(this.ResourceManager.NoFavoriteLocationsFound);
                this.SwitchToLocationRetriever(context);
            }
            else
            {
                await context.PostAsync(this.CreateFavoritesCarousel(context));
                await context.PostAsync(this.ResourceManager.SelectFavoriteLocationPrompt);
                context.Wait(this.MessageReceivedAsync);
            }
        }

        protected override async Task MessageReceivedInternalAsync(IDialogContext context, IAwaitable<IMessageActivity> result)
        {
            var messageText = (await result).Text.Trim();
            FavoriteLocation value = null;
            string command = null;

            if (StringComparer.OrdinalIgnoreCase.Equals(messageText, this.ResourceManager.OtherComand))
            {
                this.SwitchToLocationRetriever(context);
            }
            else if (this.TryParseSelection(context, messageText, out value))
            {
                await this.ProcessRetrievedLocation(context, value.Location);
            }
            else if (this.TryParseCommandSelection(context, messageText, out value, out command) &&
                (StringComparer.OrdinalIgnoreCase.Equals(command, this.ResourceManager.DeleteCommand)
                || StringComparer.OrdinalIgnoreCase.Equals(command, this.ResourceManager.EditCommand)))
            {
                if (StringComparer.OrdinalIgnoreCase.Equals(command, this.ResourceManager.DeleteCommand))
                {
                    TryConfirmAndDelete(context, value);
                }
                else
                {
                    var editDialog = this.locationDialogFactory.CreateDialog(BranchType.EditFavoriteLocation, value.Location, value.Name);
                    context.Call(editDialog, this.ResumeAfterChildDialogAsync);
                }
            }
            else
            {
                await context.PostAsync(string.Format(this.ResourceManager.InvalidFavoriteLocationSelection, messageText));
                context.Wait(this.MessageReceivedAsync);
            }
        }

        private void SwitchToLocationRetriever(IDialogContext context)
        {
            var locationRetrieverDialog = this.locationDialogFactory.CreateDialog(BranchType.LocationRetriever);
            context.Call(locationRetrieverDialog, this.ResumeAfterChildDialogAsync);
        }

        private IMessageActivity CreateFavoritesCarousel(IDialogContext context)
        {
            // Get cards for the favorite locations
            var attachments = this.cardBuilder.CreateHeroCards(this.locations.Select(f => f.Location).ToList(), alwaysShowNumericPrefix: true, locationNames: this.locations.Select(f => f.Name).ToList());
            var message = context.MakeMessage();
            message.Attachments = attachments.Select(c => c.ToAttachment()).ToList();
            message.AttachmentLayout = AttachmentLayoutTypes.Carousel;
            return message;
        }

        private bool TryParseSelection(IDialogContext context, string text, out FavoriteLocation value)
        {
            var favoriteRetrievedByName = this.favoritesManager.GetFavoriteByName(context, text);

            if (favoriteRetrievedByName != null)
            {
                value = favoriteRetrievedByName;
                return true;
            }

            int index = -1;

            if (int.TryParse(text, out index))
            {
                value = this.favoritesManager.GetFavoriteByIndex(context, index-1);
                return value != null;
            }

            value = null;
            return false;
        }

        private bool TryParseCommandSelection(IDialogContext context, string text, out FavoriteLocation value, out string command)
        {
            value = null;
            command = null;

            var tokens = text.Split(' ');
            if (tokens.Length != 2)
                return false;

            command = tokens[0];

            return this.TryParseSelection(context, tokens[1], out value);
        }

        private void TryConfirmAndDelete(IDialogContext context, FavoriteLocation favoriteLocation)
        {
            var confirmationAsk = string.Format(
                       this.ResourceManager.DeleteFavoriteConfirmationAsk,
                       $"{favoriteLocation.Name}: {favoriteLocation.Location.GetFormattedAddress(this.ResourceManager.AddressSeparator)}");

            this.selectedLocation = favoriteLocation;

            PromptDialog.Confirm(
                    context,
                    async (dialogContext, answer) =>
                    {
                        if (await answer)
                        {
                            this.favoritesManager.Delete(dialogContext, this.selectedLocation);
                            await dialogContext.PostAsync(string.Format(this.ResourceManager.FavoriteDeletedConfirmation, this.selectedLocation.Name));
                            await this.StartAsync(dialogContext);
                        }
                        else
                        {
                            await dialogContext.PostAsync(string.Format(this.ResourceManager.DeleteFavoriteAbortion, this.selectedLocation.Name));
                            await dialogContext.PostAsync(this.ResourceManager.SelectFavoriteLocationPrompt);
                            dialogContext.Wait(this.MessageReceivedAsync);
                        }
                    },
                    confirmationAsk,
                    retry: this.ResourceManager.ConfirmationInvalidResponse,
                    promptStyle: PromptStyle.None);
        }
    }
}
