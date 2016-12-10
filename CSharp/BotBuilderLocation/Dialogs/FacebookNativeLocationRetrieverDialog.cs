using Microsoft.Bot.Builder.Internals.Fibers;

namespace Microsoft.Bot.Builder.Location.Dialogs
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using Bing;
    using Builder.Dialogs;
    using Connector;
    using ConnectorEx;

    [Serializable]
    internal class FacebookNativeLocationRetrieverDialog : LocationDialogBase<LocationDialogResponse>
    {
        private readonly string prompt;

        public FacebookNativeLocationRetrieverDialog(string prompt, LocationResourceManager resourceManager)
            : base(resourceManager)
        {
            SetField.NotNull(out this.prompt, nameof(prompt), prompt);
            this.prompt = prompt;
        }

        public override async Task StartAsync(IDialogContext context)
        {
            await this.StartAsync(context, this.prompt + this.ResourceManager.TitleSuffixFacebook);
        }

        protected override async Task MessageReceivedInternalAsync(IDialogContext context, IAwaitable<IMessageActivity> argument)
        {
            var message = await argument;

            var place = message.Entities?.Where(t => t.Type == "Place").Select(t => t.GetAs<Place>()).FirstOrDefault();

            if (place != null && place.Geo != null && place.Geo.latitude != null && place.Geo.longitude != null)
            {
                var location = new Bing.Location
                {
                    Point = new GeocodePoint
                    {
                        Coordinates = new List<double>
                                {
                                    (double)place.Geo.latitude,
                                    (double)place.Geo.longitude
                                }
                    }
                };

                context.Done(new LocationDialogResponse(location));
            }
            else
            {
                // If we didn't receive a valid place, post error message and restart dialog.
                await this.StartAsync(context, this.ResourceManager.InvalidLocationResponseFacebook);
            }
        }

        private async Task StartAsync(IDialogContext context, string message)
        {
            var reply = context.MakeMessage();
            reply.ChannelData = new FacebookMessage
            (
                text: message,
                quickReplies: new List<FacebookQuickReply>
                {
                        new FacebookQuickReply(
                            contentType: FacebookQuickReply.ContentTypes.Location,
                            title: default(string),
                            payload: default(string)
                        )
                }
            );

            await context.PostAsync(reply);
            context.Wait(this.MessageReceivedAsync);
        }
    }
}