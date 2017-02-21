import { IDialogResult, Library, Session } from 'botbuilder';
import { Strings } from '../consts';

export function register(library: Library): void {
    library.dialog('confirm-single-location-dialog', createDialog());
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
                session.endDialogWithResult({ response: { place: session.dialogData.locations[0] } });
            }
            else {
                // User said no
                session.endDialogWithResult({ response: { reset: true } });
            }
        }
    ];
}