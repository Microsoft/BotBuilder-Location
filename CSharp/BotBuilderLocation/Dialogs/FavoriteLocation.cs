namespace Microsoft.Bot.Builder.Location.Dialogs
{
    using System;
    using Bing;

    [Serializable]
    internal class FavoriteLocation
    {
        public string Name { get; set; }

        public Location Location { get; set; }
    }
}
