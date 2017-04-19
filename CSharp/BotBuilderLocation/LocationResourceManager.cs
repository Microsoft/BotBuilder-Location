namespace Microsoft.Bot.Builder.Location
{
    using System;
    using System.Reflection;
    using System.Resources;
    using Resources;

    /// <summary>
    /// The location resource manager. Inherit from this class if you would like to override
    /// some or all the prompt strings.
    /// </summary>
    [Serializable]
    public class LocationResourceManager
    {
        private readonly ResourceManager resourceManager;

        /// <summary>
        /// The <see cref="AddressSeparator"/> resource string.
        /// </summary>
        public virtual string AddressSeparator => this.GetResource(nameof(Strings.AddressSeparator));

        /// <summary>
        /// The <see cref="AddToFavoritesAsk"/> resource string.
        /// </summary>
        public virtual string AddToFavoritesAsk => this.GetResource(nameof(Strings.AddToFavoritesAsk));

        /// <summary>
        /// The <see cref="AddToFavoritesRetry"/> resource string.
        /// </summary>
        public virtual string AddToFavoritesRetry => this.GetResource(nameof(Strings.AddToFavoritesRetry));

        /// <summary>
        /// The <see cref="AskForEmptyAddressTemplate"/> resource string.
        /// </summary>
        public virtual string AskForEmptyAddressTemplate => this.GetResource(nameof(Strings.AskForEmptyAddressTemplate));

        /// <summary>
        /// The <see cref="AskForPrefix"/> resource string.
        /// </summary>
        public virtual string AskForPrefix => this.GetResource(nameof(Strings.AskForPrefix));

        /// <summary>
        /// The <see cref="AskForTemplate"/> resource string.
        /// </summary>
        public virtual string AskForTemplate => this.GetResource(nameof(Strings.AskForTemplate));

        /// <summary>
        /// The <see cref="CancelCommand"/> resource string.
        /// </summary>
        public virtual string CancelCommand => this.GetResource(nameof(Strings.CancelCommand));

        /// <summary>
        /// The <see cref="CancelPrompt"/> resource string.
        /// </summary>
        public virtual string CancelPrompt => this.GetResource(nameof(Strings.CancelPrompt));

        /// <summary>
        /// The <see cref="ConfirmationAsk"/> resource string.
        /// </summary>
        public virtual string ConfirmationAsk => this.GetResource(nameof(Strings.ConfirmationAsk));

        /// <summary>
        /// The <see cref="ConfirmationInvalidResponse"/> resource string.
        /// </summary>
        public virtual string ConfirmationInvalidResponse => this.GetResource(nameof(Strings.ConfirmationInvalidResponse));

        /// <summary>
        /// The <see cref="Country"/> resource string.
        /// </summary>
        public virtual string Country => this.GetResource(nameof(Strings.Country));

        /// <summary>
        /// The <see cref="DeleteCommand"/> resource string.
        /// </summary>
        public virtual string DeleteCommand => this.GetResource(nameof(Strings.DeleteCommand));

        /// <summary>
        /// The <see cref="DeleteFavoriteAbortion"/> resource string.
        /// </summary>
        public virtual string DeleteFavoriteAbortion => this.GetResource(nameof(Strings.DeleteFavoriteAbortion));

        /// <summary>
        /// The <see cref="DeleteFavoriteConfirmationAsk"/> resource string.
        /// </summary>
        public virtual string DeleteFavoriteConfirmationAsk => this.GetResource(nameof(Strings.DeleteFavoriteConfirmationAsk));

        /// <summary>
        /// The <see cref="DialogStartBranchAsk"/> resource string.
        /// </summary>
        public virtual string DialogStartBranchAsk => this.GetResource(nameof(Strings.DialogStartBranchAsk));

        /// <summary>
        /// The <see cref="DuplicateFavoriteNameResponse"/> resource string.
        /// </summary>
        public virtual string DuplicateFavoriteNameResponse => this.GetResource(nameof(Strings.DuplicateFavoriteNameResponse));

        /// <summary>
        /// The <see cref="EditCommand"/> resource string.
        /// </summary>
        public virtual string EditCommand => this.GetResource(nameof(Strings.EditCommand));

        /// <summary>
        /// The <see cref="EditFavoritePrompt"/> resource string.
        /// </summary>
        public virtual string EditFavoritePrompt => this.GetResource(nameof(Strings.EditFavoritePrompt));

        /// <summary>
        /// The <see cref="EnterNewFavoriteLocationName"/> resource string.
        /// </summary>
        public virtual string EnterNewFavoriteLocationName => this.GetResource(nameof(Strings.EnterNewFavoriteLocationName));

        /// <summary>
        /// The <see cref="FavoriteAddedConfirmation"/> resource string.
        /// </summary>
        public virtual string FavoriteAddedConfirmation => this.GetResource(nameof(Strings.FavoriteAddedConfirmation));

        /// <summary>
        /// The <see cref="FavoriteDeletedConfirmation"/> resource string.
        /// </summary>
        public virtual string FavoriteDeletedConfirmation => this.GetResource(nameof(Strings.FavoriteDeletedConfirmation));

        /// <summary>
        /// The <see cref="FavoriteEdittedConfirmation"/> resource string.
        /// </summary>
        public virtual string FavoriteEdittedConfirmation => this.GetResource(nameof(Strings.FavoriteEdittedConfirmation));

        /// <summary>
        /// The <see cref="FavoriteLocations"/> resource string.
        /// </summary>
        public virtual string FavoriteLocations => this.GetResource(nameof(Strings.FavoriteLocations));

        /// <summary>
        /// The <see cref="HelpCommand"/> resource string.
        /// </summary>
        public virtual string HelpCommand => this.GetResource(nameof(Strings.HelpCommand));

        /// <summary>
        /// The <see cref="HelpMessage"/> resource string.
        /// </summary>
        public virtual string HelpMessage => this.GetResource(nameof(Strings.HelpMessage));

        /// <summary>
        /// The <see cref="InvalidFavoriteLocationSelection"/> resource string.
        /// </summary>
        public virtual string InvalidFavoriteLocationSelection => this.GetResource(nameof(Strings.InvalidFavoriteLocationSelection));

        /// <summary>
        /// The <see cref="InvalidFavoriteNameResponse"/> resource string.
        /// </summary>
        public virtual string InvalidFavoriteNameResponse => this.GetResource(nameof(Strings.InvalidFavoriteNameResponse));


        /// <summary>
        /// The <see cref="InvalidLocationResponse"/> resource string.
        /// </summary>
        public virtual string InvalidLocationResponse => this.GetResource(nameof(Strings.InvalidLocationResponse));

        /// <summary>
        /// The <see cref="InvalidLocationResponseFacebook"/> resource string.
        /// </summary>
        public virtual string InvalidLocationResponseFacebook => this.GetResource(nameof(Strings.InvalidLocationResponseFacebook));

        /// <summary>
        /// The <see cref="InvalidStartBranchResponse"/> resource string.
        /// </summary>
        public virtual string InvalidStartBranchResponse => this.GetResource(nameof(Strings.InvalidStartBranchResponse));

        /// <summary>
        /// The <see cref="LocationNotFound"/> resource string.
        /// </summary>
        public virtual string LocationNotFound => this.GetResource(nameof(Strings.LocationNotFound));

        /// <summary>
        /// The <see cref="Locality"/> resource string.
        /// </summary>
        public virtual string Locality => this.GetResource(nameof(Strings.Locality));
        
        /// <summary>
        /// The <see cref="MultipleResultsFound"/> resource string.
        /// </summary>
        public virtual string MultipleResultsFound => this.GetResource(nameof(Strings.MultipleResultsFound));

        /// <summary>
        /// The <see cref="NoFavoriteLocationsFound"/> resource string.
        /// </summary>
        public virtual string NoFavoriteLocationsFound => this.GetResource(nameof(Strings.NoFavoriteLocationsFound));

        /// <summary>
        /// The <see cref="OtherComand"/> resource string.
        /// </summary>
        public virtual string OtherComand => this.GetResource(nameof(Strings.OtherComand));

        /// <summary>
        /// The <see cref="OtherLocation"/> resource string.
        /// </summary>
        public virtual string OtherLocation => this.GetResource(nameof(Strings.OtherLocation));

        /// <summary>
        /// The <see cref="PostalCode"/> resource string.
        /// </summary>
        public virtual string PostalCode => this.GetResource(nameof(Strings.PostalCode));

        /// <summary>
        /// The <see cref="Region"/> resource string.
        /// </summary>
        public virtual string Region => this.GetResource(nameof(Strings.Region));

        /// <summary>
        /// The <see cref="ResetCommand"/> resource string.
        /// </summary>
        public virtual string ResetCommand => this.GetResource(nameof(Strings.ResetCommand));

        /// <summary>
        /// The <see cref="ResetPrompt"/> resource string.
        /// </summary>
        public virtual string ResetPrompt => this.GetResource(nameof(Strings.ResetPrompt));

        /// <summary>
        /// The <see cref="SelectFavoriteLocationPrompt"/> resource string.
        /// </summary>
        public virtual string SelectFavoriteLocationPrompt => this.GetResource(nameof(Strings.SelectFavoriteLocationPrompt));

        /// <summary>
        /// The <see cref="SelectLocation"/> resource string.
        /// </summary>
        public virtual string SelectLocation => this.GetResource(nameof(Strings.SelectLocation));

        /// <summary>
        /// The <see cref="SingleResultFound"/> resource string.
        /// </summary>
        public virtual string SingleResultFound => this.GetResource(nameof(Strings.SingleResultFound));

        /// <summary>
        /// The <see cref="StreetAddress"/> resource string.
        /// </summary>
        public virtual string StreetAddress => this.GetResource(nameof(Strings.StreetAddress));

        /// <summary>
        /// The <see cref="TitleSuffix"/> resource string.
        /// </summary>
        public virtual string TitleSuffix => this.GetResource(nameof(Strings.TitleSuffix));

        /// <summary>
        /// The <see cref="TitleSuffixFacebook"/> resource string.
        /// </summary>
        public virtual string TitleSuffixFacebook => this.GetResource(nameof(Strings.TitleSuffixFacebook));

        /// <summary>
        /// Default constructor. Initializes strings using Microsoft.Bot.Builder.Location assembly resources.
        /// </summary>
        public LocationResourceManager() :
            this(null, null)
        {
        }

        internal LocationResourceManager(Assembly resourceAssembly = null, string resourceName = null)
        {
            if (resourceAssembly == null || resourceName == null)
            {
                resourceAssembly = typeof(LocationDialog).Assembly;
                resourceName = typeof(Strings).FullName;
            }

            this.resourceManager = new ResourceManager(resourceName, resourceAssembly);
        }

        private string GetResource(string name)
        {
            return this.resourceManager.GetString(name) ??
                   Strings.ResourceManager.GetString(name);
        }
    }
}
