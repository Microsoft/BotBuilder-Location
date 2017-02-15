"use strict";
var FavoritesManager = (function () {
    function FavoritesManager(userData) {
        this.userData = userData;
        this.MAX_FAVORITE_COUNT = 5;
        this.FAVORITES_KEY = 'favorites';
    }
    FavoritesManager.prototype.maxCapacityReached = function () {
        return this.getFavorites().length >= this.MAX_FAVORITE_COUNT;
    };
    FavoritesManager.prototype.isFavorite = function (location) {
        var favorites = this.getFavorites();
        for (var i = 0; i < favorites.length; i++) {
            if (favorites[i].location.formattedAddress === location.formattedAddress) {
                return true;
            }
        }
        return false;
    };
    FavoritesManager.prototype.add = function (favoriteLocation) {
        var favorites = this.getFavorites();
        if (favorites.length >= this.MAX_FAVORITE_COUNT) {
            throw ('The max allowed number of favorite locations has already been reached.');
        }
        favorites.push(favoriteLocation);
        this.userData[this.FAVORITES_KEY] = favorites;
    };
    FavoritesManager.prototype.getFavorites = function () {
        var storedFavorites = this.userData[this.FAVORITES_KEY];
        if (storedFavorites) {
            return storedFavorites;
        }
        else {
            return [];
        }
    };
    return FavoritesManager;
}());
exports.FavoritesManager = FavoritesManager;
