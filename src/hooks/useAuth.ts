import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services';
import type { User, LoginCredentials, AuthError } from '../services';

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  error: AuthError | null;
}

/**
 * Custom hook for managing authentication state
 */
export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Initialize auth service
      await authService.initialize();

      // Check if user is authenticated
      const authenticated = await authService.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        // Get current user data
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      }

    } catch (err) {
      console.error('[useAuth] Failed to initialize auth:', err);
      setError({
        message: 'Failed to initialize authentication',
        code: 'INIT_ERROR'
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.login(credentials);
      
      setUser(response.user);
      setIsAuthenticated(true);

    } catch (err) {
      console.error('[useAuth] Login failed:', err);
      const authError = err as AuthError;
      setError(authError);
      throw authError; // Re-throw so components can handle it
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      await authService.logout();
      
      setUser(null);
      setIsAuthenticated(false);

    } catch (err) {
      console.error('[useAuth] Logout failed:', err);
      // Don't set error for logout - always clear state
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh auth state
  const refreshAuth = useCallback(async () => {
    await initializeAuth();
  }, [initializeAuth]);

  // Initialize on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshAuth,
    error,
  };
};