import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

import { Colors } from '@/constants/Colors';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export default function SkeletonLoader({ 
  width = '100%', 
  height = 20, 
  borderRadius = 4,
  style 
}: SkeletonLoaderProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.backgroundTertiary, Colors.textSecondary + '40'],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
}

// Skeleton components for different UI elements
export function MovieCardSkeleton() {
  return (
    <View style={styles.movieCardSkeleton}>
      <SkeletonLoader height={240} borderRadius={12} />
      <View style={styles.movieCardContent}>
        <SkeletonLoader height={16} width="80%" style={{ marginBottom: 8 }} />
        <SkeletonLoader height={14} width="60%" />
      </View>
    </View>
  );
}

export function MovieListSkeleton() {
  return (
    <View style={styles.movieListSkeleton}>
      <SkeletonLoader height={120} width={80} borderRadius={8} />
      <View style={styles.movieListContent}>
        <SkeletonLoader height={18} width="70%" style={{ marginBottom: 8 }} />
        <SkeletonLoader height={14} width="50%" style={{ marginBottom: 8 }} />
        <SkeletonLoader height={14} width="90%" style={{ marginBottom: 4 }} />
        <SkeletonLoader height={14} width="80%" />
      </View>
    </View>
  );
}

export function MovieDetailSkeleton() {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  
  return (
    <View style={styles.movieDetailSkeleton}>
      <SkeletonLoader height={screenHeight * 0.4} borderRadius={0} />
      <View style={styles.movieDetailContent}>
        <View style={styles.posterAndDetails}>
          <SkeletonLoader height={180} width={120} borderRadius={12} />
          <View style={styles.movieDetails}>
            <SkeletonLoader height={24} width="90%" style={{ marginBottom: 8 }} />
            <SkeletonLoader height={16} width="70%" style={{ marginBottom: 12 }} />
            <SkeletonLoader height={14} width="60%" style={{ marginBottom: 6 }} />
            <SkeletonLoader height={14} width="50%" style={{ marginBottom: 6 }} />
            <SkeletonLoader height={14} width="80%" />
          </View>
        </View>
        <SkeletonLoader height={50} borderRadius={25} style={{ marginTop: 20 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.backgroundTertiary,
  },
  movieCardSkeleton: {
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 8,
    width: 160,
  },
  movieCardContent: {
    padding: 12,
  },
  movieListSkeleton: {
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 12,
    flexDirection: 'row',
    padding: 12,
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  movieListContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  movieDetailSkeleton: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  movieDetailContent: {
    padding: 20,
    marginTop: -50,
  },
  posterAndDetails: {
    flexDirection: 'row',
  },
  movieDetails: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'flex-end',
  },
});