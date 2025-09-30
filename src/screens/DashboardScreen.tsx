import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Components
import {
  WelcomeSection,
  QuickStatsCards,
  RecentActivityFeed,
  GovernmentPulseSection,
  LoadingOverlay,
  ErrorBoundary,
  ApiErrorDisplay,
  ErrorDisplay,
  NetworkStatusIndicator,
} from '../components';

// Services
import apiService from '../services/api';

// Hooks and Utils
import { useErrorHandler } from '../hooks';
import { useNetworkState } from '../utils/networkUtils';
import { useTheme, createThemedStyles } from '../contexts/ThemeContext';

// Types
import { User, LegalUpdate } from '../types';

const { width: screenWidth } = Dimensions.get('window');

interface DashboardScreenProps {
  navigation: any;
  route: any;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  navigation,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [recentUpdates, setRecentUpdates] = useState<LegalUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Theme context
  const { theme, isDark } = useTheme();
  const styles = createThemedStyles(createStyles)(theme);

  // Error handling
  const { error, isRetrying, handleError, clearError, retry } = useErrorHandler(
    {
      maxRetries: 3,
      showAlert: false,
    }
  );
  const networkState = useNetworkState();

  // Mock user ID - in real app this would come from auth context
  const currentUserId = 'user-001';

  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (!isRefresh) setIsLoading(true);
      clearError();

      // Check network connectivity first
      if (!networkState.isConnected || !networkState.isInternetReachable) {
        throw new Error(
          'لا يوجد اتصال بالإنترنت. يرجى التحقق من اتصالك والمحاولة مرة أخرى.'
        );
      }

      // Check API health first
      try {
        await apiService.healthCheck();
      } catch (healthError) {
        console.warn(
          'API health check failed, using fallback data:',
          healthError
        );
        // Set fallback user data
        setUser({
          id: currentUserId,
          name: 'مستخدم تجريبي',
          email: 'demo@example.com',
          avatar: '',
          profile: {
            sectors: ['business'],
            legalCategories: ['business_law'],
            region: 'tunis',
            language: 'ar',
            experienceLevel: 'beginner',
            interests: [],
            interestsAr: [],
            interestsFr: [],
          },
          preferences: {
            language: 'ar',
            notifications: {
              pushNotifications: true,
              emailNotifications: false,
              smsNotifications: false,
              legalUpdates: true,
              achievements: true,
              reminders: true,
              governmentAlerts: true,
              parliamentaryUpdates: true,
              quietHours: {
                enabled: false,
                startTime: '22:00',
                endTime: '08:00',
              },
              categories: {
                business_law: true,
                tax_law: false,
                labor_law: false,
                administrative_law: false,
                civil_law: false,
                family_law: false,
                criminal_law: false,
                constitutional_law: false,
                commercial_law: false,
                environmental_law: false,
              },
            },
            privacy: {
              dataSharing: false,
              analytics: true,
              personalization: true,
              locationTracking: false,
              voiceRecording: false,
              communityFeatures: true,
              profileVisibility: 'private',
            },
            display: {
              theme: 'light',
              fontSize: 'medium',
              animations: true,
              reducedMotion: false,
              highContrast: false,
              rtlLayout: true,
              colorScheme: 'default',
            },
            mascot: {
              enabled: true,
              preferredSector: 'business',
              animationLevel: 'full',
              voiceSync: true,
              celebrations: true,
              customizations: [],
            },
            voice: {
              enabled: true,
              dialect: 'tunis',
              voiceSpeed: 1.0,
              voiceGender: 'neutral',
              noiseReduction: true,
              autoTranscription: true,
            },
          },
          achievements: [],
          statistics: {
            totalLegalUpdatesRead: 0,
            totalChatConversations: 0,
            totalSearchQueries: 0,
            totalDaysActive: 0,
            currentStreak: 0,
            longestStreak: 0,
            totalAchievements: 0,
            totalPoints: 0,
            favoriteCategory: 'business_law',
            mostActiveSector: 'business',
            averageSessionDuration: 0,
            lastWeekActivity: [],
            monthlyStats: [],
          },
          createdAt: new Date(),
          lastActiveAt: new Date(),
          isVerified: false,
        });
        setRecentUpdates([]);
        return;
      }

