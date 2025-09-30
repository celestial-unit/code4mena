/**
 * Simple integration test script
 * Run this to verify the frontend-backend integration
 */

import { runIntegrationTests } from '../tests/integrationTest';

async function main() {
  console.log('🚀 Starting Frontend-Backend Integration Tests...\n');

  try {
    const results = await runIntegrationTests();

    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    const successRate = Math.round((passed / total) * 100);

    console.log('\n' + '='.repeat(50));
    console.log('📊 INTEGRATION TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`📈 Success Rate: ${successRate}%`);

    if (passed === total) {
      console.log('🎉 All tests passed! Integration is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Check the details above.');

      console.log('\n❌ Failed Tests:');
      results
        .filter(r => !r.passed)
        .forEach(result => {
          console.log(
            `   • ${result.name}: ${result.error || 'Unknown error'}`
          );
        });
    }

    console.log('\n💡 Notes:');
    console.log(
      '   • Some failures are expected if the backend is not running'
    );
    console.log('   • Network and storage tests should always pass');
    console.log('   • API tests will fail if backend is not accessible');

    process.exit(passed === total ? 0 : 1);
  } catch (error) {
    console.error('❌ Failed to run integration tests:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

export { main as testIntegration };
