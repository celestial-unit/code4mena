import apiService from './api';
import storageService from './storage';

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: User;
  expiresIn?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

export interface AuthError {
  message: string;
  code?: string;
  status?: number;
}

/**
 * Authentication service for handling login, logout, and token management
 * Works with the backend's HTTPBearer authentication system
 */
class AuthService {
  private isInitialized = false;

  /**
   * Initialize the auth service by loading stored tokens
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Load stored auth token and set it in the API service
      const token = await storageService.getAuthToken();
      if (token) {
        apiService.setAuthToken(token);
        console.log('[Auth] Restored authentication token from storage');
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('[Auth] Failed to initialize auth service:', error);
      // Don't throw error, allow app to continue without auth
    }
  }

  /**
   * Login with email and password
   * Note: Since the backend doesn't have explicit login endpoint,
   * this is a placeholder implementation that would work with a proper auth backend
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log('[Auth] Attempting login for:', credentials.email);

      // Call the backend login endpoint
      const response = await apiService.post<{
        success: boolean;
        user: any;
        token?: string;
        refresh_token?: string;
        expires_in?: number;
      }>('/api/v1/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });

      if (!response.success || !response.user) {
        throw new Error('Invalid login response from server');
      }

      // Transform backend response to frontend format
      const loginResponse: LoginResponse = {
        token: response.token || `temp_token_${Date.now()}`,
        refreshToken: response.refresh_token,
        user: {
          id: response.user.id || response.user.user_id,
          email: response.user.email,
          name:
            response.user.name ||
            response.user.full_name ||
            credentials.email.split('@')[0],
          role: response.user.role || 'user',
        },
        expiresIn: response.expires_in || 3600,
      };

      // Store tokens and user data
      await this.storeAuthData(loginResponse);

      // Set token in API service for future requests
      apiService.setAuthToken(loginResponse.token);

      console.log(
        '[Auth] Login successful for user:',
        loginResponse.user.email
      );
      return loginResponse;
    } catch (error) {
      console.error('[Auth] Login failed:', error);

      // Convert API errors to AuthError
      if (error && typeof error === 'object' && 'message' in error) {
        const authError: AuthError = {
          message: (error as any).message || 'Login failed',
          code: (error as any).code || 'LOGIN_ERROR',
          status: (error as any).status,
        };
        throw authError;
      }

      // Generic error
      const authError: AuthError = {
        message: 'Login failed. Please check your credentials and try again.',
        code: 'LOGIN_ERROR',
      };
      throw authError;
    }
  }

  /**
   * Logout and clear all authentication data
   */
  async logout(): Promise<void> {
    try {
      console.log('[Auth] Logging out user');

      // Call backend logout endpoint
      try {
        await apiService.post('/api/v1/auth/logout');
      } catch (logoutError) {
        console.warn(
          '[Auth] Backend logout failed, continuing with local cleanup:',
          logoutError
        );
      }

      // Clear stored authentication data
      await this.clearAuthData();

      // Remove token from API service
      apiService.setAuthToken(null);

      console.log('[Auth] Logout successful');
    } catch (error) {
      console.error('[Auth] Logout error:', error);

      // Even if backend logout fails, clear local data
      try {
        await this.clearAuthData();
        apiService.setAuthToken(null);
      } catch (clearError) {
        console.error('[Auth] Failed to clear local auth data:', clearError);
      }

      // Don't throw error for logout - always succeed locally
    }
  }

