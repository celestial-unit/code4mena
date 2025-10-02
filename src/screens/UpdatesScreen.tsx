import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Animated,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, createThemedStyles } from '../contexts/ThemeContext';
import { useTranslation } from '../i18n';
import { VotingSystem, VoteData } from '../components/voting';

interface UpdatesScreenProps {
  navigation: any;
}

interface LegalUpdateItem {
  id: string;
  title: string;
  titleAr: string;
  titleFr: string;
  titleEn: string;
  summary: string;
  summaryAr: string;
  summaryFr: string;
  summaryEn: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  source: string;
  sourceAr: string;
  sourceFr: string;
  sourceEn: string;
  publishedAt: string;
  timeAgo: string;
  isBookmarked: boolean;
  isRead: boolean;
  tags: string[];
  tagsAr: string[];
  tagsFr: string[];
  tagsEn: string[];
  votes: VoteData;
}

const mockUpdates: LegalUpdateItem[] = [
  {
    id: '1',
    title: 'New Digital Tax Regulations for E-commerce',
    titleAr: 'لوائح ضريبية رقمية جديدة للتجارة الإلكترونية',
    titleFr: 'Nouvelles réglementations fiscales numériques pour le e-commerce',
    titleEn: 'New Digital Tax Regulations for E-commerce',
    summary: 'Ministry of Finance announces new digital tax requirements for online businesses',
    summaryAr: 'وزارة المالية تعلن متطلبات ضريبية رقمية جديدة للشركات الإلكترونية',
    summaryFr: 'Le ministère des Finances annonce de nouvelles exigences fiscales numériques pour les entreprises en ligne',
    summaryEn: 'Ministry of Finance announces new digital tax requirements for online businesses',
    category: 'tax_law',
    priority: 'high',
    source: 'Ministry of Finance',
    sourceAr: 'وزارة المالية',
    sourceFr: 'Ministère des Finances',
    sourceEn: 'Ministry of Finance',
    publishedAt: '2024-01-15T10:30:00Z',
    timeAgo: 'منذ ساعتين',
    isBookmarked: false,
    isRead: false,
    tags: ['digital tax', 'e-commerce'],
    tagsAr: ['الضرائب الرقمية', 'التجارة الإلكترونية'],
    tagsFr: ['taxe numérique', 'e-commerce'],
    tagsEn: ['digital tax', 'e-commerce'],
    votes: { upvotes: 24, downvotes: 3, userVote: null },
  },
  {
    id: '2',
    title: 'Agricultural Land Reform Act Updates',
    titleAr: 'تحديثات قانون إصلاح الأراضي الزراعية',
    titleFr: 'Mises à jour de la loi de réforme foncière agricole',
    titleEn: 'Agricultural Land Reform Act Updates',
    summary: 'Parliament approves amendments to agricultural land ownership regulations',
    summaryAr: 'البرلمان يوافق على تعديلات لوائح ملكية الأراضي الزراعية',
    summaryFr: 'Le Parlement approuve les amendements aux réglementations de propriété foncière agricole',
    summaryEn: 'Parliament approves amendments to agricultural land ownership regulations',
    category: 'administrative_law',
    priority: 'high',
    source: 'Tunisian Parliament',
    sourceAr: 'البرلمان التونسي',
    sourceFr: 'Parlement tunisien',
    sourceEn: 'Tunisian Parliament',
    publishedAt: '2024-01-14T16:45:00Z',
    timeAgo: 'أمس',
    isBookmarked: true,
    isRead: true,
    tags: ['agriculture', 'land reform'],
    tagsAr: ['الزراعة', 'إصلاح الأراضي'],
    tagsFr: ['agriculture', 'réforme foncière'],
    tagsEn: ['agriculture', 'land reform'],
    votes: { upvotes: 18, downvotes: 2, userVote: 'up' },
  },
  {
    id: '3',
    title: 'Remote Work Labor Code Amendments',
    titleAr: 'تعديلات قانون العمل للعمل عن بُعد',
    titleFr: 'Amendements du code du travail pour le télétravail',
    titleEn: 'Remote Work Labor Code Amendments',
    summary: 'New regulations establish rights for remote workers and employers',
    summaryAr: 'لوائح جديدة تحدد حقوق العاملين عن بُعد وأصحاب العمل',
    summaryFr: 'De nouvelles réglementations établissent les droits des télétravailleurs et des employeurs',
    summaryEn: 'New regulations establish rights for remote workers and employers',
    category: 'labor_law',
    priority: 'medium',
    source: 'Ministry of Social Affairs',
    sourceAr: 'وزارة الشؤون الاجتماعية',
    sourceFr: 'Ministère des Affaires sociales',
    sourceEn: 'Ministry of Social Affairs',
    publishedAt: '2024-01-12T11:15:00Z',
    timeAgo: 'منذ 3 أيام',
    isBookmarked: false,
    isRead: false,
    tags: ['remote work', 'labor rights'],
    tagsAr: ['العمل عن بُعد', 'حقوق العمال'],
    tagsFr: ['télétravail', 'droits du travail'],
    tagsEn: ['remote work', 'labor rights'],
    votes: { upvotes: 12, downvotes: 1, userVote: null },
  },
  {
    id: '4',
    title: 'Tourism Recovery Incentives Package',
    titleAr: 'حزمة حوافز انتعاش السياحة',
    titleFr: 'Package d\'incitations à la relance touristique',
    titleEn: 'Tourism Recovery Incentives Package',
    summary: 'Government launches comprehensive support package for tourism sector',
    summaryAr: 'الحكومة تطلق حزمة دعم شاملة لقطاع السياحة',
    summaryFr: 'Le gouvernement lance un package de soutien complet pour le secteur touristique',
    summaryEn: 'Government launches comprehensive support package for tourism sector',
    category: 'business_law',
    priority: 'medium',
    source: 'Ministry of Tourism',
    sourceAr: 'وزارة السياحة',
    sourceFr: 'Ministère du Tourisme',
    sourceEn: 'Ministry of Tourism',
    publishedAt: '2024-01-10T14:20:00Z',
    timeAgo: 'منذ 5 أيام',
    isBookmarked: true,
    isRead: true,
    tags: ['tourism', 'incentives'],
    tagsAr: ['السياحة', 'الحوافز'],
    tagsFr: ['tourisme', 'incitations'],
    tagsEn: ['tourism', 'incentives'],
    votes: { upvotes: 31, downvotes: 4, userVote: null },
  },
];

