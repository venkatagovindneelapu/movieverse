import AsyncStorage from '@react-native-async-storage/async-storage';
import { MovieService } from './MovieService';
import { Config } from '@/constants/Config';
import { Movie } from '@/types/Movie';

// In-memory session storage for testing
const sessionStorage = {
  favorites: new Map<number, Movie>(),
  watchlist: new Map<number, Movie>(),
  watched: new Map<number, Movie>(),
  ratings: new Map<number, number>(),
};

// Storage keys for AsyncStorage (keeping for future use)
const STORAGE_KEYS = {
  FAVORITES: 'movieverse_favorites',
  WATCHLIST: 'movieverse_watchlist',
  WATCHED: 'movieverse_watched',
  RATINGS: 'movieverse_ratings',
  TMDB_SYNC: 'movieverse_tmdb_sync',
  USER_PREFERENCES: 'movieverse_user_preferences',
};

/**
 * Service class for managing local storage and TMDB synchronization
 * Handles favorites, watchlist, ratings, and sync operations
 */
export class StorageService {
  // =============================================================================
  // TMDB SYNC (DISABLED FOR TESTING - USING SESSION STORAGE ONLY)
  // =============================================================================

  /**
   * Gets the sync status with TMDB
   * @returns Promise with sync status object
   */
  static async getSyncStatus(): Promise<{ lastSync: string | null; synced: boolean }> {
    // Disabled for testing - always return not synced
    return { lastSync: null, synced: false };
  }

  /**
   * Sets the sync status with TMDB
   * @param synced - Whether the data is synced
   */
  static async setSyncStatus(synced: boolean): Promise<void> {
    // Disabled for testing - do nothing
    console.log('TMDB sync disabled for testing');
  }

  // =============================================================================
  // FAVORITES MANAGEMENT
  // =============================================================================

