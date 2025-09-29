import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, createThemedStyles } from '../contexts/ThemeContext';
// Note: This app uses custom navigation, not React Navigation
import { 
  SearchResult, 
  SearchFilters, 
  SearchSuggestion, 
  SearchQuery, 
  SavedSearch
} from '../types';
import { searchService } from '../services/searchService';
import apiService from '../services/api';
import { SearchFilters as SearchFiltersComponent } from '../components/search/SearchFilters';
import { SearchResults } from '../components/search/SearchResults';
import { SearchSuggestions } from '../components/search/SearchSuggestions';
import { SavedSearches } from '../components/search/SavedSearches';
import { LoadingOverlay, ErrorDisplay, NetworkStatusIndicator } from '../components/common';
import { useErrorHandler } from '../hooks';
import { useNetworkState } from '../utils/networkUtils';

interface SearchScreenProps {
  navigation: any;
}

type SearchMode = 'suggestions' | 'results' | 'saved';

export const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('suggestions');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<SearchQuery[]>([]);
  const [popularSearches, setPopularSearches] = useState<SearchSuggestion[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [filters, setFilters] = useState<SearchFilters>(searchService.getDefaultFilters());
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreResults, setHasMoreResults] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [searchTime, setSearchTime] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Error handling
  const { error, isRetrying, handleError, clearError, retry } = useErrorHandler({
    maxRetries: 3,
    showAlert: false
  });
  const networkState = useNetworkState();

  // Load initial data when screen focuses or mounts
  useEffect(() => {
    // Wrap in try-catch to prevent crashes
    try {
      loadInitialData();
    } catch (error) {
      console.error('Failed to load initial data:', error);
      handleError(error, 'فشل في تحميل البيانات الأولية');
    }
  }, []);

  // Load suggestions when query changes
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      loadSuggestions(searchQuery);
    } else {
      setSuggestions([]);
      if (searchMode === 'results') {
        setSearchMode('suggestions');
      }
    }
  }, [searchQuery]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load data with individual error handling
      let recentData: SearchQuery[] = [];
      let popularData: SearchSuggestion[] = [];
      let savedData: SavedSearch[] = [];

      // Try to load popular queries from API first
      try {
        const apiPopularQueries = await apiService.getPopularQueries('ar');
        popularData = apiPopularQueries.map((item: any, index: number) => ({
          id: `popular-api-${index}`,
          text: item.query,
          textAr: item.query,
          textFr: item.query,
          type: 'popular' as const,
          popularity: item.popularity || 50,
          relevanceScore: item.success_rate || 0.8,
          metadata: {
            searchCount: Math.floor(item.popularity || 50),
            successRate: item.success_rate || 0.8,
            averageResultCount: 10,
            userSpecific: false,
            trending: item.popularity > 80
          }
        }));
      } catch (err) {
        console.warn('Failed to load popular searches from API, using fallback:', err);
        try {
          popularData = await searchService.getPopularSearches();
        } catch (fallbackErr) {
          console.warn('Failed to load popular searches from service:', fallbackErr);
        }
      }

      try {
        recentData = await searchService.getRecentSearches(10);
      } catch (err) {
        console.warn('Failed to load recent searches:', err);
      }

      try {
        savedData = await searchService.getSavedSearches();
      } catch (err) {
        console.warn('Failed to load saved searches:', err);
      }

      setRecentSearches(recentData);
      setPopularSearches(popularData);
      setSavedSearches(savedData);
      setIsInitialized(true);
    } catch (err) {
      console.error('Failed to load initial data:', err);
      handleError(err, 'فشل في تحميل البيانات');
      setIsInitialized(true); // Still mark as initialized to show error state
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestions = async (query: string) => {
    try {
      // Try to get popular queries from API as suggestions
      const popularQueries = await apiService.getPopularQueries('ar');
      
      // Filter popular queries based on current query
      const filteredSuggestions = popularQueries
        .filter((item: any) => 
          item.query.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5)
        .map((item: any, index: number) => ({
          id: `suggestion-${index}`,
          text: item.query,
          textAr: item.query,
          textFr: item.query,
          type: 'query' as const,
          popularity: item.popularity || 50,
          relevanceScore: item.success_rate || 0.8,
          metadata: {
            searchCount: Math.floor(item.popularity || 50),
            successRate: item.success_rate || 0.8,
            averageResultCount: 10,
            userSpecific: false,
            trending: item.popularity > 80
          }
        }));

      setSuggestions(filteredSuggestions);
    } catch (err) {
      console.error('Failed to load suggestions from API, using fallback:', err);
      
      // Fallback to search service
      try {
        const suggestionsData = await searchService.getSearchSuggestions(query);
        setSuggestions(suggestionsData);
      } catch (fallbackErr) {
        console.error('Fallback suggestions also failed:', fallbackErr);
        setSuggestions([]);
      }
    }
  };

  const performSearch = async (query: string, page: number = 1, newFilters?: SearchFilters) => {
    if (!query.trim()) return;

    setSearchLoading(true);
    clearError();
    
    // Check network connectivity first
    if (!networkState.isConnected || !networkState.isInternetReachable) {
      handleError(new Error('لا يوجد اتصال بالإنترنت. يرجى التحقق من اتصالك والمحاولة مرة أخرى.'));
      setSearchLoading(false);
      return;
    }
    
    const startTime = Date.now();
    
    try {
      // Try API search first
      try {
        const legalResponse = await apiService.submitLegalQuery({
          query: query,
          language: 'ar',
          user_id: 'search-user'
        });

        const endTime = Date.now();
        setSearchTime(endTime - startTime);

        // Convert API response to search results format
        const searchResults: SearchResult[] = legalResponse.sources.map((source: any, index: number) => ({
          id: `result-${index}`,
          title: source.title,
          titleAr: source.title,
          titleFr: source.title,
          content: source.article,
          contentAr: source.article,
          contentFr: source.article,
          excerpt: source.article.substring(0, 200) + '...',
          excerptAr: source.article.substring(0, 200) + '...',
          excerptFr: source.article.substring(0, 200) + '...',
          type: 'legal_update',
          category: 'business_law',
          sectors: ['business'],
          source: {
            id: 'api-source',
            name: source.source,
            nameAr: source.source,
            nameFr: source.source,
            type: 'government',
            credibilityScore: source.relevance_score,
            description: 'مصدر قانوني رسمي',
            descriptionAr: 'مصدر قانوني رسمي',
            descriptionFr: 'Source juridique officielle'
          },
          relevanceScore: source.relevance_score,
          publishedAt: new Date(),
          lastUpdated: new Date(),
          url: source.url || '',
          tags: ['قانوني', 'رسمي'],
          tagsAr: ['قانوني', 'رسمي'],
          tagsFr: ['juridique', 'officiel'],
          highlights: [{
            field: 'content',
            text: source.article.substring(0, 100),
            startIndex: 0,
            endIndex: 100,
            matchType: 'semantic'
          }],
          relatedResults: [],
          isBookmarked: false,
          viewCount: Math.floor(source.relevance_score * 100),
          metadata: {
            confidence: source.relevance_score,
            processingTime: 1.5,
            sourceQuality: source.relevance_score,
            freshness: 0.8,
            popularity: source.relevance_score * 100,
            userEngagement: 0.7,
            culturalRelevance: 0.9
          }
        }));

        if (page === 1) {
          setSearchResults(searchResults);
          setCurrentPage(1);
        } else {
          setSearchResults(prev => [...prev, ...searchResults]);
          setCurrentPage(page);
        }
        
        setHasMoreResults(false); // API doesn't support pagination yet
        setTotalResults(searchResults.length);
        setSearchMode('results');

      } catch (apiError) {
        console.warn('API search failed, falling back to search service:', apiError);
        
        // Fallback to existing search service
        const response = await searchService.searchLegalContent(
          query,
          newFilters || filters,
          page,
          10
        );

        if (response.success && response.data) {
          const endTime = Date.now();
          setSearchTime(endTime - startTime);
          const data = response.data;
          
          if (page === 1) {
            setSearchResults(data.items);
            setCurrentPage(1);
          } else {
            setSearchResults(prev => [...prev, ...data.items]);
            setCurrentPage(page);
          }
          
          setHasMoreResults(data.hasNextPage);
          setTotalResults(data.totalItems);
          setSearchMode('results');
        } else {
          throw new Error(response.error?.messageAr || 'فشل في البحث');
        }
      }

    } catch (err) {
      console.error('Search error:', err);
      handleError(err, 'حدث خطأ أثناء البحث');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchSubmit = () => {
    Keyboard.dismiss();
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    setSearchQuery(suggestion);
    performSearch(suggestion);
  };

  const handleRecentSearchPress = (search: SearchQuery) => {
    setSearchQuery(search.queryAr || search.query);
    setFilters(search.filters);
    performSearch(search.queryAr || search.query, 1, search.filters);
  };

  const handleRemoveRecentSearch = async (searchId: string) => {
    try {
      await searchService.removeFromSearchHistory(searchId);
      setRecentSearches(prev => prev.filter(search => search.id !== searchId));
    } catch (err) {
      console.error('Failed to remove search:', err);
    }
  };

  const handleResultPress = (result: SearchResult) => {
    // Navigate to result detail screen
    if (navigation && navigation.navigate) {
      navigation.navigate('LegalUpdateDetail', { 
        contentId: result.id,
        content: result 
      });
    } else {
      console.log('Would navigate to result:', result.id);
    }
  };

  const handleBookmarkPress = async (result: SearchResult) => {
    try {
      const success = await searchService.bookmarkSearchResult(result.id);
      if (success) {
        setSearchResults(prev => 
          prev.map(r => 
            r.id === result.id ? { ...r, isBookmarked: !r.isBookmarked } : r
          )
        );
      }
    } catch (err) {
      console.error('Bookmark error:', err);
      Alert.alert('خطأ', 'فشل في حفظ العنصر');
    }
  };

  const handleLoadMore = () => {
    if (hasMoreResults && !searchLoading) {
      performSearch(searchQuery, currentPage + 1);
    }
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    if (searchQuery.trim()) {
      performSearch(searchQuery, 1, newFilters);
    }
  };

  const handleExecuteSavedSearch = (savedSearch: SavedSearch) => {
    setSearchQuery(savedSearch.queryAr || savedSearch.query);
    setFilters(savedSearch.filters);
    performSearch(savedSearch.queryAr || savedSearch.query, 1, savedSearch.filters);
  };

  const handleDeleteSavedSearch = async (searchId: string) => {
    try {
      await searchService.deleteSavedSearch(searchId);
      setSavedSearches(prev => prev.filter(search => search.id !== searchId));
    } catch (err) {
      console.error('Failed to delete saved search:', err);
      Alert.alert('خطأ', 'فشل في حذف البحث المحفوظ');
    }
  };

  const handleSaveNewSearch = async (
    name: string, 
    query: string, 
    searchFilters: SearchFilters, 
    alertsEnabled: boolean
  ) => {
    try {
      const savedSearch = await searchService.saveSearch(name, query, searchFilters, alertsEnabled);
      setSavedSearches(prev => [savedSearch, ...prev]);
      Alert.alert('نجح', 'تم حفظ البحث بنجاح');
    } catch (err) {
      console.error('Failed to save search:', err);
      Alert.alert('خطأ', 'فشل في حفظ البحث');
    }
  };

  const handleRetry = async () => {
    await retry(async () => {
      if (searchQuery.trim()) {
        await performSearch(searchQuery);
      } else {
        await loadInitialData();
      }
    });
  };

  const getActiveFiltersCount = () => {
    return (
      filters.categories.length +
      filters.sectors.length +
      filters.sources.length +
      filters.contentTypes.length +
      (filters.dateRange.preset ? 1 : 0)
    );
  };

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <TouchableOpacity onPress={handleSearchSubmit}>
          <Ionicons name="search" size={20} color="#666666" />
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="ابحث عن المواضيع القانونية..."
          placeholderTextColor="#999999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => {
            setSearchQuery('');
            setSearchMode('suggestions');
            setSearchResults([]);
          }}>
            <Ionicons name="close-circle" size={20} color="#999999" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, searchMode === 'suggestions' && styles.activeTab]}
        onPress={() => setSearchMode('suggestions')}
      >
        <Ionicons 
          name="search" 
          size={20} 
          color={searchMode === 'suggestions' ? '#E31E24' : '#666666'} 
        />
        <Text style={[
          styles.tabText, 
          searchMode === 'suggestions' && styles.activeTabText
        ]}>
          البحث
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, searchMode === 'results' && styles.activeTab]}
        onPress={() => setSearchMode('results')}
        disabled={searchResults.length === 0}
      >
        <Ionicons 
          name="document-text" 
          size={20} 
          color={searchMode === 'results' ? '#E31E24' : '#666666'} 
        />
        <Text style={[
          styles.tabText, 
          searchMode === 'results' && styles.activeTabText
        ]}>
          النتائج ({totalResults})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, searchMode === 'saved' && styles.activeTab]}
        onPress={() => setSearchMode('saved')}
      >
        <Ionicons 
          name="bookmark" 
          size={20} 
          color={searchMode === 'saved' ? '#E31E24' : '#666666'} 
        />
        <Text style={[
          styles.tabText, 
          searchMode === 'saved' && styles.activeTabText
        ]}>
          المحفوظة ({savedSearches.length})
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    if (error) {
      return (
        <ErrorDisplay
          error={error}
          onRetry={handleRetry}
          type="network"
          isRetrying={isRetrying}
          showRetry={true}
        />
      );
    }

    switch (searchMode) {
      case 'suggestions':
        return (
          <SearchSuggestions
            suggestions={suggestions}
            recentSearches={recentSearches}
            popularSearches={popularSearches}
            onSuggestionPress={handleSuggestionPress}
            onRecentSearchPress={handleRecentSearchPress}
            onRemoveRecentSearch={handleRemoveRecentSearch}
            loading={loading}
          />
        );
      
      case 'results':
        return (
          <>
            {searchResults.length > 0 && (
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsCount}>
                  {totalResults.toLocaleString('ar-TN')} نتيجة في {searchTime}ms
                </Text>
                <TouchableOpacity
                  style={styles.saveSearchButton}
                  onPress={() => {
                    // Use a simple alert for now, can be enhanced with a custom modal later
                    Alert.alert(
                      'حفظ البحث',
                      'هذه الميزة ستكون متاحة قريباً',
                      [{ text: 'موافق', style: 'default' }]
                    );
                  }}
                >
                  <Ionicons name="bookmark-outline" size={16} color="#E31E24" />
                  <Text style={styles.saveSearchText}>حفظ</Text>
                </TouchableOpacity>
              </View>
            )}
            <SearchResults
              results={searchResults}
              loading={searchLoading}
              onResultPress={handleResultPress}
              onBookmarkPress={handleBookmarkPress}
              onLoadMore={handleLoadMore}
              hasMore={hasMoreResults}
            />
          </>
        );
      
      case 'saved':
        return (
          <SavedSearches
            savedSearches={savedSearches}
            onExecuteSearch={handleExecuteSavedSearch}
            onDeleteSearch={handleDeleteSavedSearch}
            onSaveNewSearch={handleSaveNewSearch}
            loading={loading}
          />
        );
      
      default:
        return null;
    }
  };

  // Show loading screen until initialized
  if (!isInitialized) {
    const styles = getStyles(theme);

  return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
        <NetworkStatusIndicator onRetry={handleRetry} />
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              if (navigation && navigation.goBack) {
                navigation.goBack();
              } else {
                // Fallback to Dashboard if no navigation
                if (navigation && navigation.navigate) {
                  navigation.navigate('Dashboard');
                }
              }
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#E31E24" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>البحث القانوني</Text>
          
          <TouchableOpacity 
            style={[
              styles.filterButton,
              getActiveFiltersCount() > 0 && styles.filterButtonActive
            ]}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="options" size={24} color="#E31E24" />
            {getActiveFiltersCount() > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{getActiveFiltersCount()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        {renderSearchBar()}

        {/* Tab Bar */}
        {renderTabBar()}

        {/* Content */}
        <View style={styles.content}>
          {renderContent()}
        </View>

        {/* Loading Overlay */}
        {searchLoading && <LoadingOverlay message="جاري البحث..." />}

        {/* Search Filters Modal */}
        <SearchFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          visible={showFilters}
          onClose={() => setShowFilters(false)}
        />
      </SafeAreaView>
  );
};

const getStyles = createThemedStyles((theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: '#E31E24',
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    marginHorizontal: 8,
    textAlign: 'right',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#E31E24',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  activeTabText: {
    color: '#E31E24',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  resultsCount: {
    fontSize: 14,
    color: '#666666',
  },
  saveSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFF5F5',
    gap: 4,
  },
  saveSearchText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E31E24',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#FF4444',
    textAlign: 'center',
    marginVertical: 16,
    lineHeight: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#E31E24',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
}));