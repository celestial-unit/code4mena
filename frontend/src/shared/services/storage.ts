import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys constants
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  USER_PREFERENCES: 'user_preferences',
} as const;

// Basic error type for storage operations
export interface StorageError {
  message: string;
  key?: string;
  operation?: 'get' | 'set' | 'remove' | 'clear';
}

/**
 * AsyncStorage wrapper service for storing user data and tokens
 * Provides basic get, set, and remove methods with error handling
 */
class StorageService {
  /**
   * Get a value from storage
   * @param key - The storage key
   * @returns Promise that resolves to the stored value or null if not found
   */
  async get<T = string>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      
      if (value === null) {
        return null;
      }

      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(value) as T;
      } catch {
        // If parsing fails, return as string (cast to T)
        return value as unknown as T;
      }
    } catch (error) {
      console.error(`[Storage] Failed to get item with key "${key}":`, error);
      const storageError: StorageError = {
        message: `Failed to retrieve data for key: ${key}`,
        key,
        operation: 'get',
      };
      throw storageError;
    }
  }

  /**
   * Set a value in storage
   * @param key - The storage key
   * @param value - The value to store (will be JSON stringified if not a string)
   */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, stringValue);
      console.log(`[Storage] Successfully stored item with key "${key}"`);
    } catch (error) {
      console.error(`[Storage] Failed to set item with key "${key}":`, error);
      const storageError: StorageError = {
        message: `Failed to store data for key: ${key}`,
        key,
        operation: 'set',
      };
      throw storageError;
    }
  }

  /**
   * Remove a value from storage
   * @param key - The storage key to remove
   */
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
      console.log(`[Storage] Successfully removed item with key "${key}"`);
    } catch (error) {
      console.error(`[Storage] Failed to remove item with key "${key}":`, error);
      const storageError: StorageError = {
        message: `Failed to remove data for key: ${key}`,
        key,
        operation: 'remove',
      };
      throw storageError;
    }
  }

  /**
   * Clear all storage data
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
      console.log('[Storage] Successfully cleared all storage data');
    } catch (error) {
      console.error('[Storage] Failed to clear storage:', error);
      const storageError: StorageError = {
        message: 'Failed to clear all storage data',
        operation: 'clear',
      };
      throw storageError;
    }
  }

  /**
   * Get multiple values from storage
   * @param keys - Array of storage keys
   * @returns Promise that resolves to an object with key-value pairs
   */
  async getMultiple(keys: string[]): Promise<Record<string, any>> {
    try {
      const keyValuePairs = await AsyncStorage.multiGet(keys);
      const result: Record<string, any> = {};

      keyValuePairs.forEach(([key, value]) => {
        if (value !== null) {
          try {
            result[key] = JSON.parse(value);
          } catch {
            result[key] = value;
          }
        } else {
          result[key] = null;
        }
      });

      return result;
    } catch (error) {
      console.error('[Storage] Failed to get multiple items:', error);
      const storageError: StorageError = {
        message: 'Failed to retrieve multiple items from storage',
        operation: 'get',
      };
      throw storageError;
    }
  }

  // Token-specific methods

  /**
   * Store authentication token
   * @param token - The authentication token
   */
  async setAuthToken(token: string): Promise<void> {
    await this.set(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  /**
   * Get authentication token
   * @returns Promise that resolves to the auth token or null
   */
  async getAuthToken(): Promise<string | null> {
    return await this.get<string>(STORAGE_KEYS.AUTH_TOKEN);
  }

  /**
   * Remove authentication token
   */
  async removeAuthToken(): Promise<void> {
    await this.remove(STORAGE_KEYS.AUTH_TOKEN);
  }

  /**
   * Store refresh token
   * @param token - The refresh token
   */
  async setRefreshToken(token: string): Promise<void> {
    await this.set(STORAGE_KEYS.REFRESH_TOKEN, token);
  }

  /**
   * Get refresh token
   * @returns Promise that resolves to the refresh token or null
   */
  async getRefreshToken(): Promise<string | null> {
    return await this.get<string>(STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Remove refresh token
   */
  async removeRefreshToken(): Promise<void> {
    await this.remove(STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Store user data
   * @param userData - The user data object
   */
  async setUserData<T>(userData: T): Promise<void> {
    await this.set(STORAGE_KEYS.USER_DATA, userData);
  }

  /**
   * Get user data
   * @returns Promise that resolves to the user data or null
   */
  async getUserData<T>(): Promise<T | null> {
    return await this.get<T>(STORAGE_KEYS.USER_DATA);
  }

  /**
   * Remove user data
   */
  async removeUserData(): Promise<void> {
    await this.remove(STORAGE_KEYS.USER_DATA);
  }

  /**
   * Store user preferences
   * @param preferences - The user preferences object
   */
  async setUserPreferences<T>(preferences: T): Promise<void> {
    await this.set(STORAGE_KEYS.USER_PREFERENCES, preferences);
  }

  /**
   * Get user preferences
   * @returns Promise that resolves to the user preferences or null
   */
  async getUserPreferences<T>(): Promise<T | null> {
    return await this.get<T>(STORAGE_KEYS.USER_PREFERENCES);
  }

  /**
   * Remove user preferences
   */
  async removeUserPreferences(): Promise<void> {
    await this.remove(STORAGE_KEYS.USER_PREFERENCES);
  }

  /**
   * Clear all authentication-related data
   */
  async clearAuthData(): Promise<void> {
    try {
      await Promise.all([
        this.removeAuthToken(),
        this.removeRefreshToken(),
        this.removeUserData(),
      ]);
      console.log('[Storage] Successfully cleared all authentication data');
    } catch (error) {
      console.error('[Storage] Failed to clear authentication data:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated (has auth token)
   * @returns Promise that resolves to boolean indicating if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getAuthToken();
      return token !== null && token.length > 0;
    } catch (error) {
      console.error('[Storage] Failed to check authentication status:', error);
      return false;
    }
  }
}

// Create and export singleton instance
const storageService = new StorageService();

export default storageService;
export { StorageService };