import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';

import { Colors, Typography, Spacing, Animation } from '@/constants/Colors';
import { Movie } from '@/types/Movie';
import MovieCard from './MovieCard';

interface CategoryRowProps {
  title: string;
  movies: Movie[];
  categoryType?: string;
  onSeeAll?: () => void;
}

export default function CategoryRow({ 
  title, 
  movies, 
  categoryType,
  onSeeAll 
}: CategoryRowProps) {
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleSeeAll = () => {
    if (onSeeAll) {
      onSeeAll();
    } else if (categoryType) {
      router.push({
        pathname: '/category/[type]',
        params: { type: categoryType, title },
      });
    }
  };

  const renderMovie = ({ item, index }: { item: Movie; index: number }) => {
    const inputRange = [
      (index - 1) * 160,
      index * 160,
      (index + 1) * 160,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View 
        style={[
          styles.movieContainer,
          {
            transform: [{ scale }],
            opacity,
          }
        ]}>
        <MovieCard 
          movie={item} 
          variant="poster"
          showDetails={false}
        />
      </Animated.View>
    );
  };

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        
        <TouchableOpacity 
          style={styles.seeAllButton}
          onPress={handleSeeAll}>
          <Text style={styles.seeAllText}>See All</Text>
          <ChevronRight size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <Animated.FlatList
        data={movies}
        renderItem={renderMovie}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.moviesList}
        snapToInterval={160}
        decelerationRate="fast"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        getItemLayout={(data, index) => ({
          length: 160,
          offset: 160 * index,
          index,
        })}
        initialNumToRender={3}
        maxToRenderPerBatch={5}
        windowSize={10}
        removeClippedSubviews={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
    // Seamless integration
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
    fontFamily: Typography.fontFamily.primary,
  },
  
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  
  seeAllText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily.primary,
  },
  
  moviesList: {
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.lg,
  },
  
  movieContainer: {
    width: 140,
    marginRight: Spacing.md,
  },
});