import { useCallback } from 'react';
import { useMascot } from '../contexts/MascotContext';
import {
  MascotEmotion,
  MascotSector,
  MascotInteraction,
  MascotAnimation
} from '../types/mascot';

export const useMascotInteractions = () => {
  const { mascotState, updateSector, updateEmotion, triggerInteraction } = useMascot();

  // Predefined interactions for common scenarios
  const greetUser = useCallback(() => {
    const greetingInteraction: MascotInteraction = {
      trigger: 'greeting',
      emotion: MascotEmotion.GREETING,
      animation: {
        type: 'interaction',
        duration: 2000,
        easing: 'ease-out'
      }
    };
    triggerInteraction(greetingInteraction);
  }, [triggerInteraction]);

  const celebrateAchievement = useCallback((culturalElements?: string[]) => {
    const celebrationInteraction: MascotInteraction = {
      trigger: 'achievement',
      emotion: MascotEmotion.CELEBRATING,
      animation: {
        type: 'celebration',
        duration: 3000,
        easing: 'bounce'
      },
      culturalElements
    };
    triggerInteraction(celebrationInteraction);
  }, [triggerInteraction]);

  const showThinking = useCallback(() => {
    const thinkingInteraction: MascotInteraction = {
      trigger: 'help',
      emotion: MascotEmotion.THINKING,
      animation: {
        type: 'interaction',
        duration: 1500,
        easing: 'ease-in-out'
      }
    };
    triggerInteraction(thinkingInteraction);
  }, [triggerInteraction]);

  const showExcitement = useCallback(() => {
    const excitementInteraction: MascotInteraction = {
      trigger: 'celebration',
      emotion: MascotEmotion.EXCITED,
      animation: {
        type: 'interaction',
        duration: 2000,
        easing: 'bounce'
      }
    };
    triggerInteraction(excitementInteraction);
  }, [triggerInteraction]);

  const showConcern = useCallback(() => {
    updateEmotion(MascotEmotion.CONCERNED);
  }, [updateEmotion]);

  const showHappiness = useCallback(() => {
    updateEmotion(MascotEmotion.HAPPY);
  }, [updateEmotion]);

  const switchToSector = useCallback((sector: MascotSector) => {
    updateSector(sector);
  }, [updateSector]);

  const explainConcept = useCallback(() => {
    const explainInteraction: MascotInteraction = {
      trigger: 'help',
      emotion: MascotEmotion.EXPLAINING,
      animation: {
        type: 'interaction',
        duration: 2500,
        easing: 'ease-in-out'
      }
    };
    triggerInteraction(explainInteraction);
  }, [triggerInteraction]);

  // Context-aware interactions based on current state
  const reactToUserAction = useCallback((action: 'success' | 'error' | 'help' | 'search' | 'chat') => {
    switch (action) {
      case 'success':
        showHappiness();
        break;
      case 'error':
        showConcern();
        break;
      case 'help':
        explainConcept();
        break;
      case 'search':
        showThinking();
        break;
      case 'chat':
        greetUser();
        break;
    }
  }, [showHappiness, showConcern, explainConcept, showThinking, greetUser]);

  // Sector-specific reactions
  const reactToSectorContent = useCallback((contentType: 'legal_document' | 'case_study' | 'law_article' | 'procedure') => {
    switch (contentType) {
      case 'legal_document':
        if (mascotState.currentSector === MascotSector.LEGAL) {
          explainConcept();
        } else {
          switchToSector(MascotSector.LEGAL);
        }
        break;
      case 'case_study':
        showThinking();
        break;
      case 'law_article':
        explainConcept();
        break;
      case 'procedure':
        if (mascotState.currentSector === MascotSector.ADMINISTRATIVE) {
          explainConcept();
        } else {
          switchToSector(MascotSector.ADMINISTRATIVE);
        }
        break;
    }
  }, [mascotState.currentSector, explainConcept, showThinking, switchToSector]);

  // Cultural celebration for Tunisian holidays or events
  const celebrateTunisianEvent = useCallback((event: 'independence' | 'revolution' | 'ramadan' | 'eid') => {
    const culturalElements = {
      independence: ['tunisian_flag', 'olive_branch'],
      revolution: ['jasmine_flower', 'freedom_symbol'],
      ramadan: ['crescent_moon', 'traditional_lantern'],
      eid: ['celebration_lights', 'traditional_sweets']
    };

    celebrateAchievement(culturalElements[event]);
  }, [celebrateAchievement]);

  return {
    // Current state
    currentSector: mascotState.currentSector,
    currentEmotion: mascotState.currentEmotion,
    isAnimating: mascotState.isAnimating,
    customization: mascotState.customization,
    
    // Basic interactions
    greetUser,
    celebrateAchievement,
    showThinking,
    showExcitement,
    showConcern,
    showHappiness,
    switchToSector,
    explainConcept,
    
    // Context-aware interactions
    reactToUserAction,
    reactToSectorContent,
    celebrateTunisianEvent,
    
    // Direct trigger
    triggerInteraction
  };
};