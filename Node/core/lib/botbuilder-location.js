"use strict";
var path = require("path");
var botbuilder_1 = require("botbuilder");
var common = require("./common");
var consts_1 = require("./consts");
var place_1 = require("./place");
var addFavoriteLocationDialog = require("./dialogs/add-favorite-location-dialog");
var confirmDialog = require("./dialogs/confirm-dialog");
var retrieveLocationDialog = require("./dialogs/retrieve-location-dialog");
var requireFieldsDialog = require("./dialogs/require-fields-dialog");
var retrieveFavoriteLocationDialog = require("./dialogs/retrieve-favorite-location-dialog");
exports.LocationRequiredFields = requireFieldsDialog.LocationRequiredFields;
exports.getFormattedAddressFromLocation = common.getFormattedAddressFromLocation;
exports.Place = place_1.Place;
exports.createLibrary = function (apiKey) {
    if (typeof apiKey === "undefined") {
        throw "'apiKey' parameter missing";
    }
    var lib = new botbuilder_1.Library(consts_1.LibraryName);
    retrieveFavoriteLocationDialog.register(lib, apiKey);
    retrieveLocationDialog.register(lib, apiKey);
    requireFieldsDialog.register(lib);
    addFavoriteLocationDialog.register(lib);
    confirmDialog.register(lib);
    lib.localePath(path.join(__dirname, 'locale/'));
    lib.dialog('locationPickerPrompt', getLocationPickerPrompt());
    return lib;
};
exports.getLocation = function (session, options) {
    options = options || { prompt: session.gettext(consts_1.Strings.DefaultPrompt) };
    if (typeof options.prompt == "undefined") {
        options.prompt = session.gettext(consts_1.Strings.DefaultPrompt);
    }
    return session.beginDialog(consts_1.LibraryName + ':locationPickerPrompt', options);
};
function getLocationPickerPrompt() {
    return [
        function (session, args, next) {
            session.dialogData.args = args;
            if (!args.skipFavorites) {
                botbuilder_1.Prompts.choice(session, session.gettext(consts_1.Strings.DialogStartBranchAsk), [session.gettext(consts_1.Strings.FavoriteLocations), session.gettext(consts_1.Strings.OtherLocation)], { listStyle: botbuilder_1.ListStyle.button, retryPrompt: session.gettext(consts_1.Strings.InvalidStartBranchResponse) });
            }
            else {
                next();
            }
        },
        function (session, results, next) {
            if (results && results.response && results.response.entity === session.gettext(consts_1.Strings.FavoriteLocations)) {
                session.beginDialog('retrieve-favorite-location-dialog', session.dialogData.args);
            }
            else {
                session.beginDialog('retrieve-location-dialog', session.dialogData.args);
            }
        },
        function (session, results, next) {
            if (results.response && results.response.place) {
                session.dialogData.place = results.response.place;
                if (session.dialogData.args.skipConfirmationAsk) {
                    next({ response: { confirmed: true } });
                }
                else {
                    var separator = session.gettext(consts_1.Strings.AddressSeparator);
                    var promptText = session.gettext(consts_1.Strings.ConfirmationAsk, common.getFormattedAddressFromLocation(results.response.place, separator));
                    session.beginDialog('confirm-dialog', { confirmationPrompt: promptText });
                }
            }
            else {
                next(results);
            }
        },
        function (session, results, next) {
            session.dialogData.confirmed = results.response.confirmed;
            if (results.response && results.response.confirmed && !session.dialogData.args.skipFavorites) {
                session.beginDialog('add-favorite-location-dialog', { place: session.dialogData.place });
            }
            else {
                next(results);
            }
        },
        function (session, results, next) {
            if (results.response && results.response.cancel) {
                session.endDialogWithResult(null);
            }
            else if (!session.dialogData.confirmed || (results.response && results.response.reset)) {
                session.send(consts_1.Strings.ResetPrompt);
                session.replaceDialog('locationPickerPrompt', session.dialogData.args);
            }
            else {
                next({ response: common.processLocation(session.dialogData.place) });
            }
        }
    ];
}
