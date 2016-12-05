namespace Microsoft.Bot.Builder.Location.Dialogs
{
    /// <summary>
    /// Represents a response that gets sent by a child location dialog to a parent one.
    /// </summary>
    /// <remarks>
    /// The response can be either a location returned in <see cref="Location"/> or
    /// a message in the case of a special command that should be handled by the parent (e.g. reset).
    /// </remarks>
    internal class LocationDialogResponse
    {
        /// <summary>
        /// Gets the location.
        /// </summary>
        /// <value>
        /// The location.
        /// </value>
        public Bing.Location Location { get; }

        /// <summary>
        /// Gets the message.
        /// </summary>
        /// <value>
        /// The message.
        /// </value>
        public string Message { get; }

        /// <summary>
        /// Initializes a new instance of the <see cref="LocationDialogResponse"/> class.
        /// </summary>
        /// <param name="location">The location.</param>
        /// <param name="message">The message.</param>
        public LocationDialogResponse(Bing.Location location = null, string message = null)
        {
            this.Location = location;
            this.Message = message;
        }
    }
}
