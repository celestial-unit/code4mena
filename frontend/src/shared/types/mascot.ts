// 3D Mascot and cultural types
export interface TunisianMascot {
  id: string;
  name: string;
  nameAr: string;
  nameFr: string;
  sector: Sector;
  description: string;
  descriptionAr: string;
  descriptionFr: string;
  culturalElements: CulturalElement[];
  animations: MascotAnimation[];
  customizations: MascotCustomization[];
  voiceSyncCapability: boolean;
  tunisianSymbols: TunisianSymbol[];
  gltfModel?: string;
  isUnlocked: boolean;
  unlockRequirement?: UnlockRequirement;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  popularity: number;
}

export interface CulturalElement {
  id: string;
  type:
    | 'clothing'
    | 'accessories'
    | 'background'
    | 'props'
    | 'architecture'
    | 'food'
    | 'music';
  name: string;
  nameAr: string;
  nameFr: string;
  tunisianReference: string;
  tunisianReferenceAr: string;
  tunisianReferenceFr: string;
  culturalSignificance: string;
  culturalSignificanceAr: string;
  culturalSignificanceFr: string;
  visualRepresentation: string;
  historicalContext?: string;
  historicalContextAr?: string;
  historicalContextFr?: string;
  region?: Region;
  isTraditional: boolean;
  modernAdaptation?: string;
}

export interface MascotAnimation {
  id: string;
  name: string;
  nameAr: string;
  nameFr: string;
  type: AnimationType;
  sector: Sector;
  duration: number;
  description: string;
  descriptionAr: string;
  descriptionFr: string;
  triggers: AnimationTrigger[];
  culturalContext: string[];
  culturalContextAr: string[];
  culturalContextFr: string[];
  voiceSync: boolean;
  emotionalTone: EmotionalTone;
  complexity: 'simple' | 'medium' | 'complex';
  skiaAnimationData?: any; // React Native Skia animation data
}

export interface TunisianSymbol {
  id: string;
  name: string;
  nameAr: string;
  nameFr: string;
  type:
    | 'geometric'
    | 'calligraphy'
    | 'architectural'
    | 'natural'
    | 'cultural'
    | 'religious';
  description: string;
  descriptionAr: string;
  descriptionFr: string;
  significance: string;
  significanceAr: string;
  significanceFr: string;
  usage:
    | 'decoration'
    | 'clothing'
    | 'architecture'
    | 'ceremonial'
    | 'daily_life';
  region?: Region;
  historicalPeriod?: string;
  modernUsage: boolean;
  visualElements: VisualElement[];
}

export interface VisualElement {
  id: string;
  type: 'color' | 'pattern' | 'shape' | 'texture' | 'motif';
  value: string;
  description: string;
  descriptionAr: string;
  descriptionFr: string;
  culturalMeaning: string;
  culturalMeaningAr: string;
  culturalMeaningFr: string;
}

export interface MascotCustomization {
  id: string;
  type:
    | 'clothing'
    | 'accessories'
    | 'background'
    | 'props'
    | 'animation'
    | 'voice'
    | 'personality';
  name: string;
  nameAr: string;
  nameFr: string;
  description: string;
  descriptionAr: string;
  descriptionFr: string;
  sector: Sector;
  culturalSignificance: string;
  culturalSignificanceAr: string;
  culturalSignificanceFr: string;
  unlockRequirement?: UnlockRequirement;
  isUnlocked: boolean;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  cost?: number; // Achievement points cost
  previewImage?: string;
  modelData?: any; // 3D model customization data
}

export interface UnlockRequirement {
  type: 'achievement' | 'points' | 'activity' | 'time' | 'special_event';
  value: number | string;
  description: string;
  descriptionAr: string;
  descriptionFr: string;
  progress?: number;
  isCompleted: boolean;
}

export interface MascotInteraction {
  id: string;
  mascotId: string;
  userId: string;
  type: InteractionType;
  context: InteractionContext;
  timestamp: Date;
  duration: number;
  userSatisfaction?: number;
  culturalRelevance: number;
  metadata: InteractionMetadata;
}

export interface InteractionContext {
  screen: string;
  feature: string;
  legalCategory?: LegalCategory;
  sector?: Sector;
  language: Language;
  userEmotion?: EmotionalTone;
  conversationTopic?: string;
  achievementUnlocked?: string;
}

