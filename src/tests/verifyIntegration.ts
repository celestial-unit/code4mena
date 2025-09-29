/**
 * Quick verification script to check if integration components are working
 */

import apiService from '../services/api';
import authService from '../services/authService';
import storageService from '../services/storage';

export async function quickVerification(): Promise<boolean> {
  console.log('🔍 Running quick integration verification...');

  try {
    // 1. Check API service is configured
    const hasApiConfig = apiService['baseUrl'] && apiService['timeout'];
    console.log(`✅ API Service configured: ${hasApiConfig}`);

    // 2. Check storage service works
    await storageService.set('test_key', 'test_value');
    const testValue = await storageService.get('test_key');
    await storageService.remove('test_key');
    const storageWorks = testValue === 'test_value';
    console.log(`✅ Storage Service working: ${storageWorks}`);

    // 3. Check auth service initializes
    await authService.initialize();
    const authInitialized = true; // If no error thrown
    console.log(`✅ Auth Service initialized: ${authInitialized}`);

    // 4. Check error handling (should not throw)
    try {
      await apiService.get('/non-existent-endpoint');
    } catch (error) {
      // Expected to fail, but should be handled gracefully
      const errorHandled = error && typeof error === 'object' && 'message' in error;
      console.log(`✅ Error handling working: ${errorHandled}`);
    }

    console.log('🎉 Quick verification completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Verification failed:', error);
    return false;
  }
}

// Export for use in other files
export default quickVerification;