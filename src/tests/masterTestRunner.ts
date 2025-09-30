/**
 * Master Test Runner for Comprehensive Testing and Optimization
 *
 * This is the main test runner that executes all test suites for task 12:
 * - 12.1: Complete user flows with enhanced features
 * - 12.2: Performance testing and optimization
 * - 12.3: Compatibility and regression testing
 */

import { runComprehensiveUserFlowTests } from './comprehensiveUserFlowTests';
import { runAllPerformanceTests } from './performanceTests';
import { runCompatibilityRegressionTests } from './compatibilityRegressionTests';

interface MasterTestReport {
  userFlowTests: any;
  performanceTests: any;
  compatibilityTests: any;
  summary: {
    totalTestSuites: number;
    passedTestSuites: number;
    totalIndividualTests: number;
    passedIndividualTests: number;
    overallSuccessRate: number;
    criticalIssues: string[];
    recommendations: string[];
    readyForProduction: boolean;
  };
  executionTime: {
    userFlowDuration: number;
    performanceDuration: number;
    compatibilityDuration: number;
    totalDuration: number;
  };
}

/**
 * Run all comprehensive tests for task 12
 */
export const runMasterTestSuite = async (): Promise<MasterTestReport> => {
  console.log('🚀 STARTING MASTER TEST SUITE FOR TASK 12');
  console.log('='.repeat(80));
  console.log('📋 Task 12: Perform comprehensive testing and optimization');
  console.log('   12.1: Test complete user flows with enhanced features');
  console.log('   12.2: Performance testing and optimization');
  console.log('   12.3: Compatibility and regression testing');
  console.log('='.repeat(80));

  const masterStartTime = Date.now();
  const criticalIssues: string[] = [];
  const recommendations: string[] = [];

  // 12.1: Run User Flow Tests
  console.log('\n🧪 EXECUTING TASK 12.1: User Flow Tests');
  console.log('-'.repeat(50));
  const userFlowStart = Date.now();
  const userFlowTests = await runComprehensiveUserFlowTests();
  const userFlowDuration = Date.now() - userFlowStart;

  // Analyze user flow results
  const userFlowSuccess = userFlowTests.overallResults.successRate >= 90;
  if (!userFlowSuccess) {
    criticalIssues.push('User flow tests have critical failures');
    recommendations.push(
      'Fix user flow issues before proceeding to production'
    );
  }

  console.log('\n✅ TASK 12.1 COMPLETED');
  console.log(
    `   Success Rate: ${userFlowTests.overallResults.successRate.toFixed(1)}%`
  );
  console.log(`   Duration: ${userFlowDuration}ms`);

  // 12.2: Run Performance Tests
  console.log('\n⚡ EXECUTING TASK 12.2: Performance Tests');
  console.log('-'.repeat(50));
  const performanceStart = Date.now();
  const performanceTests = await runAllPerformanceTests();
  const performanceDuration = Date.now() - performanceStart;

  // Analyze performance results
  const performanceSuccess = performanceTests.every(test => test.passed);
  if (!performanceSuccess) {
    const failedTests = performanceTests.filter(test => !test.passed);
    failedTests.forEach(test => {
      criticalIssues.push(`Performance issue: ${test.testName}`);
      recommendations.push(...test.recommendations);
    });
  }

  console.log('\n✅ TASK 12.2 COMPLETED');
  console.log(
    `   Tests Passed: ${performanceTests.filter(t => t.passed).length}/${performanceTests.length}`
  );
  console.log(`   Duration: ${performanceDuration}ms`);

  // 12.3: Run Compatibility and Regression Tests
  console.log('\n🔍 EXECUTING TASK 12.3: Compatibility and Regression Tests');
  console.log('-'.repeat(50));
  const compatibilityStart = Date.now();
  const compatibilityTests = await runCompatibilityRegressionTests();
  const compatibilityDuration = Date.now() - compatibilityStart;

  // Analyze compatibility results
  const compatibilitySuccess =
    compatibilityTests.overallStatus.criticalIssues === 0;
  if (!compatibilitySuccess) {
    criticalIssues.push(
      `${compatibilityTests.overallStatus.criticalIssues} critical compatibility issues found`
    );
    recommendations.push('Fix breaking changes and functionality regressions');
  }

  if (compatibilityTests.overallStatus.warningIssues > 0) {
    recommendations.push(
      `Address ${compatibilityTests.overallStatus.warningIssues} compatibility warnings`
    );
  }

  console.log('\n✅ TASK 12.3 COMPLETED');
  console.log(
    `   Success Rate: ${compatibilityTests.overallStatus.successRate.toFixed(1)}%`
  );
  console.log(
    `   Critical Issues: ${compatibilityTests.overallStatus.criticalIssues}`
  );
  console.log(`   Duration: ${compatibilityDuration}ms`);

  // Calculate overall metrics
  const totalDuration = Date.now() - masterStartTime;
  const totalIndividualTests =
    userFlowTests.overallResults.totalTests +
    performanceTests.length +
    compatibilityTests.overallStatus.totalTests;

  const passedIndividualTests =
    userFlowTests.overallResults.passedTests +
    performanceTests.filter(t => t.passed).length +
    compatibilityTests.overallStatus.passedTests;

  const overallSuccessRate =
    (passedIndividualTests / totalIndividualTests) * 100;

  // Determine if ready for production
  const readyForProduction =
    userFlowSuccess &&
    performanceSuccess &&
    compatibilitySuccess &&
    criticalIssues.length === 0;

  // Generate final report
  console.log('\n' + '='.repeat(80));
  console.log('📊 MASTER TEST SUITE FINAL REPORT');
  console.log('='.repeat(80));

  console.log('\n📈 OVERALL METRICS:');
  console.log(`   Total Test Suites: 3`);
  console.log(
    `   Passed Test Suites: ${[userFlowSuccess, performanceSuccess, compatibilitySuccess].filter(Boolean).length}/3`
  );
  console.log(`   Total Individual Tests: ${totalIndividualTests}`);
  console.log(`   Passed Individual Tests: ${passedIndividualTests}`);
  console.log(`   Overall Success Rate: ${overallSuccessRate.toFixed(1)}%`);
  console.log(
    `   Total Execution Time: ${totalDuration}ms (${(totalDuration / 1000).toFixed(1)}s)`
  );

  console.log('\n🎯 TEST SUITE BREAKDOWN:');
  console.log(
    `   12.1 User Flow Tests: ${userFlowSuccess ? '✅ PASS' : '❌ FAIL'} (${userFlowTests.overallResults.successRate.toFixed(1)}%)`
  );
  console.log(
    `   12.2 Performance Tests: ${performanceSuccess ? '✅ PASS' : '❌ FAIL'} (${performanceTests.filter(t => t.passed).length}/${performanceTests.length})`
  );
  console.log(
    `   12.3 Compatibility Tests: ${compatibilitySuccess ? '✅ PASS' : '❌ FAIL'} (${compatibilityTests.overallStatus.successRate.toFixed(1)}%)`
  );

  if (criticalIssues.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES:');
    criticalIssues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
  }

  if (recommendations.length > 0) {
    console.log('\n💡 RECOMMENDATIONS:');
    // Remove duplicates and show unique recommendations
    const uniqueRecommendations = [...new Set(recommendations)];
    uniqueRecommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
  }

  console.log('\n🎯 PRODUCTION READINESS:');
  if (readyForProduction) {
    console.log('   ✅ READY FOR PRODUCTION!');
    console.log(
      '   🎉 All enhanced features are working correctly and optimized.'
    );
    console.log('   📦 Safe to deploy the enhanced profile features.');
  } else {
    console.log('   ❌ NOT READY FOR PRODUCTION');
    console.log('   ⚠️  Critical issues must be resolved before deployment.');
    console.log('   🔧 Please address the issues listed above.');
  }

  console.log('\n📋 NEXT STEPS:');
  if (readyForProduction) {
    console.log(
      '   1. ✅ All tests passed - proceed with deployment preparation'
    );
    console.log('   2. 📝 Update documentation with new features');
    console.log('   3. 🚀 Prepare for production deployment');
  } else {
    console.log('   1. 🔧 Fix critical issues identified in the tests');
    console.log('   2. 🔄 Re-run the test suite to verify fixes');
    console.log('   3. 📊 Review performance optimizations');
    console.log('   4. 🧪 Conduct additional testing if needed');
  }

  console.log('\n' + '='.repeat(80));
  console.log('🏁 MASTER TEST SUITE COMPLETED');
  console.log('='.repeat(80));

  // Return comprehensive report
  const report: MasterTestReport = {
    userFlowTests,
    performanceTests,
    compatibilityTests,
    summary: {
      totalTestSuites: 3,
      passedTestSuites: [
        userFlowSuccess,
        performanceSuccess,
        compatibilitySuccess,
      ].filter(Boolean).length,
      totalIndividualTests,
      passedIndividualTests,
      overallSuccessRate,
      criticalIssues,
      recommendations: [...new Set(recommendations)],
      readyForProduction,
    },
    executionTime: {
      userFlowDuration,
      performanceDuration,
      compatibilityDuration,
      totalDuration,
    },
  };

  return report;
};

