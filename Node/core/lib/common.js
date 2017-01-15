"use strict";
var botbuilder_1 = require("botbuilder");
var consts_1 = require("./consts");
var place_1 = require("./place");
function createBaseDialog(options) {
    return new botbuilder_1.IntentDialog(options)
        .matches(/^cancel$/i, function (session) {
        session.send(consts_1.Strings.CancelPrompt);
        session.endDialogWithResult({ response: { cancel: true } });
        return;
    })
        .matches(/^help$/i, function (session) {
        session.send(consts_1.Strings.HelpMessage).sendBatch();
    })
        .matches(/^reset$/i, function (session) {
        session.endDialogWithResult({ response: { reset: true } });
        return;
    });
}
exports.createBaseDialog = createBaseDialog;
function processLocation(location, includeStreetAddress) {
    var place = new place_1.Place();
    place.type = location.entityType;
    place.name = location.name;
    if (location.address) {
        place.formattedAddress = location.address.formattedAddress;
        place.country = location.address.countryRegion;
        place.locality = location.address.locality;
        place.postalCode = location.address.postalCode;
        place.region = location.address.adminDistrict;
        if (includeStreetAddress) {
            place.streetAddress = location.address.addressLine;
        }
    }
    if (location.point && location.point.coordinates && location.point.coordinates.length == 2) {
        place.geo = new place_1.Geo();
        place.geo.latitude = location.point.coordinates[0];
        place.geo.longitude = location.point.coordinates[1];
    }
    return place;
}
exports.processLocation = processLocation;
function buildPlaceFromGeo(latitude, longitude) {
    var place = new place_1.Place();
    place.geo = new place_1.Geo();
    place.geo.latitude = latitude;
    place.geo.longitude = longitude;
    return place;
}
exports.buildPlaceFromGeo = buildPlaceFromGeo;
function getFormattedAddressFromPlace(place, separator) {
    var addressParts = new Array();
    if (place.streetAddress) {
        addressParts.push(place.streetAddress);
    }
    if (place.locality) {
        addressParts.push(place.locality);
    }
    if (place.region) {
        addressParts.push(place.region);
    }
    if (place.postalCode) {
        addressParts.push(place.postalCode);
    }
    if (place.country) {
        addressParts.push(place.country);
    }
    return addressParts.join(separator);
}
exports.getFormattedAddressFromPlace = getFormattedAddressFromPlace;
