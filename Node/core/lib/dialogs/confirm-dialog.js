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
        var confirmationPrompt = args.confirmationPrompt;
        session.send(confirmationPrompt).sendBatch();
    })
        .onDefault(function (session) {
        var message = parseBoolean(session.message.text);
        if (typeof message == 'boolean') {
            var result;
            if (message == true) {
                result = { response: { confirmed: true } };
            }
            else {
                result = { response: { confirmed: false } };
            }
            session.endDialogWithResult(result);
            return;
        }
        session.send(consts_1.Strings.InvalidYesNo).sendBatch();
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
