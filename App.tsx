import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import the real navigation system
import { AppNavigator } from './src/navigation/AppNavigator';

// Import all services
import apiService from './src/services/api';
import storageService from './src/services/storage';
import authService from './src/services/authService';
import { chatService } from './src/services/chatService';
import { searchService } from './src/services/searchService';
import { legalService } from './src/services/legalService';

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

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

  if (!isInitialized) {
    return (
      <SafeAreaProvider>
        <View style={[styles.container, styles.centered]}>
          <StatusBar style="dark" backgroundColor="#FFFFFF" />
          <Text style={styles.loadingText}>
            {initError || 'جاري تحميل الخدمات...'}
          </Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="dark" backgroundColor="#FFFFFF" />
        <AppNavigator />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});
