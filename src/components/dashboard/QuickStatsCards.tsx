import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withSequence,
  interpolate,
} from 'react-native-reanimated';

// Types
import { User } from '../../types';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - 48) / 2; // 16px margin on each side, 16px gap between cards

interface QuickStatsCardsProps {
  user: User | null;
  onStatsPress: (category: string) => void;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
  gradientColors: readonly [string, string, ...string[]];
  delay: number;
  onPress: () => void;
  suffix?: string;
  animated?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  gradientColors,
  delay,
  onPress,
  suffix = '',
  animated = true,
}) => {
  const animatedValue = useSharedValue(0);
  const scaleValue = useSharedValue(1);

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: interpolate(animatedValue.value, [0, 1], [0, 1]),
  }));

  const animatedNumberStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(animatedValue.value, [0, 1], [20, 0]),
      },
    ],
    opacity: interpolate(animatedValue.value, [0, 1], [0, 1]),
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  useEffect(() => {
    if (animated) {
      animatedValue.value = withDelay(delay, withTiming(1, { duration: 800 }));
    } else {
      animatedValue.value = 1;
    }
  }, [animated, delay]);

  const handlePress = () => {
    scaleValue.value = withSequence(
      withSpring(0.95, { duration: 100 }),
      withSpring(1, { duration: 100 })
    );
    onPress();
  };

  // Animate counter
  const displayValue = animated
    ? Math.round(value * animatedValue.value)
    : value;

  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(600).springify()}
      style={[cardStyle, { width: cardWidth }]}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.9}
        style={styles.cardContainer}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: color }]}>
            <Ionicons name={icon as any} size={24} color="#FFFFFF" />
          </View>

          {/* Content */}
          <View style={styles.cardContent}>
            <Animated.Text style={[styles.cardTitle, animatedTextStyle]}>
              {title}
            </Animated.Text>

            <Animated.View style={[styles.valueContainer, animatedNumberStyle]}>
              <Text style={styles.cardValue}>
                {displayValue.toLocaleString()}
                {suffix}
              </Text>
            </Animated.View>
          </View>

          {/* Decorative elements */}
          <View style={styles.decorativeCircle} />
          <View style={styles.decorativeAccent} />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const QuickStatsCards: React.FC<QuickStatsCardsProps> = ({
  user,
  onStatsPress,
}) => {
  if (!user) return null;

  const language = user.preferences?.language || 'ar';
  const stats = user.statistics;

  const getLocalizedText = (ar: string, fr: string, en: string) => {
    switch (language) {
      case 'ar':
        return ar;
      case 'fr':
        return fr;
      default:
        return en;
    }
  };

  const statsData = [
    {
      title: getLocalizedText(
        'التحديثات المقروءة',
        'Mises à jour lues',
        'Updates Read'
      ),
      value: stats.totalLegalUpdatesRead,
      icon: 'document-text',
      color: '#E31E24',
      gradientColors: ['#FFFFFF', '#FFF5F5'] as const,
      category: 'updates',
    },
    {
      title: getLocalizedText('المحادثات', 'Conversations', 'Conversations'),
      value: stats.totalChatConversations,
      icon: 'chatbubbles',
      color: '#D4AF37',
      gradientColors: ['#FFFFFF', '#FFFBF0'] as const,
      category: 'chats',
    },
    {
      title: getLocalizedText('عمليات البحث', 'Recherches', 'Searches'),
      value: stats.totalSearchQueries,
      icon: 'search',
      color: '#2E8B57',
      gradientColors: ['#FFFFFF', '#F0FFF4'] as const,
      category: 'searches',
    },
    {
      title: getLocalizedText('الإنجازات', 'Réalisations', 'Achievements'),
      value: stats.totalAchievements,
      icon: 'trophy',
      color: '#FF8C00',
      gradientColors: ['#FFFFFF', '#FFF8F0'] as const,
      category: 'achievements',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Section header */}
      <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
        <Text style={styles.sectionTitle}>
          {getLocalizedText(
            'إحصائياتك السريعة',
            'Vos statistiques rapides',
            'Your Quick Stats'
          )}
        </Text>
        <Text style={styles.sectionSubtitle}>
          {getLocalizedText(
            'نشاطك هذا الشهر',
            'Votre activité ce mois',
            'Your activity this month'
          )}
        </Text>
      </Animated.View>

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        {statsData.map((stat, index) => (
          <StatCard
            key={stat.category}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            gradientColors={stat.gradientColors}
            delay={index * 150}
            onPress={() => onStatsPress(stat.category)}
          />
        ))}
      </View>

      {/* Activity streak */}
      <Animated.View
        entering={FadeInUp.delay(600).duration(600)}
        style={styles.streakContainer}
      >
        <LinearGradient
          colors={['#E31E24', '#D4AF37']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.streakCard}
        >
          <View style={styles.streakContent}>
            <View style={styles.streakIcon}>
              <Ionicons name="flame" size={28} color="#FFFFFF" />
            </View>
            <View style={styles.streakText}>
              <Text style={styles.streakTitle}>
                {getLocalizedText(
                  'سلسلة النشاط',
                  "Série d'activité",
                  'Activity Streak'
                )}
              </Text>
              <Text style={styles.streakValue}>
                {stats.currentStreak}{' '}
                {getLocalizedText('أيام', 'jours', 'days')}
              </Text>
            </View>
            <View style={styles.streakBadge}>
              <Text style={styles.streakBadgeText}>🔥</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  header: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    opacity: 0.8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  cardContainer: {
    marginBottom: 16,
  },
  card: {
    height: 120,
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
    marginBottom: 4,
  },
  valueContainer: {
    justifyContent: 'flex-end',
    flex: 1,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  decorativeCircle: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(227, 30, 36, 0.05)',
  },
  decorativeAccent: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
  },
  streakContainer: {
    marginTop: 8,
  },
  streakCard: {
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  streakText: {
    flex: 1,
  },
  streakTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  streakValue: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  streakBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakBadgeText: {
    fontSize: 20,
  },
});
