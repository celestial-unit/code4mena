import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  StatusBar,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, createThemedStyles } from '../contexts/ThemeContext';

// Services
import { mockDataService } from '../services/mockDataService';

// Types
import { User, LegalUpdate } from '../types';

const { width: screenWidth } = Dimensions.get('window');

interface DashboardScreenProps {
  navigation: any;
  route: any;
}

export const DashboardScreenSimple: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [recentUpdates, setRecentUpdates] = useState<LegalUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create styles early so they can be used in early returns
  const styles = getStyles(theme);

  // Mock user ID - in real app this would come from auth context
  const currentUserId = 'user-001';

  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (!isRefresh) setIsLoading(true);
      setError(null);

      // Load user data and recent legal updates in parallel
      const [userResponse, updatesResponse] = await Promise.all([
        mockDataService.getUserById(currentUserId),
        mockDataService.getLegalUpdates(1, 5, undefined, 'high')
      ]);

      if (userResponse.success && userResponse.data) {
        setUser(userResponse.data);
      } else {
        throw new Error('Failed to load user data');
      }

      if (updatesResponse.success && updatesResponse.data) {
        setRecentUpdates(updatesResponse.data.items);
      } else {
        throw new Error('Failed to load legal updates');
      }
    } catch (err) {
      console.error('Dashboard data loading error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData(true);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (isLoading && !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>حدث خطأ في تحميل البيانات</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadDashboardData()}>
            <Text style={styles.retryText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 17) return 'مساء الخير';
    return 'مساء الخير';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor={theme.colors.background} 
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary, theme.colors.accent]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <LinearGradient
            colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.welcomeGradient}
          >
            <View style={styles.welcomeContent}>
              <View style={styles.welcomeHeader}>
                <View>
                  <Text style={styles.greeting}>{getGreeting()}</Text>
                  <Text style={styles.userName}>{user?.nameAr || 'أحمد بن سالم'}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.profileButton}
                  onPress={() => navigation.navigate('Profile')}
                >
                  <Ionicons name="person" size={24} color="#FFFFFF" />
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationText}>3</Text>
                  </View>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.welcomeMessage}>
                مرحباً بك في كنوني - مرشدك القانوني الذكي
              </Text>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.chatButton}
                  onPress={() => navigation.navigate('ChatbotSelection')}
                >
                  <LinearGradient
                    colors={['#FFFFFF', theme.colors.background]}
                    style={styles.chatButtonGradient}
                  >
                    <Ionicons name="chatbubbles" size={24} color="#E31E24" />
                    <Text style={styles.chatButtonText}>ابدأ محادثة</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.searchButton}
                  onPress={() => navigation.navigate('Search')}
                >
                  <Ionicons name="search" size={20} color="#FFFFFF" />
                  <Text style={styles.searchButtonText}>بحث</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Stats Cards */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>إحصائياتك السريعة</Text>
          <Text style={styles.sectionSubtitle}>نشاطك هذا الشهر</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#E31E24' }]}>
                <Ionicons name="document-text" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.statTitle}>التحديثات المقروءة</Text>
              <Text style={styles.statValue}>{user?.statistics.totalLegalUpdatesRead || 25}</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#D4AF37' }]}>
                <Ionicons name="chatbubbles" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.statTitle}>المحادثات</Text>
              <Text style={styles.statValue}>{user?.statistics.totalChatConversations || 8}</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#2E8B57' }]}>
                <Ionicons name="search" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.statTitle}>عمليات البحث</Text>
              <Text style={styles.statValue}>{user?.statistics.totalSearchQueries || 15}</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#FF8C00' }]}>
                <Ionicons name="trophy" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.statTitle}>الإنجازات</Text>
              <Text style={styles.statValue}>{user?.statistics.totalAchievements || 3}</Text>
            </View>
          </View>
          
          {/* Activity Streak */}
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
                <Text style={styles.streakTitle}>سلسلة النشاط</Text>
                <Text style={styles.streakValue}>
                  {user?.statistics.currentStreak || 5} أيام
                </Text>
              </View>
              <Text style={styles.streakEmoji}>🔥</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Recent Updates */}
        <View style={styles.updatesSection}>
          <Text style={styles.sectionTitle}>التحديثات الأخيرة</Text>
          <Text style={styles.sectionSubtitle}>آخر التطورات القانونية المهمة</Text>
          
          {recentUpdates.map((update, index) => (
            <TouchableOpacity 
              key={update.id} 
              style={styles.updateCard}
              onPress={() => navigation.navigate('LegalUpdateDetail', { updateId: update.id })}
            >
              <View style={[styles.priorityIndicator, { 
                backgroundColor: update.priority === 'high' ? '#E31E24' : 
                                update.priority === 'medium' ? '#FF8C00' : '#2E8B57' 
              }]} />
              
              <View style={styles.updateContent}>
                <View style={styles.updateHeader}>
                  <Text style={styles.updateSource}>{update.source.nameAr}</Text>
                  <Text style={styles.updateTime}>منذ ساعات</Text>
                </View>
                
                <Text style={styles.updateTitle} numberOfLines={2}>
                  {update.titleAr}
                </Text>
                
                <Text style={styles.updateSummary} numberOfLines={3}>
                  {update.summaryAr}
                </Text>
                
                <View style={styles.updateTags}>
                  {update.tagsAr.slice(0, 2).map((tag, tagIndex) => (
                    <View key={tagIndex} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Government Pulse */}
        <View style={styles.governmentSection}>
          <View style={styles.governmentHeader}>
            <Text style={styles.sectionTitle}>نبض الحكومة</Text>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>1 مباشر</Text>
            </View>
          </View>
          <Text style={styles.sectionSubtitle}>آخر تحديثات الوزارات والمؤسسات الحكومية</Text>
          
          <TouchableOpacity 
            style={styles.ministryCard}
            onPress={() => navigation.navigate('MinistryUpdates', { ministryId: 'ministry-finance' })}
          >
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>مباشر</Text>
            </View>
            
            <View style={styles.ministryContent}>
              <Text style={styles.ministryName}>وزارة المالية</Text>
              <Text style={styles.ministryPlatform}>Facebook</Text>
              <Text style={styles.ministryText}>
                إعلان لوائح ضريبية رقمية جديدة للشركات التجارة الإلكترونية
              </Text>
              
              <View style={styles.ministryTags}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>الضرائب الرقمية</Text>
                </View>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>التجارة الإلكترونية</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Development Test Buttons */}
        <View style={styles.authTestSection}>
          <TouchableOpacity 
            style={styles.authTestButton}
            onPress={() => navigation.navigate('AuthTest')}
          >
            <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
            <Text style={styles.authTestText}>اختبار نظام المصادقة</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.authTestButton, { backgroundColor: '#4CAF50' }]}
            onPress={() => navigation.navigate('ErrorTest')}
          >
            <Ionicons name="bug" size={20} color="#FFFFFF" />
            <Text style={styles.authTestText}>اختبار التكامل</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.authTestButton, { backgroundColor: '#FF9800' }]}
            onPress={() => navigation.navigate('Chat')}
          >
            <Ionicons name="chatbubbles" size={20} color="#FFFFFF" />
            <Text style={styles.authTestText}>اختبار Gemini Live</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.authTestButton, { backgroundColor: '#8B5CF6' }]}
            onPress={() => navigation.navigate('MascotDemo')}
          >
            <Ionicons name="happy" size={20} color="#FFFFFF" />
            <Text style={styles.authTestText}>عرض الشخصية التونسية 3D</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = createThemedStyles((theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  welcomeSection: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  welcomeGradient: {
    padding: 20,
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 4,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  welcomeMessage: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 24,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatButton: {
    flex: 1,
    marginRight: 12,
  },
  chatButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  chatButtonText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  searchButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 6,
  },
  statsSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    opacity: 0.8,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: (screenWidth - 48) / 2,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
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
  streakEmoji: {
    fontSize: 24,
  },
  updatesSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  updateCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    position: 'relative',
    flexDirection: 'row',
  },
  priorityIndicator: {
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    marginRight: 12,
  },
  updateContent: {
    flex: 1,
  },
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  updateSource: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  updateTime: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  updateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: 8,
  },
  updateSummary: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  updateTags: {
    flexDirection: 'row',
  },
  tag: {
    backgroundColor: theme.colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  tagText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  governmentSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  governmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E31E24',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  ministryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    position: 'relative',
  },
  liveIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E31E24',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ministryContent: {
    paddingRight: 80,
  },
  ministryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  ministryPlatform: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  ministryText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  ministryTags: {
    flexDirection: 'row',
  },
  authTestSection: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  authTestButton: {
    backgroundColor: '#6c757d',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#495057',
    borderStyle: 'dashed',
  },
  authTestText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 100,
  },
}));