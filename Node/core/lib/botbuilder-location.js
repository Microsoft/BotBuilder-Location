"use strict";
var path = require("path");
var botbuilder_1 = require("botbuilder");
var common = require("./common");
var consts_1 = require("./consts");
var place_1 = require("./place");
var defaultLocationDialog = require("./dialogs/default-location-dialog");
var facebookLocationDialog = require("./dialogs/facebook-location-dialog");
var requiredFieldsDialog = require("./dialogs/required-fields-dialog");
exports.LocationRequiredFields = requiredFieldsDialog.LocationRequiredFields;
exports.getFormattedAddressFromPlace = common.getFormattedAddressFromPlace;
exports.Place = place_1.Place;
exports.createLibrary = function (apiKey) {
    if (typeof apiKey === "undefined") {
        throw "'apiKey' parameter missing";
    }
    var lib = new botbuilder_1.Library(consts_1.LibraryName);
    requiredFieldsDialog.register(lib);
    defaultLocationDialog.register(lib, apiKey);
    facebookLocationDialog.register(lib, apiKey);
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
        function (session, args) {
            session.dialogData.args = args;
            if (args.useNativeControl && session.message.address.channelId == 'facebook') {
                session.beginDialog('facebook-location-dialog', args);
            }
            else {
                session.beginDialog('default-location-dialog', args);
            }
        },
        function (session, results, next) {
            if (results.response && results.response.place) {
                session.beginDialog('required-fields-dialog', {
                    place: results.response.place,
                    requiredFields: session.dialogData.args.requiredFields
                });
            }
            else {
                next(results);
            }
        },
        function (session, results, next) {
            if (results.response && results.response.place) {
                var separator = session.gettext(consts_1.Strings.AddressSeparator);
                var promptText = session.gettext(consts_1.Strings.ConfirmationAsk, common.getFormattedAddressFromPlace(results.response.place, separator));
                session.dialogData.place = results.response.place;
                botbuilder_1.Prompts.confirm(session, promptText, { listStyle: botbuilder_1.ListStyle.none });
            }
            else {
                next(results);
            }
        },
        function (session, results, next) {
            if (!results.response || results.response.reset) {
                session.send(consts_1.Strings.ResetPrompt);
                session.replaceDialog('locationPickerPrompt', session.dialogData.args);
            }
            else {
                next({ response: session.dialogData.place });
            }
        }
    ];
}
