import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SearchQuery,
  SearchResult,
  SearchFilters,
  SavedSearch,
  SearchSuggestion,
  ApiResponse,
  PaginatedResponse
} from '../types';
import apiService from './api';
import { legalService } from './legalService';

const SEARCH_HISTORY_KEY = '@search_history';
const SAVED_SEARCHES_KEY = '@saved_searches';
const MAX_HISTORY_ITEMS = 50;

export class SearchService {
  private static instance: SearchService;
  private searchHistory: SearchQuery[] = [];
  private savedSearches: SavedSearch[] = [];

  private constructor() {
    this.loadSearchHistory();
    this.loadSavedSearches();
  }

  public static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  /**
   * Perform semantic search with filters
   */
  async searchLegalContent(
    query: string,
    filters: Partial<SearchFilters> = {},
    page: number = 1,
    pageSize: number = 10,
    language: string = 'ar'
  ): Promise<ApiResponse<PaginatedResponse<SearchResult>>> {
    try {
      // Create search query object
      const searchQuery: SearchQuery = {
        id: `search-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        userId: 'current-user', // This would come from auth context
        query,
        queryAr: language === 'ar' ? query : undefined,
        queryFr: language === 'fr' ? query : undefined,
        language: language as any,
        filters: this.normalizeFilters(filters),
        results: [],
        totalResults: 0,
        searchTime: 0,
        timestamp: new Date(),
        isBookmarked: false,
        searchType: 'semantic'
      };

      const startTime = Date.now();

      // Use the new legal service API
      const response = await apiService.get<any[]>(`/api/v1/legal/search-results?${new URLSearchParams({
        query,
        language,
        limit: pageSize.toString(),
        offset: ((page - 1) * pageSize).toString(),
        ...(filters.categories?.length ? { category: filters.categories[0] } : {}),
        ...(filters.sectors?.length ? { sector: filters.sectors[0] } : {})
      }).toString()}`);

      // Transform API response to match expected format
      const searchResults: SearchResult[] = response.map((item: any) => ({
        id: item.id || `result-${Date.now()}-${Math.random()}`,
        title: item.title || item.titleAr || '',
        titleAr: item.titleAr || item.title || '',
        titleFr: item.titleFr || item.title || '',
        content: item.content || item.excerpt || '',
        contentAr: item.contentAr || item.content || '',
        contentFr: item.contentFr || item.content || '',
        source: item.source || 'Unknown',
        sourceAr: item.sourceAr || item.source || 'مصدر غير معروف',
        sourceFr: item.sourceFr || item.source || 'Source inconnue',
        category: item.category || 'general',
        tags: item.tags || [],
        publishedAt: new Date(item.publishedAt || item.published_at || Date.now()),
        lastUpdated: new Date(item.lastUpdated || item.last_updated || Date.now()),
        relevanceScore: item.relevanceScore || item.relevance_score || 0.5,
        priority: item.priority || 'medium',
        url: item.url,
        isBookmarked: false,
        viewCount: item.viewCount || 0,
        language: language as any
      }));

      searchQuery.results = searchResults;
      searchQuery.totalResults = response.length; // API should return total count
      searchQuery.searchTime = Date.now() - startTime;

      // Add to search history
      await this.addToSearchHistory(searchQuery);

      const apiResponse: ApiResponse<PaginatedResponse<SearchResult>> = {
        success: true,
        data: {
          items: searchResults,
          totalItems: response.length,
          totalPages: Math.ceil(response.length / pageSize),
          currentPage: page,
          pageSize,
          hasNext: response.length === pageSize,
          hasPrevious: page > 1
        },
        timestamp: new Date(),
        requestId: `search-${Date.now()}`
      };

      return apiResponse;
    } catch (error) {
      console.error('Search error:', error);
      return {
        success: false,
        error: {
          code: 'SEARCH_ERROR',
          message: 'Failed to perform search',
          messageAr: 'فشل في تنفيذ البحث',
          messageFr: 'Échec de la recherche'
        },
        timestamp: new Date(),
        requestId: `error-${Date.now()}`
      };
    }
  }

  /**
   * Get search suggestions based on query
   */
  async getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
    try {
      const response = await legalService.getSearchSuggestions(query, 'ar', 10);

      if (response.success && response.data) {
        // Convert string suggestions to SearchSuggestion objects
        return response.data.map((suggestion, index) => ({
          id: `suggestion-${index}`,
          text: suggestion,
          textAr: this.translateToArabic(suggestion),
          textFr: this.translateToFrench(suggestion),
          type: 'query' as const,
          popularity: Math.random() * 100,
          relevanceScore: Math.random(),
          metadata: {
            searchCount: Math.floor(Math.random() * 1000),
            successRate: Math.random(),
            averageResultCount: Math.floor(Math.random() * 50),
            userSpecific: false,
            trending: Math.random() > 0.7
          }
        }));
      }

      return [];
    } catch (error) {
      console.error('Suggestions error:', error);
      return [];
    }
  }

  /**
   * Get popular search queries
   */
  async getPopularSearches(): Promise<SearchSuggestion[]> {
    const popularQueries = [
      'تسجيل شركة جديدة',
      'قانون العمل الجديد',
      'الضرائب على الشركات',
      'حقوق المستهلك',
      'قانون الأسرة',
      'العقود التجارية',
      'الإجراءات الإدارية',
      'قانون البيئة'
    ];

    return popularQueries.map((query, index) => ({
      id: `popular-${index}`,
      text: query,
      textAr: query,
      textFr: this.translateToFrench(query),
      type: 'popular' as const,
      popularity: 100 - (index * 10),
      relevanceScore: 0.9 - (index * 0.1),
      metadata: {
        searchCount: 1000 - (index * 100),
        successRate: 0.9 - (index * 0.05),
        averageResultCount: 25 - (index * 2),
        userSpecific: false,
        trending: index < 3
      }
    }));
  }

  /**
   * Get recent searches from history
   */
  async getRecentSearches(limit: number = 10): Promise<SearchQuery[]> {
    await this.loadSearchHistory();
    return this.searchHistory
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Clear search history
   */
  async clearSearchHistory(): Promise<void> {
    this.searchHistory = [];
    try {
      if (typeof AsyncStorage !== 'undefined') {
        await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
      }
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  }

  /**
   * Remove specific search from history
   */
  async removeFromSearchHistory(searchId: string): Promise<void> {
    this.searchHistory = this.searchHistory.filter(search => search.id !== searchId);
    await this.saveSearchHistory();
  }

  /**
   * Save search query for later execution
   */
  async saveSearch(
    name: string,
    query: string,
    filters: Partial<SearchFilters> = {},
    alertsEnabled: boolean = false
  ): Promise<SavedSearch> {
    const savedSearch: SavedSearch = {
      id: `saved-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      userId: 'current-user',
      name,
      nameAr: name,
      nameFr: name,
      query,
      queryAr: query,
      queryFr: query,
      filters: this.normalizeFilters(filters),
      alertsEnabled,
      alertFrequency: 'weekly',
      resultCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    this.savedSearches.push(savedSearch);
    await this.saveSavedSearches();

    return savedSearch;
  }

  /**
   * Get all saved searches
   */
  async getSavedSearches(): Promise<SavedSearch[]> {
    await this.loadSavedSearches();
    return this.savedSearches.filter(search => search.isActive);
  }

  /**
   * Delete saved search
   */
  async deleteSavedSearch(searchId: string): Promise<void> {
    this.savedSearches = this.savedSearches.filter(search => search.id !== searchId);
    await this.saveSavedSearches();
  }

  /**
   * Execute saved search
   */
  async executeSavedSearch(
    savedSearchId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<ApiResponse<PaginatedResponse<SearchResult>>> {
    const savedSearch = this.savedSearches.find(search => search.id === savedSearchId);

    if (!savedSearch) {
      return {
        success: false,
        error: {
          code: 'SAVED_SEARCH_NOT_FOUND',
          message: 'Saved search not found',
          messageAr: 'البحث المحفوظ غير موجود',
          messageFr: 'Recherche sauvegardée introuvable'
        },
        timestamp: new Date(),
        requestId: `error-${Date.now()}`
      };
    }

    // Update last executed timestamp
    savedSearch.lastExecuted = new Date();
    await this.saveSavedSearches();

    return this.searchLegalContent(
      savedSearch.query,
      savedSearch.filters,
      page,
      pageSize
    );
  }

  /**
   * Get search filters with default values
   */
  getDefaultFilters(): SearchFilters {
    return {
      categories: [],
      sectors: [],
      sources: [],
      dateRange: {},
      priority: [],
      regions: [],
      contentTypes: [],
      languages: ['ar'],
      sortBy: 'relevance',
      sortOrder: 'desc'
    };
  }

  /**
   * Bookmark a search result
   */
  async bookmarkSearchResult(resultId: string): Promise<boolean> {
    try {
      // For now, return true as bookmarking would be handled by a separate bookmark service
      // TODO: Implement actual bookmarking API when available
      return true;
    } catch (error) {
      console.error('Bookmark error:', error);
      return false;
    }
  }

  // Private helper methods

  private normalizeFilters(filters: Partial<SearchFilters>): SearchFilters {
    const defaultFilters = this.getDefaultFilters();
    return {
      ...defaultFilters,
      ...filters
    };
  }

  private async addToSearchHistory(searchQuery: SearchQuery): Promise<void> {
    // Remove duplicate queries
    this.searchHistory = this.searchHistory.filter(
      existing => existing.query !== searchQuery.query
    );

    // Add new query to the beginning
    this.searchHistory.unshift(searchQuery);

    // Limit history size
    if (this.searchHistory.length > MAX_HISTORY_ITEMS) {
      this.searchHistory = this.searchHistory.slice(0, MAX_HISTORY_ITEMS);
    }

    await this.saveSearchHistory();
  }

  private async loadSearchHistory(): Promise<void> {
    try {
      // Check if AsyncStorage is available (might not be on web)
      if (typeof AsyncStorage === 'undefined') {
        console.warn('AsyncStorage not available, using in-memory storage');
        return;
      }

      const historyJson = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      if (historyJson) {
        const history = JSON.parse(historyJson);
        this.searchHistory = history.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
          results: item.results.map((result: any) => ({
            ...result,
            publishedAt: new Date(result.publishedAt),
            lastUpdated: new Date(result.lastUpdated)
          }))
        }));
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
      this.searchHistory = [];
    }
  }

  private async saveSearchHistory(): Promise<void> {
    try {
      // Check if AsyncStorage is available (might not be on web)
      if (typeof AsyncStorage === 'undefined') {
        console.warn('AsyncStorage not available, skipping save');
        return;
      }

      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(this.searchHistory));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  }

  private async loadSavedSearches(): Promise<void> {
    try {
      // Check if AsyncStorage is available (might not be on web)
      if (typeof AsyncStorage === 'undefined') {
        console.warn('AsyncStorage not available, using in-memory storage');
        return;
      }

      const savedJson = await AsyncStorage.getItem(SAVED_SEARCHES_KEY);
      if (savedJson) {
        const saved = JSON.parse(savedJson);
        this.savedSearches = saved.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
          lastExecuted: item.lastExecuted ? new Date(item.lastExecuted) : undefined
        }));
      }
    } catch (error) {
      console.error('Failed to load saved searches:', error);
      this.savedSearches = [];
    }
  }

  private async saveSavedSearches(): Promise<void> {
    try {
      // Check if AsyncStorage is available (might not be on web)
      if (typeof AsyncStorage === 'undefined') {
        console.warn('AsyncStorage not available, skipping save');
        return;
      }

      await AsyncStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(this.savedSearches));
    } catch (error) {
      console.error('Failed to save searches:', error);
    }
  }

  private translateToArabic(text: string): string {
    // Simple translation mapping for demo purposes
    const translations: { [key: string]: string } = {
      'business registration requirements': 'متطلبات تسجيل الأعمال',
      'digital tax implementation': 'تطبيق الضرائب الرقمية',
      'agricultural cooperative formation': 'تكوين التعاونيات الزراعية',
      'remote work regulations': 'لوائح العمل عن بُعد',
      'organic certification process': 'عملية الشهادة العضوية',
      'family law updates': 'تحديثات قانون الأسرة',
      'labor code amendments': 'تعديلات قانون العمل',
      'environmental compliance': 'الامتثال البيئي'
    };

    return translations[text.toLowerCase()] || text;
  }

  private translateToFrench(text: string): string {
    // Simple translation mapping for demo purposes
    const translations: { [key: string]: string } = {
      'تسجيل شركة جديدة': 'Enregistrement de nouvelle entreprise',
      'قانون العمل الجديد': 'Nouveau code du travail',
      'الضرائب على الشركات': 'Taxes sur les entreprises',
      'حقوق المستهلك': 'Droits du consommateur',
      'قانون الأسرة': 'Droit de la famille',
      'العقود التجارية': 'Contrats commerciaux',
      'الإجراءات الإدارية': 'Procédures administratives',
      'قانون البيئة': 'Droit de l\'environnement'
    };

    return translations[text] || text;
  }
}

// Export singleton instance
export const searchService = SearchService.getInstance();