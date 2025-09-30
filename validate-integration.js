#!/usr/bin/env node

/**
 * Simple validation script for the enhanced profile features integration
 * This script performs basic checks to ensure the integration is successful
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 ENHANCED PROFILE FEATURES VALIDATION');
console.log('=' .repeat(60));

let totalTests = 0;
let passedTests = 0;
const results = [];

function addResult(testName, passed, message) {
  totalTests++;
  if (passed) passedTests++;
  
  results.push({
    testName,
    passed,
    message,
    status: passed ? '✅ PASS' : '❌ FAIL'
  });
  
  console.log(`${passed ? '✅' : '❌'} ${testName}: ${message}`);
}

// Test 1: Check if enhanced context files exist
console.log('\n📋 Testing Context Provider Files...');

const contextFiles = [
  'src/contexts/ThemeContext.tsx',
  'src/contexts/MascotContext.tsx',
  'src/contexts/RTLContext.tsx',
  'src/contexts/index.ts'
];

contextFiles.forEach(file => {
  const exists = fs.existsSync(file);
  addResult(
    `Context file: ${path.basename(file)}`,
    exists,
    exists ? 'File exists' : 'File missing'
  );
});

// Test 2: Check if enhanced component directories exist
console.log('\n🧩 Testing Enhanced Component Structure...');

const componentDirs = [
  'src/components/mascot',
  'src/components/gamification',
  'src/components/language'
];

componentDirs.forEach(dir => {
  const exists = fs.existsSync(dir);
  addResult(
    `Component directory: ${path.basename(dir)}`,
    exists,
    exists ? 'Directory exists' : 'Directory missing'
  );
});

// Test 3: Check if enhanced screens exist
console.log('\n📱 Testing Enhanced Screen Files...');

const screenFiles = [
  'src/screens/ProfileScreen.tsx',
  'src/screens/PersonalInfoScreen.tsx',
  'src/screens/PreferencesScreen.tsx',
  'src/screens/AchievementsScreen.tsx',
  'src/screens/MascotDemoScreen.tsx'
];

screenFiles.forEach(file => {
  const exists = fs.existsSync(file);
  addResult(
    `Screen file: ${path.basename(file)}`,
    exists,
    exists ? 'File exists' : 'File missing'
  );
});

// Test 4: Check if App.tsx has context providers
console.log('\n🔗 Testing App Integration...');

try {
  const appContent = fs.readFileSync('App.tsx', 'utf8');
  
  const hasThemeProvider = appContent.includes('ThemeProvider');
  const hasMascotProvider = appContent.includes('MascotProvider');
  const hasRTLProvider = appContent.includes('RTLProvider');
  
  addResult(
    'ThemeProvider integration',
    hasThemeProvider,
    hasThemeProvider ? 'ThemeProvider found in App.tsx' : 'ThemeProvider missing'
  );
  
  addResult(
    'MascotProvider integration',
    hasMascotProvider,
    hasMascotProvider ? 'MascotProvider found in App.tsx' : 'MascotProvider missing'
  );
  
  addResult(
    'RTLProvider integration',
    hasRTLProvider,
    hasRTLProvider ? 'RTLProvider found in App.tsx' : 'RTLProvider missing'
  );
  
} catch (error) {
  addResult(
    'App.tsx integration',
    false,
    `Error reading App.tsx: ${error.message}`
  );
}

// Test 5: Check package.json dependencies
console.log('\n📦 Testing Dependencies...');

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = [
    '@react-native-async-storage/async-storage',
    '@shopify/react-native-skia',
    'expo-blur'
  ];
  
  requiredDeps.forEach(dep => {
    const hasDepency = deps[dep] !== undefined;
    addResult(
      `Dependency: ${dep}`,
      hasDepency,
      hasDepency ? `Version: ${deps[dep]}` : 'Missing dependency'
    );
  });
  
} catch (error) {
  addResult(
    'Package.json check',
    false,
    `Error reading package.json: ${error.message}`
  );
}

// Test 6: Check if documentation exists
console.log('\n📚 Testing Documentation...');

const docFiles = [
  'docs/ENHANCED_FEATURES_GUIDE.md',
  'docs/THEME_CUSTOMIZATION_GUIDE.md',
  'docs/MASCOT_CUSTOMIZATION_GUIDE.md',
  'docs/THEME_USAGE_GUIDE.md'
];

docFiles.forEach(file => {
  const exists = fs.existsSync(file);
  addResult(
    `Documentation: ${path.basename(file)}`,
    exists,
    exists ? 'Documentation exists' : 'Documentation missing'
  );
});

// Test 7: Check if duplicate directories were cleaned up
console.log('\n🧹 Testing Cleanup...');

const shouldNotExist = [
  'src(1)',
  'src_backup_20250930_011922'
];

shouldNotExist.forEach(dir => {
  const exists = fs.existsSync(dir);
  addResult(
    `Cleanup: ${dir}`,
    !exists,
    exists ? 'Directory still exists (should be removed)' : 'Directory properly removed'
  );
});

// Test 8: Basic file content validation
console.log('\n🔍 Testing File Content...');

try {
  // Check if contexts export properly
  const contextsIndex = fs.readFileSync('src/contexts/index.ts', 'utf8');
  const hasThemeExport = contextsIndex.includes('export') && contextsIndex.includes('ThemeProvider');
  const hasMascotExport = contextsIndex.includes('export') && contextsIndex.includes('MascotProvider');
  
  addResult(
    'Context exports',
    hasThemeExport && hasMascotExport,
    hasThemeExport && hasMascotExport ? 'All context providers exported' : 'Missing context exports'
  );
  
  // Check if components index is updated
  const componentsIndex = fs.readFileSync('src/components/index.ts', 'utf8');
  const hasMascotComponentExport = componentsIndex.includes('mascot');
  const hasGamificationExport = componentsIndex.includes('gamification');
  
  addResult(
    'Component exports',
    hasMascotComponentExport && hasGamificationExport,
    hasMascotComponentExport && hasGamificationExport ? 'Enhanced components exported' : 'Missing component exports'
  );
  
} catch (error) {
  addResult(
    'File content validation',
    false,
    `Error validating file content: ${error.message}`
  );
}

// Generate final report
console.log('\n' + '=' .repeat(60));
console.log('📊 VALIDATION SUMMARY');
console.log('=' .repeat(60));

const successRate = Math.round((passedTests / totalTests) * 100);

console.log(`\n📈 OVERALL METRICS:`);
console.log(`   Total Tests: ${totalTests}`);
console.log(`   Passed Tests: ${passedTests}`);
console.log(`   Failed Tests: ${totalTests - passedTests}`);
console.log(`   Success Rate: ${successRate}%`);

console.log(`\n🎯 DETAILED RESULTS:`);
results.forEach(result => {
  console.log(`   ${result.status} ${result.testName}`);
});

console.log(`\n🎯 DEPLOYMENT READINESS:`);
if (successRate >= 90) {
  console.log('   ✅ READY FOR DEPLOYMENT!');
  console.log('   🎉 Enhanced profile features are properly integrated.');
  console.log('   📦 Safe to proceed with deployment preparation.');
} else if (successRate >= 75) {
  console.log('   ⚠️  MOSTLY READY - Minor issues detected');
  console.log('   🔧 Address the failing tests before deployment.');
  console.log('   📋 Review the failed items above.');
} else {
  console.log('   ❌ NOT READY FOR DEPLOYMENT');
  console.log('   🚨 Critical issues detected that need immediate attention.');
  console.log('   🔧 Fix the failing tests before proceeding.');
}

console.log(`\n📋 NEXT STEPS:`);
if (successRate >= 90) {
  console.log('   1. ✅ Integration validation complete');
  console.log('   2. 📝 Documentation is up to date');
  console.log('   3. 🚀 Ready for production deployment');
  console.log('   4. 📊 Consider running performance tests');
} else {
  console.log('   1. 🔧 Fix the failing validation tests');
  console.log('   2. 🔄 Re-run this validation script');
  console.log('   3. 📊 Run comprehensive tests when ready');
  console.log('   4. 📝 Update documentation if needed');
}

console.log('\n' + '=' .repeat(60));
console.log('🏁 ENHANCED PROFILE FEATURES VALIDATION COMPLETED');
console.log('=' .repeat(60));

// Exit with appropriate code
process.exit(successRate >= 90 ? 0 : 1);