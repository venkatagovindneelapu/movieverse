/**
 * Utility functions for common operations throughout the app
 * Includes debouncing, date formatting, number formatting, and text manipulation
 */

/**
 * Creates a debounced version of a function that delays execution
 * until after the specified delay has elapsed since the last invocation
 * 
 * @param func - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Formats a date string to a human-readable format
 * 
 * @param dateString - ISO date string or date string
 * @returns Formatted date string (e.g., "March 15, 2024")
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'Unknown';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Invalid date format:', dateString);
    return 'Invalid Date';
  }
};

/**
 * Converts runtime in minutes to hours and minutes format
 * 
 * @param runtime - Runtime in minutes
 * @returns Formatted runtime string (e.g., "2h 30m", "45m", "1h")
 */
export const formatRuntime = (runtime: number): string => {
  if (!runtime || runtime <= 0) return 'Unknown';
  
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  
  if (hours === 0) {
    return `${minutes}m`;
  } else if (minutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${minutes}m`;
  }
};

/**
 * Formats large numbers with K/M suffixes for better readability
 * 
 * @param num - Number to format
 * @returns Formatted number string (e.g., "1.2K", "2.5M")
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Extracts the release year from a date string
 * 
 * @param dateString - ISO date string or date string
 * @returns Year as string or empty string if invalid
 */
export const getReleaseYear = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    return new Date(dateString).getFullYear().toString();
  } catch (error) {
    console.error('Invalid date format:', dateString);
    return '';
  }
};

/**
 * Truncates text to a specified length and adds ellipsis
 * 
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Generates a consistent color based on a string seed
 * Useful for creating consistent colors for categories, genres, etc.
 * 
 * @param seed - String to generate color from
 * @returns Hex color string
 */
export const generateRandomColor = (seed: string): string => {
  const colors: string[] = [];
  
  if (colors.length === 0) {
    return '#6366F1'; // Default fallback color
  }
  
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

/**
 * Validates if a string is a properly formatted URL
 * 
 * @param string - String to validate
 * @returns Boolean indicating if string is a valid URL
 */
export const isValidUrl = (string: string): boolean => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

/**
 * Calculates estimated reading time for text content
 * Based on average reading speed of 200 words per minute
 * 
 * @param text - Text content to analyze
 * @returns Reading time string (e.g., "3 min read")
 */
export const calculateReadingTime = (text: string): string => {
  if (!text) return '0 min read';
  
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  const time = Math.ceil(words / wordsPerMinute);
  
  return `${time} min read`;
};

/**
 * Capitalizes the first letter of each word in a string
 * 
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export const capitalizeWords = (str: string): string => {
  if (!str) return '';
  
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Safely parses JSON with fallback value
 * 
 * @param jsonString - JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed object or fallback value
 */
export const safeJsonParse = <T>(jsonString: string, fallback: T): T => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('JSON parsing failed:', error);
    return fallback;
  }
};

/**
 * Creates a delay/sleep function for async operations
 * 
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after the delay
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};