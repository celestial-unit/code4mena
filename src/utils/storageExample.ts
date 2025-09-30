/**
 * Example usage of the storage utilities
 * This file demonstrates how to use the storage service in the app
 */

import storageService from '../services/storage';

// Example user data type
interface UserData {
  id: string;
  name: string;
  email: string;
  language: 'ar' | 'fr' | 'en';
}

// Example user preferences type
interface UserPreferences {
  theme: 'light' | 'dark';
  language: 'ar' | 'fr' | 'en';
  notifications: boolean;
}

/**
 * Example: Login flow with token storage
 */
export async function handleLogin(
  token: string,
  refreshToken: string,
  userData: UserData
): Promise<void> {
  try {
    // Store authentication tokens
    await storageService.setAuthToken(token);
    await storageService.setRefreshToken(refreshToken);

    // Store user data
    await storageService.setUserData(userData);

    console.log('Login data stored successfully');
  } catch (error) {
    console.error('Failed to store login data:', error);
    throw error;
  }
}

/**
 * Example: Check if user is authenticated
 */
export async function checkAuthStatus(): Promise<boolean> {
  try {
    return await storageService.isAuthenticated();
  } catch (error) {
    console.error('Failed to check auth status:', error);
    return false;
  }
}

/**
 * Example: Get current user data
 */
export async function getCurrentUser(): Promise<UserData | null> {
  try {
    return await storageService.getUserData<UserData>();
  } catch (error) {
    console.error('Failed to get user data:', error);
    return null;
  }
}

/**
 * Example: Update user preferences
 */
export async function updateUserPreferences(
  preferences: UserPreferences
): Promise<void> {
  try {
    await storageService.setUserPreferences(preferences);
    console.log('User preferences updated successfully');
  } catch (error) {
    console.error('Failed to update user preferences:', error);
    throw error;
  }
}

/**
 * Example: Get user preferences with defaults
 */
export async function getUserPreferences(): Promise<UserPreferences> {
  try {
    const preferences =
      await storageService.getUserPreferences<UserPreferences>();

    // Return defaults if no preferences are stored
    if (!preferences) {
      const defaultPreferences: UserPreferences = {
        theme: 'light',
        language: 'ar',
        notifications: true,
      };

      // Store the defaults for next time
      await storageService.setUserPreferences(defaultPreferences);
      return defaultPreferences;
    }

    return preferences;
  } catch (error) {
    console.error('Failed to get user preferences:', error);

    // Return safe defaults on error
    return {
      theme: 'light',
      language: 'ar',
      notifications: true,
    };
  }
}

/**
 * Example: Logout flow
 */
export async function handleLogout(): Promise<void> {
  try {
    // Clear all authentication data
    await storageService.clearAuthData();
    console.log('Logout completed successfully');
  } catch (error) {
    console.error('Failed to clear auth data during logout:', error);
    throw error;
  }
}

/**
 * Example: Get authentication token for API calls
 */
export async function getAuthTokenForAPI(): Promise<string | null> {
  try {
    return await storageService.getAuthToken();
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
}

/**
 * Example: Store temporary data (like form drafts)
 */
export async function saveDraftData(key: string, data: any): Promise<void> {
  try {
    await storageService.set(`draft_${key}`, data);
    console.log(`Draft data saved for key: ${key}`);
  } catch (error) {
    console.error(`Failed to save draft data for key ${key}:`, error);
    throw error;
  }
}

/**
 * Example: Retrieve temporary data
 */
export async function getDraftData<T>(key: string): Promise<T | null> {
  try {
    return await storageService.get<T>(`draft_${key}`);
  } catch (error) {
    console.error(`Failed to get draft data for key ${key}:`, error);
    return null;
  }
}

/**
 * Example: Clear temporary data
 */
export async function clearDraftData(key: string): Promise<void> {
  try {
    await storageService.remove(`draft_${key}`);
    console.log(`Draft data cleared for key: ${key}`);
  } catch (error) {
    console.error(`Failed to clear draft data for key ${key}:`, error);
    throw error;
  }
}
