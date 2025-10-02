import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translations
import ar from './locales/ar.json';
import fr from './locales/fr.json';
import en from './locales/en.json';

export type Language = 'ar' | 'fr' | 'en';

// Flatten nested translation object for easier access
type FlattenKeys<T, K extends keyof T = keyof T> = K extends string
  ? T[K] extends Record<string, any>
    ? `${K}.${FlattenKeys<T[K]>}`
    : K
  : never;

export type TranslationKey = FlattenKeys<typeof ar>;

// Define the nested translation structure type
type TranslationObject = Record<string, any>;

interface I18nConfig {
  currentLanguage: Language;
  fallbackLanguage: Language;
  translations: Record<Language, TranslationObject>;
}

class I18n {
  private config: I18nConfig = {
    currentLanguage: 'ar',
    fallbackLanguage: 'en',
    translations: {
      ar,
      fr,
      en,
    },
  };

  private listeners: Array<(language: Language) => void> = [];

  constructor() {
    this.loadLanguage();
  }

  private async loadLanguage() {
    try {
      const savedLanguage = await AsyncStorage.getItem('@app_language');
      if (savedLanguage && this.isValidLanguage(savedLanguage)) {
        this.config.currentLanguage = savedLanguage as Language;
        this.updateRTL();
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  }

  private isValidLanguage(lang: string): lang is Language {
    return ['ar', 'fr', 'en'].includes(lang);
  }

  private updateRTL() {
    const isRTL = this.config.currentLanguage === 'ar';
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
  }

  async setLanguage(language: Language) {
    if (!this.isValidLanguage(language)) {
      console.warn(`Invalid language: ${language}`);
      return;
    }

    this.config.currentLanguage = language;
    this.updateRTL();

    try {
      await AsyncStorage.setItem('@app_language', language);
    } catch (error) {
      console.error('Error saving language:', error);
    }

    // Notify listeners
    this.listeners.forEach(listener => listener(language));
  }

  getCurrentLanguage(): Language {
    return this.config.currentLanguage;
  }

  isRTL(): boolean {
    return this.config.currentLanguage === 'ar';
  }

  t(key: string, params?: Record<string, string | number>): string {
    const translation = this.getTranslation(key);
    
    if (!params) {
      return translation;
    }

    // Replace parameters in translation
    return Object.keys(params).reduce((text, paramKey) => {
      return text.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(params[paramKey]));
    }, translation);
  }

  private getTranslation(key: string): string {
    const currentTranslations = this.config.translations[this.config.currentLanguage];
    const fallbackTranslations = this.config.translations[this.config.fallbackLanguage];

    // Handle nested keys (e.g., "common.loading")
    const getNestedValue = (obj: TranslationObject, path: string): string => {
      const result = path.split('.').reduce((current, key) => {
        return current && typeof current === 'object' ? current[key] : undefined;
      }, obj);
      
      return typeof result === 'string' ? result : key;
    };

    const currentValue = getNestedValue(currentTranslations, key);
    if (currentValue !== key) {
      return currentValue;
    }

    const fallbackValue = getNestedValue(fallbackTranslations, key);
    return fallbackValue;
  }

  addListener(listener: (language: Language) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  getSupportedLanguages(): Array<{ code: Language; name: string; nativeName: string; flag: string }> {
    return [
      { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇹🇳' },
      { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
      { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    ];
  }
}

export const i18n = new I18n();

// React hook for using i18n
import { useState, useEffect } from 'react';

export function useTranslation() {
  const [currentLanguage, setCurrentLanguage] = useState(i18n.getCurrentLanguage());

  useEffect(() => {
    const unsubscribe = i18n.addListener(setCurrentLanguage);
    return unsubscribe;
  }, []);

  return {
    t: i18n.t.bind(i18n),
    language: currentLanguage,
    isRTL: i18n.isRTL(),
    setLanguage: i18n.setLanguage.bind(i18n),
    getSupportedLanguages: i18n.getSupportedLanguages.bind(i18n),
  };
}