"use strict";
var botbuilder_1 = require("botbuilder");
var map_card_1 = require("../map-card");
var LocationCardBuilder = (function () {
    function LocationCardBuilder(apiKey) {
        this.apiKey = apiKey;
    }
    LocationCardBuilder.prototype.createHeroCards = function (session, locations, alwaysShowNumericPrefix, locationNames) {
        var cards = new Array();
        for (var i = 0; i < locations.length; i++) {
            cards.push(this.constructCard(session, locations, i, alwaysShowNumericPrefix, locationNames));
        }
        return new botbuilder_1.Message(session)
            .attachmentLayout(botbuilder_1.AttachmentLayout.carousel)
            .attachments(cards);
    };
    LocationCardBuilder.prototype.constructCard = function (session, locations, index, alwaysShowNumericPrefix, locationNames) {
        var location = locations[index];
        var card = new map_card_1.MapCard(this.apiKey, session);
        if (alwaysShowNumericPrefix || locations.length > 1) {
            if (locationNames) {
                card.location(location, index + 1, locationNames[index]);
            }
            else {
                card.location(location, index + 1);
            }
        }
        else {
            card.location(location);
        }
        return card;
    };
    return LocationCardBuilder;
}());
exports.LocationCardBuilder = LocationCardBuilder;
