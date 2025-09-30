# Mascot Customization Guide

This guide explains how to customize and interact with the 3D Tunisian mascots in the legal app.

## Table of Contents

1. [Mascot System Overview](#mascot-system-overview)
2. [Mascot Types and Variants](#mascot-types-and-variants)
3. [Sector-Specific Customization](#sector-specific-customization)
4. [Cultural Elements](#cultural-elements)
5. [Animation System](#animation-system)
6. [Implementation Examples](#implementation-examples)

## Mascot System Overview

The mascot system provides interactive 3D characters that represent different sectors of Tunisian society and government, each with cultural authenticity and sector-specific characteristics.

### Core Components

```typescript
// Main mascot components
import {
  TunisianMascot3D,      // Full 3D mascot with Skia
  Enhanced3DMascot,      // Interactive 3D with gestures
  SimpleMascot,          // 2D fallback version
  MascotCustomization,   // Customization interface
  MascotSectorSelector,  // Sector selection
  MascotAchievementCelebration // Achievement animations
} from '../components/mascot';

// Context for state management
import { useMascot } from '../contexts/MascotContext';
```

### Mascot State Structure

```typescript
interface MascotState {
  currentSector: MascotSector;
  currentEmotion: MascotEmotion;
  customization: MascotCustomization;
  isAnimating: boolean;
  lastInteraction: Date | null;
}

interface MascotCustomization {
  culturalVariation: MascotCulturalVariation;
  clothingStyle: string;
  accessories: string[];
  colorScheme: string;
  personalityTraits: string[];
}
```

## Mascot Types and Variants

### Available Sectors

```typescript
type MascotSector = 
  | 'LEGAL'           // Legal/judicial system
  | 'GOVERNMENT'      // Government services
  | 'BUSINESS'        // Business and commerce
  | 'EDUCATION'       // Educational institutions
  | 'HEALTHCARE'      // Health services
  | 'TOURISM'         // Tourism and culture
  | 'AGRICULTURE'     // Agricultural sector
  | 'TECHNOLOGY';     // Technology and innovation

// Sector-specific characteristics
const sectorCharacteristics = {
  LEGAL: {
    primaryColor: '#1E40AF',      // Justice blue
    clothing: ['robe', 'formal'],
    accessories: ['gavel', 'scales', 'books'],
    personality: ['wise', 'fair', 'analytical'],
    culturalElements: ['traditional_patterns', 'calligraphy'],
  },
  GOVERNMENT: {
    primaryColor: '#E31E24',      // Tunisian flag red
    clothing: ['formal', 'traditional'],
    accessories: ['flag', 'documents', 'seal'],
    personality: ['helpful', 'official', 'respectful'],
    culturalElements: ['flag_motifs', 'architectural_patterns'],
  },
  BUSINESS: {
    primaryColor: '#059669',      // Business green
    clothing: ['business_suit', 'modern'],
    accessories: ['briefcase', 'calculator', 'charts'],
    personality: ['professional', 'ambitious', 'innovative'],
    culturalElements: ['geometric_patterns', 'modern_arabic'],
  },
  // ... other sectors
};
```

### Emotional States

```typescript
type MascotEmotion = 
  | 'HAPPY'           // Cheerful and welcoming
  | 'EXCITED'         // Enthusiastic and energetic
  | 'FOCUSED'         // Concentrated and serious
  | 'HELPFUL'         // Ready to assist
  | 'CELEBRATING'     // Achievement celebration
  | 'THINKING'        // Processing or considering
  | 'GREETING'        // Welcoming gesture
  | 'EXPLAINING';     // Teaching or informing

// Emotion-specific animations
const emotionAnimations = {
  HAPPY: {
    facial: 'smile',
    gesture: 'wave',
    posture: 'upright',
    duration: 2000,
  },
  EXCITED: {
    facial: 'big_smile',
    gesture: 'jump',
    posture: 'energetic',
    duration: 3000,
  },
  CELEBRATING: {
    facial: 'joy',
    gesture: 'victory',
    posture: 'triumphant',
    duration: 4000,
    particles: 'confetti',
  },
  // ... other emotions
};
```

## Sector-Specific Customization

### Legal Sector Mascot

```typescript
const legalMascotConfig = {
  sector: 'LEGAL' as MascotSector,
  customization: {
    culturalVariation: 'TRADITIONAL',
    clothingStyle: 'judicial_robe',
    accessories: ['scales_of_justice', 'law_books', 'gavel'],
    colorScheme: 'justice_blue',
    personalityTraits: ['wise', 'fair', 'knowledgeable'],
  },
  animations: {
    idle: 'reading_documents',
    interaction: 'explaining_law',
    celebration: 'gavel_strike',
  },
  culturalElements: {
    patterns: ['islamic_geometric', 'calligraphy_borders'],
    symbols: ['scales', 'crescent_star', 'olive_branch'],
    colors: ['justice_blue', 'gold_accents', 'white_highlights'],
  },
};

function LegalMascot() {
  const { mascotState, updateSector, triggerInteraction } = useMascot();
  
  useEffect(() => {
    updateSector('LEGAL');
  }, []);
  
  return (
    <TunisianMascot3D
      sector="LEGAL"
      emotion={mascotState.currentEmotion}
      customization={legalMascotConfig.customization}
      onInteraction={(type) => {
        if (type === 'tap') {
          triggerInteraction('explaining_law');
        }
      }}
      size={200}
      showCulturalElements={true}
    />
  );
}
```

### Government Services Mascot

```typescript
const governmentMascotConfig = {
  sector: 'GOVERNMENT' as MascotSector,
  customization: {
    culturalVariation: 'OFFICIAL',
    clothingStyle: 'formal_traditional',
    accessories: ['tunisian_flag', 'official_seal', 'documents'],
    colorScheme: 'national_colors',
    personalityTraits: ['helpful', 'official', 'patriotic'],
  },
  animations: {
    idle: 'reviewing_documents',
    interaction: 'presenting_services',
    celebration: 'flag_wave',
  },
  culturalElements: {
    patterns: ['flag_motifs', 'star_crescent', 'architectural'],
    symbols: ['national_emblem', 'government_seal'],
    colors: ['flag_red', 'flag_white', 'gold_details'],
  },
};
```

### Tourism & Culture Mascot

```typescript
const tourismMascotConfig = {
  sector: 'TOURISM' as MascotSector,
  customization: {
    culturalVariation: 'CULTURAL_AMBASSADOR',
    clothingStyle: 'traditional_tunisian',
    accessories: ['cultural_artifacts', 'tourism_guide', 'camera'],
    colorScheme: 'mediterranean_colors',
    personalityTraits: ['welcoming', 'knowledgeable', 'proud'],
  },
  animations: {
    idle: 'showcasing_culture',
    interaction: 'cultural_presentation',
    celebration: 'traditional_dance',
  },
  culturalElements: {
    patterns: ['berber_motifs', 'carthaginian_symbols', 'islamic_art'],
    symbols: ['palm_trees', 'mediterranean_sea', 'ancient_ruins'],
    colors: ['desert_gold', 'sea_blue', 'sunset_orange'],
  },
};
```

## Cultural Elements

### Traditional Patterns

```typescript
const culturalPatterns = {
  ISLAMIC_GEOMETRIC: {
    name: 'Islamic Geometric',
    nameAr: 'الأنماط الهندسية الإسلامية',
    description: 'Traditional Islamic geometric patterns',
    usage: ['clothing_borders', 'background_elements', 'accessories'],
    colors: ['gold', 'blue', 'white'],
  },
  BERBER_MOTIFS: {
    name: 'Berber Motifs',
    nameAr: 'الزخارف الأمازيغية',
    description: 'Traditional Berber cultural symbols',
    usage: ['jewelry', 'clothing_patterns', 'decorative_elements'],
    colors: ['silver', 'turquoise', 'red'],
  },
  CARTHAGINIAN_SYMBOLS: {
    name: 'Carthaginian Heritage',
    nameAr: 'التراث القرطاجي',
    description: 'Ancient Carthaginian cultural elements',
    usage: ['historical_references', 'architectural_details'],
    colors: ['purple', 'gold', 'white'],
  },
  CALLIGRAPHY_BORDERS: {
    name: 'Arabic Calligraphy',
    nameAr: 'الخط العربي',
    description: 'Beautiful Arabic calligraphy elements',
    usage: ['text_decorations', 'borders', 'ceremonial_elements'],
    colors: ['black', 'gold', 'dark_blue'],
  },
};
```

### Cultural Accessories

```typescript
const culturalAccessories = {
  TRADITIONAL_JEWELRY: {
    items: ['kholkhal', 'fibula', 'traditional_earrings'],
    occasions: ['formal', 'cultural_events'],
    regions: ['tunis', 'sfax', 'kairouan'],
  },
  TRADITIONAL_CLOTHING: {
    items: ['jebba', 'farmla', 'chechia', 'haik'],
    occasions: ['formal', 'religious', 'cultural'],
    seasons: ['all_seasons', 'summer', 'winter'],
  },
  PROFESSIONAL_ITEMS: {
    legal: ['scales', 'gavel', 'law_books'],
    government: ['official_seal', 'documents', 'flag'],
    business: ['briefcase', 'calculator', 'charts'],
    education: ['books', 'globe', 'graduation_cap'],
  },
};
```

## Animation System

### Basic Animations

```typescript
interface MascotAnimation {
  name: string;
  duration: number;
  loop: boolean;
  triggers: AnimationTrigger[];
  culturalElements?: CulturalAnimationElement[];
}

const basicAnimations: Record<string, MascotAnimation> = {
  idle_breathing: {
    name: 'Idle Breathing',
    duration: 3000,
    loop: true,
    triggers: ['no_interaction'],
  },
  greeting_wave: {
    name: 'Greeting Wave',
    duration: 2000,
    loop: false,
    triggers: ['user_approach', 'screen_enter'],
    culturalElements: ['traditional_greeting_gesture'],
  },
  explaining_gesture: {
    name: 'Explaining Gesture',
    duration: 4000,
    loop: false,
    triggers: ['information_request', 'help_needed'],
    culturalElements: ['respectful_hand_gestures'],
  },
  celebration_dance: {
    name: 'Achievement Celebration',
    duration: 5000,
    loop: false,
    triggers: ['achievement_unlocked', 'task_completed'],
    culturalElements: ['traditional_dance_moves', 'joy_expressions'],
  },
};
```

### Sector-Specific Animations

```typescript
const sectorAnimations = {
  LEGAL: {
    gavel_strike: {
      name: 'Gavel Strike',
      duration: 1500,
      sound: 'gavel_sound',
      culturalElements: ['formal_posture', 'judicial_authority'],
    },
    scales_balance: {
      name: 'Balancing Scales',
      duration: 3000,
      symbolism: 'justice_fairness',
      culturalElements: ['wisdom_gesture', 'contemplative_pose'],
    },
  },
  GOVERNMENT: {
    document_review: {
      name: 'Document Review',
      duration: 2500,
      props: ['official_documents'],
      culturalElements: ['official_posture', 'careful_attention'],
    },
    service_presentation: {
      name: 'Service Presentation',
      duration: 4000,
      props: ['service_brochure'],
      culturalElements: ['welcoming_gesture', 'helpful_demeanor'],
    },
  },
  TOURISM: {
    cultural_showcase: {
      name: 'Cultural Showcase',
      duration: 6000,
      props: ['cultural_artifacts'],
      culturalElements: ['proud_presentation', 'heritage_pride'],
    },
    traditional_dance: {
      name: 'Traditional Dance',
      duration: 8000,
      music: 'traditional_tunisian',
      culturalElements: ['folk_dance_moves', 'cultural_celebration'],
    },
  },
};
```

### Interactive Gestures

```typescript
const interactiveGestures = {
  TAP: {
    response: 'acknowledgment_nod',
    duration: 1000,
    feedback: 'positive',
  },
  DOUBLE_TAP: {
    response: 'excited_wave',
    duration: 2000,
    feedback: 'enthusiastic',
  },
  LONG_PRESS: {
    response: 'detailed_explanation',
    duration: 5000,
    feedback: 'informative',
  },
  SWIPE_LEFT: {
    response: 'sector_change_left',
    duration: 1500,
    feedback: 'transitional',
  },
  SWIPE_RIGHT: {
    response: 'sector_change_right',
    duration: 1500,
    feedback: 'transitional',
  },
};
```

## Implementation Examples

### Complete Mascot Integration

```typescript
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useMascot } from '../contexts/MascotContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  TunisianMascot3D,
  MascotCustomization,
  MascotSectorSelector,
} from '../components/mascot';

function MascotShowcase() {
  const { theme } = useTheme();
  const { 
    mascotState, 
    updateSector, 
    updateEmotion, 
    updateCustomization,
    triggerInteraction 
  } = useMascot();
  
  const [showCustomization, setShowCustomization] = useState(false);
  
  // Auto-cycle through emotions for demo
  useEffect(() => {
    const emotions: MascotEmotion[] = ['HAPPY', 'EXCITED', 'HELPFUL', 'THINKING'];
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      updateEmotion(emotions[currentIndex]);
      currentIndex = (currentIndex + 1) % emotions.length;
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleMascotInteraction = (interactionType: string) => {
    switch (interactionType) {
      case 'tap':
        triggerInteraction('greeting');
        updateEmotion('HAPPY');
        break;
      case 'double_tap':
        triggerInteraction('celebration');
        updateEmotion('EXCITED');
        break;
      case 'long_press':
        setShowCustomization(true);
        break;
    }
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 16,
    },
    mascotContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      height: 300,
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      marginBottom: 16,
    },
    controlsContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
    },
  });
  
  return (
    <View style={styles.container}>
      {/* Main Mascot Display */}
      <View style={styles.mascotContainer}>
        <TunisianMascot3D
          sector={mascotState.currentSector}
          emotion={mascotState.currentEmotion}
          customization={mascotState.customization}
          onInteraction={handleMascotInteraction}
          size={250}
          showCulturalElements={true}
          enableGestures={true}
          animationSpeed={1.0}
        />
      </View>
      
      {/* Sector Selection */}
      <View style={styles.controlsContainer}>
        <MascotSectorSelector
          currentSector={mascotState.currentSector}
          onSectorChange={updateSector}
          showLabels={true}
          showIcons={true}
        />
      </View>
      
      {/* Customization Panel */}
      {showCustomization && (
        <MascotCustomization
          customization={mascotState.customization}
          onCustomizationChange={updateCustomization}
          onClose={() => setShowCustomization(false)}
          availableOptions={{
            culturalVariations: ['TRADITIONAL', 'MODERN', 'FORMAL'],
            clothingStyles: ['traditional', 'formal', 'casual'],
            accessories: ['cultural', 'professional', 'decorative'],
            colorSchemes: ['traditional', 'modern', 'sector_specific'],
          }}
        />
      )}
    </View>
  );
}

export default MascotShowcase;
```

### Achievement Celebration Integration

```typescript
import React, { useState } from 'react';
import { MascotAchievementCelebration } from '../components/mascot';

function AchievementDemo() {
  const [showCelebration, setShowCelebration] = useState(false);
  
  const sampleAchievement = {
    id: 'legal_expert',
    title: 'Legal Expert',
    titleAr: 'خبير قانوني',
    description: 'Completed 50 legal queries successfully',
    descriptionAr: 'أكمل 50 استعلام قانوني بنجاح',
    icon: 'gavel',
    rarity: 'gold' as const,
    sector: 'LEGAL' as MascotSector,
    culturalElements: ['justice_symbols', 'traditional_patterns'],
  };
  
  return (
    <View>
      <Button
        title="Trigger Achievement"
        onPress={() => setShowCelebration(true)}
      />
      
      <MascotAchievementCelebration
        visible={showCelebration}
        achievement={sampleAchievement}
        mascotSector="LEGAL"
        onAnimationComplete={() => setShowCelebration(false)}
        celebrationStyle="traditional"
        showCulturalElements={true}
        duration={5000}
      />
    </View>
  );
}
```

### Custom Mascot Hook

```typescript
import { useCallback } from 'react';
import { useMascot } from '../contexts/MascotContext';

export function useMascotInteractions() {
  const { mascotState, updateEmotion, triggerInteraction } = useMascot();
  
  const celebrateSuccess = useCallback(() => {
    updateEmotion('CELEBRATING');
    triggerInteraction('achievement_celebration');
  }, [updateEmotion, triggerInteraction]);
  
  const showThinking = useCallback(() => {
    updateEmotion('THINKING');
    triggerInteraction('processing');
  }, [updateEmotion, triggerInteraction]);
  
  const greetUser = useCallback(() => {
    updateEmotion('HAPPY');
    triggerInteraction('greeting');
  }, [updateEmotion, triggerInteraction]);
  
  const explainConcept = useCallback(() => {
    updateEmotion('HELPFUL');
    triggerInteraction('explaining');
  }, [updateEmotion, triggerInteraction]);
  
  return {
    mascotState,
    celebrateSuccess,
    showThinking,
    greetUser,
    explainConcept,
  };
}
```

## Best Practices

### Performance Optimization
- Use `React.memo` for mascot components
- Implement proper cleanup for animations
- Use native driver when possible
- Optimize 3D models for mobile devices

### Cultural Sensitivity
- Research cultural elements thoroughly
- Consult with cultural experts
- Avoid stereotypes or inappropriate representations
- Respect religious and cultural symbols

### User Experience
- Provide clear interaction feedback
- Ensure animations are not distracting
- Offer accessibility alternatives
- Allow users to disable animations if needed

### Technical Considerations
- Provide 2D fallbacks for 3D components
- Handle device capability detection
- Implement proper error boundaries
- Test on various device types and sizes

This mascot system provides rich, culturally authentic interactions while maintaining technical excellence and user experience quality.