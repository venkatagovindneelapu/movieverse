import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Sparkles, TrendingUp, Star, Clock } from 'lucide-react-native';

import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { Movie } from '@/types/Movie';
import MovieCard from '@/components/ui/MovieCard';

interface RecommendationEngineProps {
  recommendations: Movie[];
  onMoviePress: (movie: Movie) => void;
}

interface RecommendationCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  movies: Movie[];
  algorithm: string;
}

const { width: screenWidth } = Dimensions.get('window');

export default function RecommendationEngine({
  recommendations,
  onMoviePress,
}: RecommendationEngineProps) {
  const [categories, setCategories] = useState<RecommendationCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('trending');

  useEffect(() => {
    generateRecommendationCategories();
  }, [recommendations]);

  const generateRecommendationCategories = () => {
    if (recommendations.length === 0) return;

    // Split recommendations into different categories
    const trending = recommendations
      .filter(movie => movie.popularity > 50)
      .slice(0, 10);

    const topRated = recommendations
      .filter(movie => movie.vote_average >= 7.5)
      .sort((a, b) => b.vote_average - a.vote_average)
      .slice(0, 10);

    const recent = recommendations
      .filter(movie => {
        if (!movie.release_date) return false;
        const releaseYear = new Date(movie.release_date).getFullYear();
        const currentYear = new Date().getFullYear();
        return currentYear - releaseYear <= 3;
      })
      .slice(0, 10);

    const personalized = shuffleArray(recommendations).slice(0, 10);

    const recommendationCategories: RecommendationCategory[] = [
      {
        id: 'trending',
        title: 'Trending Now',
        icon: <TrendingUp size={16} color={Colors.primary} />,
        movies: trending,
        algorithm: 'Based on current popularity metrics',
      },
      {
        id: 'top_rated',
        title: 'Highly Rated',
        icon: <Star size={16} color={Colors.warning} />,
        movies: topRated,
        algorithm: 'Movies with high user ratings',
      },
      {
        id: 'recent',
        title: 'Recent Releases',
        icon: <Clock size={16} color={Colors.info} />,
        movies: recent,
        algorithm: 'Recently released movies',
      },
      {
        id: 'personalized',
        title: 'For You',
        icon: <Sparkles size={16} color={Colors.accent.romance} />,
        movies: personalized,
        algorithm: 'Personalized recommendations',
      },
    ].filter(category => category.movies.length > 0);

    setCategories(recommendationCategories);
  };

  const renderCategoryTab = ({ item }: { item: RecommendationCategory }) => {
    const isSelected = selectedCategory === item.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.categoryTab,
          isSelected && styles.categoryTabSelected,
        ]}
        onPress={() => setSelectedCategory(item.id)}>
        {item.icon}
        <Text
          style={[
            styles.categoryTabText,
            isSelected && styles.categoryTabTextSelected,
          ]}>
          {item.title}
        </Text>
        <View style={styles.movieCount}>
          <Text style={styles.movieCountText}>{item.movies.length}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderRecommendedMovie = ({ item, index }: { item: Movie; index: number }) => (
    <TouchableOpacity
      style={[
        styles.recommendedMovie,
        { marginLeft: index === 0 ? Spacing.lg : Spacing.sm }
      ]}
      onPress={() => onMoviePress(item)}>
      <MovieCard
        movie={item}
        variant="poster"
        style={styles.movieCard}
      />
    </TouchableOpacity>
  );

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  if (categories.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Recommended for You</Text>
        <Text style={styles.subtitle}>
          Discover movies tailored to your taste
        </Text>
      </View>

      {/* Category Tabs */}
      <FlatList
        data={categories}
        renderItem={renderCategoryTab}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryTabs}
        style={styles.categoryTabsList}
      />

      {/* Algorithm Info */}
      {selectedCategoryData && (
        <View style={styles.algorithmInfo}>
          <Text style={styles.algorithmText}>
            {selectedCategoryData.algorithm}
          </Text>
        </View>
      )}

      {/* Recommended Movies */}
      {selectedCategoryData && (
        <FlatList
          data={selectedCategoryData.movies}
          renderItem={renderRecommendedMovie}
          keyExtractor={(item) => `${selectedCategory}-${item.id}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.moviesList}
          snapToInterval={160}
          decelerationRate="fast"
          initialNumToRender={3}
          maxToRenderPerBatch={2}
          windowSize={5}
        />
      )}
    </View>
  );
}

// Utility function
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  
  header: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
    fontFamily: Typography.fontFamily.primary,
    marginBottom: Spacing.xs,
  },
  
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.primary,
  },
  
  categoryTabsList: {
    marginBottom: Spacing.md,
  },
  
  categoryTabs: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundTertiary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xl,
    gap: Spacing.xs,
    minHeight: 36,
  },
  
  categoryTabSelected: {
    backgroundColor: Colors.primary,
  },
  
  categoryTabText: {
    color: Colors.white,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily.primary,
  },
  
  categoryTabTextSelected: {
    color: Colors.white,
  },
  
  movieCount: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.xs,
  },
  
  movieCountText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
  },
  
  algorithmInfo: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  
  algorithmText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    fontStyle: 'italic',
    fontFamily: Typography.fontFamily.primary,
  },
  
  moviesList: {
    paddingRight: Spacing.lg,
  },
  
  recommendedMovie: {
    width: 140,
    marginRight: Spacing.sm,
  },
  
  movieCard: {
    width: '100%',
  },
});