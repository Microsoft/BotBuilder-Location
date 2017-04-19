namespace Microsoft.Bot.Builder.Location.Dialogs
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using Bing;
    using Builder.Dialogs;
    using Connector;
    using ConnectorEx;
    using Internals.Fibers;

    [Serializable]
    class RichLocationRetrieverDialog : LocationRetrieverDialogBase
    {
        private const int MaxLocationCount = 5;
        private readonly string prompt;
        private readonly bool skipPrompt;
        private readonly bool supportsKeyboard;
        private readonly List<Location> locations = new List<Location>();
        private readonly ILocationCardBuilder cardBuilder;

        /// <summary>
        /// Initializes a new instance of the <see cref="LocationDialog"/> class.
        /// </summary>
        /// <param name="geoSpatialService">The Geo-Special Service.</param>
        /// <param name="cardBuilder">The card builder service.</param>
        /// <param name="prompt">The prompt posted to the user when dialog starts.</param>
        /// <param name="supportsKeyboard">Indicates whether channel supports keyboard buttons or not.</param>
        /// <param name="options">The location options used to customize the experience.</param>
        /// <param name="requiredFields">The location required fields.</param>
        /// <param name="resourceManager">The resource manager.</param>
        internal RichLocationRetrieverDialog(
            string prompt,
            bool supportsKeyboard,
            ILocationCardBuilder cardBuilder,
            IGeoSpatialService geoSpatialService,
            LocationOptions options,
            LocationRequiredFields requiredFields,
            LocationResourceManager resourceManager,
            bool skipPrompt = false)
            : base(geoSpatialService, options, requiredFields, resourceManager)
        {
            SetField.NotNull(out this.cardBuilder, nameof(cardBuilder), cardBuilder);
            SetField.NotNull(out this.prompt, nameof(prompt), prompt);
            this.supportsKeyboard = supportsKeyboard;
            this.skipPrompt = skipPrompt;
        }

        public override async Task StartAsync(IDialogContext context)
        {
            this.locations.Clear();

            if (!this.skipPrompt)
            {
                await context.PostAsync(this.prompt + this.ResourceManager.TitleSuffix);
            }

            context.Wait(this.MessageReceivedAsync);
        }

        protected override async Task MessageReceivedInternalAsync(IDialogContext context, IAwaitable<IMessageActivity> result)
        {
            var message = await result;

            if (this.locations.Count == 0)
            {
                await this.TryResolveAddressAsync(context, message);
            }
            else if (!(await this.TryResolveAddressSelectionAsync(context, message)))
            {
                await context.PostAsync(this.ResourceManager.InvalidLocationResponse);
                context.Wait(this.MessageReceivedAsync);
            }
        }

        /// <summary>
        /// Tries to resolve address by passing the test to the Bing Geo-Spatial API
        /// and looking for returned locations.
        /// </summary>
        /// <param name="context">The context.</param>
        /// <param name="message">The message.</param>
        /// <returns>The asynchronous task.</returns>
        private async Task TryResolveAddressAsync(IDialogContext context, IMessageActivity message)
        {
            var locationSet = await this.geoSpatialService.GetLocationsByQueryAsync(message.Text);
            var foundLocations = locationSet?.Locations;

            if (foundLocations == null || foundLocations.Count == 0)
            {
                await context.PostAsync(this.ResourceManager.LocationNotFound);

                context.Wait(this.MessageReceivedAsync);
            }
            else
            {
                this.locations.AddRange(foundLocations.Take(MaxLocationCount));

                var locationsCardReply = context.MakeMessage();
                locationsCardReply.Attachments = this.cardBuilder.CreateHeroCards(this.locations).Select(C => C.ToAttachment()).ToList();
                locationsCardReply.AttachmentLayout = AttachmentLayoutTypes.Carousel;
                await context.PostAsync(locationsCardReply);

                if (this.locations.Count == 1)
                {
                    this.PromptForSingleAddressSelection(context);
                }
                else
                {
                    await this.PromptForMultipleAddressSelection(context);
                }
            }
        }

        /// <summary>
        /// Tries to resolve address selection by parsing text and checking if it is within locations range.
        /// </summary>
        /// <param name="context">The context.</param>
        /// <param name="message">The message.</param>
        /// <returns>The asynchronous task.</returns>
        private async Task<bool> TryResolveAddressSelectionAsync(IDialogContext context, IMessageActivity message)
        {
            int value;
            if (int.TryParse(message.Text, out value) && value > 0 && value <= this.locations.Count)
            {
                await this.ProcessRetrievedLocation(context, this.locations[value - 1]);
                return true;
            }

            if (StringComparer.OrdinalIgnoreCase.Equals(message.Text, this.ResourceManager.OtherComand))
            {
                // Return new empty location to be filled by the required fields dialog.
                await this.ProcessRetrievedLocation(context, new Location());
                return true;
            }

            return false;
        }

        /// <summary>
        /// Prompts the user to confirm single address selection.
        /// </summary>
        /// <param name="context">The context.</param>
        private void PromptForSingleAddressSelection(IDialogContext context)
        {
            PromptStyle style = this.supportsKeyboard
                        ? PromptStyle.Keyboard
                        : PromptStyle.None;

            PromptDialog.Confirm(
                    context,
                    async (dialogContext, answer) =>
                    {
                        if (await answer)
                        {
                            await this.ProcessRetrievedLocation(dialogContext, this.locations.First());
                        }
                        else
                        {
                            await this.StartAsync(dialogContext);
                        }
                    },
                    prompt: this.ResourceManager.SingleResultFound,
                    retry: this.ResourceManager.ConfirmationInvalidResponse,
                    attempts: 3,
                    promptStyle: style);
        }

        /// <summary>
        /// Prompts the user for multiple address selection.
        /// </summary>
        /// <param name="context">The context.</param>
        /// <returns></returns>
        private async Task PromptForMultipleAddressSelection(IDialogContext context)
        {
            if (this.supportsKeyboard)
            {
                var keyboardCard = this.cardBuilder.CreateKeyboardCard(this.ResourceManager.MultipleResultsFound, this.locations.Count);
                var keyboardCardReply = context.MakeMessage();
                keyboardCardReply.Attachments = new List<Attachment> { keyboardCard.ToAttachment() };
                keyboardCardReply.AttachmentLayout = AttachmentLayoutTypes.List;
                await context.PostAsync(keyboardCardReply);
            }
            else
            {
                await context.PostAsync(this.ResourceManager.MultipleResultsFound);
            }

            context.Wait(this.MessageReceivedAsync);
        }
    }
}
