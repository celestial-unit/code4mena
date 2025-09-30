import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { useMascot } from '../../contexts/MascotContext';
import { useTheme } from '../../contexts/ThemeContext';
import { TunisianMascot3D } from './TunisianMascot3D';
import {
  MascotEmotion,
  MascotInteraction,
  MascotAnimation,
} from '../../types/mascot';

interface CelebrationAchievement {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  culturalSignificance?: string;
}

interface MascotAchievementCelebrationProps {
  achievement: CelebrationAchievement | null;
  visible: boolean;
  onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const MascotAchievementCelebration: React.FC<
  MascotAchievementCelebrationProps
> = ({ achievement, visible, onClose }) => {
  const { triggerInteraction } = useMascot();
  const { theme } = useTheme();
  const [showConfetti, setShowConfetti] = useState(false);

  // Animation values
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const mascotScale = useSharedValue(1);
  const confettiOpacity = useSharedValue(0);
  const slideY = useSharedValue(50);

  useEffect(() => {
    if (visible && achievement) {
      // Start celebration animation
      startCelebrationAnimation();

      // Trigger mascot celebration
      const celebrationInteraction: MascotInteraction = {
        trigger: 'achievement',
        emotion: MascotEmotion.CELEBRATING,
        animation: {
          type: 'celebration',
          duration: 3000,
          easing: 'bounce',
        },
        culturalElements: achievement.culturalSignificance
          ? [achievement.culturalSignificance]
          : [],
      };

      triggerInteraction(celebrationInteraction);

      // Show confetti
      setTimeout(() => {
        setShowConfetti(true);
        confettiOpacity.value = withTiming(1, { duration: 500 });
      }, 500);
    } else {
      // Reset animations
      scale.value = 0;
      opacity.value = 0;
      mascotScale.value = 1;
      confettiOpacity.value = 0;
      slideY.value = 50;
      setShowConfetti(false);
    }
  }, [visible, achievement]);

  const startCelebrationAnimation = () => {
    // Main modal animation
    scale.value = withSpring(1, { damping: 8, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 300 });
    slideY.value = withSpring(0, { damping: 10, stiffness: 80 });

    // Mascot celebration animation
    mascotScale.value = withSequence(
      withSpring(1.2, { damping: 6 }),
      withSpring(1.1, { damping: 8 }),
      withSpring(1, { damping: 10 })
    );
  };

  const handleClose = () => {
    // Animate out
    scale.value = withTiming(0, { duration: 200 });
    opacity.value = withTiming(0, { duration: 200 });
    confettiOpacity.value = withTiming(0, { duration: 200 });

    setTimeout(() => {
      runOnJS(onClose)();
    }, 200);
  };

  const getRarityColors = (rarity: CelebrationAchievement['rarity']) => {
    switch (rarity) {
      case 'common':
        return ['#10B981', '#34D399'];
      case 'rare':
        return ['#3B82F6', '#60A5FA'];
      case 'epic':
        return ['#8B5CF6', '#A78BFA'];
      case 'legendary':
        return ['#F59E0B', '#FBBF24'];
      default:
        return [theme.colors.primary, theme.colors.accent];
    }
  };

  const getRarityName = (rarity: CelebrationAchievement['rarity']) => {
    switch (rarity) {
      case 'common':
        return { ar: 'عادي', en: 'Common' };
      case 'rare':
        return { ar: 'نادر', en: 'Rare' };
      case 'epic':
        return { ar: 'ملحمي', en: 'Epic' };
      case 'legendary':
        return { ar: 'أسطوري', en: 'Legendary' };
      default:
        return { ar: 'عادي', en: 'Common' };
    }
  };

  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: slideY.value }] as any,
    opacity: opacity.value,
  }));

  const animatedMascotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: mascotScale.value }],
  }));

  const animatedConfettiStyle = useAnimatedStyle(() => ({
    opacity: confettiOpacity.value,
  }));

  if (!achievement) return null;

  const rarityColors = getRarityColors(achievement.rarity);
  const rarityName = getRarityName(achievement.rarity);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        {/* Confetti Effect */}
        {showConfetti && (
          <Animated.View
            style={[styles.confettiContainer, animatedConfettiStyle]}
          >
            {Array.from({ length: 20 }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.confettiPiece,
                  {
                    left: Math.random() * screenWidth,
                    backgroundColor:
                      rarityColors[
                        Math.floor(Math.random() * rarityColors.length)
                      ],
                  },
                ]}
              />
            ))}
          </Animated.View>
        )}

        <Animated.View style={[styles.modalContainer, animatedModalStyle]}>
          <LinearGradient
            colors={rarityColors as [string, string, ...string[]]}
            style={styles.modalBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Rarity Badge */}
            <View style={styles.rarityBadge}>
              <Text style={styles.rarityText}>
                {rarityName.ar} • {rarityName.en}
              </Text>
            </View>

            {/* Mascot */}
            <Animated.View
              style={[styles.mascotContainer, animatedMascotStyle]}
            >
              <TunisianMascot3D
                size={120}
                showShadow={false}
                interactive={false}
              />
            </Animated.View>

            {/* Achievement Icon */}
            <View style={styles.achievementIconContainer}>
              <LinearGradient
                colors={[
                  'rgba(255, 255, 255, 0.3)',
                  'rgba(255, 255, 255, 0.1)',
                ]}
                style={styles.achievementIconBackground}
              >
                <Ionicons
                  name={achievement.icon as any}
                  size={48}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </View>

            {/* Achievement Details */}
            <View style={styles.achievementDetails}>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.achievementTitleEn}>
                {achievement.titleEn}
              </Text>
              <Text style={styles.achievementDescription}>
                {achievement.description}
              </Text>
              <Text style={styles.achievementDescriptionEn}>
                {achievement.descriptionEn}
              </Text>
            </View>

            {/* Cultural Significance */}
            {achievement.culturalSignificance && (
              <View style={styles.culturalSection}>
                <View style={styles.culturalIcon}>
                  <Ionicons name="star" size={16} color="#FFFFFF" />
                </View>
                <Text style={styles.culturalText}>
                  {achievement.culturalSignificance}
                </Text>
              </View>
            )}

            {/* Celebration Message */}
            <View style={styles.celebrationMessage}>
              <Text style={styles.celebrationText}>
                🎉 أحسنت! لقد حققت إنجازاً جديداً! 🎉
              </Text>
              <Text style={styles.celebrationTextEn}>
                Well done! You've unlocked a new achievement!
              </Text>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[
                  'rgba(255, 255, 255, 0.3)',
                  'rgba(255, 255, 255, 0.2)',
                ]}
                style={styles.actionButtonBackground}
              >
                <Text style={styles.actionButtonText}>متابعة • Continue</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  confettiPiece: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: -10,
  },
  modalContainer: {
    width: screenWidth * 0.9,
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalBackground: {
    padding: 24,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  rarityBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  rarityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mascotContainer: {
    marginBottom: 16,
  },
  achievementIconContainer: {
    marginBottom: 20,
  },
  achievementIconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementDetails: {
    alignItems: 'center',
    marginBottom: 20,
  },
  achievementTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementTitleEn: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 12,
  },
  achievementDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 4,
  },
  achievementDescriptionEn: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
  culturalSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 20,
  },
  culturalIcon: {
    marginRight: 8,
  },
  culturalText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },
  celebrationMessage: {
    alignItems: 'center',
    marginBottom: 24,
  },
  celebrationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  celebrationTextEn: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  actionButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonBackground: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
