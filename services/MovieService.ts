import { 
  Movie, 
  MovieDetails, 
  ApiResponse, 
  GenreResponse,
  MovieCredits,
  ReviewResponse,
  VideoResponse 
} from '@/types/Movie';
import { Config } from '@/constants/Config';

/**
 * Service class for handling all TMDB API interactions
 * Provides methods for movie discovery, search, details, and user account operations
 */
export class MovieService {
  /**
   * Generic method to fetch data from TMDB API with error handling
   * @param endpoint - API endpoint to call
   * @param options - Additional fetch options
   * @returns Promise with API response data
   */
  private static async fetchFromAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      if (!Config.TMDB_BEARER_TOKEN) {
        console.warn('TMDB Bearer token not configured, using mock data');
        throw new Error('Bearer token not configured');
      }

      const url = `${Config.TMDB_BASE_URL}${endpoint}`;
      const requestOptions: RequestInit = {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${Config.TMDB_BEARER_TOKEN}`,
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      return this.getMockData(endpoint) as T;
    }
  }

  /**
   * Provides mock data when API is unavailable
   * @param endpoint - The API endpoint that failed
   * @returns Mock data based on endpoint type
   */
  private static getMockData(endpoint: string): any {
    if (endpoint.includes('/movie/popular') || 
        endpoint.includes('/trending/movie') || 
        endpoint.includes('/movie/top_rated') ||
        endpoint.includes('/movie/now_playing') ||
        endpoint.includes('/movie/upcoming')) {
      return {
        page: 1,
        results: [],
        total_pages: 1,
        total_results: 0
      };
    }
    
    if (endpoint.includes('/search/movie')) {
      return {
        page: 1,
        results: [],
        total_pages: 1,
        total_results: 0
      };
    }

    if (endpoint.includes('/genre/movie/list')) {
      return {
        genres: []
      };
    }

    if (endpoint.includes('/movie/') && endpoint.includes('/credits')) {
      return {
        id: 0,
        cast: [],
        crew: []
      };
    }

    return { results: [] };
  }

  // =============================================================================
  // MOVIE DISCOVERY METHODS
  // =============================================================================

  /**
   * Fetches popular movies from TMDB
   * @param page - Page number for pagination (default: 1)
   * @returns Promise with paginated popular movies
   */
  static async getPopularMovies(page: number = 1): Promise<ApiResponse<Movie>> {
    return this.fetchFromAPI(`/movie/popular?language=en-US&page=${page}`);
  }

  /**
   * Fetches trending movies for the current week
   * @param page - Page number for pagination (default: 1)
   * @returns Promise with paginated trending movies
   */
  static async getTrendingMovies(page: number = 1): Promise<ApiResponse<Movie>> {
    return this.fetchFromAPI(`/trending/movie/week?language=en-US&page=${page}`);
  }

  /**
   * Fetches top-rated movies from TMDB
   * @param page - Page number for pagination (default: 1)
   * @returns Promise with paginated top-rated movies
   */
  static async getTopRatedMovies(page: number = 1): Promise<ApiResponse<Movie>> {
    return this.fetchFromAPI(`/movie/top_rated?language=en-US&page=${page}`);
  }

  /**
   * Fetches currently playing movies in theaters
   * @param page - Page number for pagination (default: 1)
   * @returns Promise with paginated now playing movies
   */
  static async getNowPlayingMovies(page: number = 1): Promise<ApiResponse<Movie>> {
    return this.fetchFromAPI(`/movie/now_playing?language=en-US&page=${page}`);
  }

  /**
   * Fetches upcoming movie releases
   * @param page - Page number for pagination (default: 1)
   * @returns Promise with paginated upcoming movies
   */
  static async getUpcomingMovies(page: number = 1): Promise<ApiResponse<Movie>> {
    return this.fetchFromAPI(`/movie/upcoming?language=en-US&page=${page}`);
  }

  // =============================================================================
  // SEARCH METHODS
  // =============================================================================

  /**
   * Searches for movies by query string
   * @param query - Search query string
   * @param page - Page number for pagination (default: 1)
   * @returns Promise with paginated search results
   */
  static async searchMovies(query: string, page: number = 1): Promise<ApiResponse<Movie>> {
    const encodedQuery = encodeURIComponent(query);
    return this.fetchFromAPI(`/search/movie?query=${encodedQuery}&language=en-US&page=${page}`);
  }

  // =============================================================================
  // MOVIE DETAILS METHODS
  // =============================================================================

  /**
   * Fetches detailed information for a specific movie
   * @param movieId - The TMDB movie ID
   * @returns Promise with detailed movie information
   */
  static async getMovieDetails(movieId: number): Promise<MovieDetails> {
    return this.fetchFromAPI(`/movie/${movieId}?language=en-US`);
  }

  /**
   * Fetches cast and crew information for a movie
   * @param movieId - The TMDB movie ID
   * @returns Promise with movie credits (cast and crew)
   */
  static async getMovieCredits(movieId: number): Promise<MovieCredits> {
    return this.fetchFromAPI(`/movie/${movieId}/credits?language=en-US`);
  }

  /**
   * Fetches user reviews for a movie
   * @param movieId - The TMDB movie ID
   * @param page - Page number for pagination (default: 1)
   * @returns Promise with paginated movie reviews
   */
  static async getMovieReviews(movieId: number, page: number = 1): Promise<ReviewResponse> {
    return this.fetchFromAPI(`/movie/${movieId}/reviews?language=en-US&page=${page}`);
  }

  /**
   * Fetches video content (trailers, teasers) for a movie
   * @param movieId - The TMDB movie ID
   * @returns Promise with movie videos
   */
  static async getMovieVideos(movieId: number): Promise<VideoResponse> {
    return this.fetchFromAPI(`/movie/${movieId}/videos?language=en-US`);
  }

  // =============================================================================
  // GENRE METHODS
  // =============================================================================

  /**
   * Fetches all available movie genres
   * @returns Promise with list of movie genres
   */
  static async getGenres(): Promise<GenreResponse> {
    return this.fetchFromAPI('/genre/movie/list?language=en-US');
  }

  // =============================================================================
  // IMAGE URL HELPERS
  // =============================================================================

  /**
   * Constructs full image URL from TMDB image path
   * @param path - Image path from TMDB API
   * @param size - Image size (default: 'w500')
   * @returns Full image URL or placeholder if path is null
   */
  static getImageUrl(path: string | null, size: 'w300' | 'w500' | 'w780' | 'original' = 'w500'): string {
    if (!path) return 'https://via.placeholder.com/500x750/1A1A2E/9CA3AF?text=No+Image';
    return `${Config.TMDB_IMAGE_BASE_URL}/${size}${path}`;
  }

  /**
   * Gets poster image URL for a movie
   * @param path - Poster path from TMDB API
   * @returns Full poster URL
   */
  static getPosterUrl(path: string | null): string {
    return this.getImageUrl(path, 'w500');
  }

  /**
   * Gets backdrop image URL for a movie
   * @param path - Backdrop path from TMDB API
   * @returns Full backdrop URL
   */
  static getBackdropUrl(path: string | null): string {
    return this.getImageUrl(path, 'w780');
  }

  /**
   * Gets profile image URL for cast/crew
   * @param path - Profile path from TMDB API
   * @returns Full profile URL
   */
  static getProfileUrl(path: string | null): string {
    return this.getImageUrl(path, 'w300');
  }
}

/**
 * Empty movie array for fallback scenarios when API is unavailable
 * Structure preserved for type safety
 */
const mockMovies: Movie[] = [];