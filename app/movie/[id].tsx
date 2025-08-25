import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, 
  Star, 
  Calendar, 
  Clock, 
  Heart,
  Play,
  Share2,
  Bookmark
} from 'lucide-react-native';

import { Colors, Spacing, BorderRadius, Typography } from '@/constants/Colors';
import { MovieService } from '@/services/MovieService';
import { StorageService } from '@/services/StorageService';
import { MovieDetails, Cast, Crew, Video, Review } from '@/types/Movie';
import { formatDate, formatRuntime, formatNumber } from '@/utils/helpers';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [crew, setCrew] = useState<Crew[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  useEffect(() => {
    if (id) {
      loadMovieDetails();
      checkUserStatus();
    }
  }, [id]);

  const loadMovieDetails = async () => {
    try {
      setError(null);
      setLoading(true);

      const movieId = parseInt(id as string);
      
      const [movieData, creditsData, videosData, reviewsData] = await Promise.all([
        MovieService.getMovieDetails(movieId),
        MovieService.getMovieCredits(movieId),
        MovieService.getMovieVideos(movieId),
        MovieService.getMovieReviews(movieId),
      ]);

      setMovie(movieData);
      setCast(creditsData.cast.slice(0, 10));
      setCrew(creditsData.crew.filter(member => 
        ['Director', 'Producer', 'Writer', 'Screenplay'].includes(member.job)
      ).slice(0, 6));
      setVideos(videosData.results.filter(video => 
        video.type === 'Trailer' && video.site === 'YouTube'
      ).slice(0, 3));
      setReviews(reviewsData.results.slice(0, 3));
    } catch (err) {
      setError('Failed to load movie details. Please try again.');
      console.error('Error loading movie details:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkUserStatus = async () => {
    try {
      const movieId = parseInt(id as string);
      const [favorite, watchlist] = await Promise.all([
        StorageService.isFavorite(movieId),
        StorageService.isInWatchlist(movieId),
      ]);
      setIsFavorite(favorite);
      setIsInWatchlist(watchlist);
    } catch (error) {
      console.error('Error checking user status:', error);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!movie) return;
    
    try {
      const newStatus = await StorageService.toggleFavorite(movie);
      setIsFavorite(newStatus);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleWatchlistToggle = async () => {
    if (!movie) return;
    
    try {
      const currentStatus = await StorageService.isInWatchlist(movie.id);
      if (currentStatus) {
        await StorageService.removeFromWatchlist(movie.id);
        setIsInWatchlist(false);
      } else {
        await StorageService.addToWatchlist(movie);
        setIsInWatchlist(true);
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    }
  };

  const renderGenres = () => {
    if (!movie?.genres) return null;
    
    return (
      <View style={styles.genresContainer}>
        {movie.genres.map((genre) => (
          <View key={genre.id} style={styles.genreChip}>
            <Text style={styles.genreText}>{genre.name}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderCastMember = (member: Cast) => (
    <View key={member.id} style={styles.castCard}>
      <Image
        source={{ 
          uri: MovieService.getProfileUrl(member.profile_path) 
        }}
        style={styles.castImage}
        defaultSource={{ 
          uri: 'https://via.placeholder.com/150x225/1A1A2E/9CA3AF?text=No+Image' 
        }}
      />
      <Text style={styles.castName} numberOfLines={2}>{member.name}</Text>
      <Text style={styles.castCharacter} numberOfLines={2}>{member.character}</Text>
    </View>
  );

  const renderReview = (review: Review) => (
    <View key={review.id} style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewAuthor}>{review.author}</Text>
        {review.author_details.rating && (
          <View style={styles.reviewRating}>
            <Star size={14} color={Colors.warning} fill={Colors.warning} />
            <Text style={styles.reviewRatingText}>
              {review.author_details.rating}/10
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.reviewContent} numberOfLines={4}>
        {review.content}
      </Text>
      <Text style={styles.reviewDate}>
        {formatDate(review.created_at)}
      </Text>
    </View>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !movie) {
    return <ErrorMessage message={error || 'Movie not found'} onRetry={loadMovieDetails} />;
  }

  const backdropUrl = MovieService.getBackdropUrl(movie.backdrop_path);
  const posterUrl = MovieService.getPosterUrl(movie.poster_path);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Header with Backdrop */}
        <View style={styles.headerContainer}>
          <Image source={{ uri: backdropUrl }} style={styles.backdrop} />
          
          <LinearGradient
            colors={['transparent', 'rgba(15, 15, 35, 0.8)', Colors.background]}
            style={styles.backdropGradient}
          />

          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.white} />
          </TouchableOpacity>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, isFavorite && styles.actionButtonActive]}
              onPress={handleFavoriteToggle}>
              <Heart 
                size={20} 
                color={isFavorite ? Colors.white : Colors.textSecondary}
                fill={isFavorite ? Colors.error : 'transparent'}
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, isInWatchlist && styles.actionButtonActive]}
              onPress={handleWatchlistToggle}>
              <Bookmark 
                size={20} 
                color={isInWatchlist ? Colors.white : Colors.textSecondary}
                fill={isInWatchlist ? Colors.primary : 'transparent'}
              />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Share2 size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Movie Info */}
        <View style={styles.movieInfo}>
          <View style={styles.posterAndDetails}>
            <Image source={{ uri: posterUrl }} style={styles.poster} />
            
            <View style={styles.movieDetails}>
              <Text style={styles.title}>{movie.title}</Text>
              
              {movie.tagline && (
                <Text style={styles.tagline}>"{movie.tagline}"</Text>
              )}
              
              <View style={styles.metaInfo}>
                <View style={styles.metaItem}>
                  <Calendar size={16} color={Colors.textSecondary} />
                  <Text style={styles.metaText}>
                    {formatDate(movie.release_date)}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Clock size={16} color={Colors.textSecondary} />
                  <Text style={styles.metaText}>
                    {formatRuntime(movie.runtime)}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Star size={16} color={Colors.warning} fill={Colors.warning} />
                  <Text style={styles.metaText}>
                    {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'} ({formatNumber(movie.vote_count)})
                  </Text>
                </View>
              </View>

              {renderGenres()}
            </View>
          </View>

          {/* Play Trailer Button */}
          {videos.length > 0 && (
            <TouchableOpacity style={styles.playButton}>
              <Play size={20} color={Colors.white} fill={Colors.white} />
              <Text style={styles.playButtonText}>Watch Trailer</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.overview}>{movie.overview}</Text>
        </View>

        {/* Cast */}
        {cast.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cast</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.castList}>
              {cast.map(renderCastMember)}
            </ScrollView>
          </View>
        )}

        {/* Crew */}
        {crew.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Crew</Text>
            <View style={styles.crewContainer}>
              <View style={styles.crewColumn}>
                {crew.filter((_, index) => index % 2 === 0).map((member) => (
                  <View key={`${member.id}-${member.job}`} style={styles.crewItem}>
                    <Text style={styles.crewName}>{member.name}</Text>
                    <Text style={styles.crewJob}>{member.job}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.crewColumn}>
                {crew.filter((_, index) => index % 2 === 1).map((member) => (
                  <View key={`${member.id}-${member.job}`} style={styles.crewItem}>
                    <Text style={styles.crewName}>{member.name}</Text>
                    <Text style={styles.crewJob}>{member.job}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            {reviews.map(renderReview)}
          </View>
        )}

        {/* Movie Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailsContainer}>
            <View style={styles.detailsColumn}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Budget</Text>
                <Text style={styles.detailValue}>
                  {movie.budget > 0 ? `$${formatNumber(movie.budget)}` : 'N/A'}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Revenue</Text>
                <Text style={styles.detailValue}>
                  {movie.revenue > 0 ? `$${formatNumber(movie.revenue)}` : 'N/A'}
                </Text>
              </View>
            </View>
            <View style={styles.detailsColumn}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Status</Text>
                <Text style={styles.detailValue}>{movie.status}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Language</Text>
                <Text style={styles.detailValue}>
                  {movie.original_language.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    position: 'relative',
    height: screenHeight * 0.4,
  },
  backdrop: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backdropGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 25,
    padding: 12,
  },
  actionButtons: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 25,
    padding: 12,
  },
  actionButtonActive: {
    backgroundColor: Colors.primary,
  },
  movieInfo: {
    padding: 20,
    marginTop: -50,
  },
  posterAndDetails: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  movieDetails: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 5,
    lineHeight: 28,
  },
  tagline: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 15,
    lineHeight: 20,
  },
  metaInfo: {
    marginBottom: 15,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreChip: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  genreText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '600',
  },
  playButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 10,
  },
  playButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 15,
  },
  overview: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  castList: {
    paddingLeft: 0,
  },
  castCard: {
    width: 100,
    marginRight: 15,
    alignItems: 'center',
  },
  castImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
    resizeMode: 'cover',
  },
  castName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  castCharacter: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  crewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  crewItem: {
    backgroundColor: Colors.backgroundTertiary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  crewName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  crewJob: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  reviewCard: {
    backgroundColor: Colors.backgroundTertiary,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewAuthor: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewRatingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  reviewContent: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  reviewDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  
  // New multi-column layout styles
  detailsContainer: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  
  detailsColumn: {
    flex: 1,
  },
  
  detailItem: {
    backgroundColor: Colors.backgroundTertiary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.backgroundSecondary,
  },
  
  detailLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily.primary,
    textAlign: 'center',
  },
  
  detailValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
    textAlign: 'center',
    fontFamily: Typography.fontFamily.primary,
  },
  
  crewContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  
  crewColumn: {
    flex: 1,
  },
});