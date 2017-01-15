"use strict";
var common = require("../common");
var consts_1 = require("../consts");
var botbuilder_1 = require("botbuilder");
var map_card_1 = require("../map-card");
var locationService = require("../services/bing-geospatial-service");
var confirmDialog = require("./confirm-dialog");
var choiceDialog = require("./choice-dialog");
function register(library, apiKey) {
    confirmDialog.register(library);
    choiceDialog.register(library);
    library.dialog('default-location-dialog', createDialog());
    library.dialog('location-resolve-dialog', createLocationResolveDialog(apiKey));
}
exports.register = register;
function createDialog() {
    return [
        function (session, args) {
            session.beginDialog('location-resolve-dialog', { prompt: args.prompt });
        },
        function (session, results, next) {
            session.dialogData.response = results.response;
            if (results.response && results.response.locations) {
                var locations = results.response.locations;
                if (locations.length == 1) {
                    session.beginDialog('confirm-dialog', { locations: locations });
                }
                else {
                    session.beginDialog('choice-dialog', { locations: locations });
                }
            }
            else {
                next(results);
            }
        }
    ];
}
var MAX_CARD_COUNT = 5;
function createLocationResolveDialog(apiKey) {
    return common.createBaseDialog()
        .onBegin(function (session, args) {
        var promptSuffix = session.gettext(consts_1.Strings.TitleSuffix);
        session.send(args.prompt + promptSuffix).sendBatch();
    }).onDefault(function (session) {
        locationService.getLocationByQuery(apiKey, session.message.text)
            .then(function (locations) {
            if (locations.length == 0) {
                session.send(consts_1.Strings.LocationNotFound).sendBatch();
                return;
            }
            var locationCount = Math.min(MAX_CARD_COUNT, locations.length);
            locations = locations.slice(0, locationCount);
            var reply = createLocationsCard(apiKey, session, locations);
            session.send(reply);
            session.endDialogWithResult({ response: { locations: locations } });
        })
            .catch(function (error) { return session.error(error); });
    });
}
function createLocationsCard(apiKey, session, locations) {
    var cards = new Array();
    for (var i = 0; i < locations.length; i++) {
        cards.push(constructCard(apiKey, session, locations, i));
    }
    return new botbuilder_1.Message(session)
        .attachmentLayout(botbuilder_1.AttachmentLayout.carousel)
        .attachments(cards);
}
function constructCard(apiKey, session, locations, index) {
    var location = locations[index];
    var card = new map_card_1.MapCard(apiKey, session);
    if (locations.length > 1) {
        card.location(location, index + 1);
    }
    else {
        card.location(location);
    }
    return card;
}
