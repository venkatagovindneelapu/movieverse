import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Typography, Spacing } from '@/constants/Colors';
import { MovieService } from '@/services/MovieService';
import { Movie } from '@/types/Movie';
import { StorageService } from '@/services/StorageService';
import MovieCard from '@/components/ui/MovieCard';
import CategoryRow from '@/components/ui/CategoryRow';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';

const { width: screenWidth } = Dimensions.get('window');

export default function HomeScreen() {
  const isMounted = useRef(true);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMovies = async () => {
    try {
      setError(null);
      
      // Sync with TMDB account on app start
      try {
        await StorageService.syncWithTMDB();
      } catch (syncError) {
        console.warn('Failed to sync with TMDB:', syncError);
      }
      
      const [popular, trending, topRated, nowPlaying, upcoming] = await Promise.all([
        MovieService.getPopularMovies(1),
        MovieService.getTrendingMovies(1),
        MovieService.getTopRatedMovies(1),
        MovieService.getNowPlayingMovies(1),
        MovieService.getUpcomingMovies(1),
      ]);

      if (isMounted.current) {
        setPopularMovies(popular.results.slice(0, 20));
        setTrendingMovies(trending.results.slice(0, 20));
        setTopRatedMovies(topRated.results.slice(0, 20));
        setNowPlayingMovies(nowPlaying.results.slice(0, 20));
        setUpcomingMovies(upcoming.results.slice(0, 20));
      }
    } catch (err) {
      if (isMounted.current) {
        setError('Failed to load movies. Please try again.');
      }
      console.error('Error loading movies:', err);
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    loadMovies();
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadMovies();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadMovies} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Netflix-style Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>@movieverse</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
            progressBackgroundColor={Colors.backgroundSecondary}
          />
        }>
        
        {/* Category Rows */}
        <CategoryRow
          title="Trending Now"
          movies={trendingMovies}
          categoryType="trending"
        />

        <CategoryRow
          title="Popular Movies"
          movies={popularMovies}
          categoryType="popular"
        />

        <CategoryRow
          title="Now Playing"
          movies={nowPlayingMovies}
          categoryType="now_playing"
        />

        <CategoryRow
          title="Top Rated"
          movies={topRatedMovies}
          categoryType="top_rated"
        />

        <CategoryRow
          title="Coming Soon"
          movies={upcomingMovies}
          categoryType="upcoming"
        />

      </ScrollView>
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
    paddingVertical: Spacing.md,
    // Remove border for seamless design
    borderBottomWidth: 0,
    // Seamless background blending
    backgroundColor: Colors.background,
    // Perfect alignment
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  
  headerTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    fontFamily: Typography.fontFamily.primary,
    letterSpacing: -0.5,
  },
  
  content: {
    flex: 1,
  },
});