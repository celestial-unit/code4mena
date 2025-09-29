import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  type?: 'network' | 'server' | 'auth' | 'general';
  isRetrying?: boolean;
  showRetry?: boolean;
  showDismiss?: boolean;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  type = 'general',
  isRetrying = false,
  showRetry = true,
  showDismiss = false,
}) => {
  const getErrorIcon = () => {
    switch (type) {
      case 'network':
        return 'wifi-outline';
      case 'server':
        return 'server-outline';
      case 'auth':
        return 'lock-closed-outline';
      default:
        return 'alert-circle-outline';
    }
  };

  const getErrorColor = () => {
    switch (type) {
      case 'network':
        return '#FF9800';
      case 'server':
        return '#F44336';
      case 'auth':
        return '#9C27B0';
      default:
        return '#F44336';
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.errorCard, { borderLeftColor: getErrorColor() }]}>
        <View style={styles.errorHeader}>
          <Ionicons 
            name={getErrorIcon()} 
            size={24} 
            color={getErrorColor()} 
          />
          <Text style={styles.errorTitle}>حدث خطأ</Text>
        </View>
        
        <Text style={styles.errorMessage}>{error}</Text>
        
        <View style={styles.buttonContainer}>
          {showRetry && onRetry && (
            <TouchableOpacity
              style={[styles.button, styles.retryButton, isRetrying && styles.disabledButton]}
              onPress={onRetry}
              disabled={isRetrying}
            >
              <Ionicons 
                name={isRetrying ? "hourglass-outline" : "refresh-outline"} 
                size={16} 
                color="#FFFFFF" 
              />
              <Text style={styles.buttonText}>
                {isRetrying ? 'جاري المحاولة...' : 'إعادة المحاولة'}
              </Text>
            </TouchableOpacity>
          )}
          
          {showDismiss && onDismiss && (
            <TouchableOpacity
              style={[styles.button, styles.dismissButton]}
              onPress={onDismiss}
            >
              <Ionicons name="close-outline" size={16} color="#666666" />
              <Text style={[styles.buttonText, styles.dismissButtonText]}>إغلاق</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  errorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  retryButton: {
    backgroundColor: '#E31E24',
  },
  dismissButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dismissButtonText: {
    color: '#666666',
  },
});