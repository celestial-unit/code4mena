import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  FadeIn,
  BounceIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

interface ErrorBoundaryProps {
  error: string;
  onRetry: () => void;
  title?: string;
  titleAr?: string;
  titleFr?: string;
  description?: string;
  descriptionAr?: string;
  descriptionFr?: string;
}

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  error,
  onRetry,
  title = 'Something went wrong',
  titleAr = 'حدث خطأ ما',
  titleFr = 'Quelque chose s\'est mal passé',
  description = 'We encountered an error while loading your data.',
  descriptionAr = 'واجهنا خطأ أثناء تحميل بياناتك.',
  descriptionFr = 'Nous avons rencontré une erreur lors du chargement de vos données.',
}) => {
  const buttonScale = useSharedValue(1);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleRetry = () => {
    buttonScale.value = withSpring(0.95, { duration: 100 }, () => {
      buttonScale.value = withSpring(1, { duration: 100 });
    });
    onRetry();
  };

  return (
    <Animated.View 
      entering={FadeIn.duration(600)}
      style={styles.container}
    >
      <View style={styles.errorCard}>
        <LinearGradient
          colors={['#FFFFFF', '#FFF5F5']}
          style={styles.cardGradient}
        >
          {/* Error icon */}
          <Animated.View 
            entering={BounceIn.delay(200).duration(800)}
            style={styles.iconContainer}
          >
            <LinearGradient
              colors={['#E31E24', '#FF6B6B']}
              style={styles.iconGradient}
            >
              <Ionicons name="alert-circle" size={48} color="#FFFFFF" />
            </LinearGradient>
          </Animated.View>

          {/* Error content */}
          <Animated.View 
            entering={FadeIn.delay(400).duration(600)}
            style={styles.content}
          >
            <Text style={styles.title}>{titleAr}</Text>
            <Text style={styles.description}>{descriptionAr}</Text>
            
            {/* Error details (for debugging) */}
            {__DEV__ && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </Animated.View>

          {/* Retry button */}
          <Animated.View 
            entering={FadeIn.delay(600).duration(600)}
            style={[buttonStyle, styles.buttonContainer]}
          >
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRetry}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#E31E24', '#D4AF37']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.retryGradient}
              >
                <Ionicons name="refresh" size={20} color="#FFFFFF" />
                <Text style={styles.retryText}>إعادة المحاولة</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Decorative elements */}
          <View style={styles.decorativeElements}>
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />
            <View style={styles.decorativeAccent} />
          </View>
        </LinearGradient>
      </View>
    </Animated.View>
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
    width: Math.min(screenWidth - 40, 400),
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardGradient: {
    padding: 32,
    alignItems: 'center',
    position: 'relative',
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#E31E24',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  content: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  errorDetails: {
    backgroundColor: '#FFF0F0',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#E31E24',
    marginTop: 16,
    maxWidth: '100%',
  },
  errorText: {
    fontSize: 12,
    color: '#E31E24',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    width: '100%',
  },
  retryButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  retryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  retryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  decorativeElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E31E24',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: 40,
    left: 30,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D4AF37',
  },
  decorativeAccent: {
    position: 'absolute',
    top: 80,
    left: 20,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#D4AF37',
    transform: [{ rotate: '45deg' }],
  },
});