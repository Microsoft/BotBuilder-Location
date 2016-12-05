using Microsoft.Bot.Builder.Internals.Fibers;

namespace Microsoft.Bot.Builder.Location
{
    using System;
    using System.Linq;
    using System.Threading.Tasks;
    using Bing;
    using Builder.Dialogs;
    using Connector;
    using Dialogs;

    /// <summary>
    /// Represents a dialog that handles retrieving a location from the user.
    /// <para>
    /// This dialog provides a location picker conversational UI (CUI) control,
    /// powered by Bing's Geo-spatial API and Places Graph, to make the process 
    /// of getting the user's location easy and consistent across all messaging 
    /// channels supported by bot framework.
    /// </para>
    /// </summary>
    /// <example>
    /// The following examples demonstrate how to use <see cref="LocationDialog"/> to achieve different scenarios:
    /// <list type="bullet">
    /// <item>
    /// <description>
    /// Calling <see cref="LocationDialog"/> with default parameters
    /// <code>
    /// var apiKey = WebConfigurationManager.AppSettings["BingMapsApiKey"];
    /// var prompt = "Hi, where would you like me to ship to your widget?";
    /// var locationDialog = new LocationDialog(apiKey, message.ChannelId, prompt);
    /// context.Call(locationDialog, (dialogContext, result) => {...});
    /// </code>
    /// </description>
    /// </item>
    /// <item>
    /// <description>
    /// Using channel's native location widget if available (e.g. Facebook) 
    /// <code>
    /// var apiKey = WebConfigurationManager.AppSettings["BingMapsApiKey"];
    /// var prompt = "Hi, where would you like me to ship to your widget?";
    /// var locationDialog = new LocationDialog(apiKey, message.ChannelId, prompt, LocationOptions.UseNativeControl);
    /// context.Call(locationDialog, (dialogContext, result) => {...});
    /// </code>
    /// </description>
    /// </item>
    /// <item>
    /// <description>
    /// Using channel's native location widget if available (e.g. Facebook)
    /// and having Bing try to reverse geo-code the provided coordinates to
    ///  automatically fill-in address fields.
    /// For more info see <see cref="LocationOptions.ReverseGeocode"/>
    /// <code>
    /// var apiKey = WebConfigurationManager.AppSettings["BingMapsApiKey"];
    /// var prompt = "Hi, where would you like me to ship to your widget?";
    /// var locationDialog = new LocationDialog(apiKey, message.ChannelId, prompt, LocationOptions.UseNativeControl | LocationOptions.ReverseGeocode);
    /// context.Call(locationDialog, (dialogContext, result) => {...});
    /// </code>
    /// </description>
    /// </item>
    /// <item>
    /// <description>
    /// Specifying required fields to have the dialog prompt the user for if missing from address. 
    /// For more info see <see cref="LocationRequiredFields"/>
    /// <code>
    /// var apiKey = WebConfigurationManager.AppSettings["BingMapsApiKey"];
    /// var prompt = "Hi, where would you like me to ship to your widget?";
    /// var locationDialog = new LocationDialog(apiKey, message.ChannelId, prompt, LocationOptions.None, LocationRequiredFields.StreetAddress | LocationRequiredFields.PostalCode);
    /// context.Call(locationDialog, (dialogContext, result) => {...});
    /// </code>
    /// </description>
    /// </item>
    /// <item>
    /// <description>
    /// Example on how to handle the returned place
    /// <code>
    /// var apiKey = WebConfigurationManager.AppSettings["BingMapsApiKey"];
    /// var prompt = "Hi, where would you like me to ship to your widget?";
    /// var locationDialog = new LocationDialog(apiKey, message.ChannelId, prompt, LocationOptions.None, LocationRequiredFields.StreetAddress | LocationRequiredFields.PostalCode);
    /// context.Call(locationDialog, (context, result) => {
    ///     Place place = await result;
    ///     if (place != null)
    ///     {
    ///         var address = place.GetPostalAddress();
    ///         string name = address != null ?
    ///             $"{address.StreetAddress}, {address.Locality}, {address.Region}, {address.Country} ({address.PostalCode})" :
    ///             "the pinned location";
    ///         await context.PostAsync($"OK, I will ship it to {name}");
    ///     }
    ///     else
    ///     {
    ///         await context.PostAsync("OK, I won't be shipping it");
    ///     }
    /// }
    /// </code>
    /// </description>
    /// </item>
    /// </list>
    /// </example>
    [Serializable]
    public sealed class LocationDialog : LocationDialogBase<Place>
    {
        private readonly string prompt;
        private readonly string channelId;
        private readonly LocationOptions options;
        private readonly LocationRequiredFields requiredFields;
        private readonly IGeoSpatialService geoSpatialService;
        private readonly string apiKey;
        private bool requiredDialogCalled;

        /// <summary>
        /// Determines whether this is the root dialog or not.
        /// </summary>
        /// <remarks>
        /// This is used to determine how the dialog should handle special commands
        /// such as reset.
        /// </remarks>
        protected override bool IsRootDialog => true;

