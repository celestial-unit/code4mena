import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import the real navigation system
import { AppNavigator } from './src/navigation/AppNavigator';

// Import context providers
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { MascotProvider } from './src/contexts/MascotContext';
import { RTLProvider } from './src/contexts/RTLContext';

// Import all services
import apiService from './src/services/api';
import storageService from './src/services/storage';
import authService from './src/services/authService';
import { chatService } from './src/services/chatService';
import { searchService } from './src/services/searchService';
import { legalService } from './src/services/legalService';

// App content component that uses theme context
function AppContent() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const { theme, isDark } = useTheme();

  useEffect(() => {
    initializeBasicServices();
  }, []);

  const initializeBasicServices = async () => {
    try {
      console.log('[App] Initializing services...');

      // Test storage service
      await storageService.set('app_initialized', 'true');
      console.log('[App] Storage service working');

      // Initialize auth service (loads stored tokens)
      await authService.initialize();
      console.log('[App] Auth service initialized');

      // Set a demo token for API calls if no token exists
      const existingToken = await authService.getAuthToken();
      if (!existingToken) {
        console.log('[App] No existing token, setting demo token');
        apiService.setAuthToken('demo-token-for-legal-api');
      } else {
        console.log('[App] Using existing auth token');
        apiService.setAuthToken(existingToken);
      }

      // Initialize other services
      console.log('[App] Chat service ready:', typeof chatService);
      console.log('[App] Search service ready:', typeof searchService);
      console.log('[App] Legal service ready:', typeof legalService);

      console.log('[App] All services initialized successfully');
      setIsInitialized(true);
    } catch (error) {
      console.error('[App] Failed to initialize services:', error);
      setInitError('Failed to initialize services');
      // Still allow app to continue
      setIsInitialized(true);
    }
  };

  // Create themed styles
  const themedStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });

  if (!isInitialized) {
    return (
      <SafeAreaProvider>
        <View style={[themedStyles.container, themedStyles.centered]}>
          <StatusBar
            style={isDark ? 'light' : 'dark'}
            backgroundColor={theme.colors.background}
          />
          <Text style={themedStyles.loadingText}>
            {initError || 'جاري تحميل الخدمات...'}
          </Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={themedStyles.container}>
        <StatusBar
          style={isDark ? 'light' : 'dark'}
          backgroundColor={theme.colors.background}
        />
        <AppNavigator />
      </View>
    </SafeAreaProvider>
  );
}

// Main App component with context providers
export default function App() {
  return (
    <RTLProvider>
      <ThemeProvider>
        <MascotProvider>
          <AppContent />
        </MascotProvider>
      </ThemeProvider>
    </RTLProvider>
  );
}
