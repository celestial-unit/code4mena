/**
 * Gemini API Configuration
 * Update these settings to match your Gemini Live API setup
 */

export interface GeminiConfig {
  baseUrl: string;
  timeout: number;
  apiKey?: string;
  enabled: boolean;
}

// Default configuration - matches your backend setup
export const geminiConfig: GeminiConfig = {
  // Your backend API URL (running on port 8001)
  baseUrl: 'http://localhost:8001',

  // Timeout for API requests (30 seconds for AI responses)
  timeout: 30000,

  // API key - your backend uses HTTPBearer authentication
  apiKey: 'demo-token-for-legal-api',

  // Enable/disable Gemini API integration
  enabled: true
};

// Alternative configurations for different environments
export const geminiConfigs = {
  development: {
    baseUrl: 'http://localhost:8000',
    timeout: 30000,
    enabled: true
  },

  production: {
    baseUrl: 'https://your-gemini-api.com',
    timeout: 30000,
    enabled: true
  },

  // If you're running Gemini API on a different port
  alternative: {
    baseUrl: 'http://localhost:3000',
    timeout: 30000,
    enabled: true
  }
};

export default geminiConfig;