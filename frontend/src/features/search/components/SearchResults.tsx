import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SearchResult } from '../../types';

interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  onResultPress: (result: SearchResult) => void;
  onBookmarkPress: (result: SearchResult) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  loading,
  onResultPress,
  onBookmarkPress,
  onLoadMore,
  hasMore = false,
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-TN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'government':
        return 'business';
      case 'parliamentary':
        return 'library';
      case 'ministry':
        return 'shield-checkmark';
      case 'legal_database':
        return 'document-text';
      case 'court':
        return 'scale';
      case 'academic':
        return 'school';
      default:
        return 'document';
    }
  };

  const getSourceColor = (sourceType: string) => {
    switch (sourceType) {
      case 'government':
        return '#E31E24';
      case 'parliamentary':
        return '#D4AF37';
      case 'ministry':
        return '#2E8B57';
      case 'legal_database':
        return '#9C27B0';
      case 'court':
        return '#FF8C00';
      case 'academic':
        return '#4CAF50';
      default:
        return '#666666';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'business_law':
        return '#E31E24';
      case 'tax_law':
        return '#D4AF37';
      case 'labor_law':
        return '#2E8B57';
      case 'family_law':
        return '#9C27B0';
      case 'administrative_law':
        return '#FF8C00';
      case 'environmental_law':
        return '#4CAF50';
      default:
        return '#666666';
    }
  };

  const renderHighlightedText = (text: string, highlights: any[]) => {
    if (!highlights || highlights.length === 0) {
      return <Text style={styles.resultExcerpt}>{text}</Text>;
    }

    // Simple highlighting - in a real app, you'd parse the highlight markers
    const highlightedText = text
      .replace(/<mark>/g, '')
      .replace(/<\/mark>/g, '');
    return <Text style={styles.resultExcerpt}>{highlightedText}</Text>;
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() => onResultPress(item)}
      activeOpacity={0.7}
    >
      {/* Header with source and bookmark */}
      <View style={styles.resultHeader}>
        <View style={styles.sourceInfo}>
          <View
            style={[
              styles.sourceIcon,
              { backgroundColor: getSourceColor(item.source.type) },
            ]}
          >
            <Ionicons
              name={getSourceIcon(item.source.type) as any}
              size={14}
              color="#FFFFFF"
            />
          </View>
          <View style={styles.sourceText}>
            <Text style={styles.sourceName}>{item.source.nameAr}</Text>
            <Text style={styles.sourceDate}>
              {formatDate(item.publishedAt)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.bookmarkButton}
          onPress={() => onBookmarkPress(item)}
        >
          <Ionicons
            name={item.isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={item.isBookmarked ? '#E31E24' : '#666666'}
          />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text style={styles.resultTitle} numberOfLines={2}>
        {item.titleAr}
      </Text>

      {/* Excerpt with highlights */}
      <View style={styles.excerptContainer}>
        {renderHighlightedText(item.excerptAr, item.highlights)}
      </View>

      {/* Tags and category */}
      <View style={styles.resultFooter}>
        <View style={styles.tagsContainer}>
          <View
            style={[
              styles.categoryTag,
              { backgroundColor: getCategoryColor(item.category) },
            ]}
          >
            <Text style={styles.categoryTagText}>
              {item.category === 'business_law'
                ? 'قانون الأعمال'
                : item.category === 'tax_law'
                  ? 'قانون الضرائب'
                  : item.category === 'labor_law'
                    ? 'قانون العمل'
                    : item.category === 'family_law'
                      ? 'قانون الأسرة'
                      : item.category === 'administrative_law'
                        ? 'القانون الإداري'
                        : item.category === 'environmental_law'
                          ? 'قانون البيئة'
                          : 'قانوني'}
            </Text>
          </View>

          {item.tagsAr.slice(0, 2).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.metaInfo}>
          <View style={styles.relevanceScore}>
            <Ionicons name="star" size={12} color="#D4AF37" />
            <Text style={styles.scoreText}>
              {Math.round(item.relevanceScore * 100)}%
            </Text>
          </View>

          <View style={styles.viewCount}>
            <Ionicons name="eye" size={12} color="#666666" />
            <Text style={styles.viewCountText}>{item.viewCount}</Text>
          </View>
        </View>
      </View>

      {/* Confidence indicator */}
      <View style={styles.confidenceBar}>
        <View
          style={[
            styles.confidenceFill,
            { width: `${item.metadata.confidence * 100}%` },
          ]}
        />
      </View>
    </TouchableOpacity>
  );

  const renderLoadMoreButton = () => {
    if (!hasMore) return null;

    return (
      <TouchableOpacity style={styles.loadMoreButton} onPress={onLoadMore}>
        <LinearGradient
          colors={['#E31E24', '#D4AF37']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.loadMoreGradient}
        >
          <Text style={styles.loadMoreText}>تحميل المزيد</Text>
          <Ionicons name="chevron-down" size={16} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name="search" size={48} color="#CCCCCC" />
      </View>
      <Text style={styles.emptyTitle}>لا توجد نتائج</Text>
      <Text style={styles.emptySubtitle}>
        جرب تعديل كلمات البحث أو الفلاتر للحصول على نتائج أفضل
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingState}>
      {[1, 2, 3].map(index => (
        <View key={index} style={styles.skeletonCard}>
          <View style={styles.skeletonHeader}>
            <View style={styles.skeletonSource} />
            <View style={styles.skeletonBookmark} />
          </View>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonExcerpt} />
          <View style={styles.skeletonFooter}>
            <View style={styles.skeletonTag} />
            <View style={styles.skeletonMeta} />
          </View>
        </View>
      ))}
    </View>
  );

  if (loading) {
    return renderLoadingState();
  }

  if (results.length === 0) {
    return renderEmptyState();
  }

  return (
    <FlatList
      data={results}
      renderItem={renderSearchResult}
      keyExtractor={item => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
      ListFooterComponent={renderLoadMoreButton}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sourceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sourceIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  sourceText: {
    flex: 1,
  },
  sourceName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  sourceDate: {
    fontSize: 11,
    color: '#666666',
    marginTop: 1,
  },
  bookmarkButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    lineHeight: 22,
    marginBottom: 8,
  },
  excerptContainer: {
    marginBottom: 12,
  },
  resultExcerpt: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  resultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    marginRight: 8,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 11,
    color: '#666666',
  },
  metaInfo: {
    alignItems: 'flex-end',
  },
  relevanceScore: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  scoreText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D4AF37',
    marginLeft: 2,
  },
  viewCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewCountText: {
    fontSize: 11,
    color: '#666666',
    marginLeft: 2,
  },
  confidenceBar: {
    height: 2,
    backgroundColor: '#F0F0F0',
    borderRadius: 1,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  loadMoreButton: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  loadMoreGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  loadMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 32,
  },
  loadingState: {
    padding: 16,
  },
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  skeletonSource: {
    width: 120,
    height: 16,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
  },
  skeletonBookmark: {
    width: 32,
    height: 32,
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
  },
  skeletonTitle: {
    width: '80%',
    height: 20,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    marginBottom: 8,
  },
  skeletonExcerpt: {
    width: '100%',
    height: 40,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    marginBottom: 12,
  },
  skeletonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skeletonTag: {
    width: 80,
    height: 16,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
  },
  skeletonMeta: {
    width: 60,
    height: 16,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
  },
});
