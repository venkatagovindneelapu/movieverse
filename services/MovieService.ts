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
        results: mockMovies,
        total_pages: 1,
        total_results: mockMovies.length
      };
    }
    
    if (endpoint.includes('/search/movie')) {
      return {
        page: 1,
        results: mockMovies.slice(0, 3),
        total_pages: 1,
        total_results: 3
      };
    }

    if (endpoint.includes('/genre/movie/list')) {
      return {
        genres: [
          { id: 28, name: 'Action' },
          { id: 35, name: 'Comedy' },
          { id: 18, name: 'Drama' },
          { id: 27, name: 'Horror' },
          { id: 10749, name: 'Romance' },
          { id: 878, name: 'Science Fiction' }
        ]
      };
    }

    if (endpoint.includes('/movie/') && endpoint.includes('/credits')) {
      return {
        id: 1,
        cast: [
          {
            id: 1,
            name: 'Tim Robbins',
            character: 'Andy Dufresne',
            profile_path: '/hsCu1JUzQCqsZCHY8x4sBJTgFz8.jpg',
            order: 0
          },
          {
            id: 2,
            name: 'Morgan Freeman',
            character: 'Ellis Boyd \'Red\' Redding',
            profile_path: '/905k0RFzH0Kd6TNXjcTpfamsE4E.jpg',
            order: 1
          }
        ],
        crew: [
          {
            id: 3,
            name: 'Frank Darabont',
            job: 'Director',
            department: 'Directing',
            profile_path: '/7LqmE3p1XTwCdNCOmBxovq210Qk.jpg'
          }
        ]
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
 * Mock movie data for development and fallback scenarios
 * Contains a curated list of popular movies with complete metadata
 */
const mockMovies: Movie[] = [
  {
    id: 278,
    title: "The Shawshank Redemption",
    original_title: "The Shawshank Redemption",
    overview: "Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison, where he puts his accounting skills to work for an amoral warden.",
    poster_path: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    backdrop_path: "/iNh3BivHyg5sQRPP1KOkzguEX0H.jpg",
    release_date: "1994-09-23",
    vote_average: 8.7,
    vote_count: 26000,
    popularity: 123.456,
    adult: false,
    video: false,
    original_language: "en",
    genre_ids: [18, 80]
  },
  {
    id: 238,
    title: "The Godfather",
    original_title: "The Godfather",
    overview: "Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family.",
    poster_path: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    backdrop_path: "/tmU7GeKVybMWFButWEGl2M4GeiP.jpg",
    release_date: "1972-03-14",
    vote_average: 8.7,
    vote_count: 19000,
    popularity: 111.789,
    adult: false,
    video: false,
    original_language: "en",
    genre_ids: [18, 80]
  },
  {
    id: 155,
    title: "The Dark Knight",
    original_title: "The Dark Knight",
    overview: "Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and District Attorney Harvey Dent.",
    poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    backdrop_path: "/hqkIcbrOHL86UncnHIsHVcVmzue.jpg",
    release_date: "2008-07-16",
    vote_average: 8.5,
    vote_count: 32000,
    popularity: 98.456,
    adult: false,
    video: false,
    original_language: "en",
    genre_ids: [28, 80, 18]
  },
  {
    id: 680,
    title: "Pulp Fiction",
    original_title: "Pulp Fiction",
    overview: "A burger-loving hit man, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge in this sprawling, comedic crime caper.",
    poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    backdrop_path: "/4cDFJr4HnXN5AdPw4AKrmLlMWdO.jpg",
    release_date: "1994-09-10",
    vote_average: 8.5,
    vote_count: 27000,
    popularity: 87.123,
    adult: false,
    video: false,
    original_language: "en",
    genre_ids: [80, 18]
  },
  {
    id: 13,
    title: "Forrest Gump",
    original_title: "Forrest Gump",
    overview: "A man with a low IQ has accomplished great things in his life and been present during significant historic events.",
    poster_path: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
    backdrop_path: "/7c8obl4XlbdTjsLTcpVlGEQ2GGG.jpg",
    release_date: "1994-06-23",
    vote_average: 8.4,
    vote_count: 25000,
    popularity: 76.789,
    adult: false,
    video: false,
    original_language: "en",
    genre_ids: [18, 10749]
  },
  {
    id: 27205,
    title: "Inception",
    original_title: "Inception",
    overview: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life.",
    poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    backdrop_path: "/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
    release_date: "2010-07-15",
    vote_average: 8.4,
    vote_count: 35000,
    popularity: 65.432,
    adult: false,
    video: false,
    original_language: "en",
    genre_ids: [28, 878, 53]
  }
];