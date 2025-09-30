// User and profile types
export interface User {
  id: string;
  name: string;
  nameAr?: string;
  email: string;
  phone?: string;
  avatar?: string;
  profile: UserProfile;
  preferences: UserPreferences;
  achievements: Achievement[];
  statistics: UserStatistics;
  createdAt: Date;
  lastActiveAt: Date;
  isVerified: boolean;
}

export interface UserProfile {
  sectors: Sector[];
  legalCategories: LegalCategory[];
  businessType?: BusinessType;
  region: Region;
  language: Language;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  interests: string[];
  interestsAr: string[];
  interestsFr: string[];
  occupation?: string;
  occupationAr?: string;
  occupationFr?: string;
  companySize?: CompanySize;
}

export interface UserPreferences {
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
  display: DisplaySettings;
  language: Language;
  mascot: MascotPreferences;
  voice: VoicePreferences;
}

export interface NotificationPreferences {
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  legalUpdates: boolean;
  achievements: boolean;
  reminders: boolean;
  governmentAlerts: boolean;
  parliamentaryUpdates: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  categories: {
    [key in LegalCategory]: boolean;
  };
}

export interface PrivacySettings {
  dataSharing: boolean;
  analytics: boolean;
  personalization: boolean;
  locationTracking: boolean;
  voiceRecording: boolean;
  communityFeatures: boolean;
  profileVisibility: 'public' | 'private' | 'friends';
}

export interface DisplaySettings {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large' | 'extra_large';
  animations: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  rtlLayout: boolean;
  colorScheme: 'default' | 'colorblind_friendly' | 'high_contrast';
}

export interface MascotPreferences {
  enabled: boolean;
  preferredSector: Sector;
  animationLevel: 'full' | 'reduced' | 'minimal';
  voiceSync: boolean;
  celebrations: boolean;
  customizations: MascotCustomization[];
}

export interface VoicePreferences {
  enabled: boolean;
  dialect: TunisianDialect;
  voiceSpeed: number;
  voiceGender: 'male' | 'female' | 'neutral';
  noiseReduction: boolean;
  autoTranscription: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  titleAr: string;
  titleFr: string;
  description: string;
  descriptionAr: string;
  descriptionFr: string;
  category: AchievementCategory;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  points: number;
  unlockedAt?: Date;
  progress?: AchievementProgress;
  requirements: AchievementRequirement[];
  rewards: AchievementReward[];
}

export interface AchievementProgress {
  current: number;
  target: number;
  percentage: number;
}

export interface AchievementRequirement {
  type:
    | 'legal_updates_read'
    | 'chat_conversations'
    | 'search_queries'
    | 'days_active'
    | 'achievements_unlocked';
  value: number;
  description: string;
  descriptionAr: string;
  descriptionFr: string;
}

export interface AchievementReward {
  type:
    | 'mascot_unlock'
    | 'customization'
    | 'badge'
    | 'points'
    | 'feature_unlock';
  value: string | number;
  description: string;
  descriptionAr: string;
  descriptionFr: string;
}

export interface UserStatistics {
  totalLegalUpdatesRead: number;
  totalChatConversations: number;
  totalSearchQueries: number;
  totalDaysActive: number;
  currentStreak: number;
  longestStreak: number;
  totalAchievements: number;
  totalPoints: number;
  favoriteCategory: LegalCategory;
  mostActiveSector: Sector;
  averageSessionDuration: number;
  lastWeekActivity: DailyActivity[];
  monthlyStats: MonthlyStatistics[];
}

export interface DailyActivity {
  date: Date;
  updatesRead: number;
  chatMessages: number;
  searchQueries: number;
  timeSpent: number; // in minutes
}

export interface MonthlyStatistics {
  month: string;
  year: number;
  updatesRead: number;
  chatConversations: number;
  searchQueries: number;
  achievementsUnlocked: number;
  totalTimeSpent: number;
}

export type BusinessType =
  | 'sole_proprietorship'
  | 'partnership'
  | 'corporation'
  | 'llc'
  | 'cooperative'
  | 'ngo'
  | 'government'
  | 'other';

export type Region =
  | 'tunis'
  | 'ariana'
  | 'ben_arous'
  | 'manouba'
  | 'nabeul'
  | 'zaghouan'
  | 'bizerte'
  | 'beja'
  | 'jendouba'
  | 'kef'
  | 'siliana'
  | 'sousse'
  | 'monastir'
  | 'mahdia'
  | 'sfax'
  | 'kairouan'
  | 'kasserine'
  | 'sidi_bouzid'
  | 'gabes'
  | 'medenine'
  | 'tataouine'
  | 'gafsa'
  | 'tozeur'
  | 'kebili';

export type Language = 'ar' | 'fr' | 'en' | 'ar-tn';

export type TunisianDialect =
  | 'tunis'
  | 'sfax'
  | 'sousse'
  | 'kairouan'
  | 'bizerte'
  | 'gabes'
  | 'gafsa'
  | 'standard';

export type CompanySize =
  | 'individual'
  | 'micro' // 1-9 employees
  | 'small' // 10-49 employees
  | 'medium' // 50-249 employees
  | 'large'; // 250+ employees;

export type AchievementCategory =
  | 'exploration'
  | 'engagement'
  | 'knowledge'
  | 'community'
  | 'consistency'
  | 'mastery'
  | 'cultural'
  | 'special';

// Import types from legal.ts and mascot.ts
import type { LegalCategory, Sector } from './legal';
import type { MascotCustomization } from './mascot';
