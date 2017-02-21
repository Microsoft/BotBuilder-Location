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
function processLocation(location) {
    var place = new place_1.Place();
    place.type = location.entityType;
    place.name = location.name;
    if (location.address) {
        place.formattedAddress = location.address.formattedAddress;
        place.country = location.address.countryRegion;
        place.locality = location.address.locality;
        place.postalCode = location.address.postalCode;
        place.region = location.address.adminDistrict;
        place.streetAddress = location.address.addressLine;
    }
    if (location.point && location.point.coordinates && location.point.coordinates.length == 2) {
        place.geo = new place_1.Geo();
        place.geo.latitude = location.point.coordinates[0].toString();
        place.geo.longitude = location.point.coordinates[1].toString();
    }
    return place;
}
exports.processLocation = processLocation;
function getFormattedAddressFromLocation(location, separator) {
    var addressParts = new Array();
    if (location.address) {
        addressParts = [location.address.addressLine,
            location.address.locality,
            location.address.adminDistrict,
            location.address.postalCode,
            location.address.countryRegion];
    }
    return addressParts.filter(function (i) { return i; }).join(separator);
}
exports.getFormattedAddressFromLocation = getFormattedAddressFromLocation;
