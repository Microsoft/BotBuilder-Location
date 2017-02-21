import * as common from '../common';
import { Strings } from '../consts';
import { Session, Library } from 'botbuilder';
import { LocationCardBuilder } from '../services/location-card-builder';
import { FavoritesManager } from '../services/favorites-manager';
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
                const selection = tryParseCommandSelection(text, session.dialogData.userFavorites.length);
                if ( selection.command === "select" ) {
                    // complete required fields
                    session.replaceDialog('require-fields-dialog', {
                                place: session.dialogData.userFavorites[selection.index - 1].location,
                                requiredFields: session.dialogData.args.requiredFields
                            });
                }
                else if (selection.command === session.gettext(Strings.DeleteCommand) ) {
                     session.dialogData.args.toBeDeleted = session.dialogData.userFavorites[selection.index - 1];
                     session.replaceDialog('delete-favorite-location-dialog',  session.dialogData.args);
                }
                else if (selection.command === session.gettext(Strings.EditCommand)) {
                    session.dialogData.args.toBeEditted = session.dialogData.userFavorites[selection.index - 1];
                    session.replaceDialog('edit-favorite-location-dialog',  session.dialogData.args);
                }
                else {
                    session.send(session.gettext(Strings.InvalidFavoriteLocationSelection)).sendBatch();
                }
            }
        });
}
    
function tryParseNumberSelection(text: string): number {
    const tokens = text.trim().split(' ');
    if (tokens.length == 1) {
        const numberExp = /[+-]?(?:\d+\.?\d*|\d*\.?\d+)/;
        const match = numberExp.exec(text);
        if (match) {
            return Number(match[0]);
        }
    }
    return -1;
}

function tryParseCommandSelection(text: string, maxIndex: number): any {
    const tokens = text.trim().split(' ');

    if (tokens.length == 1) {
        const index = tryParseNumberSelection(text);
        if (index > 0 && index <= maxIndex) {
             return { index: index, command: "select" };
        }
    }
    else if (tokens.length == 2) {
        const index = tryParseNumberSelection(tokens[1]);
        if (index > 0 && index <= maxIndex) {
            return { index: index, command: tokens[0] };
        }
    }
   
    return { command: ""};
}