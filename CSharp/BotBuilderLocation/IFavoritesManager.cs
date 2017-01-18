namespace Microsoft.Bot.Builder.Location
{
    using System.Collections.Generic;
    using Bing;
    using Builder.Dialogs;

    /// <summary>
    /// Represents the interface that defines how the <see cref="LocationDialog"/> will
    /// store and retrieve favorite locations for its users.
    /// </summary>
    interface IFavoritesManager
    {
        /// <summary>
        /// Looks up the favorite locations value for the user inferred from the
        /// given dialog context.
        /// </summary>
        /// <param name="context">The dialog context.</param>
        /// <returns>A list of favorite locations.</returns>
        List<Location> GetFavorites(IDialogContext context);

        /// <summary>
        /// Adds the given location to the favorites of the user inferred from the
        /// given dialog context.
        /// </summary>
        /// <param name="context">The dialog context.</param>
        /// <param name="value">The new favorite location value.</param>
        void AddToFavorites(IDialogContext context, Location value);
    }
}
