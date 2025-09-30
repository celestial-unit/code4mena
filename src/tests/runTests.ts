#!/usr/bin/env node

/**
 * Test Execution Script for Task 12
 *
 * This script can be run from the command line to execute all comprehensive tests.
 * Usage:
 *   npm run test:comprehensive
 *   npm run test:quick
 *   npm run test:user-flows
 *   npm run test:performance
 *   npm run test:compatibility
 */

import { runMasterTestSuite, runQuickTests } from './masterTestRunner';
import { runComprehensiveUserFlowTests } from './comprehensiveUserFlowTests';
import { runAllPerformanceTests } from './performanceTests';
import { runCompatibilityRegressionTests } from './compatibilityRegressionTests';

// Get command line arguments
const args = process.argv.slice(2);
const testType = args[0] || 'full';

async function main() {
  try {
    console.log('🚀 Enhanced Features Test Suite');
    console.log('================================\n');

    switch (testType) {
      case 'full':
      case 'comprehensive':
        console.log('Running comprehensive test suite...\n');
        const fullReport = await runMasterTestSuite();

        // Exit with error code if tests failed
        if (!fullReport.summary.readyForProduction) {
          process.exit(1);
        }
        break;

      case 'quick':
        console.log('Running quick test suite...\n');
        await runQuickTests();
        break;

      case 'user-flows':
      case 'flows':
        console.log('Running user flow tests...\n');
        const userFlowResults = await runComprehensiveUserFlowTests();

        if (userFlowResults.overallResults.successRate < 90) {
          console.log('\n❌ User flow tests failed!');
          process.exit(1);
        } else {
          console.log('\n✅ User flow tests passed!');
        }
        break;

      case 'performance':
      case 'perf':
        console.log('Running performance tests...\n');
        const perfResults = await runAllPerformanceTests();

        const perfPassed = perfResults.every(test => test.passed);
        if (!perfPassed) {
          console.log('\n❌ Performance tests failed!');
          process.exit(1);
        } else {
          console.log('\n✅ Performance tests passed!');
        }
        break;

      case 'compatibility':
      case 'compat':
        console.log('Running compatibility and regression tests...\n');
        const compatResults = await runCompatibilityRegressionTests();

        if (compatResults.overallStatus.criticalIssues > 0) {
          console.log('\n❌ Compatibility tests failed!');
          process.exit(1);
        } else {
          console.log('\n✅ Compatibility tests passed!');
        }
        break;

      case 'help':
      case '--help':
      case '-h':
        showHelp();
        break;

      default:
        console.log(`❌ Unknown test type: ${testType}`);
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }
}

function showHelp() {
  console.log('Enhanced Features Test Suite');
  console.log('============================\n');
  console.log('Usage: npm run test:enhanced [type]\n');
  console.log('Test Types:');
  console.log('  full, comprehensive  - Run all test suites (default)');
  console.log('  quick               - Run quick test subset');
  console.log('  user-flows, flows   - Run user flow tests only');
  console.log('  performance, perf   - Run performance tests only');
  console.log('  compatibility, compat - Run compatibility tests only');
  console.log('  help, --help, -h    - Show this help message\n');
  console.log('Examples:');
  console.log('  npm run test:enhanced');
  console.log('  npm run test:enhanced quick');
  console.log('  npm run test:enhanced performance');
  console.log('  npm run test:enhanced user-flows');
}

// Run the main function
if (require.main === module) {
  main();
}

export { main as runTestScript };
