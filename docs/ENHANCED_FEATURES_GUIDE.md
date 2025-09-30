# Enhanced Features Guide

This guide covers the enhanced profile features that have been integrated into the Tunisian Legal App.

## Table of Contents

1. [Theme System](#theme-system)
2. [Mascot Integration](#mascot-integration)
3. [RTL/Language Support](#rtllanguage-support)
4. [Gamification System](#gamification-system)
5. [Enhanced Profile Screen](#enhanced-profile-screen)
6. [Component Usage Examples](#component-usage-examples)

## Theme System

The app includes a comprehensive theming system that supports light and dark modes with cultural color schemes.

### Basic Usage

```typescript
import { useTheme, createThemedStyles } from '../contexts/ThemeContext';

function MyComponent() {
  const { theme, isDark, toggleTheme } = useTheme();
  
  const styles = createThemedStyles((theme) => ({
    container: {
      backgroundColor: theme.colors.background,
      padding: 16,
      borderRadius: 8,
    },
    text: {
      color: theme.colors.text,
      fontSize: 16,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      padding: 12,
      borderRadius: 6,
    },
  }));
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Themed content</Text>
      <TouchableOpacity style={styles.primaryButton} onPress={toggleTheme}>
        <Text style={{ color: 'white' }}>
          Switch to {isDark ? 'Light' : 'Dark'} Mode
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Available Theme Colors

```typescript
interface ThemeColors {
  // Base colors
  background: string;      // Main background
  surface: string;         // Card/surface background
  card: string;           // Card background
  
  // Text colors
  text: string;           // Primary text
  textSecondary: string;  // Secondary text
  textTertiary: string;   // Tertiary text
  
  // Brand colors
  primary: string;        // Primary brand color
  primaryLight: string;   // Light variant
  primaryDark: string;    // Dark variant
  accent: string;         // Accent color
  accentLight: string;    // Light accent
  
  // Status colors
  success: string;        // Success state
  warning: string;        // Warning state
  error: string;          // Error state
  info: string;           // Info state
  
  // UI colors
  border: string;         // Border color
  divider: string;        // Divider color
  ripple: string;         // Ripple effect
  overlay: string;        // Modal overlay
  
  // Gradients
  gradientStart: string;  // Gradient start
  gradientEnd: string;    // Gradient end
}
```

## Mascot Integration

Interactive 3D mascots with cultural elements and sector-specific variations.

### Basic Mascot Usage

```typescript
import { useMascot } from '../contexts/MascotContext';
import { TunisianMascot3D, SimpleMascot } from '../components/mascot';

function ProfileScreen() {
  const { 
    mascotState, 
    updateSector, 
    updateEmotion, 
    triggerInteraction 
  } = useMascot();
  
  return (
    <View>
      {/* 3D Mascot (requires Skia) */}
      <TunisianMascot3D
        sector={mascotState.currentSector}
        emotion={mascotState.currentEmotion}
        customization={mascotState.customization}
        onInteraction={(type) => triggerInteraction(type)}
        size={200}
      />
      
      {/* Simple 2D Mascot (fallback) */}
      <SimpleMascot
        sector={mascotState.currentSector}
        emotion={mascotState.currentEmotion}
        size={150}
        onPress={() => triggerInteraction('tap')}
      />
    </View>
  );
}
```

### Mascot Customization

```typescript
import { MascotCustomization, MascotSectorSelector } from '../components/mascot';

function MascotCustomizationScreen() {
  const { mascotState, updateSector, updateCustomization } = useMascot();
  
  return (
    <ScrollView>
      {/* Sector Selection */}
      <MascotSectorSelector
        currentSector={mascotState.currentSector}
        onSectorChange={updateSector}
      />
      
      {/* Customization Options */}
      <MascotCustomization
        customization={mascotState.customization}
        onCustomizationChange={updateCustomization}
      />
    </ScrollView>
  );
}
```

### Available Mascot Sectors

```typescript
type MascotSector = 
  | 'LEGAL'           // Legal/judicial theme
  | 'GOVERNMENT'      // Government services
  | 'BUSINESS'        // Business/commercial
  | 'EDUCATION'       // Educational content
  | 'HEALTHCARE'      // Health services
  | 'TOURISM'         // Tourism/cultural
  | 'AGRICULTURE'     // Agricultural sector
  | 'TECHNOLOGY';     // Tech/innovation
```

## RTL/Language Support

Seamless language switching with proper layout adaptation for Arabic and French.

### Basic RTL Usage

```typescript
import { useRTL, useRTLStyles } from '../contexts/RTLContext';

function MyComponent() {
  const { 
    isRTL, 
    currentLanguage, 
    setLanguage, 
    getTextAlign,
    getFlexDirection 
  } = useRTL();
  
  const styles = useRTLStyles((isRTL) => ({
    container: {
      flexDirection: getFlexDirection(),
      padding: 16,
    },
    text: {
      textAlign: getTextAlign(),
      writingDirection: isRTL ? 'rtl' : 'ltr',
    },
    row: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
    },
  }));
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {currentLanguage === 'ar' ? 'مرحبا' : 'Bonjour'}
      </Text>
    </View>
  );
}
```

### Language Switching

```typescript
import { LanguageSwitcher } from '../components/language';

function SettingsScreen() {
  return (
    <View>
      <LanguageSwitcher
        currentLanguage="ar"
        onLanguageChange={(lang) => console.log('Language changed to:', lang)}
        showFlags={true}
      />
    </View>
  );
}
```

## Gamification System

Achievement tracking, progress visualization, and celebration animations.

### Achievement Badges

```typescript
import { AchievementBadge } from '../components/gamification';

function AchievementsScreen() {
  const achievements = [
    {
      id: '1',
      title: 'Legal Expert',
      titleAr: 'خبير قانوني',
      description: 'Completed 50 legal queries',
      descriptionAr: 'أكمل 50 استعلام قانوني',
      isUnlocked: true,
      unlockedAt: new Date(),
      icon: 'gavel',
      rarity: 'gold' as const,
    },
    // ... more achievements
  ];
  
  return (
    <ScrollView>
      {achievements.map((achievement) => (
        <AchievementBadge
          key={achievement.id}
          achievement={achievement}
          onPress={() => console.log('Achievement pressed')}
        />
      ))}
    </ScrollView>
  );
}
```

### Progress Tracking

```typescript
import { ProgressTracker } from '../components/gamification';

function ProfileScreen() {
  return (
    <View>
      <ProgressTracker
        current={75}
        total={100}
        label="Profile Completion"
        labelAr="اكتمال الملف الشخصي"
        showPercentage={true}
        color="#E31E24"
        backgroundColor="#F0F0F0"
        height={8}
        animated={true}
      />
      
      <ProgressTracker
        current={450}
        total={1000}
        label="Total Points"
        labelAr="إجمالي النقاط"
        showNumbers={true}
        icon="star"
      />
    </View>
  );
}
```

### Achievement Celebrations

```typescript
import { AchievementUnlockAnimation } from '../components/gamification';

function GameScreen() {
  const [showCelebration, setShowCelebration] = useState(false);
  
  const handleAchievementUnlock = () => {
    setShowCelebration(true);
  };
  
  return (
    <View>
      {/* Your game content */}
      
      <AchievementUnlockAnimation
        visible={showCelebration}
        achievement={{
          title: 'First Query!',
          titleAr: 'أول استعلام!',
          description: 'You completed your first legal query',
          descriptionAr: 'لقد أكملت أول استعلام قانوني',
          icon: 'trophy',
          rarity: 'bronze',
        }}
        onAnimationComplete={() => setShowCelebration(false)}
      />
    </View>
  );
}
```

## Enhanced Profile Screen

The enhanced profile screen includes smooth animations, theme integration, and comprehensive user information display.

### Key Features

- **Animated Header**: Smooth transitions and gradient backgrounds
- **Theme Integration**: Adapts to light/dark mode seamlessly
- **Mascot Integration**: Interactive mascot display
- **Progress Indicators**: Visual progress tracking
- **Cultural Elements**: Tunisian-inspired design elements

### Usage Example

```typescript
import { ProfileScreen } from '../screens/ProfileScreen';

// The ProfileScreen is automatically integrated with:
// - ThemeContext for dynamic theming
// - MascotContext for mascot interactions
// - RTLContext for language support

function App() {
  return (
    <NavigationContainer>
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          headerShown: false, // ProfileScreen has custom header
        }}
      />
    </NavigationContainer>
  );
}
```

## Component Usage Examples

### Complete Integration Example

```typescript
import React from 'react';
import { View, ScrollView } from 'react-native';
import { useTheme, createThemedStyles } from '../contexts/ThemeContext';
import { useMascot } from '../contexts/MascotContext';
import { useRTL } from '../contexts/RTLContext';
import { 
  TunisianMascot3D, 
  AchievementBadge, 
  ProgressTracker,
  LanguageSwitcher 
} from '../components';

function EnhancedScreen() {
  const { theme } = useTheme();
  const { mascotState, triggerInteraction } = useMascot();
  const { isRTL, currentLanguage, setLanguage } = useRTL();
  
  const styles = createThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 16,
    },
    section: {
      marginBottom: 24,
      padding: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
    },
  }));
  
  return (
    <ScrollView style={styles.container}>
      {/* Language Switcher */}
      <View style={styles.section}>
        <LanguageSwitcher
          currentLanguage={currentLanguage}
          onLanguageChange={setLanguage}
        />
      </View>
      
      {/* Mascot Section */}
      <View style={styles.section}>
        <TunisianMascot3D
          sector={mascotState.currentSector}
          emotion={mascotState.currentEmotion}
          onInteraction={triggerInteraction}
          size={200}
        />
      </View>
      
      {/* Progress Section */}
      <View style={styles.section}>
        <ProgressTracker
          current={75}
          total={100}
          label={isRTL ? "اكتمال الملف الشخصي" : "Profile Completion"}
          animated={true}
        />
      </View>
      
      {/* Achievements Section */}
      <View style={styles.section}>
        <AchievementBadge
          achievement={{
            title: isRTL ? "خبير قانوني" : "Legal Expert",
            description: isRTL ? "أكمل 50 استعلام قانوني" : "Completed 50 legal queries",
            isUnlocked: true,
            icon: 'gavel',
            rarity: 'gold',
          }}
        />
      </View>
    </ScrollView>
  );
}

