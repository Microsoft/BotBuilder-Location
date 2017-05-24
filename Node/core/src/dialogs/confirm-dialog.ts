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
            var message = parseBoolean(session, session.message.text);
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

function parseBoolean(session: any, input: string) {
    input = input.trim();

    const yesExp = new RegExp(session.gettext(Strings.YesExp), 'i');
    const noExp = new RegExp(session.gettext(Strings.NoExp), 'i');

    if (yesExp.test(input)) {
        return true;
    } else if (noExp.test(input)) {
        return false;
    }

    return undefined;
}