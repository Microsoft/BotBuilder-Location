## Overview
The following examples demonstrate how to use the Bing location control to collect and validate the user's  location with your Microsoft Bot Framework Node.js bot. 

## Prerequisites
To start using the control, you need to obtain a Bing Maps API subscription key. You can sign up to get a free key with up to 10,000 transactions per month in [Azure Portal](https://azure.microsoft.com/en-us/marketplace/partners/bingmaps/mapapis/).

## Code Highlights

#### Usage
Get the BotBuilder and Restify modules using npm.

    npm install --save botbuilder-location

From your bot, use the location control
        
    var locationDialog = require('botbuilder-location');


## Examples

The following examples demonstrate how to use LocationDialog to achieve different scenarios: 

#### Calling LocationDialog with default parameters 

````JavaScript
locationDialog.getLocation(session,
 { prompt: "Hi, where would you like me to ship to your widget?" });
````

#### Using channel's native location widget if available (e.g. Facebook) 

````JavaScript
var options = {
    prompt: "Hi, where would you like me to ship to your widget?",
    useNativeControl: true
};
locationDialog.getLocation(session, options);
````

#### Using channel's native location widget if available (e.g. Facebook) and having Bing try to reverse geo-code the provided coordinates to automatically fill-in address fields.

````JavaScript
var options = {
    prompt: "Hi, where would you like me to ship to your widget?",
    useNativeControl: true,
    reverseGeocode: true
};
locationDialog.getLocation(session, options);
````

#### Specifying required fields to have the dialog prompt the user for if missing from address.
````JavaScript
var options = {
    prompt: "Hi, where would you like me to ship to your widget?",
    requiredFields:
        locationDialog.LocationRequiredFields.streetAddress |
        locationDialog.LocationRequiredFields.postalCode
}
locationDialog.getLocation(session, options);
````

#### Example on how to handle the returned place. For more info, see [place](src/place.ts)
````JavaScript
locationDialog.create(bot);

bot.dialog("/", [
    function (session) {
        locationDialog.getLocation(session, {
            prompt: "Hi, where would you like me to ship to your widget?",
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

