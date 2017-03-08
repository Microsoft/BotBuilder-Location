"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var botbuilder_1 = require("botbuilder");
var locationService = require("./services/bing-geospatial-service");
var MapCard = (function (_super) {
    __extends(MapCard, _super);
    function MapCard(apiKey, session) {
        var _this = _super.call(this, session) || this;
        _this.apiKey = apiKey;
        return _this;
    }
    MapCard.prototype.location = function (location, index, locationName) {
        var prefixText = "";
        if (index !== undefined) {
            prefixText = index + ". ";
        }
        if (locationName !== undefined) {
            prefixText += locationName + ": ";
        }
        if (location.address && location.address.formattedAddress) {
            this.subtitle(prefixText + location.address.formattedAddress);
        }
        else {
            this.subtitle(prefixText);
        }
        if (location.point) {
            var locationUrl;
            try {
                locationUrl = locationService.GetLocationMapImageUrl(this.apiKey, location, index);
                this.images([botbuilder_1.CardImage.create(this.session, locationUrl)]);
            }
            catch (e) {
                this.session.error(e);
            }
        }
        return this;
    };
    return MapCard;
}(botbuilder_1.HeroCard));
exports.MapCard = MapCard;