/**
 * Quick test runner for development
 */
export const runQuickTests = async (): Promise<void> => {
  console.log('⚡ Running Quick Test Suite...\n');

  const startTime = Date.now();

  // Run a subset of critical tests
  console.log('🧪 Running critical user flow tests...');
  const userFlowTests = await runComprehensiveUserFlowTests();

  console.log('⚡ Running performance tests...');
  const performanceTests = await runAllPerformanceTests();

  const duration = Date.now() - startTime;

  console.log('\n📊 QUICK TEST RESULTS:');
  console.log(
    `User Flow Success Rate: ${userFlowTests.overallResults.successRate.toFixed(1)}%`
  );
  console.log(
    `Performance Tests Passed: ${performanceTests.filter(t => t.passed).length}/${performanceTests.length}`
  );
  console.log(`Total Duration: ${duration}ms`);

  const allPassed =
    userFlowTests.overallResults.successRate >= 90 &&
    performanceTests.every(t => t.passed);

  console.log(
    `\n${allPassed ? '✅ Quick tests passed!' : '❌ Issues detected - run full test suite'}`
  );
};

/**
 * Export functions for use in other files
 */
export {
  runComprehensiveUserFlowTests,
  runAllPerformanceTests,
  runCompatibilityRegressionTests,
};

export default runMasterTestSuite;
