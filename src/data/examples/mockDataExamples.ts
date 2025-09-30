/**
 * Mock Data Usage Examples
 *
 * This file demonstrates how to use the mock data system in the Tunisian Legal App.
 * These examples show common patterns and best practices for working with mock data.
 */

import { mockApiClient, mockDataService } from '../../services';
import { mockDataManager, mockDataHelpers } from '../../utils';
import { LegalCategory, Sector, User, LegalUpdate } from '../../types';

/**
 * Example 1: Basic API Usage
 * Demonstrates how to fetch data using the mock API client
 */
async function basicApiUsageExample() {
  console.log('=== Basic API Usage Example ===');

  try {
    // Fetch legal updates with pagination
    const updatesResponse = await mockApiClient.getLegalUpdates({
      page: 1,
      pageSize: 5,
      category: 'business_law',
      priority: 'high',
    });

    if (updatesResponse.success && updatesResponse.data) {
      console.log(`Found ${updatesResponse.data.totalItems} legal updates`);
      console.log(
        `Showing page ${updatesResponse.data.currentPage} of ${updatesResponse.data.totalPages}`
      );

      updatesResponse.data.items.forEach((update: LegalUpdate) => {
        console.log(`- ${update.title} (${update.priority} priority)`);
      });
    }

    // Get user information
    const userResponse = await mockApiClient.getUser('user-001');
    if (userResponse.success && userResponse.data) {
      const user = userResponse.data;
      console.log(`\nUser: ${user.name} from ${user.profile.region}`);
      console.log(`Interests: ${user.profile.interests.join(', ')}`);
      console.log(`Total achievements: ${user.statistics.totalAchievements}`);
    }
  } catch (error) {
    console.error('API Error:', error);
  }
}

/**
 * Example 2: Chat Conversation
 * Shows how to create and manage chat conversations
 */
async function chatConversationExample() {
  console.log('\n=== Chat Conversation Example ===');

  try {
    // Create a new conversation
    const newConversation = await mockApiClient.createChatConversation({
      userId: 'user-001',
      title: 'Business Registration Help',
      category: 'business_law',
      sector: 'business',
      language: 'ar',
    });

    if (newConversation.success && newConversation.data) {
      const conversationId = newConversation.data.id;
      console.log(`Created conversation: ${conversationId}`);

      // Send a message
      const messageResponse = await mockApiClient.sendChatMessage({
        conversationId,
        message:
          'I want to start an e-commerce business in Tunisia. What do I need to know?',
        userId: 'user-001',
        language: 'ar',
      });

      if (messageResponse.success && messageResponse.data) {
        const conversation = messageResponse.data;
        console.log(
          `\nConversation has ${conversation.messages.length} messages`
        );

        // Display the latest AI response
        const latestMessage =
          conversation.messages[conversation.messages.length - 1];
        if (latestMessage.type === 'ai') {
          console.log('\nAI Response:');
          console.log(latestMessage.content.substring(0, 200) + '...');

          if (latestMessage.mascotAnimation) {
            console.log(
              `Mascot animation: ${latestMessage.mascotAnimation.type} (${latestMessage.mascotAnimation.sector})`
            );
          }
        }
      }
    }
  } catch (error) {
    console.error('Chat Error:', error);
  }
}

/**
 * Example 3: Search Functionality
 * Demonstrates semantic search with filters
 */
async function searchExample() {
  console.log('\n=== Search Example ===');

  try {
    // Perform a search with filters
    const searchResponse = await mockApiClient.searchLegalContent({
      query: 'business registration requirements',
      filters: {
        categories: ['business_law', 'administrative_law'],
        sectors: ['business'],
        priority: ['high', 'medium'],
      },
      sortBy: 'relevance',
      sortOrder: 'desc',
      page: 1,
      pageSize: 3,
    });

    if (searchResponse.success && searchResponse.data) {
      const results = searchResponse.data;
      console.log(`Found ${results.totalItems} search results`);

      results.items.forEach((result: any, index: number) => {
        console.log(`\n${index + 1}. ${result.title}`);
        console.log(
          `   Relevance: ${(result.relevanceScore * 100).toFixed(1)}%`
        );
        console.log(`   Source: ${result.source.name}`);
        console.log(`   Categories: ${result.category}`);
        console.log(`   Sectors: ${result.sectors.join(', ')}`);

        if (result.highlights.length > 0) {
          console.log(
            `   Highlights: ${result.highlights.length} matches found`
          );
        }
      });
    }

    // Get search suggestions
    const suggestionsResponse =
      await mockApiClient.getSearchSuggestions('business');
    if (suggestionsResponse.success && suggestionsResponse.data) {
      console.log('\nSearch suggestions:');
      suggestionsResponse.data.forEach((suggestion: string) => {
        console.log(`- ${suggestion}`);
      });
    }
  } catch (error) {
    console.error('Search Error:', error);
  }
}

