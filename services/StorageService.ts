import AsyncStorage from '@react-native-async-storage/async-storage';
import { Movie } from '@/types/Movie';
import { MovieService } from './MovieService';

// Storage keys for AsyncStorage
const STORAGE_KEYS = {
  FAVORITES: '@movix_favorites',
  WATCHLIST: '@movix_watchlist',
  RATINGS: '@movix_ratings',
  SYNC_STATUS: '@movix_sync_status'
} as const;

/**
 * Service class for managing local storage and TMDB synchronization
 * Handles favorites, watchlist, ratings, and sync operations
 */
export class StorageService {
  // =============================================================================
  // SYNC OPERATIONS
  // =============================================================================

  /**
   * Synchronizes local data with TMDB account data
   * Attempts to fetch user's favorites, watchlist, and ratings from TMDB
   * Falls back to local-only storage if sync fails
   */
  static async syncWithTMDB(): Promise<void> {
    try {
      try {
        // Attempt to sync favorites from TMDB
        const tmdbFavorites = await MovieService.getFavoriteMovies();
        await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(tmdbFavorites.results));
        
        // Attempt to sync watchlist from TMDB
        const tmdbWatchlist = await MovieService.getWatchlistMovies();
        await AsyncStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(tmdbWatchlist.results));
        
        // Attempt to sync ratings from TMDB
        const tmdbRated = await MovieService.getRatedMovies();
        await AsyncStorage.setItem(STORAGE_KEYS.RATINGS, JSON.stringify(tmdbRated.results));
        
        // Mark sync as successful
        await this.setSyncStatus(true);
      } catch (error) {
        console.warn('TMDB sync failed (requires user authentication). Using local storage only.', error);
        await this.setSyncStatus(false);
      }
    } catch (error) {
      console.error('Error syncing with TMDB:', error);
    }
  }

  /**
   * Updates sync status in local storage
   * @param synced - Whether sync was successful
   */
  private static async setSyncStatus(synced: boolean): Promise<void> {
    const syncStatus = {
      lastSync: synced ? new Date().toISOString() : null,
      synced
    };
    await AsyncStorage.setItem(STORAGE_KEYS.SYNC_STATUS, JSON.stringify(syncStatus));
  }

  // =============================================================================
  // FAVORITES MANAGEMENT
  // =============================================================================

  /**
   * Retrieves all favorite movies from local storage
   * @returns Promise with array of favorite movies
   */
  static async getFavorites(): Promise<Movie[]> {
    try {
      const favoritesJson = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
      return favoritesJson ? JSON.parse(favoritesJson) : [];
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
      const favorites = await this.getFavorites();
      const isAlreadyFavorite = favorites.some(fav => fav.id === movie.id);
      
      if (!isAlreadyFavorite) {
        favorites.push(movie);
        await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
        
        // Attempt to sync with TMDB (may fail without proper authentication)
        try {
          await MovieService.addToFavorites(movie.id, true);
        } catch (error) {
          console.warn('Failed to sync favorite with TMDB:', error);
        }
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
      const favorites = await this.getFavorites();
      const updatedFavorites = favorites.filter(movie => movie.id !== movieId);
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updatedFavorites));
      
      // Attempt to sync with TMDB
      try {
        await MovieService.addToFavorites(movieId, false);
      } catch (error) {
        console.warn('Failed to sync favorite removal with TMDB:', error);
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
      const favorites = await this.getFavorites();
      return favorites.some(movie => movie.id === movieId);
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
   * Retrieves all watchlist movies from local storage
   * @returns Promise with array of watchlist movies
   */
  static async getWatchlist(): Promise<Movie[]> {
    try {
      const watchlistJson = await AsyncStorage.getItem(STORAGE_KEYS.WATCHLIST);
      return watchlistJson ? JSON.parse(watchlistJson) : [];
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
      const watchlist = await this.getWatchlist();
      const isAlreadyInWatchlist = watchlist.some(item => item.id === movie.id);
      
      if (!isAlreadyInWatchlist) {
        watchlist.push(movie);
        await AsyncStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
        
        // Attempt to sync with TMDB
        try {
          await MovieService.addToWatchlist(movie.id, true);
        } catch (error) {
          console.warn('Failed to sync watchlist with TMDB:', error);
        }
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
      const watchlist = await this.getWatchlist();
      const updatedWatchlist = watchlist.filter(movie => movie.id !== movieId);
      await AsyncStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(updatedWatchlist));
      
      // Attempt to sync with TMDB
      try {
        await MovieService.addToWatchlist(movieId, false);
      } catch (error) {
        console.warn('Failed to sync watchlist removal with TMDB:', error);
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
      const watchlist = await this.getWatchlist();
      return watchlist.some(movie => movie.id === movieId);
    } catch (error) {
      console.error('Error checking watchlist:', error);
      return false;
    }
  }

  // =============================================================================
  // RATINGS MANAGEMENT
  // =============================================================================

  /**
   * Retrieves all movie ratings from local storage
   * @returns Promise with object mapping movie IDs to ratings
   */
  static async getRatings(): Promise<{ [movieId: number]: number }> {
    try {
      const ratingsJson = await AsyncStorage.getItem(STORAGE_KEYS.RATINGS);
      return ratingsJson ? JSON.parse(ratingsJson) : {};
    } catch (error) {
      console.error('Error getting ratings:', error);
      return {};
    }
  }

  /**
   * Rates a movie
   * @param movieId - ID of movie to rate
   * @param rating - Rating value (typically 1-10)
   */
  static async rateMovie(movieId: number, rating: number): Promise<void> {
    try {
      const ratings = await this.getRatings();
      ratings[movieId] = rating;
      await AsyncStorage.setItem(STORAGE_KEYS.RATINGS, JSON.stringify(ratings));
      
      // Attempt to sync with TMDB
      try {
        await MovieService.rateMovie(movieId, rating);
      } catch (error) {
        console.warn('Failed to sync rating with TMDB:', error);
      }
    } catch (error) {
      console.error('Error rating movie:', error);
      throw error;
    }
  }

  /**
   * Gets rating for a specific movie
   * @param movieId - ID of movie to get rating for
   * @returns Promise with rating value or null if not rated
   */
  static async getMovieRating(movieId: number): Promise<number | null> {
    try {
      const ratings = await this.getRatings();
      return ratings[movieId] || null;
    } catch (error) {
      console.error('Error getting movie rating:', error);
      return null;
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Gets current sync status
   * @returns Promise with sync status object
   */
  static async getSyncStatus(): Promise<{ lastSync: string | null; synced: boolean }> {
    try {
      const statusJson = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_STATUS);
      return statusJson ? JSON.parse(statusJson) : { lastSync: null, synced: false };
    } catch (error) {
      console.error('Error getting sync status:', error);
      return { lastSync: null, synced: false };
    }
  }

  /**
   * Clears all stored data (favorites, watchlist, ratings, sync status)
   * Use with caution - this will remove all user data
   */
  static async clearAllData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.FAVORITES),
        AsyncStorage.removeItem(STORAGE_KEYS.WATCHLIST),
        AsyncStorage.removeItem(STORAGE_KEYS.RATINGS),
        AsyncStorage.removeItem(STORAGE_KEYS.SYNC_STATUS),
      ]);
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }
}