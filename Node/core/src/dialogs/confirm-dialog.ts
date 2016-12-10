import { Library } from 'botbuilder';
import * as common from '../common';
import {Strings} from '../consts';

export function register(library: Library): void {
    library.dialog('confirm-dialog', createDialog());
}

function createDialog() {
    return common.createBaseDialog()
        .onBegin((session, args) => {
            session.dialogData.locations = args.locations;

            session.send(Strings.SingleResultFound).sendBatch();
        })
        .onDefault((session) => {
            var message = parseBoolean(session.message.text);
            if (typeof message == 'boolean') {
                var place = message == true ? common.processLocation(session.dialogData.locations[0], true) : null;
                session.endDialogWithResult({ response: { place: place } })
                return;
            }

            session.send(Strings.InvalidLocationResponse).sendBatch();
        });
}

function parseBoolean(input: string) {
    input = input.trim();

    const yesExp = /^(y|yes|yep|sure|ok|true)/i;
    const noExp = /^(n|no|nope|not|false)/i;

    if (yesExp.test(input)) {
        return true;
    } else if (noExp.test(input)) {
        return false;
    }

    return undefined;
}