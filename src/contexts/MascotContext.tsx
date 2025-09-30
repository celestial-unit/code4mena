import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  MascotSector,
  MascotEmotion,
  MascotCulturalVariation,
  MascotState,
  MascotCustomization,
  MascotInteraction,
  MascotAnimation,
} from '../types/mascot';

interface MascotContextType {
  mascotState: MascotState;
  updateSector: (sector: MascotSector) => void;
  updateEmotion: (emotion: MascotEmotion) => void;
  updateCustomization: (customization: Partial<MascotCustomization>) => void;
  triggerInteraction: (interaction: MascotInteraction) => void;
  resetToDefault: () => void;
  isLoading: boolean;
}

const defaultCustomization: MascotCustomization = {
  culturalVariation: MascotCulturalVariation.TRADITIONAL,
  clothingStyle: 'traditional',
  accessories: ['olive_branch'],
  colorScheme: 'default',
};

const defaultMascotState: MascotState = {
  currentSector: MascotSector.GENERAL,
  currentEmotion: MascotEmotion.NEUTRAL,
  customization: defaultCustomization,
  isAnimating: false,
  lastInteraction: null,
};

const MascotContext = createContext<MascotContextType | undefined>(undefined);

interface MascotProviderProps {
  children: ReactNode;
}

const MASCOT_STORAGE_KEY = '@mascot_state';

export const MascotProvider: React.FC<MascotProviderProps> = ({ children }) => {
  const [mascotState, setMascotState] =
    useState<MascotState>(defaultMascotState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMascotState();
  }, []);

  const loadMascotState = async () => {
    try {
      const savedState = await AsyncStorage.getItem(MASCOT_STORAGE_KEY);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        setMascotState({
          ...defaultMascotState,
          ...parsedState,
          isAnimating: false, // Reset animation state on load
          lastInteraction: parsedState.lastInteraction
            ? new Date(parsedState.lastInteraction)
            : null,
        });
      }
    } catch (error) {
      console.error('Error loading mascot state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveMascotState = async (state: MascotState) => {
    try {
      await AsyncStorage.setItem(MASCOT_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving mascot state:', error);
    }
  };

  const updateSector = (sector: MascotSector) => {
    const newState = {
      ...mascotState,
      currentSector: sector,
      currentEmotion: MascotEmotion.THINKING, // Show thinking when switching sectors
      isAnimating: true,
      lastInteraction: new Date(),
    };
    setMascotState(newState);
    saveMascotState(newState);

    // Reset to neutral after animation
    setTimeout(() => {
      const resetState = {
        ...newState,
        currentEmotion: MascotEmotion.NEUTRAL,
        isAnimating: false,
      };
      setMascotState(resetState);
      saveMascotState(resetState);
    }, 2000);
  };

  const updateEmotion = (emotion: MascotEmotion) => {
    const newState = {
      ...mascotState,
      currentEmotion: emotion,
      isAnimating: true,
      lastInteraction: new Date(),
    };
    setMascotState(newState);
    saveMascotState(newState);

    // Reset animation state after duration
    setTimeout(() => {
      const resetState = {
        ...newState,
        isAnimating: false,
      };
      setMascotState(resetState);
      saveMascotState(resetState);
    }, 1500);
  };

  const updateCustomization = (customization: Partial<MascotCustomization>) => {
    const newState = {
      ...mascotState,
      customization: {
        ...mascotState.customization,
        ...customization,
      },
      lastInteraction: new Date(),
    };
    setMascotState(newState);
    saveMascotState(newState);
  };

  const triggerInteraction = (interaction: MascotInteraction) => {
    const newState = {
      ...mascotState,
      currentEmotion: interaction.emotion,
      isAnimating: true,
      lastInteraction: new Date(),
    };
    setMascotState(newState);
    saveMascotState(newState);

    // Handle different interaction types
    setTimeout(() => {
      let finalEmotion = MascotEmotion.NEUTRAL;

      switch (interaction.trigger) {
        case 'achievement':
          finalEmotion = MascotEmotion.HAPPY;
          break;
        case 'celebration':
          finalEmotion = MascotEmotion.EXCITED;
          break;
        case 'greeting':
          finalEmotion = MascotEmotion.NEUTRAL;
          break;
        default:
          finalEmotion = MascotEmotion.NEUTRAL;
      }

      const resetState = {
        ...newState,
        currentEmotion: finalEmotion,
        isAnimating: false,
      };
      setMascotState(resetState);
      saveMascotState(resetState);
    }, interaction.animation.duration);
  };

  const resetToDefault = () => {
    setMascotState(defaultMascotState);
    saveMascotState(defaultMascotState);
  };

  const value: MascotContextType = {
    mascotState,
    updateSector,
    updateEmotion,
    updateCustomization,
    triggerInteraction,
    resetToDefault,
    isLoading,
  };

  return (
    <MascotContext.Provider value={value}>{children}</MascotContext.Provider>
  );
};

export const useMascot = (): MascotContextType => {
  const context = useContext(MascotContext);
  if (context === undefined) {
    throw new Error('useMascot must be used within a MascotProvider');
  }
  return context;
};
