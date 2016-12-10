import { Session, HeroCard, CardImage } from 'botbuilder';
import { Place, Geo } from './place';
import * as locationService from './services/bing-geospatial-service';

export class MapCard extends HeroCard {
    // Todo: remove private session. https://github.com/Microsoft/BotBuilder/pull/1790
    constructor(private apiKey: string, private session?: Session) {
        super(session);
    }

    public location(location: any, index?: number): this {
        var indexText = "";
        if (index !== undefined) {
            indexText = index + ". ";
        }

        this.subtitle(indexText + location.address.formattedAddress)

        if (location.point) {
            var locationUrl: string;
            try {
                locationUrl = locationService.GetLocationMapImageUrl(this.apiKey, location, index);
                this.images([CardImage.create(this.session, locationUrl)]);
            } catch (e) {
                this.session.error(e);
            }
        }

        return this;
    }
}