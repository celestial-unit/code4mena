/**
 * Integration Test Suite for Frontend-Backend Integration
 * 
 * This test verifies:
 * - API calls work with the backend
 * - Authentication flow works correctly
 * - Error handling works as expected
 * 
 * Requirements covered: 1.1, 2.1, 6.1
 */

import apiService from '../services/api';
import authService from '../services/authService';
import storageService from '../services/storage';
import { networkUtils } from '../utils/networkUtils';
import geminiApiService from '../services/geminiApiService';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
}

class IntegrationTester {
  private results: TestResult[] = [];

  /**
   * Run all integration tests
   */
  async runAllTests(): Promise<TestResult[]> {
    console.log('🚀 Starting Integration Tests...');
    this.results = [];

    // Test network connectivity
    await this.testNetworkConnectivity();

    // Test API service configuration
    await this.testApiConfiguration();

    // Test storage service
    await this.testStorageService();

    // Test authentication service
    await this.testAuthenticationService();

    // Test API health check
    await this.testApiHealthCheck();

    // Test error handling
    await this.testErrorHandling();

    // Test API endpoints (if backend is available)
    await this.testApiEndpoints();

    // Test Gemini API integration
    await this.testGeminiApi();

    console.log('✅ Integration Tests Complete');
    this.printResults();

    return this.results;
  }

  /**
   * Test network connectivity
   */
  private async testNetworkConnectivity(): Promise<void> {
    try {
      const networkState = await networkUtils.checkConnectivity();

      this.addResult({
        name: 'Network Connectivity Check',
        passed: networkState.isConnected,
        details: {
          isConnected: networkState.isConnected,
          isInternetReachable: networkState.isInternetReachable,
          type: networkState.type
        }
      });
    } catch (error) {
      this.addResult({
        name: 'Network Connectivity Check',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown network error'
      });
    }
  }

  /**
   * Test API service configuration
   */
  private async testApiConfiguration(): Promise<void> {
    try {
      // Check if API service is properly configured
      const hasBaseUrl = apiService['baseUrl'] && apiService['baseUrl'].length > 0;
      const hasTimeout = apiService['timeout'] && apiService['timeout'] > 0;

      this.addResult({
        name: 'API Service Configuration',
        passed: hasBaseUrl && hasTimeout,
        details: {
          baseUrl: apiService['baseUrl'],
          timeout: apiService['timeout'],
          hasAuthToken: !!apiService.getAuthToken()
        }
      });
    } catch (error) {
      this.addResult({
        name: 'API Service Configuration',
        passed: false,
        error: error instanceof Error ? error.message : 'API configuration error'
      });
    }
  }

  /**
   * Test storage service functionality
   */
  private async testStorageService(): Promise<void> {
    try {
      const testKey = 'integration_test_key';
      const testValue = { test: 'data', timestamp: Date.now() };

      // Test set
      await storageService.set(testKey, testValue);

      // Test get
      const retrievedValue = await storageService.get(testKey);

      // Test remove
      await storageService.remove(testKey);

      // Verify removal
      const removedValue = await storageService.get(testKey);

      const passed = JSON.stringify(retrievedValue) === JSON.stringify(testValue) && removedValue === null;

      this.addResult({
        name: 'Storage Service Functionality',
        passed,
        details: {
          setSuccessful: true,
          getSuccessful: JSON.stringify(retrievedValue) === JSON.stringify(testValue),
          removeSuccessful: removedValue === null
        }
      });
    } catch (error) {
      this.addResult({
        name: 'Storage Service Functionality',
        passed: false,
        error: error instanceof Error ? error.message : 'Storage service error'
      });
    }
  }

