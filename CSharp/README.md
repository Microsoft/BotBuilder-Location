# Bing Location Control for Microsoft Bot Framework

## Overview
The following examples demonstrate how to use the Bing location control to collect and validate the user's location with your Microsoft Bot Framework bot in C#. 

## Prerequisites
To start using the control, you need to obtain a Bing Maps API subscription key. You can sign up to get a free key with up to 10,000 transactions per month in [Azure Portal](https://azure.microsoft.com/en-us/marketplace/partners/bingmaps/mapapis/).

## Code Highlights

### Usage
Import the BotBuilder-Location library from nuGet and add the following namespace. 

````C#
using Microsoft.Bot.Builder.Location;
````

### Calling the location control with default parameters
The example initiates the location control with default parameters, which returns a custom prompt message asking the user to provide an address. 

````C#
var apiKey = WebConfigurationManager.AppSettings["BingMapsApiKey"];
var prompt = "Where should I ship your order? Type or say an address.";
var locationDialog = new LocationDialog(apiKey, message.ChannelId, prompt);
context.Call(locationDialog, (dialogContext, result) => {...});
````

### Using FB Messenger's location picker GUI dialog 
FB Messenger supports a location picker GUI dialog to let the user select an address. If you prefer to use FB Messenger's native dialog,  pass the `LocationOptions.UseNativeControl` option in the location control's constructor.  

````C#
var apiKey = WebConfigurationManager.AppSettings["BingMapsApiKey"];
var prompt = "Where should I ship your order? Type or say an address.";
var locationDialog = new LocationDialog(apiKey, message.ChannelId, prompt, LocationOptions.UseNativeControl);
context.Call(locationDialog, (dialogContext, result) => {...});
````

FB Messenger by default returns only the lat/long coordinates for any address selected via the location picker GUI dialog. You can additionally use the `LocationOptions.ReverseGeocode` option to have Bing reverse geocode the returned coordinates and automatically fill in the remaining address fields. 

````C#
var apiKey = WebConfigurationManager.AppSettings["BingMapsApiKey"];
var prompt = "Where should I ship your order? Type or say an address.";
var locationDialog = new LocationDialog(apiKey, message.ChannelId, prompt, LocationOptions.UseNativeControl | LocationOptions.ReverseGeocode);
context.Call(locationDialog, (dialogContext, result) => {...});
````

**Note**: Reverse geocoding is an inherently imprecise operation. For that reason, when the reverse geocode option is selected, the location control will collect only the `PostalAddress.Locality`, `PostalAddress.Region`, `PostalAddress.Country` and `PostalAddress.PostalCode` fields and ask the user to provide the desired street address manually. 

### Specifying required fields 
You can specify required location fields that need to be collected by the control. If the user does not provide values for one or more required fields, the control will prompt him to fill them in. You can specify required fields by passing them in the location control's constructor using the `LocationRequiredFields` enumeration. The example specifies the street address and postal (zip) code as required. 

````C#
var apiKey = WebConfigurationManager.AppSettings["BingMapsApiKey"];
var prompt = "Where should I ship your order? Type or say an address.";
var locationDialog = new LocationDialog(apiKey, message.ChannelId, prompt, LocationOptions.None, LocationRequiredFields.StreetAddress | LocationRequiredFields.PostalCode);
context.Call(locationDialog, (dialogContext, result) => {...});
````

### Handling returned location
The following example shows how you can leverage the location object returned by the location control in your bot code. 

````C#
var apiKey = WebConfigurationManager.AppSettings["BingMapsApiKey"];
var prompt = "Where should I ship your order? Type or say an address.";
var locationDialog = new LocationDialog(apiKey, message.ChannelId, prompt, LocationOptions.None, LocationRequiredFields.StreetAddress | LocationRequiredFields.PostalCode);
context.Call(locationDialog, (context, result) => {
    Place place = await result;
    if (place != null)
    {
        var address = place.GetPostalAddress();
        string name = address != null ?
            $"{address.StreetAddress}, {address.Locality}, {address.Region}, {address.Country} ({address.PostalCode})" :
            "the pinned location";
        await context.PostAsync($"OK, I will ship it to {name}");
    }
    else
    {
        await context.PostAsync("OK, cancelled");
    }
}
````

## Sample Bot
You can find a sample bot that uses the Bing location control in the [BotBuilderLocation.Sample](BotBuilderLocation.Sample) directory. Please note that you need to obtain a Bing Maps API subscription key from [Azure Portal](https://azure.microsoft.com/en-us/marketplace/partners/bingmaps/mapapis/) to run the sample.

## More Information
Read these resources for more information about the Microsoft Bot Framework, Bot Builder SDK and Bing Maps REST Services:

* [Microsoft Bot Framework Overview](https://docs.botframework.com/en-us/)
* [Microsoft Bot Framework Bot Builder SDK](https://github.com/Microsoft/BotBuilder)
* [Microsoft Bot Framework Samples](https://github.com/Microsoft/BotBuilder-Samples)
* [Bing Maps REST Services Documentation](https://msdn.microsoft.com/en-us/library/ff701713.aspx)
