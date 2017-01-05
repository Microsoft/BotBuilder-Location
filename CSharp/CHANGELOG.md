## 1.1.0
Bug fixes:
  - Creating default public constructor for `LocationResourceManager` to allow inheriting from it and overriding specific strings.

## 1.0.1

Features:
  - Address look up and validation using Bing's Maps REST services. 
  - User location returned as strongly-typed object complying with schema.org.
  - Address disambiguation when more than one address is found.
  - Support for declaring required location fields.
  - Support for FB Messenger's location picker GUI dialog.
  - Open-source code (C# and Node.js) with customizable dialog strings.