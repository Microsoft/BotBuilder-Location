"use strict";
var common = require("../common");
var consts_1 = require("../consts");
var place_1 = require("../place");
function register(library) {
    library.dialog('choose-location-dialog', createDialog());
}
exports.register = register;
function createDialog() {
    return common.createBaseDialog()
        .matches(/^other$/i, function (session) {
        session.endDialogWithResult({ response: { place: new place_1.Place() } });
    })
        .onBegin(function (session, args) {
        session.dialogData.locations = args.locations;
        session.send(consts_1.Strings.MultipleResultsFound).sendBatch();
    })
        .onDefault(function (session) {
        var numberExp = /[+-]?(?:\d+\.?\d*|\d*\.?\d+)/;
        var match = numberExp.exec(session.message.text);
        if (match) {
            var currentNumber = Number(match[0]);
            if (currentNumber > 0 && currentNumber <= session.dialogData.locations.length) {
                session.endDialogWithResult({ response: { place: session.dialogData.locations[currentNumber - 1] } });
                return;
            }
        }
        session.send(consts_1.Strings.InvalidLocationResponse).sendBatch();
    });
}
