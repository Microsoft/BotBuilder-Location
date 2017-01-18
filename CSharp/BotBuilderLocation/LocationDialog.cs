namespace Microsoft.Bot.Builder.Location
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using Bing;
    using Builder.Dialogs;
    using Connector;
    using Dialogs;
    using Internals.Fibers;

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
        private readonly string apiKey;
        private readonly LocationDialogFactory locationDialogFactory;
        private Location selectedLocation;
        private string currentBranch;
        private string[] branches;

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
            LocationResourceManager resourceManager = null) : base(resourceManager)
        {
            SetField.NotNull(out this.apiKey, nameof(apiKey), apiKey);
            SetField.NotNull(out this.prompt, nameof(prompt), prompt);
            SetField.NotNull(out this.channelId, nameof(channelId), channelId);
            this.options = options;
            this.requiredFields = requiredFields;

            this.branches = new string[] { this.ResourceManager.FavoriteLocation, this.ResourceManager.OtherLocation };
            this.locationDialogFactory = new LocationDialogFactory(
                this.apiKey,
                this.channelId,
                this.prompt,
                this.options,
                this.requiredFields,
                this.ResourceManager);
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
            // this is the default branch
            this.currentBranch = this.ResourceManager.OtherLocation;

            // examine settings to determine if another branch is to be taken
            if (this.options.HasFlag(LocationOptions.OptOutOfFavorites))
            {
                this.StartCurrentBranch(context);
            }
            else
            {
                await context.PostAsync(this.CreateDialogStartHeroCard(context));
                context.Wait(this.MessageReceivedAsync);
            }
        }

        private void StartCurrentBranch(IDialogContext context)
        {
            var dialog = this.locationDialogFactory.CreateLocationRetrieverDialog(this.currentBranch);
            context.Call(dialog, this.ResumeAfterChildDialogAsync);
        }

        protected override async Task MessageReceivedInternalAsync(IDialogContext context, IAwaitable<IMessageActivity> result)
        {
            var messageText = (await result).Text.Trim();

           if (this.branches.Contains(messageText))
            {
                this.currentBranch = messageText;
                this.StartCurrentBranch(context);
            }
            else
            {
                await context.PostAsync(this.ResourceManager.InvalidStartBranchResponse);
                context.Wait(this.MessageReceivedAsync);
            }
        }

        /// <summary>
        /// Resumes after native location dialog returns.
        /// </summary>
        /// <param name="context">The context.</param>
        /// <param name="result">The result.</param>
        /// <returns>The asynchronous task.</returns>
        internal override async Task ResumeAfterChildDialogInternalAsync(IDialogContext context, IAwaitable<LocationDialogResponse> result)
        {
            this.selectedLocation = (await result).Location;
            this.MakeFinalConfirmation(context);
        }
        
        private IMessageActivity CreateDialogStartHeroCard(IDialogContext context)
        {
            // TODO: This should be the default template maps screenshot or the user's current location if possible
            //var image = new CardImage(url: "");
            var dialogStartCard = context.MakeMessage();
            var buttons = new List<CardAction>();

            foreach (var possibleBranch in this.branches)
            {
                buttons.Add(new CardAction
                {
                    Type = "imBack",
                    Title = possibleBranch,
                    Value = possibleBranch
                });
            }

            var heroCard = new HeroCard
            {
                Subtitle = this.ResourceManager.DialogStartBranchAsk,
                //Images = new[] { image },
                Buttons = buttons
            };

            dialogStartCard.Attachments = new List<Attachment> { heroCard.ToAttachment() };
            dialogStartCard.AttachmentLayout = AttachmentLayoutTypes.Carousel;

            return dialogStartCard;
        }

        private void MakeFinalConfirmation(IDialogContext context)
        {
            var confirmationAsk = string.Format(
                       this.ResourceManager.ConfirmationAsk,
                       selectedLocation.GetFormattedAddress(this.ResourceManager.AddressSeparator));

            PromptDialog.Confirm(
                    context,
                    async (dialogContext, answer) =>
                    {
                        if (await answer)
                        {
                            dialogContext.Done(CreatePlace(selectedLocation));
                        }
                        else
                        {
                            await dialogContext.PostAsync(this.ResourceManager.ResetPrompt);
                            await this.StartAsync(dialogContext);
                        }
                    },
                    confirmationAsk,
                    retry: this.ResourceManager.ConfirmationInvalidResponse,
                    promptStyle: PromptStyle.None);
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