      // Try to get legal categories and popular queries as dashboard data
      try {
        const [categoriesResponse, popularQueriesResponse] = await Promise.all([
          apiService.getLegalCategories(),
          apiService.getPopularQueries('ar'),
        ]);

        // Set user data (mock for now since backend doesn't have user endpoints)
        setUser({
          id: currentUserId,
          name: 'مستخدم قانوني',
          email: 'user@legal.tn',
          avatar: '',
          profile: {
            sectors: ['business'],
            legalCategories: ['business_law'],
            region: 'tunis',
            language: 'ar',
            experienceLevel: 'intermediate',
            interests: ['قانون الأعمال', 'الضرائب'],
            interestsAr: ['قانون الأعمال', 'الضرائب'],
            interestsFr: ['Droit des affaires', 'Taxes'],
          },
          preferences: {
            language: 'ar',
            notifications: {
              pushNotifications: true,
              emailNotifications: true,
              smsNotifications: false,
              legalUpdates: true,
              achievements: true,
              reminders: true,
              governmentAlerts: true,
              parliamentaryUpdates: true,
              quietHours: {
                enabled: false,
                startTime: '22:00',
                endTime: '08:00',
              },
              categories: {
                business_law: true,
                tax_law: true,
                labor_law: false,
                administrative_law: false,
                civil_law: false,
                family_law: false,
                criminal_law: false,
                constitutional_law: false,
                commercial_law: false,
                environmental_law: false,
              },
            },
            privacy: {
              dataSharing: false,
              analytics: true,
              personalization: true,
              locationTracking: false,
              voiceRecording: false,
              communityFeatures: true,
              profileVisibility: 'private',
            },
            display: {
              theme: 'light',
              fontSize: 'medium',
              animations: true,
              reducedMotion: false,
              highContrast: false,
              rtlLayout: true,
              colorScheme: 'default',
            },
            mascot: {
              enabled: true,
              preferredSector: 'business',
              animationLevel: 'full',
              voiceSync: true,
              celebrations: true,
              customizations: [],
            },
            voice: {
              enabled: true,
              dialect: 'tunis',
              voiceSpeed: 1.0,
              voiceGender: 'neutral',
              noiseReduction: true,
              autoTranscription: true,
            },
          },
          achievements: [],
          statistics: {
            totalLegalUpdatesRead: popularQueriesResponse.length || 0,
            totalChatConversations: 8,
            totalSearchQueries: 25,
            totalDaysActive: 12,
            currentStreak: 5,
            longestStreak: 8,
            totalAchievements: 3,
            totalPoints: 150,
            favoriteCategory: 'business_law',
            mostActiveSector: 'business',
            averageSessionDuration: 5.2,
            lastWeekActivity: [],
            monthlyStats: [],
          },
          createdAt: new Date(),
          lastActiveAt: new Date(),
          isVerified: true,
        });

        // Convert popular queries to legal updates format for display
        const updates: LegalUpdate[] = popularQueriesResponse
          .slice(0, 5)
          .map((query: any, index: number) => ({
            id: `update-${index}`,
            title: query.query || 'استعلام قانوني',
            titleAr: query.query || 'استعلام قانوني',
            titleFr: `Requête juridique ${index + 1}`,
            summary: `استعلام شائع بمعدل نجاح ${Math.round((query.success_rate || 0.8) * 100)}%`,
            summaryAr: `استعلام شائع بمعدل نجاح ${Math.round((query.success_rate || 0.8) * 100)}%`,
            summaryFr: `Requête populaire avec un taux de succès de ${Math.round((query.success_rate || 0.8) * 100)}%`,
            content: query.query || 'محتوى الاستعلام القانوني',
            contentAr: query.query || 'محتوى الاستعلام القانوني',
            contentFr: query.query || 'Contenu de la requête juridique',
            category: 'business_law',
            priority:
              query.popularity > 80
                ? 'high'
                : query.popularity > 50
                  ? 'medium'
                  : 'low',
            source: {
              id: 'api-source',
              name: 'نظام الاستعلامات القانونية',
              nameAr: 'نظام الاستعلامات القانونية',
              nameFr: 'Système de requêtes juridiques',
              type: 'government_social',
              credibilityScore: 0.9,
              lastUpdated: new Date(),
            },
            publishedAt: new Date(query.last_used || Date.now()),
            tags: ['شائع', 'قانوني'],
            tagsAr: ['شائع', 'قانوني'],
            tagsFr: ['populaire', 'juridique'],
            impactLevel:
              query.popularity > 80
                ? 'high'
                : query.popularity > 50
                  ? 'medium'
                  : 'low',
            sectors: ['business'],
            isBookmarked: false,
          }));

        setRecentUpdates(updates);
      } catch (apiError) {
        console.error('API calls failed:', apiError);
        throw new Error('فشل في تحميل البيانات من الخادم');
      }
    } catch (err) {
      console.error('Dashboard data loading error:', err);
      handleError(err, 'فشل في تحميل بيانات لوحة التحكم');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData(true);
  };

  const handleRetry = async () => {
    await retry(async () => {
      await loadDashboardData();
    });
  };

  const handleUpdatePress = (updateId: string) => {
    navigation.navigate('LegalUpdateDetail', { updateId });
  };

  const handleChatPress = () => {
    navigation.navigate('Chat');
  };

  const handleSearchPress = () => {
    navigation.navigate('Search');
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (isLoading && !user) {
    return <LoadingOverlay message="Loading your dashboard..." />;
  }

  if (error && !user) {
    return (
      <SafeAreaView style={styles.container}>
        <NetworkStatusIndicator onRetry={handleRetry} />
        <ErrorDisplay
          error={error}
          onRetry={handleRetry}
          type="network"
          isRetrying={isRetrying}
          showRetry={true}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.surface}
      />
      <NetworkStatusIndicator onRetry={handleRetry} />

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
        <WelcomeSection
          user={user}
          onChatPress={handleChatPress}
          onSearchPress={handleSearchPress}
          onProfilePress={handleProfilePress}
        />

        {/* Quick Stats Cards */}
        <QuickStatsCards
          user={user}
          onStatsPress={(category: string) => {
            navigation.navigate('Statistics', { category });
          }}
        />

        {/* Recent Activity Feed */}
        <RecentActivityFeed
          updates={recentUpdates}
          onUpdatePress={handleUpdatePress}
          onViewAllPress={() => navigation.navigate('Updates')}
        />

        {/* Government Pulse Section */}
        <GovernmentPulseSection
          onMinistryPress={(ministryId: string) => {
            navigation.navigate('MinistryUpdates', { ministryId });
          }}
          onViewAllPress={() => navigation.navigate('GovernmentPulse')}
        />

        {/* Bottom spacing for tab bar */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = createThemedStyles(theme =>
  StyleSheet.create({
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
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: theme.colors.background,
    },
    bottomSpacing: {
      height: 100, // Space for tab bar
    },
  })
);
