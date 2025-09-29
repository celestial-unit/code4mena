// Main types export file
export * from './legal';
export * from './user';
export * from './chat';
export * from './search';
export * from './mascot';

// Common utility types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  messageAr?: string;
  messageFr?: string;
  timestamp: Date;
  requestId: string;
}

export interface ApiError {
  code: string;
  message: string;
  messageAr: string;
  messageFr: string;
  details?: any;
  stack?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
  errorAr?: string;
  errorFr?: string;
  progress?: number;
  stage?: string;
  stageAr?: string;
  stageFr?: string;
}

export interface LocalizedContent {
  en: string;
  ar: string;
  fr: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  street?: string;
  city: string;
  cityAr: string;
  region: string;
  regionAr: string;
  postalCode?: string;
  country: string;
  countryAr: string;
  coordinates?: Coordinates;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  website?: string;
  address?: Address;
  socialMedia?: SocialMediaLinks;
}

export interface SocialMediaLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
}

export interface FileUpload {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: Date;
  uploadedBy: string;
  metadata?: FileMetadata;
}

export interface FileMetadata {
  width?: number;
  height?: number;
  duration?: number;
  pages?: number;
  language?: string;
  encoding?: string;
  checksum: string;
}

export interface NotificationData {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  titleAr: string;
  titleFr: string;
  message: string;
  messageAr: string;
  messageFr: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
  expiresAt?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  actionUrl?: string;
  imageUrl?: string;
  iconUrl?: string;
}

export type NotificationType = 
  | 'legal_update'
  | 'achievement'
  | 'reminder'
  | 'system'
  | 'social'
  | 'marketing'
  | 'security'
  | 'feature'
  | 'maintenance'
  | 'emergency';

export interface AppConfig {
  version: string;
  buildNumber: string;
  environment: 'development' | 'staging' | 'production';
  apiBaseUrl: string;
  features: FeatureFlags;
  limits: AppLimits;
  localization: LocalizationConfig;
  analytics: AnalyticsConfig;
  security: SecurityConfig;
}

export interface FeatureFlags {
  voiceChat: boolean;
  mascot3D: boolean;
  offlineMode: boolean;
  pushNotifications: boolean;
  socialFeatures: boolean;
  gamification: boolean;
  multiLanguage: boolean;
  darkMode: boolean;
  accessibility: boolean;
  analytics: boolean;
  crashReporting: boolean;
  betaFeatures: boolean;
}

export interface AppLimits {
  maxFileSize: number;
  maxFilesPerUpload: number;
  maxConversationHistory: number;
  maxSearchHistory: number;
  maxBookmarks: number;
  maxCustomizations: number;
  rateLimitPerMinute: number;
  sessionTimeout: number;
}

export interface LocalizationConfig {
  defaultLanguage: string;
  supportedLanguages: string[];
  fallbackLanguage: string;
  rtlLanguages: string[];
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
  currencyFormat: string;
}

export interface AnalyticsConfig {
  enabled: boolean;
  trackingId?: string;
  events: AnalyticsEvent[];
  userProperties: string[];
  sessionTracking: boolean;
  performanceTracking: boolean;
  errorTracking: boolean;
}

export interface AnalyticsEvent {
  name: string;
  description: string;
  parameters: string[];
  category: string;
}

export interface SecurityConfig {
  encryptionEnabled: boolean;
  biometricAuth: boolean;
  sessionEncryption: boolean;
  apiKeyRotation: boolean;
  certificatePinning: boolean;
  dataRetentionDays: number;
  privacyMode: boolean;
}

export interface DeviceInfo {
  platform: 'ios' | 'android' | 'web';
  version: string;
  model?: string;
  manufacturer?: string;
  screenWidth: number;
  screenHeight: number;
  pixelDensity: number;
  hasNotch: boolean;
  supportsBiometrics: boolean;
  supportsVoice: boolean;
  supports3D: boolean;
  networkType: 'wifi' | 'cellular' | 'none';
  batteryLevel?: number;
  isLowPowerMode?: boolean;
}

export interface AppState {
  isActive: boolean;
  isBackground: boolean;
  isConnected: boolean;
  lastActiveAt: Date;
  sessionId: string;
  userId?: string;
  deviceInfo: DeviceInfo;
  currentRoute: string;
  previousRoute?: string;
  navigationHistory: string[];
}