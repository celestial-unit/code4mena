import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface UpdatesScreenProps {
  navigation: any;
}

interface LegalUpdateItem {
  id: string;
  title: string;
  titleAr: string;
  summary: string;
  summaryAr: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  source: string;
  sourceAr: string;
  publishedAt: string;
  timeAgo: string;
  isBookmarked: boolean;
  isRead: boolean;
  tags: string[];
  tagsAr: string[];
}

const mockUpdates: LegalUpdateItem[] = [
  {
    id: '1',
    title: 'New Digital Tax Regulations for E-commerce',
    titleAr: 'لوائح ضريبية رقمية جديدة للتجارة الإلكترونية',
    summary: 'Ministry of Finance announces new digital tax requirements for online businesses',
    summaryAr: 'وزارة المالية تعلن متطلبات ضريبية رقمية جديدة للشركات الإلكترونية',
    category: 'tax_law',
    priority: 'high',
    source: 'Ministry of Finance',
    sourceAr: 'وزارة المالية',
    publishedAt: '2024-01-15T10:30:00Z',
    timeAgo: 'منذ ساعتين',
    isBookmarked: false,
    isRead: false,
    tags: ['digital tax', 'e-commerce'],
    tagsAr: ['الضرائب الرقمية', 'التجارة الإلكترونية'],
  },
  {
    id: '2',
    title: 'Agricultural Land Reform Act Updates',
    titleAr: 'تحديثات قانون إصلاح الأراضي الزراعية',
    summary: 'Parliament approves amendments to agricultural land ownership regulations',
    summaryAr: 'البرلمان يوافق على تعديلات لوائح ملكية الأراضي الزراعية',
    category: 'administrative_law',
    priority: 'high',
    source: 'Tunisian Parliament',
    sourceAr: 'البرلمان التونسي',
    publishedAt: '2024-01-14T16:45:00Z',
    timeAgo: 'أمس',
    isBookmarked: true,
    isRead: true,
    tags: ['agriculture', 'land reform'],
    tagsAr: ['الزراعة', 'إصلاح الأراضي'],
  },
  {
    id: '3',
    title: 'Remote Work Labor Code Amendments',
    titleAr: 'تعديلات قانون العمل للعمل عن بُعد',
    summary: 'New regulations establish rights for remote workers and employers',
    summaryAr: 'لوائح جديدة تحدد حقوق العاملين عن بُعد وأصحاب العمل',
    category: 'labor_law',
    priority: 'medium',
    source: 'Ministry of Social Affairs',
    sourceAr: 'وزارة الشؤون الاجتماعية',
    publishedAt: '2024-01-12T11:15:00Z',
    timeAgo: 'منذ 3 أيام',
    isBookmarked: false,
    isRead: false,
    tags: ['remote work', 'labor rights'],
    tagsAr: ['العمل عن بُعد', 'حقوق العمال'],
  },
  {
    id: '4',
    title: 'Tourism Recovery Incentives Package',
    titleAr: 'حزمة حوافز انتعاش السياحة',
    summary: 'Government launches comprehensive support package for tourism sector',
    summaryAr: 'الحكومة تطلق حزمة دعم شاملة لقطاع السياحة',
    category: 'business_law',
    priority: 'medium',
    source: 'Ministry of Tourism',
    sourceAr: 'وزارة السياحة',
    publishedAt: '2024-01-10T14:20:00Z',
    timeAgo: 'منذ 5 أيام',
    isBookmarked: true,
    isRead: true,
    tags: ['tourism', 'incentives'],
    tagsAr: ['السياحة', 'الحوافز'],
  },
];

