import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { useMascot } from '../../contexts/MascotContext';
import { MascotCulturalVariation, MascotEmotion } from '../../types/mascot';

interface Enhanced3DMascotProps {
  size?: number;
  interactive?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

export const Enhanced3DMascot: React.FC<Enhanced3DMascotProps> = ({
  size = 200,
  interactive = true,
}) => {
  const { theme } = useTheme();
  const { mascotState, triggerInteraction } = useMascot();

  // Animation values
  const rotateX = useRef(new Animated.Value(0)).current;
  const rotateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const bounceY = useRef(new Animated.Value(0)).current;
  const shadowOpacity = useRef(new Animated.Value(0.3)).current;
  const eyeScale = useRef(new Animated.Value(1)).current;

  // Gesture handling
  const lastGesture = useRef({ x: 0, y: 0 });

  const handleGesture = (event: any) => {
    if (!interactive) return;

    const { translationX, translationY, state } = event.nativeEvent;

    if (state === State.ACTIVE) {
      const rotateXValue = (translationY / size) * 30;
      const rotateYValue = (translationX / size) * 30;

      Animated.parallel([
        Animated.timing(rotateX, {
          toValue: rotateXValue,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(rotateY, {
          toValue: rotateYValue,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shadowOpacity, {
          toValue: 0.6,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (state === State.END) {
      Animated.parallel([
        Animated.spring(rotateX, {
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.spring(rotateY, {
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.timing(shadowOpacity, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Trigger interaction
      triggerInteraction({
        trigger: 'help',
        emotion: mascotState.currentEmotion,
        animation: {
          type: 'interaction',
          duration: 500,
          easing: 'bounce',
        },
      });
    }
  };

  useEffect(() => {
    // Idle animations
    const idleAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceY, {
            toValue: -5,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(bounceY, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    // Blinking animation
    const blinkAnimation = () => {
      const blink = () => {
        Animated.sequence([
          Animated.timing(eyeScale, {
            toValue: 0.1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(eyeScale, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();

        // Random blink interval
        setTimeout(blink, Math.random() * 3000 + 2000);
      };
      blink();
    };

    idleAnimation();
    blinkAnimation();
  }, []);

  // Emotion-based animations
  useEffect(() => {
    switch (mascotState.currentEmotion) {
      case MascotEmotion.HAPPY:
        Animated.parallel([
          Animated.spring(scale, {
            toValue: 1.1,
            useNativeDriver: true,
          }),
          Animated.timing(bounceY, {
            toValue: -15,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          Animated.parallel([
            Animated.spring(scale, {
              toValue: 1,
              useNativeDriver: true,
            }),
            Animated.spring(bounceY, {
              toValue: 0,
              useNativeDriver: true,
            }),
          ]).start();
        });
        break;

      case MascotEmotion.EXCITED:
        Animated.loop(
          Animated.sequence([
            Animated.timing(rotateY, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(rotateY, {
              toValue: -1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(rotateY, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]),
          { iterations: 3 }
        ).start();
        break;
    }
  }, [mascotState.currentEmotion]);

  const getCulturalColors = () => {
    const { culturalVariation } = mascotState.customization;

    switch (culturalVariation) {
      case MascotCulturalVariation.TRADITIONAL:
        return {
          body: ['#F4A460', '#DEB887'],
          clothing: ['#8B4513', '#A0522D'],
          accent: ['#DAA520', '#FFD700'],
          shadow: '#8B4513',
        };
      case MascotCulturalVariation.MODERN:
        return {
          body: ['#F4A460', '#DEB887'],
          clothing: [theme.colors.primary, theme.colors.primaryLight],
          accent: [theme.colors.accent, theme.colors.accentLight],
          shadow: theme.colors.primary,
        };
      case MascotCulturalVariation.COASTAL:
        return {
          body: ['#F4A460', '#DEB887'],
          clothing: ['#4682B4', '#87CEEB'],
          accent: ['#20B2AA', '#48D1CC'],
          shadow: '#4682B4',
        };
      case MascotCulturalVariation.DESERT:
        return {
          body: ['#DEB887', '#F5DEB3'],
          clothing: ['#CD853F', '#D2B48C'],
          accent: ['#DAA520', '#FFD700'],
          shadow: '#CD853F',
        };
      default:
        return {
          body: ['#F4A460', '#DEB887'],
          clothing: [theme.colors.primary, theme.colors.primaryLight],
          accent: [theme.colors.accent, theme.colors.accentLight],
          shadow: theme.colors.primary,
        };
    }
  };

  const colors = getCulturalColors();

  const rotateXInterpolate = rotateX.interpolate({
    inputRange: [-30, 30],
    outputRange: ['-30deg', '30deg'],
  });

  const rotateYInterpolate = rotateY.interpolate({
    inputRange: [-30, 30],
    outputRange: ['-30deg', '30deg'],
  });

  return (
    <PanGestureHandler
      onGestureEvent={handleGesture}
      onHandlerStateChange={handleGesture}
    >
      <Animated.View style={[styles.container, { width: size, height: size }]}>
        {/* Dynamic Shadow */}
        <Animated.View
          style={[
            styles.shadow,
            {
              width: size * 0.9,
              height: size * 0.3,
              borderRadius: size * 0.45,
              backgroundColor: colors.shadow,
              opacity: shadowOpacity,
              transform: [{ translateY: size * 0.4 }, { scaleX: scale }],
            },
          ]}
        />

        {/* Main Mascot Body */}
        <Animated.View
          style={[
            styles.mascotBody,
            {
              transform: [
                { translateY: bounceY },
                { perspective: 1000 },
                { rotateX: rotateXInterpolate },
                { rotateY: rotateYInterpolate },
                { scale: scale },
              ],
            },
          ]}
        >
          {/* Body Base */}
          <LinearGradient
            colors={colors.body as [string, string, ...string[]]}
            style={[
              styles.bodyBase,
              {
                width: size * 0.7,
                height: size * 0.8,
                borderRadius: size * 0.35,
              },
            ]}
          />

          {/* Clothing Layer */}
          <LinearGradient
            colors={colors.clothing as [string, string, ...string[]]}
            style={[
              styles.clothing,
              {
                width: size * 0.6,
                height: size * 0.7,
                borderRadius: size * 0.3,
                top: size * 0.05,
              },
            ]}
          />

          {/* Head */}
          <LinearGradient
            colors={colors.body as [string, string, ...string[]]}
            style={[
              styles.head,
              {
                width: size * 0.55,
                height: size * 0.55,
                borderRadius: size * 0.275,
                top: -size * 0.2,
              },
            ]}
          />

          {/* Eyes */}
          <Animated.View
            style={[
              styles.leftEye,
              {
                width: size * 0.08,
                height: size * 0.08,
                borderRadius: size * 0.04,
                left: size * 0.3,
                top: size * 0.05,
                transform: [{ scaleY: eyeScale }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.rightEye,
              {
                width: size * 0.08,
                height: size * 0.08,
                borderRadius: size * 0.04,
                right: size * 0.3,
                top: size * 0.05,
                transform: [{ scaleY: eyeScale }],
              },
            ]}
          />

          {/* Nose */}
          <View
            style={[
              styles.nose,
              {
                width: size * 0.03,
                height: size * 0.03,
                borderRadius: size * 0.015,
                top: size * 0.12,
              },
            ]}
          />

          {/* Smile */}
          <View
            style={[
              styles.smile,
              {
                width: size * 0.2,
                height: size * 0.1,
                borderRadius: size * 0.1,
                top: size * 0.18,
                borderWidth: size * 0.01,
              },
            ]}
          />

          {/* Cultural Accessories */}
          {mascotState.customization.accessories.includes('olive_branch') && (
            <LinearGradient
              colors={['#228B22', '#32CD32'] as [string, string, ...string[]]}
              style={[
                styles.oliveBranch,
                {
                  width: size * 0.15,
                  height: size * 0.08,
                  borderRadius: size * 0.04,
                  right: -size * 0.05,
                  top: size * 0.1,
                },
              ]}
            />
          )}

          {/* Traditional Hat (for traditional variation) */}
          {mascotState.customization.culturalVariation ===
            MascotCulturalVariation.TRADITIONAL && (
            <LinearGradient
              colors={colors.accent as [string, string, ...string[]]}
              style={[
                styles.traditionalHat,
                {
                  width: size * 0.6,
                  height: size * 0.15,
                  borderRadius: size * 0.3,
                  top: -size * 0.35,
                },
              ]}
            />
          )}
        </Animated.View>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  shadow: {
    position: 'absolute',
    bottom: 0,
  },
  mascotBody: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bodyBase: {
    position: 'absolute',
  },
  clothing: {
    position: 'absolute',
  },
  head: {
    position: 'absolute',
  },
  leftEye: {
    position: 'absolute',
    backgroundColor: '#333333',
  },
  rightEye: {
    position: 'absolute',
    backgroundColor: '#333333',
  },
  nose: {
    position: 'absolute',
    backgroundColor: '#8B4513',
  },
  smile: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderColor: '#333333',
    borderTopWidth: 0,
  },
  oliveBranch: {
    position: 'absolute',
  },
  traditionalHat: {
    position: 'absolute',
  },
});
