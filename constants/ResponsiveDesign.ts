import { Dimensions, PixelRatio } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive Design System
export const ResponsiveDesign = {
  // Screen Breakpoints
  breakpoints: {
    mobile: 480,
    tablet: 768,
    desktop: 1024,
    largeDesktop: 1440,
  },

  // Current Screen Info
  screen: {
    width: screenWidth,
    height: screenHeight,
    pixelRatio: PixelRatio.get(),
    fontScale: PixelRatio.getFontScale(),
  },

  // Device Type Detection
  device: {
    isMobile: screenWidth < 480,
    isTablet: screenWidth >= 480 && screenWidth < 1024,
    isDesktop: screenWidth >= 1024,
    isLargeDesktop: screenWidth >= 1440,
  },

  // Responsive Spacing
  spacing: {
    xs: screenWidth < 480 ? 4 : 6,
    sm: screenWidth < 480 ? 8 : 12,
    md: screenWidth < 480 ? 16 : 20,
    lg: screenWidth < 480 ? 24 : 32,
    xl: screenWidth < 480 ? 32 : 48,
    '2xl': screenWidth < 480 ? 48 : 64,
    '3xl': screenWidth < 480 ? 64 : 96,
  },

  // Responsive Typography
  typography: {
    xs: screenWidth < 480 ? 10 : 12,
    sm: screenWidth < 480 ? 12 : 14,
    base: screenWidth < 480 ? 14 : 16,
    lg: screenWidth < 480 ? 16 : 18,
    xl: screenWidth < 480 ? 18 : 20,
    '2xl': screenWidth < 480 ? 20 : 24,
    '3xl': screenWidth < 480 ? 24 : 30,
    '4xl': screenWidth < 480 ? 30 : 36,
    '5xl': screenWidth < 480 ? 36 : 48,
  },

  // Responsive Grid System
  grid: {
    columns: screenWidth < 480 ? 2 : screenWidth < 768 ? 3 : screenWidth < 1024 ? 4 : 6,
    gutter: screenWidth < 480 ? 16 : 24,
    margin: screenWidth < 480 ? 16 : screenWidth < 768 ? 24 : 32,
  },

  // Component Sizing
  components: {
    tabBarHeight: screenWidth < 480 ? 70 : 88,
    headerHeight: screenWidth < 480 ? 60 : 80,
    cardWidth: screenWidth < 480 ? (screenWidth - 48) / 2 : 160,
    cardHeight: screenWidth < 480 ? ((screenWidth - 48) / 2) * 1.5 : 240,
  },

  // Seamless Design Properties
  seamless: {
    // Remove all borders
    noBorder: {
      borderWidth: 0,
      borderTopWidth: 0,
      borderBottomWidth: 0,
      borderLeftWidth: 0,
      borderRightWidth: 0,
    },
    
    // Perfect alignment
    centerAlign: {
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
    },
    
    // Flex alignment
    flexCenter: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    
    // Seamless blending
    seamlessBlend: {
      backgroundColor: 'transparent',
      borderWidth: 0,
      elevation: 0,
      shadowOpacity: 0,
    },
  },
};

// Responsive Helper Functions
export const getResponsiveValue = (mobile: number, tablet: number, desktop: number) => {
  if (ResponsiveDesign.device.isMobile) return mobile;
  if (ResponsiveDesign.device.isTablet) return tablet;
  return desktop;
};

export const getResponsiveSpacing = (size: keyof typeof ResponsiveDesign.spacing) => {
  return ResponsiveDesign.spacing[size];
};

export const getResponsiveFontSize = (size: keyof typeof ResponsiveDesign.typography) => {
  return ResponsiveDesign.typography[size];
};

// Cross-Platform Compatibility
export const CrossPlatform = {
  // Remove focus outlines (web-specific)
  noOutline: {
    outline: 'none',
    outlineWidth: 0,
    outlineStyle: 'none',
  },
  
  // Remove default button styles
  resetButton: {
    border: 'none',
    outline: 'none',
    background: 'transparent',
    padding: 0,
    margin: 0,
  },
  
  // Perfect text rendering
  textRendering: {
    textRenderingOptimizeSpeed: 'optimizeSpeed',
    textRenderingOptimizeLegibility: 'optimizeLegibility',
    textRenderingGeometricPrecision: 'geometricPrecision',
  },
};

// Mobile-First Media Queries (for web)
export const MediaQueries = {
  mobile: `@media (max-width: ${ResponsiveDesign.breakpoints.mobile}px)`,
  tablet: `@media (min-width: ${ResponsiveDesign.breakpoints.mobile + 1}px) and (max-width: ${ResponsiveDesign.breakpoints.tablet}px)`,
  desktop: `@media (min-width: ${ResponsiveDesign.breakpoints.tablet + 1}px)`,
  largeDesktop: `@media (min-width: ${ResponsiveDesign.breakpoints.largeDesktop}px)`,
};