import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  FadeInRight,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

// Types
import { LegalUpdate } from '../../types';

const { width: screenWidth } = Dimensions.get('window');

interface RecentActivityFeedProps {
  updates: LegalUpdate[];
  onUpdatePress: (updateId: string) => void;
  onViewAllPress: () => void;
}

interface UpdateCardProps {
  update: LegalUpdate;
  onPress: () => void;
  index: number;
}

const UpdateCard: React.FC<UpdateCardProps> = ({ update, onPress, index }) => {
  const scaleValue = useSharedValue(1);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  const handlePress = () => {
    scaleValue.value = withSpring(0.98, { duration: 100 }, () => {
      scaleValue.value = withSpring(1, { duration: 100 });
    });
    onPress();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#E31E24';
      case 'medium': return '#FF8C00';
      case 'low': return '#2E8B57';
      default: return '#666666';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return 'alert-circle';
      case 'medium': return 'information-circle';
      case 'low': return 'checkmark-circle';
      default: return 'help-circle';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'business_law': return 'business';
      case 'tax_law': return 'calculator';
      case 'labor_law': return 'people';
      case 'administrative_law': return 'document-text';
      case 'family_law': return 'home';
      case 'environmental_law': return 'leaf';
      default: return 'document';
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'منذ دقائق';
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    if (diffInHours < 48) return 'أمس';
    return dateObj.toLocaleDateString('ar-TN');
  };

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 100).duration(600).springify()}
      style={[cardStyle, styles.updateCard]}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.9}
        style={styles.updateCardContent}
      >
        {/* Priority indicator */}
        <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(update.priority) }]} />
        
        {/* Header */}
        <View style={styles.updateHeader}>
          <View style={styles.updateMeta}>
            <View style={[styles.categoryIcon, { backgroundColor: getPriorityColor(update.priority) + '20' }]}>
              <Ionicons 
                name={getCategoryIcon(update.category) as any} 
                size={16} 
                color={getPriorityColor(update.priority)} 
              />
            </View>
            <Text style={styles.updateSource}>{update.source.nameAr}</Text>
          </View>
          
          <View style={styles.priorityBadge}>
            <Ionicons 
              name={getPriorityIcon(update.priority) as any} 
              size={12} 
              color={getPriorityColor(update.priority)} 
            />
          </View>
        </View>

        {/* Content */}
        <View style={styles.updateContent}>
          <Text style={styles.updateTitle} numberOfLines={2}>
            {update.titleAr}
          </Text>
          <Text style={styles.updateSummary} numberOfLines={3}>
            {update.summaryAr}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.updateFooter}>
          <View style={styles.updateTags}>
            {update.tagsAr.slice(0, 2).map((tag, tagIndex) => (
              <View key={tagIndex} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {update.tagsAr.length > 2 && (
              <Text style={styles.moreTagsText}>+{update.tagsAr.length - 2}</Text>
            )}
          </View>
          
          <Text style={styles.updateDate}>
            {formatDate(update.publishedAt)}
          </Text>
        </View>

        {/* Impact level indicator */}
        {update.impactLevel === 'critical' && (
          <View style={styles.criticalBadge}>
            <Ionicons name="warning" size={12} color="#FFFFFF" />
            <Text style={styles.criticalText}>حرج</Text>
          </View>
        )}

        {/* Bookmark indicator */}
        {update.isBookmarked && (
          <View style={styles.bookmarkIndicator}>
            <Ionicons name="bookmark" size={16} color="#D4AF37" />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  updates,
  onUpdatePress,
  onViewAllPress,
}) => {
  return (
    <View style={styles.container}>
      {/* Section header */}
      <Animated.View 
        entering={FadeInUp.duration(600)}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.sectionTitle}>التحديثات الأخيرة</Text>
            <Text style={styles.sectionSubtitle}>آخر التطورات القانونية المهمة</Text>
          </View>
          
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={onViewAllPress}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>عرض الكل</Text>
            <Ionicons name="chevron-forward" size={16} color="#E31E24" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Updates list */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.updatesContainer}
        decelerationRate="fast"
        snapToInterval={280}
        snapToAlignment="start"
      >
        {updates.map((update, index) => (
          <UpdateCard
            key={update.id}
            update={update}
            onPress={() => onUpdatePress(update.id)}
            index={index}
          />
        ))}
        
        {/* View all card */}
        <Animated.View
          entering={FadeInRight.delay(updates.length * 100).duration(600)}
          style={styles.viewAllCard}
        >
          <TouchableOpacity
            style={styles.viewAllCardContent}
            onPress={onViewAllPress}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#E31E24', '#D4AF37']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.viewAllGradient}
            >
              <Ionicons name="add-circle" size={48} color="#FFFFFF" />
              <Text style={styles.viewAllCardTitle}>عرض المزيد</Text>
              <Text style={styles.viewAllCardSubtitle}>
                اكتشف جميع التحديثات القانونية
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    opacity: 0.8,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFF5F5',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E31E24',
  },
  viewAllText: {
    fontSize: 14,
    color: '#E31E24',
    fontWeight: '600',
    marginRight: 4,
  },
  updatesContainer: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  updateCard: {
    width: 280,
    marginRight: 16,
  },
  updateCardContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    position: 'relative',
    minHeight: 200,
  },
  priorityIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  updateMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  updateSource: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
    flex: 1,
  },
  priorityBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateContent: {
    flex: 1,
    marginBottom: 12,
  },
  updateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    lineHeight: 22,
    marginBottom: 8,
  },
  updateSummary: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  updateFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  updateTags: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  tag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  tagText: {
    fontSize: 10,
    color: '#666666',
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 10,
    color: '#999999',
    fontWeight: '500',
  },
  updateDate: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '500',
  },
  criticalBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E31E24',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  criticalText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  bookmarkIndicator: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  viewAllCard: {
    width: 200,
    marginRight: 16,
  },
  viewAllCardContent: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
  },
  viewAllGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  viewAllCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
  },
  viewAllCardSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 20,
  },
});