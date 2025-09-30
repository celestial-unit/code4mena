import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkState } from '../../utils/networkUtils';

interface NetworkStatusIndicatorProps {
  onRetry?: () => void;
  showWhenConnected?: boolean;
}

export const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({
  onRetry,
  showWhenConnected = false,
}) => {
  const networkState = useNetworkState();
  const [slideAnim] = React.useState(new Animated.Value(-100));

  const isOffline =
    !networkState.isConnected || !networkState.isInternetReachable;

  React.useEffect(() => {
    if (isOffline || showWhenConnected) {
      // Slide down
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Slide up
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOffline, showWhenConnected, slideAnim]);

  if (!isOffline && !showWhenConnected) {
    return null;
  }

  const getStatusColor = () => {
    if (isOffline) return '#F44336';
    return '#4CAF50';
  };

  const getStatusIcon = () => {
    if (isOffline) return 'wifi-outline';
    return 'wifi';
  };

  const getStatusText = () => {
    if (isOffline) return 'لا يوجد اتصال بالإنترنت';
    return 'متصل بالإنترنت';
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: getStatusColor(),
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.statusInfo}>
          <Ionicons name={getStatusIcon()} size={20} color="#FFFFFF" />
          <Text style={styles.statusText}>{getStatusText()}</Text>
          {networkState.type && (
            <Text style={styles.connectionType}>({networkState.type})</Text>
          )}
        </View>

        {isOffline && onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Ionicons name="refresh-outline" size={16} color="#FFFFFF" />
            <Text style={styles.retryText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: 44, // Account for status bar
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  connectionType: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.8,
    marginLeft: 4,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
