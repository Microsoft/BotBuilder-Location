import { Strings } from '../consts';
import * as common from '../common';
import { Session, IDialogResult, Library, AttachmentLayout, HeroCard, CardImage, Message } from 'botbuilder';
import { Place } from '../Place';
import * as locationService from '../services/bing-geospatial-service';

export function register(library: Library, apiKey: string): void {
    library.dialog('facebook-location-dialog', createDialog(apiKey));
    library.dialog('facebook-location-resolve-dialog', createLocationResolveDialog());
}

function createDialog(apiKey: string) {
    return [
        (session: Session, args: any) => {
            session.dialogData.args = args;
            session.beginDialog('facebook-location-resolve-dialog', { prompt: args.prompt });
        },
        (session: Session, results: IDialogResult<any>, next: (results?: IDialogResult<any>) => void) => {
            if (session.dialogData.args.reverseGeocode && results.response && results.response.place) {
                locationService.getLocationByPoint(apiKey, results.response.place.geo.latitude, results.response.place.geo.longitude)
                    .then(locations => {
                        var place: Place;
                        if (locations.length) {
                            place = common.processLocation(locations[0], false);
                        } else {
                            place = results.response.place;
                        }

                        session.endDialogWithResult({ response: { place: place } });
                    })
                    .catch(error => session.error(error));;
            }
            else {
                next(results);
            }
        }
    ];
}

function createLocationResolveDialog() {
    return common.createBaseDialog()
        .onBegin(function (session, args) {
            session.dialogData.args = args;
            var promptSuffix = session.gettext(Strings.TitleSuffixFacebook);
            sendLocationPrompt(session, session.dialogData.args.prompt + promptSuffix).sendBatch();
        }).onDefault((session) => {
            var entities = session.message.entities;
            for (var i = 0; i < entities.length; i++) {
                if (entities[i].type == "Place" && entities[i].geo && entities[i].geo.latitude && entities[i].geo.longitude) {
                    session.endDialogWithResult({ response: { place: common.buildPlaceFromGeo(entities[i].geo.latitude, entities[i].geo.longitude) } });
                    return;
                }
            }
            
            var prompt = session.gettext(Strings.InvalidLocationResponseFacebook);
            sendLocationPrompt(session, prompt).sendBatch();
        });
}

function sendLocationPrompt(session: Session, prompt: string): Session {
    var message = new Message(session).text(prompt).sourceEvent({
        facebook: {
            quick_replies: [
                {
                    content_type: "location"
                }
            ]
        }
    });

    return session.send(message);
}