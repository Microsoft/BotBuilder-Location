# Microsoft Bot Builder Location Control

This dialog provides a location control, powered by Bing's Maps REST Services, to make the process of getting the user's location easy and consistent across all messaging channels supported by the bot framework.

## Usage
Get the BotBuilder and Restify modules using npm.

    npm install --save botbuilder-location

From your bot, use the location control
        
    var locationDialog = require('botbuilder-location');

You can refer to [this sample](../sample/app.js) that demonstrates usage.

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

