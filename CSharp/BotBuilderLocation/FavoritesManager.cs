namespace Microsoft.Bot.Builder.Location
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using Bing;
    using Builder.Dialogs.Internals;
    using Dialogs;

    [Serializable]
    internal class FavoritesManager : IFavoritesManager
    {
        private const string FavoritesKey = "favorites";
        private const int MaxFavoriteCount = 5;

        public bool MaxCapacityReached(IBotData botData)
        {
            return this.GetFavorites(botData).Count >= MaxFavoriteCount;
        }

        public bool IsFavorite(IBotData botData, Location location)
        {
            var favorites = this.GetFavorites(botData);
            return favorites.Any(favoriteLocation => AreEqual(location, favoriteLocation.Location));
        }

        public bool IsFavoriteLocationName(IBotData botData, string name)
        {
            var favorites = this.GetFavorites(botData);
            return favorites.Any(favoriteLocation => StringComparer.OrdinalIgnoreCase.Equals(name, favoriteLocation.Name));
        }

        public FavoriteLocation GetFavoriteByIndex(IBotData botData, int index)
        {
            var favorites = this.GetFavorites(botData);

            if (index >= 0 && index <  favorites.Count)
            {
                return favorites[index];
            }

            return null;
        }

        public FavoriteLocation GetFavoriteByName(IBotData botData, string name)
        {
            var favorites = this.GetFavorites(botData);
            return favorites.Where(favoriteLocation => StringComparer.OrdinalIgnoreCase.Equals(name, favoriteLocation.Name)).FirstOrDefault();
        }

        public void Add(IBotData botData, FavoriteLocation value)
        {
            var favorites = this.GetFavorites(botData);

            if (favorites.Count >= MaxFavoriteCount)
            {
                throw new InvalidOperationException("The max allowed number of favorite locations has already been reached.");
            }

            favorites.Add(value);
            botData.UserData.SetValue(FavoritesKey, favorites);
        }

        public void Delete(IBotData botData, FavoriteLocation value)
        {
            var favorites = this.GetFavorites(botData);
            var newFavorites = new List<FavoriteLocation>();
            
            foreach (var favoriteItem in favorites)
            {
                if (!AreEqual(favoriteItem.Location, value.Location))
                {
                    newFavorites.Add(favoriteItem);
                }
            }

            botData.UserData.SetValue(FavoritesKey, newFavorites);
        }

        public void Update(IBotData botData, FavoriteLocation currentValue, FavoriteLocation newValue)
        {
            var favorites = this.GetFavorites(botData);
            var newFavorites = new List<FavoriteLocation>();

            foreach (var item in favorites)
            {
                if (AreEqual(item.Location, currentValue.Location))
                {
                    newFavorites.Add(newValue);
                }
                else
                {
                    newFavorites.Add(item);
                }
            }

            botData.UserData.SetValue(FavoritesKey, newFavorites);
        }

        public IList<FavoriteLocation> GetFavorites(IBotData botData)
        {
            List<FavoriteLocation> favorites;

            if (!botData.UserData.TryGetValue(FavoritesKey, out favorites))
            {
                // User currently has no favorite locations. Return an empty list.
                favorites = new List<FavoriteLocation>();
            }

            return favorites;
        }

        private static bool AreEqual(Location x, Location y)
        {
            // Other attributes of a location such as its Confidence, BoundaryBox, etc
            // should not be considered as distinguishing factors.
            // On the other hand, attributes of a location that are shown to the users
            // are what distinguishes one location from another. 
            return x.GetFormattedAddress(",") == y.GetFormattedAddress(",");
        }
    }
}
