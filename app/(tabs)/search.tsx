import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search as SearchIcon, X } from 'lucide-react-native';

import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { MovieService } from '@/services/MovieService';
import { Movie } from '@/types/Movie';
import MovieCard from '@/components/ui/MovieCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { debounce } from '@/utils/helpers';

export default function SearchScreen() {
  const isMounted = useRef(true);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const debouncedSearch = debounce(async (query: string) => {
    if (query.trim().length < 2) {
      if (isMounted.current) {
        setSearchResults([]);
        setHasSearched(false);
        setIsSearching(false);
      }
      return;
    }

    try {
      setIsSearching(true);
      setError(null);
      setHasSearched(true);
      
      const response = await MovieService.searchMovies(query, 1);
      
      if (isMounted.current) {
        setSearchResults(response.results);
      }
    } catch (err) {
      if (isMounted.current) {
        setError('Search failed. Please try again.');
        setSearchResults([]);
      }
      console.error('Search error:', err);
    } finally {
      if (isMounted.current) {
        setIsSearching(false);
      }
    }
  }, 300);

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
    setError(null);
  };

  const renderMovie = ({ item }: { item: Movie }) => (
    <View style={styles.movieCardContainer}>
      <MovieCard 
        movie={item} 
        variant="poster"
        showDetails={true}
      />
    </View>
  );

  const renderEmptyState = () => {
    if (isSearching) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      );
    }

    if (!hasSearched) {
      return (
        <View style={styles.centerContainer}>
          <SearchIcon size={60} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>Search for Movies</Text>
          <Text style={styles.emptyText}>
            Enter a movie title to find your next favorite film
          </Text>
        </View>
      );
    }

    if (searchResults.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyTitle}>No Results Found</Text>
          <Text style={styles.emptyText}>
            Try searching with different keywords
          </Text>
        </View>
      );
    }

    return null;
  };

  if (error) {
    return <ErrorMessage message={error} onRetry={() => debouncedSearch(searchQuery)} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <SearchIcon size={20} color={Colors.textSecondary} />
          
          <TextInput
            style={styles.searchInput}
            placeholder="Search movies..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          {isSearching && (
            <ActivityIndicator size="small" color={Colors.primary} />
          )}
          
          {searchQuery.length > 0 && !isSearching && (
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
              <X size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results Count */}
      {hasSearched && searchResults.length > 0 && (
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
          </Text>
        </View>
      )}

      {/* Search Results */}
      <FlatList
        data={searchResults}
        renderItem={renderMovie}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.resultsGrid}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={10}
        removeClippedSubviews={true}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    fontFamily: Typography.fontFamily.primary,
    letterSpacing: -0.5,
  },
  
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 0,
  },
  
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSize.base,
    color: Colors.white,
    fontFamily: Typography.fontFamily.primary,
    paddingVertical: Spacing.xs,
  },
  
  clearButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  
  resultsHeader: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  
  resultsCount: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.primary,
  },
  
  resultsList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  
  movieCard: {
    width: '48%',
    marginBottom: Spacing.lg,
    marginHorizontal: '1%',
  },
  
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['4xl'],
    paddingHorizontal: Spacing.lg,
  },
  
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    fontFamily: Typography.fontFamily.primary,
    textAlign: 'center',
  },
  
  emptyText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.relaxed,
    fontFamily: Typography.fontFamily.primary,
  },
  
  loadingText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    fontFamily: Typography.fontFamily.primary,
  },
  
  resultsGrid: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  
  movieCardContainer: {
    width: '48%',
    marginBottom: Spacing.lg,
  },
  
  separator: {
    height: Spacing.md,
  },
});