import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Mock user data
  const user = {
    name: 'أحمد بن سالم',
    email: 'ahmed.bensalem@email.com',
    phone: '+216 98 123 456',
    occupation: 'رائد أعمال تقني',
    region: 'تونس',
    memberSince: 'يناير 2024',
    totalPoints: 450,
    currentLevel: 'خبير قانوني',
    achievements: 3,
    streak: 5,
  };

  const menuItems = [
    {
      id: 'personal',
      title: 'المعلومات الشخصية',
      icon: 'person',
      color: '#E31E24',
      onPress: () => navigation.navigate('PersonalInfo'),
    },
    {
      id: 'preferences',
      title: 'التفضيلات',
      icon: 'settings',
      color: '#D4AF37',
      onPress: () => navigation.navigate('Preferences'),
    },
    {
      id: 'achievements',
      title: 'الإنجازات والنقاط',
      icon: 'trophy',
      color: '#FF8C00',
      onPress: () => navigation.navigate('Achievements'),
    },
    {
      id: 'bookmarks',
      title: 'المحفوظات',
      icon: 'bookmark',
      color: '#2E8B57',
      onPress: () => navigation.navigate('Bookmarks'),
    },
    {
      id: 'history',
      title: 'سجل النشاط',
      icon: 'time',
      color: '#9C27B0',
      onPress: () => navigation.navigate('ActivityHistory'),
    },
  ];

  const settingsItems = [
    {
      id: 'notifications',
      title: 'الإشعارات',
      icon: 'notifications',
      value: notificationsEnabled,
      onToggle: setNotificationsEnabled,
    },
    {
      id: 'voice',
      title: 'المساعد الصوتي',
      icon: 'mic',
      value: voiceEnabled,
      onToggle: setVoiceEnabled,
    },
    {
      id: 'darkmode',
      title: 'الوضع الليلي',
      icon: 'moon',
      value: darkModeEnabled,
      onToggle: setDarkModeEnabled,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={['#E31E24', '#D4AF37']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            {/* Header Actions */}
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerButton}>
                <Ionicons name="notifications" size={24} color="#FFFFFF" />
                <View style={styles.notificationDot} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.headerButton}>
                <Ionicons name="settings" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Profile Info */}
            <View style={styles.profileInfo}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={['#FFFFFF', '#F8F9FA']}
                  style={styles.avatar}
                >
                  <Ionicons name="person" size={48} color="#E31E24" />
                </LinearGradient>
                <TouchableOpacity style={styles.editAvatarButton}>
                  <Ionicons name="camera" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userOccupation}>{user.occupation}</Text>
              <Text style={styles.userLocation}>📍 {user.region}</Text>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.totalPoints}</Text>
                <Text style={styles.statLabel}>النقاط</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.achievements}</Text>
                <Text style={styles.statLabel}>الإنجازات</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.streak}</Text>
                <Text style={styles.statLabel}>أيام متتالية</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Level Badge */}
        <View style={styles.levelBadgeContainer}>
          <LinearGradient
            colors={['#D4AF37', '#FFD700']}
            style={styles.levelBadge}
          >
            <Ionicons name="star" size={20} color="#FFFFFF" />
            <Text style={styles.levelText}>{user.currentLevel}</Text>
          </LinearGradient>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>الحساب</Text>
          {menuItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View
                style={[
                  styles.menuIcon,
                  { backgroundColor: item.color + '15' },
                ]}
              >
                <Ionicons
                  name={item.icon as any}
                  size={24}
                  color={item.color}
                />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color="#999999" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Settings */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>الإعدادات</Text>
          {settingsItems.map(item => (
            <View key={item.id} style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Ionicons name={item.icon as any} size={24} color="#666666" />
                </View>
                <Text style={styles.settingTitle}>{item.title}</Text>
              </View>
              <Switch
                value={item.value}
                onValueChange={item.onToggle}
                trackColor={{ false: '#E0E0E0', true: '#E31E24' }}
                thumbColor={item.value ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
          ))}
        </View>

        {/* Support Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>الدعم</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: '#2E8B5715' }]}>
              <Ionicons name="help-circle" size={24} color="#2E8B57" />
            </View>
            <Text style={styles.menuTitle}>مركز المساعدة</Text>
            <Ionicons name="chevron-forward" size={20} color="#999999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: '#FF8C0015' }]}>
              <Ionicons name="mail" size={24} color="#FF8C00" />
            </View>
            <Text style={styles.menuTitle}>اتصل بنا</Text>
            <Ionicons name="chevron-forward" size={20} color="#999999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: '#9C27B015' }]}>
              <Ionicons name="star" size={24} color="#9C27B0" />
            </View>
            <Text style={styles.menuTitle}>قيم التطبيق</Text>
            <Ionicons name="chevron-forward" size={20} color="#999999" />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>كنوني 2025 - الإصدار 1.0.0</Text>
          <Text style={styles.memberSince}>عضو منذ {user.memberSince}</Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton}>
          <Ionicons name="log-out" size={24} color="#E31E24" />
          <Text style={styles.logoutText}>تسجيل الخروج</Text>
        </TouchableOpacity>

        {/* Bottom spacing for tab bar */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  profileHeader: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerGradient: {
    padding: 20,
    paddingTop: 16,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD700',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E31E24',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userOccupation: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  userLocation: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  levelBadgeContainer: {
    alignItems: 'center',
    marginTop: -16,
    marginBottom: 24,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  levelText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  menuSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  appInfo: {
    alignItems: 'center',
    marginVertical: 24,
  },
  appVersion: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 12,
    color: '#999999',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E31E24',
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 16,
    color: '#E31E24',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 100,
  },
});
