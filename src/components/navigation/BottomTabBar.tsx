import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../navigation/AppNavigator';

const { width: screenWidth } = Dimensions.get('window');

interface TabItem {
  screen: Screen;
  icon: string;
  activeIcon: string;
  label: string;
  labelAr: string;
  color: string;
}

interface BottomTabBarProps {
  currentScreen: Screen;
  onTabPress: (screen: Screen) => void;
}

const tabs: TabItem[] = [
  {
    screen: 'Dashboard',
    icon: 'home-outline',
    activeIcon: 'home',
    label: 'Home',
    labelAr: 'الرئيسية',
    color: '#E31E24',
  },
  {
    screen: 'Search',
    icon: 'search-outline',
    activeIcon: 'search',
    label: 'Search',
    labelAr: 'البحث',
    color: '#D4AF37',
  },
  {
    screen: 'Chat',
    icon: 'chatbubbles-outline',
    activeIcon: 'chatbubbles',
    label: 'Chat',
    labelAr: 'المحادثة',
    color: '#2E8B57',
  },
  {
    screen: 'Updates',
    icon: 'newspaper-outline',
    activeIcon: 'newspaper',
    label: 'Updates',
    labelAr: 'التحديثات',
    color: '#FF8C00',
  },
  {
    screen: 'Profile',
    icon: 'person-outline',
    activeIcon: 'person',
    label: 'Profile',
    labelAr: 'الملف',
    color: '#9C27B0',
  },
];

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  currentScreen,
  onTabPress,
}) => {
  return (
    <View style={styles.container}>
      {/* Background with Tunisian gradient */}
      <LinearGradient
        colors={['#FFFFFF', '#F8F9FA']}
        style={styles.background}
      >
        {/* Tab items */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab, index) => {
            const isActive = currentScreen === tab.screen;
            
            return (
              <TouchableOpacity
                key={tab.screen}
                style={styles.tabItem}
                onPress={() => onTabPress(tab.screen === 'Chat' ? 'ChatbotSelection' : tab.screen)}
                activeOpacity={0.7}
              >
                {/* Active tab indicator */}
                {isActive && (
                  <View style={styles.activeIndicatorContainer}>
                    <LinearGradient
                      colors={[tab.color, tab.color + '80']}
                      style={styles.activeIndicator}
                    />
                  </View>
                )}
                
                {/* Tab content */}
                <View style={[
                  styles.tabContent,
                  isActive && styles.activeTabContent
                ]}>
                  {/* Icon with background for active state */}
                  <View style={[
                    styles.iconContainer,
                    isActive && { backgroundColor: tab.color + '15' }
                  ]}>
                    <Ionicons
                      name={isActive ? tab.activeIcon as any : tab.icon as any}
                      size={isActive ? 26 : 24}
                      color={isActive ? tab.color : '#666666'}
                    />
                  </View>
                  
                  {/* Label */}
                  <Text style={[
                    styles.tabLabel,
                    isActive && { color: tab.color, fontWeight: 'bold' }
                  ]}>
                    {tab.labelAr}
                  </Text>
                  
                  {/* Notification badge for specific tabs */}
                  {tab.screen === 'Updates' && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.notificationText}>3</Text>
                    </View>
                  )}
                  
                  {tab.screen === 'Chat' && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.notificationText}>1</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        
        {/* Tunisian cultural accent */}
        <View style={styles.culturalAccent}>
          <View style={styles.accentLine} />
        </View>
      </LinearGradient>
      
      {/* Shadow overlay */}
      <View style={styles.shadowOverlay} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  background: {
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  activeIndicatorContainer: {
    position: 'absolute',
    top: -8,
    left: '50%',
    marginLeft: -20,
    zIndex: 1,
  },
  activeIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  tabContent: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    minHeight: 60,
    justifyContent: 'center',
  },
  activeTabContent: {
    transform: [{ scale: 1.05 }],
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 11,
    color: '#666666',
    textAlign: 'center',
    fontWeight: '500',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E31E24',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  notificationText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  culturalAccent: {
    alignItems: 'center',
    marginTop: 4,
  },
  accentLine: {
    width: 60,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#E31E24',
    opacity: 0.3,
  },
  shadowOverlay: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    height: 10,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
});