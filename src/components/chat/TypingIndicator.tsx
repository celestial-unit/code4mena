import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export const TypingIndicator: React.FC = () => {
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;
  const containerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate container appearance
    Animated.timing(containerAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Create typing animation sequence
    const createDotAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Start animations with staggered delays
    const animations = [
      createDotAnimation(dot1Anim, 0),
      createDotAnimation(dot2Anim, 200),
      createDotAnimation(dot3Anim, 400),
    ];

    animations.forEach(animation => animation.start());

    return () => {
      animations.forEach(animation => animation.stop());
    };
  }, []);

  const getDotStyle = (animValue: Animated.Value) => ({
    opacity: animValue,
    transform: [
      {
        scale: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1.2],
        }),
      },
    ],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: containerAnim, transform: [{ scale: containerAnim }] },
      ]}
    >
      <View style={styles.typingContainer}>
        <View style={styles.aiAvatar}>
          <Text style={styles.aiAvatarText}>⚖️</Text>
        </View>

        <View style={styles.typingBubble}>
          <View style={styles.typingContent}>
            <Text style={styles.typingText}>يكتب</Text>
            <View style={styles.dotsContainer}>
              <Animated.View style={[styles.dot, getDotStyle(dot1Anim)]} />
              <Animated.View style={[styles.dot, getDotStyle(dot2Anim)]} />
              <Animated.View style={[styles.dot, getDotStyle(dot3Anim)]} />
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    maxWidth: screenWidth * 0.85,
  },
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  aiAvatarText: {
    fontSize: 18,
  },
  typingBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  typingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typingText: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D4AF37',
  },
});
