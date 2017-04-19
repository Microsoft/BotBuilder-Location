namespace Microsoft.Bot.Builder.Location.Dialogs
{
    using System;
    using System.Threading.Tasks;
    using Bing;
    using Builder.Dialogs;
    using Connector;
    using Internals.Fibers;

    [Serializable]
    internal class AddFavoriteLocationDialog : LocationDialogBase<LocationDialogResponse>
    {
        private readonly IFavoritesManager favoritesManager;
        private readonly Location location;

        internal AddFavoriteLocationDialog(IFavoritesManager favoritesManager, Location location, LocationResourceManager resourceManager) : base(resourceManager)
        {
            SetField.NotNull(out this.favoritesManager, nameof(favoritesManager), favoritesManager);
            SetField.NotNull(out this.location, nameof(location), location);
        }

        public override async Task StartAsync(IDialogContext context)
        {
            // no capacity to add to favorites in the first place!
            // OR the location is already marked as favorite
            if (this.favoritesManager.MaxCapacityReached(context) || this.favoritesManager.IsFavorite(context, this.location))
            {
                context.Done(new LocationDialogResponse(this.location));
                return;
            }

            PromptDialog.Confirm(
                   context,
                   async (dialogContext, answer) =>
                   {
                       if (await answer)
                       {
                           await dialogContext.PostAsync(this.ResourceManager.EnterNewFavoriteLocationName);
                           dialogContext.Wait(this.MessageReceivedAsync);
                       }
                       else
                       {
                           // The user does NOT want to add the location to favorites.
                           dialogContext.Done(new LocationDialogResponse(this.location));
                       }
                   },
                   this.ResourceManager.AddToFavoritesAsk,
                   retry: this.ResourceManager.AddToFavoritesRetry,
                   promptStyle: PromptStyle.None);
        }

        /// <summary>
        /// Runs when we expect the user to enter 
        /// </summary>
        /// <param name="context"></param>
        /// <param name="result"></param>
        /// <returns></returns>
        protected override async Task MessageReceivedInternalAsync(IDialogContext context, IAwaitable<IMessageActivity> result)
        {
            var messageText = (await result).Text?.Trim();

            if (string.IsNullOrEmpty(messageText))
            {
                await context.PostAsync(this.ResourceManager.InvalidFavoriteNameResponse);
                context.Wait(this.MessageReceivedAsync);
            }
            else if (this.favoritesManager.IsFavoriteLocationName(context, messageText))
            {
                await context.PostAsync(string.Format(this.ResourceManager.DuplicateFavoriteNameResponse, messageText));
                context.Wait(this.MessageReceivedAsync);
            }
            else
            {
                this.favoritesManager.Add(context, new FavoriteLocation { Location = this.location, Name = messageText });
                await context.PostAsync(string.Format(this.ResourceManager.FavoriteAddedConfirmation, messageText));
                context.Done(new LocationDialogResponse(this.location));
            }
        }
    }
}
