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
            var selection = tryParseCommandSelection(text, session.dialogData.userFavorites.length);
            if (selection.command === "select") {
                session.replaceDialog('require-fields-dialog', {
                    place: session.dialogData.userFavorites[selection.index - 1].location,
                    requiredFields: session.dialogData.args.requiredFields
                });
            }
            else if (selection.command === session.gettext(consts_1.Strings.DeleteCommand)) {
                session.dialogData.args.toBeDeleted = session.dialogData.userFavorites[selection.index - 1];
                session.replaceDialog('delete-favorite-location-dialog', session.dialogData.args);
            }
            else if (selection.command === session.gettext(consts_1.Strings.EditCommand)) {
                session.dialogData.args.toBeEditted = session.dialogData.userFavorites[selection.index - 1];
                session.replaceDialog('edit-favorite-location-dialog', session.dialogData.args);
            }
            else {
                session.send(session.gettext(consts_1.Strings.InvalidFavoriteLocationSelection)).sendBatch();
            }
        }
    });
}
function tryParseNumberSelection(text) {
    var tokens = text.trim().split(' ');
    if (tokens.length == 1) {
        var numberExp = /[+-]?(?:\d+\.?\d*|\d*\.?\d+)/;
        var match = numberExp.exec(text);
        if (match) {
            return Number(match[0]);
        }
    }
    return -1;
}
function tryParseCommandSelection(text, maxIndex) {
    var tokens = text.trim().split(' ');
    if (tokens.length == 1) {
        var index = tryParseNumberSelection(text);
        if (index > 0 && index <= maxIndex) {
            return { index: index, command: "select" };
        }
    }
    else if (tokens.length == 2) {
        var index = tryParseNumberSelection(tokens[1]);
        if (index > 0 && index <= maxIndex) {
            return { index: index, command: tokens[0] };
        }
    }
    return { command: "" };
}
