"use strict";
var consts_1 = require("../consts");
var common = require("../common");
var botbuilder_1 = require("botbuilder");
var locationService = require("../services/bing-geospatial-service");
function register(library, apiKey) {
    library.dialog('retrieve-facebook-location-dialog', createDialog(apiKey));
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
                locationService.getLocationByPoint(apiKey, results.response.place.point.coordinates[0], results.response.place.point.coordinates[1])
                    .then(function (locations) {
                    var place;
                    if (locations.length && locations[0].address) {
                        var address = {
                            addressLine: undefined,
                            formattedAddress: undefined,
                            adminDistrict: locations[0].address.adminDistrict,
                            adminDistrict2: locations[0].address.adminDistrict2,
                            countryRegion: locations[0].address.countryRegion,
                            locality: locations[0].address.locality,
                            postalCode: locations[0].address.postalCode
                        };
                        place = { address: address, bbox: locations[0].bbox, confidence: locations[0].confidence, entityType: locations[0].entityType, name: locations[0].name, point: locations[0].point };
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
                session.endDialogWithResult({ response: { place: buildLocationFromGeo(Number(entities[i].geo.latitude), Number(entities[i].geo.longitude)) } });
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
function buildLocationFromGeo(latitude, longitude) {
    var coordinates = [latitude, longitude];
    return { point: { coordinates: coordinates }, address: {} };
}
