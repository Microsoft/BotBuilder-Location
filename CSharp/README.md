# Microsoft Bot Builder Location Control

This dialog provides a location control, powered by Bing's Maps REST Services, to make the process of getting the user's location easy and consistent across all messaging channels supported by the bot framework. 

## Examples

The following examples demonstrate how to use [LocationDialog](BotBuilderLocation/LocationDialog.cs) to achieve different scenarios:

#### Calling with default parameters:

````C#
var apiKey = WebConfigurationManager.AppSettings["BingMapsApiKey"];
var prompt = "Hi, where would you like me to ship to your widget?";
var locationDialog = new LocationDialog(apiKey, message.ChannelId, prompt);
context.Call(locationDialog, (dialogContext, result) => {...});
````

#### Using channel's native location widget if available (e.g. Facebook):

````C#
var apiKey = WebConfigurationManager.AppSettings["BingMapsApiKey"];
var prompt = "Hi, where would you like me to ship to your widget?";
var locationDialog = new LocationDialog(apiKey, message.ChannelId, prompt, LocationOptions.UseNativeControl);
context.Call(locationDialog, (dialogContext, result) => {...});
````

#### Using channel's native location widget if available (e.g. Facebook) and having Bing try to reverse geo-code the provided coordinates to automatically fill-in address fields:

````C#
var apiKey = WebConfigurationManager.AppSettings["BingMapsApiKey"];
var prompt = "Hi, where would you like me to ship to your widget?";
var locationDialog = new LocationDialog(apiKey, message.ChannelId, prompt, LocationOptions.UseNativeControl | LocationOptions.ReverseGeocode);
context.Call(locationDialog, (dialogContext, result) => {...});
````

#### Specifying required fields to have the dialog prompt the user for if missing from address:
````C#
var apiKey = WebConfigurationManager.AppSettings["BingMapsApiKey"];
var prompt = "Hi, where would you like me to ship to your widget?";
var locationDialog = new LocationDialog(apiKey, message.ChannelId, prompt, LocationOptions.None, LocationRequiredFields.StreetAddress | LocationRequiredFields.PostalCode);
context.Call(locationDialog, (dialogContext, result) => {...});
````

#### Example on how to handle the returned place:
````C#
var apiKey = WebConfigurationManager.AppSettings["BingMapsApiKey"];
var prompt = "Hi, where would you like me to ship to your widget?";
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
        await context.PostAsync("OK, I won't be shipping it");
    }
}
````

## Use [LocationOptions](BotBuilderLocation/LocationOptions.cs) to customize the location experience:

*UseNativeControl:*

Some of the channels (e.g. Facebook) has a built in location widget. Use this option to indicate if you want the `LocationDialog` to use it when available.


*ReverseGeocode:*

Use this option if you want the location dialog to reverse lookup geo-coordinates before returning. This can be useful if you depend on the channel location service or native control to get user location but still want the control to return to you a full address.

Note: Due to the inheritably lack of accuracy of reverse geo-coders, we only use it to capture: `PostalAddress.Locality, PostalAddress.Region PostalAddress.Country and PostalAddress.PostalCode`.