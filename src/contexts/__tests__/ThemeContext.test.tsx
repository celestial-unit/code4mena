import React from 'react';
import { render, act } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ThemeProvider, useTheme } from '../ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock Appearance
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Appearance: {
    getColorScheme: jest.fn(() => 'light'),
    addChangeListener: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

// Test component that uses the theme
const TestComponent = () => {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <Text testID="theme-test">
      {`Theme: ${isDark ? 'dark' : 'light'}, Background: ${theme.colors.background}`}
    </Text>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should provide default light theme', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Wait for theme to load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const testElement = getByTestId('theme-test');
    expect(testElement.props.children).toContain('Theme: light');
    expect(testElement.props.children).toContain('Background: #F8F9FA');
  });

  it('should load saved dark theme preference', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');

    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Wait for theme to load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const testElement = getByTestId('theme-test');
    expect(testElement.props.children).toContain('Theme: dark');
    expect(testElement.props.children).toContain('Background: #0F0F0F');
  });

  it('should handle AsyncStorage errors gracefully', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
      new Error('Storage error')
    );

    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Wait for theme to load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Should fallback to light theme
    const testElement = getByTestId('theme-test');
    expect(testElement.props.children).toContain('Theme: light');
  });
});
