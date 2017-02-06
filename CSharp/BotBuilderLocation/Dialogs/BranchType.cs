namespace Microsoft.Bot.Builder.Location.Dialogs
{
    /// <summary>
    /// Represents different branch (sub dialog) types that <see cref="LocationDialog"/> can use to achieve its goal.
    /// </summary>
    public enum BranchType
    {
        /// <summary>
        /// The branch dialog type for retrieving a location. 
        /// </summary>
        LocationRetriever,

        /// <summary>
        /// The branch dialog type for retrieving a location from a user's favorites.
        /// </summary>
        FavoriteLocationRetriever,

        /// <summary>
        /// The branch dialog type for saving a location to a user's favorites.
        /// </summary>
        AddToFavorites,

        /// <summary>
        /// The branch dialog type for editing and retrieving one of the user's existing favorites.
        /// </summary>
        EditFavoriteLocation
    }
}
