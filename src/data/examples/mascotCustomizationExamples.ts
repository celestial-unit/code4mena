/**
 * Mascot Customization Examples
 *
 * This file demonstrates how to use the enhanced mascot system with cultural elements,
 * animations, and customization features specific to Tunisian legal sectors.
 */

import { mockApiClient } from '../../services';
import { MascotSector, MascotEmotion, MascotCustomization } from '../../types';

/**
 * Example 1: Basic Mascot Selection and Display
 * Shows how to get and display mascots for different sectors
 */
async function basicMascotSelectionExample() {
  console.log('=== Basic Mascot Selection Example ===');

  try {
    // Get all available mascots
    const mascotsResponse = await mockApiClient.getMascots();

    if (mascotsResponse.success && mascotsResponse.data) {
      console.log(`Found ${mascotsResponse.data.length} mascots available`);

      // Display each mascot with cultural information
      mascotsResponse.data.forEach((mascot: any) => {
        console.log(`\n🎭 ${mascot.name} (${mascot.nameAr})`);
        console.log(`   Sector: ${mascot.sector}`);
        console.log(`   Description: ${mascot.description}`);
        console.log(
          `   Rarity: ${mascot.rarity} | Popularity: ${mascot.popularity}%`
        );
        console.log(`   Unlocked: ${mascot.isUnlocked ? '✅' : '🔒'}`);

        // Show cultural elements
        if (mascot.culturalElements.length > 0) {
          console.log(`   Cultural Elements:`);
          mascot.culturalElements.forEach((element: any) => {
            console.log(`   - ${element.name} (${element.nameAr})`);
            console.log(`     Significance: ${element.culturalSignificance}`);
          });
        }

        // Show available animations
        if (mascot.animations.length > 0) {
          console.log(`   Animations: ${mascot.animations.length} available`);
          mascot.animations.forEach((animation: any) => {
            console.log(`   - ${animation.name}: ${animation.description}`);
          });
        }
      });
    }
  } catch (error) {
    console.error('Error fetching mascots:', error);
  }
}

/**
 * Example 2: Sector-Specific Mascot Usage
 * Demonstrates how to get mascots for specific legal sectors
 */
async function sectorSpecificMascotExample() {
  console.log('\n=== Sector-Specific Mascot Example ===');

  const sectors: MascotSector[] = ['business', 'agriculture', 'money'];

  for (const sector of sectors) {
    try {
      const mascotResponse = await mockApiClient.getMascotBySector(sector);

      if (mascotResponse.success && mascotResponse.data) {
        const mascot = mascotResponse.data;
        console.log(`\n📊 ${sector.toUpperCase()} SECTOR MASCOT:`);
        console.log(`Name: ${mascot.name} (${mascot.nameAr})`);
        console.log(
          `Voice Sync: ${mascot.voiceSyncCapability ? 'Supported' : 'Not supported'}`
        );

        // Show Tunisian symbols
        if (mascot.tunisianSymbols && mascot.tunisianSymbols.length > 0) {
          console.log(`Tunisian Symbols:`);
          mascot.tunisianSymbols.forEach((symbol: any) => {
            console.log(`- ${symbol.name} (${symbol.nameAr})`);
            console.log(`  Significance: ${symbol.significance}`);
            console.log(`  Historical Period: ${symbol.historicalPeriod}`);
          });
        }

        // Show customization options
        if (mascot.customizations && mascot.customizations.length > 0) {
          console.log(`Customization Options:`);
          mascot.customizations.forEach((custom: any) => {
            console.log(`- ${custom.name} (${custom.nameAr})`);
            console.log(
              `  Rarity: ${custom.rarity} | Cost: ${custom.cost} points`
            );
            console.log(`  Unlocked: ${custom.isUnlocked ? '✅' : '🔒'}`);
          });
        }
      }
    } catch (error) {
      console.error(`Error fetching ${sector} mascot:`, error);
    }
  }
}

/**
 * Example 3: Mascot Animation Triggers
 * Shows how to trigger different mascot animations based on user interactions
 */
