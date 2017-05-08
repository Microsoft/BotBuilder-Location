## 2.0.0
Features:
  - Added favorites scenario to allow users to manage their favorite locations.

## 1.1.0
Features:
  - Added skipConfirmationAsk boolean to allow skipping the final confirmation prompt.

## 1.0.4
Bug fixes:
  - Fixed required dialog response: In case there are no required fields, the response now includes the place.

## 1.0.1

Features:
  - Address look up and validation using Bing's Maps REST services. 
  - User location returned as strongly-typed object complying with schema.org.
  - Address disambiguation when more than one address is found.
  - Support for declaring required location fields.
  - Support for FB Messenger's location picker GUI dialog.
  - Open-source code (C# and Node.js) with customizable dialog strings.