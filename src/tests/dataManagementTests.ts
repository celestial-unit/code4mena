/**
 * Data Management Tests
 * Tests enhanced data persistence and backward compatibility
 */

import { mockDataManager } from '../utils/mockDataManager';
import {
  transformTunisianMascot,
  transformUser,
} from '../utils/dataTransformers';

export const testEnhancedDataPersistence = () => {
  console.log('[Data Test] Testing enhanced data persistence...');

  try {
    // Test enhanced user creation
    const enhancedUser = mockDataManager.createMockUser({
      name: 'Test Enhanced User',
      email: 'test@enhanced.com',
    });

    // Test data persistence
    const persistResult =
      mockDataManager.persistUserDataWithEnhancements(enhancedUser);

    if (!persistResult.success) {
      console.error('[Data Test] Persistence failed:', persistResult.errors);
      return false;
    }

    console.log('[Data Test] Enhanced data persistence successful');
    return true;
  } catch (error) {
    console.error('[Data Test] Enhanced data persistence error:', error);
    return false;
  }
};

export const testBackwardCompatibility = () => {
  console.log('[Data Test] Testing backward compatibility...');

  try {
    // Test legacy user data migration
    const legacyUser = {
      id: 'legacy-user-1',
      name: 'Legacy User',
      email: 'legacy@example.com',
      // Missing enhanced preferences
    };

    const migratedUser = mockDataManager.migrateUserDataToEnhanced(legacyUser);

    // Verify enhanced preferences were added
    if (
      !migratedUser.preferences.mascot ||
      !migratedUser.preferences.display?.theme
    ) {
      console.error(
        '[Data Test] Migration failed - missing enhanced preferences'
      );
      return false;
    }

    console.log('[Data Test] Backward compatibility successful');
    return true;
  } catch (error) {
    console.error('[Data Test] Backward compatibility error:', error);
    return false;
  }
};

export const testMascotTransformation = () => {
  console.log('[Data Test] Testing mascot data transformation...');

  try {
    // Test mascot transformation
    const jsonMascot = {
      id: 'test-mascot',
      name: 'Test Mascot',
      sector: 'business',
      // Missing optional arrays
    };

    const transformedMascot = transformTunisianMascot(jsonMascot);

    // Verify arrays were initialized
    if (
      !Array.isArray(transformedMascot.animations) ||
      !Array.isArray(transformedMascot.customizations)
    ) {
      console.error(
        '[Data Test] Mascot transformation failed - missing arrays'
      );
      return false;
    }

    console.log('[Data Test] Mascot transformation successful');
    return true;
  } catch (error) {
    console.error('[Data Test] Mascot transformation error:', error);
    return false;
  }
};

export const testThemeAwareMascots = () => {
  console.log('[Data Test] Testing theme-aware mascot creation...');

  try {
    // Test light theme mascot
    const lightMascot = mockDataManager.createMascotWithThemeSupport(
      {
        name: 'Light Theme Mascot',
        sector: 'business',
      },
      'light'
    );

    // Test dark theme mascot
    const darkMascot = mockDataManager.createMascotWithThemeSupport(
      {
        name: 'Dark Theme Mascot',
        sector: 'business',
      },
      'dark'
    );

    // Verify theme-specific customizations
    const hasLightCustomizations = lightMascot.customizations.some(
      c => c.includes('light_mode') || c.includes('day_theme')
    );
    const hasDarkCustomizations = darkMascot.customizations.some(
      c => c.includes('dark_mode') || c.includes('night_theme')
    );

    if (!hasLightCustomizations || !hasDarkCustomizations) {
      console.error('[Data Test] Theme-aware mascot creation failed');
      return false;
    }

    console.log('[Data Test] Theme-aware mascot creation successful');
    return true;
  } catch (error) {
    console.error('[Data Test] Theme-aware mascot creation error:', error);
    return false;
  }
};

export const runDataManagementTests = () => {
  console.log('[Data Test] Starting data management tests...');

  const results = {
    persistence: testEnhancedDataPersistence(),
    compatibility: testBackwardCompatibility(),
    transformation: testMascotTransformation(),
    themeAware: testThemeAwareMascots(),
  };

  const allPassed = Object.values(results).every(result => result === true);

  console.log('[Data Test] Results:', results);
  console.log('[Data Test] All tests passed:', allPassed);

  return allPassed;
};
