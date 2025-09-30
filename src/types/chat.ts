// Chat and conversation types
export interface ChatConversation {
  id: string;
  userId: string;
  title: string;
  titleAr: string;
  titleFr: string;
  messages: ChatMessage[];
  category: LegalCategory;
  sector: Sector;
  language: Language;
  isBookmarked: boolean;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'archived' | 'deleted';
  metadata: ConversationMetadata;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  contentAr?: string;
  contentFr?: string;
  timestamp: Date;
  isEdited: boolean;
  editedAt?: Date;
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
  metadata: MessageMetadata;
  voiceData?: VoiceMessageData;
  mascotAnimation?: ChatMascotAnimation;
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'document' | 'audio' | 'video' | 'link';
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  thumbnail?: string;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

export interface MessageMetadata {
  confidence?: number;
  sources?: string[];
  processingTime?: number;
  legalReferences?: LegalReference[];
  suggestedActions?: SuggestedAction[];
  relatedTopics?: string[];
  culturalContext?: TunisianContext;
}

export interface ConversationMetadata {
  totalMessages: number;
  averageResponseTime: number;
  topicsDiscussed: string[];
  legalCategoriesCovered: LegalCategory[];
  sectorsDiscussed: Sector[];
  satisfactionRating?: number;
  feedbackProvided?: boolean;
  complexityLevel: 'basic' | 'intermediate' | 'advanced' | 'expert';
}

export interface VoiceMessageData {
  audioUrl: string;
  duration: number;
  transcript: string;
  transcriptAr?: string;
  transcriptFr?: string;
  dialect: TunisianDialect;
  confidence: number;
  waveform: number[];
}

export interface ChatMascotAnimation {
  type:
    | 'greeting'
    | 'thinking'
    | 'explaining'
    | 'celebrating'
    | 'concerned'
    | 'neutral';
  sector: Sector;
  duration: number;
  culturalElements: string[];
  voiceSync: boolean;
}

export interface LegalReference {
  id: string;
  title: string;
  titleAr: string;
  titleFr: string;
  type: 'law' | 'regulation' | 'decree' | 'circular' | 'jurisprudence';
  source: string;
  url?: string;
  relevanceScore: number;
  excerpt: string;
  excerptAr: string;
  excerptFr: string;
}

export interface SuggestedAction {
  id: string;
  type:
    | 'search'
    | 'read_update'
    | 'contact_expert'
    | 'bookmark'
    | 'share'
    | 'follow_up';
  title: string;
  titleAr: string;
  titleFr: string;
  description: string;
  descriptionAr: string;
  descriptionFr: string;
  actionData?: any;
  priority: 'high' | 'medium' | 'low';
}

export interface QuickReply {
  id: string;
  text: string;
  textAr: string;
  textFr: string;
  category: LegalCategory;
  sector?: Sector;
  isPopular: boolean;
  usageCount: number;
}

export interface ChatTemplate {
  id: string;
  name: string;
  nameAr: string;
  nameFr: string;
  description: string;
  descriptionAr: string;
  descriptionFr: string;
  category: LegalCategory;
  sector: Sector;
  questions: TemplateQuestion[];
  estimatedDuration: number;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
}

export interface TemplateQuestion {
  id: string;
  question: string;
  questionAr: string;
  questionFr: string;
  order: number;
  isRequired: boolean;
  expectedAnswerType: 'text' | 'choice' | 'number' | 'date' | 'boolean';
  choices?: TemplateChoice[];
  validation?: QuestionValidation;
}

export interface TemplateChoice {
  id: string;
  text: string;
  textAr: string;
  textFr: string;
  value: string;
}

export interface QuestionValidation {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  customMessage?: string;
  customMessageAr?: string;
  customMessageFr?: string;
}

export interface ChatSettings {
  language: Language;
  voiceEnabled: boolean;
  mascotEnabled: boolean;
  autoTranslate: boolean;
  responseStyle: 'formal' | 'casual' | 'professional' | 'friendly';
  culturalContext: boolean;
  dialectSupport: boolean;
  quickRepliesEnabled: boolean;
  suggestionsEnabled: boolean;
  notificationsEnabled: boolean;
}

// Import types from other files
import type { LegalCategory, Sector, TunisianContext } from './legal';
import type { Language, TunisianDialect } from './user';
