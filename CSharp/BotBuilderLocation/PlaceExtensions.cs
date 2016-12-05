namespace Microsoft.Bot.Builder.Location
{
    using Connector;

    /// <summary>
    /// Extensions for <see cref="Place"/>
    /// </summary>
    public static class PlaceExtensions
    {
        /// <summary>
        /// Gets the postal address.
        /// </summary>
        /// <param name="place">The place.</param>
        /// <returns>The <see cref="PostalAddress"/> if available, null otherwise.</returns>
        public static PostalAddress GetPostalAddress(this Place place)
        {
            if (place.Address != null)
            {
                return (PostalAddress) place.Address;
            }

            return null;
        }

        /// <summary>
        /// Gets the geo coordinates.
        /// </summary>
        /// <param name="place">The place.</param>
        /// <returns>The <see cref="GeoCoordinates"/> if available, null otherwise.</returns>
        public static GeoCoordinates GetGeoCoordinates(this Place place)
        {
            if (place.Geo != null)
            {
                return (GeoCoordinates)place.Geo;
            }

            return null;
        }
    }
}
