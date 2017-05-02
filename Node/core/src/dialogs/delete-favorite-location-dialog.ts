import { IDialogResult, Library, Session } from 'botbuilder';
import { Strings } from '../consts';
import { FavoritesManager } from '../services/favorites-manager';

export function register(library: Library, apiKey: string): void {
    library.dialog('delete-favorite-location-dialog', createDialog());
}

function createDialog() {
    return [
        // Ask the user to confirm deleting the favorite location
        (session: Session, args: any) => {
            session.dialogData.args = args;
            session.dialogData.toBeDeleted = args.toBeDeleted;           
            const deleteFavoriteConfirmationAsk = session.gettext(Strings.DeleteFavoriteConfirmationAsk, args.toBeDeleted.name)
            session.beginDialog('confirm-dialog', { confirmationPrompt: deleteFavoriteConfirmationAsk });
        },
        // Check whether the user confirmed
        (session: Session, results: IDialogResult<any>, next: (results?: IDialogResult<any>) => void) => {
            if (results.response && results.response.confirmed) {
                const favoritesManager = new  FavoritesManager(session.userData);
                favoritesManager.delete(session.dialogData.toBeDeleted);
                session.send(session.gettext(Strings.FavoriteDeletedConfirmation, session.dialogData.toBeDeleted.name));
                session.replaceDialog('retrieve-favorite-location-dialog', session.dialogData.args);
            }
            else if (results.response && results.response.confirmed === false) {
                session.send(session.gettext(Strings.DeleteFavoriteAbortion, session.dialogData.toBeDeleted.name));
                session.replaceDialog('retrieve-favorite-location-dialog', session.dialogData.args);
            }
            else {
                next(results);
            }
        }
    ]
}