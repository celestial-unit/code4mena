import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SavedSearch, SearchFilters } from '../../types';

interface SavedSearchesProps {
  savedSearches: SavedSearch[];
  onExecuteSearch: (savedSearch: SavedSearch) => void;
  onDeleteSearch: (searchId: string) => void;
  onSaveNewSearch?: (name: string, query: string, filters: SearchFilters, alertsEnabled: boolean) => void;
  loading?: boolean;
}

export const SavedSearches: React.FC<SavedSearchesProps> = ({
  savedSearches,
  onExecuteSearch,
  onDeleteSearch,
  onSaveNewSearch,
  loading = false,
}) => {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newSearchName, setNewSearchName] = useState('');
  const [newSearchQuery, setNewSearchQuery] = useState('');
  const [alertsEnabled, setAlertsEnabled] = useState(false);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-TN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getAlertFrequencyText = (frequency: string) => {
    switch (frequency) {
      case 'immediate':
        return 'فوري';
      case 'daily':
        return 'يومي';
      case 'weekly':
        return 'أسبوعي';
      case 'monthly':
        return 'شهري';
      default:
        return 'أسبوعي';
    }
  };

  const handleDeleteSearch = (search: SavedSearch) => {
    Alert.alert(
      'حذف البحث المحفوظ',
      `هل أنت متأكد من حذف "${search.nameAr}"؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => onDeleteSearch(search.id),
        },
      ]
    );
  };

  const handleSaveNewSearch = () => {
    if (!newSearchName.trim() || !newSearchQuery.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال اسم البحث والاستعلام');
      return;
    }

    if (onSaveNewSearch) {
      const defaultFilters: SearchFilters = {
        categories: [],
        sectors: [],
        sources: [],
        dateRange: {},
        priority: [],
        regions: [],
        contentTypes: [],
        languages: ['ar'],
        sortBy: 'relevance',
        sortOrder: 'desc'
      };

      onSaveNewSearch(newSearchName, newSearchQuery, defaultFilters, alertsEnabled);
    }

    setNewSearchName('');
    setNewSearchQuery('');
    setAlertsEnabled(false);
    setShowSaveModal(false);
  };

  const renderSavedSearch = ({ item }: { item: SavedSearch }) => (
    <View style={styles.searchCard}>
      <TouchableOpacity
        style={styles.searchContent}
        onPress={() => onExecuteSearch(item)}
        activeOpacity={0.7}
      >
        {/* Header */}
        <View style={styles.searchHeader}>
          <View style={styles.searchInfo}>
            <Text style={styles.searchName} numberOfLines={1}>
              {item.nameAr}
            </Text>
            <Text style={styles.searchQuery} numberOfLines={2}>
              {item.queryAr || item.query}
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteSearch(item)}
          >
            <Ionicons name="trash-outline" size={18} color="#FF4444" />
          </TouchableOpacity>
        </View>

        {/* Filters Summary */}
        {(item.filters.categories.length > 0 || item.filters.sectors.length > 0) && (
          <View style={styles.filtersContainer}>
            {item.filters.categories.slice(0, 2).map((category, index) => (
              <View key={index} style={styles.filterChip}>
                <Text style={styles.filterChipText}>
                  {category === 'business_law' ? 'قانون الأعمال' :
                   category === 'tax_law' ? 'قانون الضرائب' :
                   category === 'labor_law' ? 'قانون العمل' :
                   category === 'family_law' ? 'قانون الأسرة' :
                   'قانوني'}
                </Text>
              </View>
            ))}
            {item.filters.sectors.slice(0, 2).map((sector, index) => (
              <View key={index} style={[styles.filterChip, styles.sectorChip]}>
                <Text style={styles.filterChipText}>
                  {sector === 'business' ? 'الأعمال' :
                   sector === 'agriculture' ? 'الزراعة' :
                   sector === 'technology' ? 'التكنولوجيا' :
                   sector}
                </Text>
              </View>
            ))}
            {(item.filters.categories.length + item.filters.sectors.length) > 4 && (
              <View style={styles.moreFiltersChip}>
                <Text style={styles.moreFiltersText}>
                  +{(item.filters.categories.length + item.filters.sectors.length) - 4}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.searchFooter}>
          <View style={styles.searchMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="time" size={14} color="#666666" />
              <Text style={styles.metaText}>
                {item.lastExecuted ? formatDate(item.lastExecuted) : 'لم يتم تنفيذه'}
              </Text>
            </View>
            
            <View style={styles.metaItem}>
              <Ionicons name="document-text" size={14} color="#666666" />
              <Text style={styles.metaText}>{item.resultCount} نتيجة</Text>
            </View>
          </View>

          {item.alertsEnabled && (
            <View style={styles.alertBadge}>
              <Ionicons name="notifications" size={12} color="#D4AF37" />
              <Text style={styles.alertText}>
                {getAlertFrequencyText(item.alertFrequency)}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Execute Button */}
      <TouchableOpacity
        style={styles.executeButton}
        onPress={() => onExecuteSearch(item)}
      >
        <LinearGradient
          colors={['#E31E24', '#D4AF37']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.executeGradient}
        >
          <Ionicons name="search" size={16} color="#FFFFFF" />
          <Text style={styles.executeButtonText}>تنفيذ البحث</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name="bookmark-outline" size={48} color="#CCCCCC" />
      </View>
      <Text style={styles.emptyTitle}>لا توجد عمليات بحث محفوظة</Text>
      <Text style={styles.emptySubtitle}>
        احفظ عمليات البحث المهمة للوصول السريع إليها لاحقاً
      </Text>
      
      {onSaveNewSearch && (
        <TouchableOpacity
          style={styles.addFirstButton}
          onPress={() => setShowSaveModal(true)}
        >
          <LinearGradient
            colors={['#E31E24', '#D4AF37']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addFirstGradient}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addFirstButtonText}>إضافة بحث جديد</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderSaveModal = () => (
    <Modal
      visible={showSaveModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowSaveModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={() => setShowSaveModal(false)}
            style={styles.modalCloseButton}
          >
            <Ionicons name="close" size={24} color="#666666" />
          </TouchableOpacity>
          
          <Text style={styles.modalTitle}>حفظ بحث جديد</Text>
          
          <TouchableOpacity
            onPress={handleSaveNewSearch}
            style={styles.modalSaveButton}
          >
            <Text style={styles.modalSaveText}>حفظ</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>اسم البحث</Text>
            <TextInput
              style={styles.textInput}
              value={newSearchName}
              onChangeText={setNewSearchName}
              placeholder="أدخل اسماً وصفياً للبحث"
              placeholderTextColor="#999999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>استعلام البحث</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              value={newSearchQuery}
              onChangeText={setNewSearchQuery}
              placeholder="أدخل كلمات البحث"
              placeholderTextColor="#999999"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.switchGroup}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>تفعيل التنبيهات</Text>
              <Text style={styles.switchDescription}>
                احصل على إشعارات عند توفر نتائج جديدة
              </Text>
            </View>
            <Switch
              value={alertsEnabled}
              onValueChange={setAlertsEnabled}
              trackColor={{ false: '#E0E0E0', true: '#E31E24' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        {[1, 2, 3].map((index) => (
          <View key={index} style={styles.skeletonCard}>
            <View style={styles.skeletonHeader} />
            <View style={styles.skeletonContent} />
            <View style={styles.skeletonFooter} />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {savedSearches.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          <FlatList
            data={savedSearches}
            renderItem={renderSavedSearch}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
          
          {onSaveNewSearch && (
            <TouchableOpacity
              style={styles.fabButton}
              onPress={() => setShowSaveModal(true)}
            >
              <LinearGradient
                colors={['#E31E24', '#D4AF37']}
                style={styles.fabGradient}
              >
                <Ionicons name="add" size={24} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </>
      )}
      
      {renderSaveModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  listContainer: {
    padding: 16,
  },
  searchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  searchContent: {
    padding: 16,
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  searchInfo: {
    flex: 1,
    marginRight: 12,
  },
  searchName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  searchQuery: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#E31E24',
  },
  sectorChip: {
    backgroundColor: '#D4AF37',
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  moreFiltersChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  moreFiltersText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666666',
  },
  searchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#666666',
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FFF9E6',
    gap: 4,
  },
  alertText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D4AF37',
  },
  executeButton: {
    borderRadius: 0,
    overflow: 'hidden',
  },
  executeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  executeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  addFirstButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addFirstGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  addFirstButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fabButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  modalSaveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E31E24',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    textAlign: 'right',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  loadingContainer: {
    padding: 16,
  },
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  skeletonHeader: {
    width: '70%',
    height: 20,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    marginBottom: 8,
  },
  skeletonContent: {
    width: '100%',
    height: 40,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    marginBottom: 12,
  },
  skeletonFooter: {
    width: '50%',
    height: 16,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
  },
});