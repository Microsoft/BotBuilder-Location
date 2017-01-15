"use strict";
var consts_1 = require("../consts");
var common = require("../common");
var botbuilder_1 = require("botbuilder");
var locationService = require("../services/bing-geospatial-service");
function register(library, apiKey) {
    library.dialog('facebook-location-dialog', createDialog(apiKey));
    library.dialog('facebook-location-resolve-dialog', createLocationResolveDialog());
}
exports.register = register;
function createDialog(apiKey) {
    return [
        function (session, args) {
            session.dialogData.args = args;
            session.beginDialog('facebook-location-resolve-dialog', { prompt: args.prompt });
        },
        function (session, results, next) {
            if (session.dialogData.args.reverseGeocode && results.response && results.response.place) {
                locationService.getLocationByPoint(apiKey, results.response.place.geo.latitude, results.response.place.geo.longitude)
                    .then(function (locations) {
                    var place;
                    if (locations.length) {
                        place = common.processLocation(locations[0], false);
                    }
                    else {
                        place = results.response.place;
                    }
                    session.endDialogWithResult({ response: { place: place } });
                })
                    .catch(function (error) { return session.error(error); });
                ;
            }
            else {
                next(results);
            }
        }
    ];
}
function createLocationResolveDialog() {
    return common.createBaseDialog()
        .onBegin(function (session, args) {
        session.dialogData.args = args;
        var promptSuffix = session.gettext(consts_1.Strings.TitleSuffixFacebook);
        sendLocationPrompt(session, session.dialogData.args.prompt + promptSuffix).sendBatch();
    }).onDefault(function (session) {
        var entities = session.message.entities;
        for (var i = 0; i < entities.length; i++) {
            if (entities[i].type == "Place" && entities[i].geo && entities[i].geo.latitude && entities[i].geo.longitude) {
                session.endDialogWithResult({ response: { place: common.buildPlaceFromGeo(entities[i].geo.latitude, entities[i].geo.longitude) } });
                return;
            }
        }
        var prompt = session.gettext(consts_1.Strings.InvalidLocationResponseFacebook);
        sendLocationPrompt(session, prompt).sendBatch();
    });
}
function sendLocationPrompt(session, prompt) {
    var message = new botbuilder_1.Message(session).text(prompt).sourceEvent({
        facebook: {
            quick_replies: [
                {
                    content_type: "location"
                }
            ]
        }
    });
    return session.send(message);
}
