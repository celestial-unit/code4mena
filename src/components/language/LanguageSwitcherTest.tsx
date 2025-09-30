import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useRTL } from '../../contexts/RTLContext';

export const LanguageSwitcherTest: React.FC = () => {
  const { currentLanguage, setLanguage, isRTL, getTextAlign } = useRTL();

  const handleLanguageChange = async (languageCode: string) => {
    console.log('Language changing to:', languageCode);
    await setLanguage(languageCode);
    console.log('Language changed successfully');
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { textAlign: getTextAlign() }]}>
        Language Switcher Test
      </Text>

      <Text style={[styles.info, { textAlign: getTextAlign() }]}>
        Current Language: {currentLanguage}
      </Text>

      <Text style={[styles.info, { textAlign: getTextAlign() }]}>
        RTL Mode: {isRTL ? 'Enabled' : 'Disabled'}
      </Text>

      <View style={styles.switcherContainer}>
        <LanguageSwitcher
          currentLanguage={currentLanguage}
          onLanguageChange={handleLanguageChange}
        />
      </View>

      <Text style={[styles.testText, { textAlign: getTextAlign() }]}>
        {currentLanguage === 'ar' && 'هذا نص تجريبي باللغة العربية'}
        {currentLanguage === 'fr' && 'Ceci est un texte de test en français'}
        {currentLanguage === 'en' && 'This is a test text in English'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  info: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 10,
  },
  switcherContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  testText: {
    fontSize: 18,
    color: '#E31E24',
    fontWeight: '600',
    marginTop: 20,
    lineHeight: 28,
  },
});
