import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
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
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  points: number;
}

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  animated?: boolean;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  size = 'medium',
  showProgress = true,
  animated = true,
}) => {
  const { theme } = useTheme();

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      // Initial appearance animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: achievement.progress / achievement.maxProgress,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]).start();

      // Continuous glow animation for unlocked achievements
      if (achievement.isUnlocked) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    } else {
      scaleAnim.setValue(1);
      progressAnim.setValue(achievement.progress / achievement.maxProgress);
    }
  }, [achievement.progress, achievement.isUnlocked, animated]);

  const getRarityColors = (): [string, string, string] => {
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

  const getCategoryIcon = () => {
    switch (achievement.category) {
      case 'legal':
        return 'library';
      case 'engagement':
        return 'heart';
      case 'learning':
        return 'school';
      case 'community':
        return 'people';
      case 'cultural':
        return 'flag';
      default:
        return 'trophy';
    }
  };

  const getCategoryColors = (): [string, string] => {
    switch (achievement.category) {
      case 'legal':
        return ['#E31E24', '#FF4757'];
      case 'engagement':
        return ['#FF6B6B', '#FF8E8E'];
      case 'learning':
        return ['#4ECDC4', '#44A08D'];
      case 'community':
        return ['#9B59B6', '#BB6BD9'];
      case 'cultural':
        return ['#D4AF37', '#F1C40F'];
      default:
        return ['#718096', '#A0AEC0'];
    }
  };

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return {
          containerSize: 60,
          iconSize: 24,
          fontSize: 10,
          titleSize: 12,
        };
      case 'large':
        return {
          containerSize: 120,
          iconSize: 48,
          fontSize: 16,
          titleSize: 18,
        };
      default: // medium
        return {
          containerSize: 80,
          iconSize: 32,
          fontSize: 12,
          titleSize: 14,
        };
    }
  };

  const rarityColors = getRarityColors();
  const categoryColors = getCategoryColors();
  const sizeConfig = getSizeConfig();

  const progressPercentage =
    (achievement.progress / achievement.maxProgress) * 100;

  return (
    <Animated.View
      style={[
        styles.container,
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
      {/* Glow Effect for Unlocked Achievements */}
      {achievement.isUnlocked && (
        <Animated.View
          style={[
            styles.glowEffect,
            {
              width: sizeConfig.containerSize + 20,
              height: sizeConfig.containerSize + 20,
              borderRadius: (sizeConfig.containerSize + 20) / 2,
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.8],
              }),
            },
          ]}
        >
          <LinearGradient
            colors={rarityColors as [string, string, string]}
            style={[
              styles.glowGradient,
              {
                width: sizeConfig.containerSize + 20,
                height: sizeConfig.containerSize + 20,
                borderRadius: (sizeConfig.containerSize + 20) / 2,
              },
            ]}
          />
        </Animated.View>
      )}

      {/* Main Badge Container */}
      <View
        style={[
          styles.badgeContainer,
          {
            width: sizeConfig.containerSize,
            height: sizeConfig.containerSize,
            borderRadius: sizeConfig.containerSize / 2,
          },
        ]}
      >
        {/* Background Gradient */}
        <LinearGradient
          colors={
            achievement.isUnlocked
              ? (rarityColors as [string, string, string])
              : (['#E2E8F0', '#CBD5E0'] as [string, string, ...string[]])
          }
          style={[
            styles.badgeBackground,
            {
              width: sizeConfig.containerSize,
              height: sizeConfig.containerSize,
              borderRadius: sizeConfig.containerSize / 2,
            },
          ]}
        />

        {/* Progress Ring */}
        {showProgress && !achievement.isUnlocked && (
          <View style={styles.progressContainer}>
            <Animated.View
              style={[
                styles.progressRing,
                {
                  width: sizeConfig.containerSize - 8,
                  height: sizeConfig.containerSize - 8,
                  borderRadius: (sizeConfig.containerSize - 8) / 2,
                  borderWidth: 3,
                  borderColor: 'transparent',
                  borderTopColor: categoryColors[0],
                  transform: [
                    {
                      rotate: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                },
              ]}
            />
          </View>
        )}

        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons
            name={(achievement.icon as any) || (getCategoryIcon() as any)}
            size={sizeConfig.iconSize}
            color={achievement.isUnlocked ? '#FFFFFF' : '#A0AEC0'}
          />
        </View>

        {/* Rarity Indicator */}
        {achievement.isUnlocked && (
          <LinearGradient
            colors={categoryColors as [string, string, ...string[]]}
            style={[
              styles.rarityIndicator,
              {
                width: sizeConfig.containerSize * 0.3,
                height: sizeConfig.containerSize * 0.3,
                borderRadius: (sizeConfig.containerSize * 0.3) / 2,
                bottom: -5,
                right: -5,
              },
            ]}
          >
            <Ionicons
              name="star"
              size={sizeConfig.containerSize * 0.15}
              color="#FFFFFF"
            />
          </LinearGradient>
        )}

        {/* Lock Overlay for Locked Achievements */}
        {!achievement.isUnlocked && (
          <View style={styles.lockOverlay}>
            <Ionicons
              name="lock-closed"
              size={sizeConfig.iconSize * 0.6}
              color="#718096"
            />
          </View>
        )}
      </View>

      {/* Achievement Info */}
      {size !== 'small' && (
        <View style={styles.achievementInfo}>
          <Text
            style={[
              styles.achievementTitle,
              {
                fontSize: sizeConfig.titleSize,
                color: achievement.isUnlocked ? theme.colors.text : '#A0AEC0',
              },
            ]}
            numberOfLines={2}
          >
            {achievement.titleAr}
          </Text>

          {showProgress && (
            <View style={styles.progressInfo}>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                >
                  <LinearGradient
                    colors={categoryColors as [string, string, ...string[]]}
                    style={styles.progressGradient}
                  />
                </Animated.View>
              </View>
              <Text style={styles.progressText}>
                {achievement.progress}/{achievement.maxProgress}
              </Text>
            </View>
          )}

          {achievement.isUnlocked && (
            <View style={styles.pointsBadge}>
              <LinearGradient
                colors={['#D4AF37', '#F1C40F'] as [string, string, ...string[]]}
                style={styles.pointsGradient}
              >
                <Ionicons name="diamond" size={10} color="#FFFFFF" />
                <Text style={styles.pointsText}>+{achievement.points}</Text>
              </LinearGradient>
            </View>
          )}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    margin: 8,
  },
  glowEffect: {
    position: 'absolute',
    top: -10,
    left: -10,
  },
  glowGradient: {
    opacity: 0.3,
  },
  badgeContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  badgeBackground: {
    position: 'absolute',
  },
  progressContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRing: {
    position: 'absolute',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  rarityIndicator: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  lockOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 1000,
    width: '100%',
    height: '100%',
  },
  achievementInfo: {
    marginTop: 8,
    alignItems: 'center',
    maxWidth: 120,
  },
  achievementTitle: {
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },
  progressInfo: {
    marginTop: 6,
    alignItems: 'center',
    width: '100%',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  progressGradient: {
    flex: 1,
  },
  progressText: {
    fontSize: 10,
    color: '#718096',
    marginTop: 2,
    fontWeight: '500',
  },
  pointsBadge: {
    marginTop: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  pointsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pointsText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 3,
  },
});
