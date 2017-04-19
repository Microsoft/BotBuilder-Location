"use strict";
var FavoritesManager = (function () {
    function FavoritesManager(userData) {
        this.userData = userData;
        this.maxFavoriteCount = 5;
        this.favoritesKey = 'favorites';
    }
    FavoritesManager.prototype.maxCapacityReached = function () {
        return this.getFavorites().length >= this.maxFavoriteCount;
    };
    FavoritesManager.prototype.isFavorite = function (location) {
        var favorites = this.getFavorites();
        for (var i = 0; i < favorites.length; i++) {
            if (this.areEqual(favorites[i].location, location)) {
                return true;
            }
        }
        return false;
    };
    FavoritesManager.prototype.isFavoriteLocationName = function (name) {
        var favorites = this.getFavorites();
        for (var i = 0; i < favorites.length; i++) {
            if (favorites[i].name.toLowerCase() === name.toLowerCase()) {
                return true;
            }
        }
        return false;
    };
    FavoritesManager.prototype.getFavoriteByIndex = function (index) {
        var favorites = this.getFavorites();
        if (index >= 0 && index < favorites.length) {
            return favorites[index];
        }
        return null;
    };
    FavoritesManager.prototype.getFavoriteByName = function (name) {
        var favorites = this.getFavorites();
        for (var i = 0; i < favorites.length; i++) {
            if (favorites[i].name.toLowerCase() === name.toLowerCase()) {
                return favorites[i];
            }
        }
        return null;
    };
    FavoritesManager.prototype.add = function (favoriteLocation) {
        var favorites = this.getFavorites();
        if (favorites.length >= this.maxFavoriteCount) {
            throw ('The max allowed number of favorite locations has already been reached.');
        }
        favorites.push(favoriteLocation);
        this.userData[this.favoritesKey] = favorites;
    };
    FavoritesManager.prototype.delete = function (favoriteLocation) {
        var favorites = this.getFavorites();
        var newFavorites = [];
        for (var i = 0; i < favorites.length; i++) {
            if (!this.areEqual(favorites[i].location, favoriteLocation.location)) {
                newFavorites.push(favorites[i]);
            }
        }
        this.userData[this.favoritesKey] = newFavorites;
    };
    FavoritesManager.prototype.update = function (currentValue, newValue) {
        var favorites = this.getFavorites();
        var newFavorites = [];
        for (var i = 0; i < favorites.length; i++) {
            if (this.areEqual(favorites[i].location, currentValue.location)) {
                newFavorites.push(newValue);
            }
            else {
                newFavorites.push(favorites[i]);
            }
        }
        this.userData[this.favoritesKey] = newFavorites;
    };
    FavoritesManager.prototype.getFavorites = function () {
        var storedFavorites = this.userData[this.favoritesKey];
        if (storedFavorites) {
            return storedFavorites;
        }
        else {
            return [];
        }
    };
    FavoritesManager.prototype.areEqual = function (location0, location1) {
        return location0.address.formattedAddress === location1.address.formattedAddress;
    };
    return FavoritesManager;
}());
exports.FavoritesManager = FavoritesManager;
