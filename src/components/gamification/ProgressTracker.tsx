import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface ProgressLevel {
  level: number;
  title: string;
  titleAr: string;
  minPoints: number;
  maxPoints: number;
  color: string;
  gradient: [string, string];
  icon: string;
  benefits: string[];
  benefitsAr: string[];
}

interface ProgressTrackerProps {
  currentPoints: number;
  currentLevel: ProgressLevel;
  nextLevel?: ProgressLevel;
  streak: number;
  weeklyGoal: number;
  weeklyProgress: number;
  animated?: boolean;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  currentPoints,
  currentLevel,
  nextLevel,
  streak,
  weeklyGoal,
  weeklyProgress,
  animated = true,
}) => {
  const { theme } = useTheme();

  // Animation values
  const progressAnim = useRef(new Animated.Value(0)).current;
  const streakAnim = useRef(new Animated.Value(0)).current;
  const weeklyAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      // Level progress animation
      const levelProgress = nextLevel 
        ? (currentPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)
        : 1;

      Animated.timing(progressAnim, {
        toValue: levelProgress,
        duration: 1500,
        useNativeDriver: false,
      }).start();

      // Streak animation
      Animated.timing(streakAnim, {
        toValue: streak / 30, // Assuming max streak display of 30 days
        duration: 1000,
        useNativeDriver: false,
      }).start();

      // Weekly progress animation
      Animated.timing(weeklyAnim, {
        toValue: weeklyProgress / weeklyGoal,
        duration: 1200,
        useNativeDriver: false,
      }).start();

      // Pulse animation for active elements
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Glow animation for high streaks
      if (streak >= 7) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    } else {
      const levelProgress = nextLevel 
        ? (currentPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)
        : 1;
      
      progressAnim.setValue(levelProgress);
      streakAnim.setValue(streak / 30);
      weeklyAnim.setValue(weeklyProgress / weeklyGoal);
    }
  }, [currentPoints, streak, weeklyProgress, animated]);

  const getStreakColor = () => {
    if (streak >= 30) return ['#FF6B6B', '#FF8E8E'];
    if (streak >= 14) return ['#FF8C00', '#FFA726'];
    if (streak >= 7) return ['#4ECDC4', '#44A08D'];
    if (streak >= 3) return ['#9B59B6', '#BB6BD9'];
    return ['#718096', '#A0AEC0'];
  };

  const getStreakIcon = () => {
    if (streak >= 30) return 'flame';
    if (streak >= 14) return 'flash';
    if (streak >= 7) return 'star';
    if (streak >= 3) return 'heart';
    return 'calendar';
  };

  const getWeeklyProgressColor = () => {
    const percentage = (weeklyProgress / weeklyGoal) * 100;
    if (percentage >= 100) return ['#4CAF50', '#66BB6A'];
    if (percentage >= 75) return ['#4ECDC4', '#44A08D'];
    if (percentage >= 50) return ['#FF8C00', '#FFA726'];
    return ['#E31E24', '#FF4757'];
  };

  return (
    <View style={styles.container}>
      {/* Current Level Display */}
      <View style={styles.levelContainer}>
        <Animated.View
          style={[
            styles.levelBadge,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={currentLevel.gradient as [string, string, ...string[]]}
            style={styles.levelBadgeGradient}
          >
            <Ionicons
              name={currentLevel.icon as any}
              size={32}
              color="#FFFFFF"
            />
            <Text style={styles.levelNumber}>{currentLevel.level}</Text>
          </LinearGradient>
        </Animated.View>

        <View style={styles.levelInfo}>
          <Text style={styles.levelTitle}>{currentLevel.titleAr}</Text>
          <Text style={styles.levelPoints}>
            {currentPoints.toLocaleString()} نقطة
          </Text>
          
          {nextLevel && (
            <View style={styles.nextLevelInfo}>
              <Text style={styles.nextLevelText}>
                المستوى التالي: {nextLevel.titleAr}
              </Text>
              <Text style={styles.pointsToNext}>
                {(nextLevel.minPoints - currentPoints).toLocaleString()} نقطة متبقية
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Level Progress Bar */}
      {nextLevel && (
        <View style={styles.progressContainer}>
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
                colors={nextLevel.gradient as [string, string, ...string[]]}
                style={styles.progressGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </Animated.View>
          </View>

          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>
              {currentLevel.titleAr}
            </Text>
            <Text style={styles.progressLabel}>
              {nextLevel.titleAr}
            </Text>
          </View>
        </View>
      )}

      {/* Stats Row */}
      <View style={styles.statsRow}>
        {/* Streak Display */}
        <View style={styles.statCard}>
          <Animated.View
            style={[
              styles.streakContainer,
              streak >= 7 && {
                shadowOpacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.2, 0.6],
                }),
              },
            ]}
          >
            <LinearGradient
              colors={getStreakColor() as [string, string, ...string[]]}
              style={styles.streakBadge}
            >
              <Ionicons
                name={getStreakIcon() as any}
                size={24}
                color="#FFFFFF"
              />
            </LinearGradient>
          </Animated.View>

          <Text style={styles.statTitle}>سلسلة النشاط</Text>
          <Text style={styles.statValue}>{streak} يوم</Text>

          {/* Streak Progress Ring */}
          <View style={styles.streakRing}>
            <Animated.View
              style={[
                styles.streakProgress,
                {
                  transform: [
                    {
                      rotate: streakAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                },
              ]}
            />
          </View>
        </View>

        {/* Weekly Goal Display */}
        <View style={styles.statCard}>
          <LinearGradient
            colors={getWeeklyProgressColor() as [string, string, ...string[]]}
            style={styles.weeklyBadge}
          >
            <Ionicons
              name="calendar"
              size={24}
              color="#FFFFFF"
            />
          </LinearGradient>

          <Text style={styles.statTitle}>الهدف الأسبوعي</Text>
          <Text style={styles.statValue}>
            {weeklyProgress}/{weeklyGoal}
          </Text>

          {/* Weekly Progress Bar */}
          <View style={styles.weeklyProgressBar}>
            <Animated.View
              style={[
                styles.weeklyProgressFill,
                {
                  width: weeklyAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            >
              <LinearGradient
                colors={getWeeklyProgressColor() as [string, string, ...string[]]}
                style={styles.weeklyProgressGradient}
              />
            </Animated.View>
          </View>

          <Text style={styles.weeklyPercentage}>
            {Math.round((weeklyProgress / weeklyGoal) * 100)}%
          </Text>
        </View>

        {/* Total Points Display */}
        <View style={styles.statCard}>
          <LinearGradient
            colors={['#D4AF37', '#F1C40F'] as [string, string, ...string[]]}
            style={styles.pointsBadge}
          >
            <Ionicons
              name="diamond"
              size={24}
              color="#FFFFFF"
            />
          </LinearGradient>

          <Text style={styles.statTitle}>إجمالي النقاط</Text>
          <Text style={styles.statValue}>
            {currentPoints.toLocaleString()}
          </Text>

          {/* Points Growth Indicator */}
          <View style={styles.pointsGrowth}>
            <Ionicons name="trending-up" size={12} color="#4CAF50" />
            <Text style={styles.growthText}>+125 هذا الأسبوع</Text>
          </View>
        </View>
      </View>

      {/* Level Benefits */}
      {currentLevel.benefitsAr && currentLevel.benefitsAr.length > 0 && (
        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>مزايا المستوى الحالي</Text>
          <View style={styles.benefitsList}>
            {currentLevel.benefitsAr.slice(0, 3).map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <LinearGradient
                  colors={currentLevel.gradient as [string, string, ...string[]]}
                  style={styles.benefitIcon}
                >
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Tunisian Cultural Element */}
      <View style={styles.culturalFooter}>
        <Ionicons name="flag" size={16} color="#E31E24" />
        <Text style={styles.culturalText}>
          🇹🇳 تقدمك في رحلة التعلم القانوني التونسي
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    margin: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  levelBadge: {
    marginRight: 16,
  },
  levelBadgeGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  levelNumber: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: 4,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  levelPoints: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '600',
    marginBottom: 8,
  },
  nextLevelInfo: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  nextLevelText: {
    fontSize: 14,
    color: '#4A5568',
    fontWeight: '600',
    marginBottom: 2,
  },
  pointsToNext: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
  },
  progressGradient: {
    flex: 1,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 16,
    position: 'relative',
  },
  streakContainer: {
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    borderRadius: 20,
  },
  streakBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weeklyBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  pointsBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '700',
    textAlign: 'center',
  },
  streakRing: {
    position: 'absolute',
    top: 8,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  streakProgress: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'transparent',
    borderTopColor: '#FF6B6B',
  },
  weeklyProgressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  weeklyProgressFill: {
    height: '100%',
  },
  weeklyProgressGradient: {
    flex: 1,
  },
  weeklyPercentage: {
    fontSize: 10,
    color: '#718096',
    fontWeight: '600',
    marginTop: 4,
  },
  pointsGrowth: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  growthText: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 2,
  },
  benefitsContainer: {
    marginBottom: 16,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#4A5568',
    fontWeight: '500',
    flex: 1,
  },
  culturalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  culturalText: {
    fontSize: 12,
    color: '#E31E24',
    fontWeight: '600',
    marginLeft: 6,
    textAlign: 'center',
  },
});