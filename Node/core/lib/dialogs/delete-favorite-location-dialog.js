"use strict";
var consts_1 = require("../consts");
var favorites_manager_1 = require("../services/favorites-manager");
function register(library, apiKey) {
    library.dialog('delete-favorite-location-dialog', createDialog());
}
exports.register = register;
function createDialog() {
    return [
        function (session, args) {
            session.dialogData.args = args;
            session.dialogData.toBeDeleted = args.toBeDeleted;
            var deleteFavoriteConfirmationAsk = session.gettext(consts_1.Strings.DeleteFavoriteConfirmationAsk, args.toBeDeleted.name);
            session.beginDialog('confirm-dialog', { confirmationPrompt: deleteFavoriteConfirmationAsk });
        },
        function (session, results, next) {
            if (results.response && results.response.confirmed) {
                var favoritesManager = new favorites_manager_1.FavoritesManager(session.userData);
                favoritesManager.delete(session.dialogData.toBeDeleted);
                session.send(session.gettext(consts_1.Strings.FavoriteDeletedConfirmation, session.dialogData.toBeDeleted.name));
                session.replaceDialog('retrieve-favorite-location-dialog', session.dialogData.args);
            }
            else if (results.response && results.response.confirmed === false) {
                session.send(session.gettext(consts_1.Strings.DeleteFavoriteAbortion, session.dialogData.toBeDeleted.name));
                session.replaceDialog('retrieve-favorite-location-dialog', session.dialogData.args);
            }
            else {
                next(results);
            }
        }
    ];
}
