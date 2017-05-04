import * as common from '../common';
import { Strings } from '../consts';
import { Session, Library } from 'botbuilder';
import { LocationCardBuilder } from '../services/location-card-builder';
import { FavoritesManager } from '../services/favorites-manager';
import { FavoriteLocation } from '../favorite-location';
import * as deleteFavoriteLocationDialog from './delete-favorite-location-dialog';
import * as editFavoriteLocationDialog from './edit-fravorite-location-dialog';
import { RawLocation } from '../rawLocation';

export function register(library: Library, apiKey: string): void {
    library.dialog('retrieve-favorite-location-dialog', createDialog(apiKey));
    deleteFavoriteLocationDialog.register(library, apiKey);
    editFavoriteLocationDialog.register(library, apiKey);
}

function createDialog(apiKey: string) {
     return common.createBaseDialog()
        .onBegin(function (session, args) {
            session.dialogData.args = args;
            const favoritesManager = new  FavoritesManager(session.userData);
            const userFavorites = favoritesManager.getFavorites();

           // If the user has no favorite locations, switch to a normal location retriever dialog
           if (userFavorites.length == 0) {
               session.send(session.gettext(Strings.NoFavoriteLocationsFound));
               session.replaceDialog('retrieve-location-dialog',  session.dialogData.args);
               return;
           }

           session.dialogData.userFavorites = userFavorites;

           let locations: RawLocation[] = [];
           let names: string[] = [];
           for (let i = 0; i < userFavorites.length; i++) {
               locations.push(userFavorites[i].location);
               names.push(userFavorites[i].name);
           }
           
           session.send(new LocationCardBuilder(apiKey).createHeroCards(session, locations, true, names));
           session.send(session.gettext(Strings.SelectFavoriteLocationPrompt)).sendBatch();
        }).onDefault((session) => {
            const text: string = session.message.text;
            if (text === session.gettext(Strings.OtherComand)) {
                session.replaceDialog('retrieve-location-dialog',  session.dialogData.args);
            }
            else {
                const selection = tryParseCommandSelection(session.userData, text, session.dialogData.userFavorites.length);
                if ( selection.command === "select" ) {
                    // complete required fields
                    session.replaceDialog('require-fields-dialog', {
                                place: selection.selectedFavorite.location,
                                requiredFields: session.dialogData.args.requiredFields
                            });
                }
                else if (selection.command === session.gettext(Strings.DeleteCommand) ) {
                     session.dialogData.args.toBeDeleted = selection.selectedFavorite;
                     session.replaceDialog('delete-favorite-location-dialog',  session.dialogData.args);
                }
                else if (selection.command === session.gettext(Strings.EditCommand)) {
                    session.dialogData.args.toBeEditted = selection.selectedFavorite;
                    session.replaceDialog('edit-favorite-location-dialog',  session.dialogData.args);
                }
                else {
                    session.send(session.gettext(Strings.InvalidFavoriteLocationSelection, text)).sendBatch();
                }
            }
        });
}
    
function tryParseFavoriteSelection(userData : any, text: string): FavoriteLocation {
    text = text.trim().toLowerCase();

    const favoritesManager = new  FavoritesManager(userData);
    const favoriteRetrievedByName = favoritesManager.getFavoriteByName(text);

    if (favoriteRetrievedByName != null) {
        return favoriteRetrievedByName;
    }

    const numberExp = /[+-]?(?:\d+\.?\d*|\d*\.?\d+)/;
    const match = numberExp.exec(text);
    if (match) {
       return favoritesManager.getFavoriteByIndex(Number(match[0]) - 1);
    }

    return null;
}

function tryParseCommandSelection(userData : any, text: string, maxIndex: number): any {
    const tokens = text.trim().split(' ');

    if (tokens.length == 1) {
        const selectedFavorite = tryParseFavoriteSelection(userData, text);
        if (selectedFavorite == null) {
            return { command: ""};
        }
        return { selectedFavorite: selectedFavorite, command: "select" };
    }
    else if (tokens.length == 2) {
        const selectedFavorite = tryParseFavoriteSelection(userData, tokens[1]);
        if (selectedFavorite == null) {
            return { command: ""};
        }
        return { selectedFavorite: selectedFavorite, command: tokens[0] };
    }
   
    return { command: ""};
}