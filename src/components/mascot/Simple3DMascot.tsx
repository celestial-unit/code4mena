import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Canvas, Group, Circle, Path, Skia } from '@shopify/react-native-skia';
import { useSharedValue, withSpring, withSequence, withTiming, withRepeat, useDerivedValue } from 'react-native-reanimated';
import { useMascot } from '../../contexts/MascotContext';
import { useTheme } from '../../contexts/ThemeContext';

interface Simple3DMascotProps {
  size?: number;
  interactive?: boolean;
}

export const Simple3DMascot: React.FC<Simple3DMascotProps> = ({
  size = 200,
  interactive = true
}) => {
  const { mascotState } = useMascot();
  const { theme } = useTheme();

  // Animation values for 3D-like effects
  const rotationY = useSharedValue(0);
  const scale = useSharedValue(1);
  const bounceY = useSharedValue(0);
  const shadowScale = useSharedValue(1);
  const earWiggle = useSharedValue(0);
  const tailWag = useSharedValue(0);
  const eyeBlink = useSharedValue(1);

  // Auto-rotation for 3D effect
  useEffect(() => {
    if (interactive) {
      rotationY.value = withRepeat(
        withTiming(360, { duration: 8000 }),
        -1,
        false
      );
    }
  }, [interactive]);

  // Mascot state animations
  useEffect(() => {
    if (mascotState.isAnimating) {
      // Bounce animation
      bounceY.value = withSequence(
        withSpring(-15, { damping: 8 }),
        withSpring(0, { damping: 6 })
      );
      
      // Scale animation
      scale.value = withSequence(
        withSpring(1.1, { damping: 10 }),
        withSpring(1, { damping: 8 })
      );

      // Shadow animation
      shadowScale.value = withSequence(
        withSpring(1.2, { damping: 8 }),
        withSpring(1, { damping: 6 })
      );

      // Ear wiggle
      earWiggle.value = withSequence(
        withTiming(15, { duration: 150 }),
        withTiming(-15, { duration: 150 }),
        withTiming(0, { duration: 150 })
      );

      // Tail wag
      tailWag.value = withSequence(
        withTiming(20, { duration: 200 }),
        withTiming(-20, { duration: 200 }),
        withTiming(0, { duration: 200 })
      );
    }
  }, [mascotState.isAnimating]);

  // Periodic eye blink
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      eyeBlink.value = withSequence(
        withTiming(0.1, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
    }, 3000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Derived values for 3D transformations
  const perspectiveScale = useDerivedValue(() => {
    const rotation = (rotationY.value * Math.PI) / 180;
    return 0.8 + 0.2 * Math.cos(rotation);
  });

  const shadowOpacity = useDerivedValue(() => {
    const rotation = (rotationY.value * Math.PI) / 180;
    return 0.1 + 0.1 * Math.cos(rotation);
  });

  const centerX = size / 2;
  const centerY = size / 2;

  // Create fennec fox paths
  const createFennecPaths = () => {
    // Fennec fox body path
    const bodyPath = Skia.Path.Make();
    bodyPath.addOval({ x: centerX - 35, y: centerY - 10, width: 70, height: 50 });

    // Fennec fox head path
    const headPath = Skia.Path.Make();
    headPath.addOval({ x: centerX - 30, y: centerY - 70, width: 60, height: 50 });

    // Large fennec ears
    const leftEarPath = Skia.Path.Make();
    leftEarPath.moveTo(centerX - 25, centerY - 65);
    leftEarPath.quadTo(centerX - 40, centerY - 90, centerX - 20, centerY - 85);
    leftEarPath.close();

    const rightEarPath = Skia.Path.Make();
    rightEarPath.moveTo(centerX + 25, centerY - 65);
    rightEarPath.quadTo(centerX + 40, centerY - 90, centerX + 20, centerY - 85);
    rightEarPath.close();

    // Tail path
    const tailPath = Skia.Path.Make();
    tailPath.moveTo(centerX + 30, centerY + 10);
    tailPath.quadTo(centerX + 50, centerY - 10, centerX + 45, centerY + 20);
    tailPath.close();

    return { bodyPath, headPath, leftEarPath, rightEarPath, tailPath };
  };

  const paths = createFennecPaths();

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Canvas style={{ width: size, height: size }}>
        <Group
          transform={[
            { translateX: centerX },
            { translateY: centerY + bounceY.value },
            { scale: scale.value * perspectiveScale.value },
            { translateX: -centerX },
            { translateY: -centerY }
          ]}
        >
          {/* Shadow */}
          <Circle
            cx={centerX}
            cy={centerY + 60}
            r={25 * shadowScale.value}
            color={`rgba(0, 0, 0, ${shadowOpacity.value})`}
          />

          {/* Tail with wag animation */}
          <Group
            transform={[
              { translateX: centerX + 30 },
              { translateY: centerY + 10 },
              { rotateZ: (tailWag.value * Math.PI) / 180 },
              { translateX: -(centerX + 30) },
              { translateY: -(centerY + 10) }
            ]}
          >
            <Path path={paths.tailPath} color="#D2691E">
              <Path path={paths.tailPath} color="#F4A460" />
            </Path>
          </Group>

          {/* Body with 3D shading */}
          <Path path={paths.bodyPath} color="#F4A460" />
          <Path path={paths.bodyPath} color="rgba(210, 105, 30, 0.3)" />

          {/* Head with 3D shading */}
          <Path path={paths.headPath} color="#F4A460" />
          <Path path={paths.headPath} color="rgba(210, 105, 30, 0.2)" />

          {/* Large fennec ears with wiggle */}
          <Group
            transform={[
              { translateX: centerX - 25 },
              { translateY: centerY - 65 },
              { rotateZ: (earWiggle.value * Math.PI) / 180 },
              { translateX: -(centerX - 25) },
              { translateY: -(centerY - 65) }
            ]}
          >
            <Path path={paths.leftEarPath} color="#F4A460" />
            <Path path={paths.leftEarPath} color="rgba(210, 105, 30, 0.3)" />
          </Group>

          <Group
            transform={[
              { translateX: centerX + 25 },
              { translateY: centerY - 65 },
              { rotateZ: (-earWiggle.value * Math.PI) / 180 },
              { translateX: -(centerX + 25) },
              { translateY: -(centerY - 65) }
            ]}
          >
            <Path path={paths.rightEarPath} color="#F4A460" />
            <Path path={paths.rightEarPath} color="rgba(210, 105, 30, 0.3)" />
          </Group>

          {/* Eyes with blink animation */}
          <Circle
            cx={centerX - 10}
            cy={centerY - 55}
            r={3 * eyeBlink.value}
            color={theme.colors.text}
          />
          <Circle
            cx={centerX + 10}
            cy={centerY - 55}
            r={3 * eyeBlink.value}
            color={theme.colors.text}
          />

          {/* Nose */}
          <Circle
            cx={centerX}
            cy={centerY - 45}
            r={2}
            color="#8B4513"
          />

          {/* Tunisian cultural elements */}
          <Circle
            cx={centerX}
            cy={centerY - 20}
            r={8}
            color={theme.colors.primary}
          />
          <Circle
            cx={centerX}
            cy={centerY - 20}
            r={5}
            color="#DAA520"
          />
        </Group>
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});