using Newtonsoft.Json;

namespace Microsoft.Bot.Builder.Location.Google.Models
{
    public partial class GeocodingResponse
    {
        /// <summary>
        /// Gets or sets the results.
        /// </summary>
        /// <value>The results.</value>
        [JsonProperty("results")]
        public GeocodingResult[] Results { get; protected internal set; }

        /// <summary>
        /// Gets or sets the status.
        /// </summary>
        /// <value>The status.</value>
        [JsonProperty("status")]
        public GeocodingResponseStatus Status { get; protected internal set; }

        [JsonIgnore]
        public bool IsOk
            => Status == GeocodingResponseStatus.OK;
        [JsonIgnore]
        public bool IsInvalidRequest
            => Status == GeocodingResponseStatus.INVALID_REQUEST;
        [JsonIgnore]
        public bool IsOverQueryLimit
            => Status == GeocodingResponseStatus.OVER_QUERY_LIMIT;
        [JsonIgnore]
        public bool IsRequestDenied
            => Status == GeocodingResponseStatus.REQUEST_DENIED;
        [JsonIgnore]
        public bool IsZeroResults
            => Status == GeocodingResponseStatus.ZERO_RESULTS;

    }

    public partial class GeocodingResult
    {
        /// <summary>
        /// Gets or sets the address_components.
        /// </summary>
        /// <value>The address_components.</value>
        [JsonProperty("address_components")]
        public AddressComponent[] AddressComponents { get; set; }

        // <summary>
        /// Gets or sets the formatted_address.
        /// </summary>
        /// <value>The formatted_address.</value>
        [JsonProperty("formatted_address")]
        public string FormattedAddress { get; set; }

        /// <summary>
        /// Gets or sets the geometry.
        /// </summary>
        /// <value>The geometry.</value>
        [JsonProperty("geometry")]
        public Geometry Geometry { get; set; }

        [JsonProperty("place_id")]
        public string PlaceId { get; set; }

        /// <summary>
        /// Gets or sets the types.
        /// </summary>
        /// <value>The types.</value>
        [JsonProperty("types")]
        public string[] Types { get; set; }
    }

    public partial class AddressComponent
    {
        [JsonProperty("long_name")]
        public string LongName { get; set; }

        [JsonProperty("short_name")]
        public string ShortName { get; set; }

        [JsonProperty("types")]
        public string[] Types { get; set; }
    }

    public partial class Geometry
    {
        [JsonProperty("bounds")]
        public Bounds Bounds { get; set; }

        [JsonProperty("location")]
        public LatLng Location { get; set; }

        [JsonProperty("location_type")]
        public string LocationType { get; set; }

        [JsonProperty("viewport")]
        public Bounds Viewport { get; set; }
    }

    public partial class Bounds
    {
        [JsonProperty("northeast")]
        public LatLng Northeast { get; set; }

        [JsonProperty("southwest")]
        public LatLng Southwest { get; set; }
    }

    public partial class LatLng
    {
        [JsonProperty("lat")]
        public double Lat { get; set; }

        [JsonProperty("lng")]
        public double Lng { get; set; }
    }

    public static class AddressType
    {
        /// <summary>
        /// indicates a precise street address
        /// </summary>
        public const string street_address = "street_address";

        /// <summary>
        /// indicates a named route (such as "US 101"). 
        /// </summary>
        public const string route = "route";

        /// <summary>
        /// indicates a major intersection, usually of two major roads. 
        /// </summary>
        /// 
        public const string intersection = "intersection";

        /// <summary>
        /// indicates a political entity. Usually, this type indicates a polygon of some civil administration. 
        /// </summary>
        public const string political = "political";

        /// <summary>
        /// indicates the national political entity, and is typically the highest order type returned by the Geocoder.
        /// </summary>
        public const string country = "country";

        /// <summary>
        /// indicates a first-order civil entity below the country level. Within the United States, these administrative levels are states. Not all nations exhibit these administrative levels. 
        /// </summary>
        public const string administrative_area_level_1 = "administrative_area_level_1";

        /// <summary>
        /// indicates a second-order civil entity below the country level. Within the United States, these administrative levels are counties. Not all nations exhibit these administrative levels. 
        /// </summary>
        public const string administrative_area_level_2 = "administrative_area_level_2";

        /// <summary>
        /// indicates a third-order civil entity below the country level. This type indicates a minor civil division. Not all nations exhibit these administrative levels. 
        /// </summary>
        public const string administrative_area_level_3 = "administrative_area_level_3";

        /// <summary>
        /// indicates a commonly-used alternative name for the entity. 
        /// </summary>
        public const string colloquial_area = "colloquial_area";

        /// <summary>
        /// indicates an incorporated city or town political entity. 
        /// </summary>
        public const string locality = "locality";

        /// <summary>
        /// indicates an first-order civil entity below a locality 
        /// </summary>
        public const string sublocality = "sublocality";

        /// <summary>
        /// indicates a named neighborhood 
        /// </summary>
        public const string neighborhood = "neighborhood";

        /// <summary>
        /// indicates a named location, usually a building or collection of buildings with a common name 
        /// </summary>
        public const string premise = "premise";

        /// <summary>
        /// indicates a first-order entity below a named location, usually a singular building within a collection of buildings with a common name 
        /// </summary>
        public const string subpremise = "subpremise";

        /// <summary>
        /// indicates a postal code as used to address postal mail within the country. 
        /// </summary>
        public const string postal_code = "postal_code";

        /// <summary>
        /// indicates a prominent natural feature. 
        /// </summary>
        public const string natural_feature = "natural_feature";

        /// <summary>
        /// indicates an airport. 
        /// </summary>
        public const string airport = "airport";

        /// <summary>
        /// indicates a named park. 
        /// </summary>
        public const string park = "park";

        /// <summary>
        /// indicates a named point of interest. Typically, these "POI"s are prominent local entities that don't easily fit in another category such as "Empire State Building" or "Statue of Liberty." 
        /// </summary>
        public const string point_of_interest = "point_of_interest";

        /// <summary>
        /// indicates a specific postal box. 
        /// </summary>
        public const string post_box = "post_box";

        /// <summary>
        /// indicates the precise street number. 
        /// </summary>
        public const string street_number = "street_number";

        /// <summary>
        /// indicates the floor of a building address. 
        /// </summary>
        public const string floor = "floor";

        /// <summary>
        /// indicates the room of a building address. 
        /// </summary>
        public const string room = "room";

        public const string postal_code_prefix = "postal_code_prefix";

        public const string establishment = "establishment";

    }

    public enum GeocodingResponseStatus
    {
        None,
        OK,
        ZERO_RESULTS,
        OVER_QUERY_LIMIT,
        REQUEST_DENIED,
        INVALID_REQUEST
    }
}
