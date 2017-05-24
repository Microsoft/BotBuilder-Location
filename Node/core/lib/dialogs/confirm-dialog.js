"use strict";
exports.__esModule = true;
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
        var message = parseBoolean(session, session.message.text);
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
function parseBoolean(session, input) {
    input = input.trim();
    var yesExp = new RegExp(session.gettext(consts_1.Strings.YesExp), 'i');
    var noExp = new RegExp(session.gettext(consts_1.Strings.NoExp), 'i');
    if (yesExp.test(input)) {
        return true;
    }
    else if (noExp.test(input)) {
        return false;
    }
    return undefined;
}