export const UpdatesScreen: React.FC<UpdatesScreenProps> = ({ navigation }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#E31E24';
      case 'medium': return '#FF8C00';
      case 'low': return '#2E8B57';
      default: return '#666666';
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

  const filters = [
    { key: 'all', label: 'الكل', count: mockUpdates.length },
    { key: 'unread', label: 'غير مقروءة', count: mockUpdates.filter(u => !u.isRead).length },
    { key: 'high', label: 'عالية الأولوية', count: mockUpdates.filter(u => u.priority === 'high').length },
    { key: 'bookmarked', label: 'محفوظة', count: mockUpdates.filter(u => u.isBookmarked).length },
  ];

  const filteredUpdates = mockUpdates.filter(update => {
    switch (selectedFilter) {
      case 'unread': return !update.isRead;
      case 'high': return update.priority === 'high';
      case 'bookmarked': return update.isBookmarked;
      default: return true;
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Text style={styles.titleText}>التحديثات القانونية</Text>
          <View style={styles.updatesBadge}>
            <Text style={styles.updatesCount}>{mockUpdates.filter(u => !u.isRead).length}</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#E31E24" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterTabs}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterTab,
                  selectedFilter === filter.key && styles.activeFilterTab
                ]}
                onPress={() => setSelectedFilter(filter.key)}
              >
                <Text style={[
                  styles.filterText,
                  selectedFilter === filter.key && styles.activeFilterText
                ]}>
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

      {/* Updates List */}
      <ScrollView
        style={styles.updatesList}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#E31E24', '#D4AF37']}
            tintColor="#E31E24"
          />
        }
      >
        {filteredUpdates.map((update) => (
          <TouchableOpacity
            key={update.id}
            style={[
              styles.updateItem,
              !update.isRead && styles.unreadUpdate
            ]}
            onPress={() => navigation.navigate('LegalUpdateDetail', { updateId: update.id })}
          >
            {/* Priority and Read Status Indicators */}
            <View style={[
              styles.priorityIndicator,
              { backgroundColor: getPriorityColor(update.priority) }
            ]} />
            
            {!update.isRead && <View style={styles.unreadDot} />}

            {/* Header */}
            <View style={styles.updateHeader}>
              <View style={styles.updateMeta}>
                <View style={[
                  styles.categoryIcon,
                  { backgroundColor: getPriorityColor(update.priority) + '15' }
                ]}>
                  <Ionicons
                    name={getCategoryIcon(update.category) as any}
                    size={16}
                    color={getPriorityColor(update.priority)}
                  />
                </View>
                <View style={styles.sourceInfo}>
                  <Text style={styles.updateSource}>{update.sourceAr}</Text>
                  <Text style={styles.updateTime}>{update.timeAgo}</Text>
                </View>
              </View>

              <View style={styles.updateActions}>
                <TouchableOpacity
                  style={styles.bookmarkButton}
                  onPress={() => {
                    // Toggle bookmark
                    update.isBookmarked = !update.isBookmarked;
                  }}
                >
                  <Ionicons
                    name={update.isBookmarked ? 'bookmark' : 'bookmark-outline'}
                    size={20}
                    color={update.isBookmarked ? '#D4AF37' : '#999999'}
                  />
                </TouchableOpacity>
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

            {/* Tags */}
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

            {/* Priority Badge for High Priority */}
            {update.priority === 'high' && (
              <View style={styles.highPriorityBadge}>
                <Ionicons name="alert-circle" size={12} color="#FFFFFF" />
                <Text style={styles.highPriorityText}>عاجل</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Empty State */}
        {filteredUpdates.length === 0 && (
          <View style={styles.emptyState}>
            <LinearGradient
              colors={['#E31E24', '#D4AF37']}
              style={styles.emptyIcon}
            >
              <Ionicons name="newspaper" size={48} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.emptyTitle}>لا توجد تحديثات</Text>
            <Text style={styles.emptyMessage}>
              لا توجد تحديثات تطابق الفلتر المحدد
            </Text>
          </View>
        )}

        {/* Bottom spacing for tab bar */}
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
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  updatesBadge: {
    marginLeft: 8,
    backgroundColor: '#E31E24',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  updatesCount: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
    backgroundColor: '#F5F5F5',
    marginRight: 12,
  },
  activeFilterTab: {
    backgroundColor: '#E31E24',
  },
  filterText: {
    fontSize: 14,
    color: '#666666',
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
  updatesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  updateItem: {
    backgroundColor: '#FFFFFF',
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
  unreadUpdate: {
    borderLeftWidth: 4,
    borderLeftColor: '#E31E24',
  },
  priorityIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 4,
    height: '100%',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  unreadDot: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E31E24',
  },
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    marginLeft: 16, // Account for unread dot
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
    marginRight: 12,
  },
  sourceInfo: {
    flex: 1,
  },
  updateSource: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  updateTime: {
    fontSize: 11,
    color: '#999999',
    marginTop: 2,
  },
  updateActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookmarkButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateContent: {
    marginLeft: 16, // Account for unread dot
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
  updateTags: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16, // Account for unread dot
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
  highPriorityBadge: {
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
  highPriorityText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 4,
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
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 100,
  },
});