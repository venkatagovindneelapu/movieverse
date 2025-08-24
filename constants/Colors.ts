// Netflix-Inspired Design System Color Palette
export const Colors = {
  // Primary Brand Colors
  primary: '#E50914',           // Netflix signature red
  primaryDark: '#B20710',       // Darker red for hover states
  primaryLight: '#F40612',      // Lighter red for active states
  
  // Background Colors
  background: '#141414',        // Deep black primary background
  backgroundSecondary: '#222222', // Dark gray secondary background
  backgroundTertiary: '#2F2F2F', // Medium gray for cards
  backgroundOverlay: 'rgba(0, 0, 0, 0.75)', // Modal/overlay background
  
  // Text Colors
  text: '#FFFFFF',              // Primary white text
  textSecondary: '#B3B3B3',     // Light gray secondary text
  textMuted: '#808080',         // Muted gray for less important text
  textDisabled: '#565656',      // Disabled text color
  
  // Accent Colors for Categories
  accent: {
    action: '#FF6B35',          // Orange for action movies
    comedy: '#FFD23F',          // Yellow for comedy
    drama: '#9B59B6',           // Purple for drama
    horror: '#E74C3C',          // Dark red for horror
    romance: '#FF69B4',         // Pink for romance
    scifi: '#3498DB',           // Blue for sci-fi
    thriller: '#34495E',        // Dark blue-gray for thriller
    documentary: '#27AE60',     // Green for documentaries
  },
  
  // UI State Colors
  success: '#28A745',           // Green for success states
  warning: '#FFC107',           // Amber for warnings
  error: '#DC3545',             // Red for errors
  info: '#17A2B8',              // Cyan for information
  
  // Interactive Elements
  hover: 'rgba(255, 255, 255, 0.1)', // White overlay for hover
  focus: 'rgba(229, 9, 20, 0.3)',    // Red overlay for focus
  pressed: 'rgba(0, 0, 0, 0.2)',     // Dark overlay for pressed
  
  // Gradients
  gradients: {
    hero: ['rgba(20, 20, 20, 0)', 'rgba(20, 20, 20, 0.8)', '#141414'],
    card: ['transparent', 'rgba(0, 0, 0, 0.8)'],
    overlay: ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.9)'],
  },
  
  // Semantic Colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

// Typography Scale
export const Typography = {
  // Font Families
  fontFamily: {
    primary: 'Netflix Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    secondary: 'Helvetica Neue, Arial, sans-serif',
    mono: 'SF Mono, Monaco, Consolas, monospace',
  },
  
  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },
  
  // Font Weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Spacing System (8px base unit)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
};

// Border Radius
export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

// Shadows
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 24,
  },
};

// Animation Durations
export const Animation = {
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 750,
};