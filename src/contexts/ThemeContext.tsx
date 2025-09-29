import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThemeColors {
  // Background colors
  background: string;
  surface: string;
  card: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Accent colors
  accent: string;
  accentLight: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Border and divider colors
  border: string;
  divider: string;
  
  // Interactive colors
  ripple: string;
  overlay: string;
  
  // Gradient colors
  gradientStart: string;
  gradientEnd: string;
}

export interface Theme {
  colors: ThemeColors;
  isDark: boolean;
}

const lightTheme: Theme = {
  isDark: false,
  colors: {
    background: '#F8F9FA',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    
    text: '#1A1A1A',
    textSecondary: '#666666',
    textTertiary: '#999999',
    
    primary: '#E31E24',
    primaryLight: '#FF4757',
    primaryDark: '#B71C1C',
    
    accent: '#D4AF37',
    accentLight: '#FFC048',
    
    success: '#2ED573',
    warning: '#FFA502',
    error: '#FF3838',
    info: '#3742FA',
    
    border: '#E0E0E0',
    divider: '#F0F0F0',
    
    ripple: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    
    gradientStart: '#E31E24',
    gradientEnd: '#D4AF37',
  },
};

const darkTheme: Theme = {
  isDark: true,
  colors: {
    background: '#0F0F0F',
    surface: '#1A1A1A',
    card: '#252525',
    
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    textTertiary: '#999999',
    
    primary: '#FF4757',
    primaryLight: '#FF6B7A',
    primaryDark: '#E31E24',
    
    accent: '#FFC048',
    accentLight: '#FFD700',
    
    success: '#2ED573',
    warning: '#FFA502',
    error: '#FF3838',
    info: '#3742FA',
    
    border: '#333333',
    divider: '#2A2A2A',
    
    ripple: 'rgba(255, 255, 255, 0.15)',
    overlay: 'rgba(0, 0, 0, 0.8)',
    
    gradientStart: '#FF4757',
    gradientEnd: '#FFC048',
  },
};

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

const THEME_STORAGE_KEY = '@theme_preference';

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load theme preference from storage on app start
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Listen to system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      // Only auto-switch if user hasn't manually set a preference
      // For now, we'll keep the user's manual preference
    });

    return () => subscription?.remove();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme !== null) {
        setIsDark(JSON.parse(savedTheme));
      } else {
        // If no preference saved, use system theme
        const systemColorScheme = Appearance.getColorScheme();
        setIsDark(systemColorScheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
      // Fallback to system theme
      const systemColorScheme = Appearance.getColorScheme();
      setIsDark(systemColorScheme === 'dark');
    } finally {
      setIsLoading(false);
    }
  };

  const saveThemePreference = async (darkMode: boolean) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(darkMode));
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    setIsDark(prev => {
      const newValue = !prev;
      saveThemePreference(newValue);
      return newValue;
    });
  };

  const setTheme = (dark: boolean) => {
    setIsDark(dark);
    saveThemePreference(dark);
  };

  // Don't render children until theme is loaded
  if (isLoading) {
    // Provide a simple loading screen with default theme
    const defaultTheme = lightTheme;
    return (
      <ThemeContext.Provider value={{
        theme: defaultTheme,
        isDark: false,
        toggleTheme: () => {},
        setTheme: () => {},
      }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  const theme = isDark ? darkTheme : lightTheme;

  const value: ThemeContextType = {
    theme,
    isDark,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Helper function to create themed styles
export const createThemedStyles = <T extends Record<string, any>>(
  styleCreator: (theme: Theme) => T
) => {
  return (theme: Theme): T => styleCreator(theme);
};