        /// <summary>
        /// Initializes a new instance of the <see cref="LocationDialog"/> class.
        /// </summary>
        /// <param name="apiKey">The geo spatial API key.</param>
        /// <param name="channelId">The channel identifier.</param>
        /// <param name="prompt">The prompt posted to the user when dialog starts.</param>
        /// <param name="options">The location options used to customize the experience.</param>
        /// <param name="requiredFields">The location required fields.</param>
        /// <param name="resourceManager">The location resource manager.</param>
        public LocationDialog(
            string apiKey,
            string channelId,
            string prompt,
            LocationOptions options = LocationOptions.None,
            LocationRequiredFields requiredFields = LocationRequiredFields.None,
            LocationResourceManager resourceManager = null)
            : this(apiKey, channelId, prompt, new BingGeoSpatialService(), options, requiredFields, resourceManager)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="LocationDialog"/> class.
        /// </summary>
        /// <param name="apiKey">The geo spatial API key.</param>
        /// <param name="channelId">The channel identifier.</param>
        /// <param name="prompt">The prompt posted to the user when dialog starts.</param>
        /// <param name="geoSpatialService">The geo spatial location service.</param>
        /// <param name="options">The location options used to customize the experience.</param>
        /// <param name="requiredFields">The location required fields.</param>
        /// <param name="resourceManager">The location resource manager.</param>
        internal LocationDialog(
            string apiKey,
            string channelId,
            string prompt,
            IGeoSpatialService geoSpatialService,
            LocationOptions options = LocationOptions.None,
            LocationRequiredFields requiredFields = LocationRequiredFields.None,
            LocationResourceManager resourceManager = null) : base(resourceManager)
        {
            SetField.NotNull(out this.apiKey, nameof(apiKey), apiKey);
            SetField.NotNull(out this.prompt, nameof(prompt), prompt);
            SetField.NotNull(out this.channelId, nameof(channelId), channelId);
            SetField.NotNull(out this.geoSpatialService, nameof(geoSpatialService), geoSpatialService);
            this.options = options;
            this.requiredFields = requiredFields;
        }

#pragma warning disable CS1998 // Async method lacks 'await' operators and will run synchronously
        /// <summary>
        /// Starts the dialog.
        /// </summary>
        /// <param name="context">The context.</param>
        /// <returns>The asynchronous task</returns>
        public override async Task StartAsync(IDialogContext context)
#pragma warning restore CS1998 // Async method lacks 'await' operators and will run synchronously
        {
            this.requiredDialogCalled = false;

            var dialog = LocationDialogFactory.CreateLocationRetrieverDialog(
                this.apiKey,
                this.channelId,
                this.prompt,
                this.options.HasFlag(LocationOptions.UseNativeControl),
                this.ResourceManager);

            context.Call(dialog, this.ResumeAfterChildDialogAsync);
        }

        /// <summary>
        /// Resumes after native location dialog returns.
        /// </summary>
        /// <param name="context">The context.</param>
        /// <param name="result">The result.</param>
        /// <returns>The asynchronous task.</returns>
        internal override async Task ResumeAfterChildDialogInternalAsync(IDialogContext context, IAwaitable<LocationDialogResponse> result)
        {
            var response = await result;

            await this.TryReverseGeocodeAddress(response.Location);

            if (!this.requiredDialogCalled && this.requiredFields != LocationRequiredFields.None)
            {
                this.requiredDialogCalled = true;
                var requiredDialog = new LocationRequiredFieldsDialog(response.Location, this.requiredFields, this.ResourceManager);
                context.Call(requiredDialog, this.ResumeAfterChildDialogAsync);
            }
            else
            {
                context.Done(CreatePlace(response.Location));
            }
        }

        /// <summary>
        /// Tries to complete missing fields using Bing reverse geo-coder.
        /// </summary>
        /// <param name="location">The location.</param>
        /// <returns>The asynchronous task.</returns>
        private async Task TryReverseGeocodeAddress(Location location)
        {
            // If user passed ReverseGeocode flag and dialog returned a geo point,
            // then try to reverse geocode it using BingGeoSpatialService.
            if (this.options.HasFlag(LocationOptions.ReverseGeocode) && location != null && location.Address == null && location.Point != null)
            {
                var results = await this.geoSpatialService.GetLocationsByPointAsync(this.apiKey, location.Point.Coordinates[0], location.Point.Coordinates[1]);
                var geocodedLocation = results?.Locations?.FirstOrDefault();
                if (geocodedLocation?.Address != null)
                {
                    // We don't trust reverse geo-coder on the street address level,
                    // so copy all fields except it.
                    // TODO: do we need to check the returned confidence level?
                    location.Address = new Bing.Address
                    {
                        CountryRegion = geocodedLocation.Address.CountryRegion,
                        AdminDistrict = geocodedLocation.Address.AdminDistrict,
                        AdminDistrict2 = geocodedLocation.Address.AdminDistrict2,
                        Locality = geocodedLocation.Address.Locality,
                        PostalCode = geocodedLocation.Address.PostalCode
                    };
                }
            }
        }

        /// <summary>
        /// Creates the place object from location object.
        /// </summary>
        /// <param name="location">The location.</param>
        /// <returns>The created place object.</returns>
        private static Place CreatePlace(Location location)
        {
            var place = new Place
            {
                Type = location.EntityType,
                Name = location.Name
            };

            if (location.Address != null)
            {
                place.Address = new PostalAddress
                {
                    FormattedAddress = location.Address.FormattedAddress,
                    Country = location.Address.CountryRegion,
                    Locality = location.Address.Locality,
                    PostalCode = location.Address.PostalCode,
                    Region = location.Address.AdminDistrict,
                    StreetAddress = location.Address.AddressLine
                };
            }

            if (location.Point != null && location.Point.HasCoordinates)
            {
                place.Geo = new GeoCoordinates
                {
                    Latitude = location.Point.Coordinates[0],
                    Longitude = location.Point.Coordinates[1]
                };
            }

            return place;
        }
    }
}