async function mascotAnimationExample() {
  console.log('\n=== Mascot Animation Example ===');

  try {
    // Get business mascot for animation examples
    const mascotResponse = await mockApiClient.getMascotBySector('business');

    if (mascotResponse.success && mascotResponse.data) {
      const mascot = mascotResponse.data;
      console.log(`Using ${mascot.name} for animation examples`);

      // Simulate different animation triggers
      const animationScenarios = [
        {
          trigger: 'user_message',
          context: 'User asks about business registration',
          expectedAnimation: 'Professional Greeting',
        },
        {
          trigger: 'ai_response',
          context: 'AI explains legal concepts',
          expectedAnimation: 'Explaining with Documents',
        },
        {
          trigger: 'achievement_unlock',
          context: 'User unlocks business law achievement',
          expectedAnimation: 'Celebration',
        },
      ];

      animationScenarios.forEach((scenario, index) => {
        console.log(`\n${index + 1}. Animation Scenario:`);
        console.log(`   Trigger: ${scenario.trigger}`);
        console.log(`   Context: ${scenario.context}`);

        // Find matching animation
        const matchingAnimation = mascot.animations.find((anim: any) =>
          anim.triggers.includes(scenario.trigger)
        );

        if (matchingAnimation) {
          console.log(`   ✅ Animation: ${matchingAnimation.name}`);
          console.log(`   Duration: ${matchingAnimation.duration}s`);
          console.log(`   Emotional Tone: ${matchingAnimation.emotionalTone}`);
          console.log(
            `   Voice Sync: ${matchingAnimation.voiceSync ? 'Yes' : 'No'}`
          );
          console.log(
            `   Cultural Context: ${matchingAnimation.culturalContext.join(', ')}`
          );
        } else {
          console.log(`   ❌ No matching animation found`);
        }
      });
    }
  } catch (error) {
    console.error('Error in animation example:', error);
  }
}

/**
 * Example 4: Cultural Customization
 * Demonstrates how to work with Tunisian cultural elements and customizations
 */
async function culturalCustomizationExample() {
  console.log('\n=== Cultural Customization Example ===');

  try {
    // Get agriculture mascot for cultural examples
    const mascotResponse = await mockApiClient.getMascotBySector('agriculture');

    if (mascotResponse.success && mascotResponse.data) {
      const mascot = mascotResponse.data;
      console.log(`Exploring cultural elements of ${mascot.name}`);

      // Analyze cultural elements
      console.log(`\n🏛️ CULTURAL ELEMENTS ANALYSIS:`);
      mascot.culturalElements.forEach((element: any, index: number) => {
        console.log(`\n${index + 1}. ${element.name}`);
        console.log(`   Arabic Name: ${element.nameAr}`);
        console.log(`   French Name: ${element.nameFr}`);
        console.log(`   Type: ${element.type}`);
        console.log(`   Tunisian Reference: ${element.tunisianReference}`);
        console.log(
          `   Cultural Significance: ${element.culturalSignificance}`
        );
        console.log(`   Region: ${element.region}`);
        console.log(`   Traditional: ${element.isTraditional ? 'Yes' : 'No'}`);

        if (element.modernAdaptation) {
          console.log(`   Modern Adaptation: ${element.modernAdaptation}`);
        }
      });

      // Show Tunisian symbols with visual elements
      if (mascot.tunisianSymbols && mascot.tunisianSymbols.length > 0) {
        console.log(`\n🇹🇳 TUNISIAN SYMBOLS:`);
        mascot.tunisianSymbols.forEach((symbol: any) => {
          console.log(`\n- ${symbol.name} (${symbol.nameAr})`);
          console.log(`  Type: ${symbol.type}`);
          console.log(`  Usage: ${symbol.usage}`);
          console.log(`  Historical Period: ${symbol.historicalPeriod}`);
          console.log(`  Modern Usage: ${symbol.modernUsage ? 'Yes' : 'No'}`);

          if (symbol.visualElements && symbol.visualElements.length > 0) {
            console.log(`  Visual Elements:`);
            symbol.visualElements.forEach((visual: any) => {
              console.log(`  - ${visual.type}: ${visual.value}`);
              console.log(`    Cultural Meaning: ${visual.culturalMeaning}`);
            });
          }
        });
      }
    }
  } catch (error) {
    console.error('Error in cultural customization example:', error);
  }
}

/**
 * Example 5: Mascot Unlocking and Progression
 * Shows how mascot unlocking works with achievements and requirements
 */
