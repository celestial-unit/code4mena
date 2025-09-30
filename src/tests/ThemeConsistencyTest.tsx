import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

// Import all screens that should support theming
import { DashboardScreen } from '../screens/DashboardScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { UpdatesScreen } from '../screens/UpdatesScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

interface ThemeConsistencyTestProps {
  navigation: any;
}

export const ThemeConsistencyTest: React.FC<ThemeConsistencyTestProps> = ({
  navigation,
}) => {
  const { theme, isDark, toggleTheme } = useTheme();

  const screens = [
    { name: 'Dashboard', component: DashboardScreen, route: 'Dashboard' },
    { name: 'Chat', component: ChatScreen, route: 'Chat' },
    { name: 'Search', component: SearchScreen, route: 'Search' },
    {
      name: 'Notifications',
      component: NotificationsScreen,
      route: 'Notifications',
    },
    { name: 'Updates', component: UpdatesScreen, route: 'Updates' },
    { name: 'Profile', component: ProfileScreen, route: 'Profile' },
  ];

  const testResults = {
    themeContextAvailable: !!theme,
    isDarkModeWorking: typeof isDark === 'boolean',
    toggleFunctionAvailable: typeof toggleTheme === 'function',
    themeColorsComplete: !!(
      theme?.colors?.background &&
      theme?.colors?.surface &&
      theme?.colors?.text &&
      theme?.colors?.primary &&
      theme?.colors?.accent
    ),
    screensWithThemeSupport: screens.length,
  };

  const handleScreenNavigation = (route: string) => {
    if (navigation && navigation.navigate) {
      navigation.navigate(route);
    }
  };

  const handleThemeToggle = () => {
    toggleTheme();
    // Give a brief moment for the theme to update
    setTimeout(() => {
      console.log('Theme toggled. Current theme:', isDark ? 'Dark' : 'Light');
    }, 100);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.backButton,
            { backgroundColor: theme.colors.primary + '15' },
          ]}
          onPress={() => navigation?.goBack?.()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Theme Consistency Test
        </Text>

        <TouchableOpacity
          style={[
            styles.themeToggle,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={handleThemeToggle}
        >
          <Ionicons
            name={isDark ? 'sunny' : 'moon'}
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Theme Status */}
        <View
          style={[styles.section, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Current Theme Status
          </Text>
          <View style={styles.statusGrid}>
            <View
              style={[
                styles.statusItem,
                { backgroundColor: theme.colors.card },
              ]}
            >
              <Text
                style={[
                  styles.statusLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Mode
              </Text>
              <Text style={[styles.statusValue, { color: theme.colors.text }]}>
                {isDark ? 'Dark' : 'Light'}
              </Text>
            </View>
            <View
              style={[
                styles.statusItem,
                { backgroundColor: theme.colors.card },
              ]}
            >
              <Text
                style={[
                  styles.statusLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Primary
              </Text>
              <View
                style={[
                  styles.colorSwatch,
                  { backgroundColor: theme.colors.primary },
                ]}
              />
            </View>
            <View
              style={[
                styles.statusItem,
                { backgroundColor: theme.colors.card },
              ]}
            >
              <Text
                style={[
                  styles.statusLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Accent
              </Text>
              <View
                style={[
                  styles.colorSwatch,
                  { backgroundColor: theme.colors.accent },
                ]}
              />
            </View>
            <View
              style={[
                styles.statusItem,
                { backgroundColor: theme.colors.card },
              ]}
            >
              <Text
                style={[
                  styles.statusLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Background
              </Text>
              <View
                style={[
                  styles.colorSwatch,
                  { backgroundColor: theme.colors.background },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Test Results */}
        <View
          style={[styles.section, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Test Results
          </Text>
          {Object.entries(testResults).map(([key, value]) => (
            <View key={key} style={styles.testResult}>
              <Ionicons
                name={value ? 'checkmark-circle' : 'close-circle'}
                size={20}
                color={value ? theme.colors.success : theme.colors.error}
              />
              <Text style={[styles.testLabel, { color: theme.colors.text }]}>
                {key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase())}
              </Text>
              <Text
                style={[
                  styles.testValue,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {typeof value === 'boolean'
                  ? value
                    ? 'Pass'
                    : 'Fail'
                  : value.toString()}
              </Text>
            </View>
          ))}
        </View>

        {/* Screen Navigation Tests */}
        <View
          style={[styles.section, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Screen Theme Tests
          </Text>
          <Text
            style={[
              styles.sectionDescription,
              { color: theme.colors.textSecondary },
            ]}
          >
            Navigate to each screen to verify theme consistency
          </Text>

          {screens.map(screen => (
            <TouchableOpacity
              key={screen.route}
              style={[
                styles.screenButton,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => handleScreenNavigation(screen.route)}
            >
              <Text
                style={[styles.screenButtonText, { color: theme.colors.text }]}
              >
                Test {screen.name} Screen
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Theme Color Palette */}
        <View
          style={[styles.section, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Color Palette
          </Text>
          <View style={styles.colorPalette}>
            {Object.entries(theme.colors).map(([colorName, colorValue]) => (
              <View key={colorName} style={styles.colorItem}>
                <View
                  style={[styles.colorSwatch, { backgroundColor: colorValue }]}
                />
                <Text
                  style={[
                    styles.colorName,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {colorName}
                </Text>
                <Text
                  style={[
                    styles.colorValue,
                    { color: theme.colors.textTertiary },
                  ]}
                >
                  {colorValue}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Instructions */}
        <View
          style={[styles.section, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Testing Instructions
          </Text>
          <Text
            style={[styles.instruction, { color: theme.colors.textSecondary }]}
          >
            1. Toggle between light and dark themes using the button in the
            header
          </Text>
          <Text
            style={[styles.instruction, { color: theme.colors.textSecondary }]}
          >
            2. Navigate to each screen and verify that colors adapt properly
          </Text>
          <Text
            style={[styles.instruction, { color: theme.colors.textSecondary }]}
          >
            3. Check that text remains readable in both themes
          </Text>
          <Text
            style={[styles.instruction, { color: theme.colors.textSecondary }]}
          >
            4. Verify that interactive elements maintain proper contrast
          </Text>
          <Text
            style={[styles.instruction, { color: theme.colors.textSecondary }]}
          >
            5. Ensure theme preference persists across app restarts
          </Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  themeToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusItem: {
    flex: 1,
    minWidth: 80,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  testResult: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  testLabel: {
    flex: 1,
    fontSize: 14,
  },
  testValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  screenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  screenButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  colorPalette: {
    gap: 12,
  },
  colorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorName: {
    fontSize: 14,
    fontWeight: '500',
    minWidth: 100,
  },
  colorValue: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  instruction: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  bottomSpacing: {
    height: 100,
  },
});
