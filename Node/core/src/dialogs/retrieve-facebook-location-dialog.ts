import { Strings } from '../consts';
import * as common from '../common';
import { Session, IDialogResult, Library, Message } from 'botbuilder';
import * as locationService from '../services/bing-geospatial-service';
import { RawLocation, Address } from '../rawLocation';

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
                        let place: RawLocation;
                        if (locations.length && locations[0].address) {
                            // We don't trust reverse geo-coder on the street address level.
                            // So, copy all fields except it.
                            let address: Address = {
                                addressLine : undefined,
                                formattedAddress: undefined,
                                adminDistrict : locations[0].address.adminDistrict,
                                adminDistrict2 : locations[0].address.adminDistrict2,
                                countryRegion : locations[0].address.countryRegion,
                                locality : locations[0].address.locality,
                                postalCode : locations[0].address.postalCode
                            };
                            place = { address: address, bbox: locations[0].bbox, confidence: locations[0].confidence, entityType: locations[0].entityType, name: locations[0].name, point: locations[0].point };
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
                    session.endDialogWithResult({ response: { place: buildLocationFromGeo(Number(entities[i].geo.latitude), Number(entities[i].geo.longitude)) } });
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

function buildLocationFromGeo(latitude: number, longitude: number) {
    let coordinates = [ latitude, longitude ];
    return { point : { coordinates : coordinates }, address : {} };
}