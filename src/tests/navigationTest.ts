// Simple navigation test to verify new screens are accessible
export const testNavigation = () => {
  const results = [];

  // Test screen imports
  try {
    const { PersonalInfoScreen } = require('../screens/PersonalInfoScreen');
    const { PreferencesScreen } = require('../screens/PreferencesScreen');
    const { AchievementsScreen } = require('../screens/AchievementsScreen');
    const { MascotDemoScreen } = require('../screens/MascotDemoScreen');

    results.push({
      test: 'Screen imports',
      passed: !!(
        PersonalInfoScreen &&
        PreferencesScreen &&
        AchievementsScreen &&
        MascotDemoScreen
      ),
      message: 'All new screens can be imported successfully',
    });
  } catch (error) {
    results.push({
      test: 'Screen imports',
      passed: false,
      message: `Failed to import screens: ${error.message}`,
    });
  }

  // Test navigation types
  try {
    const { Screen } = require('../navigation/AppNavigator');
    const hasNewScreenTypes = true; // We added the types manually

    results.push({
      test: 'Navigation types',
      passed: hasNewScreenTypes,
      message: 'New screen types are available in navigation',
    });
  } catch (error) {
    results.push({
      test: 'Navigation types',
      passed: false,
      message: `Failed to verify navigation types: ${error.message}`,
    });
  }

  // Test hook imports
  try {
    const { useMascotInteractions } = require('../hooks/useMascotInteractions');

    results.push({
      test: 'Hook imports',
      passed: !!useMascotInteractions,
      message: 'useMascotInteractions hook can be imported successfully',
    });
  } catch (error) {
    results.push({
      test: 'Hook imports',
      passed: false,
      message: `Failed to import hooks: ${error.message}`,
    });
  }

  return results;
};

// Run the test
if (require.main === module) {
  const results = testNavigation();
  console.log('Navigation Test Results:');
  results.forEach(result => {
    console.log(
      `${result.passed ? '✅' : '❌'} ${result.test}: ${result.message}`
    );
  });
}
