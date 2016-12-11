## Overview
The following examples demonstrate how to use the Bing location control to collect and validate the user's  location with your Microsoft Bot Framework C# bot. 

## Prerequisites
To start using the control, you need to obtain a Bing Maps API subscription key. You can sign up to get a free key with up to 10,000 transactions per month in [Azure Portal](https://azure.microsoft.com/en-us/marketplace/partners/bingmaps/mapapis/).

## Code Highlights

#### Usage
Import the BotBuilder-Location library from nuGet and add the following required namespace. 

````C#
using Microsoft.Bot.Builder.Location;
````

#### Calling the control with default parameters
The example calls the location dialog with default parameters and a custom prompt message asking the user to provide an address. 

````C#
var apiKey = WebConfigurationManager.AppSettings["BingMapsApiKey"];
var prompt = "Where should I ship your order? Type or say and address.";
var locationDialog = new LocationDialog(apiKey, message.ChannelId, prompt);
context.Call(locationDialog, (dialogContext, result) => {...});
````

#### Using Messenger's native location picker widget
FB Messenger supports a native GUI widget to let the user select a location. If you prefer to use Messenger's location widget, pass this option in the location control's constructor. 

````C#
var apiKey = WebConfigurationManager.AppSettings["BingMapsApiKey"];
var prompt = "Where should I ship your order? Type or say and address.";
var locationDialog = new LocationDialog(apiKey, message.ChannelId, prompt, LocationOptions.UseNativeControl);
context.Call(locationDialog, (dialogContext, result) => {...});
````

FB Messenger by default returns only the lat/long coordinates for the location selected in the widget. You can additionally use the following option to have Bing reverse geo-code the returned coordinates and automatically fill in the remaining address fields. 

````C#
var apiKey = WebConfigurationManager.AppSettings["BingMapsApiKey"];
var prompt = "Where should I ship your order? Type or say and address.";
var locationDialog = new LocationDialog(apiKey, message.ChannelId, prompt, LocationOptions.UseNativeControl | LocationOptions.ReverseGeocode);
context.Call(locationDialog, (dialogContext, result) => {...});
````

Note: Due to the inheritably lack of accuracy of reverse geo-coders, we only use it to capture: `PostalAddress.Locality, PostalAddress.Region PostalAddress.Country and PostalAddress.PostalCode`.

#### Specifying required fields 
You can specify required location fields that need to be collected by the control. If the user does not provide any of the required fields, the control will prompt the user to fill them in. The example specifies that the street address and postal (zip) code are required. 

````C#
var apiKey = WebConfigurationManager.AppSettings["BingMapsApiKey"];
var prompt = "Where should I ship your order? Type or say and address.";
var locationDialog = new LocationDialog(apiKey, message.ChannelId, prompt, LocationOptions.None, LocationRequiredFields.StreetAddress | LocationRequiredFields.PostalCode);
context.Call(locationDialog, (dialogContext, result) => {...});
````

#### Handling returned location
The following examples shows how you can leverage the location object data returned by the location control.

````C#
var apiKey = WebConfigurationManager.AppSettings["BingMapsApiKey"];
var prompt = "Where should I ship your order? Type or say and address.";
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

## Sample
You can find a sample bot that uses the Bing location control in the [BotBuilderLocation.Sample](BotBuilderLocation.Sample) directory. 
