import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from '../../i18n';

export interface VoteData {
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
}

interface VotingSystemProps {
  itemId: string;
  initialVotes: VoteData;
  onVote: (itemId: string, voteType: 'up' | 'down', newVotes: VoteData) => void;
  style?: any;
  size?: 'small' | 'medium' | 'large';
  showCounts?: boolean;
  disabled?: boolean;
}

export const VotingSystem: React.FC<VotingSystemProps> = ({
  itemId,
  initialVotes,
  onVote,
  style,
  size = 'medium',
  showCounts = true,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [votes, setVotes] = useState<VoteData>(initialVotes);
  const [isVoting, setIsVoting] = useState(false);

  // Animation values
  const upvoteScale = useRef(new Animated.Value(1)).current;
  const downvoteScale = useRef(new Animated.Value(1)).current;
  const upvoteRotation = useRef(new Animated.Value(0)).current;
  const downvoteRotation = useRef(new Animated.Value(0)).current;

  const handleVote = async (voteType: 'up' | 'down') => {
    if (disabled || isVoting) return;

    setIsVoting(true);

    // Animate the pressed button
    const scaleAnim = voteType === 'up' ? upvoteScale : downvoteScale;
    const rotationAnim = voteType === 'up' ? upvoteRotation : downvoteRotation;

    Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(rotationAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(rotationAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    try {
      let newVotes = { ...votes };

      // Handle vote logic
      if (votes.userVote === voteType) {
        // User is removing their vote
        if (voteType === 'up') {
          newVotes.upvotes = Math.max(0, newVotes.upvotes - 1);
        } else {
          newVotes.downvotes = Math.max(0, newVotes.downvotes - 1);
        }
        newVotes.userVote = null;
      } else {
        // User is changing or adding their vote
        if (votes.userVote) {
          // Remove previous vote
          if (votes.userVote === 'up') {
            newVotes.upvotes = Math.max(0, newVotes.upvotes - 1);
          } else {
            newVotes.downvotes = Math.max(0, newVotes.downvotes - 1);
          }
        }

        // Add new vote
        if (voteType === 'up') {
          newVotes.upvotes += 1;
        } else {
          newVotes.downvotes += 1;
        }
        newVotes.userVote = voteType;
      }

      setVotes(newVotes);
      onVote(itemId, voteType, newVotes);

      // Show feedback
      if (newVotes.userVote) {
        Alert.alert(
          t('updates.voting.thankYou'),
          voteType === 'up' 
            ? t('updates.voting.helpful', { count: newVotes.upvotes })
            : t('updates.voting.notHelpful', { count: newVotes.downvotes }),
          [{ text: t('common.ok') }]
        );
      }
    } catch (error) {
      console.error('Error voting:', error);
      Alert.alert(t('common.error'), 'Failed to submit vote');
    } finally {
      setIsVoting(false);
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          buttonSize: 32,
          iconSize: 16,
          fontSize: 11,
          padding: 6,
        };
      case 'large':
        return {
          buttonSize: 48,
          iconSize: 24,
          fontSize: 14,
          padding: 12,
        };
      default: // medium
        return {
          buttonSize: 40,
          iconSize: 20,
          fontSize: 12,
          padding: 8,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const styles = getStyles(theme, sizeStyles);

  const totalVotes = votes.upvotes + votes.downvotes;
  const upvotePercentage = totalVotes > 0 ? (votes.upvotes / totalVotes) * 100 : 0;

  return (
    <View style={[styles.container, style]}>
      {/* Upvote Button */}
      <Animated.View
        style={{
          transform: [
            { scale: upvoteScale },
            {
              rotate: upvoteRotation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '15deg'],
              }),
            },
          ],
        }}
      >
        <TouchableOpacity
          style={[
            styles.voteButton,
            votes.userVote === 'up' && styles.upvoteActive,
          ]}
          onPress={() => handleVote('up')}
          disabled={disabled || isVoting}
          activeOpacity={0.7}
        >
          {votes.userVote === 'up' ? (
            <LinearGradient
              colors={['#4CAF50', '#66BB6A']}
              style={styles.activeButtonGradient}
            >
              <Ionicons
                name="thumbs-up"
                size={sizeStyles.iconSize}
                color="#FFFFFF"
              />
              {showCounts && (
                <Text style={styles.activeVoteCount}>{votes.upvotes}</Text>
              )}
            </LinearGradient>
          ) : (
            <View style={styles.inactiveButton}>
              <Ionicons
                name="thumbs-up-outline"
                size={sizeStyles.iconSize}
                color="#666666"
              />
              {showCounts && (
                <Text style={styles.inactiveVoteCount}>{votes.upvotes}</Text>
              )}
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Vote Ratio Indicator */}
      {totalVotes > 0 && (
        <View style={styles.ratioContainer}>
          <View style={styles.ratioBar}>
            <LinearGradient
              colors={['#4CAF50', '#66BB6A']}
              style={[styles.ratioFill, { width: `${upvotePercentage}%` }]}
            />
          </View>
          <Text style={styles.ratioText}>
            {Math.round(upvotePercentage)}% {t('updates.voting.helpful', { count: '' }).replace(' ()', '')}
          </Text>
        </View>
      )}

      {/* Downvote Button */}
      <Animated.View
        style={{
          transform: [
            { scale: downvoteScale },
            {
              rotate: downvoteRotation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '-15deg'],
              }),
            },
          ],
        }}
      >
        <TouchableOpacity
          style={[
            styles.voteButton,
            votes.userVote === 'down' && styles.downvoteActive,
          ]}
          onPress={() => handleVote('down')}
          disabled={disabled || isVoting}
          activeOpacity={0.7}
        >
          {votes.userVote === 'down' ? (
            <LinearGradient
              colors={['#F44336', '#EF5350']}
              style={styles.activeButtonGradient}
            >
              <Ionicons
                name="thumbs-down"
                size={sizeStyles.iconSize}
                color="#FFFFFF"
              />
              {showCounts && (
                <Text style={styles.activeVoteCount}>{votes.downvotes}</Text>
              )}
            </LinearGradient>
          ) : (
            <View style={styles.inactiveButton}>
              <Ionicons
                name="thumbs-down-outline"
                size={sizeStyles.iconSize}
                color="#666666"
              />
              {showCounts && (
                <Text style={styles.inactiveVoteCount}>{votes.downvotes}</Text>
              )}
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Total Votes Display */}
      {showCounts && totalVotes > 0 && (
        <View style={styles.totalVotes}>
          <Text style={styles.totalVotesText}>
            {t('updates.voting.votes', { count: totalVotes })}
          </Text>
        </View>
      )}
    </View>
  );
};

const getStyles = (theme: any, sizeStyles: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voteButton: {
    borderRadius: sizeStyles.buttonSize / 2,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activeButtonGradient: {
    width: sizeStyles.buttonSize,
    height: sizeStyles.buttonSize,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  inactiveButton: {
    width: sizeStyles.buttonSize,
    height: sizeStyles.buttonSize,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  upvoteActive: {
    elevation: 4,
    shadowColor: '#4CAF50',
    shadowOpacity: 0.3,
  },
  downvoteActive: {
    elevation: 4,
    shadowColor: '#F44336',
    shadowOpacity: 0.3,
  },
  activeVoteCount: {
    fontSize: sizeStyles.fontSize,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  inactiveVoteCount: {
    fontSize: sizeStyles.fontSize,
    fontWeight: '600',
    color: '#666666',
  },
  ratioContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  ratioBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  ratioFill: {
    height: '100%',
    borderRadius: 2,
  },
  ratioText: {
    fontSize: 10,
    color: '#666666',
    fontWeight: '500',
  },
  totalVotes: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
  },
  totalVotesText: {
    fontSize: 10,
    color: '#666666',
    fontWeight: '600',
  },
});