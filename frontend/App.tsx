import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import the navigation system
import { AppNavigator } from './src/navigation/AppNavigator';

// Import services for initialization
import apiService from './src/services/api';
import authService from './src/services/authService';

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    initializeServices();
  }, []);

  const initializeServices = async () => {
    try {
      console.log('[App] Initializing services...');
      
      // Initialize auth service (loads stored tokens)
      await authService.initialize();
      
      // Set a demo token for API calls if no token exists
      const existingToken = await authService.getAuthToken();
      if (!existingToken) {
        console.log('[App] No existing token, setting demo token');
        apiService.setAuthToken('demo-token-for-legal-api');
      }

      console.log('[App] Services initialized successfully');
      setIsInitialized(true);
    } catch (error) {
      console.error('[App] Failed to initialize services:', error);
      setInitError('Failed to initialize app services');
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
            {initError || 'جاري تحميل التطبيق...'}
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