async function mascotUnlockingExample() {
  console.log('\n=== Mascot Unlocking Example ===');

  try {
    const mascotsResponse = await mockApiClient.getMascots();

    if (mascotsResponse.success && mascotsResponse.data) {
      console.log('📈 MASCOT UNLOCKING STATUS:');

      mascotsResponse.data.forEach((mascot: any) => {
        console.log(`\n${mascot.name}:`);
        console.log(
          `  Status: ${mascot.isUnlocked ? '✅ Unlocked' : '🔒 Locked'}`
        );
        console.log(`  Rarity: ${mascot.rarity}`);

        if (!mascot.isUnlocked && mascot.unlockRequirement) {
          const req = mascot.unlockRequirement;
          console.log(`  Unlock Requirement:`);
          console.log(`  - Type: ${req.type}`);
          console.log(`  - Value: ${req.value}`);
          console.log(`  - Description: ${req.description}`);
          console.log(`  - Completed: ${req.isCompleted ? '✅' : '❌'}`);
        }

        // Show customization unlock requirements
        if (mascot.customizations && mascot.customizations.length > 0) {
          console.log(`  Customizations:`);
          mascot.customizations.forEach((custom: any) => {
            console.log(
              `  - ${custom.name}: ${custom.isUnlocked ? '✅' : '🔒'}`
            );
            if (!custom.isUnlocked && custom.unlockRequirement) {
              console.log(
                `    Requirement: ${custom.unlockRequirement.description}`
              );
            }
          });
        }
      });

      // Simulate unlocking progress
      console.log(`\n🎯 UNLOCKING SIMULATION:`);
      console.log('Simulating user progress towards unlocking mascots...');

      const lockedMascots = mascotsResponse.data.filter(
        (m: any) => !m.isUnlocked
      );
      if (lockedMascots.length > 0) {
        const targetMascot = lockedMascots[0];
        console.log(`Target: ${targetMascot.name}`);
        console.log(
          `Progress needed: ${targetMascot.unlockRequirement?.description || 'Complete achievements'}`
        );
        console.log('💡 Tip: Focus on tax law topics to unlock this mascot!');
      }
    }
  } catch (error) {
    console.error('Error in unlocking example:', error);
  }
}

/**
 * Example 6: Mascot Integration with Chat
 * Shows how mascots enhance chat conversations with cultural context
 */
async function mascotChatIntegrationExample() {
  console.log('\n=== Mascot Chat Integration Example ===');

  try {
    // Get a sample conversation to analyze mascot integration
    const conversationsResponse =
      await mockApiClient.getChatConversations('user-001');

    if (
      conversationsResponse.success &&
      conversationsResponse.data &&
      conversationsResponse.data.length > 0
    ) {
      const conversation = conversationsResponse.data[0];
      console.log(`Analyzing conversation: "${conversation.title}"`);

      // Find messages with mascot animations
      const messagesWithMascots = conversation.messages.filter(
        (msg: any) => msg.mascotAnimation
      );

      console.log(`\n🎭 MASCOT ANIMATIONS IN CONVERSATION:`);
      messagesWithMascots.forEach((message: any, index: number) => {
        const animation = message.mascotAnimation;
        console.log(`\n${index + 1}. Message Animation:`);
        console.log(`   Type: ${animation.type}`);
        console.log(`   Sector: ${animation.sector}`);
        console.log(`   Duration: ${animation.duration}s`);
        console.log(
          `   Cultural Elements: ${animation.culturalElements.join(', ')}`
        );
        console.log(
          `   Voice Sync: ${animation.voiceSync ? 'Enabled' : 'Disabled'}`
        );

        // Show cultural context from message metadata
        if (message.metadata && message.metadata.culturalContext) {
          const cultural = message.metadata.culturalContext;
          if (
            cultural.culturalReferences &&
            cultural.culturalReferences.length > 0
          ) {
            console.log(`   Cultural References:`);
            cultural.culturalReferences.forEach((ref: any) => {
              console.log(`   - "${ref.term}": ${ref.explanation}`);
            });
          }
        }
      });

      // Analyze conversation cultural relevance
      console.log(`\n🌍 CULTURAL ANALYSIS:`);
      console.log(`Language: ${conversation.language}`);
      console.log(`Sector: ${conversation.sector}`);
      console.log(`Category: ${conversation.category}`);

      if (conversation.metadata) {
        console.log(
          `Complexity Level: ${conversation.metadata.complexityLevel}`
        );
        console.log(`Cultural Relevance: High (Tunisian legal context)`);
      }
    }
  } catch (error) {
    console.error('Error in chat integration example:', error);
  }
}

/**
 * Run all mascot customization examples
 */
async function runAllMascotExamples() {
  console.log('🎭 Running Mascot Customization Examples\n');

  await basicMascotSelectionExample();
  await sectorSpecificMascotExample();
  await mascotAnimationExample();
  await culturalCustomizationExample();
  await mascotUnlockingExample();
  await mascotChatIntegrationExample();

  console.log('\n✅ All mascot examples completed successfully!');
  console.log('\n💡 Key Features Demonstrated:');
  console.log('- Multi-sector mascot system with Tunisian cultural elements');
  console.log('- Animation triggers based on user interactions');
  console.log('- Cultural customization with traditional and modern elements');
  console.log('- Progressive unlocking system with achievements');
  console.log('- Integration with chat conversations and voice sync');
  console.log('- Multilingual support (Arabic, French, English)');
}

// Export individual examples for selective testing
export {
  basicMascotSelectionExample,
  sectorSpecificMascotExample,
  mascotAnimationExample,
  culturalCustomizationExample,
  mascotUnlockingExample,
  mascotChatIntegrationExample,
  runAllMascotExamples,
};
