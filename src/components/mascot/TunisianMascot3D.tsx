import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Canvas, Group, Circle, Skia } from '@shopify/react-native-skia';
import {
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useMascot } from '../../contexts/MascotContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  MascotEmotion,
  MascotSector,
  MascotCulturalVariation,
} from '../../types/mascot';

interface TunisianMascot3DProps {
  size?: number;
  showShadow?: boolean;
  interactive?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

export const TunisianMascot3D: React.FC<TunisianMascot3DProps> = ({
  size = 200,
  showShadow = true,
  interactive = true,
}) => {
  const { mascotState } = useMascot();
  const { theme } = useTheme();

  // Animation values
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const bounceY = useSharedValue(0);
  const emotionProgress = useSharedValue(0);
  const sectorTransition = useSharedValue(0);

  // Trigger animations based on mascot state changes
  useEffect(() => {
    if (mascotState.isAnimating) {
      // Scale animation for interactions
      scale.value = withSequence(
        withSpring(1.1, { damping: 10 }),
        withSpring(1, { damping: 8 })
      );

      // Emotion-specific animations
      switch (mascotState.currentEmotion) {
        case MascotEmotion.HAPPY:
          bounceY.value = withSequence(
            withSpring(-10, { damping: 8 }),
            withSpring(0, { damping: 6 })
          );
          break;
        case MascotEmotion.EXCITED:
          rotation.value = withSequence(
            withTiming(10, { duration: 200 }),
            withTiming(-10, { duration: 200 }),
            withTiming(0, { duration: 200 })
          );
          break;
        case MascotEmotion.CELEBRATING:
          scale.value = withSequence(
            withSpring(1.2, { damping: 6 }),
            withSpring(1.1, { damping: 8 }),
            withSpring(1, { damping: 10 })
          );
          bounceY.value = withSequence(
            withSpring(-15, { damping: 6 }),
            withSpring(-5, { damping: 8 }),
            withSpring(0, { damping: 10 })
          );
          break;
        case MascotEmotion.THINKING:
          rotation.value = withSequence(
            withTiming(5, { duration: 500 }),
            withTiming(-5, { duration: 500 }),
            withTiming(0, { duration: 500 })
          );
          break;
      }

      emotionProgress.value = withTiming(1, { duration: 500 });
    } else {
      emotionProgress.value = withTiming(0, { duration: 300 });
    }
  }, [mascotState.isAnimating, mascotState.currentEmotion]);

  // Sector change animation
  useEffect(() => {
    sectorTransition.value = withSequence(
      withTiming(1, { duration: 300 }),
      withTiming(0, { duration: 300 })
    );
  }, [mascotState.currentSector]);

  // Get cultural colors based on customization
  const getCulturalColors = () => {
    const { culturalVariation, colorScheme } = mascotState.customization;

    const baseColors = {
      primary: theme.colors.primary,
      accent: theme.colors.accent,
      traditional: '#8B4513',
      gold: '#DAA520',
    };

    switch (culturalVariation) {
      case MascotCulturalVariation.TRADITIONAL:
        return {
          body: '#F4A460',
          clothing: baseColors.traditional,
          accent: baseColors.gold,
          details: '#DC143C',
        };
      case MascotCulturalVariation.MODERN:
        return {
          body: '#F4A460',
          clothing: baseColors.primary,
          accent: baseColors.accent,
          details: theme.colors.info,
        };
      case MascotCulturalVariation.COASTAL:
        return {
          body: '#F4A460',
          clothing: '#4682B4',
          accent: '#20B2AA',
          details: '#FFD700',
        };
      case MascotCulturalVariation.DESERT:
        return {
          body: '#DEB887',
          clothing: '#CD853F',
          accent: '#DAA520',
          details: '#B8860B',
        };
      default:
        return {
          body: '#F4A460',
          clothing: baseColors.primary,
          accent: baseColors.accent,
          details: theme.colors.text,
        };
    }
  };

  const colors = getCulturalColors();

  // Get clothing style for visual variation
  const getClothingRadius = () => {
    const { clothingStyle } = mascotState.customization;
    return clothingStyle === 'traditional' ? 38 : 35;
  };

  // Animation values for transform
  const animatedScale = scale.value;
  const animatedRotation = rotation.value;
  const animatedBounceY = bounceY.value;

  const centerX = size / 2;
  const centerY = size / 2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Canvas style={{ width: size, height: size }}>
        <Group
          transform={[
            { translateX: centerX },
            { translateY: centerY + animatedBounceY },
            { scale: animatedScale },
            { rotateZ: (animatedRotation * Math.PI) / 180 },
            { translateX: -centerX },
            { translateY: -centerY },
          ]}
        >
          {/* Shadow */}
          {showShadow && (
            <Circle
              cx={centerX}
              cy={centerY + 80}
              r={30}
              color="rgba(0, 0, 0, 0.2)"
            />
          )}

          {/* Body */}
          <Circle cx={centerX} cy={centerY} r={40} color={colors.body} />

          {/* Clothing overlay */}
          <Circle
            cx={centerX}
            cy={centerY}
            r={getClothingRadius()}
            color={colors.clothing}
          />

          {/* Head */}
          <Circle cx={centerX} cy={centerY - 60} r={35} color={colors.body} />

          {/* Eyes */}
          <Circle
            cx={centerX - 12}
            cy={centerY - 65}
            r={4}
            color={theme.colors.text}
          />
          <Circle
            cx={centerX + 12}
            cy={centerY - 65}
            r={4}
            color={theme.colors.text}
          />

          {/* Cultural accessories */}
          {mascotState.customization.accessories.includes('olive_branch') && (
            <Group>
              {/* Olive branch - simplified */}
              <Circle
                cx={centerX + 40}
                cy={centerY - 40}
                r={3}
                color="#228B22"
              />
              <Circle
                cx={centerX + 45}
                cy={centerY - 35}
                r={2}
                color="#228B22"
              />
            </Group>
          )}

          {/* Sector-specific elements */}
          {mascotState.currentSector === MascotSector.LEGAL && (
            <Group>
              {/* Legal scales symbol */}
              <Circle
                cx={centerX - 30}
                cy={centerY - 20}
                r={2}
                color={colors.accent}
              />
              <Circle
                cx={centerX + 30}
                cy={centerY - 20}
                r={2}
                color={colors.accent}
              />
            </Group>
          )}
        </Group>
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
