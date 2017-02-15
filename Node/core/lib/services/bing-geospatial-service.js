"use strict";
var rp = require("request-promise");
var sprintf_js_1 = require("sprintf-js");
var formAugmentation = "&form=BTCTRL";
var findLocationByQueryUrl = "https://dev.virtualearth.net/REST/v1/Locations?" + formAugmentation;
var findLocationByPointUrl = "https://dev.virtualearth.net/REST/v1/Locations/%1$s,%2$s?" + formAugmentation;
var findImageByPointUrl = "https://dev.virtualearth.net/REST/V1/Imagery/Map/Road/%1$s,%2$s/15?mapSize=500,280&pp=%1$s,%2$s;1;%3$s&dpi=1&logo=always" + formAugmentation;
var findImageByBBoxUrl = "https://dev.virtualearth.net/REST/V1/Imagery/Map/Road?mapArea=%1$s,%2$s,%3$s,%4$s&mapSize=500,280&pp=%5$s,%6$s;1;%7$s&dpi=1&logo=always" + formAugmentation;
function getLocationByQuery(apiKey, address) {
    var url = addKeyToUrl(findLocationByQueryUrl, apiKey) + "&q=" + encodeURIComponent(address);
    return getLocation(url);
}
exports.getLocationByQuery = getLocationByQuery;
function getLocationByPoint(apiKey, latitude, longitude) {
    var url = sprintf_js_1.sprintf(findLocationByPointUrl, latitude, longitude);
    url = addKeyToUrl(url, apiKey) + "&q=";
    return getLocation(url);
}
exports.getLocationByPoint = getLocationByPoint;
function GetLocationMapImageUrl(apiKey, location, index) {
    if (location && location.point && location.point.coordinates && location.point.coordinates.length == 2) {
        var point = location.point;
        var url;
        var sIndex = typeof index === "undefined" ? "" : index.toString();
        if (location.bbox && location.bbox.length == 4) {
            url = sprintf_js_1.sprintf(findImageByBBoxUrl, location.bbox[0], location.bbox[1], location.bbox[2], location.bbox[3], point.coordinates[0], point.coordinates[1], sIndex);
        }
        else {
            url = sprintf_js_1.sprintf(findImageByPointUrl, point.coordinates[0], point.coordinates[1], sIndex);
        }
        url = addKeyToUrl(url, apiKey);
        return url;
    }
    throw "Invalid Location Format: " + location;
}
exports.GetLocationMapImageUrl = GetLocationMapImageUrl;
function getLocation(url) {
    var requestData = {
        url: url,
        json: true
    };
    return rp(requestData)
        .then(function (body) {
        if (body && body.resourceSets && body.resourceSets[0] && body.resourceSets[0].resources) {
            return body.resourceSets[0].resources;
        }
        else {
            throw ("Invalid Api Response");
        }
    });
}
function addKeyToUrl(url, apiKey) {
    return url + "&key=" + apiKey;
}
