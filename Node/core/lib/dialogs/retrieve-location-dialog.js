"use strict";
var resolveBingLocationDialog = require("./resolve-bing-location-dialog");
var retrieveFacebookLocationDialog = require("./retrieve-facebook-location-dialog");
function register(library, apiKey) {
    library.dialog('retrieve-location-dialog', createDialog());
    resolveBingLocationDialog.register(library, apiKey);
    retrieveFacebookLocationDialog.register(library, apiKey);
}
exports.register = register;
function createDialog() {
    return [
        function (session, args) {
            session.dialogData.args = args;
            if (args.useNativeControl && session.message.address.channelId == 'facebook') {
                session.beginDialog('retrieve-facebook-location-dialog', args);
            }
            else {
                session.beginDialog('resolve-bing-location-dialog', args);
            }
        },
        function (session, results, next) {
            if (results.response && results.response.place) {
                session.beginDialog('require-fields-dialog', {
                    place: results.response.place,
                    requiredFields: session.dialogData.args.requiredFields
                });
            }
            else {
                next(results);
            }
        }
    ];
}
