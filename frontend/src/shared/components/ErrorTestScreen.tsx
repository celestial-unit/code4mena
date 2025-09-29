import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { 
  ErrorDisplay, 
  NetworkStatusIndicator,
  LoadingOverlay 
} from '../components/common';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { useNetworkState } from '../utils/networkUtils';
import apiService from '../services/api';
import { IntegrationTestRunner } from '../components/IntegrationTestRunner';
import { testBackendConnection } from '../utils/debugApi';

interface ErrorTestScreenProps {
  navigation: any;
}

export const ErrorTestScreen: React.FC<ErrorTestScreenProps> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'error' | 'integration'>('error');

  const { error, isRetrying, handleError, clearError, retry } = useErrorHandler({
    maxRetries: 3,
    showAlert: false
  });
  const networkState = useNetworkState();

  const testNetworkError = () => {
    handleError(
      { code: 'NETWORK_ERROR', message: 'Network connection failed' },
      'فشل في الاتصال بالشبكة'
    );
  };

  const testServerError = () => {
    handleError(
      { code: '500', message: 'Internal server error' },
      'خطأ في الخادم'
    );
  };

  const testTimeoutError = () => {
    handleError(
      { code: 'TIMEOUT', message: 'Request timeout' },
      'انتهت مهلة الطلب'
    );
  };

  const testAuthError = () => {
    handleError(
      { code: '401', message: 'Unauthorized' },
      'غير مصرح بالوصول'
    );
  };

  const testApiCall = async () => {
    setIsLoading(true);
    setTestResult(null);
    clearError();

    try {
      // Check network first
      if (!networkState.isConnected || !networkState.isInternetReachable) {
        throw new Error('لا يوجد اتصال بالإنترنت');
      }

      const response = await apiService.healthCheck();
      setTestResult(`نجح الاتصال! حالة الخادم: ${JSON.stringify(response, null, 2)}`);
    } catch (err) {
      handleError(err, 'فشل في اختبار الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  const testGeminiConnection = async () => {
    setIsLoading(true);
    setTestResult(null);
    clearError();

    try {
      console.log('🔍 Testing Gemini Live API connection...');
      const result = await testBackendConnection();
      
      if (result.success) {
        setTestResult(`✅ نجح الاتصال مع Gemini Live API!\n\nتفاصيل الاختبار:\n${JSON.stringify(result, null, 2)}`);
      } else {
        throw new Error(result.error || 'فشل الاتصال');
      }
    } catch (err) {
      handleError(err, 'فشل في اختبار الاتصال مع Gemini Live API');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async () => {
    await retry(async () => {
      await testApiCall();
    });
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <NetworkStatusIndicator onRetry={handleRetry} />
        <ErrorDisplay
          error={error}
          onRetry={handleRetry}
          type="network"
          isRetrying={isRetrying}
          showRetry={true}
          showDismiss={true}
          onDismiss={clearError}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <NetworkStatusIndicator onRetry={handleRetry} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#E31E24" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>اختبار التكامل</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'error' && styles.activeTab]}
          onPress={() => setActiveTab('error')}
        >
          <Text style={[styles.tabText, activeTab === 'error' && styles.activeTabText]}>
            اختبار الأخطاء
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'integration' && styles.activeTab]}
          onPress={() => setActiveTab('integration')}
        >
          <Text style={[styles.tabText, activeTab === 'integration' && styles.activeTabText]}>
            اختبار التكامل
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'integration' ? (
        <IntegrationTestRunner />
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Network Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>حالة الشبكة</Text>
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>متصل:</Text>
              <Text style={[
                styles.statusValue,
                { color: networkState.isConnected ? '#4CAF50' : '#F44336' }
              ]}>
                {networkState.isConnected ? 'نعم' : 'لا'}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>الإنترنت متاح:</Text>
              <Text style={[
                styles.statusValue,
                { color: networkState.isInternetReachable ? '#4CAF50' : '#F44336' }
              ]}>
                {networkState.isInternetReachable ? 'نعم' : 'لا'}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>نوع الاتصال:</Text>
              <Text style={styles.statusValue}>{networkState.type}</Text>
            </View>
          </View>
        </View>

        {/* Error Tests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اختبار أنواع الأخطاء</Text>
          <View style={styles.buttonGrid}>
            <TouchableOpacity style={styles.testButton} onPress={testNetworkError}>
              <Ionicons name="wifi" size={24} color="#FFFFFF" />
              <Text style={styles.testButtonText}>خطأ شبكة</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.testButton} onPress={testServerError}>
              <Ionicons name="server-outline" size={24} color="#FFFFFF" />
              <Text style={styles.testButtonText}>خطأ خادم</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.testButton} onPress={testTimeoutError}>
              <Ionicons name="time-outline" size={24} color="#FFFFFF" />
              <Text style={styles.testButtonText}>انتهاء المهلة</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.testButton} onPress={testAuthError}>
              <Ionicons name="lock-closed-outline" size={24} color="#FFFFFF" />
              <Text style={styles.testButtonText}>خطأ مصادقة</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* API Test */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اختبار الاتصال بالخادم</Text>
          <TouchableOpacity 
            style={[styles.apiTestButton, isLoading && styles.disabledButton]} 
            onPress={testApiCall}
            disabled={isLoading}
          >
            <Ionicons 
              name={isLoading ? "hourglass-outline" : "cloud-outline"} 
              size={24} 
              color="#FFFFFF" 
            />
            <Text style={styles.apiTestButtonText}>
              {isLoading ? 'جاري الاختبار...' : 'اختبار الاتصال'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.geminiTestButton, isLoading && styles.disabledButton]} 
            onPress={testGeminiConnection}
            disabled={isLoading}
          >
            <Ionicons 
              name="flash" 
              size={24} 
              color="#FFFFFF" 
            />
            <Text style={styles.apiTestButtonText}>
              اختبار Gemini Live
            </Text>
          </TouchableOpacity>

          {testResult && (
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>نتيجة الاختبار:</Text>
              <Text style={styles.resultText}>{testResult}</Text>
            </View>
          )}
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>التعليمات</Text>
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionText}>
              • اضغط على أزرار اختبار الأخطاء لمشاهدة كيفية عرض الأخطاء المختلفة
            </Text>
            <Text style={styles.instructionText}>
              • استخدم زر "اختبار الاتصال" لاختبار الاتصال الفعلي بالخادم
            </Text>
            <Text style={styles.instructionText}>
              • مؤشر حالة الشبكة سيظهر تلقائياً عند انقطاع الاتصال
            </Text>
            <Text style={styles.instructionText}>
              • يمكنك استخدام زر "إعادة المحاولة" في شاشات الأخطاء
            </Text>
          </View>
        </View>
      </ScrollView>
      )}

      {isLoading && <LoadingOverlay message="جاري اختبار الاتصال..." />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  placeholder: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#E31E24',
  },
  tabText: {
    fontSize: 16,
    color: '#666666',
  },
  activeTabText: {
    color: '#E31E24',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusLabel: {
    fontSize: 16,
    color: '#666666',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  testButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#E31E24',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  apiTestButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  geminiTestButton: {
    backgroundColor: '#FF9800',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  apiTestButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
    color: '#388E3C',
    fontFamily: 'monospace',
  },
  instructionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  instructionText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 8,
  },
});