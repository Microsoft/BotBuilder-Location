import * as common from '../common';
import { Session, IDialogResult, Library, AttachmentLayout, HeroCard, CardImage, Message } from 'botbuilder';
import { Place } from '../Place';
import * as locationService from '../services/bing-geospatial-service';
import * as confirmDialog from './confirm-dialog';
import * as choiceDialog from './choice-dialog';

export function register(library: Library): void {
    confirmDialog.register(library);
    choiceDialog.register(library);
    library.dialog('default-location-dialog', createDialog());
    library.dialog('location-resolve-dialog', createLocationResolveDialog());
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
                    session.beginDialog('confirm-dialog', { locations: locations });
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

function createLocationResolveDialog() {
    return common.createBaseDialog()
        .onBegin(function (session, args) {
            session.send(args.prompt);
        }).onDefault((session) => {
            locationService.getLocationByQuery(session.message.text)
                .then(locations => {
                    if (locations.length == 0) {
                        session.send("LocationNotFound");
                        return;
                    }

                    var locationCount = Math.min(MAX_CARD_COUNT, locations.length);
                    locations = locations.slice(0, locationCount);
                    var reply = createLocationsCard(session, locations);
                    session.send(reply);

                    session.endDialogWithResult({ response: { locations: locations } });
                });
        })
}

function createLocationsCard(session: Session, locations: any) {
    var cards = new Array();

    for (var i = 0; i < locations.length; i++) {
        cards.push(constructCard(session, locations, i));
    }

    return new Message(session)
        .attachmentLayout(AttachmentLayout.carousel)
        .attachments(cards);
}

function constructCard(session: Session, locations: Array<any>, index: number) {
    var location = locations[index];
    var indexText = locations.length > 1 ? (index + 1) + ". " : "";
    var text = indexText + location.address.formattedAddress;
    var card = new HeroCard(session)
        .subtitle(text);

    if (location.point) {
        card.images([CardImage.create(session, locationService.GetLocationMapImageUrl(location, index))]);

    }

    return card;
}