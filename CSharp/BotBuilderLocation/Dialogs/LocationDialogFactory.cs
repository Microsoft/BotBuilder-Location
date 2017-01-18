namespace Microsoft.Bot.Builder.Location.Dialogs
{
    using System;
    using Bing;
    using Builder.Dialogs;
    using Internals.Fibers;

    [Serializable]
    internal class LocationDialogFactory
    {
        private readonly string apiKey;
        private readonly string channelId;
        private readonly string prompt;
        private readonly LocationOptions options;
        private readonly LocationRequiredFields requiredFields;
        private readonly IGeoSpatialService geoSpatialService;
        private readonly LocationResourceManager resourceManager;

        internal LocationDialogFactory(
            string apiKey,
            string channelId,
            string prompt,
            LocationOptions options,
            LocationRequiredFields requiredFields,
            LocationResourceManager resourceManager)
        {
            SetField.NotNull(out this.apiKey, nameof(apiKey), apiKey);
            SetField.NotNull(out this.channelId, nameof(channelId), channelId);
            SetField.NotNull(out this.prompt, nameof(prompt), prompt);
            // TODO: make the geoSpatialService a constructor param once there is DI
            this.geoSpatialService = new BingGeoSpatialService();
            this.options = options;
            this.requiredFields = requiredFields;
            this.resourceManager = resourceManager;
        }

        internal IDialog<LocationDialogResponse> CreateLocationRetrieverDialog(string branch)
        {
            bool isFacebookChannel = StringComparer.OrdinalIgnoreCase.Equals(this.channelId, "facebook");

            if (StringComparer.OrdinalIgnoreCase.Equals(branch, this.resourceManager.OtherLocation))
            {
                if (this.options.HasFlag(LocationOptions.UseNativeControl) && isFacebookChannel)
                {
                    return new FacebookNativeLocationRetrieverDialog(
                        this.prompt,
                        this.apiKey,
                        this.geoSpatialService,
                        this.options,
                        this.requiredFields,
                        this.resourceManager);
                }

                return new RichLocationRetrieverDialog(
                    prompt: this.prompt,
                    supportsKeyboard: isFacebookChannel,
                    apiKey: this.apiKey,
                    geoSpatialService: new BingGeoSpatialService(),
                    options: this.options,
                    requiredFields: this.requiredFields,
                    resourceManager: this.resourceManager);
            }
            else if (StringComparer.OrdinalIgnoreCase.Equals(branch, this.resourceManager.FavoriteLocation))
            {
                return new FavoriteLocationsDialog(this.apiKey, supportsKeyboard: isFacebookChannel, resourceManager: this.resourceManager, locationDialogFactory: this);
            }
            else
            {
                throw new ArgumentException("Invalid branch value.");
            }
        }
    }
}
