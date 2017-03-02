import { Library } from 'botbuilder';
import * as common from '../common';
import { Strings } from '../consts';

export function register(library: Library): void {
    library.dialog('confirm-dialog', createDialog());
}

function createDialog() {
    return common.createBaseDialog()
        .onBegin((session, args) => {
            var confirmationPrompt = args.confirmationPrompt;
            session.send(confirmationPrompt).sendBatch();
        })
        .onDefault((session) => {
            var message = parseBoolean(session.message.text);
            if (typeof message == 'boolean') {
                var result: any;
                if (message == true) {
                    result = { response: { confirmed: true } };
                }
                else {
                   result = { response: { confirmed: false } };
                }

                session.endDialogWithResult(result)
                return;
            }

            session.send(Strings.InvalidYesNo).sendBatch();
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