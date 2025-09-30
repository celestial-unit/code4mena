# Theme Customization Guide

This guide explains how to customize and extend the theming system in the Tunisian Legal App.

## Table of Contents

1. [Theme Structure](#theme-structure)
2. [Creating Custom Themes](#creating-custom-themes)
3. [Cultural Color Schemes](#cultural-color-schemes)
4. [Dynamic Theme Switching](#dynamic-theme-switching)
5. [Component Theming](#component-theming)
6. [Advanced Customization](#advanced-customization)

## Theme Structure

The theme system is built around a comprehensive color palette that adapts to both light and dark modes while maintaining cultural authenticity.

### Base Theme Interface

```typescript
interface Theme {
  isDark: boolean;
  colors: ThemeColors;
}

interface ThemeColors {
  // Base colors
  background: string;      // Main app background
  surface: string;         // Card and surface backgrounds
  card: string;           // Specific card backgrounds
  
  // Text hierarchy
  text: string;           // Primary text color
  textSecondary: string;  // Secondary text (subtitles, descriptions)
  textTertiary: string;   // Tertiary text (hints, placeholders)
  
  // Brand colors (Tunisian-inspired)
  primary: string;        // Primary brand color (Tunisian red)
  primaryLight: string;   // Lighter variant for highlights
  primaryDark: string;    // Darker variant for pressed states
  accent: string;         // Accent color (Tunisian gold)
  accentLight: string;    // Light accent for backgrounds
  
  // Status colors
  success: string;        // Success states and confirmations
  warning: string;        // Warning states and cautions
  error: string;          // Error states and alerts
  info: string;           // Information and tips
  
  // UI elements
  border: string;         // Border colors for inputs, cards
  divider: string;        // Divider lines and separators
  ripple: string;         // Touch feedback ripple effect
  overlay: string;        // Modal and popup overlays
  
  // Gradients (for enhanced visual appeal)
  gradientStart: string;  // Gradient start color
  gradientEnd: string;    // Gradient end color
}
```

## Creating Custom Themes

### Light Theme (Default)

```typescript
const lightTheme: Theme = {
  isDark: false,
  colors: {
    // Base colors - Clean and bright
    background: '#F8F9FA',    // Light gray background
    surface: '#FFFFFF',       // Pure white surfaces
    card: '#FFFFFF',          // White cards
    
    // Text colors - High contrast for readability
    text: '#1A1A1A',          // Near black for primary text
    textSecondary: '#666666', // Medium gray for secondary
    textTertiary: '#999999',  // Light gray for tertiary
    
    // Tunisian brand colors
    primary: '#E31E24',       // Tunisian flag red
    primaryLight: '#FF4757',  // Lighter red for highlights
    primaryDark: '#B71C1C',   // Darker red for pressed states
    accent: '#D4AF37',        // Tunisian gold
    accentLight: '#FFC048',   // Light gold for backgrounds
    
    // Status colors - Universally recognized
    success: '#2ED573',       // Green for success
    warning: '#FFA502',       // Orange for warnings
    error: '#FF3838',         // Red for errors
    info: '#3742FA',          // Blue for information
    
    // UI elements
    border: '#E0E0E0',        // Light gray borders
    divider: '#F0F0F0',       // Very light gray dividers
    ripple: 'rgba(0, 0, 0, 0.1)', // Subtle black ripple
    overlay: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
    
    // Gradients
    gradientStart: '#E31E24',  // Red to gold gradient
    gradientEnd: '#D4AF37',
  },
};
```

### Dark Theme

```typescript
const darkTheme: Theme = {
  isDark: true,
  colors: {
    // Base colors - Dark and comfortable
    background: '#0F0F0F',    // Very dark background
    surface: '#1A1A1A',       // Dark gray surfaces
    card: '#252525',          // Lighter dark for cards
    
    // Text colors - Light for dark backgrounds
    text: '#FFFFFF',          // White primary text
    textSecondary: '#CCCCCC', // Light gray secondary
    textTertiary: '#999999',  // Medium gray tertiary
    
    // Tunisian brand colors (adjusted for dark mode)
    primary: '#FF4757',       // Brighter red for visibility
    primaryLight: '#FF6B7A',  // Even brighter for highlights
    primaryDark: '#E31E24',   // Original red for pressed
    accent: '#FFC048',        // Brighter gold
    accentLight: '#FFD700',   // Golden yellow for backgrounds
    
    // Status colors (adjusted for dark mode)
    success: '#2ED573',       // Same green (works well)
    warning: '#FFA502',       // Same orange (works well)
    error: '#FF3838',         // Same red (works well)
    info: '#3742FA',          // Same blue (works well)
    
    // UI elements
    border: '#333333',        // Dark gray borders
    divider: '#2A2A2A',       // Darker dividers
    ripple: 'rgba(255, 255, 255, 0.15)', // Light ripple
    overlay: 'rgba(0, 0, 0, 0.8)', // Darker overlay
    
    // Gradients
    gradientStart: '#FF4757',  // Bright red to gold
    gradientEnd: '#FFC048',
  },
};
```

## Cultural Color Schemes

### Tunisian Heritage Colors

The color scheme draws inspiration from Tunisian culture and heritage:

```typescript
const tunisianColors = {
  // Flag colors
  flagRed: '#E31E24',      // Official Tunisian flag red
  flagWhite: '#FFFFFF',    // Flag white
  
  // Traditional colors
  carthageBlue: '#1E3A8A',  // Ancient Carthage blue
  mediterraneanBlue: '#0EA5E9', // Mediterranean sea
  desertGold: '#D4AF37',    // Sahara desert gold
  oliveGreen: '#65A30D',    // Olive tree green
  
  // Architectural colors
  whitewash: '#F8FAFC',     // Traditional white buildings
  terracotta: '#DC2626',    // Clay roof tiles
  cobalt: '#1D4ED8',        // Traditional ceramics
  
  // Cultural significance
  crescentGold: '#FCD34D',  // Islamic crescent
  starSilver: '#E5E7EB',    // Star symbol
  palmGreen: '#16A34A',     // Date palm trees
};
```

### Seasonal Themes

```typescript
// Summer theme (bright and warm)
const summerTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: '#FF6B35',      // Warm orange
    accent: '#FFD23F',       // Sunny yellow
    background: '#FFF8F0',   // Warm white
  },
};

// Winter theme (cool and calm)
const winterTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: '#2563EB',      // Cool blue
    accent: '#7C3AED',       // Purple accent
    background: '#F1F5F9',   // Cool white
  },
};
```

## Dynamic Theme Switching

### Theme Context Implementation

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
  setCustomTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [customTheme, setCustomTheme] = useState<Theme | null>(null);
  
  // Load saved theme preference
  useEffect(() => {
    loadThemePreference();
    
    // Listen for system theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (!customTheme) {
        setIsDark(colorScheme === 'dark');
      }
    });
    
    return () => subscription?.remove();
  }, []);
  
  const loadThemePreference = async () => {
    try {
      const saved = await AsyncStorage.getItem('@theme_preference');
      if (saved !== null) {
        setIsDark(JSON.parse(saved));
      } else {
        // Use system preference
        const systemTheme = Appearance.getColorScheme();
        setIsDark(systemTheme === 'dark');
      }
    } catch (error) {
      console.warn('Failed to load theme preference:', error);
    }
  };
  
  const saveThemePreference = async (isDarkMode: boolean) => {
    try {
      await AsyncStorage.setItem('@theme_preference', JSON.stringify(isDarkMode));
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  };
  
  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    saveThemePreference(newIsDark);
  };
  
  const setTheme = (isDarkMode: boolean) => {
    setIsDark(isDarkMode);
    saveThemePreference(isDarkMode);
  };
  
  const theme = customTheme || (isDark ? darkTheme : lightTheme);
  
  return (
    <ThemeContext.Provider value={{
      theme,
      isDark,
      toggleTheme,
      setTheme,
      setCustomTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

### Animated Theme Transitions

```typescript
import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

export function useThemeTransition() {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const { isDark } = useTheme();
  
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isDark ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isDark]);
  
  const interpolateColor = (lightColor: string, darkColor: string) => {
    return animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [lightColor, darkColor],
    });
  };
  
  return { animatedValue, interpolateColor };
}
```

## Component Theming

### Themed Styles Helper

```typescript
import { StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export function createThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  styleFactory: (theme: Theme) => T
) {
  const { theme } = useTheme();
  return StyleSheet.create(styleFactory(theme));
}

// Usage example
function MyComponent() {
  const styles = createThemedStyles((theme) => ({
    container: {
      backgroundColor: theme.colors.background,
      padding: 16,
    },
    text: {
      color: theme.colors.text,
      fontSize: 16,
    },
    button: {
      backgroundColor: theme.colors.primary,
      padding: 12,
      borderRadius: 8,
    },
  }));
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Themed content</Text>
    </View>
  );
}
```

### Component-Specific Themes

```typescript
// Button theme variants
const buttonThemes = {
  primary: (theme: Theme) => ({
    backgroundColor: theme.colors.primary,
    color: 'white',
  }),
  secondary: (theme: Theme) => ({
    backgroundColor: 'transparent',
    color: theme.colors.primary,
    borderColor: theme.colors.primary,
    borderWidth: 1,
  }),
  success: (theme: Theme) => ({
    backgroundColor: theme.colors.success,
    color: 'white',
  }),
  warning: (theme: Theme) => ({
    backgroundColor: theme.colors.warning,
    color: 'white',
  }),
};

// Card theme variants
const cardThemes = {
  default: (theme: Theme) => ({
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    shadowColor: theme.isDark ? '#000' : '#000',
  }),
  elevated: (theme: Theme) => ({
    backgroundColor: theme.colors.card,
    shadowColor: theme.isDark ? '#000' : '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme.isDark ? 0.3 : 0.1,
    shadowRadius: 8,
    elevation: 4,
  }),
};
```

## Advanced Customization

### Custom Theme Builder

```typescript
interface ThemeBuilder {
  setBaseColors(colors: Partial<ThemeColors>): ThemeBuilder;
  setBrandColors(primary: string, accent: string): ThemeBuilder;
  setStatusColors(colors: Partial<Pick<ThemeColors, 'success' | 'warning' | 'error' | 'info'>>): ThemeBuilder;
  build(): Theme;
}

class CustomThemeBuilder implements ThemeBuilder {
  private theme: Theme;
  
  constructor(baseTheme: Theme = lightTheme) {
    this.theme = { ...baseTheme, colors: { ...baseTheme.colors } };
  }
  
  setBaseColors(colors: Partial<ThemeColors>): ThemeBuilder {
    this.theme.colors = { ...this.theme.colors, ...colors };
    return this;
  }
  
  setBrandColors(primary: string, accent: string): ThemeBuilder {
    this.theme.colors.primary = primary;
    this.theme.colors.accent = accent;
    // Auto-generate variants
    this.theme.colors.primaryLight = this.lighten(primary, 0.2);
    this.theme.colors.primaryDark = this.darken(primary, 0.2);
    this.theme.colors.accentLight = this.lighten(accent, 0.3);
    return this;
  }
  
  setStatusColors(colors: Partial<Pick<ThemeColors, 'success' | 'warning' | 'error' | 'info'>>): ThemeBuilder {
    Object.assign(this.theme.colors, colors);
    return this;
  }
  
  build(): Theme {
    return this.theme;
  }
  
  private lighten(color: string, amount: number): string {
    // Color manipulation logic
    return color; // Simplified
  }
  
  private darken(color: string, amount: number): string {
    // Color manipulation logic
    return color; // Simplified
  }
}

// Usage
const customTheme = new CustomThemeBuilder()
  .setBrandColors('#FF5722', '#FFC107')
  .setStatusColors({
    success: '#4CAF50',
    error: '#F44336',
  })
  .build();
```

### Theme Validation

```typescript
function validateTheme(theme: Theme): boolean {
  const requiredColors = [
    'background', 'surface', 'card', 'text', 'textSecondary', 'textTertiary',
    'primary', 'primaryLight', 'primaryDark', 'accent', 'accentLight',
    'success', 'warning', 'error', 'info', 'border', 'divider',
    'ripple', 'overlay', 'gradientStart', 'gradientEnd'
  ];
  
  for (const color of requiredColors) {
    if (!theme.colors[color as keyof ThemeColors]) {
      console.warn(`Missing required color: ${color}`);
      return false;
    }
  }
  
  return true;
}
```

### Accessibility Considerations

```typescript
function checkColorContrast(foreground: string, background: string): number {
  // WCAG contrast ratio calculation
  // Returns ratio (should be >= 4.5 for normal text, >= 3.0 for large text)
  return 4.5; // Simplified
}

function validateAccessibility(theme: Theme): boolean {
  const checks = [
    { fg: theme.colors.text, bg: theme.colors.background, name: 'Primary text' },
    { fg: theme.colors.textSecondary, bg: theme.colors.background, name: 'Secondary text' },
    { fg: 'white', bg: theme.colors.primary, name: 'Primary button' },
    { fg: 'white', bg: theme.colors.success, name: 'Success button' },
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    const ratio = checkColorContrast(check.fg, check.bg);
    if (ratio < 4.5) {
      console.warn(`Low contrast for ${check.name}: ${ratio.toFixed(2)}`);
      allPassed = false;
    }
  }
  
  return allPassed;
}
```

## Best Practices

### Do's
- ✅ Use semantic color names (primary, success, etc.)
- ✅ Test themes in both light and dark modes
- ✅ Ensure sufficient color contrast for accessibility
- ✅ Use the theme context consistently throughout the app
- ✅ Provide fallback colors for edge cases
- ✅ Animate theme transitions for smooth UX

### Don'ts
- ❌ Hardcode colors in components
- ❌ Ignore accessibility guidelines
- ❌ Create too many theme variants (confuses users)
- ❌ Forget to test on different devices
- ❌ Override theme colors without good reason
- ❌ Use colors that don't align with brand identity

### Performance Tips
- Use `React.memo` for themed components
- Cache styled components when possible
- Avoid creating styles in render functions
- Use native driver for theme animations
- Minimize theme context re-renders

## Troubleshooting

### Common Issues

1. **Theme not updating**: Check if component is wrapped in ThemeProvider
2. **Colors not applying**: Verify theme context is accessible
3. **Performance issues**: Avoid creating styles in render
4. **Accessibility warnings**: Check color contrast ratios
5. **Storage errors**: Handle AsyncStorage failures gracefully

### Debug Tools

```typescript
// Theme debugging utility
export function debugTheme() {
  const { theme, isDark } = useTheme();
  
  if (__DEV__) {
    console.group('Theme Debug Info');
    console.log('Mode:', isDark ? 'Dark' : 'Light');
    console.log('Colors:', theme.colors);
    console.log('Accessibility check:', validateAccessibility(theme));
    console.groupEnd();
  }
}
```

This comprehensive theming system provides flexibility while maintaining consistency and cultural authenticity throughout the Tunisian Legal App.