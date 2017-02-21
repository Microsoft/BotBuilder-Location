import { IDialogResult, Library, Session } from 'botbuilder';
import * as resolveBingLocationDialog from './resolve-bing-location-dialog';
import * as retrieveFacebookLocationDialog from './retrieve-facebook-location-dialog';

export function register(library: Library, apiKey: string): void {
    library.dialog('retrieve-location-dialog', createDialog());
    resolveBingLocationDialog.register(library, apiKey);
    retrieveFacebookLocationDialog.register(library, apiKey);
}

function createDialog() {
    return [
        (session: Session, args: any) => {
            session.dialogData.args = args;
            if (args.useNativeControl && session.message.address.channelId == 'facebook') {
                session.beginDialog('retrieve-facebook-location-dialog', args);
            }
            else {
                session.beginDialog('resolve-bing-location-dialog', args);
            }    
        },
        // complete required fields, if applicable
        (session: Session, results: IDialogResult<any>, next: (results?: IDialogResult<any>) => void) => {
            if (results.response && results.response.place) {
                session.beginDialog('require-fields-dialog', {
                    place: results.response.place,
                    requiredFields: session.dialogData.args.requiredFields
                })
            } else {
                next(results);
            }
        }
    ]
}