export interface InteractionMetadata {
  animationsPlayed: string[];
  voiceInteractions: number;
  customizationsUsed: string[];
  culturalElementsShown: string[];
  userEngagement: number;
  sessionId: string;
}

export interface MascotPersonality {
  id: string;
  name: string;
  nameAr: string;
  nameFr: string;
  sector: Sector;
  traits: PersonalityTrait[];
  communicationStyle: CommunicationStyle;
  culturalBackground: CulturalBackground;
  voiceCharacteristics: VoiceCharacteristics;
  behaviorPatterns: BehaviorPattern[];
  emotionalRange: EmotionalTone[];
}

export interface PersonalityTrait {
  trait: string;
  traitAr: string;
  traitFr: string;
  intensity: number; // 1-10 scale
  description: string;
  descriptionAr: string;
  descriptionFr: string;
  culturalContext: string;
  culturalContextAr: string;
  culturalContextFr: string;
}

export interface CommunicationStyle {
  formality: 'very_formal' | 'formal' | 'neutral' | 'casual' | 'very_casual';
  enthusiasm: number; // 1-10 scale
  helpfulness: number; // 1-10 scale
  patience: number; // 1-10 scale
  humor: number; // 1-10 scale
  culturalReferences: number; // 1-10 scale
  dialectUsage: number; // 1-10 scale
}

export interface CulturalBackground {
  region: Region;
  traditions: string[];
  traditionsAr: string[];
  traditionsFr: string[];
  values: string[];
  valuesAr: string[];
  valuesFr: string[];
  historicalKnowledge: string[];
  historicalKnowledgeAr: string[];
  historicalKnowledgeFr: string[];
  modernAdaptations: string[];
  modernAdaptationsAr: string[];
  modernAdaptationsFr: string[];
}

export interface VoiceCharacteristics {
  gender: 'male' | 'female' | 'neutral';
  age: 'young' | 'adult' | 'mature' | 'elderly';
  dialect: TunisianDialect;
  tone: 'warm' | 'professional' | 'friendly' | 'authoritative' | 'gentle';
  pace: 'slow' | 'normal' | 'fast';
  pitch: 'low' | 'medium' | 'high';
  accent: 'light' | 'moderate' | 'strong';
  emotionalExpressiveness: number; // 1-10 scale
}

export interface BehaviorPattern {
  trigger: string;
  triggerAr: string;
  triggerFr: string;
  response: string;
  responseAr: string;
  responseFr: string;
  animation?: string;
  probability: number; // 0-1 scale
  culturalContext: string;
  culturalContextAr: string;
  culturalContextFr: string;
}

export type AnimationType =
  | 'greeting'
  | 'thinking'
  | 'explaining'
  | 'celebrating'
  | 'concerned'
  | 'neutral'
  | 'pointing'
  | 'nodding'
  | 'shaking_head'
  | 'clapping'
  | 'dancing'
  | 'reading'
  | 'writing'
  | 'listening'
  | 'speaking'
  | 'surprised'
  | 'confused'
  | 'happy'
  | 'sad'
  | 'excited'
  | 'calm'
  | 'working'
  | 'resting'
  | 'cultural_gesture';

export type AnimationTrigger =
  | 'user_message'
  | 'ai_response'
  | 'achievement_unlock'
  | 'screen_enter'
  | 'screen_exit'
  | 'button_press'
  | 'voice_input'
  | 'error_occurred'
  | 'success_action'
  | 'idle_timeout'
  | 'notification_received'
  | 'search_completed'
  | 'bookmark_added'
  | 'profile_updated'
  | 'settings_changed';

export type EmotionalTone =
  | 'happy'
  | 'excited'
  | 'calm'
  | 'focused'
  | 'concerned'
  | 'surprised'
  | 'confused'
  | 'satisfied'
  | 'encouraging'
  | 'supportive'
  | 'professional'
  | 'friendly'
  | 'enthusiastic'
  | 'patient'
  | 'understanding';

export type InteractionType =
  | 'greeting'
  | 'conversation'
  | 'explanation'
  | 'celebration'
  | 'guidance'
  | 'feedback'
  | 'customization'
  | 'achievement'
  | 'error_help'
  | 'feature_introduction'
  | 'cultural_education'
  | 'voice_interaction'
  | 'gesture_recognition'
  | 'idle_interaction';

// Import types from other files
import type { Sector, LegalCategory } from './legal';
import type { Language, Region, TunisianDialect } from './user';
