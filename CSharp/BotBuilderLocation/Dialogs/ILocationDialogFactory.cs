namespace Microsoft.Bot.Builder.Location.Dialogs
{
    using Bing;
    using Builder.Dialogs;

    /// <summary>
    /// Represents the interface that defines how location (sub)dialogs are created.
    /// </summary>
    internal interface ILocationDialogFactory
    {
        /// <summary>
        /// Given a branch parameter, creates the appropriate corresponding dialog that should run.
        /// </summary>
        /// <param name="branch">The location dialog branch.</param>
        /// <param name="location">The location to be passed to the new dialog, if applicable.</param>
        /// <param name="locationName">The location name to be passed to the new dialog, if applicable.</param>
        /// <param name="skipDialogPrompt">A flag to customize whether the new dialog should skip its initial dialog prompt to better fit the flow.</param>
        /// <returns>The dialog.</returns>
        IDialog<LocationDialogResponse> CreateDialog(BranchType branch, Location location = null, string locationName = null, bool skipDialogPrompt = false);
    }
}
