import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LegalCategory } from '../types';

const { width: screenWidth } = Dimensions.get('window');

interface ChatbotSelectionScreenProps {
  navigation: any;
}

interface ChatbotOption {
  category: LegalCategory;
  nameAr: string;
  descriptionAr: string;
  icon: string;
  colors: readonly [string, string];
  emoji: string;
}

const chatbotOptions: ChatbotOption[] = [
  {
    category: 'business_law',
    nameAr: 'قانون الأعمال',
    descriptionAr: 'استشارات حول الشركات والتجارة والاستثمار',
    icon: 'business-outline',
    colors: ['#E31E24', '#D4AF37'],
    emoji: '🏢',
  },
  {
    category: 'civil_law',
    nameAr: 'القانون المدني',
    descriptionAr: 'قضايا الملكية والعقود والحقوق المدنية',
    icon: 'people-outline',
    colors: ['#2196F3', '#21CBF3'],
    emoji: '⚖️',
  },
  {
    category: 'family_law',
    nameAr: 'قانون الأسرة',
    descriptionAr: 'الزواج والطلاق والحضانة والميراث',
    icon: 'home-outline',
    colors: ['#FF6B6B', '#FF8E8E'],
    emoji: '👨‍👩‍👧‍👦',
  },
  {
    category: 'labor_law',
    nameAr: 'قانون العمل',
    descriptionAr: 'حقوق العمال وعقود العمل والتأمين الاجتماعي',
    icon: 'hammer-outline',
    colors: ['#4CAF50', '#66BB6A'],
    emoji: '👷‍♂️',
  },
  {
    category: 'tax_law',
    nameAr: 'القانون الضريبي',
    descriptionAr: 'الضرائب والرسوم والإعفاءات الضريبية',
    icon: 'calculator-outline',
    colors: ['#FF9800', '#FFB74D'],
    emoji: '💰',
  },
  {
    category: 'administrative_law',
    nameAr: 'القانون الإداري',
    descriptionAr: 'الإجراءات الحكومية والتراخيص والخدمات العامة',
    icon: 'document-text-outline',
    colors: ['#9C27B0', '#BA68C8'],
    emoji: '🏛️',
  },
];

export const ChatbotSelectionScreen: React.FC<ChatbotSelectionScreenProps> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState<LegalCategory | null>(null);
  const [animatedValues] = useState(() => 
    chatbotOptions.map(() => new Animated.Value(1))
  );

  const handleCategorySelect = (category: LegalCategory, index: number) => {
    setSelectedCategory(category);
    
    // Animate the selected card
    Animated.sequence([
      Animated.timing(animatedValues[index], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValues[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to chat with selected category
    setTimeout(() => {
      navigation.navigate('Chat', { category });
    }, 200);
  };

  const renderChatbotCard = (option: ChatbotOption, index: number) => {
    const isSelected = selectedCategory === option.category;
    
    return (
      <Animated.View
        key={option.category}
        style={[
          styles.cardContainer,
          {
            transform: [{ scale: animatedValues[index] }],
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.card, isSelected && styles.selectedCard]}
          onPress={() => handleCategorySelect(option.category, index)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={option.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <Text style={styles.emoji}>{option.emoji}</Text>
                <View style={styles.iconBackground}>
                  <Ionicons name={option.icon as any} size={24} color="#FFFFFF" />
                </View>
              </View>
              
              <View style={styles.textContainer}>
                <Text style={styles.categoryName}>{option.nameAr}</Text>
                <Text style={styles.categoryDescription}>{option.descriptionAr}</Text>
              </View>
              
              <View style={styles.arrowContainer}>
                <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#E31E24" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>اختر مساعدك القانوني</Text>
          <Text style={styles.headerSubtitle}>اختر المجال القانوني المناسب</Text>
        </View>
        
        <View style={styles.placeholder} />
      </View>

      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <LinearGradient
          colors={['#E31E24', '#D4AF37']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.welcomeGradient}
        >
          <Text style={styles.welcomeEmoji}>🤖</Text>
          <Text style={styles.welcomeTitle}>مرحباً بك في كنوني</Text>
          <Text style={styles.welcomeSubtitle}>
            اختر المجال القانوني الذي تحتاج المساعدة فيه
          </Text>
        </LinearGradient>
      </View>

      {/* Chatbot Options */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>المساعدين القانونيين المتخصصين</Text>
        <Text style={styles.sectionSubtitle}>
          كل مساعد متخصص في مجال قانوني محدد لتقديم أفضل الاستشارات
        </Text>
        
        <View style={styles.cardsContainer}>
          {chatbotOptions.map((option, index) => renderChatbotCard(option, index))}
        </View>
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  welcomeSection: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  welcomeGradient: {
    padding: 24,
    alignItems: 'center',
  },
  welcomeEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 20,
  },
  cardsContainer: {
    gap: 12,
  },
  cardContainer: {
    marginBottom: 4,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  selectedCard: {
    elevation: 8,
    shadowOpacity: 0.2,
  },
  cardGradient: {
    padding: 20,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginRight: 16,
  },
  emoji: {
    fontSize: 32,
    position: 'absolute',
    top: -8,
    right: -8,
    zIndex: 2,
  },
  iconBackground: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  textContainer: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 20,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSpacing: {
    height: 100,
  },
});