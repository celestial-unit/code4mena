import {
  LegalUpdate,
  User,
  ChatConversation,
  TunisianMascot,
  SearchResult,
  SearchQuery,
  LegalIntelligenceResponse,
  ApiResponse,
  PaginatedResponse,
} from '../types';

import {
  transformLegalUpdates,
  transformUsers,
  transformChatConversations,
  transformSearchResults,
} from '../utils/dataTransformers';

// Import mock data
import legalUpdatesDataRaw from '../data/mock/legal-updates.json';
import usersDataRaw from '../data/mock/users.json';
import chatConversationsDataRaw from '../data/mock/chat-conversations.json';
import mascotsData from '../data/mock/mascots.json';
import searchResultsDataRaw from '../data/mock/search-results.json';

// Transform raw JSON data to proper types
const legalUpdatesData = transformLegalUpdates(legalUpdatesDataRaw);
const usersData = transformUsers(usersDataRaw);
const chatConversationsData = transformChatConversations(
  chatConversationsDataRaw
);
const searchResultsData = transformSearchResults(searchResultsDataRaw);

/**
 * Mock Data Service
 * Simulates backend API responses with realistic delays and error handling
 */
export class MockDataService {
  private static instance: MockDataService;
  private readonly baseDelay = 500; // Base delay in milliseconds
  private readonly maxDelay = 2000; // Maximum delay for complex operations

  private constructor() {}

  public static getInstance(): MockDataService {
    if (!MockDataService.instance) {
      MockDataService.instance = new MockDataService();
    }
    return MockDataService.instance;
  }

