import {
  LegalUpdate,
  User,
  ChatConversation,
  TunisianMascot,
  SearchResult,
  LegalCategory,
  Sector,
} from '../types';

/**
 * Mock Data Manager
 * Utility class for managing and updating mock data during development
 */
export class MockDataManager {
  private static instance: MockDataManager;

  private constructor() {}

  public static getInstance(): MockDataManager {
    if (!MockDataManager.instance) {
      MockDataManager.instance = new MockDataManager();
    }
    return MockDataManager.instance;
  }

  /**
   * Legal Updates Management
   */
  createLegalUpdate(data: Partial<LegalUpdate>): LegalUpdate {
    const defaultUpdate: LegalUpdate = {
      id: `update-${Date.now()}`,
      title: data.title || 'New Legal Update',
      titleAr: data.titleAr || 'تحديث قانوني جديد',
      titleFr: data.titleFr || 'Nouvelle mise à jour juridique',
      content: data.content || 'Legal update content...',
      contentAr: data.contentAr || 'محتوى التحديث القانوني...',
      contentFr: data.contentFr || 'Contenu de la mise à jour juridique...',
      summary: data.summary || 'Brief summary of the legal update',
      summaryAr: data.summaryAr || 'ملخص موجز للتحديث القانوني',
      summaryFr: data.summaryFr || 'Bref résumé de la mise à jour juridique',
      category: data.category || 'business_law',
      priority: data.priority || 'medium',
      source: data.source || {
        id: 'source-default',
        name: 'Default Source',
        nameAr: 'المصدر الافتراضي',
        nameFr: 'Source par défaut',
        type: 'ministry_official',
        credibilityScore: 0.8,
        lastUpdated: new Date(),
      },
      publishedAt: data.publishedAt || new Date(),
      effectiveDate: data.effectiveDate,
      tags: data.tags || ['legal', 'update'],
      tagsAr: data.tagsAr || ['قانوني', 'تحديث'],
      tagsFr: data.tagsFr || ['juridique', 'mise à jour'],
      impactLevel: data.impactLevel || 'medium',
      sectors: data.sectors || ['business'],
      ministryId: data.ministryId,
      isBookmarked: data.isBookmarked || false,
      readStatus: data.readStatus || 'unread',
    };

    return { ...defaultUpdate, ...data };
  }

  generateLegalUpdatesByCategory(
    category: LegalCategory,
    count: number = 5
  ): LegalUpdate[] {
    const updates: LegalUpdate[] = [];
    const categoryTemplates = this.getLegalUpdateTemplatesByCategory(category);

    for (let i = 0; i < count; i++) {
      const template = categoryTemplates[i % categoryTemplates.length];
      const update = this.createLegalUpdate({
        ...template,
        id: `${category}-update-${Date.now()}-${i}`,
        publishedAt: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ), // Random date within last 30 days
      });
      updates.push(update);
    }

