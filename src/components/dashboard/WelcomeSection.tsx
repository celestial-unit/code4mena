import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  FadeInDown, 
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';

// Types
import { User } from '../../types';

const { width: screenWidth } = Dimensions.get('window');

interface WelcomeSectionProps {
  user: User | null;
  onChatPress: () => void;
  onSearchPress: () => void;
  onProfilePress: () => void;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  user,
  onChatPress,
  onSearchPress,
  onProfilePress,
}) => {
  const pulseScale = useSharedValue(1);
  const chatButtonScale = useSharedValue(1);

  // Animated styles
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const chatButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: chatButtonScale.value }],
  }));

  // Start pulse animation
  React.useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withSpring(1.05, { duration: 1000 }),
        withSpring(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const handleChatPress = () => {
    chatButtonScale.value = withSequence(
      withSpring(0.95, { duration: 100 }),
      withSpring(1, { duration: 100 })
    );
    onChatPress();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const language = user?.preferences?.language || 'ar';
    
    if (language === 'ar') {
      if (hour < 12) return 'صباح الخير';
      if (hour < 17) return 'مساء الخير';
      return 'مساء الخير';
    } else if (language === 'fr') {
      if (hour < 12) return 'Bonjour';
      if (hour < 17) return 'Bon après-midi';
      return 'Bonsoir';
    } else {
      if (hour < 12) return 'Good morning';
      if (hour < 17) return 'Good afternoon';
      return 'Good evening';
    }
  };

  const getUserName = () => {
    if (!user) return '';
    const language = user.preferences?.language || 'ar';
    
    if (language === 'ar' && user.nameAr) {
      return user.nameAr;
    } else if (language === 'fr' && user.name) {
      return user.name;
    }
    return user.name;
  };

  const getWelcomeMessage = () => {
    const language = user?.preferences?.language || 'ar';
    
    if (language === 'ar') {
      return 'مرحباً بك في كنوني - مرشدك القانوني الذكي';
    } else if (language === 'fr') {
      return 'Bienvenue sur Kanounji - Votre guide juridique intelligent';
    }
    return 'Welcome to Kanounji - Your Smart Legal Guide';
  };

  return (
    <Animated.View 
      entering={FadeInDown.duration(800).springify()}
      style={styles.container}
    >
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800' }}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
      >
        <LinearGradient
          colors={['rgba(227, 30, 36, 0.9)', 'rgba(212, 175, 55, 0.8)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.content}>
            {/* Header with profile button */}
            <Animated.View 
              entering={FadeInRight.delay(200).duration(600)}
              style={styles.header}
            >
              <View style={styles.greetingContainer}>
                <Text style={styles.greeting}>{getGreeting()}</Text>
                <Text style={styles.userName}>{getUserName()}</Text>
              </View>
              
              <TouchableOpacity
                style={styles.profileButton}
                onPress={onProfilePress}
                activeOpacity={0.8}
              >
                <View style={styles.profileImageContainer}>
                  <Ionicons name="person" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationText}>3</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* Welcome message */}
            <Animated.View 
              entering={FadeInDown.delay(400).duration(600)}
              style={styles.welcomeContainer}
            >
              <Text style={styles.welcomeMessage}>{getWelcomeMessage()}</Text>
            </Animated.View>

            {/* Action buttons */}
            <Animated.View 
              entering={FadeInDown.delay(600).duration(600)}
              style={styles.actionButtons}
            >
              {/* Chat button with pulse animation */}
              <Animated.View style={[pulseStyle, chatButtonStyle]}>
                <TouchableOpacity
                  style={styles.chatButton}
                  onPress={handleChatPress}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#FFFFFF', '#F8F9FA']}
                    style={styles.chatButtonGradient}
                  >
                    <Ionicons name="chatbubbles" size={24} color="#E31E24" />
                    <Text style={styles.chatButtonText}>
                      {user?.preferences?.language === 'ar' ? 'ابدأ محادثة' : 
                       user?.preferences?.language === 'fr' ? 'Commencer chat' : 'Start Chat'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {/* Search button */}
              <TouchableOpacity
                style={styles.searchButton}
                onPress={onSearchPress}
                activeOpacity={0.8}
              >
                <Ionicons name="search" size={20} color="#FFFFFF" />
                <Text style={styles.searchButtonText}>
                  {user?.preferences?.language === 'ar' ? 'بحث' : 
                   user?.preferences?.language === 'fr' ? 'Recherche' : 'Search'}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Tunisian cultural elements */}
            <View style={styles.culturalElements}>
              <View style={styles.culturalPattern} />
              <View style={styles.culturalAccent} />
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  backgroundImage: {
    width: '100%',
    minHeight: 200,
  },
  backgroundImageStyle: {
    borderRadius: 20,
  },
  gradient: {
    flex: 1,
    borderRadius: 20,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 4,
  },
  profileButton: {
    position: 'relative',
  },
  profileImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  welcomeContainer: {
    marginVertical: 16,
  },
  welcomeMessage: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  chatButton: {
    flex: 1,
    marginRight: 12,
  },
  chatButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  chatButtonText: {
    fontSize: 16,
    color: '#E31E24',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  searchButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 6,
  },
  culturalElements: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 100,
    height: 100,
    opacity: 0.1,
  },
  culturalPattern: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
  },
  culturalAccent: {
    position: 'absolute',
    top: 20,
    right: 50,
    width: 20,
    height: 20,
    backgroundColor: '#D4AF37',
    borderRadius: 10,
    transform: [{ rotate: '30deg' }],
  },
});