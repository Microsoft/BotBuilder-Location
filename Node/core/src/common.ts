import { Session, IntentDialog } from 'botbuilder';
import { Strings } from './consts';
import { Place, Geo } from './place';
import { RawLocation } from './rawLocation'

export function createBaseDialog(options?: any): IntentDialog {
    return new IntentDialog(options)
        .matches(/^cancel$/i, function (session: Session) {
            session.send(Strings.CancelPrompt)
            session.endDialogWithResult({ response: { cancel: true } });
            return
        })
        .matches(/^help$/i, function (session: Session) {
            session.send(Strings.HelpMessage).sendBatch();
        })
        .matches(/^reset$/i, function (session: Session) {
            session.endDialogWithResult({ response: { reset: true } });
            return;
        });
}

export function processLocation(location: RawLocation): Place {
    var place: Place = new Place();
    place.type = location.entityType;
    place.name = location.name;

    if (location.address) {
        place.formattedAddress = location.address.formattedAddress;
        place.country = location.address.countryRegion;
        place.locality = location.address.locality;
        place.postalCode = location.address.postalCode;
        place.region = location.address.adminDistrict;
        place.streetAddress = location.address.addressLine;
    }

    if (location.point && location.point.coordinates && location.point.coordinates.length == 2) {
        place.geo = new Geo();
        place.geo.latitude = location.point.coordinates[0].toString();
        place.geo.longitude = location.point.coordinates[1].toString();
    }

    return place;
}

export function getFormattedAddressFromLocation(location: RawLocation, separator: string): string {
    let addressParts: Array<string> = new Array();

    if (location.address) {
        addressParts = [ location.address.addressLine,
                         location.address.locality,
                         location.address.adminDistrict,
                         location.address.postalCode,
                         location.address.countryRegion];
    }

    return addressParts.filter(i => i).join(separator);
}