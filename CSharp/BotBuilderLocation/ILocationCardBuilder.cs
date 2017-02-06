namespace Microsoft.Bot.Builder.Location
{
    using System.Collections.Generic;
    using Bing;
    using Connector;
    using ConnectorEx;

    internal interface ILocationCardBuilder
    {
        IEnumerable<HeroCard> CreateHeroCards(IList<Location> locations, bool alwaysShowNumericPrefix = false, IList<string> locationNames = null);

        KeyboardCard CreateKeyboardCard(string selectText, int optionCount = 0, params string[] additionalLabels);
    }
}
