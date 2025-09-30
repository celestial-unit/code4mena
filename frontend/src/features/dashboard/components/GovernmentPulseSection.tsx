import React, { useState, useEffect } from 'react';
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
  FadeInLeft,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

interface GovernmentPulseSectionProps {
  onMinistryPress: (ministryId: string) => void;
  onViewAllPress: () => void;
}

interface MinistryUpdate {
  id: string;
  ministryId: string;
  ministryName: string;
  ministryNameAr: string;
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin';
  content: string;
  contentAr: string;
  legalSignificance: 'high' | 'medium' | 'low';
  detectedTopics: string[];
  timestamp: string;
  isLive?: boolean;
}

interface MinistryCardProps {
  ministry: MinistryUpdate;
  onPress: () => void;
  index: number;
}

const MinistryCard: React.FC<MinistryCardProps> = ({
  ministry,
  onPress,
  index,
}) => {
  const scaleValue = useSharedValue(1);
  const pulseValue = useSharedValue(1);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
  }));

  useEffect(() => {
    if (ministry.isLive) {
      pulseValue.value = withRepeat(
        withSequence(
          withSpring(1.1, { duration: 1000 }),
          withSpring(1, { duration: 1000 })
        ),
        -1,
        true
      );
    }
  }, [ministry.isLive]);

  const handlePress = () => {
    scaleValue.value = withSpring(0.95, { duration: 100 }, () => {
      scaleValue.value = withSpring(1, { duration: 100 });
    });
    onPress();
  };

  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case 'high':
        return '#E31E24';
      case 'medium':
        return '#FF8C00';
      case 'low':
        return '#2E8B57';
      default:
        return '#666666';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return 'logo-facebook';
      case 'twitter':
        return 'logo-twitter';
      case 'instagram':
        return 'logo-instagram';
      case 'linkedin':
        return 'logo-linkedin';
      default:
        return 'globe';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    if (diffInMinutes < 1440)
      return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`;
    return date.toLocaleDateString('ar-TN');
  };

  return (
    <Animated.View
      entering={FadeInLeft.delay(index * 150)
        .duration(600)
        .springify()}
      style={[cardStyle, styles.ministryCard]}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.9}
        style={styles.ministryCardContent}
      >
        {/* Live indicator */}
        {ministry.isLive && (
          <Animated.View style={[styles.liveIndicator, pulseStyle]}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>مباشر</Text>
          </Animated.View>
        )}

        {/* Header */}
        <View style={styles.ministryHeader}>
          <View style={styles.ministryInfo}>
            <Text style={styles.ministryName} numberOfLines={1}>
              {ministry.ministryNameAr}
            </Text>
            <View style={styles.platformInfo}>
              <Ionicons
                name={getPlatformIcon(ministry.platform) as any}
                size={14}
                color="#666666"
              />
              <Text style={styles.platformText}>{ministry.platform}</Text>
            </View>
          </View>

          <View
            style={[
              styles.significanceBadge,
              {
                backgroundColor: getSignificanceColor(
                  ministry.legalSignificance
                ),
              },
            ]}
          >
            <View style={styles.significanceDot} />
          </View>
        </View>

        {/* Content */}
        <View style={styles.ministryContent}>
          <Text style={styles.ministryText} numberOfLines={4}>
            {ministry.contentAr}
          </Text>
        </View>

        {/* Topics */}
        <View style={styles.topicsContainer}>
          {ministry.detectedTopics.slice(0, 2).map((topic, topicIndex) => (
            <View key={topicIndex} style={styles.topicTag}>
              <Text style={styles.topicText}>{topic}</Text>
            </View>
          ))}
          {ministry.detectedTopics.length > 2 && (
            <Text style={styles.moreTopicsText}>
              +{ministry.detectedTopics.length - 2}
            </Text>
          )}
        </View>

        {/* Footer */}
        <View style={styles.ministryFooter}>
          <Text style={styles.timestamp}>{formatTime(ministry.timestamp)}</Text>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chevron-forward" size={16} color="#E31E24" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const GovernmentPulseSection: React.FC<GovernmentPulseSectionProps> = ({
  onMinistryPress,
  onViewAllPress,
}) => {
  const [ministryUpdates, setMinistryUpdates] = useState<MinistryUpdate[]>([]);

  // Mock data for government pulse
  useEffect(() => {
    const mockUpdates: MinistryUpdate[] = [
      {
        id: 'gov-001',
        ministryId: 'ministry-finance',
        ministryName: 'Ministry of Finance',
        ministryNameAr: 'وزارة المالية',
        platform: 'facebook',
        content:
          'New digital tax regulations announced for e-commerce businesses',
        contentAr: 'إعلان لوائح ضريبية رقمية جديدة للشركات التجارة الإلكترونية',
        legalSignificance: 'high',
        detectedTopics: [
          'الضرائب الرقمية',
          'التجارة الإلكترونية',
          'اللوائح الجديدة',
        ],
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        isLive: true,
      },
      {
        id: 'gov-002',
        ministryId: 'ministry-agriculture',
        ministryName: 'Ministry of Agriculture',
        ministryNameAr: 'وزارة الفلاحة',
        platform: 'twitter',
        content:
          'Agricultural land reform act implementation guidelines released',
        contentAr: 'إصدار إرشادات تنفيذ قانون إصلاح الأراضي الزراعية',
        legalSignificance: 'high',
        detectedTopics: ['إصلاح الأراضي', 'الزراعة', 'الإرشادات'],
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      },
      {
        id: 'gov-003',
        ministryId: 'ministry-tourism',
        ministryName: 'Ministry of Tourism',
        ministryNameAr: 'وزارة السياحة',
        platform: 'instagram',
        content: 'Tourism recovery incentives package details announced',
        contentAr: 'الإعلان عن تفاصيل حزمة حوافز انتعاش السياحة',
        legalSignificance: 'medium',
        detectedTopics: ['السياحة', 'الحوافز', 'الانتعاش'],
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      },
      {
        id: 'gov-004',
        ministryId: 'ministry-social-affairs',
        ministryName: 'Ministry of Social Affairs',
        ministryNameAr: 'وزارة الشؤون الاجتماعية',
        platform: 'linkedin',
        content: 'Remote work regulations in labor code amendments',
        contentAr: 'لوائح العمل عن بُعد في تعديلات قانون العمل',
        legalSignificance: 'high',
        detectedTopics: ['العمل عن بُعد', 'قانون العمل', 'التعديلات'],
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      },
    ];

    setMinistryUpdates(mockUpdates);
  }, []);

  const liveUpdatesCount = ministryUpdates.filter(
    update => update.isLive
  ).length;

  return (
    <View style={styles.container}>
      {/* Section header */}
      <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <View style={styles.titleContainer}>
              <Text style={styles.sectionTitle}>نبض الحكومة</Text>
              {liveUpdatesCount > 0 && (
                <View style={styles.liveBadge}>
                  <View style={styles.liveBadgeDot} />
                  <Text style={styles.liveBadgeText}>
                    {liveUpdatesCount} مباشر
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.sectionSubtitle}>
              آخر تحديثات الوزارات والمؤسسات الحكومية
            </Text>
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

      {/* Ministry updates */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.updatesContainer}
        decelerationRate="fast"
        snapToInterval={300}
        snapToAlignment="start"
      >
        {ministryUpdates.map((ministry, index) => (
          <MinistryCard
            key={ministry.id}
            ministry={ministry}
            onPress={() => onMinistryPress(ministry.ministryId)}
            index={index}
          />
        ))}

        {/* View all card */}
        <Animated.View
          entering={FadeInLeft.delay(ministryUpdates.length * 150).duration(
            600
          )}
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
              <Ionicons name="pulse" size={48} color="#FFFFFF" />
              <Text style={styles.viewAllCardTitle}>نبض كامل</Text>
              <Text style={styles.viewAllCardSubtitle}>
                تابع جميع التحديثات الحكومية
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginRight: 12,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E31E24',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 4,
  },
  liveBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
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
  ministryCard: {
    width: 300,
    marginRight: 16,
  },
  ministryCardContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    position: 'relative',
    minHeight: 180,
  },
  liveIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E31E24',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  ministryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ministryInfo: {
    flex: 1,
    marginRight: 12,
  },
  ministryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  platformInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  significanceBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  significanceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  ministryContent: {
    flex: 1,
    marginBottom: 12,
  },
  ministryText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  topicsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  topicTag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  topicText: {
    fontSize: 10,
    color: '#666666',
    fontWeight: '500',
  },
  moreTopicsText: {
    fontSize: 10,
    color: '#999999',
    fontWeight: '500',
  },
  ministryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '500',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewAllCard: {
    width: 200,
    marginRight: 16,
  },
  viewAllCardContent: {
    height: 180,
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
