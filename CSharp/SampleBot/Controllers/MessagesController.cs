namespace SampleBot.Controllers
{
    using System;
    using System.Net;
    using System.Net.Http;
    using System.Threading.Tasks;
    using System.Web.Configuration;
    using System.Web.Http;
    using Microsoft.Bot.Builder.Dialogs;
    using Microsoft.Bot.Builder.Location;
    using Microsoft.Bot.Connector;

#if !DEBUG
    [BotAuthentication]
#endif
    public class MessagesController : ApiController
    {
        /// <summary>
        /// POST: api/Messages
        /// Receive a message from a user and reply to it
        /// </summary>
        public async Task<HttpResponseMessage> Post([FromBody]Activity activity)
        {
            if (activity.Type == ActivityTypes.Message)
            {
                await Conversation.SendAsync(activity, () => new MainDialog(activity.ChannelId));
            }

            var response = this.Request.CreateResponse(HttpStatusCode.OK);
            return response;
        }

        /// <summary>
        /// Represents a sample dialog that shows how to trigger the <see cref="LocationDialog"/> and handle its response.
        /// </summary>
        [Serializable]
        private class MainDialog : IDialog<string>
        {
            private readonly string channelId;

            public MainDialog(string channelId)
            {
                this.channelId = channelId;
            }

#pragma warning disable CS1998 // Async method lacks 'await' operators and will run synchronously
            public async Task StartAsync(IDialogContext context)
#pragma warning restore CS1998 // Async method lacks 'await' operators and will run synchronously
            {
                context.Wait(this.MessageReceivedAsync);
            }

#pragma warning disable CS1998 // Async method lacks 'await' operators and will run synchronously
            private async Task MessageReceivedAsync(IDialogContext context, IAwaitable<IMessageActivity> argument)
#pragma warning restore CS1998 // Async method lacks 'await' operators and will run synchronously
            {
                var apiKey = WebConfigurationManager.AppSettings["BingMapsApiKey"];
                var options = LocationOptions.UseNativeControl | LocationOptions.ReverseGeocode;

                var requiredFields = LocationRequiredFields.StreetAddress | LocationRequiredFields.Locality |
                                     LocationRequiredFields.Region | LocationRequiredFields.Country |
                                     LocationRequiredFields.PostalCode;

                var prompt = "Hi, where would you like me to ship to your widget?";

                var locationDialog = new LocationDialog(apiKey, this.channelId, prompt, options, requiredFields);

                context.Call(locationDialog, this.ResumeAfterLocationDialogAsync);
            }

            private async Task ResumeAfterLocationDialogAsync(IDialogContext context, IAwaitable<Place> result)
            {
                var place = await result;
                if (place != null)
                {
                    var address = place.GetPostalAddress();

                    string name = address != null ?
                        $"{address.StreetAddress}, {address.Locality}, {address.Region}, {address.Country} ({address.PostalCode})" :
                        "the pinned location";

                    await context.PostAsync($"OK, I will ship it to {name}");
                }
                else
                {
                    await context.PostAsync("OK, I won't be shipping it");
                }

                context.Done<string>(null);
            }
        }
    }
}