﻿namespace Microsoft.Bot.Builder.Location.Channels
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using Bing;
    using Connector;
    using ConnectorEx;
    using Dialogs;

    [Serializable]
    internal class FacebookLocationDialog : LocationDialogBase<Location>
    {
        private readonly string prompt;

        public FacebookLocationDialog(string prompt, LocationResourceManager resourceManager)
            : base(resourceManager)
        {
            this.prompt = prompt;
        }

        public override async Task StartAsync(IDialogContext context)
        {
            var reply = context.MakeMessage();
            reply.ChannelData = new FacebookMessage
            (
                text: this.prompt,
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

        protected override async Task MessageReceivedInternalAsync(IDialogContext context, IAwaitable<IMessageActivity> argument)
        {
            var message = await argument;

            var place = message.Entities?.Where(t => t.Type == "Place").Select(t => t.GetAs<Place>()).FirstOrDefault();

            if (place != null)
            {
                if (place.Geo != null && place.Geo.latitude != null && place.Geo.longitude != null)
                {
                    var location = new Location
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

                    context.Done(location);
                    return;
                }
            }

            context.Done<Location>(null);
        }
    }
}
