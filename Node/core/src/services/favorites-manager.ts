import { FavoriteLocation } from '../favorite-location';
import { RawLocation } from '../rawLocation';

export class FavoritesManager {

    readonly maxFavoriteCount = 5;
    readonly favoritesKey = 'favorites';

    constructor (private userData : any) {
    }

    public maxCapacityReached(): boolean {
        return  this.getFavorites().length >= this.maxFavoriteCount;
    } 

    public isFavorite(location: RawLocation) : boolean {
        let favorites = this.getFavorites();

        for (let i = 0; i < favorites.length; i++) {
            if (this.areEqual(favorites[i].location, location)) {
                return true;
            }
        }

        return false;
    }

    public isFavoriteLocationName(name: string) : boolean {
        let favorites = this.getFavorites();

        for (let i = 0; i < favorites.length; i++) {
            if (favorites[i].name.toLowerCase() === name.toLowerCase()) {
                return true;
            }
        }

        return false;
    }

    public getFavoriteByIndex(index: number) : FavoriteLocation {
        let favorites = this.getFavorites();

        if (index >=0 && index < favorites.length) {
            return favorites[index];
        }

        return null;
    }

    public getFavoriteByName(name: string) : FavoriteLocation {
        let favorites = this.getFavorites();

         for (let i = 0; i < favorites.length; i++) {
            if (favorites[i].name.toLowerCase() === name.toLowerCase()) {
                return favorites[i];
            }
        }

        return null;
    }

    public add(favoriteLocation: FavoriteLocation): void {
        let favorites = this.getFavorites();

        if (favorites.length >=  this.maxFavoriteCount) {
            throw ('The max allowed number of favorite locations has already been reached.');
        }

        favorites.push(favoriteLocation);
        this.userData[this.favoritesKey] = favorites;
    }

    public delete(favoriteLocation: FavoriteLocation): void {
        let favorites = this.getFavorites();
        let newFavorites = [];

        for (let i = 0; i < favorites.length; i++) {
            if ( !this.areEqual(favorites[i].location, favoriteLocation.location)) {
                newFavorites.push(favorites[i]);
            }
        }

        this.userData[this.favoritesKey] = newFavorites;
    }

    public update(currentValue: FavoriteLocation, newValue: FavoriteLocation): void {
        let favorites = this.getFavorites();
        let newFavorites = [];

        for (let i = 0; i < favorites.length; i++) {
            if ( this.areEqual(favorites[i].location, currentValue.location)) {
                newFavorites.push(newValue);
            }
            else {
                newFavorites.push(favorites[i]);
            }
        }

        this.userData[this.favoritesKey] = newFavorites;
    }

    public getFavorites(): FavoriteLocation[] {
        let storedFavorites = this.userData[this.favoritesKey];
    
        if (storedFavorites) {
            return storedFavorites;
        }
        else {
            // User currently has no favorite locations. Return an empty list.
            return [];
        }
    }

    private areEqual(location0: RawLocation, location1: RawLocation): boolean {
        // Other attributes of a location such as its Confidence, BoundaryBox, etc
        // should not be considered as distinguishing factors.
        // On the other hand, attributes of a location that are shown to the users
        // are what distinguishes one location from another. 
        return location0.address.formattedAddress === location1.address.formattedAddress;
    }
}