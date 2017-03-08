export class RawLocation {
    address: Address;
    bbox: Array<number>;
    confidence: string;
    entityType: string;
    name: string;
    point: Point;
}

export class Address {
    addressLine: string;
    adminDistrict: string;
    adminDistrict2: string;
    countryRegion: string; 
    formattedAddress: string;
    locality: string;
    postalCode: string;
}

class Point {
    coordinates: Array<number>;
    calculationMethod: string;
}