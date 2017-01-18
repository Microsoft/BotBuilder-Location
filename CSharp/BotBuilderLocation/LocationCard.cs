namespace Microsoft.Bot.Builder.Location
{
    using System.Collections.Generic;
    using Bing;
    using Connector;
    using ConnectorEx;

    /// <summary>
    /// A static class for creating location cards.
    /// </summary>
    public static class LocationCard
    {
        /// <summary>
        /// Creates locations hero cards (carousel).
        /// </summary>
        /// <param name="apiKey">The geo spatial API key.</param>
        /// <param name="locations">List of the locations.</param>
        /// <param name="alwaysShowNumericPrefix">Indicates whether a list containing exactly one location should have a '1.' prefix in its label.</param>
        /// <returns>The locations card as attachments.</returns>
        public static List<Attachment> CreateLocationHeroCard(string apiKey, IList<Location> locations, bool alwaysShowNumericPrefix = false)
        {
            var attachments = new List<Attachment>();

            int i = 1;

            foreach (var location in locations)
            {
                string address = alwaysShowNumericPrefix || locations.Count > 1 ? $"{i}. {location.Address.FormattedAddress}" : location.Address.FormattedAddress;

                var heroCard = new HeroCard
                {
                    Subtitle = address
                };

                if (location.Point != null)
                {
                    var image =
                        new CardImage(
                            url: new BingGeoSpatialService().GetLocationMapImageUrl(apiKey, location, i));

                    heroCard.Images = new[] { image };
                }

                attachments.Add(heroCard.ToAttachment());

                i++;
            }

            return attachments;
        }

        /// <summary>
        /// Creates location keyboard cards (buttons) with numbers and/or additional labels.
        /// </summary>
        /// <param name="optionsCount">The number of options for which buttons should be made.</param>
        /// <param name="selectText">The card prompt.</param>
        /// <param name="additionalOptionLabels">additional buttons labels.</param>
        /// <returns>The keyboard cards.</returns>
        public static List<Attachment> CreateLocationKeyboardCard(string selectText, int optionsCount = 0, params string[] additionalOptionLabels)
        {
            var buttons = new List<CardAction>();

            for (int i = 1; i <= optionsCount; i++)
            {
                buttons.Add(new CardAction
                {
                    Type = "imBack",
                    Title = i.ToString(),
                    Value = (i++).ToString()
                });
            }

            foreach (var label in additionalOptionLabels)
            {
                buttons.Add(new CardAction
                {
                    Type = "imBack",
                    Title = label,
                    Value = label
                });
            }

            var keyboardCard = new KeyboardCard(selectText, buttons);

            return new List<Attachment> { keyboardCard.ToAttachment() };
        }
    }
}
