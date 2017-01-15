"use strict";
var common = require("../common");
var consts_1 = require("../consts");
function register(library) {
    library.dialog('confirm-dialog', createDialog());
}
exports.register = register;
function createDialog() {
    return common.createBaseDialog()
        .onBegin(function (session, args) {
        session.dialogData.locations = args.locations;
        session.send(consts_1.Strings.SingleResultFound).sendBatch();
    })
        .onDefault(function (session) {
        var message = parseBoolean(session.message.text);
        if (typeof message == 'boolean') {
            var result;
            if (message == true) {
                var place = common.processLocation(session.dialogData.locations[0], true);
                result = { response: { place: place } };
            }
            else {
                result = { response: { reset: true } };
            }
            session.endDialogWithResult(result);
            return;
        }
        session.send(consts_1.Strings.InvalidLocationResponse).sendBatch();
    });
}
function parseBoolean(input) {
    input = input.trim();
    var yesExp = /^(y|yes|yep|sure|ok|true)/i;
    var noExp = /^(n|no|nope|not|false)/i;
    if (yesExp.test(input)) {
        return true;
    }
    else if (noExp.test(input)) {
        return false;
    }
    return undefined;
}