const { width: screenWidth } = Dimensions.get('window');

export const UpdatesScreen: React.FC<UpdatesScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t, language } = useTranslation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [bookmarkedItems, setBookmarkedItems] = useState<Set<string>>(new Set());
  const [updateVotes, setUpdateVotes] = useState<Record<string, VoteData>>({});

  // Create styles early
  const styles = getStyles(theme);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const filterSlideAnim = useRef(new Animated.Value(0)).current;

  // Initialize animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);

    // Animate refresh
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.7,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  const handleLoadMore = () => {
    if (!isLoadingMore) {
      setIsLoadingMore(true);
      // Simulate loading more data
      setTimeout(() => {
        setIsLoadingMore(false);
      }, 1000);
    }
  };

  const toggleBookmark = (updateId: string) => {
    const newBookmarked = new Set(bookmarkedItems);
    if (newBookmarked.has(updateId)) {
      newBookmarked.delete(updateId);
    } else {
      newBookmarked.add(updateId);
    }
    setBookmarkedItems(newBookmarked);

    // Animate bookmark action
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleVote = (itemId: string, voteType: 'up' | 'down', newVotes: VoteData) => {
    setUpdateVotes(prev => ({
      ...prev,
      [itemId]: newVotes,
    }));

    // Here you would typically make an API call to save the vote
    console.log(`Vote submitted for ${itemId}: ${voteType}`, newVotes);
  };

  const getLocalizedText = (update: LegalUpdateItem, field: 'title' | 'summary' | 'source'): string => {
    let result: string;
    switch (language) {
      case 'fr':
        result = (update[`${field}Fr` as keyof LegalUpdateItem] as string) || (update[`${field}Ar` as keyof LegalUpdateItem] as string) || '';
        break;
      case 'en':
        result = (update[`${field}En` as keyof LegalUpdateItem] as string) || (update[`${field}Ar` as keyof LegalUpdateItem] as string) || '';
        break;
      default:
        result = (update[`${field}Ar` as keyof LegalUpdateItem] as string) || (update[field as keyof LegalUpdateItem] as string) || '';
        break;
    }
    return result;
  };

  const getLocalizedTags = (update: LegalUpdateItem): string[] => {
    let result: string[];
    switch (language) {
      case 'fr':
        result = update.tagsFr || update.tagsAr || [];
        break;
      case 'en':
        result = update.tagsEn || update.tagsAr || [];
        break;
      default:
        result = update.tagsAr || update.tags || [];
        break;
    }
    return result;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#E31E24';
      case 'medium': return '#FF8C00';
      case 'low': return '#2E8B57';
      default: return '#666666';
    }
  };

  const getPriorityGradient = (priority: string): [string, string] => {
    switch (priority) {
      case 'high': return ['#E31E24', '#FF4757'];
      case 'medium': return ['#FF8C00', '#FFA726'];
      case 'low': return ['#2E8B57', '#4CAF50'];
      default: return ['#666666', '#888888'];
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'عاجل';
      case 'medium': return 'متوسط';
      case 'low': return 'عادي';
      default: return '';
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

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'business_law': return 'قانون الأعمال';
      case 'tax_law': return 'القانون الضريبي';
      case 'labor_law': return 'قانون العمل';
      case 'administrative_law': return 'القانون الإداري';
      case 'family_law': return 'قانون الأسرة';
      case 'environmental_law': return 'القانون البيئي';
      default: return 'قانوني';
    }
  };

  const getCategoryGradient = (category: string): [string, string] => {
    switch (category) {
      case 'business_law': return ['#1E88E5', '#42A5F5'];
      case 'tax_law': return ['#43A047', '#66BB6A'];
      case 'labor_law': return ['#FB8C00', '#FFB74D'];
      case 'administrative_law': return ['#8E24AA', '#BA68C8'];
      case 'family_law': return ['#D81B60', '#F06292'];
      case 'environmental_law': return ['#00ACC1', '#4DD0E1'];
      default: return ['#757575', '#9E9E9E'];
    }
  };

  const filters = [
    {
      key: 'all',
      label: t('updates.filters.all'),
      icon: 'list',
      count: mockUpdates.length,
      gradient: ['#E31E24', '#D4AF37'] as [string, string]
    },
    {
      key: 'unread',
      label: t('updates.filters.unread'),
      icon: 'mail-unread',
      count: mockUpdates.filter(u => !u.isRead).length,
      gradient: ['#FF6B6B', '#FF8E8E'] as [string, string]
    },
    {
      key: 'high',
      label: t('updates.filters.high'),
      icon: 'alert-circle',
      count: mockUpdates.filter(u => u.priority === 'high').length,
      gradient: ['#E31E24', '#FF4757'] as [string, string]
    },
    {
      key: 'bookmarked',
      label: t('updates.filters.bookmarked'),
      icon: 'bookmark',
      count: mockUpdates.filter(u => u.isBookmarked || bookmarkedItems.has(u.id)).length,
      gradient: ['#D4AF37', '#F1C40F'] as [string, string]
    },
  ];

  const filteredUpdates = mockUpdates.filter(update => {
    switch (selectedFilter) {
      case 'unread': return !update.isRead;
      case 'high': return update.priority === 'high';
      case 'bookmarked': return update.isBookmarked || bookmarkedItems.has(update.id);
      default: return true;
    }
  });

  const handleFilterChange = (filterKey: string) => {
    setSelectedFilter(filterKey);

    // Animate filter change
    Animated.sequence([
      Animated.timing(filterSlideAnim, {
        toValue: -10,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(filterSlideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const renderUpdateItem = ({ item: update, index }: { item: LegalUpdateItem; index: number }) => {
    const isBookmarked = update.isBookmarked || bookmarkedItems.has(update.id);
    const currentVotes = updateVotes[update.id] || update.votes;

    return (
      <Animated.View
        style={[
          styles.updateItem,
          !update.isRead && styles.unreadUpdate,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 50],
                  outputRange: [0, 50],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('LegalUpdateDetail', { updateId: update.id })}
          activeOpacity={0.95}
        >
          {/* Enhanced Priority Indicator */}
          <LinearGradient
            colors={getPriorityGradient(update.priority)}
            style={styles.priorityIndicator}
          />

          {/* Unread Indicator with Pulse Animation */}
          {!update.isRead && (
            <Animated.View style={styles.unreadDot}>
              <View style={styles.unreadPulse} />
            </Animated.View>
          )}

          {/* Enhanced Header */}
          <View style={styles.updateHeader}>
            <View style={styles.updateMeta}>
              {/* Enhanced Category Icon */}
              <LinearGradient
                colors={getCategoryGradient(update.category)}
                style={styles.categoryIcon}
              >
                <Ionicons
                  name={getCategoryIcon(update.category) as any}
                  size={18}
                  color="#FFFFFF"
                />
              </LinearGradient>

              <View style={styles.sourceInfo}>
                <Text style={styles.updateSource}>{getLocalizedText(update, 'source')}</Text>
                <Text style={styles.updateTime}>{update.timeAgo}</Text>

                {/* Enhanced Category Badge */}
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>
                    {t(`updates.categories.${update.category}`)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Enhanced Actions */}
            <View style={styles.updateActions}>
              {/* Enhanced Priority Badge */}
              {update.priority === 'high' && (
                <LinearGradient
                  colors={['#E31E24', '#FF4757']}
                  style={styles.priorityBadge}
                >
                  <Ionicons name="flash" size={10} color="#FFFFFF" />
                  <Text style={styles.priorityBadgeText}>{t('updates.priority.high')}</Text>
                </LinearGradient>
              )}

              {/* Enhanced Bookmark Button */}
              <TouchableOpacity
                style={[
                  styles.bookmarkButton,
                  isBookmarked && styles.bookmarkButtonActive
                ]}
                onPress={() => toggleBookmark(update.id)}
                activeOpacity={0.7}
              >
                <Animated.View
                  style={{
                    transform: [
                      {
                        scale: fadeAnim.interpolate({
                          inputRange: [0.8, 1],
                          outputRange: [1.2, 1],
                          extrapolate: 'clamp',
                        }),
                      },
                    ],
                  }}
                >
                  <Ionicons
                    name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                    size={20}
                    color={isBookmarked ? '#D4AF37' : '#999999'}
                  />
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Enhanced Content */}
          <View style={styles.updateContent}>
            <Text style={styles.updateTitle} numberOfLines={2}>
              {getLocalizedText(update, 'title')}
            </Text>
            <Text style={styles.updateSummary} numberOfLines={3}>
              {getLocalizedText(update, 'summary')}
            </Text>
          </View>

          {/* Enhanced Tags */}
          <View style={styles.updateTags}>
            {getLocalizedTags(update).slice(0, 3).map((tag, tagIndex) => (
              <LinearGradient
                key={tagIndex}
                colors={['#F8F9FA', '#E9ECEF']}
                style={styles.tag}
              >
                <Text style={styles.tagText}>{tag}</Text>
              </LinearGradient>
            ))}
            {getLocalizedTags(update).length > 3 && (
              <View style={styles.moreTagsBadge}>
                <Text style={styles.moreTagsText}>+{getLocalizedTags(update).length - 3}</Text>
              </View>
            )}
          </View>

          {/* Voting System */}
          <View style={styles.votingContainer}>
            <VotingSystem
              itemId={update.id}
              initialVotes={currentVotes}
              onVote={handleVote}
              size="medium"
              showCounts={true}
            />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Enhanced Header */}
      <LinearGradient
        colors={['#FFFFFF', '#F8F9FA']}
        style={styles.header}
      >
        <View style={styles.headerTitle}>
          <Text style={styles.titleText}>{t('updates.title')}</Text>
          <LinearGradient
            colors={['#E31E24', '#FF4757']}
            style={styles.updatesBadge}
          >
            <Text style={styles.updatesCount}>
              {mockUpdates.filter(u => !u.isRead).length}
            </Text>
          </LinearGradient>
        </View>

        <TouchableOpacity style={styles.searchButton} activeOpacity={0.7}>
          <LinearGradient
            colors={['#FFF5F5', '#FFE8E8']}
            style={styles.searchButtonGradient}
          >
            <Ionicons name="search" size={24} color="#E31E24" />
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      {/* Enhanced Filter Tabs */}
      <Animated.View
        style={[
          styles.filterContainer,
          {
            transform: [{ translateY: filterSlideAnim }],
          },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          <View style={styles.filterTabs}>
            {filters.map((filter, index) => {
              const isActive = selectedFilter === filter.key;
              return (
                <TouchableOpacity
                  key={filter.key}
                  style={styles.filterTabContainer}
                  onPress={() => handleFilterChange(filter.key)}
                  activeOpacity={0.8}
                >
                  {isActive ? (
                    <LinearGradient
                      colors={filter.gradient}
                      style={styles.filterTab}
                    >
                      <Ionicons
                        name={filter.icon as any}
                        size={16}
                        color="#FFFFFF"
                        style={styles.filterIcon}
                      />
                      <Text style={styles.activeFilterText}>
                        {filter.label}
                      </Text>
                      {filter.count > 0 && (
                        <View style={styles.activeFilterBadge}>
                          <Text style={styles.activeFilterBadgeText}>
                            {filter.count}
                          </Text>
                        </View>
                      )}
                    </LinearGradient>
                  ) : (
                    <View style={styles.filterTab}>
                      <Ionicons
                        name={filter.icon as any}
                        size={16}
                        color="#666666"
                        style={styles.filterIcon}
                      />
                      <Text style={styles.filterText}>
                        {filter.label}
                      </Text>
                      {filter.count > 0 && (
                        <View style={styles.filterBadge}>
                          <Text style={styles.filterBadgeText}>
                            {filter.count}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </Animated.View>

      {/* Enhanced Updates List */}
      <FlatList
        data={filteredUpdates}
        renderItem={renderUpdateItem}
        keyExtractor={(item) => item.id}
        style={styles.updatesList}
        contentContainerStyle={styles.updatesListContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#E31E24', '#D4AF37']}
            tintColor="#E31E24"
            progressBackgroundColor="#FFFFFF"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={() => (
          <View style={styles.listFooter}>
            {isLoadingMore && (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color="#E31E24" />
                <Text style={styles.loadingMoreText}>{t('common.loading')}</Text>
              </View>
            )}
            <View style={styles.bottomSpacing} />
          </View>
        )}
        ListEmptyComponent={() => (
          <Animated.View
            style={[
              styles.emptyState,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={['#E31E24', '#D4AF37']}
              style={styles.emptyIcon}
            >
              <Ionicons name="newspaper-outline" size={48} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.emptyTitle}>{t('updates.empty.title')}</Text>
            <Text style={styles.emptyMessage}>
              {t('updates.empty.message')}
            </Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefresh}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#E31E24', '#FF4757']}
                style={styles.refreshButtonGradient}
              >
                <Ionicons name="refresh" size={20} color="#FFFFFF" />
                <Text style={styles.refreshButtonText}>{t('updates.empty.refresh')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}
      />
    </SafeAreaView>
  );
};

const getStyles = createThemedStyles((theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.5,
  },
  updatesBadge: {
    marginLeft: 12,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    elevation: 2,
    shadowColor: '#E31E24',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  updatesCount: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#E31E24',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  filterScrollContent: {
    paddingHorizontal: 20,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingVertical: 16,
  },
  filterTabContainer: {
    marginRight: 12,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#F8F9FA',
    minHeight: 44,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterIcon: {
    marginRight: 6,
  },
  filterText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  filterBadge: {
    marginLeft: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  activeFilterBadge: {
    marginLeft: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    color: '#666666',
    fontWeight: '700',
  },
  activeFilterBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  updatesList: {
    flex: 1,
  },
  updatesListContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  updateItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  unreadUpdate: {
    borderLeftWidth: 6,
    borderLeftColor: '#E31E24',
    backgroundColor: '#FFFBFB',
  },
  priorityIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 6,
    height: '100%',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  unreadDot: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E31E24',
    elevation: 2,
    shadowColor: '#E31E24',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  unreadPulse: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E31E24',
    opacity: 0.6,
  },
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    marginLeft: 20, // Account for unread dot
  },
  updateMeta: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sourceInfo: {
    flex: 1,
  },
  updateSource: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '600',
    marginBottom: 2,
  },
  updateTime: {
    fontSize: 11,
    color: '#999999',
    marginBottom: 6,
  },
  categoryBadge: {
    backgroundColor: '#F0F4F8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryBadgeText: {
    fontSize: 10,
    color: '#4A5568',
    fontWeight: '600',
  },
  updateActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#E31E24',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  priorityBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 4,
  },
  bookmarkButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  bookmarkButtonActive: {
    backgroundColor: '#FFF8E1',
    elevation: 2,
    shadowColor: '#D4AF37',
    shadowOpacity: 0.3,
  },
  updateContent: {
    marginLeft: 20, // Account for unread dot
    marginBottom: 16,
  },
  updateTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: 24,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  updateSummary: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  updateTags: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20, // Account for unread dot
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  tagText: {
    fontSize: 11,
    color: '#4A5568',
    fontWeight: '600',
  },
  moreTagsBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  moreTagsText: {
    fontSize: 10,
    color: '#718096',
    fontWeight: '600',
  },
  listFooter: {
    paddingVertical: 20,
  },
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadingMoreText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#E31E24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  refreshButton: {
    borderRadius: 24,
    elevation: 2,
    shadowColor: '#E31E24',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  refreshButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  refreshButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  votingContainer: {
    marginLeft: 20, // Account for unread dot
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  bottomSpacing: {
    height: 100,
  },
}));