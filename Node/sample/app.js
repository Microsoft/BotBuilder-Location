// load env vars
require('dotenv-extended').load();

// import node modules
var builder = require('botbuilder');
var restify = require('restify');
var locationDialog = require('botbuilder-location');

// local vars
var locationDialogOptions = {
    prompt: 'Where should I ship your order?',
    useNativeControl: true,
    reverseGeocode: true,
    skipFavorites: false,
    skipConfirmationAsk: true,
    requiredFields:
        locationDialog.LocationRequiredFields.streetAddress |
        locationDialog.LocationRequiredFields.locality |
        locationDialog.LocationRequiredFields.region |
        locationDialog.LocationRequiredFields.postalCode |
        locationDialog.LocationRequiredFields.country
};

// init restify server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening at: ${server.url}`);
});

// init Bot Framework connector
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// init bot with connector config
var bot = new builder.UniversalBot(connector);
// bind connector to /api/messages endpoint
server.post('/api/messages', connector.listen());

// add location dialog to bot library
bot.library(locationDialog.createLibrary(process.env.BING_MAPS_API_KEY));

// configure default dialog handler
bot.dialog('/', [
    function (session) {
        session.send('Welcome to the Bing Location Control demo.')
        locationDialog.getLocation(session, locationDialogOptions);
    },
    function (session, results) {
        if (results.response) {
            session.send(`Thanks, I will ship your item to: ${results.response.formattedAddress}`)
        }
    }
]);

// end of line
