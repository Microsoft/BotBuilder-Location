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
        private string lastInput;

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
            this.lastInput = (await result).Text;
            this.location.Address.GetType().GetProperty(this.currentFieldName).SetValue(this.location.Address, this.lastInput);
            await this.CompleteMissingFields(context);
        }

        private async Task CompleteMissingFields(IDialogContext context)
        {
            bool notComplete =
                await this.CompleteFieldIfMissing(context, this.ResourceManager.StreetAddress, LocationRequiredFields.StreetAddress, "AddressLine", this.location.Address.AddressLine)
                || await this.CompleteFieldIfMissing(context, this.ResourceManager.Locality, LocationRequiredFields.Locality, "Locality", this.location.Address.Locality)
                || await this.CompleteFieldIfMissing(context, this.ResourceManager.Region, LocationRequiredFields.Region, "AdminDistrict", this.location.Address.AdminDistrict)
                || await this.CompleteFieldIfMissing(context, this.ResourceManager.PostalCode, LocationRequiredFields.PostalCode, "PostalCode", this.location.Address.PostalCode)
                || await this.CompleteFieldIfMissing(context, this.ResourceManager.Country, LocationRequiredFields.Country, "CountryRegion", this.location.Address.CountryRegion);

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

            string message;

            if (this.lastInput == null)
            {
                string formattedAddress = this.location.GetFormattedAddress(this.ResourceManager.AddressSeparator);
                if (string.IsNullOrWhiteSpace(formattedAddress))
                {
                    message = string.Format(this.ResourceManager.AskForEmptyAddressTemplate, prompt);
                }
                else
                {
                    message = string.Format(this.ResourceManager.AskForPrefix, formattedAddress) +
                        string.Format(this.ResourceManager.AskForTemplate, prompt);
                }
            }
            else
            {
                message = string.Format(this.ResourceManager.AskForPrefix, this.lastInput) +
                    string.Format(this.ResourceManager.AskForTemplate, prompt);
            }

            this.currentFieldName = name;
            await context.PostAsync(message);
            context.Wait(this.MessageReceivedAsync);

            return true;
        }
    }
}
