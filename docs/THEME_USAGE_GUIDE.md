# Theme Usage Guide

This comprehensive guide explains how to use the enhanced theme system implemented across the Tunisian Legal App.

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Theme Integration](#theme-integration)
4. [Available Colors](#available-colors)
5. [Best Practices](#best-practices)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

## Overview

The theme system provides:
- ✨ **Dynamic Light/Dark Mode** - Seamless switching with persistence
- 🎨 **Cultural Color Schemes** - Tunisian-inspired design elements
- 🔄 **Automatic Persistence** - Remembers user preferences
- 📱 **System Integration** - Follows device theme preferences
- ♿ **Accessibility Compliant** - WCAG AA contrast ratios

### Updated Screens

All screens now support comprehensive theming:

- ✅ **ProfileScreen** - Enhanced with animations and theme integration
- ✅ **PersonalInfoScreen** - Personal information with themed forms
- ✅ **PreferencesScreen** - Settings with theme controls
- ✅ **AchievementsScreen** - Gamification with themed badges
- ✅ **MascotDemoScreen** - Interactive mascots with theme adaptation
- ✅ **DashboardScreen** - Main dashboard with theme-aware components
- ✅ **ChatScreen** - Chat interface with themed messages
- ✅ **SearchScreen** - Search interface with themed results
- ✅ **NotificationsScreen** - Notifications with themed cards
- ✅ **UpdatesScreen** - Legal updates with themed content

## Quick Start

### 1. Basic Theme Usage

```typescript
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme, createThemedStyles } from '../contexts/ThemeContext';

function MyComponent() {
  const { theme, isDark, toggleTheme } = useTheme();
  
  const styles = createThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 16,
    },
    text: {
      color: theme.colors.text,
      fontSize: 16,
      marginBottom: 12,
    },
    button: {
      backgroundColor: theme.colors.primary,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    buttonText: {
      color: 'white',
      fontWeight: 'bold',
    },
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Current theme: {isDark ? 'Dark' : 'Light'}
      </Text>
      <TouchableOpacity style={styles.button} onPress={toggleTheme}>
        <Text style={styles.buttonText}>
          Switch to {isDark ? 'Light' : 'Dark'} Mode
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default MyComponent;
```

### 2. App Setup

Ensure your app is wrapped with the ThemeProvider:

```typescript
import React from 'react';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}
```

## Theme Integration

### Context API Usage

```typescript
import { useTheme } from '../contexts/ThemeContext';

function MyScreen() {
  const { 
    theme,           // Current theme object
    isDark,          // Boolean: is dark mode active
    toggleTheme,     // Function: toggle between light/dark
    setTheme,        // Function: set specific theme (true/false)
  } = useTheme();
  
  // Your component logic here
}
```

### Creating Themed Styles

The `createThemedStyles` function ensures your styles update when the theme changes:

```typescript
import { createThemedStyles } from '../contexts/ThemeContext';

const styles = createThemedStyles((theme) => ({
  // Styles that depend on theme
  container: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
  },
  text: {
    color: theme.colors.text,
  },
  // Static styles (don't depend on theme)
  staticStyle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}));
```

### Advanced Theme Usage

```typescript
import React, { useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';

function AdvancedThemedComponent() {
  const { theme, isDark } = useTheme();
  
  // Memoize complex calculations
  const gradientColors = useMemo(() => [
    theme.colors.gradientStart,
    theme.colors.gradientEnd,
  ], [theme]);
  
  // Conditional styling based on theme
  const shadowStyle = useMemo(() => ({
    shadowColor: isDark ? '#000' : '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 4,
    elevation: 3,
  }), [isDark]);
  
  return (
    <LinearGradient
      colors={gradientColors}
      style={[styles.container, shadowStyle]}
    >
      {/* Your content */}
    </LinearGradient>
  );
}
```

## Available Colors

### Base Colors
```typescript
theme.colors.background     // Main app background
theme.colors.surface        // Card and surface backgrounds  
theme.colors.card          // Secondary card backgrounds
```

### Text Colors
```typescript
theme.colors.text          // Primary text color
theme.colors.textSecondary // Secondary text (subtitles)
theme.colors.textTertiary  // Tertiary text (hints, placeholders)
```

### Brand Colors (Tunisian-Inspired)
```typescript
theme.colors.primary       // Primary brand color (Tunisian red)
theme.colors.primaryLight  // Light variant for highlights
theme.colors.primaryDark   // Dark variant for pressed states
theme.colors.accent        // Accent color (Tunisian gold)
theme.colors.accentLight   // Light accent for backgrounds
```

### Status Colors
```typescript
theme.colors.success       // Success states (#2ED573)
theme.colors.warning       // Warning states (#FFA502)
theme.colors.error         // Error states (#FF3838)
theme.colors.info          // Information states (#3742FA)
```

### UI Elements
```typescript
theme.colors.border        // Border colors for inputs, cards
theme.colors.divider       // Divider lines and separators
theme.colors.ripple        // Touch feedback ripple effect
theme.colors.overlay       // Modal and popup overlays
```

### Gradients
```typescript
theme.colors.gradientStart // Gradient start color
theme.colors.gradientEnd   // Gradient end color
```

### Color Usage Examples

```typescript
const styles = createThemedStyles((theme) => ({
  // Background variations
  primaryBackground: { backgroundColor: theme.colors.background },
  surfaceBackground: { backgroundColor: theme.colors.surface },
  cardBackground: { backgroundColor: theme.colors.card },
  
  // Text variations
  primaryText: { color: theme.colors.text },
  secondaryText: { color: theme.colors.textSecondary },
  tertiaryText: { color: theme.colors.textTertiary },
  
  // Interactive elements
  primaryButton: { backgroundColor: theme.colors.primary },
  accentButton: { backgroundColor: theme.colors.accent },
  successButton: { backgroundColor: theme.colors.success },
  
  // Borders and dividers
  borderedContainer: { 
    borderWidth: 1, 
    borderColor: theme.colors.border 
  },
  dividerLine: { 
    height: 1, 
    backgroundColor: theme.colors.divider 
  },
}));
```

## Best Practices

### 1. Always Use Theme Colors

❌ **Avoid hardcoded colors:**
```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',  // Don't do this
    color: '#000000',           // Don't do this
  },
});
```

✅ **Use theme colors:**
```typescript
const styles = createThemedStyles((theme) => ({
  container: {
    backgroundColor: theme.colors.surface,  // ✅ Good
    color: theme.colors.text,              // ✅ Good
  },
}));
```

### 2. Handle System UI Elements

```typescript
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../contexts/ThemeContext';

function MyScreen() {
  const { theme, isDark } = useTheme();
  
  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <StatusBar 
        style={isDark ? "light" : "dark"} 
        backgroundColor={theme.colors.background}
      />
      {/* Your content */}
    </View>
  );
}
```

### 3. Theme-Aware Refresh Controls

```typescript
import { RefreshControl } from 'react-native';

<ScrollView
  refreshControl={
    <RefreshControl
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
      colors={[theme.colors.primary, theme.colors.accent]}
      tintColor={theme.colors.primary}
      progressBackgroundColor={theme.colors.surface}
    />
  }
>
  {/* Content */}
</ScrollView>
```

### 4. Conditional Theme-Based Logic

```typescript
function ThemedIcon({ name }: { name: string }) {
  const { theme, isDark } = useTheme();
  
  // Choose icon variant based on theme
  const iconName = isDark ? `${name}-outline` : `${name}-solid`;
  const iconColor = isDark ? theme.colors.accent : theme.colors.primary;
  
  return (
    <Icon 
      name={iconName} 
      color={iconColor} 
      size={24} 
    />
  );
}
```

### 5. Performance Optimization

```typescript
import React, { memo, useMemo } from 'react';

const ThemedComponent = memo(function ThemedComponent() {
  const { theme } = useTheme();
  
  // Memoize expensive calculations
  const complexStyles = useMemo(() => ({
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  }), [theme.colors.text]);
  
  return (
    <View style={[styles.container, complexStyles]}>
      {/* Content */}
    </View>
  );
});
```

### 6. Accessibility Considerations

```typescript
const styles = createThemedStyles((theme) => ({
  button: {
    backgroundColor: theme.colors.primary,
    // Ensure sufficient contrast
    minHeight: 44, // Minimum touch target size
  },
  text: {
    color: theme.colors.text,
    // Text should have 4.5:1 contrast ratio minimum
  },
}));
```

## Testing

### Automated Theme Tests

Run the comprehensive theme test suite:

```bash
# Run all theme tests
npm run test:enhanced

# Run specific theme tests
npm run test:theme-consistency
```

### Manual Testing Checklist

#### Theme Switching
- [ ] Toggle between light and dark modes works smoothly
- [ ] All screens adapt properly to theme changes
- [ ] Theme preference persists after app restart
- [ ] System theme detection works (if implemented)

#### Visual Consistency
- [ ] Text remains readable in both themes
- [ ] Interactive elements maintain proper contrast
- [ ] Brand colors are consistent across screens
- [ ] Status colors (success, error, warning) are appropriate
- [ ] Gradients and shadows work in both themes

#### Performance
- [ ] Theme switching is smooth and fast (< 300ms)
- [ ] No visual glitches during transitions
- [ ] App remains responsive during theme changes
- [ ] Memory usage doesn't increase significantly

#### Accessibility
- [ ] Text contrast meets WCAG AA standards (4.5:1)
- [ ] Interactive elements have sufficient contrast (3:1)
- [ ] Focus indicators are visible in both themes
- [ ] Screen readers work properly with themed content

### Debug Theme Issues

```typescript
// Add this to debug theme state
import { useTheme } from '../contexts/ThemeContext';

function DebugTheme() {
  const { theme, isDark } = useTheme();
  
  if (__DEV__) {
    console.group('Theme Debug Info');
    console.log('Is Dark Mode:', isDark);
    console.log('Theme Colors:', theme.colors);
    console.log('Background:', theme.colors.background);
    console.log('Text:', theme.colors.text);
    console.log('Primary:', theme.colors.primary);
    console.groupEnd();
  }
  
  return null;
}
```

## Troubleshooting

### Common Issues

#### 1. Colors Not Updating
**Problem:** Component colors don't change when theme is toggled.

**Solutions:**
- Ensure you're using `createThemedStyles` instead of `StyleSheet.create`
- Check that your component is wrapped in `ThemeProvider`
- Verify you're using theme colors, not hardcoded values

```typescript
// ❌ Wrong
const styles = StyleSheet.create({
  text: { color: '#000000' }
});

// ✅ Correct
const styles = createThemedStyles((theme) => ({
  text: { color: theme.colors.text }
}));
```

#### 2. Theme Not Persisting
**Problem:** Theme resets to default after app restart.

**Solutions:**
- Verify `@react-native-async-storage/async-storage` is installed
- Check AsyncStorage permissions
- Ensure ThemeProvider is at the root level

#### 3. Performance Issues
**Problem:** App becomes slow when switching themes.

**Solutions:**
- Use `React.memo` for expensive components
- Memoize complex style calculations
- Avoid creating styles in render functions

```typescript
// ❌ Avoid this
function MyComponent() {
  const { theme } = useTheme();
  
  return (
    <View style={{
      backgroundColor: theme.colors.background, // Created on every render
    }}>
      {/* Content */}
    </View>
  );
}

// ✅ Better approach
function MyComponent() {
  const styles = createThemedStyles((theme) => ({
    container: {
      backgroundColor: theme.colors.background, // Memoized
    },
  }));
  
  return (
    <View style={styles.container}>
      {/* Content */}
    </View>
  );
}
```

#### 4. Inconsistent Colors
**Problem:** Some components show different colors than expected.

**Solutions:**
- Check for hardcoded colors in your codebase
- Ensure all components use the same theme context
- Verify theme color definitions are correct

#### 5. Status Bar Issues
**Problem:** Status bar doesn't match theme.

**Solution:**
```typescript
import { StatusBar } from 'expo-status-bar';

function App() {
  const { isDark, theme } = useTheme();
  
  return (
    <>
      <StatusBar 
        style={isDark ? "light" : "dark"}
        backgroundColor={theme.colors.background}
      />
      {/* Your app content */}
    </>
  );
}
```

### Debug Commands

```bash
# Check theme implementation
npm run test:theme-consistency

# Run comprehensive tests
npm run test:comprehensive

# Check for hardcoded colors
grep -r "#[0-9A-Fa-f]\{6\}" src/ --include="*.tsx" --include="*.ts"
```

### Getting Help

If you encounter issues not covered here:

1. Check the console for theme-related errors
2. Verify your theme context setup
3. Test with a minimal component first
4. Check the theme test results
5. Review the implementation examples in this guide

## Migration Guide

### Adding Theme Support to Existing Components

1. **Import theme context:**
   ```typescript
   import { useTheme, createThemedStyles } from '../contexts/ThemeContext';
   ```

2. **Replace StyleSheet.create:**
   ```typescript
   // Before
   const styles = StyleSheet.create({...});
   
   // After
   const styles = createThemedStyles((theme) => ({...}));
   ```

3. **Replace hardcoded colors:**
   ```typescript
   // Before
   backgroundColor: '#FFFFFF'
   
   // After
   backgroundColor: theme.colors.surface
   ```

4. **Add theme context usage:**
   ```typescript
   const { theme, isDark } = useTheme();
   ```

5. **Test in both themes:**
   - Verify visual appearance
   - Check accessibility
   - Test interactions

This comprehensive theme system ensures a consistent, accessible, and culturally appropriate user experience across the entire Tunisian Legal App.