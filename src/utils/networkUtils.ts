import React from 'react';
import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
}

export class NetworkUtils {
  private static instance: NetworkUtils;
  private networkState: NetworkState = {
    isConnected: false,
    isInternetReachable: false,
    type: 'unknown',
  };
  private listeners: ((state: NetworkState) => void)[] = [];

  private constructor() {
    this.initializeNetworkListener();
  }

  public static getInstance(): NetworkUtils {
    if (!NetworkUtils.instance) {
      NetworkUtils.instance = new NetworkUtils();
    }
    return NetworkUtils.instance;
  }

  private initializeNetworkListener() {
    NetInfo.addEventListener(state => {
      const newState: NetworkState = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type || 'unknown',
      };

      const wasConnected = this.networkState.isConnected;
      this.networkState = newState;

      // Notify listeners
      this.listeners.forEach(listener => listener(newState));

      // Show connectivity alerts
      if (!wasConnected && newState.isConnected) {
        this.showConnectivityAlert(
          'تم استعادة الاتصال',
          'تم استعادة الاتصال بالإنترنت بنجاح.'
        );
      } else if (wasConnected && !newState.isConnected) {
        this.showConnectivityAlert(
          'انقطع الاتصال',
          'تم فقدان الاتصال بالإنترنت. يرجى التحقق من اتصالك.'
        );
      }
    });
  }

  public getCurrentState(): NetworkState {
    return { ...this.networkState };
  }

  public async checkConnectivity(): Promise<NetworkState> {
    try {
      const state = await NetInfo.fetch();
      const networkState: NetworkState = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type || 'unknown',
      };
      this.networkState = networkState;
      return networkState;
    } catch (error) {
      console.error('Failed to check network connectivity:', error);
      return this.networkState;
    }
  }

  public addListener(listener: (state: NetworkState) => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public isOnline(): boolean {
    return (
      this.networkState.isConnected && this.networkState.isInternetReachable
    );
  }

  public getConnectionType(): string {
    return this.networkState.type;
  }

  private showConnectivityAlert(title: string, message: string) {
    Alert.alert(title, message, [{ text: 'موافق', style: 'default' }], {
      cancelable: true,
    });
  }

  public static async waitForConnection(
    timeout: number = 10000
  ): Promise<boolean> {
    const networkUtils = NetworkUtils.getInstance();

    if (networkUtils.isOnline()) {
      return true;
    }

    return new Promise(resolve => {
      const timeoutId = setTimeout(() => {
        unsubscribe();
        resolve(false);
      }, timeout);

      const unsubscribe = networkUtils.addListener(state => {
        if (state.isConnected && state.isInternetReachable) {
          clearTimeout(timeoutId);
          unsubscribe();
          resolve(true);
        }
      });
    });
  }
}

// Hook for using network state in components
export const useNetworkState = () => {
  const [networkState, setNetworkState] = React.useState<NetworkState>(
    NetworkUtils.getInstance().getCurrentState()
  );

  React.useEffect(() => {
    const networkUtils = NetworkUtils.getInstance();
    const unsubscribe = networkUtils.addListener(setNetworkState);

    // Get initial state
    networkUtils.checkConnectivity().then(setNetworkState);

    return unsubscribe;
  }, []);

  return networkState;
};

// Export singleton instance
export const networkUtils = NetworkUtils.getInstance();