    return updates;
  }

  private getLegalUpdateTemplatesByCategory(
    category: LegalCategory
  ): Partial<LegalUpdate>[] {
    const templates: Record<LegalCategory, Partial<LegalUpdate>[]> = {
      business_law: [
        {
          title: 'New Business Registration Procedures',
          titleAr: 'إجراءات تسجيل الأعمال الجديدة',
          titleFr: "Nouvelles procédures d'enregistrement d'entreprise",
          category: 'business_law',
          sectors: ['business'],
          priority: 'high',
          impactLevel: 'high',
        },
        {
          title: 'Commercial License Updates',
          titleAr: 'تحديثات الرخصة التجارية',
          titleFr: 'Mises à jour de licence commerciale',
          category: 'business_law',
          sectors: ['business'],
          priority: 'medium',
          impactLevel: 'medium',
        },
      ],
      tax_law: [
        {
          title: 'Digital Tax Implementation',
          titleAr: 'تطبيق الضرائب الرقمية',
          titleFr: 'Mise en œuvre de la taxe numérique',
          category: 'tax_law',
          sectors: ['business', 'technology'],
          priority: 'high',
          impactLevel: 'critical',
        },
        {
          title: 'VAT Rate Changes',
          titleAr: 'تغييرات معدل ضريبة القيمة المضافة',
          titleFr: 'Changements de taux de TVA',
          category: 'tax_law',
          sectors: ['business'],
          priority: 'high',
          impactLevel: 'high',
        },
      ],
      administrative_law: [
        {
          title: 'Administrative Procedure Reforms',
          titleAr: 'إصلاحات الإجراءات الإدارية',
          titleFr: 'Réformes des procédures administratives',
          category: 'administrative_law',
          sectors: ['agriculture', 'business'],
          priority: 'medium',
          impactLevel: 'medium',
        },
      ],
      labor_law: [
        {
          title: 'Remote Work Regulations',
          titleAr: 'لوائح العمل عن بُعد',
          titleFr: 'Réglementations du travail à distance',
          category: 'labor_law',
          sectors: ['business', 'technology'],
          priority: 'high',
          impactLevel: 'high',
        },
      ],
      family_law: [
        {
          title: 'Child Custody Law Updates',
          titleAr: 'تحديثات قانون حضانة الأطفال',
          titleFr: "Mises à jour de la loi sur la garde d'enfants",
          category: 'family_law',
          sectors: ['education'],
          priority: 'medium',
          impactLevel: 'medium',
        },
      ],
      civil_law: [
        {
          title: 'Property Rights Amendments',
          titleAr: 'تعديلات حقوق الملكية',
          titleFr: 'Amendements aux droits de propriété',
          category: 'civil_law',
          sectors: ['business'],
          priority: 'medium',
          impactLevel: 'medium',
        },
      ],
      criminal_law: [
        {
          title: 'Cybercrime Law Updates',
          titleAr: 'تحديثات قانون الجرائم الإلكترونية',
          titleFr: 'Mises à jour de la loi sur la cybercriminalité',
          category: 'criminal_law',
          sectors: ['technology'],
          priority: 'high',
          impactLevel: 'high',
        },
      ],
      constitutional_law: [
        {
          title: 'Constitutional Amendment Process',
          titleAr: 'عملية التعديل الدستوري',
          titleFr: "Processus d'amendement constitutionnel",
          category: 'constitutional_law',
          sectors: ['business'],
          priority: 'low',
          impactLevel: 'low',
        },
      ],
      commercial_law: [
        {
          title: 'E-commerce Regulations',
          titleAr: 'لوائح التجارة الإلكترونية',
          titleFr: 'Réglementations du commerce électronique',
          category: 'commercial_law',
          sectors: ['business', 'technology'],
          priority: 'high',
          impactLevel: 'high',
        },
      ],
      environmental_law: [
        {
          title: 'Organic Certification Standards',
          titleAr: 'معايير الشهادة العضوية',
          titleFr: 'Normes de certification biologique',
          category: 'environmental_law',
          sectors: ['agriculture', 'food'],
          priority: 'medium',
          impactLevel: 'medium',
        },
      ],
    };

    return templates[category] || templates.business_law;
  }

  /**
   * User Management
   */
  createMockUser(data: Partial<User>): User {
    const defaultUser: User = {
      id: `user-${Date.now()}`,
      name: data.name || 'Test User',
      nameAr: data.nameAr || 'مستخدم تجريبي',
      email: data.email || 'test@example.com',
      avatar: data.avatar,
      profile: data.profile || {
        sectors: ['business'],
        legalCategories: ['business_law'],
        region: 'tunis',
        language: 'ar',
        experienceLevel: 'beginner',
        interests: ['business registration'],
        interestsAr: ['تسجيل الأعمال'],
        interestsFr: ["enregistrement d'entreprise"],
      },
      preferences: data.preferences || {
        notifications: {
          pushNotifications: true,
          emailNotifications: true,
          smsNotifications: false,
          legalUpdates: true,
          achievements: true,
          reminders: true,
          governmentAlerts: true,
          parliamentaryUpdates: false,
          quietHours: { enabled: false, startTime: '22:00', endTime: '07:00' },
          categories: {
            business_law: true,
            civil_law: false,
            administrative_law: false,
            labor_law: false,
            tax_law: false,
            family_law: false,
            criminal_law: false,
            constitutional_law: false,
            commercial_law: false,
            environmental_law: false,
          },
        },
        privacy: {
          dataSharing: false,
          analytics: true,
          personalization: true,
          locationTracking: false,
          voiceRecording: false,
          communityFeatures: true,
          profileVisibility: 'private',
        },
        display: {
          theme: 'light',
          fontSize: 'medium',
          animations: true,
          reducedMotion: false,
          highContrast: false,
          rtlLayout: true,
          colorScheme: 'default',
        },
        language: 'ar',
        mascot: {
          enabled: true,
          preferredSector: 'business',
          animationLevel: 'full',
          voiceSync: false,
          celebrations: true,
          customizations: [],
        },
        voice: {
          enabled: false,
          dialect: 'tunis',
          voiceSpeed: 1.0,
          voiceGender: 'neutral',
          noiseReduction: true,
          autoTranscription: false,
        },
      },
      achievements: data.achievements || [],
      statistics: data.statistics || {
        totalLegalUpdatesRead: 0,
        totalChatConversations: 0,
        totalSearchQueries: 0,
        totalDaysActive: 1,
        currentStreak: 1,
        longestStreak: 1,
        totalAchievements: 0,
        totalPoints: 0,
        favoriteCategory: 'business_law',
        mostActiveSector: 'business',
        averageSessionDuration: 0,
        lastWeekActivity: [],
        monthlyStats: [],
      },
      createdAt: data.createdAt || new Date(),
      lastActiveAt: data.lastActiveAt || new Date(),
      isVerified: data.isVerified || false,
    };

    return { ...defaultUser, ...data };
  }

  /**
   * Chat Conversation Management
   */
  createMockConversation(data: Partial<ChatConversation>): ChatConversation {
    const defaultConversation: ChatConversation = {
      id: `conversation-${Date.now()}`,
      userId: data.userId || 'user-001',
      title: data.title || 'Legal Consultation',
      titleAr: data.titleAr || 'استشارة قانونية',
      titleFr: data.titleFr || 'Consultation juridique',
      messages: data.messages || [],
      category: data.category || 'business_law',
      sector: data.sector || 'business',
      language: data.language || 'ar',
      isBookmarked: data.isBookmarked || false,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      status: data.status || 'active',
      metadata: data.metadata || {
        totalMessages: 0,
        averageResponseTime: 0,
        topicsDiscussed: [],
        legalCategoriesCovered: [],
        sectorsDiscussed: [],
        complexityLevel: 'basic',
      },
    };

    return { ...defaultConversation, ...data };
  }

  /**
   * Search Results Management
   */
  createMockSearchResult(data: Partial<SearchResult>): SearchResult {
    const defaultResult: SearchResult = {
      id: `result-${Date.now()}`,
      title: data.title || 'Legal Document',
      titleAr: data.titleAr || 'وثيقة قانونية',
      titleFr: data.titleFr || 'Document juridique',
      content: data.content || 'Legal document content...',
      contentAr: data.contentAr || 'محتوى الوثيقة القانونية...',
      contentFr: data.contentFr || 'Contenu du document juridique...',
      excerpt: data.excerpt || 'Brief excerpt from the document...',
      excerptAr: data.excerptAr || 'مقتطف موجز من الوثيقة...',
      excerptFr: data.excerptFr || 'Bref extrait du document...',
      type: data.type || 'legal_update',
      category: data.category || 'business_law',
      sectors: data.sectors || ['business'],
      source: data.source || {
        id: 'source-default',
        name: 'Default Source',
        nameAr: 'المصدر الافتراضي',
        nameFr: 'Source par défaut',
        type: 'government',
        credibilityScore: 0.8,
        description: 'Default source description',
        descriptionAr: 'وصف المصدر الافتراضي',
        descriptionFr: 'Description de la source par défaut',
      },
      relevanceScore: data.relevanceScore || 0.8,
      publishedAt: data.publishedAt || new Date(),
      lastUpdated: data.lastUpdated || new Date(),
      tags: data.tags || ['legal'],
      tagsAr: data.tagsAr || ['قانوني'],
      tagsFr: data.tagsFr || ['juridique'],
      highlights: data.highlights || [],
      relatedResults: data.relatedResults || [],
      isBookmarked: data.isBookmarked || false,
      viewCount: data.viewCount || 0,
      metadata: data.metadata || {
        confidence: 0.8,
        processingTime: 1.0,
        sourceQuality: 0.8,
        freshness: 0.8,
        popularity: 0.5,
        userEngagement: 0.5,
        culturalRelevance: 0.8,
      },
    };

    return { ...defaultResult, ...data };
  }

  /**
   * Mascot Management
   */
  createMockMascot(data: Partial<TunisianMascot>): TunisianMascot {
    const defaultMascot: TunisianMascot = {
      id: `mascot-${Date.now()}`,
      name: data.name || 'Default Mascot',
      nameAr: data.nameAr || 'التميمة الافتراضية',
      nameFr: data.nameFr || 'Mascotte par défaut',
      sector: data.sector || 'business',
      description: data.description || 'A friendly Tunisian mascot',
      descriptionAr: data.descriptionAr || 'تميمة تونسية ودودة',
      descriptionFr: data.descriptionFr || 'Une mascotte tunisienne amicale',
      culturalElements: data.culturalElements || [],
      animations: data.animations || [],
      customizations: data.customizations || [],
      voiceSyncCapability: data.voiceSyncCapability || false,
      tunisianSymbols: data.tunisianSymbols || [],
      isUnlocked: data.isUnlocked || true,
      rarity: data.rarity || 'common',
      popularity: data.popularity || 50,
    };

    return { ...defaultMascot, ...data };
  }

  /**
   * Data Validation Utilities
   */
  validateLegalUpdate(update: LegalUpdate): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!update.id) errors.push('ID is required');
    if (!update.title) errors.push('Title is required');
    if (!update.content) errors.push('Content is required');
    if (!update.category) errors.push('Category is required');
    if (!update.source) errors.push('Source is required');
    if (!update.publishedAt) errors.push('Published date is required');

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateUser(user: User): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!user.id) errors.push('ID is required');
    if (!user.name) errors.push('Name is required');
    if (!user.email) errors.push('Email is required');
    if (!user.profile) errors.push('Profile is required');
    if (!user.preferences) errors.push('Preferences are required');

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (user.email && !emailRegex.test(user.email)) {
      errors.push('Invalid email format');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Data Export/Import Utilities
   */
  exportMockData(): {
    legalUpdates: LegalUpdate[];
    users: User[];
    conversations: ChatConversation[];
    mascots: TunisianMascot[];
    searchResults: SearchResult[];
  } {
    // In a real implementation, this would export current mock data
    return {
      legalUpdates: [],
      users: [],
      conversations: [],
      mascots: [],
      searchResults: [],
    };
  }

  importMockData(data: {
    legalUpdates?: LegalUpdate[];
    users?: User[];
    conversations?: ChatConversation[];
    mascots?: TunisianMascot[];
    searchResults?: SearchResult[];
  }): { success: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      // Validate imported data
      if (data.legalUpdates) {
        data.legalUpdates.forEach((update, index) => {
          const validation = this.validateLegalUpdate(update);
          if (!validation.isValid) {
            errors.push(
              `Legal Update ${index}: ${validation.errors.join(', ')}`
            );
          }
        });
      }

      if (data.users) {
        data.users.forEach((user, index) => {
          const validation = this.validateUser(user);
          if (!validation.isValid) {
            errors.push(`User ${index}: ${validation.errors.join(', ')}`);
          }
        });
      }

      // In a real implementation, this would update the mock data files
      return {
        success: errors.length === 0,
        errors,
      };
    } catch (error) {
      return {
        success: false,
        errors: [`Import failed: ${error}`],
      };
    }
  }

  /**
   * Development Utilities
   */
  generateRandomData(
    type: 'legal_updates' | 'users' | 'conversations',
    count: number = 10
  ): any[] {
    switch (type) {
      case 'legal_updates':
        return Array.from({ length: count }, (_, i) =>
          this.createLegalUpdate({
            title: `Generated Legal Update ${i + 1}`,
            category: ['business_law', 'tax_law', 'administrative_law'][
              i % 3
            ] as LegalCategory,
          })
        );

      case 'users':
        return Array.from({ length: count }, (_, i) =>
          this.createMockUser({
            name: `Generated User ${i + 1}`,
            email: `user${i + 1}@example.com`,
          })
        );

      case 'conversations':
        return Array.from({ length: count }, (_, i) =>
          this.createMockConversation({
            title: `Generated Conversation ${i + 1}`,
            userId: `user-${i + 1}`,
          })
        );

      default:
        return [];
    }
  }

  clearMockData(
    type?: 'legal_updates' | 'users' | 'conversations' | 'all'
  ): void {
    // In a real implementation, this would clear the specified mock data
    console.log(`Mock data cleared: ${type || 'all'}`);
  }

  resetToDefaults(): void {
    // In a real implementation, this would reset all mock data to default values
    console.log('Mock data reset to defaults');
  }

  /**
   * Enhanced Mascot Management with Theme Support
   */
  createMascotWithThemeSupport(
    data: Partial<TunisianMascot>,
    themeMode: 'light' | 'dark' = 'light'
  ): TunisianMascot {
    const baseMascot = this.createMockMascot(data);

    // Add theme-specific customizations
    const themeCustomizations =
      themeMode === 'dark'
        ? ['dark_mode_colors', 'night_theme_elements']
        : ['light_mode_colors', 'day_theme_elements'];

    return {
      ...baseMascot,
      customizations: [...baseMascot.customizations, ...themeCustomizations],
    };
  }

  /**
   * Data Persistence with Enhanced Features Support
   */
  persistUserDataWithEnhancements(user: User): {
    success: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    try {
      // Validate enhanced user data
      if (
        user.preferences?.mascot &&
        !user.preferences.mascot.preferredSector
      ) {
        errors.push('Mascot preferences must include preferred sector');
      }

      if (user.preferences?.display && !user.preferences.display.theme) {
        errors.push('Display preferences must include theme setting');
      }

      // In a real implementation, this would persist to storage with enhanced features
      console.log('Persisting enhanced user data:', {
        userId: user.id,
        hasThemePreferences: !!user.preferences?.display?.theme,
        hasMascotPreferences: !!user.preferences?.mascot,
        hasVoicePreferences: !!user.preferences?.voice,
      });

      return {
        success: errors.length === 0,
        errors,
      };
    } catch (error) {
      return {
        success: false,
        errors: [`Persistence failed: ${error}`],
      };
    }
  }

  /**
   * Backward Compatibility Utilities
   */
  migrateUserDataToEnhanced(legacyUser: any): User {
    // Ensure backward compatibility with existing user data
    const enhancedUser = this.createMockUser(legacyUser);

    // Add default enhanced preferences if missing
    if (!enhancedUser.preferences.mascot) {
      enhancedUser.preferences.mascot = {
        enabled: true,
        preferredSector: 'business',
        animationLevel: 'full',
        voiceSync: false,
        celebrations: true,
        customizations: [],
      };
    }

    if (!enhancedUser.preferences.display?.theme) {
      enhancedUser.preferences.display = {
        ...enhancedUser.preferences.display,
        theme: 'light',
        fontSize: 'medium',
        animations: true,
        reducedMotion: false,
        highContrast: false,
        rtlLayout: true,
        colorScheme: 'default',
      };
    }

    return enhancedUser;
  }

  /**
   * Test Data Generation for Enhanced Features
   */
  generateTestDataWithEnhancements(): {
    users: User[];
    mascots: TunisianMascot[];
    themeVariations: any[];
  } {
    const users = Array.from({ length: 3 }, (_, i) =>
      this.createMockUser({
        name: `Enhanced User ${i + 1}`,
        email: `enhanced.user${i + 1}@example.com`,
        preferences: {
          ...this.createMockUser({}).preferences,
          display: {
            theme: i % 2 === 0 ? 'light' : 'dark',
            fontSize: ['small', 'medium', 'large'][i % 3] as any,
            animations: true,
            reducedMotion: false,
            highContrast: false,
            rtlLayout: true,
            colorScheme: 'default',
          },
          mascot: {
            enabled: true,
            preferredSector: ['business', 'agriculture', 'technology'][
              i % 3
            ] as any,
            animationLevel: 'full',
            voiceSync: i === 1,
            celebrations: true,
            customizations: [`custom_${i + 1}`],
          },
        },
      })
    );

    const mascots = Array.from({ length: 3 }, (_, i) =>
      this.createMascotWithThemeSupport(
        {
          name: `Enhanced Mascot ${i + 1}`,
          sector: ['business', 'agriculture', 'technology'][i % 3] as any,
        },
        i % 2 === 0 ? 'light' : 'dark'
      )
    );

    const themeVariations = [
      { name: 'Light Theme', mode: 'light', colors: ['#FFFFFF', '#000000'] },
      { name: 'Dark Theme', mode: 'dark', colors: ['#000000', '#FFFFFF'] },
      { name: 'High Contrast', mode: 'light', highContrast: true },
    ];

    return { users, mascots, themeVariations };
  }
}

// Export singleton instance
export const mockDataManager = MockDataManager.getInstance();
