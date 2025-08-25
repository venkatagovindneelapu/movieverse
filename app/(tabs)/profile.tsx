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
import { Heart, Star, Bookmark, Clock, Eye, Trash2 } from 'lucide-react-native';

import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/Colors';
import { StorageService } from '@/services/StorageService';
import { Movie } from '@/types/Movie';
import MovieCard from '@/components/ui/MovieCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';

const { width: screenWidth } = Dimensions.get('window');

type ListFilter = 'favorites' | 'watchlist' | 'watched' | 'all';

export default function ProfileScreen() {
  const isMounted = useRef(true);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<ListFilter>('favorites');

  const loadMyList = async () => {
    try {
      setError(null);
      let movieList: Movie[] = [];

      switch (activeFilter) {
        case 'favorites':
          movieList = await StorageService.getFavorites();
          console.log('Loaded favorites:', movieList.length);
          break;
        case 'watchlist':
          movieList = await StorageService.getWatchlist();
          console.log('Loaded watchlist:', movieList.length);
          break;
        case 'watched':
          movieList = await StorageService.getWatched();
          console.log('Loaded watched:', movieList.length);
          break;
        case 'all':
          const [favorites, watchlist, watched] = await Promise.all([
            StorageService.getFavorites(),
            StorageService.getWatchlist(),
            StorageService.getWatched(),
          ]);
          console.log('Loaded all lists - favorites:', favorites.length, 'watchlist:', watchlist.length, 'watched:', watched.length);
          // Combine and remove duplicates
          const allMovies = [...favorites, ...watchlist, ...watched];
          const uniqueMovies = allMovies.filter((movie, index, self) => 
            index === self.findIndex(m => m.id === movie.id)
          );
          movieList = uniqueMovies;
          break;
      }

      if (isMounted.current) {
        console.log('Setting movies for filter:', activeFilter, 'count:', movieList.length);
        setMovies(movieList);
      }
    } catch (err) {
      if (isMounted.current) {
        setError('Failed to load your list. Please try again.');
      }
      console.error('Error loading my list:', err);
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  // Callback to refresh the list when favorites/watchlist changes
  const handleListChange = () => {
    loadMyList();
  };

  const handleDebugSession = () => {
    const status = StorageService.getSessionStatus();
    console.log('Session Storage Status:', status);
    alert(`Session Status:\nFavorites: ${status.favorites}\nWatchlist: ${status.watchlist}\nWatched: ${status.watched}\nRatings: ${status.ratings}`);
  };

  useEffect(() => {
    loadMyList();
    
    return () => {
      isMounted.current = false;
    };
  }, [activeFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    loadMyList();
  };

  const getFilterIcon = (filter: ListFilter) => {
    switch (filter) {
      case 'favorites':
        return <Heart size={16} color={Colors.primary} />;
      case 'watchlist':
        return <Bookmark size={16} color={Colors.accent.scifi} />;
      case 'watched':
        return <Eye size={16} color={Colors.accent.documentary} />;
      case 'all':
        return <Star size={16} color={Colors.warning} />;
      default:
        return <Heart size={16} color={Colors.primary} />;
    }
  };

  const getFilterTitle = (filter: ListFilter) => {
    switch (filter) {
      case 'favorites':
        return 'Favorites';
      case 'watchlist':
        return 'Watchlist';
      case 'watched':
        return 'Watched';
      case 'all':
        return 'All Lists';
      default:
        return 'Favorites';
    }
  };

  const getFilterCount = (filter: ListFilter) => {
    switch (filter) {
      case 'favorites':
        return movies.filter(m => m.isFavorite).length;
      case 'watchlist':
        return movies.filter(m => m.isInWatchlist).length;
      case 'watched':
        return movies.filter(m => m.isWatched).length;
      case 'all':
        return movies.length;
      default:
        return 0;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadMyList} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Netflix-style Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My List</Text>
        <Text style={styles.headerSubtitle}>Your personal movie collection</Text>
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
          {(['favorites', 'watchlist', 'watched', 'all'] as ListFilter[]).map((filter) => (
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
              <View style={styles.filterCount}>
                <Text style={[
                  styles.filterCountText,
                  activeFilter === filter && styles.filterCountTextActive
                ]}>
                  {getFilterCount(filter)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Movies Grid */}
      {movies.length > 0 ? (
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
              {/* Status Badge */}
              <View style={styles.statusContainer}>
                {item.isFavorite && (
                  <View style={[styles.statusBadge, styles.favoriteBadge]}>
                    <Heart size={10} color={Colors.primary} fill={Colors.primary} />
                  </View>
                )}
                {item.isInWatchlist && (
                  <View style={[styles.statusBadge, styles.watchlistBadge]}>
                    <Bookmark size={10} color={Colors.accent.scifi} fill={Colors.accent.scifi} />
                  </View>
                )}
                {item.isWatched && (
                  <View style={[styles.statusBadge, styles.watchedBadge]}>
                    <Eye size={10} color={Colors.accent.documentary} fill={Colors.accent.documentary} />
                  </View>
                )}
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
        />
      ) : (
        <View style={styles.emptyState}>
          <Heart size={48} color={Colors.textSecondary} />
          <Text style={styles.emptyStateText}>Your list is empty</Text>
          <Text style={styles.emptyStateSubtext}>
            {activeFilter === 'favorites' && 'Start adding movies to your favorites'}
            {activeFilter === 'watchlist' && 'Add movies to your watchlist'}
            {activeFilter === 'watched' && 'Mark movies as watched'}
            {activeFilter === 'all' && 'Start building your movie collection'}
          </Text>
        </View>
      )}
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
  filterCount: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  filterCountText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.primary,
  },
  filterCountTextActive: {
    color: Colors.white,
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
  statusContainer: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    gap: 4,
  },
  statusBadge: {
    borderRadius: BorderRadius.full,
    padding: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  favoriteBadge: {
    backgroundColor: 'rgba(229, 9, 20, 0.9)',
  },
  watchlistBadge: {
    backgroundColor: 'rgba(52, 152, 219, 0.9)',
  },
  watchedBadge: {
    backgroundColor: 'rgba(39, 174, 96, 0.9)',
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
