namespace Microsoft.Bot.Builder.Location
{
    using System.Collections.Generic;
    using Bing;
    using Builder.Dialogs.Internals;
    using Dialogs;

    /// <summary>
    /// Represents the interface that defines how the <see cref="LocationDialog"/> will
    /// store and retrieve favorite locations for its users.
    /// </summary>
    interface IFavoritesManager
    {
        /// <summary>
        /// Gets whether the max allowed favorite location count has been reached.
        /// </summary>
        /// <param name="botData">The bot data.</param>
        /// <returns>True if the maximum capacity has been reached, false otherwise.</returns>
        bool MaxCapacityReached(IBotData botData);

        /// <summary>
        /// Checks whether the given location is one of the favorite locations of the
        /// user inferred from the bot data.
        /// </summary>
        /// <param name="botData">The bot data.</param>
        /// <param name="location"></param>
        /// <returns></returns>
        bool IsFavorite(IBotData botData, Location location);

        /// <summary>
        /// Checks whether the given string is the name of one of the favorite locations of
        /// the user inferred from the bot data.
        /// </summary>
        /// <param name="botData">The bot data.</param>
        /// <param name="name">The location name.</param>
        /// <returns></returns>
        bool IsFavoriteLocationName(IBotData botData, string name);

        /// <summary>
        /// Looks up the favorite location at the given zero-based index value for
        /// the user inferred from the bot data.
        /// </summary>
        /// <param name="botData">The bot data.</param>
        /// <param name="index">The index.</param>
        /// <returns>>A favorite location or null if no favorite location can be found.</returns>
        FavoriteLocation GetFavoriteByIndex(IBotData botData, int index);

        /// <summary>
        /// Looks up the favorite location with the given name value for
        /// the user inferred from the bot data.
        /// </summary>
        /// <param name="botData">The bot data.</param>
        /// <param name="name">The name.</param>
        /// <returns>>A favorite location or null if no favorite location can be found.</returns>
        FavoriteLocation GetFavoriteByName(IBotData botData, string name);

        /// <summary>
        /// Looks up the favorite locations value for the user inferred from the
        /// bot data.
        /// </summary>
        /// <param name="botData">The bot data.</param>
        /// <returns>>A list of favorite locations.</returns>
        IList<FavoriteLocation> GetFavorites(IBotData botData);

        /// <summary>
        /// Adds the given location to the favorites of the user inferred from the
        /// bot data.
        /// </summary>
        /// <param name="botData">The bot data.</param>
        /// <param name="value">The new favorite location value.</param>
        void Add(IBotData botData, FavoriteLocation value);

        /// <summary>
        /// Deletes the given location from the favorites of the user inferred from the
        /// bot data.
        /// </summary>
        /// <param name="botData">The bot data.</param>
        /// <param name="value">The favorite location value to be deleted.</param>
        void Delete(IBotData botData, FavoriteLocation value);

        /// <summary>
        /// Updates the favorites of the user inferred from the bot data.
        /// The favorite location whose value matched the given current value is updated
        /// to the given new value.
        /// </summary>
        /// <param name="botData">The bot data.</param>
        /// <param name="currentValue">The updated favorite location value.</param>
        /// <param name="newValue">The updated favorite location value.</param>
        void Update(IBotData botData, FavoriteLocation currentValue, FavoriteLocation newValue);
    }
}