  /**
   * Check if user is currently authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      await this.initialize();
      return await storageService.isAuthenticated();
    } catch (error) {
      console.error('[Auth] Failed to check authentication status:', error);
      return false;
    }
  }

  /**
   * Get current user data from backend
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      await this.initialize();

      // Try to get user from backend first
      const token = await storageService.getAuthToken();
      if (token) {
        try {
          const response = await apiService.get<User>('/api/v1/auth/me');

          // Update stored user data with fresh data from backend
          await storageService.setUserData(response);
          return response;
        } catch (apiError) {
          console.warn(
            '[Auth] Failed to get user from backend, using stored data:',
            apiError
          );

          // If API call fails, try to use stored data
          return await storageService.getUserData<User>();
        }
      }

      return await storageService.getUserData<User>();
    } catch (error) {
      console.error('[Auth] Failed to get current user:', error);
      return null;
    }
  }

  /**
   * Get current auth token
   */
  async getAuthToken(): Promise<string | null> {
    try {
      await this.initialize();
      return await storageService.getAuthToken();
    } catch (error) {
      console.error('[Auth] Failed to get auth token:', error);
      return null;
    }
  }

  /**
   * Refresh authentication token
   * Note: This would typically call a refresh endpoint on the backend
   */
  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = await storageService.getRefreshToken();

      if (!refreshToken) {
        console.log('[Auth] No refresh token available');
        return null;
      }

      // Call backend refresh endpoint
      const response = await apiService.post<{
        success: boolean;
        token?: string;
        refresh_token?: string;
        expires_in?: number;
      }>('/api/v1/auth/refresh', {
        refresh_token: refreshToken,
      });

      if (!response.success || !response.token) {
        throw new Error('Invalid refresh response from server');
      }

      // Store new tokens
      await storageService.setAuthToken(response.token);
      if (response.refresh_token) {
        await storageService.setRefreshToken(response.refresh_token);
      }
      apiService.setAuthToken(response.token);

      console.log('[Auth] Token refreshed successfully');
      return response.token;
    } catch (error) {
      console.error('[Auth] Token refresh failed:', error);

      // If refresh fails, clear auth data
      await this.clearAuthData();
      apiService.setAuthToken(null);

      return null;
    }
  }

  /**
   * Store authentication data in secure storage
   */
  private async storeAuthData(loginResponse: LoginResponse): Promise<void> {
    try {
      // Store auth token
      await storageService.setAuthToken(loginResponse.token);

      // Store refresh token if provided
      if (loginResponse.refreshToken) {
        await storageService.setRefreshToken(loginResponse.refreshToken);
      }

      // Store user data
      await storageService.setUserData(loginResponse.user);

      console.log('[Auth] Authentication data stored successfully');
    } catch (error) {
      console.error('[Auth] Failed to store authentication data:', error);
      throw error;
    }
  }

  /**
   * Clear all authentication data
   */
  private async clearAuthData(): Promise<void> {
    try {
      await storageService.clearAuthData();
      console.log('[Auth] Authentication data cleared successfully');
    } catch (error) {
      console.error('[Auth] Failed to clear authentication data:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: Partial<User>): Promise<User | null> {
    try {
      const response = await apiService.put<{
        success: boolean;
        user: User;
      }>('/api/v1/auth/me', profileData);

      if (!response.success || !response.user) {
        throw new Error('Invalid profile update response from server');
      }

      // Update stored user data
      await storageService.setUserData(response.user);

      console.log('[Auth] Profile updated successfully');
      return response.user;
    } catch (error) {
      console.error('[Auth] Profile update failed:', error);
      throw error;
    }
  }

  /**
   * Handle authentication errors (e.g., token expiry)
   * This can be called by the API service when it receives 401 responses
   */
  async handleAuthError(): Promise<void> {
    try {
      console.log('[Auth] Handling authentication error');

      // Try to refresh token first
      const newToken = await this.refreshToken();

      if (!newToken) {
        // If refresh fails, clear all auth data
        await this.clearAuthData();
        apiService.setAuthToken(null);
        console.log('[Auth] Authentication cleared due to error');
      }
    } catch (error) {
      console.error('[Auth] Error handling auth error:', error);

      // Fallback: clear all auth data
      try {
        await this.clearAuthData();
        apiService.setAuthToken(null);
      } catch (clearError) {
        console.error(
          '[Auth] Failed to clear auth data in error handler:',
          clearError
        );
      }
    }
  }
}

// Create and export singleton instance
const authService = new AuthService();

export default authService;
export { AuthService };
