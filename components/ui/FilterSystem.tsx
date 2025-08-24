import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { X, ChevronDown, ChevronUp } from 'lucide-react-native';
import Slider from '@react-native-community/slider';

import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { Genre } from '@/types/Movie';

interface FilterState {
  genres: number[];
  yearRange: { min: number; max: number };
  ratingRange: { min: number; max: number };
  sortBy: 'popularity' | 'rating' | 'release_date' | 'title';
}

interface FilterSystemProps {
  genres: Genre[];
  activeFilters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onClearAll: () => void;
}

export default function FilterSystem({
  genres,
  activeFilters,
  onFilterChange,
  onClearAll,
}: FilterSystemProps) {
  const [expandedSections, setExpandedSections] = useState({
    genres: true,
    year: false,
    rating: false,
    sort: false,
  });

  const currentYear = new Date().getFullYear();
  const sortOptions = [
    { key: 'popularity', label: 'Most Popular' },
    { key: 'rating', label: 'Highest Rated' },
    { key: 'release_date', label: 'Newest First' },
    { key: 'title', label: 'A-Z' },
  ];

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleGenreToggle = (genreId: number) => {
    const newGenres = activeFilters.genres.includes(genreId)
      ? activeFilters.genres.filter(id => id !== genreId)
      : [...activeFilters.genres, genreId];
    
    onFilterChange({
      ...activeFilters,
      genres: newGenres,
    });
  };

  const handleYearRangeChange = (values: { min: number; max: number }) => {
    onFilterChange({
      ...activeFilters,
      yearRange: values,
    });
  };

  const handleRatingRangeChange = (values: { min: number; max: number }) => {
    onFilterChange({
      ...activeFilters,
      ratingRange: values,
    });
  };

  const handleSortChange = (sortBy: FilterState['sortBy']) => {
    onFilterChange({
      ...activeFilters,
      sortBy,
    });
  };

  const renderGenreChip = ({ item }: { item: Genre }) => {
    const isSelected = activeFilters.genres.includes(item.id);
    
    return (
      <TouchableOpacity
        style={[
          styles.genreChip,
          isSelected && styles.genreChipSelected,
        ]}
        onPress={() => handleGenreToggle(item.id)}>
        <Text
          style={[
            styles.genreText,
            isSelected && styles.genreTextSelected,
          ]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSortOption = (option: typeof sortOptions[0]) => {
    const isSelected = activeFilters.sortBy === option.key;
    
    return (
      <TouchableOpacity
        key={option.key}
        style={[
          styles.sortOption,
          isSelected && styles.sortOptionSelected,
        ]}
        onPress={() => handleSortChange(option.key as FilterState['sortBy'])}>
        <Text
          style={[
            styles.sortText,
            isSelected && styles.sortTextSelected,
          ]}>
          {option.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderFilterSection = (
    title: string,
    sectionKey: keyof typeof expandedSections,
    content: React.ReactNode
  ) => {
    const isExpanded = expandedSections[sectionKey];
    
    return (
      <View style={styles.filterSection}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection(sectionKey)}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {isExpanded ? (
            <ChevronUp size={20} color={Colors.textSecondary} />
          ) : (
            <ChevronDown size={20} color={Colors.textSecondary} />
          )}
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.sectionContent}>
            {content}
          </View>
        )}
      </View>
    );
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilters.genres.length > 0) count++;
    if (activeFilters.yearRange.min > 1900 || activeFilters.yearRange.max < currentYear) count++;
    if (activeFilters.ratingRange.min > 0 || activeFilters.ratingRange.max < 10) count++;
    if (activeFilters.sortBy !== 'popularity') count++;
    return count;
  };

  return (
    <View style={styles.container}>
      {/* Filter Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Filters {getActiveFilterCount() > 0 && `(${getActiveFilterCount()})`}
        </Text>
        <TouchableOpacity onPress={onClearAll} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Genres Filter */}
        {renderFilterSection(
          'Genres',
          'genres',
          <FlatList
            data={genres}
            renderItem={renderGenreChip}
            keyExtractor={(item) => item.id.toString()}
            horizontal={false}
            numColumns={3}
            scrollEnabled={false}
            contentContainerStyle={styles.genreGrid}
          />
        )}

        {/* Year Range Filter */}
        {renderFilterSection(
          `Year (${activeFilters.yearRange.min} - ${activeFilters.yearRange.max})`,
          'year',
          <View style={styles.rangeContainer}>
            <View style={styles.rangeLabels}>
              <Text style={styles.rangeLabel}>1900</Text>
              <Text style={styles.rangeLabel}>{currentYear}</Text>
            </View>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={1900}
                maximumValue={currentYear}
                value={activeFilters.yearRange.min}
                onValueChange={(value) => handleYearRangeChange({
                  ...activeFilters.yearRange,
                  min: Math.round(value),
                })}
                minimumTrackTintColor={Colors.primary}
                maximumTrackTintColor={Colors.backgroundTertiary}
                thumbStyle={styles.sliderThumb}
              />
              <Slider
                style={styles.slider}
                minimumValue={1900}
                maximumValue={currentYear}
                value={activeFilters.yearRange.max}
                onValueChange={(value) => handleYearRangeChange({
                  ...activeFilters.yearRange,
                  max: Math.round(value),
                })}
                minimumTrackTintColor={Colors.primary}
                maximumTrackTintColor={Colors.backgroundTertiary}
                thumbStyle={styles.sliderThumb}
              />
            </View>
          </View>
        )}

        {/* Rating Range Filter */}
        {renderFilterSection(
          `Rating (${activeFilters.ratingRange.min.toFixed(1)} - ${activeFilters.ratingRange.max.toFixed(1)})`,
          'rating',
          <View style={styles.rangeContainer}>
            <View style={styles.rangeLabels}>
              <Text style={styles.rangeLabel}>0.0</Text>
              <Text style={styles.rangeLabel}>10.0</Text>
            </View>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={10}
                value={activeFilters.ratingRange.min}
                onValueChange={(value) => handleRatingRangeChange({
                  ...activeFilters.ratingRange,
                  min: Math.round(value * 10) / 10,
                })}
                minimumTrackTintColor={Colors.primary}
                maximumTrackTintColor={Colors.backgroundTertiary}
                thumbStyle={styles.sliderThumb}
              />
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={10}
                value={activeFilters.ratingRange.max}
                onValueChange={(value) => handleRatingRangeChange({
                  ...activeFilters.ratingRange,
                  max: Math.round(value * 10) / 10,
                })}
                minimumTrackTintColor={Colors.primary}
                maximumTrackTintColor={Colors.backgroundTertiary}
                thumbStyle={styles.sliderThumb}
              />
            </View>
          </View>
        )}

        {/* Sort Options */}
        {renderFilterSection(
          'Sort By',
          'sort',
          <View style={styles.sortContainer}>
            {sortOptions.map(renderSortOption)}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundSecondary,
    maxHeight: 400,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgroundTertiary,
  },
  
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
    fontFamily: Typography.fontFamily.primary,
  },
  
  clearButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
  },
  
  clearButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  
  scrollView: {
    flex: 1,
  },
  
  filterSection: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgroundTertiary,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  
  sectionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.white,
    fontFamily: Typography.fontFamily.primary,
  },
  
  sectionContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  
  genreGrid: {
    gap: Spacing.sm,
  },
  
  genreChip: {
    flex: 1,
    backgroundColor: Colors.backgroundTertiary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.xs / 2,
    marginVertical: Spacing.xs / 2,
    alignItems: 'center',
    minHeight: 32,
    justifyContent: 'center',
  },
  
  genreChipSelected: {
    backgroundColor: Colors.primary,
  },
  
  genreText: {
    color: Colors.white,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center',
  },
  
  genreTextSelected: {
    color: Colors.white,
  },
  
  rangeContainer: {
    paddingVertical: Spacing.sm,
  },
  
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  
  rangeLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.sm,
  },
  
  sliderContainer: {
    gap: Spacing.sm,
  },
  
  slider: {
    width: '100%',
    height: 40,
  },
  
  sliderThumb: {
    backgroundColor: Colors.primary,
    width: 20,
    height: 20,
  },
  
  sortContainer: {
    gap: Spacing.sm,
  },
  
  sortOption: {
    backgroundColor: Colors.backgroundTertiary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  
  sortOptionSelected: {
    backgroundColor: Colors.primary,
  },
  
  sortText: {
    color: Colors.white,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  
  sortTextSelected: {
    color: Colors.white,
  },
});