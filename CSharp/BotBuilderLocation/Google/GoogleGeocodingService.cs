using Microsoft.Bot.Builder.Location.Google.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace Microsoft.Bot.Builder.Location.Bing
{
    [Serializable]
    public sealed class GoogleGeocodingService : IGeoSpatialService
    {
        readonly static string GoogleMapsBaseUri = "https://maps.googleapis.com/maps/api";
        readonly static string GeoCodeApiUri = $"{GoogleMapsBaseUri}/geocode/json";
        private readonly string apiKey;

        public GoogleGeocodingService(string apiKey)
            => this.apiKey = apiKey;

        /// <summary>
        /// https://developers.google.com/maps/documentation/static-maps/intro
        /// </summary>
        /// <param name="location"></param>
        /// <param name="index"></param>
        /// <returns></returns>
        public string GetLocationMapImageUrl(Location location, int? index = null)
            => $"{GoogleMapsBaseUri}/staticmap?maptype=roadmap&markers={location.Point.Coordinates[0]},{location.Point.Coordinates[1]}&zoom=15&size=500x280&key={apiKey}";

        /// <summary>
        /// https://developers.google.com/maps/documentation/geocoding/intro
        /// </summary>
        /// <param name="latitude"></param>
        /// <param name="longitude"></param>
        /// <returns></returns>
        public Task<LocationSet> GetLocationsByPointAsync(double latitude, double longitude)
            => GetLocationsAsync($"{GeoCodeApiUri}?latlng={latitude},{longitude}&key={apiKey}");

        public Task<LocationSet> GetLocationsByQueryAsync(string address)
            => GetLocationsAsync($"{GeoCodeApiUri}?address={address}&key={apiKey}");

        private async Task<LocationSet> GetLocationsAsync(string url)
        {
            var locationSet = new LocationSet();

            using (var client = new HttpClient())
            {
                var response = await client.GetStringAsync(url);
                var apiResponse = JsonConvert.DeserializeObject<GeocodingResponse>(response);

                locationSet.EstimatedTotal = apiResponse.Results.Length;
                locationSet.Locations = new List<Location>();

                string getAddressPart(AddressComponent[] addressComponents, string key)
                 => addressComponents.FirstOrDefault(ac => ac.Types.Contains(key))?.ShortName;

                foreach (var location in apiResponse.Results)
                {
                    locationSet.Locations.Add(new Location
                    {
                        Name = location.FormattedAddress,
                        Point = new GeocodePoint
                        {
                            Coordinates = new List<double> {
                                location.Geometry.Location.Lat,
                                location.Geometry.Location.Lng
                            }
                        },
                        BoundaryBox = new List<double> {
                            location.Geometry.Bounds.Northeast.Lat,
                            location.Geometry.Bounds.Northeast.Lng,
                            location.Geometry.Bounds.Southwest.Lat,
                            location.Geometry.Bounds.Southwest.Lng
                        },
                        MatchCodes = location.Types.ToList(),
                        Address = new Address
                        {
                            FormattedAddress = location.FormattedAddress,
                            PostalCode = getAddressPart(location.AddressComponents, AddressType.postal_code),
                            CountryRegion = getAddressPart(location.AddressComponents, AddressType.country),
                            Locality = getAddressPart(location.AddressComponents, AddressType.locality),
                            AdminDistrict = getAddressPart(location.AddressComponents, AddressType.administrative_area_level_1),
                            AdminDistrict2 = getAddressPart(location.AddressComponents, AddressType.administrative_area_level_2),
                            AddressLine = $"{getAddressPart(location.AddressComponents, AddressType.street_number)} {getAddressPart(location.AddressComponents, AddressType.route)}".Trim()
                        }
                    });
                }

                return locationSet;
            }
        }
    }
}
