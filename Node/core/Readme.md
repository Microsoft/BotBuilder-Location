# Bing Location Control for Microsoft Bot Framework

## Overview
The following examples demonstrate how to use the Bing location control to collect and validate the user's location with your Microsoft Bot Framework bot in Node.js.

## Prerequisites
To start using the control, you need to obtain a Bing Maps API subscription key. You can sign up to get a free key with up to 10,000 transactions per month in [Azure Portal](https://azure.microsoft.com/en-us/marketplace/partners/bingmaps/mapapis/).

## Code Highlights

### Usage
Install the BotBuilder and Restify modules using npm.

    npm install --save botbuilder-location
       
    var locationDialog = require('botbuilder-location');

#### Calling the control with default parameters
The example calls the location dialog with default parameters and a custom prompt message asking the user to provide an address. 

````JavaScript
locationDialog.getLocation(session,
 { prompt: "Where should I ship your order? Type or say and address." });
````

#### Using Messenger's native location picker widget
FB Messenger supports a native GUI widget to let the user select a location. If you prefer to use Messenger's location widget, pass this option in the location control's constructor. 

````JavaScript
var options = {
    prompt: "Where should I ship your order? Type or say and address.",
    useNativeControl: true
};
locationDialog.getLocation(session, options);
````

FB Messenger by default returns only the lat/long coordinates for the location selected in the widget. You can additionally use the following option to have Bing reverse geo-code the returned coordinates and automatically fill in the remaining address fields. 

````JavaScript
var options = {
    prompt: "Where should I ship your order? Type or say and address.",
    useNativeControl: true,
    reverseGeocode: true
};
locationDialog.getLocation(session, options);
````

Note: Due to the inheritably lack of accuracy of reverse geo-coders, we only use it to capture: `PostalAddress.Locality, PostalAddress.Region PostalAddress.Country and PostalAddress.PostalCode`.

#### Specifying required fields 
You can specify required location fields that need to be collected by the control. If the user does not provide any of the required fields, the control will prompt the user to fill them in. The example specifies that the street address and postal (zip) code are required. 

````JavaScript
var options = {
    prompt: "Where should I ship your order? Type or say and address.",
    requiredFields:
        locationDialog.LocationRequiredFields.streetAddress |
        locationDialog.LocationRequiredFields.postalCode
}
locationDialog.getLocation(session, options);
````

#### Handling returned location
The following examples shows how you can leverage the location object data returned by the location control.

````JavaScript
locationDialog.create(bot);

bot.dialog("/", [
    function (session) {
        locationDialog.getLocation(session, {
            prompt: "Where should I ship your order? Type or say and address.",
            requiredFields: 
                locationDialog.LocationRequiredFields.streetAddress |
                locationDialog.LocationRequiredFields.locality |
                locationDialog.LocationRequiredFields.region |
                locationDialog.LocationRequiredFields.postalCode |
                locationDialog.LocationRequiredFields.country
        });
    },
    function (session, results) {
        if (results.response) {
            var place = results.response;
            session.send(place.streetAddress + ", " + place.locality + ", " + place.region + ", " + place.country + " (" + place.postalCode + ")");
        }
        else {
            session.send("OK, I won't be shipping it");
        }
    }
]);
````

## Location Dialog Options

````JavaScript
export interface ILocationPromptOptions {
    prompt: string;
    requiredFields?: requiredFieldsDialog.LocationRequiredFields;
    useNativeControl?: boolean,
    reverseGeocode?: boolean
}
````

#### Parameters

*prompt*    
The prompt posted to the user when dialog starts. 

*requiredFields*    
Determines the required fields. The required fields are: streetAddress, locality, region, postalCode, country

*useNativeControl*    
Some of the channels (e.g. Facebook) has a built in location widget. Use this option to indicate if you want the LocationDialog to use it when available.

*reverseGeocode*    
Use this option if you want the location dialog to reverse lookup geo-coordinates before returning. 
This can be useful if you depend on the channel location service or native control to get user location
but still want the control to return to you a full address.

## Sample
You can find a sample bot that uses the Bing location control in the [Sample](../sample/app.js) directory. 

