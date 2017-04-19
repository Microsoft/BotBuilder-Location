import * as common from '../common';
import { Strings } from '../consts';
import { Session, IDialogResult, Library } from 'botbuilder';
import * as locationService from '../services/bing-geospatial-service';
import * as confirmSingleLocationDialog from './confirm-single-location-dialog';
import * as chooseLocationDialog from './choose-location-dialog';
import { LocationCardBuilder } from '../services/location-card-builder';

export function register(library: Library, apiKey: string): void {
    confirmSingleLocationDialog.register(library);
    chooseLocationDialog.register(library);
    library.dialog('resolve-bing-location-dialog', createDialog());
    library.dialog('location-resolve-dialog', createLocationResolveDialog(apiKey));
}

function createDialog() {
    return [
        (session: Session, args: any) => {
            session.beginDialog('location-resolve-dialog', args);
        },
        (session: Session, results: IDialogResult<any>, next: (results?: IDialogResult<any>) => void) => {
            session.dialogData.response = results.response;
            if (results.response && results.response.locations) {
                var locations = results.response.locations;

                if (locations.length == 1) {
                    session.beginDialog('confirm-single-location-dialog', { locations: locations });
                } else {
                    session.beginDialog('choose-location-dialog', { locations: locations });
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
            if (!args.skipDialogPrompt) {
                var promptSuffix = session.gettext(Strings.TitleSuffix);
                session.send(args.prompt + promptSuffix).sendBatch();
            }
        }).onDefault((session) => {
            locationService.getLocationByQuery(apiKey, session.message.text)
                .then(locations => {
                    if (locations.length == 0) {
                        session.send(Strings.LocationNotFound).sendBatch();
                        return;
                    }

                    var locationCount = Math.min(MAX_CARD_COUNT, locations.length);
                    locations = locations.slice(0, locationCount);
                    var reply = new LocationCardBuilder(apiKey).createHeroCards(session, locations);
                    session.send(reply);

                    session.endDialogWithResult({ response: { locations: locations } });
                })
                .catch(error => session.error(error));
        });
}