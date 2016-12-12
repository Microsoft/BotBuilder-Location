# Bing Location Control for Microsoft Bot Framework

## Overview
The Bing location control for Microsoft Bot Framework makes the process of collecting and validating the user's desired location in a conversation easy and reliable. The control is available for C# and Node.js and works consistently across all channels supported by Bot Framework. 

![Location Control Top Screenshot](Images/skype_multiaddress_1.png)

## Use Case and Features
Bots often need the user's location to complete a task. For example, a Taxi bot requires the user's pickup and destination address before requesting a ride. Similarly, a Pizza bot must know the user's delivery address to submit the order, and so on. Normally, bot developers need to use a combination of location or place APIs, and have their bots engage in a multi-turn dialog with users to get their desired location and subsequently validate it. The development steps are usually complicated and error-prone.  

The Bing location control makes this process easy by abstracting away the tedious coding steps to let the user pick a location and reliably validate it. The control offers the following capabilities: 

- Address look up and validation using Bing's Maps REST services. 
- User location returned as strongly-typed object complying with schema.org.
- Address disambiguation when more than one address is found.
- Support for declaring required location fields.
- Support for FB Messenger's location picker GUI dialog.
- Open-source code (C# and Node.js) with customizable dialog strings. 

## Prerequisites
To start using the control, you need to obtain a Bing Maps API subscription key. You can sign up to get a free key with up to 10,000 transactions per month in [Azure Portal](https://azure.microsoft.com/en-us/marketplace/partners/bingmaps/mapapis/).

## Getting Started
Navigate to the [C#](/CSharp) or [Node.js](/Node) folder and follow the guide to add the control to your Bot Framework bot. 

## Examples
The examples show different location selection scenarios supported by the Bing location control. 

### Address selection with single result returned

![Single Address](Images/skype_singleaddress_2.png)

### Address selection with multiple results returned

![Multiple Addresses](Images/skype_multiaddress_1.png)

### Address selection with required fields filling

![Required Fields](Images/skype_requiredaddress_1.png)

### Address selection using FB Messenger's location picker GUI dialog

![Messenger Location Dialog](Images/messenger_locationdialog_1.png)

## More Information
Read these resources for more information about the Microsoft Bot Framework, Bot Builder SDK and Bing Maps REST Services:

* [Microsoft Bot Framework Overview](https://docs.botframework.com/en-us/)
* [Microsoft Bot Framework Bot Builder SDK](https://github.com/Microsoft/BotBuilder)
* [Microsoft Bot Framework Samples](https://github.com/Microsoft/BotBuilder-Samples)
* [Bing Maps REST Services Documentation](https://msdn.microsoft.com/en-us/library/ff701713.aspx)

