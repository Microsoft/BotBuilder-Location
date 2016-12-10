namespace Microsoft.Bot.Builder.Location
{
using System.Collections.Generic;
    using Connector;

    /// <summary>
    /// Extensions for <see cref="Place"/>
    /// </summary>
    public static class Extensions
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

        internal static string GetFormattedAddress(this Bing.Location location, string separator)
        {
            if (location?.Address == null)
            {
                return null;
            }

            var addressParts = new List<string>();

            if (!string.IsNullOrEmpty(location.Address.AddressLine))
            {
                addressParts.Add(location.Address.AddressLine);
            }

            if (!string.IsNullOrEmpty(location.Address.Locality))
            {
                addressParts.Add(location.Address.Locality);
            }

            if (!string.IsNullOrEmpty(location.Address.AdminDistrict))
            {
                addressParts.Add(location.Address.AdminDistrict);
            }

            if (!string.IsNullOrEmpty(location.Address.PostalCode))
            {
                addressParts.Add(location.Address.PostalCode);
            }

            if (!string.IsNullOrEmpty(location.Address.CountryRegion))
            {
                addressParts.Add(location.Address.CountryRegion);
            }

            return string.Join(separator, addressParts);
        }
    }
}
