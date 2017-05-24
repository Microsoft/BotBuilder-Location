"use strict";
exports.__esModule = true;
var common = require("../common");
var consts_1 = require("../consts");
var locationService = require("../services/bing-geospatial-service");
var confirmSingleLocationDialog = require("./confirm-single-location-dialog");
var chooseLocationDialog = require("./choose-location-dialog");
var location_card_builder_1 = require("../services/location-card-builder");
function register(library, apiKey) {
    confirmSingleLocationDialog.register(library);
    chooseLocationDialog.register(library);
    library.dialog('resolve-bing-location-dialog', createDialog());
    library.dialog('location-resolve-dialog', createLocationResolveDialog(apiKey));
}
exports.register = register;
function createDialog() {
    return [
        function (session, args) {
            session.beginDialog('location-resolve-dialog', args);
        },
        function (session, results, next) {
            session.dialogData.response = results.response;
            if (results.response && results.response.locations) {
                var locations = results.response.locations;
                if (locations.length == 1) {
                    session.beginDialog('confirm-single-location-dialog', { locations: locations });
                }
                else {
                    session.beginDialog('choose-location-dialog', { locations: locations });
                }
            }
            else {
                next(results);
            }
        }
    ];
}
// Maximum number of hero cards to be returned in the carousel. If this number is greater than 5, skype throws an exception.
var MAX_CARD_COUNT = 5;
function createLocationResolveDialog(apiKey) {
    return common.createBaseDialog()
        .onBegin(function (session, args) {
        if (!args.skipDialogPrompt) {
            var promptSuffix = !args.skipPromptSuffix
                ? session.gettext(consts_1.Strings.TitleSuffix)
                : '';
            session.send(args.prompt + promptSuffix).sendBatch();
        }
    }).onDefault(function (session) {
        locationService.getLocationByQuery(apiKey, session.message.text)
            .then(function (locations) {
            if (locations.length == 0) {
                session.send(consts_1.Strings.LocationNotFound).sendBatch();
                return;
            }
            var locationCount = Math.min(MAX_CARD_COUNT, locations.length);
            locations = locations.slice(0, locationCount);
            var reply = new location_card_builder_1.LocationCardBuilder(apiKey).createHeroCards(session, locations);
            session.send(reply);
            session.endDialogWithResult({ response: { locations: locations } });
        })["catch"](function (error) { return session.error(error); });
    });
}
