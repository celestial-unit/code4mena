import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme, createThemedStyles } from '../contexts/ThemeContext';
import { TunisianMascot3D } from '../components/mascot';
import { SimpleMascot } from '../components/mascot/SimpleMascot';


interface ProfileScreenProps {
  navigation: any;
}

const { width: screenWidth } = Dimensions.get('window');

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isThemeChanging, setIsThemeChanging] = useState(false);

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const settingsAnimations = useRef(
    Array.from({ length: 3 }, () => new Animated.Value(0))
  ).current;

  // Create themed styles
  const styles = getStyles(theme);

  // Enhanced user data with statistics
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
    completionRate: 85,
    weeklyGoal: 7,
    weeklyProgress: 5,
    nextLevelPoints: 550,
    profileCompletion: 92,
  };

  // Animation handlers
  const handleThemeToggle = () => {
    setIsThemeChanging(true);

    // Animate theme change
    Animated.sequence([
      Animated.timing(headerOpacity, {
        toValue: 0.3,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsThemeChanging(false);
    });

    // Toggle the actual theme
    toggleTheme();
  };

  const animateSettingToggle = (index: number, value: boolean) => {
    Animated.spring(settingsAnimations[index], {
      toValue: value ? 1 : 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  React.useEffect(() => {
    // Initialize settings animations
    settingsAnimations.forEach((anim, index) => {
      const initialValue = index === 0 ? notificationsEnabled :
        index === 1 ? voiceEnabled :
          isDark;
      anim.setValue(initialValue ? 1 : 0);
    });
  }, []);

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
      subtitle: 'تلقي التحديثات والتنبيهات',
      icon: 'notifications',
      color: '#FF6B6B',
      value: notificationsEnabled,
      onToggle: (value: boolean) => {
        animateSettingToggle(0, value);
        setNotificationsEnabled(value);
      },
    },
    {
      id: 'voice',
      title: 'المساعد الصوتي',
      subtitle: 'التفاعل بالصوت والكلام',
      icon: 'mic',
      color: '#4ECDC4',
      value: voiceEnabled,
      onToggle: (value: boolean) => {
        animateSettingToggle(1, value);
        setVoiceEnabled(value);
      },
    },
    {
      id: 'darkmode',
      title: 'الوضع الليلي',
      subtitle: 'حماية العينين في الإضاءة المنخفضة',
      icon: 'moon',
      color: '#9B59B6',
      value: isDark,
      onToggle: (value: boolean) => {
        animateSettingToggle(2, value);
        handleThemeToggle();
      },
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Enhanced Profile Header */}
        <Animated.View style={[styles.profileHeader, { opacity: headerOpacity }]}>
          <LinearGradient
            colors={isThemeChanging
              ? (isDark ? ['#E31E24', '#D4AF37', '#FF6B6B'] : ['#2C3E50', '#34495E'])
              : [theme.colors.gradientStart, theme.colors.gradientEnd, theme.colors.primaryLight]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            {/* Floating Header Actions */}
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerButton} activeOpacity={0.8}>
                <BlurView intensity={20} style={styles.blurButton}>
                  <Ionicons name="notifications" size={24} color="#FFFFFF" />
                  <View style={styles.notificationDot} />
                </BlurView>
              </TouchableOpacity>

              <TouchableOpacity style={styles.headerButton} activeOpacity={0.8}>
                <BlurView intensity={20} style={styles.blurButton}>
                  <Ionicons name="settings" size={24} color="#FFFFFF" />
                </BlurView>
              </TouchableOpacity>
            </View>

            {/* Enhanced Profile Info */}
            <View style={styles.profileInfo}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={['#FFFFFF', '#F8F9FA']}
                  style={styles.avatar}
                >
                  <Ionicons name="person" size={48} color="#E31E24" />
                </LinearGradient>
                <TouchableOpacity style={styles.editAvatarButton} activeOpacity={0.8}>
                  <LinearGradient
                    colors={['#E31E24', '#FF6B6B']}
                    style={styles.editButtonGradient}
                  >
                    <Ionicons name="camera" size={16} color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userOccupation}>{user.occupation}</Text>
              <Text style={styles.userLocation}>📍 {user.region}</Text>

              {/* Mascot Integration */}
              <TouchableOpacity 
                style={styles.mascotContainer}
                onPress={() => navigation.navigate('MascotDemo')}
                activeOpacity={0.8}
              >
                <View style={styles.mascotWrapper}>
                  <SimpleMascot size={100} />
                </View>
                <Text style={styles.mascotLabel}>الشخصية التونسية</Text>
                <Text style={styles.mascotHint}>اضغط للتفاعل</Text>
              </TouchableOpacity>

              {/* Profile Completion Indicator */}
              <View style={styles.completionContainer}>
                <Text style={styles.completionText}>اكتمال الملف الشخصي</Text>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBackground}>
                    <LinearGradient
                      colors={['#4ECDC4', '#44A08D']}
                      style={[styles.progressBarFill, { width: `${user.profileCompletion}%` }]}
                    />
                  </View>
                  <Text style={styles.progressText}>{user.profileCompletion}%</Text>
                </View>
              </View>
            </View>

            {/* Enhanced Stats Row with Visual Improvements */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                  style={styles.statBackground}
                >
                  <Text style={styles.statValue}>{user.totalPoints}</Text>
                  <Text style={styles.statLabel}>النقاط</Text>
                  <View style={styles.statProgress}>
                    <View style={[styles.statProgressFill, {
                      width: `${(user.totalPoints / user.nextLevelPoints) * 100}%`
                    }]} />
                  </View>
                </LinearGradient>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                  style={styles.statBackground}
                >
                  <Text style={styles.statValue}>{user.achievements}</Text>
                  <Text style={styles.statLabel}>الإنجازات</Text>
                  <Ionicons name="trophy" size={16} color="#FFD700" style={styles.statIcon} />
                </LinearGradient>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                  style={styles.statBackground}
                >
                  <Text style={styles.statValue}>{user.streak}</Text>
                  <Text style={styles.statLabel}>أيام متتالية</Text>
                  <View style={styles.streakIndicator}>
                    <Ionicons name="flame" size={16} color="#FF6B6B" />
                  </View>
                </LinearGradient>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Enhanced Level Badge with Progress */}
        <View style={styles.levelBadgeContainer}>
          <LinearGradient
            colors={['#D4AF37', '#FFD700', '#FFA500']}
            style={styles.levelBadge}
          >
            <Ionicons name="star" size={20} color="#FFFFFF" />
            <Text style={styles.levelText}>{user.currentLevel}</Text>
          </LinearGradient>

          {/* Next Level Progress */}
          <View style={styles.levelProgressContainer}>
            <Text style={styles.levelProgressText}>
              {user.totalPoints} / {user.nextLevelPoints} للمستوى التالي
            </Text>
            <View style={styles.levelProgressBar}>
              <LinearGradient
                colors={['#D4AF37', '#FFD700']}
                style={[styles.levelProgressFill, {
                  width: `${(user.totalPoints / user.nextLevelPoints) * 100}%`
                }]}
              />
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>الحساب</Text>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon as any} size={24} color={item.color} />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color="#999999" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Enhanced Settings with Better Visual Design */}
        <View style={styles.menuSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>الإعدادات</Text>
            <Text style={styles.sectionSubtitle}>تخصيص تجربتك</Text>
          </View>

          {settingsItems.map((item, index) => (
            <Animated.View
              key={item.id}
              style={[
                styles.settingItem,
                {
                  transform: [{
                    scale: settingsAnimations[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.02],
                    })
                  }]
                }
              ]}
            >
              <View style={styles.settingLeft}>
                <LinearGradient
                  colors={[item.color + '20', item.color + '10']}
                  style={styles.settingIcon}
                >
                  <Ionicons name={item.icon as any} size={24} color={item.color} />
                </LinearGradient>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>{item.title}</Text>
                  <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                </View>
              </View>

              <View style={styles.switchContainer}>
                <Switch
                  value={item.value}
                  onValueChange={item.onToggle}
                  trackColor={{
                    false: '#E0E0E0',
                    true: item.color + '40'
                  }}
                  thumbColor={item.value ? item.color : '#FFFFFF'}
                  ios_backgroundColor="#E0E0E0"
                  style={styles.switch}
                />
                {item.value && (
                  <Animated.View
                    style={[
                      styles.activeIndicator,
                      {
                        opacity: settingsAnimations[index],
                        transform: [{
                          scale: settingsAnimations[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.8, 1],
                          })
                        }]
                      }
                    ]}
                  >
                    <Ionicons name="checkmark-circle" size={16} color={item.color} />
                  </Animated.View>
                )}
              </View>
            </Animated.View>
          ))}

          {/* Theme Selector */}
          <View style={styles.themeSelector}>
            <Text style={styles.themeSelectorTitle}>اختيار المظهر</Text>
            <View style={styles.themeOptions}>
              {[
                { id: 'light', name: 'فاتح', icon: 'sunny', color: '#FFD700' },
                { id: 'dark', name: 'داكن', icon: 'moon', color: '#9B59B6' },
                { id: 'auto', name: 'تلقائي', icon: 'phone-portrait', color: '#4ECDC4' },
              ].map((themeOption) => (
                <TouchableOpacity
                  key={themeOption.id}
                  style={[
                    styles.themeOption,
                    themeOption.id === (isDark ? 'dark' : 'light') && styles.selectedTheme
                  ]}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (themeOption.id === 'dark' && !isDark) {
                      handleThemeToggle();
                    } else if (themeOption.id === 'light' && isDark) {
                      handleThemeToggle();
                    }
                  }}
                >
                  <LinearGradient
                    colors={[themeOption.color + '20', themeOption.color + '10']}
                    style={styles.themeIconContainer}
                  >
                    <Ionicons name={themeOption.icon as any} size={20} color={themeOption.color} />
                  </LinearGradient>
                  <Text style={[
                    styles.themeOptionText,
                    themeOption.id === (isDark ? 'dark' : 'light') && styles.selectedThemeText
                  ]}>
                    {themeOption.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
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
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const getStyles = createThemedStyles((theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  profileHeader: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  headerGradient: {
    padding: 24,
    paddingTop: 20,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 24,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginLeft: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  blurButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
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
    marginBottom: 28,
  },
  mascotContainer: {
    marginTop: 12,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 8,
  },
  mascotLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    textAlign: 'center',
  },
  mascotHint: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  mascotWrapper: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  completionContainer: {
    marginTop: 16,
    alignItems: 'center',
    width: '100%',
  },
  completionText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
  },
  progressBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
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
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  editButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    gap: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statBackground: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    position: 'relative',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  statProgress: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  statProgressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 1.5,
  },
  statIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  streakIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  levelBadgeContainer: {
    alignItems: 'center',
    marginTop: -20,
    marginBottom: 28,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  levelText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  levelProgressContainer: {
    alignItems: 'center',
    marginTop: 12,
    width: screenWidth * 0.7,
  },
  levelProgressText: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 6,
  },
  levelProgressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  levelProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  menuSection: {
    marginHorizontal: 16,
    marginBottom: 28,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
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
    color: theme.colors.text,
    fontWeight: '500',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 17,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
  activeIndicator: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
  themeSelector: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  themeSelectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  themeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: theme.colors.background,
  },
  selectedTheme: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '15',
  },
  themeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  themeOptionText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  selectedThemeText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 100,
  },
}));