  /**
   * Retrieves all favorite movies from session storage
   * @returns Promise with array of favorite movies
   */
  static async getFavorites(): Promise<Movie[]> {
    try {
      console.log('getFavorites called, session data:', sessionStorage.favorites.size, 'items');
      
      // Convert Map values to array and add user interaction properties
      const favoritesArray = Array.from(sessionStorage.favorites.values()).map((movie: Movie) => ({
        ...movie,
        isFavorite: true,
        isInWatchlist: false,
        isWatched: false
      }));
      
      console.log('getFavorites returning:', favoritesArray.length, 'items');
      return favoritesArray;
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  /**
   * Adds a movie to favorites list
   * @param movie - Movie object to add to favorites
   */
  static async addToFavorites(movie: Movie): Promise<void> {
    try {
      console.log('Adding movie to favorites:', movie.id, movie.title);
      
      if (!sessionStorage.favorites.has(movie.id)) {
        sessionStorage.favorites.set(movie.id, movie);
        console.log('Movie added to favorites. Total favorites:', sessionStorage.favorites.size);
      } else {
        console.log('Movie already in favorites');
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }

  /**
   * Removes a movie from favorites list
   * @param movieId - ID of movie to remove from favorites
   */
  static async removeFromFavorites(movieId: number): Promise<void> {
    try {
      if (sessionStorage.favorites.has(movieId)) {
        sessionStorage.favorites.delete(movieId);
        console.log('Movie removed from favorites. Total favorites:', sessionStorage.favorites.size);
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  }

  /**
   * Checks if a movie is in the favorites list
   * @param movieId - ID of movie to check
   * @returns Promise with boolean indicating if movie is favorited
   */
  static async isFavorite(movieId: number): Promise<boolean> {
    try {
      const isFavorite = sessionStorage.favorites.has(movieId);
      console.log('Checking if movie', movieId, 'is favorite:', isFavorite);
      return isFavorite;
    } catch (error) {
      console.error('Error checking if favorite:', error);
      return false;
    }
  }

  /**
   * Toggles favorite status of a movie
   * @param movie - Movie object to toggle
   * @returns Promise with new favorite status (true if added, false if removed)
   */
  static async toggleFavorite(movie: Movie): Promise<boolean> {
    try {
      const isCurrentlyFavorite = await this.isFavorite(movie.id);
      
      if (isCurrentlyFavorite) {
        await this.removeFromFavorites(movie.id);
        return false;
      } else {
        await this.addToFavorites(movie);
        return true;
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }

  // =============================================================================
  // WATCHLIST MANAGEMENT
  // =============================================================================

  /**
   * Retrieves all watchlist movies from session storage
   * @returns Promise with array of watchlist movies
   */
  static async getWatchlist(): Promise<Movie[]> {
    try {
      console.log('getWatchlist called, session data:', sessionStorage.watchlist.size, 'items');
      
      // Convert Map values to array and add user interaction properties
      const watchlistArray = Array.from(sessionStorage.watchlist.values()).map((movie: Movie) => ({
        ...movie,
        isFavorite: false,
        isInWatchlist: true,
        isWatched: false
      }));
      
      console.log('getWatchlist returning:', watchlistArray.length, 'items');
      return watchlistArray;
    } catch (error) {
      console.error('Error getting watchlist:', error);
      return [];
    }
  }

  /**
   * Adds a movie to watchlist
   * @param movie - Movie object to add to watchlist
   */
  static async addToWatchlist(movie: Movie): Promise<void> {
    try {
      console.log('Adding movie to watchlist:', movie.id, movie.title);
      
      if (!sessionStorage.watchlist.has(movie.id)) {
        sessionStorage.watchlist.set(movie.id, movie);
        console.log('Movie added to watchlist. Total watchlist:', sessionStorage.watchlist.size);
      } else {
        console.log('Movie already in watchlist');
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      throw error;
    }
  }

  /**
   * Removes a movie from watchlist
   * @param movieId - ID of movie to remove from watchlist
   */
  static async removeFromWatchlist(movieId: number): Promise<void> {
    try {
      if (sessionStorage.watchlist.has(movieId)) {
        sessionStorage.watchlist.delete(movieId);
        console.log('Movie removed from watchlist. Total watchlist:', sessionStorage.watchlist.size);
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      throw error;
    }
  }

  /**
   * Checks if a movie is in the watchlist
   * @param movieId - ID of movie to check
   * @returns Promise with boolean indicating if movie is in watchlist
   */
  static async isInWatchlist(movieId: number): Promise<boolean> {
    try {
      const inWatchlist = sessionStorage.watchlist.has(movieId);
      console.log('Checking if movie', movieId, 'is in watchlist:', inWatchlist);
      return inWatchlist;
    } catch (error) {
      console.error('Error checking watchlist:', error);
      return false;
    }
  }

  // =============================================================================
  // WATCHED MOVIES MANAGEMENT
  // =============================================================================

  /**
   * Retrieves all watched movies from session storage
   * @returns Promise with array of watched movies
   */
  static async getWatched(): Promise<Movie[]> {
    try {
      console.log('getWatched called, session data:', sessionStorage.watched.size, 'items');
      
      // Convert Map values to array and add user interaction properties
      const watchedArray = Array.from(sessionStorage.watched.values()).map((movie: Movie) => ({
        ...movie,
        isFavorite: false,
        isInWatchlist: false,
        isWatched: true
      }));
      
      console.log('getWatched returning:', watchedArray.length, 'items');
      return watchedArray;
    } catch (error) {
      console.error('Error getting watched movies:', error);
      return [];
    }
  }

  /**
   * Adds a movie to watched list
   * @param movie - Movie object to add to watched
   */
  static async addToWatched(movie: Movie): Promise<void> {
    try {
      console.log('Adding movie to watched:', movie.id, movie.title);
      
      if (!sessionStorage.watched.has(movie.id)) {
        sessionStorage.watched.set(movie.id, movie);
        console.log('Movie added to watched. Total watched:', sessionStorage.watched.size);
      } else {
        console.log('Movie already in watched');
      }
    } catch (error) {
      console.error('Error adding to watched:', error);
      throw error;
    }
  }

  /**
   * Removes a movie from watched list
   * @param movieId - ID of movie to remove from watched
   */
  static async removeFromWatched(movieId: number): Promise<void> {
    try {
      if (sessionStorage.watched.has(movieId)) {
        sessionStorage.watched.delete(movieId);
        console.log('Movie removed from watched. Total watched:', sessionStorage.watched.size);
      }
    } catch (error) {
      console.error('Error removing from watched:', error);
      throw error;
    }
  }

  /**
   * Checks if a movie is in the watched list
   * @param movieId - ID of movie to check
   * @returns Promise with boolean indicating if movie is watched
   */
  static async isWatched(movieId: number): Promise<boolean> {
    try {
      const isWatched = sessionStorage.watched.has(movieId);
      console.log('Checking if movie', movieId, 'is watched:', isWatched);
      return isWatched;
    } catch (error) {
      console.error('Error checking watched status:', error);
      return false;
    }
  }

  // =============================================================================
  // RATINGS MANAGEMENT
  // =============================================================================

  /**
   * Retrieves all user ratings from session storage
   * @returns Promise with object mapping movie IDs to ratings
   */
  static async getRatings(): Promise<Record<number, number>> {
    try {
      const ratings: Record<number, number> = {};
      sessionStorage.ratings.forEach((rating, movieId) => {
        ratings[movieId] = rating;
      });
      console.log('getRatings returning:', Object.keys(ratings).length, 'ratings');
      return ratings;
    } catch (error) {
      console.error('Error getting ratings:', error);
      return {};
    }
  }

  /**
   * Sets a rating for a movie
   * @param movieId - ID of movie to rate
   * @param rating - Rating value (1-10)
   */
  static async setRating(movieId: number, rating: number): Promise<void> {
    try {
      console.log('Setting rating for movie', movieId, 'to', rating);
      sessionStorage.ratings.set(movieId, rating);
      console.log('Rating set. Total ratings:', sessionStorage.ratings.size);
    } catch (error) {
      console.error('Error setting rating:', error);
      throw error;
    }
  }

  /**
   * Gets the rating for a specific movie
   * @param movieId - ID of movie to get rating for
   * @returns Promise with rating value or null if not rated
   */
  static async getRating(movieId: number): Promise<number | null> {
    try {
      const rating = sessionStorage.ratings.get(movieId);
      console.log('Getting rating for movie', movieId, ':', rating);
      return rating || null;
    } catch (error) {
      console.error('Error getting rating:', error);
      return null;
    }
  }

  /**
   * Removes a rating for a movie
   * @param movieId - ID of movie to remove rating for
   */
  static async removeRating(movieId: number): Promise<void> {
    try {
      if (sessionStorage.ratings.has(movieId)) {
        sessionStorage.ratings.delete(movieId);
        console.log('Rating removed for movie', movieId, '. Total ratings:', sessionStorage.ratings.size);
      }
    } catch (error) {
      console.error('Error removing rating:', error);
      throw error;
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Gets the current session storage status for debugging
   * @returns Object with counts of items in each storage
   */
  static getSessionStatus(): { favorites: number; watchlist: number; watched: number; ratings: number } {
    return {
      favorites: sessionStorage.favorites.size,
      watchlist: sessionStorage.watchlist.size,
      watched: sessionStorage.watched.size,
      ratings: sessionStorage.ratings.size
    };
  }

  /**
   * Clears all data from both session storage and AsyncStorage
   */
  static async clearAllData(): Promise<void> {
    try {
      // Clear session storage
      sessionStorage.favorites.clear();
      sessionStorage.watchlist.clear();
      sessionStorage.watched.clear();
      sessionStorage.ratings.clear();
      console.log('Session storage cleared');
      
      // Clear AsyncStorage
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.FAVORITES),
        AsyncStorage.removeItem(STORAGE_KEYS.WATCHLIST),
        AsyncStorage.removeItem(STORAGE_KEYS.WATCHED),
        AsyncStorage.removeItem(STORAGE_KEYS.RATINGS),
        AsyncStorage.removeItem(STORAGE_KEYS.TMDB_SYNC),
      ]);
      console.log('AsyncStorage cleared');
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }

  /**
   * Clears only session storage data (keeps AsyncStorage)
   */
  static clearSessionData(): void {
    try {
      sessionStorage.favorites.clear();
      sessionStorage.watchlist.clear();
      sessionStorage.watched.clear();
      sessionStorage.ratings.clear();
      console.log('Session storage cleared');
    } catch (error) {
      console.error('Error clearing session data:', error);
    }
  }
}