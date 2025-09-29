import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ChatConversation, ChatMessage } from '../../types';
import { chatService } from '../../services/chatService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ConversationHistoryProps {
  visible: boolean;
  onClose: () => void;
  onSelectConversation: (conversation: ChatConversation) => void;
  userId: string;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  visible,
  onClose,
  onSelectConversation,
  userId,
}) => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ChatMessage[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadConversations();
    }
  }, [visible]);

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery]);

  const loadConversations = async () => {
    try {
      // This would typically load from the mock data service
      // For now, we'll use sample data
      const sampleConversations: ChatConversation[] = [
        {
          id: 'conv-001',
          userId,
          title: 'Business Registration Inquiry',
          titleAr: 'استفسار حول تسجيل الأعمال',
          titleFr: 'Demande d\'enregistrement d\'entreprise',
          messages: [],
          category: 'business_law',
          sector: 'business',
          language: 'ar',
          isBookmarked: true,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
          status: 'active',
          metadata: {
            totalMessages: 8,
            averageResponseTime: 1.5,
            topicsDiscussed: ['business registration', 'legal requirements'],
            legalCategoriesCovered: ['business_law'],
            sectorsDiscussed: ['business'],
            complexityLevel: 'intermediate'
          }
        },
        {
          id: 'conv-002',
          userId,
          title: 'Tax Obligations for E-commerce',
          titleAr: 'الالتزامات الضريبية للتجارة الإلكترونية',
          titleFr: 'Obligations fiscales pour le commerce électronique',
          messages: [],
          category: 'tax_law',
          sector: 'money',
          language: 'ar',
          isBookmarked: false,
          createdAt: new Date('2024-01-14'),
          updatedAt: new Date('2024-01-14'),
          status: 'active',
          metadata: {
            totalMessages: 12,
            averageResponseTime: 2.1,
            topicsDiscussed: ['digital tax', 'e-commerce compliance'],
            legalCategoriesCovered: ['tax_law'],
            sectorsDiscussed: ['money', 'business'],
            complexityLevel: 'advanced'
          }
        },
        {
          id: 'conv-003',
          userId,
          title: 'Labor Law Questions',
          titleAr: 'أسئلة قانون العمل',
          titleFr: 'Questions sur le droit du travail',
          messages: [],
          category: 'labor_law',
          sector: 'business',
          language: 'ar',
          isBookmarked: false,
          createdAt: new Date('2024-01-13'),
          updatedAt: new Date('2024-01-13'),
          status: 'active',
          metadata: {
            totalMessages: 6,
            averageResponseTime: 1.8,
            topicsDiscussed: ['remote work', 'employee rights'],
            legalCategoriesCovered: ['labor_law'],
            sectorsDiscussed: ['business'],
            complexityLevel: 'basic'
          }
        }
      ];
      
      setConversations(sampleConversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const performSearch = async () => {
    if (!selectedConversation) return;
    
    setIsSearching(true);
    try {
      const response = await chatService.searchConversationHistory(
        selectedConversation,
        searchQuery
      );
      
      if (response.success && response.data) {
        setSearchResults(response.data);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('ar-TN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category: string): string => {
    const icons = {
      business_law: 'business-outline',
      tax_law: 'calculator-outline',
      labor_law: 'hammer-outline',
      administrative_law: 'document-text-outline',
      civil_law: 'people-outline',
      family_law: 'home-outline',
    };
    return icons[category as keyof typeof icons] || 'help-circle-outline';
  };

  const getCategoryColor = (category: string): readonly [string, string] => {
    const colors: Record<string, readonly [string, string]> = {
      business_law: ['#E31E24', '#D4AF37'],
      tax_law: ['#9C27B0', '#E91E63'],
      labor_law: ['#4CAF50', '#8BC34A'],
      administrative_law: ['#FF9800', '#FFC107'],
      civil_law: ['#2196F3', '#21CBF3'],
      family_law: ['#FF5722', '#FF9800'],
      criminal_law: ['#795548', '#8D6E63'],
      constitutional_law: ['#607D8B', '#78909C'],
      commercial_law: ['#3F51B5', '#5C6BC0'],
      environmental_law: ['#4CAF50', '#66BB6A'],
    };
    return colors[category] || ['#E31E24', '#D4AF37'];
  };

  const renderConversationItem = (conversation: ChatConversation) => (
    <TouchableOpacity
      key={conversation.id}
      style={styles.conversationItem}
      onPress={() => onSelectConversation(conversation)}
    >
      <View style={styles.conversationHeader}>
        <LinearGradient
          colors={getCategoryColor(conversation.category)}
          style={styles.categoryIcon}
        >
          <Ionicons 
            name={getCategoryIcon(conversation.category) as any} 
            size={20} 
            color="#FFFFFF" 
          />
        </LinearGradient>
        
        <View style={styles.conversationInfo}>
          <Text style={styles.conversationTitle} numberOfLines={1}>
            {conversation.titleAr}
          </Text>
          <Text style={styles.conversationDate}>
            {formatDate(conversation.updatedAt)}
          </Text>
        </View>
        
        <View style={styles.conversationMeta}>
          {conversation.isBookmarked && (
            <Ionicons name="bookmark" size={16} color="#E31E24" />
          )}
          <Text style={styles.messageCount}>
            {conversation.metadata.totalMessages} رسالة
          </Text>
        </View>
      </View>
      
      <View style={styles.conversationStats}>
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={12} color="#666666" />
          <Text style={styles.statText}>
            {conversation.metadata.averageResponseTime}ث متوسط الرد
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="trending-up-outline" size={12} color="#666666" />
          <Text style={styles.statText}>
            {conversation.metadata.complexityLevel === 'basic' ? 'بسيط' :
             conversation.metadata.complexityLevel === 'intermediate' ? 'متوسط' :
             conversation.metadata.complexityLevel === 'advanced' ? 'متقدم' : 'خبير'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSearchResults = () => (
    <View style={styles.searchResults}>
      <Text style={styles.searchResultsTitle}>
        نتائج البحث ({searchResults.length})
      </Text>
      
      <ScrollView style={styles.searchResultsList}>
        {searchResults.map((message) => (
          <View key={message.id} style={styles.searchResultItem}>
            <View style={styles.searchResultHeader}>
              <Ionicons 
                name={message.type === 'user' ? 'person-outline' : 'chatbubble-outline'} 
                size={16} 
                color="#666666" 
              />
              <Text style={styles.searchResultType}>
                {message.type === 'user' ? 'أنت' : 'المساعد القانوني'}
              </Text>
              <Text style={styles.searchResultTime}>
                {new Date(message.timestamp).toLocaleTimeString('ar-TN')}
              </Text>
            </View>
            
            <Text style={styles.searchResultContent} numberOfLines={3}>
              {message.content}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={['#E31E24', '#D4AF37']}
          style={styles.header}
        >
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>سجل المحادثات</Text>
          
          <TouchableOpacity style={styles.searchToggle}>
            <Ionicons name="search-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={20} color="#666666" />
            <TextInput
              style={styles.searchInput}
              placeholder="البحث في المحادثات..."
              placeholderTextColor="#999999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              textAlign="right"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#666666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {isSearching ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>جاري البحث...</Text>
            </View>
          ) : searchResults.length > 0 ? (
            renderSearchResults()
          ) : (
            <ScrollView style={styles.conversationsList} showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionTitle}>المحادثات الأخيرة</Text>
              
              {conversations.map(renderConversationItem)}
              
              {conversations.length === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons name="chatbubbles-outline" size={64} color="#CCCCCC" />
                  <Text style={styles.emptyStateText}>لا توجد محادثات بعد</Text>
                  <Text style={styles.emptyStateSubtext}>
                    ابدأ محادثة جديدة لطرح أسئلتك القانونية
                  </Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
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
    paddingVertical: 16,
    paddingTop: 50,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  searchToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
  },
  content: {
    flex: 1,
  },
  conversationsList: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'right',
  },
  conversationItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'right',
  },
  conversationDate: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
    textAlign: 'right',
  },
  conversationMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  messageCount: {
    fontSize: 12,
    color: '#666666',
  },
  conversationStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 11,
    color: '#666666',
  },
  searchResults: {
    flex: 1,
    padding: 16,
  },
  searchResultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'right',
  },
  searchResultsList: {
    flex: 1,
  },
  searchResultItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#E31E24',
  },
  searchResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  searchResultType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E31E24',
    flex: 1,
    textAlign: 'right',
  },
  searchResultTime: {
    fontSize: 11,
    color: '#666666',
  },
  searchResultContent: {
    fontSize: 13,
    color: '#1A1A1A',
    lineHeight: 18,
    textAlign: 'right',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999999',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});