// App Configuration
export const Config = {
  // API Configuration
  TMDB_BEARER_TOKEN: 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlYjk5NmExZmFiOTcwYjVkMzIxYmMwYTI1MGMyYjUxNiIsIm5iZiI6MTc1NTcxNTU3NC44NDgsInN1YiI6IjY4YTYxN2Y2MTkwMTU2NTcxOWZkMjZhYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.6qWFQO_VpANtrgNzDI7cmnef8rBWPELeIW6YZ68tCEE',
  TMDB_BASE_URL: 'https://api.themoviedb.org/3',
  TMDB_IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
  TMDB_ACCOUNT_ID: '22243490',
  
  // App Settings
  APP_NAME: 'MovieVerse',
  APP_VERSION: '1.0.0',
  
  // Pagination
  ITEMS_PER_PAGE: 20,
  MAX_PAGES: 1000,
  
  // Cache Settings
  CACHE_DURATION: 300000, // 5 minutes in milliseconds
  MAX_CACHE_SIZE: 100, // Maximum number of cached responses
  
  // UI Settings
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  
  // Image Sizes
  IMAGE_SIZES: {
    POSTER: 'w500',
    BACKDROP: 'w780',
    PROFILE: 'w300',
    LOGO: 'w200',
  },
  
  // Social Links
  SOCIAL_LINKS: {
    GITHUB: '',
    TWITTER: '',
    WEBSITE: '',
  },
  
  // Support
  SUPPORT_EMAIL: '',
  PRIVACY_POLICY: '',
  TERMS_OF_SERVICE: '',
};

// Feature Flags
export const FeatureFlags = {
  ENABLE_DARK_MODE: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_ANALYTICS: false,
  ENABLE_REVIEWS: true,
  ENABLE_TRAILERS: true,
  ENABLE_SOCIAL_SHARING: true,
};

// Development Configuration
export const DevConfig = {
  ENABLE_LOGGING: __DEV__,
  ENABLE_DEBUG_PANEL: __DEV__,
  API_TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
};