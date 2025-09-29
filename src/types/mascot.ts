// Mascot system types for Tunisian Legal App

export enum MascotSector {
  LEGAL = 'legal',
  BUSINESS = 'business',
  FAMILY = 'family',
  PROPERTY = 'property',
  LABOR = 'labor',
  CRIMINAL = 'criminal',
  ADMINISTRATIVE = 'administrative',
  GENERAL = 'general'
}

export enum MascotEmotion {
  NEUTRAL = 'neutral',
  HAPPY = 'happy',
  EXCITED = 'excited',
  THINKING = 'thinking',
  CONCERNED = 'concerned',
  CELEBRATING = 'celebrating',
  GREETING = 'greeting',
  EXPLAINING = 'explaining'
}

export enum MascotCulturalVariation {
  TRADITIONAL = 'traditional',
  MODERN = 'modern',
  COASTAL = 'coastal',
  DESERT = 'desert',
  URBAN = 'urban'
}

export interface MascotCustomization {
  culturalVariation: MascotCulturalVariation;
  clothingStyle: 'traditional' | 'modern' | 'professional';
  accessories: string[];
  colorScheme: 'default' | 'warm' | 'cool' | 'earth';
}

export interface MascotState {
  currentSector: MascotSector;
  currentEmotion: MascotEmotion;
  customization: MascotCustomization;
  isAnimating: boolean;
  lastInteraction: Date | null;
}

export interface MascotAnimation {
  type: 'idle' | 'transition' | 'celebration' | 'interaction';
  duration: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce';
  loop?: boolean;
}

export interface MascotInteraction {
  trigger: 'achievement' | 'sector_change' | 'greeting' | 'help' | 'celebration';
  emotion: MascotEmotion;
  animation: MascotAnimation;
  culturalElements?: string[];
}

// Tunisian cultural elements for authentic representation
export interface TunisianCulturalElements {
  colors: {
    flag: ['#E70013', '#FFFFFF'];
    traditional: ['#8B4513', '#DAA520', '#DC143C', '#228B22'];
    berber: ['#CD853F', '#F4A460', '#DEB887'];
  };
  patterns: {
    geometric: string[];
    traditional: string[];
    islamic: string[];
  };
  symbols: {
    olive: string;
    palm: string;
    crescent: string;
    star: string;
    carthage: string;
  };
  regions: {
    tunis: { colors: string[]; elements: string[] };
    sahel: { colors: string[]; elements: string[] };
    south: { colors: string[]; elements: string[] };
    north: { colors: string[]; elements: string[] };
  };
}