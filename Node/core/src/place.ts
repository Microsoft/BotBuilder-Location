import * as builder from 'botbuilder';

export class Place {
    type: string;
    name: string;
    formattedAddress: string;
    country: string;
    locality: string;
    postalCode: string;
    region: string;
    streetAddress: string;
    geo: Geo;
}

export class Geo {
    latitude: string;
    longitude: string;
}