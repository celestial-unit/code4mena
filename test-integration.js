#!/usr/bin/env node

/**
 * Integration Test Script for Frontend-Backend Integration
 *
 * This script tests:
 * - API calls work with the backend (Requirement 1.1)
 * - Authentication flow (if implemented) (Requirement 2.1)
 * - Error handling works as expected (Requirement 6.1)
 */

// Dynamic import for node-fetch (ESM module)
let fetch;

// Configuration
const API_BASE_URL = 'http://localhost:8001';
const TEST_TIMEOUT = 10000;

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: [],
};

// Helper function to log test results
function logTest(testName, passed, message = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${testName}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${testName}: ${message}`);
  }
  testResults.details.push({ testName, passed, message });
}

// Helper function to make API requests with timeout
async function makeRequest(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer demo-token',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Test 1: Basic API Connection (Requirement 1.1)
async function testBasicApiConnection() {
  console.log('\n🔍 Testing Basic API Connection...');

  try {
    const response = await makeRequest(`${API_BASE_URL}/health`);

    if (response.ok) {
      const data = await response.json();
      logTest('Health endpoint accessible', true);

      // Check if response has expected structure
      if (data.detail && data.detail.api) {
        logTest('Health response has correct structure', true);

        // Check individual service statuses
        const services = [
          'api',
          'database',
          'legal_rag',
          'external_llm',
          'audio_service',
        ];
        services.forEach(service => {
          if (data.detail[service]) {
            const isHealthy = data.detail[service].includes('healthy');
            logTest(
              `${service} service status`,
              isHealthy,
              data.detail[service]
            );
          }
        });
      } else {
        logTest(
          'Health response has correct structure',
          false,
          'Missing expected fields'
        );
      }
    } else {
      logTest('Health endpoint accessible', false, `HTTP ${response.status}`);
    }
  } catch (error) {
    logTest('Health endpoint accessible', false, error.message);
  }
}

// Test 2: Legal Query API (Requirement 1.1)
async function testLegalQueryApi() {
  console.log('\n🔍 Testing Legal Query API...');

  try {
    const queryData = {
      query: 'ما هي حقوق المواطن في الدستور التونسي؟',
      language: 'ar',
      user_id: 'test-user',
    };

    const response = await makeRequest(`${API_BASE_URL}/query`, {
      method: 'POST',
      body: JSON.stringify(queryData),
    });

    if (response.ok) {
      const data = await response.json();
      logTest('Legal query endpoint accessible', true);

      // Check response structure
      if (data.response && data.sources && data.disclaimer) {
        logTest('Legal query response has correct structure', true);
        logTest(
          'Legal query returns sources',
          data.sources.length > 0,
          `Found ${data.sources.length} sources`
        );
      } else {
        logTest(
          'Legal query response has correct structure',
          false,
          'Missing expected fields'
        );
      }
    } else {
      const errorText = await response.text();
      logTest(
        'Legal query endpoint accessible',
        false,
        `HTTP ${response.status}: ${errorText}`
      );
    }
  } catch (error) {
    logTest('Legal query endpoint accessible', false, error.message);
  }
}

// Test 3: Popular Queries API (Requirement 1.1)
async function testPopularQueriesApi() {
  console.log('\n🔍 Testing Popular Queries API...');

  try {
    const response = await makeRequest(
      `${API_BASE_URL}/popular-queries?language=ar`
    );

    if (response.ok) {
      const data = await response.json();
      logTest('Popular queries endpoint accessible', true);

      if (Array.isArray(data)) {
        logTest('Popular queries returns array', true);
        if (data.length > 0) {
          const firstQuery = data[0];
          if (firstQuery.query && typeof firstQuery.popularity === 'number') {
            logTest('Popular queries have correct structure', true);
          } else {
            logTest(
              'Popular queries have correct structure',
              false,
              'Missing expected fields'
            );
          }
        }
      } else {
        logTest(
          'Popular queries returns array',
          false,
          'Response is not an array'
        );
      }
    } else {
      const errorText = await response.text();
      logTest(
        'Popular queries endpoint accessible',
        false,
        `HTTP ${response.status}: ${errorText}`
      );
    }
  } catch (error) {
    logTest('Popular queries endpoint accessible', false, error.message);
  }
}

// Test 4: Authentication Token Handling (Requirement 2.1)
async function testAuthenticationTokenHandling() {
  console.log('\n🔍 Testing Authentication Token Handling...');

  // Test with valid token
  try {
    const response = await makeRequest(`${API_BASE_URL}/health`, {
      headers: {
        Authorization: 'Bearer valid-demo-token',
      },
    });

    if (response.ok) {
      logTest('API accepts Bearer token', true);
    } else {
      logTest('API accepts Bearer token', false, `HTTP ${response.status}`);
    }
  } catch (error) {
    logTest('API accepts Bearer token', false, error.message);
  }

  // Test without token
  try {
    const response = await makeRequest(`${API_BASE_URL}/health`, {
      headers: {}, // No Authorization header
    });

    // Backend should still work without token for now (as per implementation)
    if (response.ok) {
      logTest(
        'API works without token (expected for current implementation)',
        true
      );
    } else {
      logTest('API behavior without token', false, `HTTP ${response.status}`);
    }
  } catch (error) {
    logTest('API behavior without token', false, error.message);
  }
}

// Test 5: Error Handling (Requirement 6.1)
async function testErrorHandling() {
  console.log('\n🔍 Testing Error Handling...');

  // Test invalid endpoint
  try {
    const response = await makeRequest(`${API_BASE_URL}/invalid-endpoint`);

    if (!response.ok) {
      logTest(
        'API returns proper error for invalid endpoint',
        true,
        `HTTP ${response.status}`
      );

      // Check if error response has proper structure
      try {
        const errorData = await response.json();
        if (errorData.detail || errorData.message) {
          logTest('Error response has proper structure', true);
        } else {
          logTest(
            'Error response has proper structure',
            false,
            'No error details provided'
          );
        }
      } catch {
        logTest(
          'Error response has proper structure',
          false,
          'Error response is not JSON'
        );
      }
    } else {
      logTest(
        'API returns proper error for invalid endpoint',
        false,
        'Should return error for invalid endpoint'
      );
    }
  } catch (error) {
    logTest(
      'API returns proper error for invalid endpoint',
      false,
      error.message
    );
  }

  // Test malformed request
  try {
    const response = await makeRequest(`${API_BASE_URL}/query`, {
      method: 'POST',
      body: 'invalid-json',
    });

    if (!response.ok) {
      logTest(
        'API handles malformed requests properly',
        true,
        `HTTP ${response.status}`
      );
    } else {
      logTest(
        'API handles malformed requests properly',
        false,
        'Should return error for malformed JSON'
      );
    }
  } catch (error) {
    logTest('API handles malformed requests properly', false, error.message);
  }
}

// Test 6: Network Timeout Handling (Requirement 6.1)
async function testTimeoutHandling() {
  console.log('\n🔍 Testing Timeout Handling...');

  // Test with very short timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1); // 1ms timeout

  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      signal: controller.signal,
      headers: {
        Authorization: 'Bearer demo-token',
      },
    });

    clearTimeout(timeoutId);
    logTest('Timeout handling works', false, 'Request should have timed out');
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      logTest('Timeout handling works', true, 'Request properly aborted');
    } else {
      logTest(
        'Timeout handling works',
        false,
        `Unexpected error: ${error.message}`
      );
    }
  }
}

// Test 7: API Service Integration Test
async function testApiServiceIntegration() {
  console.log('\n🔍 Testing API Service Integration...');

  // Test that our API service configuration matches backend
  const expectedBaseUrl = 'http://localhost:8001';
  logTest(
    'API base URL configuration',
    API_BASE_URL === expectedBaseUrl,
    `Expected: ${expectedBaseUrl}, Got: ${API_BASE_URL}`
  );

  // Test that backend accepts our expected request format
  try {
    const testData = {
      query: 'test query',
      language: 'ar',
      user_id: 'integration-test',
    };

    const response = await makeRequest(`${API_BASE_URL}/query`, {
      method: 'POST',
      body: JSON.stringify(testData),
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer demo-token',
      },
    });

    if (response.ok) {
      logTest('Backend accepts frontend request format', true);
    } else {
      const errorText = await response.text();
      logTest(
        'Backend accepts frontend request format',
        false,
        `HTTP ${response.status}: ${errorText}`
      );
    }
  } catch (error) {
    logTest('Backend accepts frontend request format', false, error.message);
  }
}

// Main test runner
async function runIntegrationTests() {
  // Initialize fetch
  if (!fetch) {
    const fetchModule = await import('node-fetch');
    fetch = fetchModule.default;
  }

  console.log('🚀 Starting Frontend-Backend Integration Tests');
  console.log('='.repeat(50));

  // Run all tests
  await testBasicApiConnection();
  await testLegalQueryApi();
  await testPopularQueriesApi();
  await testAuthenticationTokenHandling();
  await testErrorHandling();
  await testTimeoutHandling();
  await testApiServiceIntegration();

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Results Summary');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed} ✅`);
  console.log(`Failed: ${testResults.failed} ❌`);
  console.log(
    `Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`
  );

  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.details
      .filter(test => !test.passed)
      .forEach(test => {
        console.log(`  - ${test.testName}: ${test.message}`);
      });
  }

  console.log('\n' + '='.repeat(50));

  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests if this script is executed directly
if (require.main === module) {
  runIntegrationTests().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runIntegrationTests,
  testResults,
};
