import * as common from '../common';
import { Strings } from '../consts';
import { Session, IDialogResult, Library, AttachmentLayout, HeroCard, CardImage, Message } from 'botbuilder';
import { Place } from '../Place';
import { MapCard } from '../map-card'
import * as locationService from '../services/bing-geospatial-service';
import * as singleLocationConfirmDialog from './single-location-confirm-dialog';
import * as choiceDialog from './choice-dialog';

export function register(library: Library, apiKey: string): void {
    singleLocationConfirmDialog.register(library);
    choiceDialog.register(library);
    library.dialog('default-location-dialog', createDialog());
    library.dialog('location-resolve-dialog', createLocationResolveDialog(apiKey));
}

function createDialog() {
    return [
        (session: Session, args: any) => {
            session.beginDialog('location-resolve-dialog', { prompt: args.prompt });
        },
        (session: Session, results: IDialogResult<any>, next: (results?: IDialogResult<any>) => void) => {
            session.dialogData.response = results.response;
            if (results.response && results.response.locations) {
                var locations = results.response.locations;

                if (locations.length == 1) {
                    session.beginDialog('single-location-confirm-dialog', { locations: locations });
                } else {
                    session.beginDialog('choice-dialog', { locations: locations });
                }
            }
            else {
                next(results);
            }
        }
    ]
}

// Maximum number of hero cards to be returned in the carousel. If this number is greater than 5, skype throws an exception.
const MAX_CARD_COUNT = 5;

function createLocationResolveDialog(apiKey: string) {
    return common.createBaseDialog()
        .onBegin(function (session, args) {
            var promptSuffix = session.gettext(Strings.TitleSuffix);
            session.send(args.prompt + promptSuffix).sendBatch();
        }).onDefault((session) => {
            locationService.getLocationByQuery(apiKey, session.message.text)
                .then(locations => {
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
                .catch(error => session.error(error));
        });
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