import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SearchSuggestion, SearchQuery } from '../../types';

interface SearchSuggestionsProps {
  suggestions: SearchSuggestion[];
  recentSearches: SearchQuery[];
  popularSearches: SearchSuggestion[];
  onSuggestionPress: (suggestion: string) => void;
  onRecentSearchPress: (search: SearchQuery) => void;
  onRemoveRecentSearch: (searchId: string) => void;
  loading?: boolean;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  suggestions,
  recentSearches,
  popularSearches,
  onSuggestionPress,
  onRecentSearchPress,
  onRemoveRecentSearch,
  loading = false,
}) => {
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'query':
        return 'search';
      case 'category':
        return 'folder';
      case 'recent':
        return 'time';
      case 'popular':
        return 'trending-up';
      case 'personalized':
        return 'person';
      default:
        return 'search';
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'popular':
        return '#E31E24';
      case 'personalized':
        return '#D4AF37';
      case 'category':
        return '#2E8B57';
      case 'recent':
        return '#666666';
      default:
        return '#999999';
    }
  };

  const renderSuggestion = (suggestion: SearchSuggestion, index: number) => (
    <TouchableOpacity
      key={suggestion.id}
      style={styles.suggestionItem}
      onPress={() => onSuggestionPress(suggestion.textAr)}
    >
      <View style={styles.suggestionContent}>
        <Ionicons
          name={getSuggestionIcon(suggestion.type) as any}
          size={16}
          color={getSuggestionColor(suggestion.type)}
        />
        <Text style={styles.suggestionText}>{suggestion.textAr}</Text>
        {suggestion.metadata.trending && (
          <View style={styles.trendingBadge}>
            <Ionicons name="flame" size={12} color="#FF4444" />
          </View>
        )}
      </View>
      <Ionicons name="arrow-up-outline" size={16} color="#CCCCCC" />
    </TouchableOpacity>
  );

  const renderRecentSearch = (search: SearchQuery, index: number) => (
    <TouchableOpacity
      key={search.id}
      style={styles.recentItem}
      onPress={() => onRecentSearchPress(search)}
    >
      <View style={styles.recentContent}>
        <Ionicons name="time" size={16} color="#666666" />
        <View style={styles.recentTextContainer}>
          <Text style={styles.recentText} numberOfLines={1}>
            {search.queryAr || search.query}
          </Text>
          <Text style={styles.recentMeta}>
            {search.totalResults} نتيجة •{' '}
            {new Intl.DateTimeFormat('ar-TN', {
              month: 'short',
              day: 'numeric',
            }).format(search.timestamp)}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => onRemoveRecentSearch(search.id)}
      >
        <Ionicons name="close" size={16} color="#999999" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderPopularSearch = (search: SearchSuggestion, index: number) => (
    <TouchableOpacity
      key={search.id}
      style={styles.popularItem}
      onPress={() => onSuggestionPress(search.textAr)}
    >
      <View style={styles.popularRank}>
        <Text style={styles.rankNumber}>{index + 1}</Text>
      </View>
      <View style={styles.popularContent}>
        <Text style={styles.popularText} numberOfLines={1}>
          {search.textAr}
        </Text>
        <View style={styles.popularMeta}>
          <Ionicons name="trending-up" size={12} color="#E31E24" />
          <Text style={styles.popularMetaText}>
            {Math.round(search.popularity)} عملية بحث
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#CCCCCC" />
    </TouchableOpacity>
  );

  const renderLoadingSkeleton = () => (
    <View style={styles.loadingContainer}>
      {[1, 2, 3, 4, 5].map(index => (
        <View key={index} style={styles.skeletonItem}>
          <View style={styles.skeletonIcon} />
          <View style={styles.skeletonText} />
        </View>
      ))}
    </View>
  );

  if (loading) {
    return renderLoadingSkeleton();
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Live Suggestions */}
      {suggestions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اقتراحات البحث</Text>
          <View style={styles.sectionContent}>
            {suggestions.map(renderSuggestion)}
          </View>
        </View>
      )}

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>البحث الأخير</Text>
            <TouchableOpacity style={styles.clearButton}>
              <Text style={styles.clearButtonText}>مسح الكل</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sectionContent}>
            {recentSearches.slice(0, 5).map(renderRecentSearch)}
          </View>
        </View>
      )}

      {/* Popular Searches */}
      {popularSearches.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>البحث الشائع</Text>
          <View style={styles.sectionContent}>
            {popularSearches.slice(0, 8).map(renderPopularSearch)}
          </View>
        </View>
      )}

      {/* Quick Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>التصنيفات السريعة</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoriesContainer}>
            {[
              { name: 'قانون الأعمال', icon: 'business', color: '#E31E24' },
              { name: 'قانون الأسرة', icon: 'home', color: '#D4AF37' },
              { name: 'قانون العمل', icon: 'people', color: '#2E8B57' },
              { name: 'الضرائب', icon: 'calculator', color: '#FF8C00' },
              { name: 'العقارات', icon: 'location', color: '#9C27B0' },
              { name: 'البيئة', icon: 'leaf', color: '#4CAF50' },
            ].map((category, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.categoryChip, { borderColor: category.color }]}
                onPress={() => onSuggestionPress(category.name)}
              >
                <Ionicons
                  name={category.icon as any}
                  size={16}
                  color={category.color}
                />
                <Text style={[styles.categoryText, { color: category.color }]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Search Tips */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>نصائح البحث</Text>
        <View style={styles.tipsContainer}>
          <View style={styles.tipItem}>
            <Ionicons name="bulb" size={16} color="#D4AF37" />
            <Text style={styles.tipText}>
              استخدم كلمات مفتاحية محددة للحصول على نتائج أدق
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="filter" size={16} color="#D4AF37" />
            <Text style={styles.tipText}>
              استخدم الفلاتر لتضييق نطاق البحث حسب المصدر والتاريخ
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="bookmark" size={16} color="#D4AF37" />
            <Text style={styles.tipText}>
              احفظ عمليات البحث المهمة للوصول السريع لاحقاً
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  clearButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#E31E24',
    fontWeight: '500',
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  suggestionText: {
    fontSize: 16,
    color: '#1A1A1A',
    marginLeft: 12,
    flex: 1,
  },
  trendingBadge: {
    marginLeft: 8,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  recentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recentTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  recentText: {
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 2,
  },
  recentMeta: {
    fontSize: 12,
    color: '#666666',
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popularItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  popularRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E31E24',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  popularContent: {
    flex: 1,
  },
  popularText: {
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 2,
  },
  popularMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  popularMetaText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tipsContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
  loadingContainer: {
    padding: 16,
  },
  skeletonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    borderRadius: 8,
  },
  skeletonIcon: {
    width: 16,
    height: 16,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    marginRight: 12,
  },
  skeletonText: {
    flex: 1,
    height: 16,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
  },
});
