import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ViewStyle,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Star, Play, Info, Bookmark } from 'lucide-react-native';
import { router } from 'expo-router';

import { Colors, Typography, Spacing, BorderRadius, Shadows, Animation } from '@/constants/Colors';
import { Movie } from '@/types/Movie';
import { MovieService } from '@/services/MovieService';
import { StorageService } from '@/services/StorageService';

interface MovieCardProps {
  /** Movie data to display */
  movie: Movie;
  /** Additional styles for the card container */
  style?: ViewStyle;
  /** Card display variant */
  variant?: 'poster' | 'backdrop' | 'hero';
  /** Whether to show additional movie details */
  showDetails?: boolean;
  /** Callback when favorite status changes */
  onFavoriteChange?: () => void;
}

/**
 * MovieCard Component
 * 
 * A versatile movie card component that supports multiple display variants:
 * - poster: Standard poster view with overlay controls
 * - backdrop: Landscape backdrop view for horizontal scrolling
 * - hero: Large hero banner for featured content
 * 
 * Features:
 * - Favorite toggle with local storage persistence
 * - Smooth animations and hover effects
 * - Responsive design with proper image handling
 * - Navigation to movie details on tap
 */
export default function MovieCard({ 
  movie, 
  style, 
  variant = 'poster',
  showDetails = false,
  onFavoriteChange 
}: MovieCardProps) {
  // State management
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Animation values
  const scaleAnim = new Animated.Value(1);
  const opacityAnim = new Animated.Value(0);

  /**
   * Check favorite status when component mounts or movie changes
   */
  useEffect(() => {
    checkFavoriteStatus();
    checkWatchlistStatus();
  }, [movie.id]);

  /**
   * Checks if the current movie is in the user's favorites
   */
  const checkFavoriteStatus = async () => {
    try {
      const favorite = await StorageService.isFavorite(movie.id);
      setIsFavorite(favorite);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  /**
   * Checks if the current movie is in the user's watchlist
   */
  const checkWatchlistStatus = async () => {
    try {
      const inWatchlist = await StorageService.isInWatchlist(movie.id);
      setIsInWatchlist(inWatchlist);
    } catch (error) {
      console.error('Error checking watchlist status:', error);
    }
  };

  /**
   * Toggles the favorite status of the movie
   */
  const handleFavoriteToggle = async () => {
    try {
      const newFavoriteStatus = await StorageService.toggleFavorite(movie);
      setIsFavorite(newFavoriteStatus);
      onFavoriteChange?.();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  /**
   * Toggles the watchlist status of the movie
   */
  const handleWatchlistToggle = async () => {
    try {
      if (isInWatchlist) {
        await StorageService.removeFromWatchlist(movie.id);
        setIsInWatchlist(false);
      } else {
        await StorageService.addToWatchlist(movie);
        setIsInWatchlist(true);
      }
      onFavoriteChange?.();
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    }
  };

  /**
   * Navigates to the movie details screen
   */
  const handlePress = () => {
    router.push({
      pathname: '/movie/[id]',
      params: { id: movie.id.toString() },
    });
  };

  /**
   * Handles hover/press in animation
   */
  const handleHoverIn = () => {
    setIsHovered(true);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1.05,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: Animation.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };

  /**
   * Handles hover/press out animation
   */
  const handleHoverOut = () => {
    setIsHovered(false);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: Animation.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Prepare image URLs and metadata
  const posterUrl = MovieService.getPosterUrl(movie.poster_path);
  const backdropUrl = MovieService.getBackdropUrl(movie.backdrop_path);
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';

  /**
   * Renders hero variant - large featured movie banner
   */
  if (variant === 'hero') {
    return (
      <TouchableOpacity style={[styles.heroCard, style]} onPress={handlePress}>
        <Image source={{ uri: backdropUrl }} style={styles.heroImage} />
        
        <LinearGradient
          colors={Colors.gradients.hero}
          style={styles.heroGradient}
        />

        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>{movie.title}</Text>
          <Text style={styles.heroOverview} numberOfLines={3}>
            {movie.overview}
          </Text>
          
          <View style={styles.heroActions}>
            <TouchableOpacity style={styles.playButton}>
              <Play size={20} color={Colors.black} fill={Colors.white} />
              <Text style={styles.playButtonText}>Play</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.infoButton}>
              <Info size={20} color={Colors.white} />
              <Text style={styles.infoButtonText}>More Info</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  /**
   * Renders backdrop variant - horizontal landscape card
   */
  if (variant === 'backdrop') {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          style={[styles.backdropCard, style]}
          onPress={handlePress}
          onPressIn={handleHoverIn}
          onPressOut={handleHoverOut}>
          
          <Image source={{ uri: backdropUrl }} style={styles.backdropImage} />
          
          <LinearGradient
            colors={Colors.gradients.card}
            style={styles.backdropGradient}
          />

          <Animated.View style={[styles.backdropOverlay, { opacity: opacityAnim }]}>
            <View style={styles.backdropActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Play size={16} color={Colors.white} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleFavoriteToggle}>
                <Heart
                  size={16}
                  color={isFavorite ? Colors.primary : Colors.white}
                  fill={isFavorite ? Colors.primary : 'transparent'}
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleWatchlistToggle}>
                <Bookmark
                  size={16}
                  color={isInWatchlist ? Colors.accent.scifi : Colors.white}
                  fill={isInWatchlist ? Colors.accent.scifi : 'transparent'}
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.backdropInfo}>
              <Text style={styles.backdropTitle} numberOfLines={1}>
                {movie.title}
              </Text>
              <View style={styles.backdropMeta}>
                <View style={styles.rating}>
                  <Star size={12} color={Colors.warning} fill={Colors.warning} />
                  <Text style={styles.ratingText}>{rating}</Text>
                </View>
                <Text style={styles.year}>{releaseYear}</Text>
              </View>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  /**
   * Renders default poster variant - standard movie poster card
   */
  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[styles.posterCard, style]}
        onPress={handlePress}
        onPressIn={handleHoverIn}
        onPressOut={handleHoverOut}>
        
        <View style={styles.imageContainer}>
          <Image source={{ uri: posterUrl }} style={styles.posterImage} />
          
          <LinearGradient
            colors={Colors.gradients.card}
            style={styles.posterGradient}
          />

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleFavoriteToggle}>
              <Heart
                size={16}
                color={isFavorite ? Colors.primary : Colors.white}
                fill={isFavorite ? Colors.primary : 'transparent'}
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleWatchlistToggle}>
              <Bookmark
                size={16}
                color={isInWatchlist ? Colors.accent.scifi : Colors.white}
                fill={isInWatchlist ? Colors.accent.scifi : 'transparent'}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.ratingBadge}>
            <Star size={10} color={Colors.warning} fill={Colors.warning} />
            <Text style={styles.ratingBadgeText}>{rating}</Text>
          </View>

          <Animated.View style={[styles.hoverOverlay, { opacity: opacityAnim }]}>
            <TouchableOpacity style={styles.playButtonSmall}>
              <Play size={24} color={Colors.white} fill={Colors.white} />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {showDetails && (
          <View style={styles.posterDetails}>
            <Text style={styles.posterTitle} numberOfLines={2}>
              {movie.title}
            </Text>
            <Text style={styles.posterYear}>{releaseYear}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // =============================================================================
  // HERO CARD STYLES
  // =============================================================================
  heroCard: {
    height: 500,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    ...Shadows.xl,
  },
  
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  
  heroContent: {
    position: 'absolute',
    bottom: Spacing.xl,
    left: Spacing.xl,
    right: Spacing.xl,
  },
  
  heroTitle: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
    marginBottom: Spacing.md,
    fontFamily: Typography.fontFamily.primary,
  },
  
  heroOverview: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.relaxed,
    marginBottom: Spacing.xl,
    fontFamily: Typography.fontFamily.primary,
  },
  
  heroActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  
  playButton: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  
  playButtonText: {
    color: Colors.black,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily.primary,
  },
  
  infoButton: {
    backgroundColor: Colors.backgroundOverlay,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  
  infoButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily.primary,
  },

  // =============================================================================
  // BACKDROP CARD STYLES
  // =============================================================================
  backdropCard: {
    width: 300,
    height: 169,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    marginRight: Spacing.md,
    ...Shadows.md,
  },
  
  backdropImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  
  backdropGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  
  backdropOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  
  backdropActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  
  actionButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: BorderRadius.full,
    padding: Spacing.sm,
  },
  
  backdropInfo: {
    alignSelf: 'flex-end',
  },
  
  backdropTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.white,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily.primary,
  },
  
  backdropMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },

  // =============================================================================
  // POSTER CARD STYLES
  // =============================================================================
  posterCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.md,
  },
  
  imageContainer: {
    position: 'relative',
    aspectRatio: 2/3,
  },
  
  posterImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  
  posterGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  
  actionButtons: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  actionButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: BorderRadius.full,
    padding: Spacing.sm,
  },
  
  ratingBadge: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  
  ratingBadgeText: {
    color: Colors.white,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily.primary,
  },
  
  hoverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  playButtonSmall: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BorderRadius.full,
    padding: Spacing.md,
  },
  
  posterDetails: {
    padding: Spacing.md,
    backgroundColor: Colors.backgroundTertiary,
  },
  
  posterTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.white,
    marginBottom: Spacing.xs,
    lineHeight: Typography.lineHeight.tight,
    fontFamily: Typography.fontFamily.primary,
  },
  
  posterYear: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.primary,
  },

  // =============================================================================
  // SHARED STYLES
  // =============================================================================
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  
  ratingText: {
    color: Colors.white,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily.primary,
  },
  
  year: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.primary,
  },
});