export default EnhancedScreen;
```

## Best Practices

### Theme Usage
- Always use `createThemedStyles` for dynamic theming
- Prefer theme colors over hardcoded values
- Test both light and dark modes
- Use semantic color names (primary, success, etc.)

### Mascot Integration
- Provide fallback for devices without Skia support
- Use appropriate sectors for different app sections
- Implement smooth emotion transitions
- Handle interaction feedback properly

### RTL Support
- Always use RTL-aware layout helpers
- Test with Arabic content
- Ensure proper text alignment
- Handle icon and image mirroring

### Performance
- Use `React.memo` for expensive components
- Implement proper cleanup in useEffect
- Optimize animations for 60fps
- Use lazy loading for heavy components

### Accessibility
- Add proper accessibility labels
- Support screen readers
- Ensure sufficient color contrast
- Implement keyboard navigation

## Troubleshooting

### Common Issues

1. **Theme not updating**: Ensure component is wrapped in ThemeProvider
2. **Mascot not rendering**: Check if Skia is properly installed
3. **RTL layout issues**: Use RTL-aware style helpers
4. **Performance issues**: Implement proper memoization
5. **Storage errors**: Handle AsyncStorage failures gracefully

### Debug Tools

```typescript
// Enable debug mode in development
import { __DEV__ } from 'react-native';

if (__DEV__) {
  // Theme debugging
  console.log('Current theme:', theme);
  
  // Mascot debugging
  console.log('Mascot state:', mascotState);
  
  // RTL debugging
  console.log('RTL mode:', isRTL, 'Language:', currentLanguage);
}
```

## Migration Guide

If upgrading from a previous version:

1. **Update Context Providers**: Wrap your app with new providers
2. **Update Component Imports**: Use new component paths
3. **Update Styles**: Migrate to themed styles
4. **Test Thoroughly**: Verify all features work correctly
5. **Update Dependencies**: Ensure all packages are compatible

For more detailed information, see the individual component documentation in the `src/components/` directories.