"use strict";
var common = require("../common");
var consts_1 = require("../consts");
var botbuilder_1 = require("botbuilder");
var LocationRequiredFields;
(function (LocationRequiredFields) {
    LocationRequiredFields[LocationRequiredFields["none"] = 0] = "none";
    LocationRequiredFields[LocationRequiredFields["streetAddress"] = 1] = "streetAddress";
    LocationRequiredFields[LocationRequiredFields["locality"] = 2] = "locality";
    LocationRequiredFields[LocationRequiredFields["region"] = 4] = "region";
    LocationRequiredFields[LocationRequiredFields["postalCode"] = 8] = "postalCode";
    LocationRequiredFields[LocationRequiredFields["country"] = 16] = "country";
})(LocationRequiredFields = exports.LocationRequiredFields || (exports.LocationRequiredFields = {}));
function register(library) {
    library.dialog('require-fields-dialog', createDialog());
}
exports.register = register;
var fields = [
    { name: "addressLine", prompt: consts_1.Strings.StreetAddress, flag: LocationRequiredFields.streetAddress },
    { name: "locality", prompt: consts_1.Strings.Locality, flag: LocationRequiredFields.locality },
    { name: "adminDistrict", prompt: consts_1.Strings.Region, flag: LocationRequiredFields.region },
    { name: "postalCode", prompt: consts_1.Strings.PostalCode, flag: LocationRequiredFields.postalCode },
    { name: "countryRegion", prompt: consts_1.Strings.Country, flag: LocationRequiredFields.country },
];
function createDialog() {
    return common.createBaseDialog({ recognizeMode: botbuilder_1.RecognizeMode.onBegin })
        .onBegin(function (session, args, next) {
        if (args.place.address) {
            args.place.address.formattedAddress = common.getFormattedAddressFromLocation(args.place, session.gettext(consts_1.Strings.AddressSeparator));
        }
        if (args.requiredFields) {
            session.dialogData.place = args.place;
            session.dialogData.index = -1;
            session.dialogData.requiredFieldsFlag = args.requiredFields;
            next();
        }
        else {
            session.endDialogWithResult({ response: { place: args.place } });
        }
    })
        .onDefault(function (session) {
        var index = session.dialogData.index;
        if (index >= 0) {
            if (!session.message.text) {
                return;
            }
            session.dialogData.lastInput = session.message.text;
            session.dialogData.place.address[fields[index].name] = session.message.text;
            session.dialogData.place.address.formattedAddress = common.getFormattedAddressFromLocation(session.dialogData.place, session.gettext(consts_1.Strings.AddressSeparator));
        }
        index++;
        while (index < fields.length) {
            if (completeFieldIfMissing(session, fields[index])) {
                break;
            }
            index++;
        }
        session.dialogData.index = index;
        if (index >= fields.length) {
            session.endDialogWithResult({ response: { place: session.dialogData.place } });
        }
        else {
            session.sendBatch();
        }
    });
}
function completeFieldIfMissing(session, field) {
    if ((field.flag & session.dialogData.requiredFieldsFlag) && !session.dialogData.place.address[field.name]) {
        var prefix = "";
        var prompt = "";
        if (typeof session.dialogData.lastInput === "undefined") {
            var formattedAddress = common.getFormattedAddressFromLocation(session.dialogData.place, session.gettext(consts_1.Strings.AddressSeparator));
            if (formattedAddress) {
                prefix = session.gettext(consts_1.Strings.AskForPrefix, formattedAddress);
                prompt = session.gettext(consts_1.Strings.AskForTemplate, session.gettext(field.prompt));
            }
            else {
                prompt = session.gettext(consts_1.Strings.AskForEmptyAddressTemplate, session.gettext(field.prompt));
            }
        }
        else {
            prefix = session.gettext(consts_1.Strings.AskForPrefix, session.dialogData.lastInput);
            prompt = session.gettext(consts_1.Strings.AskForTemplate, session.gettext(field.prompt));
        }
        session.send(prefix + prompt);
        return true;
    }
    return false;
}
