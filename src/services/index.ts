// API Service
export { default as apiService, ApiService } from './api';
export type { 
  ApiError, 
  ApiResponse, 
  LegalQuery, 
  LegalResponse, 
  LegalSource, 
  HealthStatus, 
  PopularQuery, 
  LegalCategory 
} from './api';

// Mock Data Services
export * from './mockDataService';
export * from './mockApiClient';

// Storage Service
export { default as storageService, StorageService } from './storage';
export type { StorageError } from './storage';
export { STORAGE_KEYS } from './storage';

// Authentication Service
export { default as authService, AuthService } from './authService';
export type { 
  LoginCredentials, 
  LoginResponse, 
  User, 
  AuthError 
} from './authService';

// Service exports will be added here as the app grows