/**
 * Example 4: Mascot System
 * Shows how to work with 3D Tunisian mascots
 */
async function mascotExample() {
  console.log('\n=== Mascot System Example ===');

  try {
    // Get all available mascots
    const mascotsResponse = await mockApiClient.getMascots();
    if (mascotsResponse.success && mascotsResponse.data) {
      console.log(`Available mascots: ${mascotsResponse.data.length}`);

      mascotsResponse.data.forEach((mascot: any) => {
        console.log(`\n- ${mascot.name} (${mascot.nameAr})`);
        console.log(`  Sector: ${mascot.sector}`);
        console.log(`  Rarity: ${mascot.rarity}`);
        console.log(`  Unlocked: ${mascot.isUnlocked ? 'Yes' : 'No'}`);
        console.log(`  Cultural elements: ${mascot.culturalElements.length}`);
        console.log(`  Animations: ${mascot.animations.length}`);
        console.log(`  Customizations: ${mascot.customizations.length}`);
      });
    }

    // Get mascot for specific sector
    const businessMascot = await mockApiClient.getMascotBySector('business');
    if (businessMascot.success && businessMascot.data) {
      const mascot = businessMascot.data;
      console.log(`\nBusiness mascot: ${mascot.name}`);
      console.log(`Description: ${mascot.description}`);

      if (mascot.animations.length > 0) {
        console.log('\nAvailable animations:');
        mascot.animations.forEach((animation: any) => {
          console.log(`- ${animation.name}: ${animation.description}`);
        });
      }
    }
  } catch (error) {
    console.error('Mascot Error:', error);
  }
}

/**
 * Example 5: Data Management
 * Demonstrates how to create and manage mock data
 */
async function dataManagementExample() {
  console.log('\n=== Data Management Example ===');

  // Create a new legal update
  const newUpdate = mockDataManager.createLegalUpdate({
    title: 'New Startup Incentives Program',
    titleAr: 'برنامج حوافز الشركات الناشئة الجديد',
    titleFr: "Nouveau programme d'incitations pour les startups",
    category: 'business_law',
    priority: 'high',
    sectors: ['business', 'technology'],
    content:
      'The government has announced a new incentives program for technology startups...',
    contentAr: 'أعلنت الحكومة عن برنامج حوافز جديد للشركات الناشئة التقنية...',
    contentFr:
      "Le gouvernement a annoncé un nouveau programme d'incitations pour les startups technologiques...",
  });

  console.log('Created new legal update:');
  console.log(`- ID: ${newUpdate.id}`);
  console.log(`- Title: ${newUpdate.title}`);
  console.log(`- Category: ${newUpdate.category}`);
  console.log(`- Priority: ${newUpdate.priority}`);

  // Validate the update
  const validation = mockDataManager.validateLegalUpdate(newUpdate);
  console.log(
    `\nValidation result: ${validation.isValid ? 'Valid' : 'Invalid'}`
  );
  if (!validation.isValid) {
    console.log('Validation errors:', validation.errors);
  }

  // Generate multiple updates for a category
  const businessUpdates = mockDataManager.generateLegalUpdatesByCategory(
    'business_law',
    3
  );
  console.log(`\nGenerated ${businessUpdates.length} business law updates:`);
  businessUpdates.forEach((update: LegalUpdate, index: number) => {
    console.log(`${index + 1}. ${update.title}`);
  });

  // Create a mock user
  const newUser = mockDataManager.createMockUser({
    name: 'Amina Trabelsi',
    nameAr: 'أمينة الطرابلسي',
    email: 'amina.trabelsi@example.com',
    profile: {
      sectors: ['tourism', 'business'],
      legalCategories: ['business_law', 'administrative_law'],
      region: 'sousse',
      language: 'fr',
      experienceLevel: 'intermediate',
      interests: ['hotel management', 'tourism regulations'],
      interestsAr: ['إدارة الفنادق', 'لوائح السياحة'],
      interestsFr: ['gestion hôtelière', 'réglementations touristiques'],
    },
  });

  console.log(`\nCreated new user: ${newUser.name} (${newUser.nameAr})`);
  console.log(`- Region: ${newUser.profile.region}`);
  console.log(`- Language: ${newUser.profile.language}`);
  console.log(`- Experience: ${newUser.profile.experienceLevel}`);
}

/**
 * Example 6: Data Filtering and Statistics
 * Shows how to filter and analyze mock data
 */
