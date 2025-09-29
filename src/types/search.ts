// Search and discovery types
export interface SearchQuery {
  id: string;
  userId: string;
  query: string;
  queryAr?: string;
  queryFr?: string;
  language: Language;
  filters: SearchFilters;
  results: SearchResult[];
  totalResults: number;
  searchTime: number;
  timestamp: Date;
  isBookmarked: boolean;
  searchType: 'semantic' | 'keyword' | 'hybrid';
}

export interface SearchFilters {
  categories: LegalCategory[];
  sectors: Sector[];
  sources: string[];
  dateRange: DateRange;
  priority: ('high' | 'medium' | 'low')[];
  regions: Region[];
  contentTypes: ContentType[];
  languages: Language[];
  sortBy: SortOption;
  sortOrder: 'asc' | 'desc';
}

export interface DateRange {
  startDate?: Date;
  endDate?: Date;
  preset?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
}

export interface SearchResult {
  id: string;
  title: string;
  titleAr: string;
  titleFr: string;
  content: string;
  contentAr: string;
  contentFr: string;
  excerpt: string;
  excerptAr: string;
  excerptFr: string;
  type: ContentType;
  category: LegalCategory;
  sectors: Sector[];
  source: SearchResultSource;
  relevanceScore: number;
  similarityScore?: number;
  publishedAt: Date;
  lastUpdated: Date;
  url?: string;
  tags: string[];
  tagsAr: string[];
  tagsFr: string[];
  highlights: SearchHighlight[];
  relatedResults: string[];
  isBookmarked: boolean;
  viewCount: number;
  metadata: SearchResultMetadata;
}

export interface SearchResultSource {
  id: string;
  name: string;
  nameAr: string;
  nameFr: string;
  type: 'government' | 'parliamentary' | 'legal_database' | 'ministry' | 'court' | 'academic';
  credibilityScore: number;
  logo?: string;
  description: string;
  descriptionAr: string;
  descriptionFr: string;
}

export interface SearchHighlight {
  field: 'title' | 'content' | 'excerpt';
  text: string;
  startIndex: number;
  endIndex: number;
  matchType: 'exact' | 'partial' | 'semantic';
}

export interface SearchResultMetadata {
  vectorEmbedding?: number[];
  confidence: number;
  processingTime: number;
  sourceQuality: number;
  freshness: number;
  popularity: number;
  userEngagement: number;
  culturalRelevance: number;
}

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  nameAr: string;
  nameFr: string;
  query: string;
  queryAr?: string;
  queryFr?: string;
  filters: SearchFilters;
  alertsEnabled: boolean;
  alertFrequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
  lastExecuted?: Date;
  resultCount: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface SearchSuggestion {
  id: string;
  text: string;
  textAr: string;
  textFr: string;
  type: 'query' | 'filter' | 'category' | 'recent' | 'popular' | 'personalized';
  category?: LegalCategory;
  sector?: Sector;
  popularity: number;
  relevanceScore: number;
  metadata: SuggestionMetadata;
}

export interface SuggestionMetadata {
  searchCount: number;
  successRate: number;
  averageResultCount: number;
  lastUsed?: Date;
  userSpecific: boolean;
  trending: boolean;
}

export interface SearchHistory {
  id: string;
  userId: string;
  queries: SearchQuery[];
  totalSearches: number;
  popularCategories: LegalCategory[];
  popularSectors: Sector[];
  averageResultsPerSearch: number;
  searchPatterns: SearchPattern[];
  lastSearchAt: Date;
}

export interface SearchPattern {
  pattern: string;
  frequency: number;
  categories: LegalCategory[];
  sectors: Sector[];
  timeOfDay: number[];
  dayOfWeek: number[];
  successRate: number;
}

export interface SearchAnalytics {
  totalSearches: number;
  uniqueQueries: number;
  averageResultsClicked: number;
  popularQueries: PopularQuery[];
  categoryDistribution: CategoryDistribution[];
  sectorDistribution: SectorDistribution[];
  languageDistribution: LanguageDistribution[];
  searchTrends: SearchTrend[];
}

export interface PopularQuery {
  query: string;
  queryAr?: string;
  queryFr?: string;
  count: number;
  successRate: number;
  averageRelevance: number;
  categories: LegalCategory[];
  sectors: Sector[];
}

export interface CategoryDistribution {
  category: LegalCategory;
  count: number;
  percentage: number;
  averageRelevance: number;
}

export interface SectorDistribution {
  sector: Sector;
  count: number;
  percentage: number;
  averageRelevance: number;
}

export interface LanguageDistribution {
  language: Language;
  count: number;
  percentage: number;
}

export interface SearchTrend {
  date: Date;
  totalSearches: number;
  uniqueQueries: number;
  topCategories: LegalCategory[];
  topSectors: Sector[];
  averageRelevance: number;
}

export type ContentType = 
  | 'legal_update'
  | 'law'
  | 'regulation'
  | 'decree'
  | 'circular'
  | 'jurisprudence'
  | 'parliamentary_session'
  | 'government_announcement'
  | 'ministry_update'
  | 'court_decision'
  | 'legal_analysis'
  | 'news_article'
  | 'academic_paper'
  | 'guide'
  | 'faq';

export type SortOption = 
  | 'relevance'
  | 'date'
  | 'popularity'
  | 'title'
  | 'source'
  | 'category'
  | 'sector';

// Import types from other files
import type { LegalCategory, Sector } from './legal';
import type { Language, Region } from './user';