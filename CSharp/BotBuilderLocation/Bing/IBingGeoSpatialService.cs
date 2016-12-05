namespace Microsoft.Bot.Builder.Location.Bing
{
    using System.Threading.Tasks;

    /// <summary>
    /// Represents the interface the defines how the <see cref="LocationDialog"/> will query for locations.
    /// </summary>
    public interface IGeoSpatialService
    {
        /// <summary>
        /// Gets the locations asynchronously.
        /// </summary>
        /// <param name="apiKey">The geo spatial service API key.</param>
        /// <param name="address">The address query.</param>
        /// <returns>The found locations</returns>
        Task<LocationSet> GetLocationsByQueryAsync(string apiKey, string address);

        /// <summary>
        /// Gets the locations asynchronously.
        /// </summary>
        /// <param name="apiKey">The geo spatial service API key.</param>
        /// <param name="latitude">The point latitude.</param>
        /// <param name="longitude">The point longitude.</param>
        /// <returns>The found locations</returns>
        Task<LocationSet> GetLocationsByPointAsync(string apiKey, double latitude, double longitude);

        /// <summary>
        /// Gets the map image URL.
        /// </summary>
        /// <param name="apiKey">The geo spatial service API key.</param>
        /// <param name="location">The location.</param>
        /// <param name="index">The pin point index.</param>
        /// <returns></returns>
        string GetLocationMapImageUrl(string apiKey, Location location, int? index = null);
    }
}