async function dataAnalysisExample() {
  console.log('\n=== Data Analysis Example ===');

  // Get all legal updates
  const allUpdatesResponse = await mockApiClient.getLegalUpdates({
    pageSize: 100,
  });

  if (allUpdatesResponse.success && allUpdatesResponse.data) {
    const allUpdates = allUpdatesResponse.data.items;

    // Filter by category
    const businessUpdates = mockDataHelpers.filterLegalUpdatesByCategory(
      allUpdates,
      ['business_law']
    );
    console.log(`Business law updates: ${businessUpdates.length}`);

    // Filter by sector
    const technologyUpdates = mockDataHelpers.filterLegalUpdatesBySector(
      allUpdates,
      ['technology']
    );
    console.log(`Technology sector updates: ${technologyUpdates.length}`);

    // Filter by priority
    const highPriorityUpdates = mockDataHelpers.filterLegalUpdatesByPriority(
      allUpdates,
      ['high']
    );
    console.log(`High priority updates: ${highPriorityUpdates.length}`);

    // Calculate statistics
    const stats = mockDataHelpers.calculateLegalUpdateStats(allUpdates);
    console.log('\nLegal Updates Statistics:');
    console.log(`- Total updates: ${stats.total}`);
    console.log(`- Bookmarked: ${stats.bookmarked}`);
    console.log(`- Read: ${stats.read}`);
    console.log(`- Average age: ${stats.averageAge.toFixed(1)} days`);

    console.log('\nBy Category:');
    Object.entries(stats.byCategory).forEach(([category, count]) => {
      const categoryName = mockDataHelpers.translateCategory(
        category as LegalCategory,
        'en'
      );
      console.log(`- ${categoryName}: ${count}`);
    });

    console.log('\nBy Priority:');
    Object.entries(stats.byPriority).forEach(([priority, count]) => {
      console.log(`- ${priority}: ${count}`);
    });
  }
}

/**
 * Example 7: Multi-language Support
 * Demonstrates localization features
 */
async function localizationExample() {
  console.log('\n=== Localization Example ===');

  // Translate categories
  const categories: LegalCategory[] = ['business_law', 'tax_law', 'family_law'];
  const languages = ['en', 'ar', 'fr'] as const;

  console.log('Category translations:');
  categories.forEach(category => {
    console.log(`\n${category}:`);
    languages.forEach(lang => {
      const translated = mockDataHelpers.translateCategory(category, lang);
      console.log(`  ${lang}: ${translated}`);
    });
  });

  // Translate sectors
  const sectors: Sector[] = ['business', 'agriculture', 'tourism'];
  console.log('\nSector translations:');
  sectors.forEach(sector => {
    console.log(`\n${sector}:`);
    languages.forEach(lang => {
      const translated = mockDataHelpers.translateSector(sector, lang);
      console.log(`  ${lang}: ${translated}`);
    });
  });

  // Generate text in different languages
  console.log('\nGenerated text samples:');
  console.log('Arabic:', mockDataHelpers.generateArabicText(10));
  console.log('French:', mockDataHelpers.generateFrenchText(10));
}

/**
 * Example 8: Error Handling
 * Shows how to handle errors in the mock system
 */
async function errorHandlingExample() {
  console.log('\n=== Error Handling Example ===');

  try {
    // Try to get a non-existent user
    const userResponse = await mockApiClient.getUser('non-existent-user');
    if (!userResponse.success) {
      console.log('Expected error for non-existent user:');
      console.log(`- Code: ${userResponse.error?.code}`);
      console.log(`- Message: ${userResponse.error?.message}`);
    }

    // Simulate a service error
    const errorResponse = await mockDataService.simulateError();
    if (!errorResponse.success) {
      console.log('\nSimulated service error:');
      console.log(`- Success: ${errorResponse.success}`);
      console.log(`- Error: ${errorResponse.error?.message}`);
    }

    // Test data validation
    const invalidUpdate = {
      id: '',
      title: '',
      content: '',
      category: 'invalid_category',
      source: null,
    } as any;

    const validation = mockDataManager.validateLegalUpdate(invalidUpdate);
    console.log('\nValidation of invalid data:');
    console.log(`- Valid: ${validation.isValid}`);
    console.log(`- Errors: ${validation.errors.join(', ')}`);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

/**
 * Run all examples
 */
async function runAllExamples() {
  console.log('🚀 Running Mock Data System Examples\n');

  await basicApiUsageExample();
  await chatConversationExample();
  await searchExample();
  await mascotExample();
  await dataManagementExample();
  await dataAnalysisExample();
  await localizationExample();
  await errorHandlingExample();

  console.log('\n✅ All examples completed successfully!');
}

// Export individual examples for selective testing
export {
  basicApiUsageExample,
  chatConversationExample,
  searchExample,
  mascotExample,
  dataManagementExample,
  dataAnalysisExample,
  localizationExample,
  errorHandlingExample,
  runAllExamples,
};
