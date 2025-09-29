import React from 'react';
import { View, StyleSheet, Dimensions, ViewStyle } from 'react-native';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  maxWidth?: number;
  padding?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export default function ResponsiveContainer({
  children,
  style,
  maxWidth = 1200,
  padding = 16,
}: ResponsiveContainerProps) {
  const containerWidth = Math.min(screenWidth - padding * 2, maxWidth);
  const isTablet = screenWidth >= 768;
  const isDesktop = screenWidth >= 1024;

  const styles = StyleSheet.create({
    container: {
      width: containerWidth,
      alignSelf: 'center',
      paddingHorizontal: isDesktop ? 24 : isTablet ? 20 : padding,
    },
  });

  return <View style={[styles.container, style]}>{children}</View>;
}

// Hook for responsive breakpoints
export const useResponsive = () => {
  const { width, height } = Dimensions.get('window');

  return {
    width,
    height,
    isPhone: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
    isLandscape: width > height,
    isPortrait: height > width,
  };
};
