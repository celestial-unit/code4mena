import { mockDataService } from './mockDataService';
import {
  ApiResponse,
  PaginatedResponse,
  LegalUpdate,
  User,
  ChatConversation,
  SearchResult,
  TunisianMascot,
  LegalIntelligenceResponse,
} from '../types';

/**
 * Mock API Client
 * Provides a clean interface to mock data services that mimics real API calls
 */
export class MockApiClient {
  private static instance: MockApiClient;
  private baseUrl: string = 'https://api.kanounji.tn/v1';
  private apiKey: string = 'mock-api-key-for-development';

  private constructor() {}

  public static getInstance(): MockApiClient {
    if (!MockApiClient.instance) {
      MockApiClient.instance = new MockApiClient();
    }
    return MockApiClient.instance;
  }

  /**
   * Set API configuration
   */
  configure(config: { baseUrl?: string; apiKey?: string }) {
    if (config.baseUrl) this.baseUrl = config.baseUrl;
    if (config.apiKey) this.apiKey = config.apiKey;
  }

  /**
   * Legal Updates API
   */
  async getLegalUpdates(params?: {
    page?: number;
    pageSize?: number;
    category?: string;
    priority?: string;
    sectors?: string[];
    language?: string;
  }): Promise<ApiResponse<PaginatedResponse<LegalUpdate>>> {
    return mockDataService.getLegalUpdates(
      params?.page,
      params?.pageSize,
      params?.category,
      params?.priority
    );
  }

  async getLegalUpdate(id: string): Promise<ApiResponse<LegalUpdate | null>> {
    return mockDataService.getLegalUpdateById(id);
  }

  async bookmarkLegalUpdate(
    updateId: string,
    userId: string
  ): Promise<ApiResponse<boolean>> {
    return mockDataService.bookmarkLegalUpdate(updateId, userId);
  }

  async markLegalUpdateAsRead(
    updateId: string,
    userId: string
  ): Promise<ApiResponse<boolean>> {
    // Simulate marking as read
    return mockDataService.bookmarkLegalUpdate(updateId, userId);
  }

  /**
   * User Management API
   */
  async getUser(id: string): Promise<ApiResponse<User | null>> {
    return mockDataService.getUserById(id);
  }

  async updateUserProfile(
    userId: string,
    profileData: Partial<User>
  ): Promise<ApiResponse<User>> {
    return mockDataService.updateUserProfile(userId, profileData);
  }

  async getUserStatistics(
    userId: string
  ): Promise<ApiResponse<User['statistics'] | null>> {
    return mockDataService.getUserStatistics(userId);
  }

  async updateUserPreferences(
    userId: string,
    preferences: Partial<User['preferences']>
  ): Promise<ApiResponse<User>> {
    return mockDataService.updateUserProfile(userId, {
      preferences,
    } as Partial<User>);
  }

  /**
   * Chat and Conversations API
   */
  async getChatConversations(
    userId: string
  ): Promise<ApiResponse<ChatConversation[]>> {
    return mockDataService.getChatConversations(userId);
  }

  async getChatConversation(
    id: string
  ): Promise<ApiResponse<ChatConversation | null>> {
    return mockDataService.getChatConversationById(id);
  }

  async sendChatMessage(params: {
    conversationId?: string;
    message: string;
    userId: string;
    language?: string;
    voiceData?: any;
  }): Promise<ApiResponse<ChatConversation>> {
    // If no conversation ID, create a new conversation
    if (!params.conversationId) {
      params.conversationId = `conversation-${Date.now()}`;
    }

    return mockDataService.sendChatMessage(
      params.conversationId,
      params.message,
      params.userId
    );
  }

