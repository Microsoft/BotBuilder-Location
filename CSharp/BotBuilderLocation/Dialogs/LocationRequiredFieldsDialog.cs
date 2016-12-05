namespace Microsoft.Bot.Builder.Location.Dialogs
{
    using System;
    using System.Threading.Tasks;
    using Builder.Dialogs;
    using Connector;
    using Internals.Fibers;
    
    /// <summary>
    /// Represents a dialog that prompts the user for any missing location fields.
    /// </summary>
    [Serializable]
    internal class LocationRequiredFieldsDialog : LocationDialogBase<LocationDialogResponse>
    {
        private readonly Bing.Location location;
        private readonly LocationRequiredFields requiredFields;
        private string currentFieldName;

        public LocationRequiredFieldsDialog(Bing.Location location, LocationRequiredFields requiredFields, LocationResourceManager resourceManager)
            : base(resourceManager)
        {
            SetField.NotNull(out this.location, nameof(location), location);
            this.requiredFields = requiredFields;
            this.location.Address = this.location.Address ?? new Bing.Address();
        }

        public override async Task StartAsync(IDialogContext context)
        {
            await this.CompleteMissingFields(context);
        }

        protected override async Task MessageReceivedInternalAsync(IDialogContext context, IAwaitable<IMessageActivity> result)
        {
            this.location.Address.GetType().GetProperty(this.currentFieldName).SetValue(this.location.Address, (await result).Text);
            await this.CompleteMissingFields(context);
        }

        private async Task CompleteMissingFields(IDialogContext context)
        {
            bool notComplete =
                await this.CompleteFieldIfMissing(context, this.ResourceManager.AskForStreetAddress, LocationRequiredFields.StreetAddress, "AddressLine", this.location.Address.AddressLine)
                || await this.CompleteFieldIfMissing(context, this.ResourceManager.AskForLocality, LocationRequiredFields.Locality, "Locality", this.location.Address.Locality)
                || await this.CompleteFieldIfMissing(context, this.ResourceManager.AskForRegion, LocationRequiredFields.Region, "AdminDistrict", this.location.Address.AdminDistrict)
                || await this.CompleteFieldIfMissing(context, this.ResourceManager.AskForCountry, LocationRequiredFields.Country, "CountryRegion", this.location.Address.CountryRegion)
                || await this.CompleteFieldIfMissing(context, this.ResourceManager.AskForPostalCode, LocationRequiredFields.PostalCode, "PostalCode", this.location.Address.PostalCode);

            if (!notComplete)
            {
                var result = new LocationDialogResponse(this.location);
                context.Done(result);
            }
        }

        private async Task<bool> CompleteFieldIfMissing(IDialogContext context, string prompt, LocationRequiredFields field, string name, string value)
        {
            if (!this.requiredFields.HasFlag(field) || !string.IsNullOrEmpty(value))
            {
                return false;
            }

            this.currentFieldName = name;
            await context.PostAsync(prompt);
            context.Wait(this.MessageReceivedAsync);

            return true;
        }
    }
}
