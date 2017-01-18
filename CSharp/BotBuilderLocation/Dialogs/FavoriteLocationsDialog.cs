namespace Microsoft.Bot.Builder.Location.Dialogs
{
    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using Bing;
    using Builder.Dialogs;
    using Connector;
    using Internals.Fibers;

    [Serializable]
    class FavoriteLocationsDialog : LocationDialogBase<LocationDialogResponse>
    {
        private readonly bool supportsKeyboard;
        private readonly string apiKey;
        private readonly IFavoritesManager favoritesManager;
        private List<Location> locations = new List<Location>();

        public FavoriteLocationsDialog(
            string apiKey,
            bool supportsKeyboard,
            LocationResourceManager resourceManager) : base(resourceManager)
        {
            SetField.NotNull(out this.apiKey, nameof(apiKey), apiKey);
            this.favoritesManager = new FavoritesManager();
            this.supportsKeyboard = supportsKeyboard;
        }

        public override async Task StartAsync(IDialogContext context)
        {
            this.locations = this.favoritesManager.GetFavorites(context);

            await context.PostAsync(this.CreateFavoritesCarousel(context));

            var favoritesPrompt = this.locations.Count == 0 ? this.ResourceManager.NoFavoriteLocationsFound
                                                            : this.ResourceManager.FavoriteLocationsFound;

            if (this.supportsKeyboard)
            {
                var keyboardCardReply = context.MakeMessage();
                keyboardCardReply.Attachments = LocationCard.CreateLocationKeyboardCard(favoritesPrompt, this.locations.Count, this.ResourceManager.NewCommand);
                keyboardCardReply.AttachmentLayout = AttachmentLayoutTypes.List;
                await context.PostAsync(keyboardCardReply);
            }
            else
            {
                await context.PostAsync(favoritesPrompt);
            }

            context.Wait(this.MessageReceivedAsync);
        }

        protected override async Task MessageReceivedInternalAsync(IDialogContext context, IAwaitable<IMessageActivity> result)
        {
            var messageText = (await result).Text.Trim();

            if (StringComparer.OrdinalIgnoreCase.Equals(messageText, this.ResourceManager.NewCommand))
            {
                context.Done(new LocationDialogResponse(message:messageText));  
            }
            else
            {
                int value = -1;
                if (int.TryParse(messageText, out value) && value > 0 && value <= this.locations.Count)
                {
                    context.Done(new LocationDialogResponse(this.locations[value - 1]));
                }
                else
                {
                    await context.PostAsync(this.locations.Count > 0 ? this.ResourceManager.InvalidFavoriteLocationResponse
                                                                     : this.ResourceManager.InvalidEmptyFavoriteLocationsResponse);
                    context.Wait(this.MessageReceivedAsync);
                }
            }
        }

        private IMessageActivity CreateFavoritesCarousel(IDialogContext context)
        {
            // First, get cards for the favorite locations
            var attachments = LocationCard.CreateLocationHeroCard(this.apiKey, this.locations, alwaysShowNumericPrefix: true);

            // Then, add a card for creating a new location
            // TODO: Find a suitable icon?
            // var image = new CardImage(url: "");
            var card = new HeroCard
            {
                Subtitle = this.ResourceManager.NewCommand
                //Images = new[] { image }
            };

            attachments.Add(card.ToAttachment());

            var message = context.MakeMessage();
            message.Attachments = attachments;
            message.AttachmentLayout = AttachmentLayoutTypes.Carousel;
            return message;
        }
    }
}
