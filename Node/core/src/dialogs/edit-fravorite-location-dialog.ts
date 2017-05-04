import { IDialogResult, Library, Session } from 'botbuilder';
import { Strings } from '../consts';
import { FavoriteLocation } from '../favorite-location';
import { FavoritesManager } from '../services/favorites-manager';

export function register(library: Library, apiKey: string): void {
    library.dialog('edit-favorite-location-dialog', createDialog());
}

function createDialog() {
    return [
        (session: Session, args: any) => {
            session.dialogData.args = args;
            session.dialogData.toBeEditted = args.toBeEditted; 
            session.dialogData.args.skipDialogPrompt = true;
            session.send(session.gettext(Strings.EditFavoritePrompt, args.toBeEditted.name));
            session.beginDialog('retrieve-location-dialog',  session.dialogData.args);
        },
        (session: Session, results: IDialogResult<any>, next: (results?: IDialogResult<any>) => void) => {
            if (results.response && results.response.place) {
                const favoritesManager = new  FavoritesManager(session.userData);
                const newfavoriteLocation: FavoriteLocation = {
                    location:  results.response.place,
                    name: session.dialogData.toBeEditted.name
                };
                favoritesManager.update(session.dialogData.toBeEditted, newfavoriteLocation);
                session.send(session.gettext(
                    Strings.FavoriteEdittedConfirmation,
                    session.dialogData.toBeEditted.name,
                    newfavoriteLocation.location.address.formattedAddress));
                session.endDialogWithResult({ response: { place: results.response.place } });
            }
            else {
                 next(results);
            }
        }
    ]
}