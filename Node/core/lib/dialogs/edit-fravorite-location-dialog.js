"use strict";
var consts_1 = require("../consts");
var favorites_manager_1 = require("../services/favorites-manager");
function register(library, apiKey) {
    library.dialog('edit-favorite-location-dialog', createDialog());
}
exports.register = register;
function createDialog() {
    return [
        function (session, args) {
            session.dialogData.args = args;
            session.dialogData.toBeEditted = args.toBeEditted;
            session.dialogData.args.skipDialogPrompt = true;
            session.send(session.gettext(consts_1.Strings.EditFavoritePrompt, args.toBeEditted.name));
            session.beginDialog('retrieve-location-dialog', session.dialogData.args);
        },
        function (session, results, next) {
            if (results.response && results.response.place) {
                var favoritesManager = new favorites_manager_1.FavoritesManager(session.userData);
                var newfavoriteLocation = {
                    location: results.response.place,
                    name: session.dialogData.toBeEditted.name
                };
                favoritesManager.update(session.dialogData.toBeEditted, newfavoriteLocation);
                session.send(session.gettext(consts_1.Strings.FavoriteEdittedConfirmation, session.dialogData.toBeEditted.name, newfavoriteLocation.location.address.formattedAddress));
                session.endDialogWithResult({ response: { place: results.response.place } });
            }
            else {
                next(results);
            }
        }
    ];
}
