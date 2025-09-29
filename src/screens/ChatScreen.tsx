import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { ChatInterface } from '../components/chat/ChatInterface';
import { ErrorDisplay, NetworkStatusIndicator } from '../components/common';
import { useErrorHandler } from '../hooks';
import { useNetworkState } from '../utils/networkUtils';
import { chatService } from '../services/chatService';
import apiService from '../services/api';
import geminiApiService from '../services/geminiApiService';
import { debugChatMessage } from '../utils/debugApi';
import { useTheme } from '../contexts/ThemeContext';
import {
  ChatMessage,
  QuickReply,
  LegalCategory,
  ChatConversation
} from '../types';

interface ChatScreenProps {
  navigation: any;
  route?: {
    params?: {
      conversationId?: string;
      category?: LegalCategory;
    };
  };
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [conversationId] = useState(
    route?.params?.conversationId || `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  );
  const [currentCategory] = useState<LegalCategory>(
    route?.params?.category || 'business_law'
  );

  // Error handling
  const { error, isRetrying, handleError, clearError, retry } = useErrorHandler({
    maxRetries: 3,
    showAlert: false
  });
  const networkState = useNetworkState();

  useEffect(() => {
    loadQuickReplies();
    loadExistingConversation();
    testBackendConnection();
  }, []);

  const testBackendConnection = async () => {
    try {
      console.log('[Chat] 🔍 Testing backend connection...');
      const health = await geminiApiService.healthCheck();
      console.log('[Chat] ✅ Backend is healthy:', health);
    } catch (error) {
      console.error('[Chat] ❌ Backend connection failed:', error);
    }
  };

  const loadQuickReplies = async () => {
    try {
      clearError();
      const response = await chatService.getQuickReplies(currentCategory);
      if (response.success && response.data) {
        setQuickReplies(response.data);
      }
    } catch (error) {
      console.error('Failed to load quick replies:', error);
      handleError(error, 'فشل في تحميل الردود السريعة');
    }
  };

  const loadExistingConversation = async () => {
    if (route?.params?.conversationId) {
      try {
        clearError();
        // Load existing conversation messages
        // This would typically fetch from the backend
        // For now, we'll start with empty messages
        setMessages([]);
      } catch (error) {
        console.error('Failed to load conversation:', error);
        handleError(error, 'فشل في تحميل المحادثة');
      }
    }
  };

  const handleSendMessage = async (message: string) => {
    try {
      setIsTyping(true);
      clearError();

      // Check network connectivity first
      if (!networkState.isConnected || !networkState.isInternetReachable) {
        throw new Error('لا يوجد اتصال بالإنترنت. يرجى التحقق من اتصالك والمحاولة مرة أخرى.');
      }

      // Create user message immediately for better UX
      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}-user`,
        conversationId,
        type: 'user',
        content: message,
        timestamp: new Date(),
        isEdited: false,
        metadata: {
          relatedTopics: [],
          culturalContext: {
            culturalReferences: [],
            dialectTerms: [],
            regionalRelevance: []
          }
        }
      };

      setMessages(prev => [...prev, userMessage]);

