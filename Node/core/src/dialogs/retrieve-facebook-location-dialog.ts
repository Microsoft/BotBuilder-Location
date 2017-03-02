import { Strings } from '../consts';
import * as common from '../common';
import { Session, IDialogResult, Library, Message } from 'botbuilder';
import * as locationService from '../services/bing-geospatial-service';
import { RawLocation } from '../rawLocation';

export function register(library: Library, apiKey: string): void {
    library.dialog('retrieve-facebook-location-dialog', createDialog(apiKey));
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
                locationService.getLocationByPoint(apiKey, results.response.place.point.coordinates[0], results.response.place.point.coordinates[1])
                    .then(locations => {
                        var place: RawLocation;
                        if (locations.length) {
                            place = locations[0];
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
                    session.endDialogWithResult({ response: { place: buildLocationFromGeo(entities[i].geo.latitude, entities[i].geo.longitude) } });
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

function buildLocationFromGeo(latitude: string, longitude: string) {
    let coordinates = [ latitude, longitude];
    return { point : { coordinates : coordinates } };
}