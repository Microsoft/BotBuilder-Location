import * as path from 'path';
import { AttachmentLayout, IDialogResult, IPromptOptions, CardAction, HeroCard, Library, ListStyle, Message, Prompts, Session} from 'botbuilder';
import * as common from './common';
import { Strings, LibraryName } from './consts';
import { Place } from './place';
import { FavoritesManager } from './services/favorites-manager';
import * as addFavoriteLocationDialog from './dialogs/add-favorite-location-dialog';
import * as confirmDialog from './dialogs/confirm-dialog';
import * as retrieveLocationDialog from './dialogs/retrieve-location-dialog'
import * as requireFieldsDialog from './dialogs/require-fields-dialog';
import * as retrieveFavoriteLocationDialog from './dialogs/retrieve-favorite-location-dialog'

export interface ILocationPromptOptions {
    prompt: string;
    requiredFields?: requireFieldsDialog.LocationRequiredFields;
    skipConfirmationAsk?: boolean;
    useNativeControl?: boolean,
    reverseGeocode?: boolean,
    skipFavorites?: boolean
}

exports.LocationRequiredFields = requireFieldsDialog.LocationRequiredFields;
exports.getFormattedAddressFromLocation = common.getFormattedAddressFromLocation;
exports.Place = Place;

//=========================================================
// Library creation
//=========================================================


exports.createLibrary = (apiKey: string): Library => {
    if (typeof apiKey === "undefined") {
        throw "'apiKey' parameter missing";
    }

    var lib = new Library(LibraryName);
    retrieveFavoriteLocationDialog.register(lib, apiKey);
    retrieveLocationDialog.register(lib, apiKey);
    requireFieldsDialog.register(lib);
    addFavoriteLocationDialog.register(lib);
    confirmDialog.register(lib);
    lib.localePath(path.join(__dirname, 'locale/'));

    lib.dialog('locationPickerPrompt', getLocationPickerPrompt());
    lib.dialog('start-hero-card-dialog', createDialogStartHeroCard());

    return lib;
}

//=========================================================
// Location Picker Prompt
//=========================================================

exports.getLocation = function (session: Session, options: ILocationPromptOptions): Session {
    options = options || { prompt: session.gettext(Strings.DefaultPrompt) };
    if (typeof options.prompt == "undefined") {
        options.prompt = session.gettext(Strings.DefaultPrompt);
    }

    return session.beginDialog(LibraryName + ':locationPickerPrompt', options);
};

function getLocationPickerPrompt() {
    return [
        // handle different ways of retrieving a location (favorite, other, etc)
        (session: Session, args: ILocationPromptOptions, next: (results?: IDialogResult<any>) => void) => {
            session.dialogData.args = args;

            if (!args.skipFavorites && (new  FavoritesManager(session.userData)).getFavorites().length > 0) {
                session.beginDialog('start-hero-card-dialog');
            }
            else {
                next();
            }
        },
        // retrieve location
        (session: Session, results: IDialogResult<any>, next: (results?: IDialogResult<any>) => void) => {
            if (results && results.response && results.response.entity === session.gettext(Strings.FavoriteLocations)) {
                session.beginDialog('retrieve-favorite-location-dialog', session.dialogData.args);
            }
            else {
                session.beginDialog('retrieve-location-dialog', session.dialogData.args);
            }
        },
         // make final confirmation
        (session: Session, results: IDialogResult<any>, next: (results?: IDialogResult<any>) => void) => {
            if (results.response && results.response.place) {
                session.dialogData.place =  results.response.place;
                if (session.dialogData.args.skipConfirmationAsk) {
                    next({ response: { confirmed: true }});
                }
                else {
                    var separator = session.gettext(Strings.AddressSeparator);
                    var promptText = session.gettext(Strings.ConfirmationAsk, common.getFormattedAddressFromLocation(results.response.place, separator));
                    session.beginDialog('confirm-dialog' , { confirmationPrompt: promptText });
                }
            }
            else {
                next(results);
            }
        },
        // offer add to favorites, if applicable
        (session: Session, results: IDialogResult<any>, next: (results?: IDialogResult<any>) => void) => {
            session.dialogData.confirmed =  results.response.confirmed;
            if(results.response && results.response.confirmed && !session.dialogData.args.skipFavorites) {
                session.beginDialog('add-favorite-location-dialog', { place : session.dialogData.place });
            }
            else {
                 next(results);
            }
        },
        (session: Session, results: IDialogResult<any>, next: (results?: IDialogResult<any>) => void) => {
            if (results.response && results.response.cancel) {
                session.endDialogWithResult(null);
            }
            else if ( !session.dialogData.confirmed || (results.response && results.response.reset)) {
                session.send(Strings.ResetPrompt);
                session.replaceDialog('locationPickerPrompt', session.dialogData.args);
            }
            else {
                next({ response: common.processLocation(session.dialogData.place) });
            }
        }
    ];
}

function createDialogStartHeroCard() {
    return common.createBaseDialog()
        .onBegin(function (session, args) {
            const possibleBranches = [ session.gettext(Strings.FavoriteLocations), session.gettext(Strings.OtherLocation) ];
            let buttons = new Array();
            for (let i =0; i < possibleBranches.length; i++) {
                var button = new CardAction(session);
                button.type("imBack");
                button.value(possibleBranches[i]);       
                button.title(possibleBranches[i]);       
                buttons.push(button);
            }

            var card = new HeroCard();
            card.buttons(buttons);
            card.subtitle(session.gettext(Strings.DialogStartBranchAsk));

            var attachments = new Array();
            attachments.push(card.toAttachment());
          
            session.send( new Message(session).attachmentLayout(AttachmentLayout.carousel).attachments(attachments)).sendBatch();
        }).onDefault((session) => {
            const text: string = session.message.text;
            if (text === session.gettext(Strings.OtherLocation) || text === session.gettext(Strings.FavoriteLocations)) {
                session.endDialogWithResult({ response: { entity: text } });
            }
            else {
               session.send(session.gettext(Strings.InvalidStartBranchResponse)).sendBatch();
            }
        });
}