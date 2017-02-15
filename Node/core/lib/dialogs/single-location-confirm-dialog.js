"use strict";
var common = require("../common");
var consts_1 = require("../consts");
function register(library) {
    library.dialog('single-location-confirm-dialog', createDialog());
}
exports.register = register;
function createDialog() {
    return [
        function (session, args) {
            session.dialogData.locations = args.locations;
            session.beginDialog('confirm-dialog', { confirmationPrompt: session.gettext(consts_1.Strings.SingleResultFound) });
        },
        function (session, results, next) {
            if (results.response && results.response.confirmed) {
                var place = common.processLocation(session.dialogData.locations[0], true);
                session.endDialogWithResult({ response: { place: place } });
            }
            else {
                session.endDialogWithResult({ response: { reset: true } });
            }
        }
    ];
}
