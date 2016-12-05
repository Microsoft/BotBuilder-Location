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
        /// The <see cref="AskForCountry"/> resource string.
        /// </summary>
        public virtual string AskForCountry => this.GetResource(nameof(Strings.AskForCountry));

        /// <summary>
        /// The <see cref="AskForLocality"/> resource string.
        /// </summary>
        public virtual string AskForLocality => this.GetResource(nameof(Strings.AskForLocality));

        /// <summary>
        /// The <see cref="AskForPostalCode"/> resource string.
        /// </summary>
        public virtual string AskForPostalCode => this.GetResource(nameof(Strings.AskForPostalCode));

        /// <summary>
        /// The <see cref="AskForRegion"/> resource string.
        /// </summary>
        public virtual string AskForRegion => this.GetResource(nameof(Strings.AskForRegion));

        /// <summary>
        /// The <see cref="AskForStreetAddress"/> resource string.
        /// </summary>
        public virtual string AskForStreetAddress => this.GetResource(nameof(Strings.AskForStreetAddress));

        /// <summary>
        /// The <see cref="Cancel"/> resource string.
        /// </summary>
        public virtual string Cancel => this.GetResource(nameof(Strings.Cancel));

        /// <summary>
        /// The <see cref="Help"/> resource string.
        /// </summary>
        public virtual string Help => this.GetResource(nameof(Strings.Help));

        /// <summary>
        /// The <see cref="HelpMessage"/> resource string.
        /// </summary>
        public virtual string HelpMessage => this.GetResource(nameof(Strings.HelpMessage));

        /// <summary>
        /// The <see cref="InvalidLocationResponse"/> resource string.
        /// </summary>
        public virtual string InvalidLocationResponse => this.GetResource(nameof(Strings.InvalidLocationResponse));

        /// <summary>
        /// The <see cref="LocationNotFound"/> resource string.
        /// </summary>
        public virtual string LocationNotFound => this.GetResource(nameof(Strings.LocationNotFound));

        /// <summary>
        /// The <see cref="MultipleResultsFound"/> resource string.
        /// </summary>
        public virtual string MultipleResultsFound => this.GetResource(nameof(Strings.MultipleResultsFound));

        /// <summary>
        /// The <see cref="Reset"/> resource string.
        /// </summary>
        public virtual string Reset => this.GetResource(nameof(Strings.Reset));

        /// <summary>
        /// The <see cref="SelectLocation"/> resource string.
        /// </summary>
        public virtual string SelectLocation => this.GetResource(nameof(Strings.SelectLocation));

        /// <summary>
        /// The <see cref="SingleResultFound"/> resource string.
        /// </summary>
        public virtual string SingleResultFound => this.GetResource(nameof(Strings.SingleResultFound));

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
