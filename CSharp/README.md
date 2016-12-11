# C# Overview
The following examples demonstrate how to use [LocationDialog.cs](BotBuilderLocation/LocationDialog.cs) to collect and validate the user's  location with your Microsoft Bot Framework C# bot. 

# Prerequisites
To start using the control, you need to obtain a Bing Maps API subscription key. You can sign up to get a free key with up to 10,000 transactions per month in [Azure Portal](https://azure.microsoft.com/en-us/marketplace/partners/bingmaps/mapapis/).

# Sample
You can find a sample bot that uses the Bing location control in the [BotBuilderLocation.Sample](/BotBuilderLocation.Sample) directory. 

# Code Highlights

#Usage
Import the BotBuilder-Location library from nuGet and add the following required namespace. 

{% highlight c# %}

using Microsoft.Bot.Builder.Location;

{% endhighlight %}

#Code Highlights

## Calling with default parameters

````C#
var apiKey = WebConfigurationManager.AppSettings["BingMapsApiKey"];
var prompt = "Hi, where would you like me to ship to your widget?";
var locationDialog = new LocationDialog(apiKey, message.ChannelId, prompt);
context.Call(locationDialog, (dialogContext, result) => {...});
````

### Using channel's native location widget if available (e.g. Facebook):

````C#
var apiKey = WebConfigurationManager.AppSettings["BingMapsApiKey"];
var prompt = "Hi, where would you like me to ship to your widget?";
var locationDialog = new LocationDialog(apiKey, message.ChannelId, prompt, LocationOptions.UseNativeControl);
context.Call(locationDialog, (dialogContext, result) => {...});
````

### Using channel's native location widget if available (e.g. Facebook) and having Bing try to reverse geo-code the provided coordinates to automatically fill-in address fields:

````C#
var apiKey = WebConfigurationManager.AppSettings["BingMapsApiKey"];
var prompt = "Hi, where would you like me to ship to your widget?";
var locationDialog = new LocationDialog(apiKey, message.ChannelId, prompt, LocationOptions.UseNativeControl | LocationOptions.ReverseGeocode);
context.Call(locationDialog, (dialogContext, result) => {...});
````

### Specifying required fields to have the dialog prompt the user for if missing from address:
````C#
var apiKey = WebConfigurationManager.AppSettings["BingMapsApiKey"];
var prompt = "Hi, where would you like me to ship to your widget?";
var locationDialog = new LocationDialog(apiKey, message.ChannelId, prompt, LocationOptions.None, LocationRequiredFields.StreetAddress | LocationRequiredFields.PostalCode);
context.Call(locationDialog, (dialogContext, result) => {...});
````

### Example on how to handle the returned place:
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
