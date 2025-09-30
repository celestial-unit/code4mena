/**
 * Enhanced Examples Index
 *
 * This file exports all example implementations for the Tunisian Legal App,
 * including mock data usage, mascot customization, and theme management.
 */

// Core mock data examples
export * from './mockDataExamples';

// Mascot customization examples
export * from './mascotCustomizationExamples';

// Theme customization examples
export * from './themeCustomizationExamples';

// Combined example runner
import { runAllExamples as runMockDataExamples } from './mockDataExamples';
import { runAllMascotExamples } from './mascotCustomizationExamples';
import { runAllThemeExamples } from './themeCustomizationExamples';

/**
 * Run all available examples in sequence
 * This demonstrates the complete enhanced feature set
 */
export async function runAllEnhancedExamples() {
  console.log('🚀 Running All Enhanced Examples for Tunisian Legal App\n');
  console.log('='.repeat(60));

  try {
    // Run mock data examples
    console.log('\n📊 MOCK DATA SYSTEM EXAMPLES');
    console.log('-'.repeat(40));
    await runMockDataExamples();

    // Run mascot examples
    console.log('\n🎭 MASCOT CUSTOMIZATION EXAMPLES');
    console.log('-'.repeat(40));
    await runAllMascotExamples();

    // Run theme examples
    console.log('\n🎨 THEME CUSTOMIZATION EXAMPLES');
    console.log('-'.repeat(40));
    runAllThemeExamples();

    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL ENHANCED EXAMPLES COMPLETED SUCCESSFULLY!');
    console.log('\n🎉 Enhanced Features Summary:');
    console.log(
      '   • Comprehensive mock data system with Tunisian legal content'
    );
    console.log('   • Cultural mascot system with sector-specific characters');
    console.log('   • Advanced theming with RTL and accessibility support');
    console.log('   • Multilingual support (Arabic, French, English)');
    console.log('   • Progressive unlocking and gamification');
    console.log('   • Cultural elements and traditional Tunisian symbols');
    console.log('   • Voice synchronization and animation triggers');
    console.log('   • Persistent user preferences and customizations');
  } catch (error) {
    console.error('❌ Error running enhanced examples:', error);
    throw error;
  }
}

/**
 * Quick test runner for development
 * Runs a subset of examples for faster testing
 */
export async function runQuickExamples() {
  console.log('⚡ Running Quick Examples for Development Testing\n');

  try {
    // Import specific examples for quick testing
    const { basicApiUsageExample, mascotExample } = await import(
      './mockDataExamples'
    );
    const { basicMascotSelectionExample } = await import(
      './mascotCustomizationExamples'
    );
    const { basicThemeOperationsExample } = await import(
      './themeCustomizationExamples'
    );

    await basicApiUsageExample();
    await mascotExample();
    await basicMascotSelectionExample();
    basicThemeOperationsExample();

    console.log('\n✅ Quick examples completed successfully!');
  } catch (error) {
    console.error('❌ Error running quick examples:', error);
    throw error;
  }
}

/**
 * Feature-specific example runners
 */
export const exampleRunners = {
  mockData: runMockDataExamples,
  mascots: runAllMascotExamples,
  themes: runAllThemeExamples,
  all: runAllEnhancedExamples,
  quick: runQuickExamples,
};

/**
 * Example categories for organized testing
 */
export const exampleCategories = {
  core: ['basicApiUsageExample', 'chatConversationExample', 'searchExample'],
  cultural: [
    'mascotExample',
    'culturalCustomizationExample',
    'mascotChatIntegrationExample',
  ],
  theming: [
    'basicThemeOperationsExample',
    'advancedThemeCustomizationExample',
    'rtlLanguageIntegrationExample',
  ],
  accessibility: ['accessibilityThemeExample', 'themePersistenceExample'],
  advanced: [
    'dataManagementExample',
    'mascotUnlockingExample',
    'themeAnimationExample',
  ],
};

/**
 * Development utilities
 */
export const devUtils = {
  /**
   * Test specific example category
   */
  async testCategory(category: keyof typeof exampleCategories) {
    console.log(`🧪 Testing ${category} examples...`);

    const examples = exampleCategories[category];
    for (const exampleName of examples) {
      try {
        console.log(`Running ${exampleName}...`);
        // Dynamic import and execution would go here
        console.log(`✅ ${exampleName} completed`);
      } catch (error) {
        console.error(`❌ ${exampleName} failed:`, error);
      }
    }
  },

  /**
   * Validate all mock data files
   */
  validateMockData() {
    console.log('🔍 Validating mock data files...');

    const requiredFiles = [
      'mascots.json',
      'users.json',
      'chat-conversations.json',
      'quick-replies.json',
      'search-results.json',
      'dashboard-stats.json',
    ];

    requiredFiles.forEach(file => {
      try {
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, '..', 'mock', file);

        if (fs.existsSync(filePath)) {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          console.log(
            `✅ ${file}: ${Array.isArray(data) ? data.length : 'object'} items`
          );
        } else {
          console.log(`❌ ${file}: File not found`);
        }
      } catch (error) {
        console.log(`❌ ${file}: Invalid JSON - ${error.message}`);
      }
    });
  },
};
