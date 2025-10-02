import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useMascot } from '../../contexts/MascotContext';
import { MascotCulturalVariation, MascotEmotion, MascotSector } from '../../types/mascot';

interface TunisianLegalMascotProps {
  size?: number;
  interactive?: boolean;
  sector?: MascotSector;
}

export const TunisianLegalMascot: React.FC<TunisianLegalMascotProps> = ({ 
  size = 200, 
  interactive = true,
  sector 
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
  const earWiggle = useRef(new Animated.Value(0)).current;

  const currentSector = sector || mascotState.currentSector;

  useEffect(() => {
    // Idle breathing animation
    const breathe = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceY, {
            toValue: -3,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(bounceY, {
            toValue: 0,
            duration: 2500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    // Ear wiggling animation
    const wiggleEars = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(earWiggle, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(earWiggle, {
            toValue: -1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(earWiggle, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    // Blinking animation
    const blink = () => {
      const doBlink = () => {
        Animated.sequence([
          Animated.timing(eyeScale, {
            toValue: 0.1,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(eyeScale, {
            toValue: 1,
            duration: 80,
            useNativeDriver: true,
          }),
        ]).start();
        
        setTimeout(doBlink, Math.random() * 4000 + 2000);
      };
      doBlink();
    };

    breathe();
    wiggleEars();
    blink();
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
            duration: 400,
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
            Animated.timing(earWiggle, {
              toValue: 1.5,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(earWiggle, {
              toValue: -1.5,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
          { iterations: 4 }
        ).start();
        break;
    }
  }, [mascotState.currentEmotion]);

  const getSectorOutfit = () => {
    switch (currentSector) {
      case MascotSector.BUSINESS:
        return {
          clothing: '#1E3A8A', // Navy blue suit
          vest: '#1E40AF',
          accent: '#F59E0B', // Gold accents
          accessory: 'briefcase',
          accessoryColor: '#8B4513',
        };
      case MascotSector.LEGAL:
        return {
          clothing: '#1F2937', // Black robe
          vest: '#374151',
          accent: '#D4AF37', // Gold trim
          accessory: 'library',
          accessoryColor: '#8B4513',
        };
      case MascotSector.ADMINISTRATIVE:
        return {
          clothing: '#065F46', // Dark green vest
          vest: '#047857',
          accent: '#10B981', // Light green
          accessory: 'document-text',
          accessoryColor: '#FFFFFF',
        };
      case MascotSector.FAMILY:
        return {
          clothing: '#7C3AED', // Purple traditional vest
          vest: '#8B5CF6',
          accent: '#F472B6', // Pink flowers
          accessory: 'heart',
          accessoryColor: '#EF4444',
        };
      case MascotSector.LABOR:
        return {
          clothing: '#EA580C', // Orange safety vest
          vest: '#FB923C',
          accent: '#3B82F6', // Blue reflective strips
          accessory: 'construct',
          accessoryColor: '#FCD34D',
        };
      default:
        return {
          clothing: '#1E40AF', // Default blue
          vest: '#3B82F6',
          accent: '#F59E0B',
          accessory: 'library',
          accessoryColor: '#8B4513',
        };
    }
  };

  const outfit = getSectorOutfit();

  const handleGesture = (event: any) => {
    if (!interactive) return;
    
    const { translationX, translationY, state } = event.nativeEvent;
    
    if (state === State.ACTIVE) {
      const rotateXValue = (translationY / size) * 20;
      const rotateYValue = (translationX / size) * 20;
      
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
      
      triggerInteraction({
        trigger: 'help',
        emotion: mascotState.currentEmotion,
        animation: {
          type: 'interaction',
          duration: 500,
          easing: 'bounce'
        }
      });
    }
  };

  const rotateXInterpolate = rotateX.interpolate({
    inputRange: [-20, 20],
    outputRange: ['-20deg', '20deg'],
  });

  const rotateYInterpolate = rotateY.interpolate({
    inputRange: [-20, 20],
    outputRange: ['-20deg', '20deg'],
  });

  const earWiggleInterpolate = earWiggle.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-5deg', '5deg'],
  });

  return (
    <PanGestureHandler onGestureEvent={handleGesture} onHandlerStateChange={handleGesture}>
      <Animated.View style={[styles.container, { width: size, height: size }]}>
        {/* Shadow */}
        <Animated.View
          style={[
            styles.shadow,
            {
              width: size * 0.7,
              height: size * 0.2,
              borderRadius: size * 0.35,
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              opacity: shadowOpacity,
              transform: [
                { translateY: size * 0.4 },
                { scaleX: scale },
              ],
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
          {/* Body Base - Cream colored */}
          <View
            style={[
              styles.bodyBase,
              {
                width: size * 0.5,
                height: size * 0.6,
                borderRadius: size * 0.25,
                backgroundColor: '#FEF3E2',
                top: size * 0.15,
              },
            ]}
          />

          {/* Clothing/Vest */}
          <LinearGradient
            colors={[outfit.clothing, outfit.vest] as [string, string, ...string[]]}
            style={[
              styles.clothing,
              {
                width: size * 0.45,
                height: size * 0.4,
                borderRadius: size * 0.05,
                top: size * 0.25,
              },
            ]}
          />

          {/* Traditional Tunisian Pattern on clothing */}
          <View style={[
            styles.traditionalPattern,
            {
              width: size * 0.4,
              height: size * 0.08,
              top: size * 0.55,
              backgroundColor: 'rgba(212, 175, 55, 0.3)',
              borderRadius: size * 0.02,
            },
          ]}>
            {/* Diamond pattern */}
            {[...Array(5)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.diamond,
                  {
                    width: size * 0.02,
                    height: size * 0.02,
                    left: (i * size * 0.07) + size * 0.03,
                    top: size * 0.03,
                    backgroundColor: '#D4AF37',
                    transform: [{ rotate: '45deg' }],
                  },
                ]}
              />
            ))}
          </View>

          {/* Head - Orange fennec fox */}
          <LinearGradient
            colors={['#F97316', '#FB923C'] as [string, string, ...string[]]}
            style={[
              styles.head,
              {
                width: size * 0.45,
                height: size * 0.35,
                borderRadius: size * 0.225,
                top: -size * 0.05,
              },
            ]}
          />

          {/* White chest/muzzle area */}
          <View
            style={[
              styles.whiteMuzzle,
              {
                width: size * 0.35,
                height: size * 0.25,
                borderRadius: size * 0.175,
                backgroundColor: '#FFFFFF',
                top: size * 0.05,
              },
            ]}
          />

          {/* Large Fennec Ears with white inner */}
          <Animated.View
            style={[
              styles.leftEar,
              {
                transform: [{ rotate: earWiggleInterpolate }],
              },
            ]}
          >
            {/* Outer ear */}
            <LinearGradient
              colors={['#EA580C', '#F97316'] as [string, string, ...string[]]}
              style={[
                styles.earOuter,
                {
                  width: size * 0.2,
                  height: size * 0.3,
                  borderRadius: size * 0.1,
                  left: size * 0.18,
                  top: -size * 0.15,
                },
              ]}
            />
            {/* Inner ear - white with pink */}
            <LinearGradient
              colors={['#FFFFFF', '#FED7D7'] as [string, string, ...string[]]}
              style={[
                styles.earInner,
                {
                  width: size * 0.12,
                  height: size * 0.2,
                  borderRadius: size * 0.06,
                  left: size * 0.22,
                  top: -size * 0.1,
                },
              ]}
            />
            {/* White decorative pattern in ear */}
            <View
              style={[
                styles.earPattern,
                {
                  width: size * 0.06,
                  height: size * 0.12,
                  left: size * 0.25,
                  top: -size * 0.08,
                  backgroundColor: '#FFFFFF',
                },
              ]}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.rightEar,
              {
                transform: [{ rotate: earWiggleInterpolate }],
              },
            ]}
          >
            {/* Outer ear */}
            <LinearGradient
              colors={['#EA580C', '#F97316'] as [string, string, ...string[]]}
              style={[
                styles.earOuter,
                {
                  width: size * 0.2,
                  height: size * 0.3,
                  borderRadius: size * 0.1,
                  right: size * 0.18,
                  top: -size * 0.15,
                },
              ]}
            />
            {/* Inner ear */}
            <LinearGradient
              colors={['#FFFFFF', '#FED7D7'] as [string, string, ...string[]]}
              style={[
                styles.earInner,
                {
                  width: size * 0.12,
                  height: size * 0.2,
                  borderRadius: size * 0.06,
                  right: size * 0.22,
                  top: -size * 0.1,
                },
              ]}
            />
            {/* White decorative pattern in ear */}
            <View
              style={[
                styles.earPattern,
                {
                  width: size * 0.06,
                  height: size * 0.12,
                  right: size * 0.25,
                  top: -size * 0.08,
                  backgroundColor: '#FFFFFF',
                },
              ]}
            />
          </Animated.View>

          {/* Traditional Red Fez Hat */}
          <LinearGradient
            colors={['#DC2626', '#EF4444'] as [string, string, ...string[]]}
            style={[
              styles.fezHat,
              {
                width: size * 0.35,
                height: size * 0.15,
                borderRadius: size * 0.02,
                top: -size * 0.18,
              },
            ]}
          />

          {/* Fez pattern band */}
          <View
            style={[
              styles.fezBand,
              {
                width: size * 0.35,
                height: size * 0.03,
                backgroundColor: '#7C2D12',
                top: -size * 0.08,
              },
            ]}
          >
            {/* Traditional pattern on band */}
            {[...Array(8)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.bandPattern,
                  {
                    width: size * 0.01,
                    height: size * 0.01,
                    left: (i * size * 0.04) + size * 0.02,
                    top: size * 0.01,
                    backgroundColor: '#D4AF37',
                  },
                ]}
              />
            ))}
          </View>

          {/* Fez Tassel */}
          <View
            style={[
              styles.fezTassel,
              {
                width: size * 0.02,
                height: size * 0.08,
                backgroundColor: '#1F2937',
                right: size * 0.15,
                top: -size * 0.18,
                borderRadius: size * 0.01,
              },
            ]}
          />

          {/* Eyes - Large and expressive */}
          <Animated.View
            style={[
              styles.leftEye,
              {
                width: size * 0.08,
                height: size * 0.08,
                borderRadius: size * 0.04,
                left: size * 0.3,
                top: size * 0.08,
                backgroundColor: '#FFFFFF',
                transform: [{ scaleY: eyeScale }],
              },
            ]}
          >
            {/* Eye pupil */}
            <View
              style={[
                styles.eyePupil,
                {
                  width: size * 0.05,
                  height: size * 0.05,
                  borderRadius: size * 0.025,
                  backgroundColor: '#8B4513',
                  top: size * 0.015,
                  left: size * 0.015,
                },
              ]}
            />
            {/* Eye shine */}
            <View
              style={[
                styles.eyeShine,
                {
                  width: size * 0.015,
                  height: size * 0.015,
                  borderRadius: size * 0.0075,
                  backgroundColor: '#FFFFFF',
                  top: size * 0.025,
                  left: size * 0.035,
                },
              ]}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.rightEye,
              {
                width: size * 0.08,
                height: size * 0.08,
                borderRadius: size * 0.04,
                right: size * 0.3,
                top: size * 0.08,
                backgroundColor: '#FFFFFF',
                transform: [{ scaleY: eyeScale }],
              },
            ]}
          >
            {/* Eye pupil */}
            <View
              style={[
                styles.eyePupil,
                {
                  width: size * 0.05,
                  height: size * 0.05,
                  borderRadius: size * 0.025,
                  backgroundColor: '#8B4513',
                  top: size * 0.015,
                  left: size * 0.015,
                },
              ]}
            />
            {/* Eye shine */}
            <View
              style={[
                styles.eyeShine,
                {
                  width: size * 0.015,
                  height: size * 0.015,
                  borderRadius: size * 0.0075,
                  backgroundColor: '#FFFFFF',
                  top: size * 0.025,
                  left: size * 0.02,
                },
              ]}
            />
          </Animated.View>

          {/* Nose */}
          <View
            style={[
              styles.nose,
              {
                width: size * 0.025,
                height: size * 0.02,
                borderRadius: size * 0.01,
                backgroundColor: '#8B4513',
                top: size * 0.13,
              },
            ]}
          />

          {/* Mouth - Happy smile */}
          <View
            style={[
              styles.mouth,
              {
                width: size * 0.08,
                height: size * 0.04,
                borderRadius: size * 0.04,
                top: size * 0.15,
                borderWidth: size * 0.005,
                borderColor: '#8B4513',
                borderTopWidth: 0,
                backgroundColor: '#FF6B6B',
              },
            ]}
          />

          {/* Sector-specific accessory */}
          <View
            style={[
              styles.accessory,
              {
                right: -size * 0.1,
                top: size * 0.2,
              },
            ]}
          >
            <Ionicons
              name={outfit.accessory as any}
              size={size * 0.15}
              color={outfit.accessoryColor}
            />
          </View>

          {/* Sector indicator badge */}
          <LinearGradient
            colors={[outfit.clothing, outfit.accent] as [string, string, ...string[]]}
            style={[
              styles.sectorBadge,
              {
                width: size * 0.08,
                height: size * 0.08,
                borderRadius: size * 0.04,
                right: size * 0.05,
                top: size * 0.35,
              },
            ]}
          >
            <Ionicons
              name="star"
              size={size * 0.04}
              color="#FFFFFF"
            />
          </LinearGradient>
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
  traditionalPattern: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
  },
  diamond: {
    position: 'absolute',
  },
  head: {
    position: 'absolute',
  },
  whiteMuzzle: {
    position: 'absolute',
  },
  leftEar: {
    position: 'absolute',
  },
  rightEar: {
    position: 'absolute',
  },
  earOuter: {
    position: 'absolute',
  },
  earInner: {
    position: 'absolute',
  },
  earPattern: {
    position: 'absolute',
  },
  fezHat: {
    position: 'absolute',
  },
  fezBand: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
  },
  bandPattern: {
    position: 'absolute',
  },
  fezTassel: {
    position: 'absolute',
  },
  leftEye: {
    position: 'absolute',
  },
  rightEye: {
    position: 'absolute',
  },
  eyePupil: {
    position: 'absolute',
  },
  eyeShine: {
    position: 'absolute',
  },
  nose: {
    position: 'absolute',
  },
  mouth: {
    position: 'absolute',
  },
  accessory: {
    position: 'absolute',
  },
  sectorBadge: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});