  /**
   * Simulate network delay
   */
  private async simulateDelay(
    complexity: 'simple' | 'medium' | 'complex' = 'medium'
  ): Promise<void> {
    const delays = {
      simple: this.baseDelay,
      medium: this.baseDelay * 1.5,
      complex: this.baseDelay * 2.5,
    };

    const delay = delays[complexity] + Math.random() * 500;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Simulate API response wrapper
   */
  private createApiResponse<T>(
    data: T,
    success: boolean = true
  ): ApiResponse<T> {
    return {
      success,
      data: success ? data : undefined,
      error: success
        ? undefined
        : {
            code: 'MOCK_ERROR',
            message: 'Simulated error for testing',
            messageAr: 'خطأ محاكي للاختبار',
            messageFr: 'Erreur simulée pour les tests',
          },
      timestamp: new Date(),
      requestId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  /**
   * Create paginated response
   */
  private createPaginatedResponse<T>(
    items: T[],
    page: number = 1,
    pageSize: number = 10
  ): PaginatedResponse<T> {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = items.slice(startIndex, endIndex);

    return {
      items: paginatedItems,
      totalItems: items.length,
      totalPages: Math.ceil(items.length / pageSize),
      currentPage: page,
      pageSize,
      hasNextPage: endIndex < items.length,
      hasPreviousPage: page > 1,
    };
  }

  // Legal Updates Services
  async getLegalUpdates(
    page: number = 1,
    pageSize: number = 10,
    category?: string,
    priority?: string
  ): Promise<ApiResponse<PaginatedResponse<LegalUpdate>>> {
    await this.simulateDelay('medium');

    let filteredUpdates = legalUpdatesData;

    // Apply filters
    if (category) {
      filteredUpdates = filteredUpdates.filter(
        update => update.category === category
      );
    }
    if (priority) {
      filteredUpdates = filteredUpdates.filter(
        update => update.priority === priority
      );
    }

    const paginatedData = this.createPaginatedResponse(
      filteredUpdates,
      page,
      pageSize
    );
    return this.createApiResponse(paginatedData);
  }

  async getLegalUpdateById(
    id: string
  ): Promise<ApiResponse<LegalUpdate | null>> {
    await this.simulateDelay('simple');

    const update = legalUpdatesData.find(update => update.id === id);
    return this.createApiResponse(update || null);
  }

  async bookmarkLegalUpdate(
    updateId: string,
    userId: string
  ): Promise<ApiResponse<boolean>> {
    await this.simulateDelay('simple');

    // Simulate bookmark operation
    const update = legalUpdatesData.find(u => u.id === updateId);
    if (update) {
      (update as any).isBookmarked = true;
      return this.createApiResponse(true);
    }
    return this.createApiResponse(false, false);
  }

  // User Services
  async getUserById(id: string): Promise<ApiResponse<User | null>> {
    await this.simulateDelay('simple');

    const user = usersData.find(user => user.id === id);
    return this.createApiResponse(user || null);
  }

  async updateUserProfile(
    userId: string,
    profileData: Partial<User>
  ): Promise<ApiResponse<User>> {
    await this.simulateDelay('medium');

    const userIndex = usersData.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
      const updatedUser = { ...usersData[userIndex], ...profileData };
      usersData[userIndex] = updatedUser;
      return this.createApiResponse(updatedUser);
    }

    return this.createApiResponse(null as any, false);
  }

  async getUserStatistics(
    userId: string
  ): Promise<ApiResponse<User['statistics'] | null>> {
    await this.simulateDelay('simple');

    const user = usersData.find(user => user.id === userId);
    return this.createApiResponse(user?.statistics || null);
  }

  // Chat Services
  async getChatConversations(
    userId: string
  ): Promise<ApiResponse<ChatConversation[]>> {
    await this.simulateDelay('medium');

    const userConversations = chatConversationsData.filter(
      conv => conv.userId === userId
    );

    return this.createApiResponse(userConversations);
  }

  async getChatConversationById(
    id: string
  ): Promise<ApiResponse<ChatConversation | null>> {
    await this.simulateDelay('simple');

    const conversation = chatConversationsData.find(conv => conv.id === id);

    return this.createApiResponse(conversation || null);
  }

  async sendChatMessage(
    conversationId: string,
    message: string,
    userId: string
  ): Promise<ApiResponse<ChatConversation>> {
    await this.simulateDelay('complex');

    const conversation = chatConversationsData.find(
      conv => conv.id === conversationId
    );
    if (!conversation) {
      return this.createApiResponse(null as any, false);
    }

    // Simulate AI response generation
    const aiResponse = await this.generateMockAIResponse(
      message,
      conversation.category
    );

    // Add user message and AI response to conversation
    const userMessage = {
      id: `msg-${Date.now()}-user`,
      conversationId,
      type: 'user' as const,
      content: message,
      timestamp: new Date(),
      isEdited: false,
      metadata: {
        relatedTopics: [],
        culturalContext: {
          culturalReferences: [],
          dialectTerms: [],
          regionalRelevance: [],
        },
      },
    };

    const aiMessage = {
      id: `msg-${Date.now()}-ai`,
      conversationId,
      type: 'ai' as const,
      content: aiResponse.content,
      contentAr: aiResponse.contentAr,
      contentFr: aiResponse.contentFr,
      timestamp: new Date(),
      isEdited: false,
      metadata: aiResponse.metadata,
      mascotAnimation: aiResponse.mascotAnimation,
    };

    conversation.messages.push(userMessage, aiMessage);
    conversation.updatedAt = new Date();

    return this.createApiResponse(conversation);
  }

  private async generateMockAIResponse(userMessage: string, category: string) {
    // Simulate AI processing time
    await this.simulateDelay('complex');

    // Generate contextual response based on message content and category
    const responses = {
      business_law: {
        content:
          'Based on current Tunisian business law, here are the key points you should consider...',
        contentAr:
          'بناءً على قانون الأعمال التونسي الحالي، إليك النقاط الرئيسية التي يجب أن تأخذها في الاعتبار...',
        contentFr:
          'Basé sur le droit des affaires tunisien actuel, voici les points clés que vous devriez considérer...',
      },
      tax_law: {
        content:
          'Regarding tax obligations in Tunisia, the recent updates require...',
        contentAr:
          'فيما يتعلق بالالتزامات الضريبية في تونس، تتطلب التحديثات الأخيرة...',
        contentFr:
          'Concernant les obligations fiscales en Tunisie, les récentes mises à jour exigent...',
      },
      administrative_law: {
        content:
          "For administrative procedures in Tunisia, you'll need to follow these steps...",
        contentAr:
          'للإجراءات الإدارية في تونس، ستحتاج إلى اتباع هذه الخطوات...',
        contentFr:
          'Pour les procédures administratives en Tunisie, vous devrez suivre ces étapes...',
      },
    };

    const response =
      responses[category as keyof typeof responses] || responses.business_law;

    return {
      ...response,
      metadata: {
        confidence: 0.85 + Math.random() * 0.1,
        sources: ['legal-database', 'ministry-official'],
        processingTime: 1.2 + Math.random() * 0.8,
        legalReferences: [],
        suggestedActions: [],
        relatedTopics: ['legal compliance', 'documentation', 'procedures'],
        culturalContext: {
          culturalReferences: [],
          dialectTerms: [],
          regionalRelevance: [],
        },
      },
      mascotAnimation: {
        type: 'explaining' as const,
        sector: 'business' as const,
        duration: 3.5,
        culturalElements: ['traditional_gesture', 'professional_attire'],
        voiceSync: true,
      },
    };
  }

  // Search Services
  async searchLegalContent(
    query: string,
    filters?: any,
    page: number = 1,
    pageSize: number = 10
  ): Promise<ApiResponse<PaginatedResponse<SearchResult>>> {
    await this.simulateDelay('complex');

    // Simulate search algorithm
    let results = searchResultsData;

    // Simple keyword matching simulation
    if (query) {
      const queryLower = query.toLowerCase();
      results = results.filter(
        result =>
          result.title.toLowerCase().includes(queryLower) ||
          result.content.toLowerCase().includes(queryLower) ||
          result.tags.some(tag => tag.toLowerCase().includes(queryLower))
      );
    }

    // Apply filters
    if (filters?.categories?.length) {
      results = results.filter(result =>
        filters.categories.includes(result.category)
      );
    }

    if (filters?.sectors?.length) {
      results = results.filter(result =>
        result.sectors.some((sector: string) =>
          filters.sectors.includes(sector)
        )
      );
    }

    // Sort by relevance (simulated)
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    const paginatedData = this.createPaginatedResponse(results, page, pageSize);
    return this.createApiResponse(paginatedData);
  }

  async getSearchSuggestions(query: string): Promise<ApiResponse<string[]>> {
    await this.simulateDelay('simple');

    const suggestions = [
      'business registration requirements',
      'digital tax implementation',
      'agricultural cooperative formation',
      'remote work regulations',
      'organic certification process',
      'family law updates',
      'labor code amendments',
      'environmental compliance',
    ];

    // Filter suggestions based on query
    const filteredSuggestions = suggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(query.toLowerCase())
    );

    return this.createApiResponse(filteredSuggestions.slice(0, 5));
  }

  // Mascot Services
  async getMascots(): Promise<ApiResponse<TunisianMascot[]>> {
    await this.simulateDelay('medium');

    return this.createApiResponse(mascotsData as TunisianMascot[]);
  }

  async getMascotBySector(
    sector: string
  ): Promise<ApiResponse<TunisianMascot | null>> {
    await this.simulateDelay('simple');

    const mascot = mascotsData.find(m => m.sector === sector) as
      | TunisianMascot
      | undefined;
    return this.createApiResponse(mascot || null);
  }

  async unlockMascotCustomization(
    mascotId: string,
    customizationId: string,
    userId: string
  ): Promise<ApiResponse<boolean>> {
    await this.simulateDelay('medium');

    // Simulate unlock logic
    const mascot = mascotsData.find(m => m.id === mascotId);
    if (mascot) {
      const customization = mascot.customizations.find(
        c => c.id === customizationId
      );
      if (customization) {
        (customization as any).isUnlocked = true;
        return this.createApiResponse(true);
      }
    }

    return this.createApiResponse(false, false);
  }

  // Legal Intelligence Services
  async getLegalIntelligence(
    query: string,
    language: string = 'ar'
  ): Promise<ApiResponse<LegalIntelligenceResponse>> {
    await this.simulateDelay('complex');

    // Generate mock legal intelligence response
    const mockResponse: LegalIntelligenceResponse = {
      id: `intelligence-${Date.now()}`,
      query,
      queryAr: language === 'ar' ? query : 'الاستعلام القانوني',
      queryFr: language === 'fr' ? query : 'Requête juridique',
      sources: [
        {
          type: 'traditional_law',
          content: 'Based on Article 123 of the Commercial Code...',
          contentAr: 'بناءً على المادة 123 من المجلة التجارية...',
          contentFr: "Basé sur l'Article 123 du Code Commercial...",
          timestamp: new Date(),
          relevanceScore: 0.92,
        },
      ],
      traditionalLegalAnswer:
        'According to Tunisian law, the following provisions apply...',
      traditionalLegalAnswerAr:
        'وفقاً للقانون التونسي، تنطبق الأحكام التالية...',
      traditionalLegalAnswerFr:
        "Selon le droit tunisien, les dispositions suivantes s'appliquent...",
      confidenceScore: 0.88,
      lastUpdated: new Date(),
      culturalContext: {
        culturalReferences: [],
        dialectTerms: [],
        regionalRelevance: [],
      },
      relatedUpdates: [],
    };

    return this.createApiResponse(mockResponse);
  }

  // Analytics and Reporting
  async getUserEngagementMetrics(userId: string): Promise<ApiResponse<any>> {
    await this.simulateDelay('medium');

    const user = usersData.find(u => u.id === userId);
    if (!user) {
      return this.createApiResponse(null, false);
    }

    const metrics = {
      dailyActiveTime: user.statistics.averageSessionDuration,
      weeklyEngagement: user.statistics.lastWeekActivity,
      monthlyStats: user.statistics.monthlyStats,
      achievementProgress: {
        total: user.statistics.totalAchievements,
        points: user.statistics.totalPoints,
        currentStreak: user.statistics.currentStreak,
      },
      categoryPreferences: {
        favorite: user.statistics.favoriteCategory,
        mostActive: user.statistics.mostActiveSector,
      },
    };

    return this.createApiResponse(metrics);
  }

  // Error simulation for testing
  async simulateError(): Promise<ApiResponse<null>> {
    await this.simulateDelay('simple');
    return this.createApiResponse(null, false);
  }

  // Health check
  async healthCheck(): Promise<
    ApiResponse<{ status: string; timestamp: Date }>
  > {
    await this.simulateDelay('simple');
    return this.createApiResponse({
      status: 'healthy',
      timestamp: new Date(),
    });
  }
}

// Export singleton instance
export const mockDataService = MockDataService.getInstance();
