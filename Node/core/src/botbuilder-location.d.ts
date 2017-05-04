import * as builder from "botbuilder";
import { RawLocation } from "./rawLocation";

//=============================================================================
//
// INTERFACES
//
//=============================================================================

/**
 * Options for customizing the location dialog
 */
export interface ILocationPromptOptions {

    /**
     * The prompt shown to the user when the location control is initiated.
     */
    prompt: string;

    /**
     * Use this option if you want the location dialog to skip the initial prompt suffix
     */
    skipPromptSuffix?: boolean;

    /**
     * Required location fields to be collected by the control.
     */
    requiredFields?: LocationRequiredFields;

    /**
     * Use this option if you want the location dialog to skip the final confirmation before returning the location
     */
    skipConfirmationAsk?:boolean;

    /**
     * Use this option if you want provide a different string for the final confirmation before returning the location
     */
    confirmationAsk?: string;

    /**
     * Boolean to indicate if the control will use FB Messenger's location picker GUI dialog. It does not have any effect on other messaging channels.
     */
    useNativeControl?: boolean,

    /**
     * Boolean to indicate if the control will try to reverse geocode the lat/long coordinates returned by FB Messenger's location picker GUI dialog. It does not have any effect on other messaging channels.
     */
    reverseGeocode?: boolean,

    /**
     * Use this option if you do not want the control to offer keeping track of the user's favorite locations.
     */
    skipFavorites?: boolean
}

//=============================================================================
//
// ENUMS
//
//=============================================================================

/**
 * Determines the required fields.
 */
export enum LocationRequiredFields {

    /** No required fields.*/
    none = 0,

    /** The street address. Example: "One Microsoft Way" */
    streetAddress = 1 << 0,

    /** The city or locality. Example: "Redmond" */
    locality = 1 << 1,

    /** The state or region. Example: "WA" */
    region = 1 << 2,

    /** The postal code. Example: "98052" */
    postalCode = 1 << 3,

    /** The country. Example: "United States" */
    country = 1 << 4,
}

//=============================================================================
//
// Classes
//
//=============================================================================

/** Contains the address information */
export class Place {
    type: string;
    name: string;
    formattedAddress: string;

    /** The country. Example: "United States" */
    country: string;

    /** The city or locality. Example: "Redmond" */
    locality: string;

    /** The postal code. Example: "98052" */
    postalCode: string;

    /** The state or region. Example: "WA" */
    region: string;

    /** The street address. Example: "One Microsoft Way" */
    streetAddress: string;

    /** The geoCoordinates */
    geo: Geo;
}

/** Contains the latitude and longitude */
export class Geo {
    latitude: string;
    longitude: string;
}

//=============================================================================
//
// Functions
//
//=============================================================================

/**
 * Creates the botbuilder-location library to be added to the bot.
 * @param apiKey The Bing Maps API Key.
 */
export function createLibrary(apiKey: string): builder.Library;

/**
 *  Begin the location dialog.
 * @param session Session object for the current conversation.
 * @param options Options for customizing the location dialog.
 */
export function getLocation(session: builder.Session, options: ILocationPromptOptions) : builder.Session;

/**
 * Gets a formatted address string.
 * @param location object containing the address.
 * @param separator The string separating the address parts.  
 */
export function getFormattedAddressFromLocation(location: RawLocation, separator: string): string;
