"use strict";
exports.__esModule = true;
var consts_1 = require("../consts");
function register(library) {
    library.dialog('confirm-single-location-dialog', createDialog());
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
                // User did confirm the single location offered
                session.endDialogWithResult({ response: { place: session.dialogData.locations[0] } });
            }
            else {
                // User said no
                session.endDialogWithResult({ response: { reset: true } });
            }
        }
    ];
}
