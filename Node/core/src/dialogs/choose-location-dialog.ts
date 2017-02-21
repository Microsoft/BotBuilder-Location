import { Library, Session } from 'botbuilder';
import * as common from '../common';
import { Strings } from '../consts';
import { Place } from '../place';

export function register(library: Library): void {
    library.dialog('choose-location-dialog', createDialog());
}

function createDialog() {
    return common.createBaseDialog()
        .matches(/^other$/i, function (session: Session) {
            session.endDialogWithResult({response: {place: new Place()}});
        })
        .onBegin((session, args) => {
            session.dialogData.locations = args.locations;

            session.send(Strings.MultipleResultsFound).sendBatch();
        })
        .onDefault((session) => {
            var numberExp = /[+-]?(?:\d+\.?\d*|\d*\.?\d+)/;
            var match = numberExp.exec(session.message.text);
            if (match) {
                var currentNumber = Number(match[0]);
                if (currentNumber > 0 && currentNumber <= session.dialogData.locations.length) {
                    session.endDialogWithResult({ response: { place: session.dialogData.locations[currentNumber - 1] } });
                    return;
                }
            }

            session.send(Strings.InvalidLocationResponse).sendBatch();
        });
}