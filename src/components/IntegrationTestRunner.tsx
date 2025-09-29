import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { runIntegrationTests } from '../tests/integrationTest';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
}

export const IntegrationTestRunner: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [hasRun, setHasRun] = useState(false);

  const handleRunTests = async () => {
    setIsRunning(true);
    setResults([]);
    setHasRun(false);

    try {
      const testResults = await runIntegrationTests();
      setResults(testResults);
      setHasRun(true);

      const passed = testResults.filter(r => r.passed).length;
      const total = testResults.length;
      
      Alert.alert(
        'اكتملت الاختبارات',
        `نجح ${passed} من ${total} اختبار\nمعدل النجاح: ${Math.round((passed / total) * 100)}%`,
        [{ text: 'موافق' }]
      );
    } catch (error) {
      Alert.alert(
        'خطأ في الاختبار',
        'فشل في تشغيل الاختبارات: ' + (error instanceof Error ? error.message : 'خطأ غير معروف'),
        [{ text: 'موافق' }]
      );
    } finally {
      setIsRunning(false);
    }
  };

  const getResultIcon = (passed: boolean) => {
    return passed ? 'checkmark-circle' : 'close-circle';
  };

  const getResultColor = (passed: boolean) => {
    return passed ? '#4CAF50' : '#F44336';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>اختبار التكامل</Text>
        <Text style={styles.subtitle}>
          اختبار التكامل بين الواجهة الأمامية والخلفية
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.runButton, isRunning && styles.disabledButton]}
        onPress={handleRunTests}
        disabled={isRunning}
      >
        <Ionicons
          name={isRunning ? "hourglass-outline" : "play-circle-outline"}
          size={24}
          color="#FFFFFF"
        />
        <Text style={styles.runButtonText}>
          {isRunning ? 'جاري تشغيل الاختبارات...' : 'تشغيل الاختبارات'}
        </Text>
      </TouchableOpacity>

      {hasRun && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>ملخص النتائج</Text>
          <View style={styles.summaryStats}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{results.filter(r => r.passed).length}</Text>
              <Text style={styles.statLabel}>نجح</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statNumber, { color: '#F44336' }]}>
                {results.filter(r => !r.passed).length}
              </Text>
              <Text style={styles.statLabel}>فشل</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{results.length}</Text>
              <Text style={styles.statLabel}>المجموع</Text>
            </View>
          </View>
        </View>
      )}

      {results.length > 0 && (
        <ScrollView style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>تفاصيل النتائج</Text>
          {results.map((result, index) => (
            <View key={index} style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Ionicons
                  name={getResultIcon(result.passed)}
                  size={20}
                  color={getResultColor(result.passed)}
                />
                <Text style={styles.resultName}>{result.name}</Text>
              </View>
              
              {result.error && (
                <Text style={styles.resultError}>{result.error}</Text>
              )}
              
              {result.details && (
                <View style={styles.resultDetails}>
                  <Text style={styles.detailsTitle}>التفاصيل:</Text>
                  <Text style={styles.detailsText}>
                    {JSON.stringify(result.details, null, 2)}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  runButton: {
    backgroundColor: '#E31E24',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  runButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 8,
    flex: 1,
  },
  resultError: {
    fontSize: 14,
    color: '#F44336',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  resultDetails: {
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    padding: 8,
  },
  detailsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 11,
    color: '#666666',
    fontFamily: 'monospace',
  },
});