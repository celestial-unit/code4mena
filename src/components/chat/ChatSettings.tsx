import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ChatSettings as ChatSettingsType, Language } from '../../types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ChatSettingsProps {
  onClose: () => void;
  conversationId: string;
}

export const ChatSettings: React.FC<ChatSettingsProps> = ({
  onClose,
  conversationId,
}) => {
  const [settings, setSettings] = useState<ChatSettingsType>({
    language: 'ar',
    voiceEnabled: true,
    mascotEnabled: true,
    autoTranslate: false,
    responseStyle: 'friendly',
    culturalContext: true,
    dialectSupport: true,
    quickRepliesEnabled: true,
    suggestionsEnabled: true,
    notificationsEnabled: true,
  });

  const handleSettingChange = (key: keyof ChatSettingsType, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const renderLanguageSelector = () => (
    <View style={styles.settingSection}>
      <Text style={styles.sectionTitle}>اللغة المفضلة</Text>
      <View style={styles.languageOptions}>
        {[
          { code: 'ar', name: 'العربية', flag: '🇹🇳' },
          { code: 'fr', name: 'Français', flag: '🇫🇷' },
          { code: 'en', name: 'English', flag: '🇺🇸' },
        ].map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[
              styles.languageOption,
              settings.language === lang.code && styles.selectedLanguage,
            ]}
            onPress={() => handleSettingChange('language', lang.code)}
          >
            <Text style={styles.languageFlag}>{lang.flag}</Text>
            <Text style={[
              styles.languageName,
              settings.language === lang.code && styles.selectedLanguageName,
            ]}>
              {lang.name}
            </Text>
            {settings.language === lang.code && (
              <Ionicons name="checkmark-circle" size={20} color="#E31E24" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderResponseStyleSelector = () => (
    <View style={styles.settingSection}>
      <Text style={styles.sectionTitle}>أسلوب الرد</Text>
      <View style={styles.styleOptions}>
        {[
          { value: 'formal', label: 'رسمي', icon: 'business-outline' },
          { value: 'casual', label: 'عادي', icon: 'chatbubble-outline' },
          { value: 'professional', label: 'مهني', icon: 'briefcase-outline' },
          { value: 'friendly', label: 'ودود', icon: 'happy-outline' },
        ].map((style) => (
          <TouchableOpacity
            key={style.value}
            style={[
              styles.styleOption,
              settings.responseStyle === style.value && styles.selectedStyle,
            ]}
            onPress={() => handleSettingChange('responseStyle', style.value)}
          >
            <Ionicons 
              name={style.icon as any} 
              size={20} 
              color={settings.responseStyle === style.value ? "#E31E24" : "#666666"} 
            />
            <Text style={[
              styles.styleLabel,
              settings.responseStyle === style.value && styles.selectedStyleLabel,
            ]}>
              {style.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderToggleSetting = (
    key: keyof ChatSettingsType,
    title: string,
    description: string,
    icon: string
  ) => (
    <View style={styles.toggleSetting}>
      <View style={styles.toggleInfo}>
        <Ionicons name={icon as any} size={24} color="#E31E24" />
        <View style={styles.toggleText}>
          <Text style={styles.toggleTitle}>{title}</Text>
          <Text style={styles.toggleDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={settings[key] as boolean}
        onValueChange={(value) => handleSettingChange(key, value)}
        trackColor={{ false: '#E0E0E0', true: '#E31E24' }}
        thumbColor={settings[key] ? '#FFFFFF' : '#FFFFFF'}
      />
    </View>
  );

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={['#E31E24', '#D4AF37']}
          style={styles.header}
        >
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>إعدادات المحادثة</Text>
          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveButtonText}>حفظ</Text>
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Language Settings */}
          {renderLanguageSelector()}

          {/* Response Style */}
          {renderResponseStyleSelector()}

          {/* Voice Settings */}
          <View style={styles.settingSection}>
            <Text style={styles.sectionTitle}>إعدادات الصوت</Text>
            {renderToggleSetting(
              'voiceEnabled',
              'تفعيل الصوت',
              'السماح بالتسجيل الصوتي والاستماع للردود',
              'mic-outline'
            )}
            {renderToggleSetting(
              'dialectSupport',
              'دعم اللهجة التونسية',
              'فهم وتحليل اللهجة التونسية المحلية',
              'language-outline'
            )}
          </View>

          {/* Visual Settings */}
          <View style={styles.settingSection}>
            <Text style={styles.sectionTitle}>الإعدادات المرئية</Text>
            {renderToggleSetting(
              'mascotEnabled',
              'تفعيل التميمة',
              'عرض التميمة التونسية ثلاثية الأبعاد',
              'happy-outline'
            )}
            {renderToggleSetting(
              'quickRepliesEnabled',
              'الردود السريعة',
              'عرض اقتراحات الأسئلة الشائعة',
              'flash-outline'
            )}
          </View>

          {/* Content Settings */}
          <View style={styles.settingSection}>
            <Text style={styles.sectionTitle}>إعدادات المحتوى</Text>
            {renderToggleSetting(
              'culturalContext',
              'السياق الثقافي',
              'تضمين المراجع الثقافية التونسية',
              'library-outline'
            )}
            {renderToggleSetting(
              'autoTranslate',
              'الترجمة التلقائية',
              'ترجمة الردود تلقائياً للغة المفضلة',
              'language-outline'
            )}
            {renderToggleSetting(
              'suggestionsEnabled',
              'الاقتراحات الذكية',
              'عرض اقتراحات المتابعة والإجراءات',
              'bulb-outline'
            )}
          </View>

          {/* Notification Settings */}
          <View style={styles.settingSection}>
            <Text style={styles.sectionTitle}>الإشعارات</Text>
            {renderToggleSetting(
              'notificationsEnabled',
              'إشعارات المحادثة',
              'تلقي إشعارات عند وصول ردود جديدة',
              'notifications-outline'
            )}
          </View>

          {/* Advanced Settings */}
          <View style={styles.settingSection}>
            <Text style={styles.sectionTitle}>إعدادات متقدمة</Text>
            
            <TouchableOpacity style={styles.advancedOption}>
              <Ionicons name="download-outline" size={20} color="#666666" />
              <Text style={styles.advancedOptionText}>تصدير المحادثة</Text>
              <Ionicons name="chevron-forward" size={16} color="#666666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.advancedOption}>
              <Ionicons name="bookmark-outline" size={20} color="#666666" />
              <Text style={styles.advancedOptionText}>الرسائل المحفوظة</Text>
              <Ionicons name="chevron-forward" size={16} color="#666666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.advancedOption}>
              <Ionicons name="search-outline" size={20} color="#666666" />
              <Text style={styles.advancedOptionText}>البحث في المحادثة</Text>
              <Ionicons name="chevron-forward" size={16} color="#666666" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.advancedOption, styles.dangerOption]}>
              <Ionicons name="trash-outline" size={20} color="#FF4444" />
              <Text style={[styles.advancedOptionText, styles.dangerText]}>
                حذف المحادثة
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#FF4444" />
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
  },
  closeButton: {
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
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  settingSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'right',
  },
  languageOptions: {
    gap: 8,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 12,
  },
  selectedLanguage: {
    borderColor: '#E31E24',
    backgroundColor: '#FFF5F5',
  },
  languageFlag: {
    fontSize: 20,
  },
  languageName: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
    textAlign: 'right',
  },
  selectedLanguageName: {
    color: '#E31E24',
    fontWeight: '600',
  },
  styleOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  styleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 8,
    minWidth: '45%',
  },
  selectedStyle: {
    borderColor: '#E31E24',
    backgroundColor: '#FFF5F5',
  },
  styleLabel: {
    fontSize: 14,
    color: '#666666',
  },
  selectedStyleLabel: {
    color: '#E31E24',
    fontWeight: '600',
  },
  toggleSetting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  toggleText: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'right',
  },
  toggleDescription: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
    textAlign: 'right',
  },
  advancedOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  advancedOptionText: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
    textAlign: 'right',
  },
  dangerOption: {
    borderBottomWidth: 0,
  },
  dangerText: {
    color: '#FF4444',
  },
  bottomSpacing: {
    height: 50,
  },
});