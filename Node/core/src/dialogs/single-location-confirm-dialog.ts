import { IDialogResult, Library, Session } from 'botbuilder';
import * as common from '../common';
import { Strings } from '../consts';
import * as confirmDialog from './confirm-dialog';

export function register(library: Library): void {
    library.dialog('single-location-confirm-dialog', createDialog());
}

function createDialog() {
    return [
        (session: Session, args: any) => {
            session.dialogData.locations = args.locations;
            session.beginDialog('confirm-dialog', { confirmationPrompt: session.gettext(Strings.SingleResultFound) });
        },
        (session: Session, results: IDialogResult<any>, next: (results?: IDialogResult<any>) => void) => {
            if (results.response && results.response.confirmed) {
                // User did confirm the single location offered
                const place = common.processLocation(session.dialogData.locations[0], true);
                session.endDialogWithResult({ response: { place: place } });
            }
            else {
                // User said no
                session.endDialogWithResult({ response: { reset: true } });
            }
        }
    ];
}