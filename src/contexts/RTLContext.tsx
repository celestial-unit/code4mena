import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RTLContextType {
  isRTL: boolean;
  currentLanguage: string;
  setLanguage: (languageCode: string) => Promise<void>;
  toggleRTL: () => Promise<void>;
  getTextAlign: () => 'left' | 'right';
  getFlexDirection: () => 'row' | 'row-reverse';
  getWritingDirection: () => 'ltr' | 'rtl';
}

const RTLContext = createContext<RTLContextType | undefined>(undefined);

interface RTLProviderProps {
  children: ReactNode;
}

const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];
const LANGUAGE_STORAGE_KEY = '@app_language';
const RTL_STORAGE_KEY = '@app_rtl';

export const RTLProvider: React.FC<RTLProviderProps> = ({ children }) => {
  const [isRTL, setIsRTL] = useState(I18nManager.isRTL);
  const [currentLanguage, setCurrentLanguage] = useState('ar'); // Default to Arabic

  useEffect(() => {
    loadLanguageSettings();
  }, []);

  const loadLanguageSettings = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      const savedRTL = await AsyncStorage.getItem(RTL_STORAGE_KEY);
      
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage);
        const shouldBeRTL = RTL_LANGUAGES.includes(savedLanguage);
        
        if (savedRTL !== null) {
          const isStoredRTL = JSON.parse(savedRTL);
          setIsRTL(isStoredRTL);
          
          // Apply RTL setting if different from current
          if (I18nManager.isRTL !== isStoredRTL) {
            I18nManager.allowRTL(isStoredRTL);
            I18nManager.forceRTL(isStoredRTL);
          }
        } else {
          // First time setup based on language
          setIsRTL(shouldBeRTL);
          if (I18nManager.isRTL !== shouldBeRTL) {
            I18nManager.allowRTL(shouldBeRTL);
            I18nManager.forceRTL(shouldBeRTL);
          }
          await AsyncStorage.setItem(RTL_STORAGE_KEY, JSON.stringify(shouldBeRTL));
        }
      }
    } catch (error) {
      console.error('Error loading language settings:', error);
    }
  };

  const setLanguage = async (languageCode: string) => {
    try {
      setCurrentLanguage(languageCode);
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
      
      const shouldBeRTL = RTL_LANGUAGES.includes(languageCode);
      
      if (shouldBeRTL !== isRTL) {
        await toggleRTL(shouldBeRTL);
      }
    } catch (error) {
      console.error('Error setting language:', error);
    }
  };

  const toggleRTL = async (forceValue?: boolean) => {
    try {
      const newRTLValue = forceValue !== undefined ? forceValue : !isRTL;
      
      setIsRTL(newRTLValue);
      await AsyncStorage.setItem(RTL_STORAGE_KEY, JSON.stringify(newRTLValue));
      
      // Apply RTL changes
      I18nManager.allowRTL(newRTLValue);
      I18nManager.forceRTL(newRTLValue);
      
      // Note: In a real app, you might want to restart the app here
      // or show a message to the user that they need to restart
      console.log('RTL changed to:', newRTLValue, '- App restart may be required');
    } catch (error) {
      console.error('Error toggling RTL:', error);
    }
  };

  const getTextAlign = (): 'left' | 'right' => {
    return isRTL ? 'right' : 'left';
  };

  const getFlexDirection = (): 'row' | 'row-reverse' => {
    return isRTL ? 'row-reverse' : 'row';
  };

  const getWritingDirection = (): 'ltr' | 'rtl' => {
    return isRTL ? 'rtl' : 'ltr';
  };

  const contextValue: RTLContextType = {
    isRTL,
    currentLanguage,
    setLanguage,
    toggleRTL,
    getTextAlign,
    getFlexDirection,
    getWritingDirection,
  };

  return (
    <RTLContext.Provider value={contextValue}>
      {children}
    </RTLContext.Provider>
  );
};

export const useRTL = (): RTLContextType => {
  const context = useContext(RTLContext);
  if (context === undefined) {
    throw new Error('useRTL must be used within an RTLProvider');
  }
  return context;
};

// Helper hook for creating RTL-aware styles
export const useRTLStyles = () => {
  const { isRTL, getTextAlign, getFlexDirection } = useRTL();

  const createRTLStyle = (ltrStyle: any, rtlStyle?: any) => {
    if (rtlStyle && isRTL) {
      return { ...ltrStyle, ...rtlStyle };
    }
    return ltrStyle;
  };

  const getMarginStart = (value: number) => ({
    [isRTL ? 'marginRight' : 'marginLeft']: value,
  });

  const getMarginEnd = (value: number) => ({
    [isRTL ? 'marginLeft' : 'marginRight']: value,
  });

  const getPaddingStart = (value: number) => ({
    [isRTL ? 'paddingRight' : 'paddingLeft']: value,
  });

  const getPaddingEnd = (value: number) => ({
    [isRTL ? 'paddingLeft' : 'paddingRight']: value,
  });

  const getStart = (value: number) => ({
    [isRTL ? 'right' : 'left']: value,
  });

  const getEnd = (value: number) => ({
    [isRTL ? 'left' : 'right']: value,
  });

  return {
    isRTL,
    createRTLStyle,
    getTextAlign,
    getFlexDirection,
    getMarginStart,
    getMarginEnd,
    getPaddingStart,
    getPaddingEnd,
    getStart,
    getEnd,
  };
};