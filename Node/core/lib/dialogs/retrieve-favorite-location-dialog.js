"use strict";
var common = require("../common");
var consts_1 = require("../consts");
var location_card_builder_1 = require("../services/location-card-builder");
var favorites_manager_1 = require("../services/favorites-manager");
var deleteFavoriteLocationDialog = require("./delete-favorite-location-dialog");
var editFavoriteLocationDialog = require("./edit-fravorite-location-dialog");
function register(library, apiKey) {
    library.dialog('retrieve-favorite-location-dialog', createDialog(apiKey));
    deleteFavoriteLocationDialog.register(library, apiKey);
    editFavoriteLocationDialog.register(library, apiKey);
}
exports.register = register;
function createDialog(apiKey) {
    return common.createBaseDialog()
        .onBegin(function (session, args) {
        session.dialogData.args = args;
        var favoritesManager = new favorites_manager_1.FavoritesManager(session.userData);
        var userFavorites = favoritesManager.getFavorites();
        if (userFavorites.length == 0) {
            session.send(session.gettext(consts_1.Strings.NoFavoriteLocationsFound));
            session.replaceDialog('retrieve-location-dialog', session.dialogData.args);
            return;
        }
        session.dialogData.userFavorites = userFavorites;
        var locations = [];
        var names = [];
        for (var i = 0; i < userFavorites.length; i++) {
            locations.push(userFavorites[i].location);
            names.push(userFavorites[i].name);
        }
        session.send(new location_card_builder_1.LocationCardBuilder(apiKey).createHeroCards(session, locations, true, names));
        session.send(session.gettext(consts_1.Strings.SelectFavoriteLocationPrompt)).sendBatch();
    }).onDefault(function (session) {
        var text = session.message.text;
        if (text === session.gettext(consts_1.Strings.OtherComand)) {
            session.replaceDialog('retrieve-location-dialog', session.dialogData.args);
        }
        else {
            var selection = tryParseCommandSelection(session.userData, text, session.dialogData.userFavorites.length);
            if (selection.command === "select") {
                session.replaceDialog('require-fields-dialog', {
                    place: selection.selectedFavorite.location,
                    requiredFields: session.dialogData.args.requiredFields
                });
            }
            else if (selection.command === session.gettext(consts_1.Strings.DeleteCommand)) {
                session.dialogData.args.toBeDeleted = selection.selectedFavorite;
                session.replaceDialog('delete-favorite-location-dialog', session.dialogData.args);
            }
            else if (selection.command === session.gettext(consts_1.Strings.EditCommand)) {
                session.dialogData.args.toBeEditted = selection.selectedFavorite;
                session.replaceDialog('edit-favorite-location-dialog', session.dialogData.args);
            }
            else {
                session.send(session.gettext(consts_1.Strings.InvalidFavoriteLocationSelection, text)).sendBatch();
            }
        }
    });
}
function tryParseFavoriteSelection(userData, text) {
    text = text.trim().toLowerCase();
    var favoritesManager = new favorites_manager_1.FavoritesManager(userData);
    var favoriteRetrievedByName = favoritesManager.getFavoriteByName(text);
    if (favoriteRetrievedByName != null) {
        return favoriteRetrievedByName;
    }
    var numberExp = /[+-]?(?:\d+\.?\d*|\d*\.?\d+)/;
    var match = numberExp.exec(text);
    if (match) {
        return favoritesManager.getFavoriteByIndex(Number(match[0]) - 1);
    }
    return null;
}
function tryParseCommandSelection(userData, text, maxIndex) {
    var tokens = text.trim().split(' ');
    if (tokens.length == 1) {
        var selectedFavorite = tryParseFavoriteSelection(userData, text);
        if (selectedFavorite == null) {
            return { command: "" };
        }
        return { selectedFavorite: selectedFavorite, command: "select" };
    }
    else if (tokens.length == 2) {
        var selectedFavorite = tryParseFavoriteSelection(userData, tokens[1]);
        if (selectedFavorite == null) {
            return { command: "" };
        }
        return { selectedFavorite: selectedFavorite, command: tokens[0] };
    }
    return { command: "" };
}
