import config from '../config/env';

// Basic API configuration
const API_BASE_URL = config.apiBaseUrl;
const API_TIMEOUT = config.apiTimeout;

// Basic error types
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Basic API response wrapper
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
}

// Backend API Types (matching the Python models)
export interface LegalQuery {
  query: string;
  language?: 'ar' | 'fr' | 'en';
  user_id?: string;
}

export interface LegalSource {
  article: string;
  title: string;
  source: string;
  url?: string;
  relevance_score: number;
}

export interface LegalResponse {
  response: string;
  sources: LegalSource[];
  disclaimer: string;
  query_id: string;
}

export interface HealthStatus {
  api: string;
  database: string;
  pii_filter: string;
  legal_rag: string;
  external_llm: string;
  audio_service: string;
  timestamp: string;
}

export interface PopularQuery {
  query: string;
  popularity: number;
  success_rate: number;
  avg_response_time?: number;
  last_used: string;
}

export interface LegalCategory {
  id: string;
  name: string;
  description: string;
  count: number;
}

// HTTP methods enum
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

// Basic API service class
class ApiService {
  private baseUrl: string;
  private timeout: number;
  private authToken: string | null = null;

  constructor(baseUrl: string = API_BASE_URL, timeout: number = API_TIMEOUT) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  // Set authentication token
  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  // Get authentication token
  getAuthToken(): string | null {
    return this.authToken;
  }

  // Build headers for requests
  private buildHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    // Always include a basic bearer token for the backend
    // The backend expects HTTPBearer but doesn't validate the token content for now
    const token = this.authToken || 'demo-token';
    headers.Authorization = `Bearer ${token}`;

    return headers;
  }

  // Build full URL
  private buildUrl(endpoint: string): string {
    // Remove leading slash if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${this.baseUrl}/${cleanEndpoint}`;
  }

  // Generic request method with error handling
  private async request<T>(
    method: HttpMethod,
    endpoint: string,
    data?: any,
    customHeaders?: Record<string, string>
  ): Promise<T> {
    try {
      const url = this.buildUrl(endpoint);
      const headers = this.buildHeaders(customHeaders);

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const requestOptions: RequestInit = {
        method,
        headers,
        signal: controller.signal,
      };

      // Add body for methods that support it
      if (data && (method === HttpMethod.POST || method === HttpMethod.PUT || method === HttpMethod.PATCH)) {
        requestOptions.body = JSON.stringify(data);
      }

      console.log(`[API] ${method} ${url}`, data ? { data } : '');

      const response = await fetch(url, requestOptions);

      // Clear timeout
      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch {
          // If not JSON, use the text as message
          errorMessage = errorText || errorMessage;
        }

        const apiError: ApiError = {
          message: errorMessage,
          status: response.status,
          code: response.status.toString(),
        };

        // Handle authentication errors
        if (response.status === 401) {
          // Import authService dynamically to avoid circular dependency
          const { default: authService } = await import('./authService');
          await authService.handleAuthError();
        }

        throw apiError;
      }

      // Parse response
      const responseText = await response.text();

      // Handle empty responses
      if (!responseText) {
        return {} as T;
      }

      try {
        const jsonResponse = JSON.parse(responseText);
        console.log(`[API] Response:`, jsonResponse);
        return jsonResponse;
      } catch (parseError) {
        console.error('[API] Failed to parse response as JSON:', parseError);
        throw new Error('Invalid JSON response from server');
      }

    } catch (error) {
      // Handle network errors and timeouts
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          const timeoutError: ApiError = {
            message: 'Request timeout',
            code: 'TIMEOUT',
          };
          throw timeoutError;
        }

        // Network errors
        if (error.message.includes('fetch')) {
          const networkError: ApiError = {
            message: 'Network error - please check your connection',
            code: 'NETWORK_ERROR',
          };
          throw networkError;
        }
      }

      // Re-throw API errors as-is
      if (error && typeof error === 'object' && 'message' in error) {
        throw error;
      }

      // Unknown errors
      const unknownError: ApiError = {
        message: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
      };
      throw unknownError;
    }
  }

  // HTTP method helpers
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(HttpMethod.GET, endpoint, undefined, headers);
  }

  async post<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(HttpMethod.POST, endpoint, data, headers);
  }

  async put<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(HttpMethod.PUT, endpoint, data, headers);
  }

  async patch<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(HttpMethod.PATCH, endpoint, data, headers);
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(HttpMethod.DELETE, endpoint, undefined, headers);
  }

  // Health check method
  async healthCheck(): Promise<HealthStatus> {
    try {
      const response = await this.get<HealthStatus>('/health');
      return response;
    } catch (error) {
      console.error('[API] Health check failed:', error);
      throw error;
    }
  }

  // Legal query methods
  async submitLegalQuery(queryData: LegalQuery): Promise<LegalResponse> {
    try {
      const response = await this.post<LegalResponse>('/query', queryData);
      return response;
    } catch (error) {
      console.error('[API] Legal query failed:', error);
      throw error;
    }
  }

  async getLegalCategories(): Promise<LegalCategory[]> {
    try {
      const response = await this.get<LegalCategory[]>('/legal-categories');
      return response;
    } catch (error) {
      console.error('[API] Failed to get legal categories:', error);
      throw error;
    }
  }

  async getPopularQueries(language: string = 'ar'): Promise<PopularQuery[]> {
    try {
      const response = await this.get<PopularQuery[]>(`/popular-queries?language=${language}`);
      return response;
    } catch (error) {
      console.error('[API] Failed to get popular queries:', error);
      throw error;
    }
  }

  // Audio methods
  async processAudioQuery(audioFile: File, language: string = 'ar-TN'): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('audio_file', audioFile);
      formData.append('language', language);

      const headers = this.buildHeaders();
      delete headers['Content-Type']; // Let browser set content-type for FormData

      const response = await fetch(this.buildUrl('audio/query'), {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[API] Audio query failed:', error);
      throw error;
    }
  }

  async textToSpeech(text: string, language: string = 'ar-TN'): Promise<Blob> {
    try {
      const response = await fetch(this.buildUrl('audio/tts'), {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify({ text, language }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('[API] Text-to-speech failed:', error);
      throw error;
    }
  }

  async getSupportedAudioLanguages(): Promise<string[]> {
    try {
      const response = await this.get<string[]>('/audio/languages');
      return response;
    } catch (error) {
      console.error('[API] Failed to get supported audio languages:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
const apiService = new ApiService();

export default apiService;
export { ApiService };