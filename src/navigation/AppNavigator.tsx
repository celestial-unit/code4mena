import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { DashboardScreenSimple } from '../screens/DashboardScreenSimple';
import { ChatScreen } from '../screens/ChatScreen';
import { ChatbotSelectionScreen } from '../screens/ChatbotSelectionScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { UpdatesScreen } from '../screens/UpdatesScreen';
import {
  PersonalInfoScreen,
  PreferencesScreen,
  AchievementsScreen,
  MascotDemoScreen,
} from '../screens';
import { AuthTestScreen, ErrorTestScreen } from '../screens';
import { BottomTabBar } from '../components/navigation/BottomTabBar';

export type Screen =
  | 'Dashboard'
  | 'Chat'
  | 'ChatbotSelection'
  | 'Search'
  | 'Profile'
  | 'PersonalInfo'
  | 'Preferences'
  | 'Achievements'
  | 'MascotDemo'
  | 'Statistics'
  | 'Updates'
  | 'GovernmentPulse'
  | 'LegalUpdateDetail'
  | 'MinistryUpdates'
  | 'Notifications'
  | 'AuthTest'
  | 'ErrorTest';

interface NavigationState {
  currentScreen: Screen;
  params?: any;
  history: { screen: Screen; params?: any }[];
}

export const AppNavigator: React.FC = () => {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentScreen: 'Dashboard',
    history: [],
  });

  const navigate = (screen: Screen, params?: any) => {
    console.log(`🚀 NAVIGATION: Going to ${screen}`, params);
    setNavigationState(prev => ({
      currentScreen: screen,
      params,
      history: [
        ...prev.history,
        { screen: prev.currentScreen, params: prev.params },
      ],
    }));
  };

  const goBack = () => {
    if (navigationState.history.length > 0) {
      const previous =
        navigationState.history[navigationState.history.length - 1];
      setNavigationState(prev => ({
        currentScreen: previous.screen,
        params: previous.params,
        history: prev.history.slice(0, -1),
      }));
    }
  };

  const navigation = {
    navigate,
    goBack,
  };

  const route = {
    params: navigationState.params || {},
  };

  // Render current screen
  const renderScreen = () => {
    switch (navigationState.currentScreen) {
      case 'Dashboard':
        return <DashboardScreenSimple navigation={navigation} route={route} />;
      case 'Chat':
        return <ChatScreen navigation={navigation} route={route} />;
      case 'ChatbotSelection':
        return <ChatbotSelectionScreen navigation={navigation} />;
      case 'Search':
        return <SearchScreen navigation={navigation} />;
      case 'Notifications':
        return <NotificationsScreen navigation={navigation} />;
      case 'Profile':
        return <ProfileScreen navigation={navigation} />;
      case 'PersonalInfo':
        return <PersonalInfoScreen navigation={navigation} />;
      case 'Preferences':
        return <PreferencesScreen navigation={navigation} />;
      case 'Achievements':
        return <AchievementsScreen navigation={navigation} />;
      case 'MascotDemo':
        return <MascotDemoScreen navigation={navigation} />;
      case 'Updates':
        return <UpdatesScreen navigation={navigation} />;
      case 'AuthTest':
        return <AuthTestScreen />;
      case 'ErrorTest':
        return <ErrorTestScreen navigation={navigation} />;
      case 'Statistics':
      case 'GovernmentPulse':
      case 'LegalUpdateDetail':
      case 'MinistryUpdates':
        // For now, show a placeholder screen for these
        return (
          <PlaceholderScreen
            navigation={navigation}
            screenName={navigationState.currentScreen}
          />
        );
      default:
        return <DashboardScreenSimple navigation={navigation} route={route} />;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {renderScreen()}
      <BottomTabBar
        currentScreen={navigationState.currentScreen}
        onTabPress={navigate}
      />
    </View>
  );
};

// Placeholder screen for unimplemented screens
const PlaceholderScreen: React.FC<{ navigation: any; screenName: string }> = ({
  navigation,
  screenName,
}) => {
  const getScreenTitle = () => {
    switch (screenName) {
      case 'Profile':
        return 'الملف الشخصي';
      case 'PersonalInfo':
        return 'المعلومات الشخصية';
      case 'Preferences':
        return 'التفضيلات';
      case 'Achievements':
        return 'الإنجازات والنقاط';
      case 'MascotDemo':
        return 'عرض الشخصية التونسية';
      case 'Statistics':
        return 'الإحصائيات';
      case 'Updates':
        return 'جميع التحديثات';
      case 'GovernmentPulse':
        return 'نبض الحكومة الكامل';
      case 'LegalUpdateDetail':
        return 'تفاصيل التحديث القانوني';
      case 'MinistryUpdates':
        return 'تحديثات الوزارة';
      default:
        return 'صفحة جديدة';
    }
  };

  return (
    <SafeAreaView style={placeholderStyles.container}>
      {/* Header */}
      <View style={placeholderStyles.header}>
        <TouchableOpacity
          style={placeholderStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#E31E24" />
        </TouchableOpacity>

        <Text style={placeholderStyles.headerTitle}>{getScreenTitle()}</Text>

        <View style={placeholderStyles.placeholder} />
      </View>

      {/* Content */}
      <View style={placeholderStyles.content}>
        <View style={placeholderStyles.card}>
          <Text style={placeholderStyles.emoji}>🚧</Text>

          <Text style={placeholderStyles.title}>{getScreenTitle()}</Text>

          <Text style={placeholderStyles.subtitle}>
            هذه الصفحة قيد التطوير{'\n'}ستكون متاحة قريباً
          </Text>

          <TouchableOpacity
            style={placeholderStyles.button}
            onPress={() => navigation.goBack()}
          >
            <LinearGradient
              colors={['#E31E24', '#D4AF37']}
              style={placeholderStyles.buttonGradient}
            >
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
              <Text style={placeholderStyles.buttonText}>العودة للخلف</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const placeholderStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    maxWidth: 300,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
