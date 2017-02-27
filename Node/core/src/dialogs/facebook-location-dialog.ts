import { Strings } from '../consts';
import * as common from '../common';
import { Session, IDialogResult, Library, AttachmentLayout, HeroCard, CardImage, Message, MapCard } from 'botbuilder';
import { Place } from '../Place';
import * as locationService from '../services/bing-geospatial-service';
import * as confirmDialog from './confirm-dialog';
import * as choiceDialog from './choice-dialog';

export function register(library: Library, apiKey: string): void {
    library.dialog('facebook-location-dialog', createDialog(apiKey));
    library.dialog('facebook-location-resolve-dialog', createLocationResolveDialog(apiKey));
}

function createDialog(apiKey: string) {
    return [
        (session: Session, args: any) => {
            session.dialogData.args = args;
            session.beginDialog('facebook-location-resolve-dialog', { prompt: args.prompt });
        },
        (session: Session, results: IDialogResult<any>, next: (results?: IDialogResult<any>) => void) => {
            session.dialogData.response = results.response;
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
            else if (results.response && results.response.locations) {
                var locations = results.response.locations;
                if (locations.length == 1) {
                    session.beginDialog('confirm-dialog', { locations: locations });
                }
                else {
                    session.beginDialog('choice-dialog', { locations: locations });
                }
            }
            else {
                next(results);
            }
        }
    ];
}

var MAX_CARD_COUNT = 5;
function createLocationResolveDialog(apiKey: string) {
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

            var searchString = session.message.text;
            locationService.getLocationByQuery(apiKey, searchString).then(function (locations: Array<any>) {
                if (locations.length == 0) {
                    session.send(Strings.LocationNotFound).sendBatch();
                    return;
                }
                var locationCount = Math.min(MAX_CARD_COUNT, locations.length);
                locations = locations.slice(0, locationCount);
                var reply = createLocationsCard(apiKey, session, locations);
                session.send(reply);            
                session.endDialogWithResult({ response: { locations: locations } });
            })
            .catch(function (error) { return session.error(error); });
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

function createLocationsCard(apiKey: string, session: Session, locations: any) {
    var cards = new Array();

    for (var i = 0; i < locations.length; i++) {
        cards.push(constructCard(apiKey, session, locations, i));
    }

    return new Message(session)
        .attachmentLayout(AttachmentLayout.carousel)
        .attachments(cards);
}

function constructCard(apiKey: string, session: Session, locations: Array<any>, index: number): HeroCard {
    var location = locations[index];
    var card = new MapCard(apiKey, session);

    if (locations.length > 1) {
        card.location(location, index + 1);
    }
    else {
        card.location(location);
    }

    return card;
}