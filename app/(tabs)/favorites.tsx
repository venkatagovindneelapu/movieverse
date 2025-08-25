import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, Star, Filter, Flame, Zap, TrendingDown } from 'lucide-react-native';

import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/Colors';
import { MovieService } from '@/services/MovieService';
import { Movie } from '@/types/Movie';
import MovieCard from '@/components/ui/MovieCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { StorageService } from '@/services/StorageService';

const { width: screenWidth } = Dimensions.get('window');

type TrendingFilter = 'trending' | 'topRated' | 'popular' | 'nowPlaying';

export default function FavoritesScreen() {
  const isMounted = useRef(true);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<TrendingFilter>('trending');

  const loadTrendingMovies = async () => {
    try {
      setError(null);
      let movieResponse;

      switch (activeFilter) {
        case 'trending':
          movieResponse = await MovieService.getTrendingMovies(1);
          break;
        case 'topRated':
          movieResponse = await MovieService.getTopRatedMovies(1);
          break;
        case 'popular':
          movieResponse = await MovieService.getPopularMovies(1);
          break;
        case 'nowPlaying':
          movieResponse = await MovieService.getNowPlayingMovies(1);
          break;
        default:
          movieResponse = await MovieService.getTrendingMovies(1);
      }

      if (isMounted.current) {
        // Sort by rating by default (high to low)
        let sortedMovies = [...movieResponse.results];
        sortedMovies.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
        
        // Check favorites status for each movie
        const moviesWithStatus = await Promise.all(
          sortedMovies.slice(0, 50).map(async (movie) => {
            try {
              const isFavorite = await StorageService.isFavorite(movie.id);
              const isInWatchlist = await StorageService.isInWatchlist(movie.id);
              return {
                ...movie,
                isFavorite,
                isInWatchlist,
                isWatched: false
              };
            } catch (error) {
              console.error(`Error checking status for movie ${movie.id}:`, error);
              return {
                ...movie,
                isFavorite: false,
                isInWatchlist: false,
                isWatched: false
              };
            }
          })
        );
        
        console.log('Loaded movies with status:', moviesWithStatus.length);
        setMovies(moviesWithStatus);
      }
    } catch (err) {
      if (isMounted.current) {
        setError('Failed to load trending movies. Please try again.');
      }
      console.error('Error loading trending movies:', err);
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    loadTrendingMovies();
    
    return () => {
      isMounted.current = false;
    };
  }, [activeFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTrendingMovies();
  };

  // Callback to refresh the list when favorites/watchlist changes
  const handleListChange = () => {
    loadTrendingMovies();
  };

  const handleDebugSession = () => {
    const status = StorageService.getSessionStatus();
    console.log('Session Storage Status:', status);
    alert(`Session Status:\nFavorites: ${status.favorites}\nWatchlist: ${status.watchlist}\nWatched: ${status.watched}\nRatings: ${status.ratings}`);
  };

  const getFilterIcon = (filter: TrendingFilter) => {
    switch (filter) {
      case 'trending':
        return <TrendingUp size={16} color={Colors.white} />;
      case 'topRated':
        return <Star size={16} color={Colors.warning} />;
      case 'popular':
        return <Flame size={16} color={Colors.accent.action} />;
      case 'nowPlaying':
        return <Zap size={16} color={Colors.accent.scifi} />;
      default:
        return <TrendingUp size={16} color={Colors.white} />;
    }
  };

  const getFilterTitle = (filter: TrendingFilter) => {
    switch (filter) {
      case 'trending':
        return 'Trending Now';
      case 'topRated':
        return 'Top Rated';
      case 'popular':
        return 'Most Popular';
      case 'nowPlaying':
        return 'Now Playing';
      default:
        return 'Trending Now';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadTrendingMovies} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Netflix-style Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trending Movies</Text>
        <Text style={styles.headerSubtitle}>Discover what's hot right now</Text>
        <TouchableOpacity style={styles.debugButton} onPress={handleDebugSession}>
          <Text style={styles.debugButtonText}>Debug Session</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {(['trending', 'topRated', 'popular', 'nowPlaying'] as TrendingFilter[]).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterTab,
                activeFilter === filter && styles.filterTabActive
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              {getFilterIcon(filter)}
              <Text style={[
                styles.filterTabText,
                activeFilter === filter && styles.filterTabTextActive
              ]}>
                {getFilterTitle(filter)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Movies Grid */}
      <FlatList
        data={movies}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.movieItem}>
            <MovieCard 
              movie={item} 
              variant="poster" 
              showDetails={true}
              style={styles.movieCard}
              onFavoriteChange={handleListChange}
            />
            {/* Rating Badge */}
            <View style={styles.ratingContainer}>
              <Star size={12} color={Colors.warning} fill={Colors.warning} />
              <Text style={styles.ratingText}>
                {item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}
              </Text>
            </View>
          </View>
        )}
        numColumns={2}
        columnWrapperStyle={styles.movieRow}
        contentContainerStyle={styles.moviesGrid}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <TrendingUp size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyStateText}>No trending movies found</Text>
            <Text style={styles.emptyStateSubtext}>Try refreshing or changing filters</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  // Header Styles
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily.primary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.primary,
  },
  debugButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
  },
  debugButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily.primary,
  },

  // Filter Styles
  filterContainer: {
    backgroundColor: Colors.background,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
  },
  filterScrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.backgroundTertiary,
    gap: Spacing.xs,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
  },
  filterTabText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.primary,
  },
  filterTabTextActive: {
    color: Colors.white,
    fontWeight: Typography.fontWeight.semibold,
  },

  // Movies Grid Styles
  moviesGrid: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  movieRow: {
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  movieItem: {
    width: (screenWidth - Spacing.lg * 3) / 2,
    position: 'relative',
  },
  movieCard: {
    width: '100%',
  },
  ratingContainer: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
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

  // Empty State Styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing['4xl'],
    paddingHorizontal: Spacing.lg,
  },
  emptyStateText: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    fontFamily: Typography.fontFamily.primary,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.relaxed,
    fontFamily: Typography.fontFamily.primary,
  },
});
