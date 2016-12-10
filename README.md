## Overview
The Bing location control for Microsoft Bot Framework makes the process of collecting and validating the user's desired location in a conversation easy and reliable. The control works consistently across all channels supported by Bot Framework. All with a few lines of code. 

![Basic Scenario](Images/skype_singleaddress_1.png)


## Why Use 
Bots often need the user's location to complete a task. For example, a Taxi bot requires the user's pickup location and destination before requesting a ride. Similarly, a Pizza bot must know the user's address to submit the order, and so on. Normally, bot developers need to use a combination of location or place APIs, and have their bots engage in a multi-turn dialog with users to get their desired location and subsequently validate it. The development steps are usually complicated and error-prone.  

We created the location dialog to make the process of getting the user's desired location within a conversational experience easy and reliable on all channels supported by Bot Framework. This new dialog type offers the following capabilities: 

- Address look up and validation using Bing's Maps REST services. 
- Consistent conversational experience across all supported messaging channels.
- Address disambiguation when more than one address is found.
- Support for declaring required location fields.
- Support for Messenger's native location picker dialog.
- Control is open-source with customizable and localizable dialog strings. 

## Pre-requisites
The location control is designed to plug in easily with bots developed with Microsoft Bot Framework. Both C# and Node.js are supported. The control is using Bing's Maps REST services. 

To start using the control, you need to obtain a Bing Maps subscription key. You can sign up to get a free key with up to 10,000 transactions per month in [Azure Portal](https://azure.microsoft.com/en-us/marketplace/partners/bingmaps/mapapis/).

## Getting Started
To get started, navigate to the [C#](https://github.com/Microsoft/BotBuilder-Location/tree/master/CSharp) or [Node.js](https://github.com/Microsoft/BotBuilder-Location/tree/master/Node) folder and follow the getting started instructions to add the location control to your Bot Framework bot. 

## Examples
The examples demostrate different scenarios you can achieve using the Bing location control. 

>>ToAdd


### More Information

To get more information about how to get started in Bot Builder for .NET and Microsoft Bing Images Search API please review the following resources:
* [Microsoft Bot Framework Overview](https://docs.botframework.com/en-us/)
* [Microsoft Bot Framework Bot Builder SDK](https://github.com/Microsoft/BotBuilder)
* [Bing Maps REST Services Documentation](https://msdn.microsoft.com/en-us/library/ff701713.aspx)
