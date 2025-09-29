import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useMascot } from '../../contexts/MascotContext';
import { MascotCulturalVariation } from '../../types/mascot';

interface SimpleMascotProps {
  size?: number;
}

export const SimpleMascot: React.FC<SimpleMascotProps> = ({ size = 100 }) => {
  const { theme } = useTheme();
  const { mascotState } = useMascot();
  
  // Animation values
  const bounceAnim = new Animated.Value(1);
  const rotateAnim = new Animated.Value(0);

  useEffect(() => {
    // Gentle breathing animation
    const breathe = () => {
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start(() => breathe());
    };

    // Subtle head tilt animation
    const tilt = () => {
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: -1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]).start(() => tilt());
    };

    breathe();
    tilt();
  }, []);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-3deg', '3deg'],
  });

  const getCulturalColors = () => {
    const { culturalVariation } = mascotState.customization;
    
    switch (culturalVariation) {
      case MascotCulturalVariation.TRADITIONAL:
        return {
          body: '#F4A460',
          clothing: '#8B4513',
          accent: '#DAA520',
        };
      case MascotCulturalVariation.MODERN:
        return {
          body: '#F4A460',
          clothing: theme.colors.primary,
          accent: theme.colors.accent,
        };
      default:
        return {
          body: '#F4A460',
          clothing: theme.colors.primary,
          accent: theme.colors.accent,
        };
    }
  };

  const colors = getCulturalColors();
  const radius = size / 2;

  return (
    <Animated.View style={[
      styles.container, 
      { 
        width: size, 
        height: size,
        transform: [
          { scale: bounceAnim },
          { rotate: rotateInterpolate }
        ]
      }
    ]}>
      {/* Shadow */}
      <View style={[
        styles.shadow,
        {
          width: size * 0.8,
          height: size * 0.2,
          borderRadius: size * 0.4,
          bottom: -size * 0.1,
        }
      ]} />
      
      {/* Body */}
      <View style={[
        styles.body,
        {
          width: size * 0.6,
          height: size * 0.6,
          borderRadius: size * 0.3,
          backgroundColor: colors.body,
          top: size * 0.2,
        }
      ]} />
      
      {/* Clothing */}
      <View style={[
        styles.clothing,
        {
          width: size * 0.5,
          height: size * 0.5,
          borderRadius: size * 0.25,
          backgroundColor: colors.clothing,
          top: size * 0.25,
        }
      ]} />
      
      {/* Head */}
      <View style={[
        styles.head,
        {
          width: size * 0.5,
          height: size * 0.5,
          borderRadius: size * 0.25,
          backgroundColor: colors.body,
          top: -size * 0.1,
        }
      ]} />
      
      {/* Eyes */}
      <View style={[
        styles.leftEye,
        {
          width: size * 0.06,
          height: size * 0.06,
          borderRadius: size * 0.03,
          left: size * 0.35,
          top: size * 0.05,
        }
      ]} />
      <View style={[
        styles.rightEye,
        {
          width: size * 0.06,
          height: size * 0.06,
          borderRadius: size * 0.03,
          right: size * 0.35,
          top: size * 0.05,
        }
      ]} />
      
      {/* Smile */}
      <View style={[
        styles.smile,
        {
          width: size * 0.15,
          height: size * 0.08,
          borderRadius: size * 0.075,
          top: size * 0.15,
        }
      ]} />
    </Animated.View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  body: {
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
  smile: {
    position: 'absolute',
    backgroundColor: '#333333',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
});