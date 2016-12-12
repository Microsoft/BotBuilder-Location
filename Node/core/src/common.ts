import { Session, IntentDialog } from 'botbuilder';
import { Strings } from './consts';
import { Place, Geo } from './place';

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

export function processLocation(location: any, includeStreetAddress: boolean): Place {
    var place: Place = new Place();
    place.type = location.entityType;
    place.name = location.name;

    if (location.address) {
        place.formattedAddress = location.address.formattedAddress;
        place.country = location.address.countryRegion;
        place.locality = location.address.locality;
        place.postalCode = location.address.postalCode;
        place.region = location.address.adminDistrict;
        if (includeStreetAddress) {
            place.streetAddress = location.address.addressLine;
        }
    }

    if (location.point && location.point.coordinates && location.point.coordinates.length == 2) {
        place.geo = new Geo();
        place.geo.latitude = location.point.coordinates[0];
        place.geo.longitude = location.point.coordinates[1];
    }

    return place;
}

export function buildPlaceFromGeo(latitude: string, longitude: string) {
    var place = new Place();
    place.geo = new Geo();
    place.geo.latitude = latitude;
    place.geo.longitude = longitude;

    return place;
}

export function getFormattedAddressFromPlace(place: Place, separator: string): string {
    var addressParts: Array<any> = new Array();

    if (place.streetAddress) {
        addressParts.push(place.streetAddress);
    }

    if (place.locality) {
        addressParts.push(place.locality);
    }

    if (place.region) {
        addressParts.push(place.region);
    }

    if (place.postalCode) {
        addressParts.push(place.postalCode);
    }

    if (place.country) {
        addressParts.push(place.country);
    }
    
    return addressParts.join(separator);
}