namespace Microsoft.Bot.Builder.Location.Dialogs
{
    using System;
    using Bing;
    using Builder.Dialogs;

    internal static class LocationDialogFactory
    {
        internal static IDialog<LocationDialogResponse> CreateLocationRetrieverDialog(
            string apiKey,
            string channelId,
            string prompt,
            bool useNativeControl,
            LocationResourceManager resourceManager)
        {
            bool isFacebookChannel = StringComparer.OrdinalIgnoreCase.Equals(channelId, "facebook");

            if (useNativeControl && isFacebookChannel)
            {
                return new FacebookNativeLocationRetrieverDialog(prompt, resourceManager);
            }

            return new RichLocationRetrieverDialog(
                geoSpatialService: new BingGeoSpatialService(),
                apiKey: apiKey,
                prompt: prompt,
                supportsKeyboard: isFacebookChannel,
                resourceManager: resourceManager);
        }
    }
}
