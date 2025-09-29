import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ChatMessage, QuickReply, LegalCategory } from '../../types';
import { ChatSettings } from './ChatSettings';
import { VoiceInput } from './VoiceInput';
import { QuickReplies } from './QuickReplies';
import { TypingIndicator } from './TypingIndicator';
import { MessageBubble } from './MessageBubble';



interface ChatInterfaceProps {
  conversationId: string;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onVoiceMessage: (audioData: Blob) => void;
  isTyping: boolean;
  quickReplies: QuickReply[];
  currentCategory: LegalCategory;
  navigation: any;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversationId,
  messages,
  onSendMessage,
  onVoiceMessage,
  isTyping,
  quickReplies,
  currentCategory,
  navigation,
}) => {
  const [inputText, setInputText] = useState('');
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isTyping]);

  const handleSendMessage = () => {
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
      setShowQuickReplies(false);

      // Animate input area
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleQuickReply = (reply: QuickReply) => {
    onSendMessage(reply.textAr);
    setShowQuickReplies(false);
  };

  const handleVoiceToggle = () => {
    setShowVoiceInput(!showVoiceInput);
  };

  const handleSettingsToggle = () => {
    setShowSettings(!showSettings);
  };

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

  const renderWelcomeMessage = () => {
    if (messages.length > 0) return null;

    return (
      <View style={styles.welcomeContainer}>
        <LinearGradient
          colors={['#E31E24', '#D4AF37']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.welcomeGradient}
        >
          <View style={styles.mascotContainer}>
            <Text style={styles.mascotEmoji}>⚖️</Text>
          </View>
          <Text style={styles.welcomeText}>
            مرحباً! أنا مساعدك القانوني الذكي
          </Text>
          <Text style={styles.welcomeSubtext}>
            اسألني عن أي موضوع قانوني في تونس
          </Text>
          <Text style={styles.debugText}>
            🔗 متصل بـ Gemini Live API
          </Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {getCategoryDisplayName(currentCategory)}
            </Text>
          </View>
        </LinearGradient>
      </View>
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
          <Text style={styles.headerTitle}>المحادثة القانونية</Text>
          <Text style={styles.headerSubtitle}>
            {getCategoryDisplayName(currentCategory)}
          </Text>
        </View>

        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => onSendMessage('اختبار الاتصال مع Gemini - ما هي متطلبات تسجيل شركة جديدة في تونس؟')}
          >
            <Ionicons name="flash" size={20} color="#4CAF50" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsButton}
            onPress={handleSettingsToggle}
          >
            <Ionicons name="settings-outline" size={24} color="#E31E24" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {renderWelcomeMessage()}

          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onBookmark={() => { }}
              onShare={() => { }}
            />
          ))}

          {isTyping && <TypingIndicator />}
        </ScrollView>

        {/* Quick Replies - positioned above input */}
        {showQuickReplies && quickReplies.length > 0 && (
          <View style={styles.quickRepliesWrapper}>
            <QuickReplies
              replies={quickReplies}
              onReplyPress={handleQuickReply}
              category={currentCategory}
            />
          </View>
        )}

        {/* Input Area - Fixed positioning */}
        <View style={styles.inputWrapper}>
          <Animated.View style={[styles.inputContainer, { opacity: fadeAnim }]}>
            <TouchableOpacity
              style={styles.voiceButton}
              onPress={handleVoiceToggle}
            >
              <Ionicons
                name={showVoiceInput ? "mic" : "mic-outline"}
                size={24}
                color={showVoiceInput ? "#E31E24" : "#666666"}
              />
            </TouchableOpacity>

            <View style={styles.textInputContainer}>
              <TextInput
                ref={inputRef}
                style={styles.textInput}
                placeholder="اكتب سؤالك القانوني هنا..."
                placeholderTextColor="#999999"
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
                textAlign="right"
                onFocus={() => setShowQuickReplies(false)}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.sendButton,
                { opacity: inputText.trim() ? 1 : 0.5 }
              ]}
              onPress={handleSendMessage}
              disabled={!inputText.trim()}
            >
              <LinearGradient
                colors={['#E31E24', '#D4AF37']}
                style={styles.sendGradient}
              >
                <Ionicons name="send" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>

      {/* Voice Input Modal */}
      {showVoiceInput && (
        <VoiceInput
          onClose={() => setShowVoiceInput(false)}
          onVoiceMessage={onVoiceMessage}
          category={currentCategory}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <ChatSettings
          onClose={() => setShowSettings(false)}
          conversationId={conversationId}
        />
      )}
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
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  testButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContainer: {
    flex: 1,
    paddingBottom: 0, // Remove any bottom padding that might interfere
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 160, // Add space for input area and bottom tab bar
  },
  welcomeContainer: {
    marginBottom: 24,
  },
  welcomeGradient: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  mascotContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  mascotEmoji: {
    fontSize: 30,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  quickRepliesWrapper: {
    position: 'absolute',
    bottom: 150, // Position above input area
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  inputWrapper: {
    position: 'absolute',
    bottom: 80, // Position above bottom tab bar
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  textInput: {
    fontSize: 14,
    color: '#1A1A1A',
    textAlignVertical: 'center',
    minHeight: 24,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  sendGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});