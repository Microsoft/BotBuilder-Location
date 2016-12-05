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
    class RichLocationRetrieverDialog : LocationDialogBase<LocationDialogResponse>
    {
        private const int MaxLocationCount = 5;
        private readonly string prompt;
        private readonly bool supportsKeyboard;
        private readonly List<Location> locations = new List<Location>();
        private readonly IGeoSpatialService geoSpatialService;
        private readonly string apiKey;

        /// <summary>
        /// Initializes a new instance of the <see cref="LocationDialog"/> class.
        /// </summary>
        /// <param name="geoSpatialService">The Geo-Special Service</param>
        /// <param name="apiKey">The geo spatial service API key.</param>
        /// <param name="prompt">The prompt posted to the user when dialog starts.</param>
        /// <param name="supportsKeyboard">Indicates whether channel supports keyboard buttons or not.</param>
        /// <param name="resourceManager">The resource manager.</param>
        public RichLocationRetrieverDialog(
            IGeoSpatialService geoSpatialService,
            string apiKey,
            string prompt,
            bool supportsKeyboard,
            LocationResourceManager resourceManager) : base(resourceManager)
        {
            SetField.NotNull(out this.geoSpatialService, nameof(geoSpatialService), geoSpatialService);
            SetField.NotNull(out this.apiKey, nameof(apiKey), apiKey);
            this.prompt = prompt;
            this.supportsKeyboard = supportsKeyboard;
        }

        public override async Task StartAsync(IDialogContext context)
        {
            this.locations.Clear();
            await context.PostAsync(this.prompt);
            context.Wait(this.MessageReceivedAsync);
        }

        protected override async Task MessageReceivedInternalAsync(IDialogContext context, IAwaitable<IMessageActivity> result)
        {
            var message = await result;

            if (this.locations.Count == 0)
            {
                await this.TryResolveAddressAsync(context, message);
            }
            else if (!this.TryResolveAddressSelectionAsync(context, message))
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
            var locationSet = await this.geoSpatialService.GetLocationsByQueryAsync(this.apiKey, message.Text);
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
                locationsCardReply.Attachments = LocationCard.CreateLocationHeroCard(this.apiKey, this.locations);
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
        private bool TryResolveAddressSelectionAsync(IDialogContext context, IMessageActivity message)
        {
            int value;
            if (int.TryParse(message.Text, out value) && value > 0 && value <= this.locations.Count)
            {
                context.Done(new LocationDialogResponse(this.locations[value - 1]));
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
                            dialogContext.Done(new LocationDialogResponse(this.locations.First()));
                        }
                        else
                        {
                            await this.StartAsync(dialogContext);
                        }
                    },
                    prompt: this.ResourceManager.SingleResultFound,
                    retry: null,
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
                var keyboardCardReply = context.MakeMessage();
                keyboardCardReply.Attachments = LocationCard.CreateLocationKeyboardCard(this.locations, this.ResourceManager.MultipleResultsFound);
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
