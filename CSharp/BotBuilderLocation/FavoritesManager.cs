namespace Microsoft.Bot.Builder.Location
{
    using System;
    using System.Collections.Generic;
    using Bing;
    using Builder.Dialogs;

    [Serializable]
    internal class FavoritesManager : ClientLocationListManagerBase, IFavoritesManager
    {
        protected override string key => "favorites";

        public void AddToFavorites(IDialogContext context, Location value)
        {
            this.AddToList(context, value);
        }

        public List<Location> GetFavorites(IDialogContext context)
        {
            return this.GetList(context);
        }
    }
}