  /**
   * Test authentication service
   */
  private async testAuthenticationService(): Promise<void> {
    try {
      // Initialize auth service
      await authService.initialize();

      // Test authentication check
      const isAuthenticated = await authService.isAuthenticated();

      // Test mock login
      const mockCredentials = {
        email: 'test@example.com',
        password: 'testpassword'
      };

      const loginResponse = await authService.login(mockCredentials);
      const isAuthenticatedAfterLogin = await authService.isAuthenticated();
      const currentUser = await authService.getCurrentUser();

      // Test logout
      await authService.logout();
      const isAuthenticatedAfterLogout = await authService.isAuthenticated();

      this.addResult({
        name: 'Authentication Service',
        passed: !!loginResponse && isAuthenticatedAfterLogin && !isAuthenticatedAfterLogout,
        details: {
          initialAuthStatus: isAuthenticated,
          loginSuccessful: !!loginResponse,
          authAfterLogin: isAuthenticatedAfterLogin,
          userDataRetrieved: !!currentUser,
          authAfterLogout: isAuthenticatedAfterLogout
        }
      });
    } catch (error) {
      this.addResult({
        name: 'Authentication Service',
        passed: false,
        error: error instanceof Error ? error.message : 'Authentication service error'
      });
    }
  }

  /**
   * Test API health check
   */
  private async testApiHealthCheck(): Promise<void> {
    try {
      const startTime = Date.now();
      const healthResponse = await apiService.healthCheck();
      const responseTime = Date.now() - startTime;

      this.addResult({
        name: 'API Health Check',
        passed: !!healthResponse,
        details: {
          responseTime: `${responseTime}ms`,
          response: healthResponse
        }
      });
    } catch (error) {
      this.addResult({
        name: 'API Health Check',
        passed: false,
        error: error instanceof Error ? error.message : 'Health check failed',
        details: {
          note: 'This is expected if backend is not running'
        }
      });
    }
  }

  /**
   * Test error handling
   */
  private async testErrorHandling(): Promise<void> {
    try {
      let networkErrorCaught = false;
      let timeoutErrorCaught = false;
      let httpErrorCaught = false;

      // Test network error handling
      try {
        // Force a network error by using invalid URL
        const originalBaseUrl = apiService['baseUrl'];
        apiService['baseUrl'] = 'http://invalid-url-that-does-not-exist.com';
        await apiService.healthCheck();
      } catch (error: any) {
        networkErrorCaught = error.code === 'NETWORK_ERROR' || error.message.includes('fetch');
      }

      // Test timeout error handling
      try {
        // Force a timeout by setting very short timeout
        const originalTimeout = apiService['timeout'];
        apiService['timeout'] = 1; // 1ms timeout
        await apiService.healthCheck();
      } catch (error: any) {
        timeoutErrorCaught = error.code === 'TIMEOUT' || error.name === 'AbortError';
      }

      // Test HTTP error handling (if backend is available)
      try {
        // Try to access a non-existent endpoint
        await apiService.get('/non-existent-endpoint');
      } catch (error: any) {
        httpErrorCaught = error.status === 404 || error.code === 'NETWORK_ERROR';
      }

      this.addResult({
        name: 'Error Handling',
        passed: networkErrorCaught || timeoutErrorCaught || httpErrorCaught,
        details: {
          networkErrorHandled: networkErrorCaught,
          timeoutErrorHandled: timeoutErrorCaught,
          httpErrorHandled: httpErrorCaught,
          note: 'At least one error type should be properly handled'
        }
      });
    } catch (error) {
      this.addResult({
        name: 'Error Handling',
        passed: false,
        error: error instanceof Error ? error.message : 'Error handling test failed'
      });
    }
  }

  /**
   * Test API endpoints (if backend is available)
   */
  private async testApiEndpoints(): Promise<void> {
    try {
      const endpointTests = [];

      // Test legal categories endpoint
      try {
        const categories = await apiService.getLegalCategories();
        endpointTests.push({ endpoint: '/legal-categories', success: true, data: categories });
      } catch (error) {
        endpointTests.push({ endpoint: '/legal-categories', success: false, error: error });
      }

      // Test popular queries endpoint
      try {
        const queries = await apiService.getPopularQueries();
        endpointTests.push({ endpoint: '/popular-queries', success: true, data: queries });
      } catch (error) {
        endpointTests.push({ endpoint: '/popular-queries', success: false, error: error });
      }

      // Test legal query submission
      try {
        const queryResponse = await apiService.submitLegalQuery({
          query: 'ما هي حقوق المستهلك في تونس؟',
          language: 'ar'
        });
        endpointTests.push({ endpoint: '/query', success: true, data: queryResponse });
      } catch (error) {
        endpointTests.push({ endpoint: '/query', success: false, error: error });
      }

      const successfulTests = endpointTests.filter(test => test.success).length;
      const totalTests = endpointTests.length;

      this.addResult({
        name: 'API Endpoints Testing',
        passed: successfulTests > 0,
        details: {
          successfulEndpoints: successfulTests,
          totalEndpoints: totalTests,
          tests: endpointTests,
          note: 'Some failures are expected if backend is not running'
        }
      });
    } catch (error) {
      this.addResult({
        name: 'API Endpoints Testing',
        passed: false,
        error: error instanceof Error ? error.message : 'API endpoints test failed'
      });
    }
  }

