import { Session, HeroCard, CardImage } from 'botbuilder';
import { Place, Geo } from './place';
import { RawLocation } from './rawLocation'
import * as locationService from './services/bing-geospatial-service';

export class MapCard extends HeroCard {
    // Todo: remove private session. https://github.com/Microsoft/BotBuilder/pull/1790
    constructor(private apiKey: string, session?: Session) {
        super(session);
    }

    public location(location: RawLocation, index?: number, locationName?: string): this {
        var prefixText = "";
        if (index !== undefined) {
            prefixText = index + ". ";
        }

         if (locationName !== undefined) {
            prefixText += locationName + ": ";
        }

        if (location.address && location.address.formattedAddress) {
            this.subtitle(prefixText + location.address.formattedAddress);
        }
        else {
            this.subtitle(prefixText);
        }
  
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