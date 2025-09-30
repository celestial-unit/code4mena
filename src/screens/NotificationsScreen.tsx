import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, createThemedStyles } from '../contexts/ThemeContext';

interface NotificationsScreenProps {
  navigation: any;
}

interface NotificationItem {
  id: string;
  type: 'legal_update' | 'achievement' | 'reminder' | 'system';
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  time: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
}

const mockNotifications: NotificationItem[] = [
  {
    id: '1',
    type: 'legal_update',
    title: 'New Digital Tax Regulations',
    titleAr: 'لوائح ضريبية رقمية جديدة',
    message: 'Important updates for e-commerce businesses',
    messageAr: 'تحديثات مهمة للشركات التجارة الإلكترونية',
    time: 'منذ 30 دقيقة',
    isRead: false,
    priority: 'high',
  },
  {
    id: '2',
    type: 'achievement',
    title: 'Achievement Unlocked',
    titleAr: 'إنجاز جديد',
    message: 'You have read 25 legal updates!',
    messageAr: 'لقد قرأت 25 تحديث قانوني!',
    time: 'منذ ساعة',
    isRead: false,
    priority: 'medium',
  },
  {
    id: '3',
    type: 'reminder',
    title: 'Weekly Legal Summary',
    titleAr: 'الملخص القانوني الأسبوعي',
    message: 'Your weekly legal updates summary is ready',
    messageAr: 'ملخص التحديثات القانونية الأسبوعية جاهز',
    time: 'منذ 3 ساعات',
    isRead: true,
    priority: 'low',
  },
  {
    id: '4',
    type: 'system',
    title: 'App Update Available',
    titleAr: 'تحديث التطبيق متاح',
    message: 'New features and improvements available',
    messageAr: 'ميزات جديدة وتحسينات متاحة',
    time: 'أمس',
    isRead: true,
    priority: 'medium',
  },
];

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  navigation,
}) => {
  // Theme context
  const { theme } = useTheme();
  const styles = createThemedStyles(createStyles)(theme);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'legal_update':
        return 'document-text';
      case 'achievement':
        return 'trophy';
      case 'reminder':
        return 'time';
      case 'system':
        return 'settings';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'high') return theme.colors.primary;
    switch (type) {
      case 'legal_update':
        return theme.colors.primary;
      case 'achievement':
        return theme.colors.accent;
      case 'reminder':
        return theme.colors.success;
      case 'system':
        return theme.colors.textSecondary;
      default:
        return theme.colors.textSecondary;
    }
  };

  const unreadCount = mockNotifications.filter(n => !n.isRead).length;

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

        <View style={styles.headerTitle}>
          <Text style={styles.titleText}>الإشعارات</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.markAllButton}>
          <Ionicons name="checkmark-done" size={24} color="#E31E24" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterTabs}>
            {[
              { key: 'all', label: 'الكل', count: mockNotifications.length },
              { key: 'unread', label: 'غير مقروءة', count: unreadCount },
              { key: 'legal', label: 'قانونية', count: 2 },
              { key: 'achievements', label: 'إنجازات', count: 1 },
            ].map((filter, index) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterTab,
                  index === 0 && styles.activeFilterTab,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    index === 0 && styles.activeFilterText,
                  ]}
                >
                  {filter.label}
                </Text>
                {filter.count > 0 && (
                  <View style={styles.filterBadge}>
                    <Text style={styles.filterBadgeText}>{filter.count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Notifications List */}
      <ScrollView style={styles.notificationsList}>
        {mockNotifications.map((notification, index) => (
          <TouchableOpacity
            key={notification.id}
            style={[
              styles.notificationItem,
              !notification.isRead && styles.unreadNotification,
            ]}
          >
            {/* Unread indicator */}
            {!notification.isRead && <View style={styles.unreadIndicator} />}

            {/* Icon */}
            <View
              style={[
                styles.notificationIcon,
                {
                  backgroundColor:
                    getNotificationColor(
                      notification.type,
                      notification.priority
                    ) + '15',
                },
              ]}
            >
              <Ionicons
                name={getNotificationIcon(notification.type) as any}
                size={24}
                color={getNotificationColor(
                  notification.type,
                  notification.priority
                )}
              />
            </View>

            {/* Content */}
            <View style={styles.notificationContent}>
              <View style={styles.notificationHeader}>
                <Text style={styles.notificationTitle}>
                  {notification.titleAr}
                </Text>
                <Text style={styles.notificationTime}>{notification.time}</Text>
              </View>

              <Text style={styles.notificationMessage}>
                {notification.messageAr}
              </Text>

              {/* Priority indicator */}
              {notification.priority === 'high' && (
                <View style={styles.priorityBadge}>
                  <Ionicons name="alert-circle" size={12} color="#E31E24" />
                  <Text style={styles.priorityText}>عاجل</Text>
                </View>
              )}
            </View>

            {/* Action button */}
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chevron-forward" size={20} color="#999999" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        {/* Empty state for when no notifications */}
        {mockNotifications.length === 0 && (
          <View style={styles.emptyState}>
            <LinearGradient
              colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
              style={styles.emptyIcon}
            >
              <Ionicons name="notifications-off" size={48} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.emptyTitle}>لا توجد إشعارات</Text>
            <Text style={styles.emptyMessage}>
              ستظهر إشعاراتك هنا عند وصولها
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = createThemedStyles(theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    titleText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    unreadBadge: {
      marginLeft: 8,
      backgroundColor: theme.colors.primary,
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    unreadText: {
      fontSize: 12,
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
    markAllButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
    },
    filterContainer: {
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    filterTabs: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    filterTab: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.card,
      marginRight: 12,
    },
    activeFilterTab: {
      backgroundColor: theme.colors.primary,
    },
    filterText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    activeFilterText: {
      color: '#FFFFFF',
    },
    filterBadge: {
      marginLeft: 6,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: 8,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    filterBadgeText: {
      fontSize: 10,
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
    notificationsList: {
      flex: 1,
      paddingHorizontal: 16,
    },
    notificationItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginVertical: 6,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      position: 'relative',
    },
    unreadNotification: {
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
    },
    unreadIndicator: {
      position: 'absolute',
      top: 16,
      right: 16,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.primary,
    },
    notificationIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    notificationContent: {
      flex: 1,
    },
    notificationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 4,
    },
    notificationTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
      flex: 1,
      marginRight: 8,
    },
    notificationTime: {
      fontSize: 12,
      color: theme.colors.textTertiary,
    },
    notificationMessage: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
      marginBottom: 8,
    },
    priorityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
    },
    priorityText: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: 'bold',
      marginLeft: 4,
    },
    actionButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.card,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 8,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
    },
    emptyMessage: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  })
);
