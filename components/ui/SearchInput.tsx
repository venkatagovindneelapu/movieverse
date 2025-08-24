import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Text,
  Keyboard,
  Animated,
} from 'react-native';
import { Search as SearchIcon, X, Filter } from 'lucide-react-native';

import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/Colors';
import { MovieService } from '@/services/MovieService';
import { Movie } from '@/types/Movie';
import { debounce } from '@/utils/helpers';

interface SearchInputProps {
  onSearchResults: (movies: Movie[]) => void;
  onSearchStateChange: (isSearching: boolean) => void;
  onQueryChange?: (query: string) => void;
  placeholder?: string;
  showFilters?: boolean;
  onFiltersPress?: () => void;
}

export default function SearchInput({ 
  onSearchResults, 
  onSearchStateChange,
  onQueryChange,
  placeholder = "Search movies, shows, people...",
  showFilters = false,
  onFiltersPress
}: SearchInputProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const focusAnim = new Animated.Value(0);
  const suggestionsAnim = new Animated.Value(0);

  const debouncedSearch = debounce(async (searchQuery: string) => {
    onQueryChange?.(searchQuery);
    
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      onSearchResults([]);
      onSearchStateChange(false);
      return;
    }

    try {
      setIsLoading(true);
      onSearchStateChange(true);
      
      const response = await MovieService.searchMovies(searchQuery, 1);
      const results = response.results.slice(0, 5);
      
      setSuggestions(results);
      setShowSuggestions(true);
      onSearchResults(response.results);
      
      // Animate suggestions dropdown
      Animated.spring(suggestionsAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 25,
      }).start();
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
      setShowSuggestions(false);
      onSearchResults([]);
    } finally {
      setIsLoading(false);
      onSearchStateChange(false);
    }
  }, 300);

  useEffect(() => {
    debouncedSearch(query);
  }, [query]);

  const handleFocus = () => {
    setIsFocused(true);
    Animated.spring(focusAnim, {
      toValue: 1,
      useNativeDriver: false,
      tension: 300,
      friction: 25,
    }).start();
    
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.spring(focusAnim, {
      toValue: 0,
      useNativeDriver: false,
      tension: 300,
      friction: 25,
    }).start();
    
    // Delay hiding suggestions to allow for tap
    setTimeout(() => {
      setShowSuggestions(false);
      Animated.timing(suggestionsAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }, 150);
  };

  const handleSuggestionPress = (movie: Movie) => {
    setQuery(movie.title);
    setShowSuggestions(false);
    Keyboard.dismiss();
    onSearchResults([movie]);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    onSearchResults([]);
    onSearchStateChange(false);
  };

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.backgroundTertiary, Colors.primary],
  });

  const renderSuggestion = ({ item }: { item: Movie }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionPress(item)}>
      <SearchIcon size={16} color={Colors.textSecondary} />
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.suggestionMeta}>
          {item.release_date ? new Date(item.release_date).getFullYear() : 'Unknown'} • 
          {item.vote_average ? ` ${item.vote_average.toFixed(1)} ★` : ' No rating'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.searchBar, { borderColor }]}>
        <SearchIcon size={20} color={Colors.textSecondary} />
        
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={setQuery}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={() => {
            setShowSuggestions(false);
            Keyboard.dismiss();
          }}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        {isLoading && (
          <View style={styles.loadingIndicator} />
        )}
        
        {query.length > 0 && !isLoading && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <X size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
        
        {showFilters && (
          <TouchableOpacity onPress={onFiltersPress} style={styles.filterButton}>
            <Filter size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </Animated.View>

      {showSuggestions && suggestions.length > 0 && (
        <Animated.View 
          style={[
            styles.suggestionsContainer,
            {
              opacity: suggestionsAnim,
              transform: [{
                translateY: suggestionsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-10, 0],
                })
              }]
            }
          ]}>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item) => item.id.toString()}
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    // Remove borders for seamless design
    borderWidth: 0,
    // Perfect alignment
    justifyContent: 'space-between',
    ...Shadows.sm,
  },
  
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSize.base,
    color: Colors.white,
    fontFamily: Typography.fontFamily.primary,
    paddingVertical: Spacing.xs,
  },
  
  loadingIndicator: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderTopColor: 'transparent',
    marginRight: Spacing.xs,
  },
  
  clearButton: {
    padding: Spacing.xs,
    marginRight: Spacing.xs,
  },
  
  filterButton: {
    padding: Spacing.xs,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.sm,
  },
  
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.xs,
    maxHeight: 300,
    ...Shadows.lg,
  },
  
  suggestionsList: {
    borderRadius: BorderRadius.lg,
  },
  
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgroundSecondary,
  },
  
  suggestionContent: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  
  suggestionTitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.white,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily.primary,
    marginBottom: 2,
  },
  
  suggestionMeta: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.primary,
  },
});