# Bing Location Control for Microsoft Bot Framework

## Overview
The following examples demonstrate how to use the Bing location control to collect and validate the user's location with your Microsoft Bot Framework bot in Node.js.

## Prerequisites
To start using the control, you need to obtain a Bing Maps API subscription key. You can sign up to get a free key with up to 10,000 transactions per month in [Azure Portal](https://azure.microsoft.com/en-us/marketplace/partners/bingmaps/mapapis/).

## Code Highlights

### Installation
Install the botbuilder-location module using npm.

    npm install --save botbuilder-location
       
### Usage

Add the botbuilder-location library to your bot.

    var locationDialog = require('botbuilder-location');
    bot.library(locationDialog.createLibrary("BING_MAPS_API_KEY"));

### Calling the location control with default parameters
The example initiates the location control with default parameters, which returns a custom prompt message asking the user to provide an address. 

````JavaScript
locationDialog.getLocation(session,
 { prompt: "Where should I ship your order? Type or say an address." });
````

### Using FB Messenger's location picker GUI dialog 
FB Messenger supports a location picker GUI dialog to let the user select an address. If you prefer to use FB Messenger's native dialog,  pass the `useNativeControl: true` option.

````JavaScript
var options = {
    prompt: "Where should I ship your order? Type or say an address.",
    useNativeControl: true
};
locationDialog.getLocation(session, options);
````

FB Messenger by default returns only the lat/long coordinates for any address selected via the location picker GUI dialog. You can additionally use the `reverseGeocode: true` option to have Bing reverse geocode the returned coordinates and automatically fill in the remaining address fields. 

````JavaScript
var options = {
    prompt: "Where should I ship your order? Type or say an address.",
    useNativeControl: true,
    reverseGeocode: true
};
locationDialog.getLocation(session, options);
````

**Note**: Reverse geocoding is an inherently imprecise operation. For that reason, when the reverse geocode option is selected, the location control will collect only the `locality`, `region`, `country` and `postalCode` fields and ask the user to provide the desired street address manually. 

### Specifying required fields 
You can specify required location fields that need to be collected by the control. If the user does not provide values for one or more required fields, the control will prompt him to fill them in. You can specify required fields by passing them in the `requiredFields` parameter. The example specifies the street address and postal (zip) code as required. 

````JavaScript
var options = {
    prompt: "Where should I ship your order? Type or say an address.",
    requiredFields:
        locationDialog.LocationRequiredFields.streetAddress |
        locationDialog.LocationRequiredFields.postalCode
}
locationDialog.getLocation(session, options);
````

### Handling returned location
The following example shows how you can leverage the location object returned by the location control in your bot code. 

````JavaScript
locationDialog.create(bot);

bot.library(locationDialog.createLibrary(process.env.BING_MAPS_API_KEY));

bot.dialog("/", [
    function (session) {
        locationDialog.getLocation(session, {
            prompt: "Where should I ship your order? Type or say an address.",
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

## Location Control Options
The following options are supported today by the location control. 

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
The prompt shown  to the user when the location control is initiated. 

*requiredFields*    
Required location fields to be collected by the control. Available options include: streetAddress, locality, region, postalCode, country

*useNativeControl*    
Boolean to indicate if the control will use FB Messenger's location picker GUI dialog. It does not have any effect on other messaging channels. 

*reverseGeocode*    
Boolean to indicate if the control will try to reverse geocode the lat/long coordinates returned by FB Messenger's location picker GUI dialog. It does not have any effect on other messaging channels.

## Sample Bot
You can find a sample bot that uses the Bing location control in the [Sample](sample/) directory. Please note that you need to obtain a Bing Maps API subscription key from [Azure Portal](https://azure.microsoft.com/en-us/marketplace/partners/bingmaps/mapapis/) to run the sample.

## More Information
Read these resources for more information about the Microsoft Bot Framework, Bot Builder SDK and Bing Maps REST Services:

* [Microsoft Bot Framework Overview](https://docs.botframework.com/en-us/)
* [Microsoft Bot Framework Bot Builder SDK](https://github.com/Microsoft/BotBuilder)
* [Microsoft Bot Framework Samples](https://github.com/Microsoft/BotBuilder-Samples)
* [Bing Maps REST Services Documentation](https://msdn.microsoft.com/en-us/library/ff701713.aspx)

