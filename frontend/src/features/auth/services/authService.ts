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

      // For now, since the backend doesn't have a login endpoint,
      // we'll simulate a successful login with a mock token
      // In a real implementation, this would call POST /auth/login
      
      // TODO: Replace with actual backend login endpoint when available
      // const response = await apiService.post<LoginResponse>('/auth/login', credentials);
      
      // Mock response for demonstration
      const mockResponse: LoginResponse = {
        token: `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        refreshToken: `refresh_token_${Date.now()}`,
        user: {
          id: `user_${Math.random().toString(36).substr(2, 9)}`,
          email: credentials.email,
          name: credentials.email.split('@')[0], // Use email prefix as name
          role: 'user'
        },
        expiresIn: 3600 // 1 hour
      };

      // Store tokens and user data
      await this.storeAuthData(mockResponse);

      // Set token in API service for future requests
      apiService.setAuthToken(mockResponse.token);

      console.log('[Auth] Login successful for user:', mockResponse.user.email);
      return mockResponse;

    } catch (error) {
      console.error('[Auth] Login failed:', error);
      
      // Convert API errors to AuthError
      if (error && typeof error === 'object' && 'message' in error) {
        const authError: AuthError = {
          message: (error as any).message || 'Login failed',
          code: (error as any).code || 'LOGIN_ERROR',
          status: (error as any).status
        };
        throw authError;
      }

      // Generic error
      const authError: AuthError = {
        message: 'Login failed. Please check your credentials and try again.',
        code: 'LOGIN_ERROR'
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

      // TODO: Call backend logout endpoint if available
      // await apiService.post('/auth/logout');

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
   * Get current user data
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      await this.initialize();
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

      // TODO: Implement actual token refresh with backend
      // const response = await apiService.post<{token: string}>('/auth/refresh', {
      //   refreshToken
      // });

      // Mock refresh for now
      const newToken = `refreshed_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store new token
      await storageService.setAuthToken(newToken);
      apiService.setAuthToken(newToken);

      console.log('[Auth] Token refreshed successfully');
      return newToken;

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
        console.error('[Auth] Failed to clear auth data in error handler:', clearError);
      }
    }
  }
}

// Create and export singleton instance
const authService = new AuthService();

export default authService;
export { AuthService };