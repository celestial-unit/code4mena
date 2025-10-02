import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, createThemedStyles } from '../contexts/ThemeContext';
import { useTranslation } from '../i18n';
import { LanguageSwitcher } from '../components/language/LanguageSwitcher';

interface PreferencesScreenProps {
  navigation: any;
}

export const PreferencesScreen: React.FC<PreferencesScreenProps> = ({ navigation }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { t, language } = useTranslation();
  
  // Notification preferences
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [legalUpdates, setLegalUpdates] = useState(true);
  const [achievements, setAchievements] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [governmentAlerts, setGovernmentAlerts] = useState(true);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);

  // Display preferences
  const [fontSize, setFontSize] = useState(16);
  const [animations, setAnimations] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  // Privacy preferences
  const [dataSharing, setDataSharing] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [personalization, setPersonalization] = useState(true);
  const [locationTracking, setLocationTracking] = useState(false);
  const [voiceRecording, setVoiceRecording] = useState(true);

  // Voice preferences
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [noiseReduction, setNoiseReduction] = useState(true);
  const [autoTranscription, setAutoTranscription] = useState(true);

  // Animation values
  const sectionAnimations = useRef(
    Array.from({ length: 5 }, () => new Animated.Value(0))
  ).current;

  React.useEffect(() => {
    // Stagger section animations
    sectionAnimations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  const handleThemeChange = (value: boolean) => {
    toggleTheme();
    // Add theme change animation
    Alert.alert('تغيير المظهر', 'تم تطبيق المظهر الجديد بنجاح');
  };

  const renderToggleSetting = (
    title: string,
    subtitle: string,
    value: boolean,
    onToggle: (value: boolean) => void,
    icon: string,
    color: string
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <LinearGradient
          colors={[color + '20', color + '10']}
          style={styles.settingIcon}
        >
          <Ionicons name={icon as any} size={20} color={color} />
        </LinearGradient>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#E0E0E0', true: color + '40' }}
        thumbColor={value ? color : '#FFFFFF'}
        ios_backgroundColor="#E0E0E0"
      />
    </View>
  );

  const renderStepperSetting = (
    title: string,
    subtitle: string,
    value: number,
    onValueChange: (value: number) => void,
    minimumValue: number,
    maximumValue: number,
    step: number,
    icon: string,
    color: string,
    formatValue?: (value: number) => string
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <LinearGradient
          colors={[color + '20', color + '10']}
          style={styles.settingIcon}
        >
          <Ionicons name={icon as any} size={20} color={color} />
        </LinearGradient>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <View style={styles.stepperContainer}>
        <TouchableOpacity
          style={[styles.stepperButton, { opacity: value <= minimumValue ? 0.5 : 1 }]}
          onPress={() => {
            const newValue = Math.max(minimumValue, value - step);
            onValueChange(newValue);
          }}
          disabled={value <= minimumValue}
          activeOpacity={0.7}
        >
          <Ionicons name="remove" size={16} color={color} />
        </TouchableOpacity>
        
        <View style={styles.stepperValue}>
          <Text style={styles.stepperValueText}>
            {formatValue ? formatValue(value) : value.toString()}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.stepperButton, { opacity: value >= maximumValue ? 0.5 : 1 }]}
          onPress={() => {
            const newValue = Math.min(maximumValue, value + step);
            onValueChange(newValue);
          }}
          disabled={value >= maximumValue}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={16} color={color} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSection = (
    title: string,
    subtitle: string,
    icon: string,
    color: string,
    children: React.ReactNode,
    animationIndex: number
  ) => (
    <Animated.View
      style={[
        styles.section,
        {
          opacity: sectionAnimations[animationIndex],
          transform: [{
            translateY: sectionAnimations[animationIndex].interpolate({
              inputRange: [0, 1],
              outputRange: [30, 0],
            })
          }]
        }
      ]}
    >
      <View style={styles.sectionHeader}>
        <LinearGradient
          colors={[color + '20', color + '10']}
          style={styles.sectionIcon}
        >
          <Ionicons name={icon as any} size={24} color={color} />
        </LinearGradient>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionSubtitle}>{subtitle}</Text>
        </View>
      </View>
      {children}
    </Animated.View>
  );

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
        
        <Text style={styles.headerTitle}>{t('preferences.title')}</Text>
        
        <TouchableOpacity style={styles.resetButton}>
          <Ionicons name="refresh" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Language Settings */}
        {renderSection(
          t('language.title'),
          t('language.subtitle'),
          'language',
          '#E31E24',
          <>
            <View style={styles.languageSection}>
              <View style={styles.languageSwitcherContainer}>
                <Text style={styles.languageSwitcherLabel}>{t('language.current')}</Text>
                <LanguageSwitcher
                  currentLanguage={language}
                  onLanguageChange={() => {}}
                  style={styles.languageSwitcher}
                />
              </View>
            </View>
          </>,
          0
        )}

        {/* Notification Settings */}
        {renderSection(
          t('preferences.notifications.title'),
          t('preferences.notifications.subtitle'),
          'notifications',
          '#FF6B6B',
          <>
            {renderToggleSetting(
              'الإشعارات الفورية',
              'تلقي إشعارات فورية على الجهاز',
              pushNotifications,
              setPushNotifications,
              'phone-portrait',
              '#FF6B6B'
            )}
            {renderToggleSetting(
              'إشعارات البريد الإلكتروني',
              'تلقي إشعارات عبر البريد الإلكتروني',
              emailNotifications,
              setEmailNotifications,
              'mail',
              '#FF6B6B'
            )}
            {renderToggleSetting(
              'التحديثات القانونية',
              'إشعارات عند صدور تحديثات قانونية جديدة',
              legalUpdates,
              setLegalUpdates,
              'document-text',
              '#FF6B6B'
            )}
            {renderToggleSetting(
              'الإنجازات',
              'إشعارات عند تحقيق إنجازات جديدة',
              achievements,
              setAchievements,
              'trophy',
              '#FF6B6B'
            )}
            {renderToggleSetting(
              'التذكيرات',
              'تذكيرات للمراجعة والمتابعة',
              reminders,
              setReminders,
              'alarm',
              '#FF6B6B'
            )}
            {renderToggleSetting(
              'تنبيهات حكومية',
              'إشعارات عاجلة من الجهات الحكومية',
              governmentAlerts,
              setGovernmentAlerts,
              'shield-checkmark',
              '#FF6B6B'
            )}
            {renderToggleSetting(
              'الساعات الهادئة',
              'إيقاف الإشعارات في أوقات محددة',
              quietHoursEnabled,
              setQuietHoursEnabled,
              'moon',
              '#FF6B6B'
            )}
          </>,
          0
        )}

        {/* Display Settings */}
        {renderSection(
          'العرض والمظهر',
          'تخصيص شكل ومظهر التطبيق',
          'color-palette',
          '#4ECDC4',
          <>
            {renderToggleSetting(
              'الوضع الليلي',
              'تفعيل المظهر الداكن لحماية العينين',
              isDark,
              handleThemeChange,
              'moon',
              '#4ECDC4'
            )}
            {renderStepperSetting(
              t('preferences.display.fontSize'),
              'تكبير أو تصغير حجم النصوص',
              fontSize,
              setFontSize,
              12,
              24,
              1,
              'text',
              '#4ECDC4',
              (value) => `${value}px`
            )}
            {renderToggleSetting(
              'الحركات والانتقالات',
              'تفعيل الحركات المرئية والانتقالات',
              animations,
              setAnimations,
              'play',
              '#4ECDC4'
            )}
            {renderToggleSetting(
              'تقليل الحركة',
              'تقليل الحركات للمستخدمين الحساسين',
              reducedMotion,
              setReducedMotion,
              'pause',
              '#4ECDC4'
            )}
            {renderToggleSetting(
              'التباين العالي',
              'زيادة التباين لتحسين الرؤية',
              highContrast,
              setHighContrast,
              'contrast',
              '#4ECDC4'
            )}
          </>,
          1
        )}

        {/* Privacy Settings */}
        {renderSection(
          'الخصوصية والأمان',
          'إدارة خصوصية البيانات والأمان',
          'shield-checkmark',
          '#9B59B6',
          <>
            {renderToggleSetting(
              'مشاركة البيانات',
              'السماح بمشاركة البيانات لتحسين الخدمة',
              dataSharing,
              setDataSharing,
              'share',
              '#9B59B6'
            )}
            {renderToggleSetting(
              'التحليلات',
              'جمع بيانات الاستخدام لتحسين التطبيق',
              analytics,
              setAnalytics,
              'analytics',
              '#9B59B6'
            )}
            {renderToggleSetting(
              'التخصيص الشخصي',
              'استخدام البيانات لتخصيص التجربة',
              personalization,
              setPersonalization,
              'person',
              '#9B59B6'
            )}
            {renderToggleSetting(
              'تتبع الموقع',
              'استخدام موقعك لتحسين الخدمات المحلية',
              locationTracking,
              setLocationTracking,
              'location',
              '#9B59B6'
            )}
            {renderToggleSetting(
              'تسجيل الصوت',
              'السماح بتسجيل الصوت للمساعد الذكي',
              voiceRecording,
              setVoiceRecording,
              'mic',
              '#9B59B6'
            )}
          </>,
          2
        )}

        {/* Voice Settings */}
        {renderSection(
          'إعدادات الصوت',
          'تخصيص المساعد الصوتي والتفاعل الصوتي',
          'mic',
          '#FF8C00',
          <>
            {renderToggleSetting(
              'المساعد الصوتي',
              'تفعيل التفاعل الصوتي مع التطبيق',
              voiceEnabled,
              setVoiceEnabled,
              'mic-circle',
              '#FF8C00'
            )}
            {renderStepperSetting(
              t('preferences.voice.speed'),
              'تحديد سرعة قراءة النصوص',
              voiceSpeed,
              setVoiceSpeed,
              0.5,
              2.0,
              0.1,
              'speedometer',
              '#FF8C00',
              (value) => `${value.toFixed(1)}x`
            )}
            {renderToggleSetting(
              'تقليل الضوضاء',
              'تحسين جودة التسجيل الصوتي',
              noiseReduction,
              setNoiseReduction,
              'volume-high',
              '#FF8C00'
            )}
            {renderToggleSetting(
              'النسخ التلقائي',
              'تحويل الكلام إلى نص تلقائياً',
              autoTranscription,
              setAutoTranscription,
              'document-text',
              '#FF8C00'
            )}
          </>,
          3
        )}

        {/* Advanced Settings */}
        {renderSection(
          'إعدادات متقدمة',
          'خيارات متقدمة للمستخدمين المتمرسين',
          'settings',
          '#D4AF37',
          <>
            <TouchableOpacity style={styles.advancedOption}>
              <View style={styles.advancedLeft}>
                <LinearGradient
                  colors={['#D4AF37' + '20', '#D4AF37' + '10']}
                  style={styles.settingIcon}
                >
                  <Ionicons name="download" size={20} color="#D4AF37" />
                </LinearGradient>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>تصدير البيانات</Text>
                  <Text style={styles.settingSubtitle}>تحميل نسخة من بياناتك</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.advancedOption}>
              <View style={styles.advancedLeft}>
                <LinearGradient
                  colors={['#D4AF37' + '20', '#D4AF37' + '10']}
                  style={styles.settingIcon}
                >
                  <Ionicons name="cloud-upload" size={20} color="#D4AF37" />
                </LinearGradient>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>النسخ الاحتياطي</Text>
                  <Text style={styles.settingSubtitle}>إدارة النسخ الاحتياطية</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.advancedOption}>
              <View style={styles.advancedLeft}>
                <LinearGradient
                  colors={['#D4AF37' + '20', '#D4AF37' + '10']}
                  style={styles.settingIcon}
                >
                  <Ionicons name="refresh" size={20} color="#D4AF37" />
                </LinearGradient>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>إعادة تعيين</Text>
                  <Text style={styles.settingSubtitle}>استعادة الإعدادات الافتراضية</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666666" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.advancedOption, styles.dangerOption]}>
              <View style={styles.advancedLeft}>
                <LinearGradient
                  colors={['#FF4444' + '20', '#FF4444' + '10']}
                  style={styles.settingIcon}
                >
                  <Ionicons name="trash" size={20} color="#FF4444" />
                </LinearGradient>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingTitle, styles.dangerText]}>حذف الحساب</Text>
                  <Text style={styles.settingSubtitle}>حذف الحساب نهائياً</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FF4444" />
            </TouchableOpacity>
          </>,
          4
        )}

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
  resetButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  sectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 120,
    gap: 8,
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  stepperValue: {
    minWidth: 60,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  stepperValueText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  advancedOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  advancedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  dangerOption: {
    borderBottomWidth: 0,
  },
  dangerText: {
    color: '#FF4444',
  },
  languageSection: {
    paddingVertical: 8,
  },
  languageSwitcherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  languageSwitcherLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  languageSwitcher: {
    minWidth: 120,
  },
  bottomSpacing: {
    height: 50,
  },
}));