import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { QuickReply, LegalCategory } from '../../types';

const { width: screenWidth } = Dimensions.get('window');

interface QuickRepliesProps {
  replies: QuickReply[];
  onReplyPress: (reply: QuickReply) => void;
  category: LegalCategory;
}

export const QuickReplies: React.FC<QuickRepliesProps> = ({
  replies,
  onReplyPress,
  category,
}) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getCategoryIcon = (category: LegalCategory): string => {
    const icons: Record<LegalCategory, string> = {
      business_law: 'business-outline',
      civil_law: 'people-outline',
      administrative_law: 'document-text-outline',
      labor_law: 'hammer-outline',
      tax_law: 'calculator-outline',
      family_law: 'home-outline',
      criminal_law: 'shield-outline',
      constitutional_law: 'library-outline',
      commercial_law: 'storefront-outline',
      environmental_law: 'leaf-outline',
    };
    return icons[category] || 'help-circle-outline';
  };

  const getCategoryColor = (category: LegalCategory): readonly [string, string] => {
    const colors: Record<LegalCategory, readonly [string, string]> = {
      business_law: ['#E31E24', '#D4AF37'],
      civil_law: ['#2196F3', '#21CBF3'],
      administrative_law: ['#FF9800', '#FFC107'],
      labor_law: ['#4CAF50', '#8BC34A'],
      tax_law: ['#9C27B0', '#E91E63'],
      family_law: ['#FF5722', '#FF9800'],
      criminal_law: ['#795548', '#8D6E63'],
      constitutional_law: ['#607D8B', '#78909C'],
      commercial_law: ['#3F51B5', '#5C6BC0'],
      environmental_law: ['#4CAF50', '#66BB6A'],
    };
    return colors[category] || ['#E31E24', '#D4AF37'];
  };

  const renderCategoryHeader = () => (
    <View style={styles.categoryHeader}>
      <LinearGradient
        colors={getCategoryColor(category)}
        style={styles.categoryGradient}
      >
        <Ionicons 
          name={getCategoryIcon(category) as any} 
          size={20} 
          color="#FFFFFF" 
        />
        <Text style={styles.categoryTitle}>
          أسئلة شائعة - {getCategoryDisplayName(category)}
        </Text>
      </LinearGradient>
    </View>
  );

  const getCategoryDisplayName = (category: LegalCategory): string => {
    const categoryNames: Record<LegalCategory, string> = {
      business_law: 'قانون الأعمال',
      civil_law: 'القانون المدني',
      administrative_law: 'القانون الإداري',
      labor_law: 'قانون العمل',
      tax_law: 'القانون الضريبي',
      family_law: 'قانون الأسرة',
      criminal_law: 'القانون الجنائي',
      constitutional_law: 'القانون الدستوري',
      commercial_law: 'القانون التجاري',
      environmental_law: 'القانون البيئي',
    };
    return categoryNames[category] || 'استشارة قانونية';
  };

  const renderQuickReply = (reply: QuickReply, index: number) => {
    const animDelay = index * 100;
    const itemAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(itemAnim, {
        toValue: 1,
        duration: 300,
        delay: animDelay,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View
        key={reply.id}
        style={[
          styles.replyItemContainer,
          {
            opacity: itemAnim,
            transform: [
              {
                translateY: itemAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.replyButton}
          onPress={() => onReplyPress(reply)}
          activeOpacity={0.8}
        >
          <View style={styles.replyContent}>
            <Text style={styles.replyText}>{reply.textAr}</Text>
            {reply.isPopular && (
              <View style={styles.popularBadge}>
                <Ionicons name="trending-up" size={12} color="#E31E24" />
                <Text style={styles.popularText}>شائع</Text>
              </View>
            )}
          </View>
          <Ionicons name="chevron-forward" size={16} color="#666666" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (replies.length === 0) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {renderCategoryHeader()}
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollContainer}
      >
        {replies.slice(0, 6).map((reply, index) => renderQuickReply(reply, index))}
      </ScrollView>

      <View style={styles.hintContainer}>
        <Ionicons name="information-circle-outline" size={14} color="#666666" />
        <Text style={styles.hintText}>اضغط على أي سؤال للبدء</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 12,
  },
  categoryHeader: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  categoryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  categoryTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  scrollContainer: {
    maxHeight: 120,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  replyItemContainer: {
    marginRight: 8,
  },
  replyButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: screenWidth * 0.7,
    minWidth: 150,
  },
  replyContent: {
    flex: 1,
  },
  replyText: {
    fontSize: 13,
    color: '#1A1A1A',
    lineHeight: 18,
    textAlign: 'right',
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  popularText: {
    fontSize: 10,
    color: '#E31E24',
    fontWeight: '500',
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 6,
  },
  hintText: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
  },
});