"use strict";
var common = require("../common");
var consts_1 = require("../consts");
var favorites_manager_1 = require("../services/favorites-manager");
function register(library) {
    library.dialog('add-favorite-location-dialog', createDialog());
    library.dialog('name-favorite-location-dialog', createNameFavoriteLocationDialog());
}
exports.register = register;
function createDialog() {
    return [
        function (session, args) {
            var favoritesManager = new favorites_manager_1.FavoritesManager(session.userData);
            if (favoritesManager.maxCapacityReached() || favoritesManager.isFavorite(args.place)) {
                session.endDialogWithResult({ response: {} });
            }
            else {
                session.dialogData.place = args.place;
                var addToFavoritesAsk = session.gettext(consts_1.Strings.AddToFavoritesAsk);
                session.beginDialog('confirm-dialog', { confirmationPrompt: addToFavoritesAsk });
            }
        },
        function (session, results, next) {
            if (results.response && results.response.confirmed) {
                session.beginDialog('name-favorite-location-dialog', { place: session.dialogData.place });
            }
            else {
                next(results);
            }
        }
    ];
}
function createNameFavoriteLocationDialog() {
    return common.createBaseDialog()
        .onBegin(function (session, args) {
        session.dialogData.place = args.place;
        session.send(session.gettext(consts_1.Strings.EnterNewFavoriteLocationName)).sendBatch();
    }).onDefault(function (session) {
        var favoritesManager = new favorites_manager_1.FavoritesManager(session.userData);
        var newFavoriteName = session.message.text.trim();
        if (favoritesManager.isFavoriteLocationName(newFavoriteName)) {
            session.send(session.gettext(consts_1.Strings.DuplicateFavoriteNameResponse, newFavoriteName)).sendBatch();
        }
        else {
            var favoriteLocation = {
                location: session.dialogData.place,
                name: newFavoriteName
            };
            favoritesManager.add(favoriteLocation);
            session.send(session.gettext(consts_1.Strings.FavoriteAddedConfirmation, favoriteLocation.name));
            session.endDialogWithResult({ response: {} });
        }
    });
}