  async createChatConversation(params: {
    userId: string;
    title: string;
    category: string;
    sector: string;
    language?: string;
  }): Promise<ApiResponse<ChatConversation>> {
    // Simulate conversation creation
    const newConversation: ChatConversation = {
      id: `conversation-${Date.now()}`,
      userId: params.userId,
      title: params.title,
      titleAr: params.title, // In real app, this would be translated
      titleFr: params.title,
      messages: [],
      category: params.category as any,
      sector: params.sector as any,
      language: (params.language || 'ar') as any,
      isBookmarked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active',
      metadata: {
        totalMessages: 0,
        averageResponseTime: 0,
        topicsDiscussed: [],
        legalCategoriesCovered: [],
        sectorsDiscussed: [],
        complexityLevel: 'basic',
      },
    };

    return {
      success: true,
      data: newConversation,
      timestamp: new Date(),
      requestId: `mock-${Date.now()}`,
    };
  }

  /**
   * Search API
   */
  async searchLegalContent(params: {
    query: string;
    filters?: {
      categories?: string[];
      sectors?: string[];
      sources?: string[];
      dateRange?: { startDate?: Date; endDate?: Date };
      priority?: string[];
      regions?: string[];
      contentTypes?: string[];
      languages?: string[];
    };
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<PaginatedResponse<SearchResult>>> {
    return mockDataService.searchLegalContent(
      params.query,
      params.filters,
      params.page,
      params.pageSize
    );
  }

  async getSearchSuggestions(query: string): Promise<ApiResponse<string[]>> {
    return mockDataService.getSearchSuggestions(query);
  }

  async saveSearch(params: {
    userId: string;
    name: string;
    query: string;
    filters: any;
    alertsEnabled?: boolean;
  }): Promise<ApiResponse<any>> {
    // Simulate saving search
    return {
      success: true,
      data: { id: `saved-search-${Date.now()}`, ...params },
      timestamp: new Date(),
      requestId: `mock-${Date.now()}`,
    };
  }

  /**
   * Mascot API
   */
  async getMascots(): Promise<ApiResponse<TunisianMascot[]>> {
    return mockDataService.getMascots();
  }

  async getMascotBySector(
    sector: string
  ): Promise<ApiResponse<TunisianMascot | null>> {
    return mockDataService.getMascotBySector(sector);
  }

  async unlockMascotCustomization(params: {
    mascotId: string;
    customizationId: string;
    userId: string;
  }): Promise<ApiResponse<boolean>> {
    return mockDataService.unlockMascotCustomization(
      params.mascotId,
      params.customizationId,
      params.userId
    );
  }

  async updateMascotPreferences(params: {
    userId: string;
    preferences: {
      enabled: boolean;
      preferredSector: string;
      animationLevel: string;
      voiceSync: boolean;
      celebrations: boolean;
    };
  }): Promise<ApiResponse<boolean>> {
    // Simulate updating mascot preferences
    return {
      success: true,
      data: true,
      timestamp: new Date(),
      requestId: `mock-${Date.now()}`,
    };
  }

  /**
   * Legal Intelligence API
   */
  async getLegalIntelligence(params: {
    query: string;
    language?: string;
    sources?: string[];
    includeGovernmentPosition?: boolean;
    includeParliamentaryContext?: boolean;
    includePredictions?: boolean;
  }): Promise<ApiResponse<LegalIntelligenceResponse>> {
    return mockDataService.getLegalIntelligence(params.query, params.language);
  }

  async getGovernmentPulse(params?: {
    topic?: string;
    ministries?: string[];
    timeframe?: string;
  }): Promise<ApiResponse<any>> {
    // Simulate government pulse data
    const mockPulse = {
      ministryUpdates: [],
      legalSignals: [],
      breakingNews: [],
      governmentStance: [],
      socialMediaTrends: [],
      lastScraped: new Date(),
    };

    return {
      success: true,
      data: mockPulse,
      timestamp: new Date(),
      requestId: `mock-${Date.now()}`,
    };
  }

  /**
   * Analytics API
   */
  async getUserEngagementMetrics(userId: string): Promise<ApiResponse<any>> {
    return mockDataService.getUserEngagementMetrics(userId);
  }

  async getAppAnalytics(params?: {
    timeframe?: string;
    metrics?: string[];
  }): Promise<ApiResponse<any>> {
    // Simulate app analytics
    const mockAnalytics = {
      totalUsers: 15420,
      activeUsers: 8934,
      totalConversations: 45678,
      totalSearches: 123456,
      popularCategories: ['business_law', 'tax_law', 'administrative_law'],
      userSatisfaction: 4.6,
      averageSessionDuration: 18.5,
    };

    return {
      success: true,
      data: mockAnalytics,
      timestamp: new Date(),
      requestId: `mock-${Date.now()}`,
    };
  }

  /**
   * Notifications API
   */
  async getUserNotifications(userId: string): Promise<ApiResponse<any[]>> {
    // Simulate notifications
    const mockNotifications = [
      {
        id: 'notif-001',
        type: 'legal_update',
        title: 'New Tax Regulation',
        titleAr: 'لائحة ضريبية جديدة',
        titleFr: 'Nouvelle réglementation fiscale',
        message: 'A new digital tax regulation affects your business sector',
        messageAr: 'لائحة ضريبية رقمية جديدة تؤثر على قطاع أعمالك',
        messageFr:
          "Une nouvelle réglementation fiscale numérique affecte votre secteur d'activité",
        isRead: false,
        createdAt: new Date(),
        priority: 'high',
      },
    ];

    return {
      success: true,
      data: mockNotifications,
      timestamp: new Date(),
      requestId: `mock-${Date.now()}`,
    };
  }

  async markNotificationAsRead(
    notificationId: string
  ): Promise<ApiResponse<boolean>> {
    // Simulate marking notification as read
    return {
      success: true,
      data: true,
      timestamp: new Date(),
      requestId: `mock-${Date.now()}`,
    };
  }

  /**
   * Voice API
   */
  async processVoiceQuery(params: {
    audioData: Blob;
    userId: string;
    language?: string;
    dialect?: string;
  }): Promise<ApiResponse<any>> {
    // Simulate voice processing
    const mockVoiceResponse = {
      transcript:
        'What are the requirements for starting a business in Tunisia?',
      transcriptAr: 'ما هي متطلبات بدء عمل تجاري في تونس؟',
      transcriptFr:
        'Quelles sont les exigences pour démarrer une entreprise en Tunisie ?',
      confidence: 0.92,
      detectedLanguage: params.language || 'ar',
      detectedDialect: params.dialect || 'tunis',
    };

    return {
      success: true,
      data: mockVoiceResponse,
      timestamp: new Date(),
      requestId: `mock-${Date.now()}`,
    };
  }

  async generateVoiceResponse(params: {
    text: string;
    language?: string;
    dialect?: string;
    emotion?: string;
  }): Promise<ApiResponse<any>> {
    // Simulate voice generation
    const mockAudioResponse = {
      audioUrl: 'https://example.com/audio/response.mp3',
      duration: 15.5,
      format: 'mp3',
      quality: 'high',
    };

    return {
      success: true,
      data: mockAudioResponse,
      timestamp: new Date(),
      requestId: `mock-${Date.now()}`,
    };
  }

  /**
   * Health and Status API
   */
  async healthCheck(): Promise<
    ApiResponse<{ status: string; timestamp: Date }>
  > {
    return mockDataService.healthCheck();
  }

  async getSystemStatus(): Promise<ApiResponse<any>> {
    // Simulate system status
    const mockStatus = {
      api: 'healthy',
      database: 'healthy',
      search: 'healthy',
      voice: 'healthy',
      mascot: 'healthy',
      lastUpdated: new Date(),
      version: '1.0.0',
    };

    return {
      success: true,
      data: mockStatus,
      timestamp: new Date(),
      requestId: `mock-${Date.now()}`,
    };
  }
}

// Export singleton instance
export const mockApiClient = MockApiClient.getInstance();
