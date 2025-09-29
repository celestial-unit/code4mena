import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../contexts/ThemeContext';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
}

interface LanguageSwitcherProps {
  currentLanguage: string;
  onLanguageChange: (languageCode: string) => void;
  style?: any;
}

const SUPPORTED_LANGUAGES: Language[] = [
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇹🇳',
    rtl: true,
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    rtl: false,
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false,
  },
];

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  currentLanguage,
  onLanguageChange,
  style,
}) => {
  const { theme } = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const currentLang = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    if (isModalVisible) {
      Animated.parallel([
        Animated.timing(modalAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(modalAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isModalVisible]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setIsModalVisible(true);
  };

  const handleLanguageSelect = (languageCode: string) => {
    if (languageCode !== currentLanguage) {
      onLanguageChange(languageCode);
    }
    setIsModalVisible(false);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      {/* Language Switcher Button */}
      <Animated.View
        style={[
          style,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.switcherButton}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FFFFFF', '#F8F9FA']}
            style={styles.buttonGradient}
          >
            <Text style={styles.flagEmoji}>{currentLang.flag}</Text>
            <View style={styles.languageInfo}>
              <Text style={styles.languageCode}>{currentLang.code.toUpperCase()}</Text>
              <Text style={styles.languageName}>{currentLang.nativeName}</Text>
            </View>
            <Ionicons name="chevron-down" size={16} color="#666666" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Language Selection Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="none"
        onRequestClose={closeModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeModal}
        >
          <BlurView intensity={20} style={styles.blurOverlay}>
            <Animated.View
              style={[
                styles.modalContainer,
                {
                  opacity: modalAnim,
                  transform: [
                    { translateY: slideAnim },
                    {
                      scale: modalAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.9, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity activeOpacity={1}>
                <LinearGradient
                  colors={['#FFFFFF', '#F8F9FA']}
                  style={styles.modalContent}
                >
                  {/* Modal Header */}
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>اختر اللغة / Choose Language</Text>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={closeModal}
                    >
                      <Ionicons name="close" size={24} color="#666666" />
                    </TouchableOpacity>
                  </View>

                  {/* Language Options */}
                  <View style={styles.languageList}>
                    {SUPPORTED_LANGUAGES.map((language, index) => {
                      const isSelected = language.code === currentLanguage;
                      
                      return (
                        <TouchableOpacity
                          key={language.code}
                          style={[
                            styles.languageOption,
                            isSelected && styles.selectedLanguageOption,
                          ]}
                          onPress={() => handleLanguageSelect(language.code)}
                          activeOpacity={0.7}
                        >
                          {isSelected && (
                            <LinearGradient
                              colors={['#E31E24', '#FF4757']}
                              style={styles.selectedBackground}
                            />
                          )}
                          
                          <Text style={styles.languageFlag}>{language.flag}</Text>
                          
                          <View style={styles.languageDetails}>
                            <Text
                              style={[
                                styles.languageNativeName,
                                isSelected && styles.selectedLanguageText,
                              ]}
                            >
                              {language.nativeName}
                            </Text>
                            <Text
                              style={[
                                styles.languageEnglishName,
                                isSelected && styles.selectedLanguageSubtext,
                              ]}
                            >
                              {language.name}
                            </Text>
                            
                            {/* RTL Indicator */}
                            {language.rtl && (
                              <View style={styles.rtlIndicator}>
                                <Ionicons
                                  name="arrow-back"
                                  size={12}
                                  color={isSelected ? '#FFFFFF' : '#666666'}
                                />
                                <Text
                                  style={[
                                    styles.rtlText,
                                    isSelected && styles.selectedLanguageSubtext,
                                  ]}
                                >
                                  RTL
                                </Text>
                              </View>
                            )}
                          </View>

                          {/* Selection Indicator */}
                          {isSelected && (
                            <View style={styles.selectionIndicator}>
                              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                            </View>
                          )}

                          {/* Cultural Elements */}
                          {language.code === 'ar' && (
                            <View style={styles.culturalElements}>
                              <Text style={styles.culturalText}>🕌</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Footer Info */}
                  <View style={styles.modalFooter}>
                    <View style={styles.footerInfo}>
                      <Ionicons name="information-circle" size={16} color="#666666" />
                      <Text style={styles.footerText}>
                        سيتم إعادة تشغيل التطبيق لتطبيق التغييرات
                      </Text>
                    </View>
                    
                    <View style={styles.tunisianBranding}>
                      <Ionicons name="flag" size={14} color="#E31E24" />
                      <Text style={styles.brandingText}>صُنع في تونس 🇹🇳</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </BlurView>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  switcherButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 100,
  },
  flagEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  languageInfo: {
    flex: 1,
  },
  languageCode: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1A1A',
    textTransform: 'uppercase',
  },
  languageName: {
    fontSize: 10,
    color: '#666666',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalContent: {
    padding: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageList: {
    padding: 16,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
    position: 'relative',
    overflow: 'hidden',
  },
  selectedLanguageOption: {
    backgroundColor: 'transparent',
  },
  selectedBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  languageFlag: {
    fontSize: 28,
    marginRight: 16,
  },
  languageDetails: {
    flex: 1,
  },
  languageNativeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  selectedLanguageText: {
    color: '#FFFFFF',
  },
  languageEnglishName: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
    marginBottom: 4,
  },
  selectedLanguageSubtext: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  rtlIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rtlText: {
    fontSize: 10,
    color: '#666666',
    fontWeight: '600',
    marginLeft: 4,
  },
  selectionIndicator: {
    marginLeft: 12,
  },
  culturalElements: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  culturalText: {
    fontSize: 16,
    opacity: 0.7,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    backgroundColor: '#F8F9FA',
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  footerText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 8,
    flex: 1,
  },
  tunisianBranding: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandingText: {
    fontSize: 11,
    color: '#E31E24',
    fontWeight: '600',
    marginLeft: 4,
  },
});