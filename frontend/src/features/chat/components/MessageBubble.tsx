import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ChatMessage } from '../../types';

const { width: screenWidth } = Dimensions.get('window');

interface MessageBubbleProps {
  message: ChatMessage;
  onBookmark: (messageId: string) => void;
  onShare: (messageId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onBookmark,
  onShare,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLongPress = () => {
    setShowActions(!showActions);
  };

  const formatTime = (timestamp: Date): string => {
    return new Date(timestamp).toLocaleTimeString('ar-TN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderUserMessage = () => (
    <Animated.View 
      style={[
        styles.messageContainer,
        styles.userMessageContainer,
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      <TouchableOpacity
        onLongPress={handleLongPress}
        style={styles.userMessage}
      >
        <LinearGradient
          colors={['#E31E24', '#C41E3A']}
          style={styles.userMessageGradient}
        >
          <Text style={styles.userMessageText}>{message.content}</Text>
          <Text style={styles.messageTime}>{formatTime(message.timestamp)}</Text>
        </LinearGradient>
      </TouchableOpacity>
      
      {showActions && (
        <View style={styles.messageActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onBookmark(message.id)}
          >
            <Ionicons name="bookmark-outline" size={16} color="#666666" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onShare(message.id)}
          >
            <Ionicons name="share-outline" size={16} color="#666666" />
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );

  const renderAIMessage = () => (
    <Animated.View 
      style={[
        styles.messageContainer,
        styles.aiMessageContainer,
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      <View style={styles.aiMessage}>
        <View style={styles.aiAvatar}>
          <Text style={styles.aiAvatarText}>⚖️</Text>
        </View>
        
        <TouchableOpacity
          onLongPress={handleLongPress}
          style={styles.aiMessageContent}
        >
          <Text style={styles.aiMessageText}>{message.content}</Text>
          
          {/* Legal References */}
          {message.metadata.legalReferences && message.metadata.legalReferences.length > 0 && (
            <View style={styles.referencesContainer}>
              <Text style={styles.referencesTitle}>المراجع القانونية:</Text>
              {message.metadata.legalReferences.slice(0, 2).map((ref, index) => (
                <View key={index} style={styles.referenceItem}>
                  <Ionicons name="document-text-outline" size={12} color="#666666" />
                  <Text style={styles.referenceText}>{ref.titleAr}</Text>
                </View>
              ))}
            </View>
          )}
          
          {/* Suggested Actions */}
          {message.metadata.suggestedActions && message.metadata.suggestedActions.length > 0 && (
            <View style={styles.actionsContainer}>
              {message.metadata.suggestedActions.slice(0, 2).map((action, index) => (
                <TouchableOpacity key={index} style={styles.suggestedAction}>
                  <Text style={styles.actionText}>{action.titleAr}</Text>
                  <Ionicons name="chevron-forward" size={12} color="#E31E24" />
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          <View style={styles.messageFooter}>
            <Text style={styles.messageTime}>{formatTime(message.timestamp)}</Text>
            {message.metadata.confidence && (
              <View style={styles.confidenceIndicator}>
                <Ionicons 
                  name="checkmark-circle" 
                  size={12} 
                  color={message.metadata.confidence > 0.8 ? "#4CAF50" : "#FF9800"} 
                />
                <Text style={styles.confidenceText}>
                  {Math.round(message.metadata.confidence * 100)}%
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
      
      {showActions && (
        <View style={styles.messageActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onBookmark(message.id)}
          >
            <Ionicons name="bookmark-outline" size={16} color="#666666" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onShare(message.id)}
          >
            <Ionicons name="share-outline" size={16} color="#666666" />
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );

  const renderSystemMessage = () => (
    <Animated.View 
      style={[
        styles.messageContainer,
        styles.systemMessageContainer,
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      <View style={styles.systemMessage}>
        <Ionicons name="information-circle-outline" size={16} color="#666666" />
        <Text style={styles.systemMessageText}>{message.content}</Text>
      </View>
    </Animated.View>
  );

  switch (message.type) {
    case 'user':
      return renderUserMessage();
    case 'ai':
      return renderAIMessage();
    case 'system':
      return renderSystemMessage();
    default:
      return null;
  }
};

const styles = StyleSheet.create({
  messageContainer: {
    marginBottom: 16,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
  },
  systemMessageContainer: {
    alignItems: 'center',
  },
  userMessage: {
    maxWidth: screenWidth * 0.8,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    overflow: 'hidden',
  },
  userMessageGradient: {
    padding: 12,
  },
  userMessageText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    textAlign: 'right',
  },
  aiMessage: {
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
  aiMessageContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    flex: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  aiMessageText: {
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 20,
    textAlign: 'right',
  },
  referencesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  referencesTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 6,
    textAlign: 'right',
  },
  referenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  referenceText: {
    fontSize: 11,
    color: '#666666',
    marginLeft: 4,
    flex: 1,
    textAlign: 'right',
  },
  actionsContainer: {
    marginTop: 12,
    gap: 6,
  },
  suggestedAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  actionText: {
    fontSize: 12,
    color: '#E31E24',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  messageTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  confidenceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  confidenceText: {
    fontSize: 10,
    color: '#666666',
  },
  systemMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    maxWidth: screenWidth * 0.7,
  },
  systemMessageText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 6,
    textAlign: 'center',
  },
  messageActions: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 8,
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});