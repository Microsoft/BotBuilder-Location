namespace Microsoft.Bot.Builder.Location.Dialogs
{
    using System;
    using System.Threading.Tasks;
    using Bing;
    using Builder.Dialogs;
    using Internals.Fibers;

    [Serializable]
    internal class EditFavoriteLocationDialog : LocationDialogBase<LocationDialogResponse>
    {
        private readonly ILocationDialogFactory locationDialogFactory;
        private readonly IFavoritesManager favoritesManager;
        private readonly string favoriteName;
        private readonly Location favoriteLocation;

        internal EditFavoriteLocationDialog(
            ILocationDialogFactory locationDialogFactory,
            IFavoritesManager favoritesManager,
            string favoriteName,
            Location favoriteLocation,
            LocationResourceManager resourceManager)
            : base(resourceManager)
        {
            SetField.NotNull(out this.locationDialogFactory, nameof(locationDialogFactory), locationDialogFactory);
            SetField.NotNull(out this.favoritesManager, nameof(favoritesManager), favoritesManager);
            SetField.NotNull(out this.favoriteName, nameof(favoriteName), favoriteName);
            SetField.NotNull(out this.favoriteLocation, nameof(favoriteLocation), favoriteLocation);
        }

        public override async Task StartAsync(IDialogContext context)
        {
            await context.PostAsync(string.Format(this.ResourceManager.EditFavoritePrompt, this.favoriteName));
            var locationRetrieverDialog = this.locationDialogFactory.CreateDialog(BranchType.LocationRetriever, skipDialogPrompt: true);
            context.Call(locationRetrieverDialog, this.ResumeAfterChildDialogAsync);
        }

        internal override async Task ResumeAfterChildDialogInternalAsync(IDialogContext context, IAwaitable<LocationDialogResponse> result)
        {
            var newLocationValue = (await result).Location;
            this.favoritesManager.Update(
                context, 
                currentValue: new FavoriteLocation { Name = this.favoriteName, Location = this.favoriteLocation },
                newValue: new FavoriteLocation { Name = this.favoriteName, Location = newLocationValue});
            await context.PostAsync(string.Format(
                this.ResourceManager.FavoriteEdittedConfirmation,
                this.favoriteName,
                newLocationValue.GetFormattedAddress(this.ResourceManager.AddressSeparator)));
            context.Done(new LocationDialogResponse(newLocationValue));
        }
    }
}
