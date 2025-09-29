import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, createThemedStyles } from '../contexts/ThemeContext';
import { MascotAchievementCelebration } from '../components/mascot';
import { useMascotInteractions } from '../hooks/useMascotInteractions';
import { AchievementBadge, AchievementUnlockAnimation, ProgressTracker } from '../components/gamification';

// Import the celebration achievement type
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

const { width: screenWidth } = Dimensions.get('window');

interface AchievementsScreenProps {
  navigation: any;
}

interface Achievement {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  category: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  points: number;
  unlockedAt?: Date;
  progress?: {
    current: number;
    target: number;
    percentage: number;
  };
  color: string;
}

export const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [celebratingAchievement, setCelebratingAchievement] = useState<CelebrationAchievement | null>(null);
  
  const { celebrateAchievement } = useMascotInteractions();
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const achievementAnimations = useRef<{ [key: string]: Animated.Value }>({}).current;

  // Mock achievements data
  const mockAchievements: Achievement[] = [
    {
      id: '1',
      title: 'Legal Explorer',
      titleAr: 'مستكشف القانون',
      description: 'Read 10 legal updates',
      descriptionAr: 'قراءة 10 تحديثات قانونية',
      category: 'exploration',
      icon: 'compass',
      rarity: 'common',
      points: 50,
      unlockedAt: new Date(),
      color: '#4ECDC4',
    },
    {
      id: '2',
      title: 'Chat Master',
      titleAr: 'خبير المحادثة',
      description: 'Complete 25 chat conversations',
      descriptionAr: 'إكمال 25 محادثة',
      category: 'engagement',
      icon: 'chatbubbles',
      rarity: 'uncommon',
      points: 100,
      unlockedAt: new Date(),
      color: '#FF6B6B',
    },
    {
      id: '3',
      title: 'Knowledge Seeker',
      titleAr: 'باحث المعرفة',
      description: 'Perform 50 searches',
      descriptionAr: 'تنفيذ 50 عملية بحث',
      category: 'knowledge',
      icon: 'search',
      rarity: 'rare',
      points: 200,
      progress: {
        current: 35,
        target: 50,
        percentage: 70,
      },
      color: '#9B59B6',
    },
    {
      id: '4',
      title: 'Consistency Champion',
      titleAr: 'بطل الاستمرارية',
      description: 'Use app for 30 consecutive days',
      descriptionAr: 'استخدام التطبيق لمدة 30 يوماً متتالياً',
      category: 'consistency',
      icon: 'flame',
      rarity: 'epic',
      points: 500,
      progress: {
        current: 15,
        target: 30,
        percentage: 50,
      },
      color: '#FF8C00',
    },
    {
      id: '5',
      title: 'Tunisian Legal Master',
      titleAr: 'خبير القانون التونسي',
      description: 'Master all legal categories',
      descriptionAr: 'إتقان جميع الفئات القانونية',
      category: 'mastery',
      icon: 'trophy',
      rarity: 'legendary',
      points: 1000,
      progress: {
        current: 3,
        target: 8,
        percentage: 37.5,
      },
      color: '#D4AF37',
    },
  ];

  const categories = [
    { id: 'all', name: 'الكل', icon: 'apps', color: '#666666' },
    { id: 'exploration', name: 'الاستكشاف', icon: 'compass', color: '#4ECDC4' },
    { id: 'engagement', name: 'التفاعل', icon: 'people', color: '#FF6B6B' },
    { id: 'knowledge', name: 'المعرفة', icon: 'library', color: '#9B59B6' },
    { id: 'consistency', name: 'الاستمرارية', icon: 'calendar', color: '#FF8C00' },
    { id: 'mastery', name: 'الإتقان', icon: 'star', color: '#D4AF37' },
  ];

  const rarityColors = {
    common: '#95A5A6',
    uncommon: '#3498DB',
    rare: '#9B59B6',
    epic: '#E67E22',
    legendary: '#F1C40F',
  };

  const rarityNames = {
    common: 'عادي',
    uncommon: 'غير عادي',
    rare: 'نادر',
    epic: 'ملحمي',
    legendary: 'أسطوري',
  };

  useEffect(() => {
    setAchievements(mockAchievements);
    
    // Initialize animations
    mockAchievements.forEach((achievement, index) => {
      achievementAnimations[achievement.id] = new Animated.Value(0);
      
      // Stagger animation
      Animated.timing(achievementAnimations[achievement.id], {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const totalPoints = achievements
    .filter(a => a.unlockedAt)
    .reduce((sum, a) => sum + a.points, 0);

  const renderCategoryTab = (category: any) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryTab,
        selectedCategory === category.id && styles.selectedCategoryTab
      ]}
      onPress={() => setSelectedCategory(category.id)}
    >
      <LinearGradient
        colors={selectedCategory === category.id 
          ? [category.color + '20', category.color + '10']
          : ['transparent', 'transparent']
        }
        style={styles.categoryTabGradient}
      >
        <Ionicons 
          name={category.icon as any} 
          size={20} 
          color={selectedCategory === category.id ? category.color : '#666666'} 
        />
        <Text style={[
          styles.categoryTabText,
          selectedCategory === category.id && { color: category.color }
        ]}>
          {category.name}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderAchievement = ({ item, index }: { item: Achievement; index: number }) => {
    const isUnlocked = !!item.unlockedAt;
    const animValue = achievementAnimations[item.id] || new Animated.Value(1);

    return (
      <TouchableOpacity
        activeOpacity={isUnlocked ? 0.7 : 1}
        onPress={() => {
          if (isUnlocked) {
            const achievementForCelebration = {
              id: item.id,
              title: item.titleAr,
              titleEn: item.title,
              description: item.descriptionAr,
              descriptionEn: item.description,
              icon: item.icon,
              rarity: item.rarity as 'common' | 'rare' | 'epic' | 'legendary',
              culturalSignificance: 'إنجاز رائع في رحلتك القانونية!'
            };
            setCelebratingAchievement(achievementForCelebration);
            celebrateAchievement(['achievement_celebration']);
          }
        }}
      >
        <Animated.View
          style={[
            styles.achievementCard,
            {
              opacity: animValue,
              transform: [{
                translateY: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                })
              }]
            }
          ]}
        >
        <LinearGradient
          colors={isUnlocked 
            ? [item.color + '15', item.color + '05']
            : ['#F5F5F5', '#EEEEEE']
          }
          style={styles.achievementGradient}
        >
          {/* Rarity Badge */}
          <View style={[styles.rarityBadge, { backgroundColor: rarityColors[item.rarity] }]}>
            <Text style={styles.rarityText}>{rarityNames[item.rarity]}</Text>
          </View>

          {/* Achievement Icon */}
          <View style={[
            styles.achievementIcon,
            { backgroundColor: isUnlocked ? item.color + '20' : '#E0E0E0' }
          ]}>
            <Ionicons 
              name={item.icon as any} 
              size={32} 
              color={isUnlocked ? item.color : '#999999'} 
            />
          </View>

          {/* Achievement Info */}
          <View style={styles.achievementInfo}>
            <Text style={[
              styles.achievementTitle,
              !isUnlocked && styles.lockedText
            ]}>
              {item.titleAr}
            </Text>
            <Text style={[
              styles.achievementDescription,
              !isUnlocked && styles.lockedText
            ]}>
              {item.descriptionAr}
            </Text>

            {/* Progress Bar */}
            {item.progress && !isUnlocked && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <LinearGradient
                    colors={[item.color, item.color + '80']}
                    style={[styles.progressFill, { width: `${item.progress.percentage}%` }]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {item.progress.current} / {item.progress.target}
                </Text>
              </View>
            )}

            {/* Points */}
            <View style={styles.pointsContainer}>
              <Ionicons name="diamond" size={16} color={isUnlocked ? item.color : '#999999'} />
              <Text style={[
                styles.pointsText,
                !isUnlocked && styles.lockedText
              ]}>
                {item.points} نقطة
              </Text>
            </View>

            {/* Unlock Date */}
            {isUnlocked && item.unlockedAt && (
              <Text style={styles.unlockDate}>
                تم الإنجاز في {item.unlockedAt.toLocaleDateString('ar-TN')}
              </Text>
            )}
          </View>

          {/* Lock/Check Icon */}
          <View style={styles.statusIcon}>
            <Ionicons 
              name={isUnlocked ? "checkmark-circle" : "lock-closed"} 
              size={24} 
              color={isUnlocked ? "#4CAF50" : "#999999"} 
            />
          </View>
        </LinearGradient>
      </Animated.View>
      </TouchableOpacity>
    );
  };

  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#E31E24', '#D4AF37']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>الإنجازات والنقاط</Text>
        
        <View style={styles.headerStats}>
          <Text style={styles.headerStatsText}>{totalPoints}</Text>
        </View>
      </LinearGradient>

      {/* Stats Overview */}
      <View style={styles.statsOverview}>
        <LinearGradient
          colors={['#FFFFFF', '#F8F9FA']}
          style={styles.statsCard}
        >
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{unlockedCount}</Text>
            <Text style={styles.statLabel}>إنجازات مكتملة</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{achievements.length - unlockedCount}</Text>
            <Text style={styles.statLabel}>إنجازات متبقية</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalPoints}</Text>
            <Text style={styles.statLabel}>إجمالي النقاط</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Category Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryTabs}
        contentContainerStyle={styles.categoryTabsContent}
      >
        {categories.map(renderCategoryTab)}
      </ScrollView>

      {/* Achievements List */}
      <FlatList
        data={filteredAchievements}
        renderItem={renderAchievement}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.achievementsList}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      />

      {/* Achievement Celebration Modal */}
      <MascotAchievementCelebration
        achievement={celebratingAchievement}
        visible={!!celebratingAchievement}
        onClose={() => setCelebratingAchievement(null)}
      />
    </SafeAreaView>
  );
};

const getStyles = createThemedStyles((theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerStats: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
  },
  headerStatsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statsOverview: {
    margin: 16,
    marginBottom: 8,
  },
  statsCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E31E24',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  categoryTabs: {
    marginBottom: 16,
  },
  categoryTabsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryTab: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  categoryTabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  selectedCategoryTab: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  achievementsList: {
    padding: 16,
    paddingTop: 0,
  },
  achievementCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  achievementGradient: {
    padding: 20,
    position: 'relative',
  },
  rarityBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  achievementIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  achievementInfo: {
    alignItems: 'center',
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 12,
  },
  lockedText: {
    color: '#999999',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  unlockDate: {
    fontSize: 12,
    color: '#4CAF50',
    fontStyle: 'italic',
  },
  statusIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
}));