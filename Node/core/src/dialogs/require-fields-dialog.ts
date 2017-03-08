import * as common from '../common';
import { Strings } from '../consts';
import { Session, RecognizeMode, Library } from 'botbuilder';

export enum LocationRequiredFields {
    none = 0,
    streetAddress = 1 << 0,
    locality = 1 << 1,
    region = 1 << 2,
    postalCode = 1 << 3,
    country = 1 << 4,
}

export function register(library: Library): void {
    library.dialog('require-fields-dialog', createDialog());
}

const fields: Array<any> = [
    { name: "addressLine", prompt: Strings.StreetAddress, flag: LocationRequiredFields.streetAddress },
    { name: "locality", prompt: Strings.Locality, flag: LocationRequiredFields.locality },
    { name: "adminDistrict", prompt: Strings.Region, flag: LocationRequiredFields.region },
    { name: "postalCode", prompt: Strings.PostalCode, flag: LocationRequiredFields.postalCode },
    { name: "countryRegion", prompt: Strings.Country, flag: LocationRequiredFields.country },
];

function createDialog() {
    return common.createBaseDialog({ recognizeMode: RecognizeMode.onBegin })
        .onBegin((session, args, next) => {
            if (args.place.address) {
                args.place.address.formattedAddress = common.getFormattedAddressFromLocation( args.place, session.gettext(Strings.AddressSeparator));
            }
        
            if (args.requiredFields) {
                session.dialogData.place = args.place;
                session.dialogData.index = -1;
                session.dialogData.requiredFieldsFlag = args.requiredFields;
                next();
            } else {
                session.endDialogWithResult({ response: { place: args.place } });
            }
        })
        .onDefault((session) => {
            var index = session.dialogData.index;

            if (index >= 0) {
                if (!session.message.text) {
                    return;
                }

                session.dialogData.lastInput = session.message.text;
                session.dialogData.place.address[fields[index].name] = session.message.text;
                session.dialogData.place.address.formattedAddress = common.getFormattedAddressFromLocation( session.dialogData.place, session.gettext(Strings.AddressSeparator));
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
            } else {
                session.sendBatch();
            }
        });
}

function completeFieldIfMissing(session: Session, field: any) {
    if ((field.flag & session.dialogData.requiredFieldsFlag) && !session.dialogData.place.address[field.name]) {

        var prefix: string = "";
        var prompt: string = "";
        if (typeof session.dialogData.lastInput === "undefined") {
            var formattedAddress: string = common.getFormattedAddressFromLocation(session.dialogData.place, session.gettext(Strings.AddressSeparator));
            if (formattedAddress) {
                prefix = session.gettext(Strings.AskForPrefix, formattedAddress);
                prompt = session.gettext(Strings.AskForTemplate, session.gettext(field.prompt));
            }
            else {
                prompt = session.gettext(Strings.AskForEmptyAddressTemplate, session.gettext(field.prompt));
            }
        }
        else {
            prefix = session.gettext(Strings.AskForPrefix, session.dialogData.lastInput);
            prompt = session.gettext(Strings.AskForTemplate, session.gettext(field.prompt));
        }

        session.send(prefix + prompt);
        return true;
    }

    return false;
}