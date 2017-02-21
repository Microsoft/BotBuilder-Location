import { AttachmentLayout, HeroCard, Message, Session } from 'botbuilder';
import { MapCard } from '../map-card'
import {RawLocation} from '../rawLocation'

export class LocationCardBuilder {

    constructor (private apiKey : string) {
    }

    public createHeroCards(session: Session, locations: Array<RawLocation>, alwaysShowNumericPrefix?: boolean, locationNames?: Array<string>): Message {
        let cards = new Array();

        for (let i = 0; i < locations.length; i++) {
            cards.push(this.constructCard(session, locations, i, alwaysShowNumericPrefix, locationNames));
        }

        return new Message(session)
            .attachmentLayout(AttachmentLayout.carousel)
            .attachments(cards);
    }

    private constructCard(session: Session, locations: Array<RawLocation>, index: number, alwaysShowNumericPrefix?: boolean, locationNames?: Array<string>): HeroCard {
        const location = locations[index];
        let card = new MapCard(this.apiKey, session);

        if (alwaysShowNumericPrefix || locations.length > 1) {
            if (locationNames)
            {
                card.location(location, index + 1, locationNames[index]);
            }
            else
            {
                card.location(location, index + 1);
            }
        }
        else {
            card.location(location);
        }

        return card;
    }
}