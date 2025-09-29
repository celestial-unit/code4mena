import Constants from 'expo-constants';

interface Config {
  apiBaseUrl: string;
  apiTimeout: number;
  nodeEnv: string;
  features: {
    enable3DMascots: boolean;
    enableVoiceAI: boolean;
    enableOfflineMode: boolean;
  };
  analytics: {
    enabled: boolean;
    apiKey?: string;
  };
  debug: {
    enabled: boolean;
    logLevel: string;
  };
}

const config: Config = {
  apiBaseUrl:
    Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:8001',
  apiTimeout: Constants.expoConfig?.extra?.apiTimeout || 10000,
  nodeEnv: Constants.expoConfig?.extra?.nodeEnv || 'development',
  features: {
    enable3DMascots: Constants.expoConfig?.extra?.enable3DMascots ?? true,
    enableVoiceAI: Constants.expoConfig?.extra?.enableVoiceAI ?? true,
    enableOfflineMode: Constants.expoConfig?.extra?.enableOfflineMode ?? true,
  },
  analytics: {
    enabled: Constants.expoConfig?.extra?.analyticsEnabled ?? false,
    apiKey: Constants.expoConfig?.extra?.analyticsApiKey,
  },
  debug: {
    enabled: Constants.expoConfig?.extra?.debugMode ?? true,
    logLevel: Constants.expoConfig?.extra?.logLevel || 'info',
  },
};

export default config;
