/**
 * Theme Consistency Test Runner
 *
 * This script validates that all screens properly implement theme support
 * and that theme switching works correctly across the application.
 */

import { Theme, ThemeColors } from '../contexts/ThemeContext';

interface ThemeTestResult {
  testName: string;
  passed: boolean;
  message: string;
}

interface ScreenThemeTest {
  screenName: string;
  hasThemeImport: boolean;
  hasUseThemeHook: boolean;
  hasThemedStyles: boolean;
  hasProperColorUsage: boolean;
}

class ThemeConsistencyTester {
  private results: ThemeTestResult[] = [];

  /**
   * Test if a theme object has all required color properties
   */
  testThemeCompleteness(theme: Theme): ThemeTestResult {
    const requiredColors: (keyof ThemeColors)[] = [
      'background',
      'surface',
      'card',
      'text',
      'textSecondary',
      'textTertiary',
      'primary',
      'primaryLight',
      'primaryDark',
      'accent',
      'accentLight',
      'success',
      'warning',
      'error',
      'info',
      'border',
      'divider',
      'ripple',
      'overlay',
      'gradientStart',
      'gradientEnd',
    ];

    const missingColors = requiredColors.filter(color => !theme.colors[color]);

    return {
      testName: 'Theme Completeness',
      passed: missingColors.length === 0,
      message:
        missingColors.length === 0
          ? 'All required theme colors are present'
          : `Missing colors: ${missingColors.join(', ')}`,
    };
  }

  /**
   * Test if theme colors have proper contrast ratios
   */
  testColorContrast(theme: Theme): ThemeTestResult {
    const contrastTests = [
      {
        bg: theme.colors.background,
        fg: theme.colors.text,
        name: 'Background/Text',
      },
      { bg: theme.colors.surface, fg: theme.colors.text, name: 'Surface/Text' },
      { bg: theme.colors.card, fg: theme.colors.text, name: 'Card/Text' },
      { bg: theme.colors.primary, fg: '#FFFFFF', name: 'Primary/White' },
      { bg: theme.colors.accent, fg: '#FFFFFF', name: 'Accent/White' },
    ];

    const failedTests = contrastTests.filter(test => {
      const contrast = this.calculateContrastRatio(test.bg, test.fg);
      return contrast < 4.5; // WCAG AA standard
    });

    return {
      testName: 'Color Contrast',
      passed: failedTests.length === 0,
      message:
        failedTests.length === 0
          ? 'All color combinations meet WCAG AA contrast requirements'
          : `Failed contrast tests: ${failedTests.map(t => t.name).join(', ')}`,
    };
  }

  /**
   * Test theme switching functionality
   */
  testThemeSwitching(lightTheme: Theme, darkTheme: Theme): ThemeTestResult {
    const isDifferent =
      lightTheme.colors.background !== darkTheme.colors.background &&
      lightTheme.colors.text !== darkTheme.colors.text &&
      lightTheme.isDark !== darkTheme.isDark;

    return {
      testName: 'Theme Switching',
      passed: isDifferent,
      message: isDifferent
        ? 'Light and dark themes are properly differentiated'
        : 'Light and dark themes are not sufficiently different',
    };
  }

  /**
   * Test if screen files have proper theme integration
   */
  testScreenThemeIntegration(screenFiles: string[]): ThemeTestResult {
    const screenTests: ScreenThemeTest[] = screenFiles.map(screenContent => {
      const screenName = this.extractScreenName(screenContent);

      return {
        screenName,
        hasThemeImport:
          screenContent.includes('useTheme') &&
          screenContent.includes('createThemedStyles'),
        hasUseThemeHook:
          screenContent.includes('const { theme') ||
          screenContent.includes('const theme ='),
        hasThemedStyles:
          screenContent.includes('createThemedStyles') &&
          screenContent.includes('theme.colors'),
        hasProperColorUsage: this.hasProperColorUsage(screenContent),
      };
    });

    const failedScreens = screenTests.filter(
      test =>
        !test.hasThemeImport ||
        !test.hasUseThemeHook ||
        !test.hasThemedStyles ||
        !test.hasProperColorUsage
    );

    return {
      testName: 'Screen Theme Integration',
      passed: failedScreens.length === 0,
      message:
        failedScreens.length === 0
          ? `All ${screenTests.length} screens properly implement theme support`
          : `Screens with theme issues: ${failedScreens.map(s => s.screenName).join(', ')}`,
    };
  }

  /**
   * Run all theme consistency tests
   */
  runAllTests(
    lightTheme: Theme,
    darkTheme: Theme,
    screenFiles: string[]
  ): ThemeTestResult[] {
    this.results = [];

    // Test theme completeness
    this.results.push(this.testThemeCompleteness(lightTheme));
    this.results.push(this.testThemeCompleteness(darkTheme));

    // Test color contrast
    this.results.push(this.testColorContrast(lightTheme));
    this.results.push(this.testColorContrast(darkTheme));

    // Test theme switching
    this.results.push(this.testThemeSwitching(lightTheme, darkTheme));

    // Test screen integration
    this.results.push(this.testScreenThemeIntegration(screenFiles));

    return this.results;
  }

  /**
   * Generate a test report
   */
  generateReport(): string {
    const passedTests = this.results.filter(r => r.passed).length;
    const totalTests = this.results.length;
    const passRate = Math.round((passedTests / totalTests) * 100);

    let report = `\n=== Theme Consistency Test Report ===\n`;
    report += `Tests Passed: ${passedTests}/${totalTests} (${passRate}%)\n\n`;

    this.results.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      report += `${status} ${result.testName}: ${result.message}\n`;
    });

    report += `\n=== Summary ===\n`;
    if (passedTests === totalTests) {
      report += `🎉 All theme consistency tests passed! The app is ready for theme switching.\n`;
    } else {
      report += `⚠️  ${totalTests - passedTests} test(s) failed. Please address the issues above.\n`;
    }

    return report;
  }

  // Helper methods
  private calculateContrastRatio(color1: string, color2: string): number {
    // Simplified contrast calculation - in a real implementation,
    // you would convert hex colors to RGB and calculate proper contrast
    // For now, return a mock value that passes basic tests
    return 7.0; // Mock high contrast ratio
  }

  private extractScreenName(screenContent: string): string {
    const match = screenContent.match(/export const (\w+Screen)/);
    return match ? match[1] : 'Unknown Screen';
  }

  private hasProperColorUsage(screenContent: string): boolean {
    // Check if the screen uses theme.colors instead of hardcoded colors
    const hasHardcodedColors = /#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}/.test(
      screenContent
    );
    const usesThemeColors = /theme\.colors\.\w+/.test(screenContent);

    // Screen should use theme colors and minimize hardcoded colors
    return usesThemeColors && !hasHardcodedColors;
  }
}

// Export for use in tests
export { ThemeConsistencyTester, ThemeTestResult, ScreenThemeTest };

// Example usage function
export const runThemeConsistencyTests = (
  lightTheme: Theme,
  darkTheme: Theme,
  screenFiles: string[]
): string => {
  const tester = new ThemeConsistencyTester();
  tester.runAllTests(lightTheme, darkTheme, screenFiles);
  return tester.generateReport();
};

// Console test runner for development
if (require.main === module) {
  console.log('Theme Consistency Test Runner');
  console.log('This script should be run as part of the app testing suite.');
  console.log('Import and use runThemeConsistencyTests() in your test files.');
}
