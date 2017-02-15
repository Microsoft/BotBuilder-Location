import { FavoriteLocation } from '../favorite-location';
import { Place } from '../place';

export class FavoritesManager {

    readonly MAX_FAVORITE_COUNT = 5;
    readonly FAVORITES_KEY = 'favorites';

    constructor (private userData : any) {
    }

    public maxCapacityReached(): boolean {
        return  this.getFavorites().length >= this.MAX_FAVORITE_COUNT;
    } 

    public isFavorite(location: Place) : boolean {
        let favorites = this.getFavorites();

        for (let i = 0; i < favorites.length; i++) {
            if (favorites[i].location.formattedAddress === location.formattedAddress) {
                return true;
            }
        }

        return false;
    }

    public add(favoriteLocation: FavoriteLocation): void {
        let favorites = this.getFavorites();

        if (favorites.length >=  this.MAX_FAVORITE_COUNT) {
            throw ('The max allowed number of favorite locations has already been reached.');
        }

        favorites.push(favoriteLocation);
        this.userData[this.FAVORITES_KEY] = favorites;
    }

    public getFavorites(): FavoriteLocation[] {
        let storedFavorites = this.userData[this.FAVORITES_KEY];
    
        if (storedFavorites) {
            return storedFavorites;
        }
        else {
            // User currently has no favorite locations. Return an empty list.
            return [];
        }
    }
}