  /**
   * Add a test result
   */
  private addResult(result: TestResult): void {
    this.results.push(result);
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  }

  /**
   * Print test results summary
   */
  private printResults(): void {
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;

    console.log('\n📊 Test Results Summary:');
    console.log(`   Passed: ${passed}/${total}`);
    console.log(`   Success Rate: ${Math.round((passed / total) * 100)}%`);

    if (passed < total) {
      console.log('\n❌ Failed Tests:');
      this.results.filter(r => !r.passed).forEach(result => {
        console.log(`   - ${result.name}: ${result.error || 'Unknown error'}`);
      });
    }
  }

  /**
   * Test Gemini API integration
   */
  private async testGeminiApi(): Promise<void> {
    try {
      const tests = [];

      // Test Gemini API health check
      try {
        const healthResponse = await geminiApiService.healthCheck();
        tests.push({ test: 'health_check', success: true, data: healthResponse });
      } catch (error) {
        tests.push({ test: 'health_check', success: false, error: error });
      }

      // Test Backend API legal query functionality
      try {
        const chatResponse = await geminiApiService.sendMessage(
          'مرحبا، ما هي متطلبات تسجيل شركة جديدة في تونس؟',
          'ar',
          'test-user'
        );
        tests.push({
          test: 'legal_query',
          success: !!chatResponse.response,
          data: {
            responseLength: chatResponse.response?.length || 0,
            sourcesCount: chatResponse.sources?.length || 0,
            queryId: chatResponse.query_id
          }
        });
      } catch (error) {
        tests.push({ test: 'legal_query', success: false, error: error });
      }

      // Test supported languages endpoint
      try {
        const languages = await geminiApiService.getSupportedLanguages();
        tests.push({ test: 'supported_languages', success: true, data: languages });
      } catch (error) {
        tests.push({ test: 'supported_languages', success: false, error: error });
      }

      // Test text-to-speech functionality
      try {
        const audioBlob = await geminiApiService.textToSpeech('مرحبا، هذا اختبار للصوت', 'ar-TN');
        tests.push({
          test: 'text_to_speech',
          success: audioBlob !== null,
          data: { hasAudio: audioBlob !== null }
        });
      } catch (error) {
        tests.push({ test: 'text_to_speech', success: false, error: error });
      }

      const successfulTests = tests.filter(test => test.success).length;
      const totalTests = tests.length;

      this.addResult({
        name: 'Backend API Integration (Gemini-powered)',
        passed: successfulTests > 0,
        details: {
          successfulTests,
          totalTests,
          tests,
          note: 'Some failures are expected if Backend API is not running'
        }
      });
    } catch (error) {
      this.addResult({
        name: 'Backend API Integration (Gemini-powered)',
        passed: false,
        error: error instanceof Error ? error.message : 'Backend API test failed'
      });
    }
  }

  /**
   * Get test results
   */
  getResults(): TestResult[] {
    return this.results;
  }

  /**
   * Check if all tests passed
   */
  allTestsPassed(): boolean {
    return this.results.every(result => result.passed);
  }
}

// Export the tester class and a convenience function
export { IntegrationTester };

export const runIntegrationTests = async (): Promise<TestResult[]> => {
  const tester = new IntegrationTester();
  return await tester.runAllTests();
};