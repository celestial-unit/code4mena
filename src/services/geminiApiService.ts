/**
 * Gemini Live API Service
 * Integrates with your Gemini Live API for real AI responses
 */

interface GeminiApiConfig {
  baseUrl: string;
  timeout: number;
  apiKey?: string;
}

interface GeminiMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface GeminiRequest {
  query: string;
  language?: string;
  user_id?: string;
}

interface GeminiResponse {
  response: string;
  sources: Array<{
    article: string;
    title: string;
    source: string;
    url?: string;
    relevance_score: number;
  }>;
  disclaimer: string;
  query_id: string;
}

export class GeminiApiService {
  private config: GeminiApiConfig;

  constructor(config: GeminiApiConfig) {
    this.config = config;
  }

  /**
   * Send a legal query to your backend API
   */
  async sendMessage(
    message: string,
    conversationHistory: GeminiMessage[] = [],
    language: string = 'ar',
    userId?: string
  ): Promise<GeminiResponse> {
    try {
      const requestBody: GeminiRequest = {
        query: message,
        language,
        user_id: userId || 'mobile-app-user'
      };

      console.log('[Backend API] Sending legal query:', {
        url: `${this.config.baseUrl}/query`,
        query: message.substring(0, 100) + '...',
        language
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(`${this.config.baseUrl}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey || 'demo-token'}`
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend API Error ${response.status}: ${errorText}`);
      }

      const result: GeminiResponse = await response.json();

      console.log('[Backend API] Response received:', {
        responseLength: result.response?.length || 0,
        sourcesCount: result.sources?.length || 0,
        queryId: result.query_id
      });

      return result;

    } catch (error) {
      console.error('[Backend API] Request failed:', error);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - Backend API took too long to respond');
        }
        if (error.message.includes('fetch')) {
          throw new Error('Network error - Could not connect to Backend API');
        }
      }

      throw error;
    }
  }

  /**
   * Health check for Backend API - focuses on core functionality
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.config.baseUrl}/health`, {
        method: 'GET',
        headers: {
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Even if status is 503, check if core services are working
      const result = await response.json();

      // Check if the essential services for chat are working
      const healthDetail = result.detail || result;
      const coreServicesHealthy =
        healthDetail.api === 'healthy' &&
        healthDetail.external_llm &&
        healthDetail.external_llm.includes('healthy');

      if (coreServicesHealthy) {
        console.log('[Backend API] Core services healthy for chat functionality');
        return {
          status: 'healthy',
          timestamp: healthDetail.timestamp,
          details: healthDetail
        };
      } else {
        throw new Error(`Core services not healthy: ${JSON.stringify(healthDetail)}`);
      }

    } catch (error) {
      console.error('[Backend API] Health check failed:', error);
      throw error;
    }
  }

  /**
   * Process audio query using your backend's audio endpoint
   */
  async processAudioQuery(audioBlob: Blob, language: string = 'ar-TN'): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('audio_file', audioBlob, 'audio.webm');
      formData.append('language', language);

      console.log('[Backend API] Sending audio query');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(`${this.config.baseUrl}/audio/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey || 'demo-token'}`
          // Don't set Content-Type for FormData, let browser set it
        },
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Audio API Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      console.log('[Backend API] Audio response received:', {
        transcription: result.transcription?.substring(0, 50) + '...',
        hasAudio: result.audio_response_available,
        confidence: result.confidence
      });

      return result;

    } catch (error) {
      console.error('[Backend API] Audio request failed:', error);
      throw error;
    }
  }

  /**
   * Convert text to speech using your backend
   */
  async textToSpeech(text: string, language: string = 'ar-TN'): Promise<Blob | null> {
    try {
      const requestBody = {
        text,
        language
      };

      console.log('[Backend API] Requesting TTS for:', text.substring(0, 50) + '...');

      const response = await fetch(`${this.config.baseUrl}/audio/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey || 'demo-token'}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`TTS API Error ${response.status}`);
      }

      // Check if response is audio or JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('audio')) {
        const audioBlob = await response.blob();
        console.log('[Backend API] TTS audio received');
        return audioBlob;
      } else {
        const jsonResponse = await response.json();
        console.log('[Backend API] TTS response:', jsonResponse.message);
        return null;
      }

    } catch (error) {
      console.error('[Backend API] TTS request failed:', error);
      return null;
    }
  }

  /**
   * Get supported audio languages
   */
  async getSupportedLanguages(): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseUrl}/audio/languages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey || 'demo-token'}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get supported languages: ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('[Backend API] Failed to get supported languages:', error);
      throw error;
    }
  }
}

import { geminiConfig } from '../config/gemini';

// Create singleton instance with configuration
const apiConfig: GeminiApiConfig = {
  baseUrl: geminiConfig.baseUrl,
  timeout: geminiConfig.timeout,
  apiKey: geminiConfig.apiKey
};

export const geminiApiService = new GeminiApiService(apiConfig);
export default geminiApiService;