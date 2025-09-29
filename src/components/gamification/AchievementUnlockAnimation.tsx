import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../contexts/ThemeContext';

interface Achievement {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  category: 'legal' | 'engagement' | 'learning' | 'community' | 'cultural';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
}

interface AchievementUnlockAnimationProps {
  achievement: Achievement | null;
  visible: boolean;
  onComplete: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const AchievementUnlockAnimation: React.FC<AchievementUnlockAnimationProps> = ({
  achievement,
  visible,
  onComplete,
}) => {
  const { theme } = useTheme();

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const textSlideAnim = useRef(new Animated.Value(50)).current;
  const textOpacityAnim = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(
    Array.from({ length: 12 }, () => ({
      scale: new Animated.Value(0),
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current;
  const rayAnims = useRef(
    Array.from({ length: 8 }, () => ({
      scale: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    if (visible && achievement) {
      startUnlockAnimation();
    } else {
      resetAnimation();
    }
  }, [visible, achievement]);

  const startUnlockAnimation = () => {
    // Reset all animations
    resetAnimation();

    // Start the unlock sequence
    Animated.sequence([
      // Phase 1: Badge appears with scale and glow
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),

      // Phase 2: Particles explosion
      Animated.parallel([
        ...particleAnims.map((anim, index) => {
          const angle = (index / particleAnims.length) * 2 * Math.PI;
          const distance = 100 + Math.random() * 50;
          
          return Animated.parallel([
            Animated.timing(anim.scale, {
              toValue: 1,
              duration: 300,
              delay: index * 50,
              useNativeDriver: true,
            }),
            Animated.timing(anim.translateX, {
              toValue: Math.cos(angle) * distance,
              duration: 1000,
              delay: index * 50,
              useNativeDriver: true,
            }),
            Animated.timing(anim.translateY, {
              toValue: Math.sin(angle) * distance,
              duration: 1000,
              delay: index * 50,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(anim.opacity, {
                toValue: 1,
                duration: 300,
                delay: index * 50,
                useNativeDriver: true,
              }),
              Animated.timing(anim.opacity, {
                toValue: 0,
                duration: 700,
                useNativeDriver: true,
              }),
            ]),
          ]);
        }),

        // Rays animation
        ...rayAnims.map((anim, index) => {
          return Animated.parallel([
            Animated.timing(anim.scale, {
              toValue: 1,
              duration: 600,
              delay: 200 + index * 100,
              useNativeDriver: true,
            }),
            Animated.timing(anim.rotate, {
              toValue: 1,
              duration: 2000,
              delay: 200 + index * 100,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(anim.opacity, {
                toValue: 0.8,
                duration: 300,
                delay: 200 + index * 100,
                useNativeDriver: true,
              }),
              Animated.timing(anim.opacity, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
              }),
            ]),
          ]);
        }),
      ]),

      // Phase 3: Text appears
      Animated.parallel([
        Animated.spring(textSlideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacityAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),

      // Phase 4: Hold for viewing
      Animated.delay(2000),

      // Phase 5: Fade out
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacityAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      onComplete();
    });
  };

  const resetAnimation = () => {
    scaleAnim.setValue(0);
    rotateAnim.setValue(0);
    glowAnim.setValue(0);
    textSlideAnim.setValue(50);
    textOpacityAnim.setValue(0);
    
    particleAnims.forEach(anim => {
      anim.scale.setValue(0);
      anim.translateX.setValue(0);
      anim.translateY.setValue(0);
      anim.opacity.setValue(0);
    });

    rayAnims.forEach(anim => {
      anim.scale.setValue(0);
      anim.rotate.setValue(0);
      anim.opacity.setValue(0);
    });
  };

  const getRarityColors = (): [string, string, string] => {
    if (!achievement) return ['#718096', '#A0AEC0', '#CBD5E0'];
    
    switch (achievement.rarity) {
      case 'common':
        return ['#718096', '#A0AEC0', '#CBD5E0'];
      case 'rare':
        return ['#3182CE', '#4299E1', '#63B3ED'];
      case 'epic':
        return ['#805AD5', '#9F7AEA', '#B794F6'];
      case 'legendary':
        return ['#D69E2E', '#F6E05E', '#FAF089'];
      default:
        return ['#718096', '#A0AEC0', '#CBD5E0'];
    }
  };

  const getCategoryColors = (): [string, string] => {
    if (!achievement) return ['#718096', '#A0AEC0'];
    
    switch (achievement.category) {
      case 'legal': return ['#E31E24', '#FF4757'];
      case 'engagement': return ['#FF6B6B', '#FF8E8E'];
      case 'learning': return ['#4ECDC4', '#44A08D'];
      case 'community': return ['#9B59B6', '#BB6BD9'];
      case 'cultural': return ['#D4AF37', '#F1C40F'];
      default: return ['#718096', '#A0AEC0'];
    }
  };

  const getRarityTitle = () => {
    if (!achievement) return '';
    
    switch (achievement.rarity) {
      case 'common': return 'إنجاز عادي';
      case 'rare': return 'إنجاز نادر';
      case 'epic': return 'إنجاز ملحمي';
      case 'legendary': return 'إنجاز أسطوري';
      default: return 'إنجاز';
    }
  };

  if (!achievement) return null;

  const rarityColors = getRarityColors();
  const categoryColors = getCategoryColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <BlurView intensity={20} style={styles.overlay}>
        <View style={styles.container}>
          {/* Background Rays */}
          {rayAnims.map((anim, index) => (
            <Animated.View
              key={`ray-${index}`}
              style={[
                styles.ray,
                {
                  transform: [
                    { scale: anim.scale },
                    {
                      rotate: anim.rotate.interpolate({
                        inputRange: [0, 1],
                        outputRange: [`${index * 45}deg`, `${index * 45 + 360}deg`],
                      }),
                    },
                  ],
                  opacity: anim.opacity,
                },
              ]}
            >
              <LinearGradient
                colors={[rarityColors[0], 'transparent'] as [string, string, ...string[]]}
                style={styles.rayGradient}
              />
            </Animated.View>
          ))}

          {/* Particles */}
          {particleAnims.map((anim, index) => (
            <Animated.View
              key={`particle-${index}`}
              style={[
                styles.particle,
                {
                  transform: [
                    { scale: anim.scale },
                    { translateX: anim.translateX },
                    { translateY: anim.translateY },
                  ],
                  opacity: anim.opacity,
                },
              ]}
            >
              <LinearGradient
                colors={categoryColors as [string, string, ...string[]]}
                style={styles.particleGradient}
              >
                <Ionicons
                  name={index % 2 === 0 ? 'star' : 'diamond'}
                  size={12}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </Animated.View>
          ))}

          {/* Main Achievement Badge */}
          <Animated.View
            style={[
              styles.achievementContainer,
              {
                transform: [
                  { scale: scaleAnim },
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Glow Effect */}
            <Animated.View
              style={[
                styles.glowEffect,
                {
                  opacity: glowAnim,
                  transform: [
                    {
                      scale: glowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1.2],
                      }),
                    },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={[rarityColors[0], rarityColors[1], rarityColors[2]] as [string, string, string]}
                style={styles.glowGradient}
              />
            </Animated.View>

            {/* Badge */}
            <LinearGradient
              colors={rarityColors as [string, string, string]}
              style={styles.badge}
            >
              <Ionicons
                name={achievement.icon as any}
                size={64}
                color="#FFFFFF"
              />
            </LinearGradient>

            {/* Category Indicator */}
            <LinearGradient
              colors={categoryColors as [string, string, ...string[]]}
              style={styles.categoryIndicator}
            >
              <Ionicons name="star" size={20} color="#FFFFFF" />
            </LinearGradient>
          </Animated.View>

          {/* Achievement Text */}
          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: textOpacityAnim,
                transform: [{ translateY: textSlideAnim }],
              },
            ]}
          >
            <Text style={styles.unlockText}>تم فتح إنجاز جديد!</Text>
            <Text style={styles.rarityText}>{getRarityTitle()}</Text>
            <Text style={styles.achievementTitle}>{achievement.titleAr}</Text>
            <Text style={styles.achievementDescription}>
              {achievement.descriptionAr}
            </Text>

            {/* Points Badge */}
            <LinearGradient
              colors={['#D4AF37', '#F1C40F'] as [string, string, ...string[]]}
              style={styles.pointsBadge}
            >
              <Ionicons name="diamond" size={16} color="#FFFFFF" />
              <Text style={styles.pointsText}>+{achievement.points} نقطة</Text>
            </LinearGradient>

            {/* Tunisian Cultural Elements */}
            <View style={styles.culturalElements}>
              <Ionicons name="flag" size={16} color="#E31E24" />
              <Text style={styles.culturalText}>🇹🇳 إنجاز تونسي أصيل</Text>
            </View>
          </Animated.View>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  ray: {
    position: 'absolute',
    width: 200,
    height: 4,
  },
  rayGradient: {
    flex: 1,
    borderRadius: 2,
  },
  particle: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  particleGradient: {
    flex: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowEffect: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  glowGradient: {
    flex: 1,
    borderRadius: 100,
    opacity: 0.6,
  },
  badge: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  categoryIndicator: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 40,
  },
  unlockText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  rarityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 16,
    textAlign: 'center',
  },
  achievementTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 28,
  },
  achievementDescription: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  pointsText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 6,
  },
  culturalElements: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(227, 30, 36, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(227, 30, 36, 0.2)',
  },
  culturalText: {
    fontSize: 12,
    color: '#E31E24',
    fontWeight: '600',
    marginLeft: 6,
  },
});