      // Prepare conversation history for Gemini API
      const conversationHistory = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      }));

      // Try your Python backend API first (with your Gemini Live implementation)
      try {
        console.log('[Chat] 🚀 Sending message to Python Backend (Gemini Live):', message);

        // Direct API call to your Python backend
        const response = await fetch('http://localhost:8001/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer demo-token'
          },
          body: JSON.stringify({
            query: message,
            language: 'ar',
            user_id: 'mobile-app-user'
          })
        });

        if (!response.ok) {
          throw new Error(`Backend error: ${response.status}`);
        }

        const backendResponse = await response.json();
        console.log('[Chat] ✅ Python Backend response received:', {
          responseLength: backendResponse.response?.length || 0,
          sourcesCount: backendResponse.sources?.length || 0,
          queryId: backendResponse.query_id,
          hasDisclaimer: !!backendResponse.disclaimer
        });

        // Add a note to show it's coming from your backend
        const responseWithNote = `${backendResponse.response}\n\n🔗 الرد من خادم Python الخاص بك (Query ID: ${backendResponse.query_id})`;

        // Create AI message from your Python backend response
        const aiMessage: ChatMessage = {
          id: `msg-${Date.now()}-ai`,
          conversationId,
          type: 'ai',
          content: responseWithNote || 'لم يتم الحصول على رد من الخادم',
          contentAr: responseWithNote || 'لم يتم الحصول على رد من الخادم',
          contentFr: backendResponse.response || 'Aucune réponse reçue du serveur',
          timestamp: new Date(),
          isEdited: false,
          metadata: {
            confidence: 0.9,
            sources: (backendResponse.sources || []).map((source: any) => source.source || source.title),
            processingTime: 2.0,
            legalReferences: (backendResponse.sources || []).map((source: any, index: number) => ({
              id: `ref-${Date.now()}-${index}`,
              title: source.title || 'مرجع قانوني',
              titleAr: source.title || 'مرجع قانوني',
              titleFr: source.title || 'Référence légale',
              type: 'law' as const,
              source: source.source || 'مصدر قانوني',
              relevanceScore: source.relevance_score || 0.5,
              excerpt: source.article || source.content || 'نص قانوني',
              excerptAr: source.article || source.content || 'نص قانوني',
              excerptFr: source.article || source.content || 'Texte légal',
              url: source.url
            })),
            suggestedActions: [],
            relatedTopics: ['legal guidance', 'tunisian law'],
            culturalContext: {
              culturalReferences: [],
              dialectTerms: [],
              regionalRelevance: []
            },
            disclaimer: backendResponse.disclaimer,
            queryId: backendResponse.query_id
          },
          mascotAnimation: {
            type: 'explaining' as const,
            sector: 'business' as const,
            duration: 3.0,
            culturalElements: ['legal_documents', 'gemini_ai'],
            voiceSync: true
          }
        };

        setMessages(prev => [...prev, aiMessage]);
        console.log('[Chat] ✅ Python Backend (Gemini Live) response received successfully');

      } catch (backendError) {
        console.error('❌ Python Backend failed:', backendError);

        // Show error message instead of fallback
        const errorMessage: ChatMessage = {
          id: `msg-${Date.now()}-error`,
          conversationId,
          type: 'ai',
          content: `❌ فشل الاتصال مع خادم Python الخاص بك\n\n🔍 تحقق من:\n• الخادم يعمل على المنفذ 8001\n• متغير GEMINI_API_KEY مضبوط\n• مكتبات Python مثبتة\n\n📝 تفاصيل الخطأ: ${backendError instanceof Error ? backendError.message : 'خطأ غير معروف'}`,
          contentAr: `❌ فشل الاتصال مع خادم Python الخاص بك\n\n🔍 تحقق من:\n• الخادم يعمل على المنفذ 8001\n• متغير GEMINI_API_KEY مضبوط\n• مكتبات Python مثبتة\n\n📝 تفاصيل الخطأ: ${backendError instanceof Error ? backendError.message : 'خطأ غير معروف'}`,
          timestamp: new Date(),
          isEdited: false,
          metadata: {
            confidence: 0,
            sources: [],
            processingTime: 0,
            legalReferences: [],
            suggestedActions: [],
            relatedTopics: ['error'],
            culturalContext: {
              culturalReferences: [],
              dialectTerms: [],
              regionalRelevance: []
            }
          }
        };

        setMessages(prev => [...prev, errorMessage]);
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      handleError(error, 'فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceMessage = async (audioData: Blob) => {
    try {
      setIsTyping(true);
      clearError();

      // Check network connectivity first
      if (!networkState.isConnected || !networkState.isInternetReachable) {
        throw new Error('لا يوجد اتصال بالإنترنت. يرجى التحقق من اتصالك والمحاولة مرة أخرى.');
      }

      console.log('[Chat] Processing voice message with Backend API');

      // Process audio using your backend API
      const audioResult = await geminiApiService.processAudioQuery(audioData, 'ar-TN');

      if (audioResult.error) {
        throw new Error(audioResult.error);
      }

      // Create user message from transcription
      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}-user`,
        conversationId,
        type: 'user',
        content: audioResult.transcription || 'رسالة صوتية',
        timestamp: new Date(),
        isEdited: false,
        metadata: {
          relatedTopics: [],
          culturalContext: {
            culturalReferences: [],
            dialectTerms: [],
            regionalRelevance: []
          }
        }
      };

      setMessages(prev => [...prev, userMessage]);

      // Create AI response message
      const aiMessage: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        conversationId,
        type: 'ai',
        content: audioResult.response_text || 'تم معالجة الرسالة الصوتية',
        contentAr: audioResult.response_text || 'تم معالجة الرسالة الصوتية',
        timestamp: new Date(),
        isEdited: false,
        metadata: {
          confidence: audioResult.confidence || 0.9,
          sources: ['Gemini Live Audio'],
          processingTime: 2.0,
          legalReferences: [],
          suggestedActions: [],
          relatedTopics: ['voice interaction'],
          culturalContext: {
            culturalReferences: [],
            dialectTerms: [],
            regionalRelevance: []
          }
        },
        mascotAnimation: {
          type: 'explaining' as const,
          sector: 'business' as const,
          duration: 3.0,
          culturalElements: ['voice_interaction'],
          voiceSync: true
        }
      };

      setMessages(prev => [...prev, aiMessage]);

      // If there's audio response, you could play it here
      if (audioResult.audio_response_available) {
        console.log('[Chat] Audio response available from backend');
        // TODO: Implement audio playback if needed
      }

      console.log('[Chat] Voice message processed successfully');

    } catch (error) {
      console.error('Failed to process voice message:', error);
      handleError(error, 'فشل في معالجة الرسالة الصوتية');
    } finally {
      setIsTyping(false);
    }
  };

  const handleRetry = async () => {
    await retry(async () => {
      await loadQuickReplies();
      await loadExistingConversation();
    });
  };

  // Show error display if there's an error and no messages
  if (error && messages.length === 0) {
    return (
      <View style={styles.container}>
        <NetworkStatusIndicator onRetry={handleRetry} />
        <ErrorDisplay
          error={error}
          onRetry={handleRetry}
          type="network"
          isRetrying={isRetrying}
          showRetry={true}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <NetworkStatusIndicator onRetry={handleRetry} />
      <ChatInterface
        conversationId={conversationId}
        messages={messages}
        onSendMessage={handleSendMessage}
        onVoiceMessage={handleVoiceMessage}
        isTyping={isTyping}
        quickReplies={quickReplies}
        currentCategory={currentCategory}
        navigation={navigation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
});