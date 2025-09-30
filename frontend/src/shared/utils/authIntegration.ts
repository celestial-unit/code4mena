/**
 * Integration utilities that connect storage service with API service
 * This demonstrates how to use storage utilities with the existing API service
 */

import { apiService, storageService } from '../services';

/**
 * Initialize API service with stored authentication token
 * Call this when the app starts to restore authentication state
 */
export async function initializeApiAuth(): Promise<void> {
  try {
    const storedToken = await storageService.getAuthToken();
    if (storedToken) {
      // Set the token in the API service so it's included in requests
      apiService.setAuthToken(storedToken);
      console.log('[Auth] API service initialized with stored token');
    } else {
      console.log('[Auth] No stored token found');
    }
  } catch (error) {
    console.error('[Auth] Failed to initialize API auth:', error);
  }
}

// Types for authentication responses
interface LoginResponse {
  token: string;
  refresh_token?: string;
  user?: any;
}

interface RefreshResponse {
  token: string;
  refresh_token?: string;
}

/**
 * Login and store authentication data
 * @param email - User email
 * @param password - User password
 * @returns Promise that resolves to user data if login successful
 */
export async function loginAndStore(
  email: string,
  password: string
): Promise<any> {
  try {
    // Make login request to backend (assuming there's a login endpoint)
    const loginResponse = await apiService.post<LoginResponse>('/auth/login', {
      email,
      password,
    });

    // Extract token and user data from response
    // Note: Adjust these field names based on your actual backend response
    const { token, refresh_token, user } = loginResponse;

    if (token) {
      // Store tokens in secure storage
      await storageService.setAuthToken(token);

      if (refresh_token) {
        await storageService.setRefreshToken(refresh_token);
      }

      // Store user data
      if (user) {
        await storageService.setUserData(user);
      }

      // Set token in API service for immediate use
      apiService.setAuthToken(token);

      console.log('[Auth] Login successful, tokens stored');
      return user;
    } else {
      throw new Error('No authentication token received');
    }
  } catch (error) {
    console.error('[Auth] Login failed:', error);
    throw error;
  }
}

/**
 * Logout and clear all authentication data
 */
export async function logoutAndClear(): Promise<void> {
  try {
    // Optional: Call logout endpoint if your backend has one
    try {
      await apiService.post('/auth/logout');
    } catch (logoutError) {
      // Don't fail the entire logout if the API call fails
      console.warn('[Auth] Logout API call failed:', logoutError);
    }

    // Clear stored authentication data
    await storageService.clearAuthData();

    // Clear token from API service
    apiService.setAuthToken(null);

    console.log('[Auth] Logout completed, all auth data cleared');
  } catch (error) {
    console.error('[Auth] Logout failed:', error);
    throw error;
  }
}

/**
 * Refresh authentication token
 * Call this when you receive a 401 response from the API
 */
export async function refreshAuthToken(): Promise<boolean> {
  try {
    const refreshToken = await storageService.getRefreshToken();

    if (!refreshToken) {
      console.log('[Auth] No refresh token available');
      return false;
    }

    // Call refresh endpoint (adjust endpoint and payload based on your backend)
    const refreshResponse = await apiService.post<RefreshResponse>(
      '/auth/refresh',
      {
        refresh_token: refreshToken,
      }
    );

    const { token, refresh_token: newRefreshToken } = refreshResponse;

    if (token) {
      // Store new tokens
      await storageService.setAuthToken(token);

      if (newRefreshToken) {
        await storageService.setRefreshToken(newRefreshToken);
      }

      // Update API service with new token
      apiService.setAuthToken(token);

      console.log('[Auth] Token refreshed successfully');
      return true;
    } else {
      console.log('[Auth] Token refresh failed - no new token received');
      return false;
    }
  } catch (error) {
    console.error('[Auth] Token refresh failed:', error);

    // If refresh fails, clear all auth data
    await logoutAndClear();
    return false;
  }
}

/**
 * Check if user is authenticated and token is valid
 * @returns Promise that resolves to boolean indicating auth status
 */
export async function checkAuthenticationStatus(): Promise<boolean> {
  try {
    const isAuthenticated = await storageService.isAuthenticated();

    if (!isAuthenticated) {
      return false;
    }

    // Optional: Verify token with backend
    try {
      await apiService.get('/auth/verify');
      return true;
    } catch (verifyError) {
      console.log('[Auth] Token verification failed, attempting refresh');

      // Try to refresh the token
      const refreshSuccess = await refreshAuthToken();
      return refreshSuccess;
    }
  } catch (error) {
    console.error('[Auth] Auth status check failed:', error);
    return false;
  }
}

/**
 * Get current user data from storage
 * @returns Promise that resolves to user data or null
 */
export async function getCurrentUserData<T = any>(): Promise<T | null> {
  try {
    return await storageService.getUserData<T>();
  } catch (error) {
    console.error('[Auth] Failed to get current user data:', error);
    return null;
  }
}

/**
 * Update user data in storage
 * @param userData - Updated user data
 */
export async function updateUserData<T>(userData: T): Promise<void> {
  try {
    await storageService.setUserData(userData);
    console.log('[Auth] User data updated successfully');
  } catch (error) {
    console.error('[Auth] Failed to update user data:', error);
    throw error;
  }
}

/**
 * Utility to make authenticated API calls with automatic token refresh
 * @param apiCall - Function that makes the API call
 * @returns Promise that resolves to the API response
 */
export async function makeAuthenticatedCall<T>(
  apiCall: () => Promise<T>
): Promise<T> {
  try {
    // First attempt
    return await apiCall();
  } catch (error: any) {
    // If we get a 401, try to refresh the token and retry
    if (error?.status === 401) {
      console.log('[Auth] Received 401, attempting token refresh');

      const refreshSuccess = await refreshAuthToken();

      if (refreshSuccess) {
        console.log('[Auth] Token refreshed, retrying API call');
        return await apiCall();
      } else {
        console.log('[Auth] Token refresh failed, redirecting to login');
        throw new Error('Authentication failed - please log in again');
      }
    }

    // Re-throw other errors
    throw error;
  }
}
