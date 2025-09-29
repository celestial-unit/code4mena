import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SearchFilters as SearchFiltersType } from '../../types';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  visible: boolean;
  onClose: () => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  visible,
  onClose,
}) => {
  const [localFilters, setLocalFilters] = useState<SearchFiltersType>(filters);

  const categories = [
    { id: 'business_law', name: 'قانون الأعمال', nameEn: 'Business Law', color: '#E31E24' },
    { id: 'tax_law', name: 'قانون الضرائب', nameEn: 'Tax Law', color: '#D4AF37' },
    { id: 'labor_law', name: 'قانون العمل', nameEn: 'Labor Law', color: '#2E8B57' },
    { id: 'family_law', name: 'قانون الأسرة', nameEn: 'Family Law', color: '#9C27B0' },
    { id: 'administrative_law', name: 'القانون الإداري', nameEn: 'Administrative Law', color: '#FF8C00' },
    { id: 'environmental_law', name: 'قانون البيئة', nameEn: 'Environmental Law', color: '#4CAF50' },
  ];

  const sectors = [
    { id: 'business', name: 'الأعمال', nameEn: 'Business', icon: 'business' },
    { id: 'agriculture', name: 'الزراعة', nameEn: 'Agriculture', icon: 'leaf' },
    { id: 'technology', name: 'التكنولوجيا', nameEn: 'Technology', icon: 'laptop' },
    { id: 'food', name: 'الغذاء', nameEn: 'Food', icon: 'restaurant' },
    { id: 'tourism', name: 'السياحة', nameEn: 'Tourism', icon: 'airplane' },
    { id: 'education', name: 'التعليم', nameEn: 'Education', icon: 'school' },
  ];

  const sources = [
    { id: 'government', name: 'الحكومة', nameEn: 'Government' },
    { id: 'parliamentary', name: 'البرلمان', nameEn: 'Parliament' },
    { id: 'ministry', name: 'الوزارات', nameEn: 'Ministries' },
    { id: 'legal_database', name: 'قاعدة البيانات القانونية', nameEn: 'Legal Database' },
    { id: 'court', name: 'المحاكم', nameEn: 'Courts' },
    { id: 'academic', name: 'الأكاديمية', nameEn: 'Academic' },
  ];

  const contentTypes = [
    { id: 'legal_update', name: 'تحديث قانوني', nameEn: 'Legal Update' },
    { id: 'law', name: 'قانون', nameEn: 'Law' },
    { id: 'regulation', name: 'لائحة', nameEn: 'Regulation' },
    { id: 'decree', name: 'مرسوم', nameEn: 'Decree' },
    { id: 'guide', name: 'دليل', nameEn: 'Guide' },
    { id: 'faq', name: 'أسئلة شائعة', nameEn: 'FAQ' },
  ];

  const datePresets = [
    { id: 'today', name: 'اليوم', nameEn: 'Today' },
    { id: 'week', name: 'هذا الأسبوع', nameEn: 'This Week' },
    { id: 'month', name: 'هذا الشهر', nameEn: 'This Month' },
    { id: 'quarter', name: 'هذا الربع', nameEn: 'This Quarter' },
    { id: 'year', name: 'هذا العام', nameEn: 'This Year' },
  ];

  const sortOptions = [
    { id: 'relevance', name: 'الصلة', nameEn: 'Relevance' },
    { id: 'date', name: 'التاريخ', nameEn: 'Date' },
    { id: 'popularity', name: 'الشعبية', nameEn: 'Popularity' },
    { id: 'title', name: 'العنوان', nameEn: 'Title' },
  ];

  const toggleCategory = (categoryId: string) => {
    const newCategories = localFilters.categories.includes(categoryId as any)
      ? localFilters.categories.filter(c => c !== categoryId)
      : [...localFilters.categories, categoryId as any];
    
    setLocalFilters({ ...localFilters, categories: newCategories });
  };

  const toggleSector = (sectorId: string) => {
    const newSectors = localFilters.sectors.includes(sectorId as any)
      ? localFilters.sectors.filter(s => s !== sectorId)
      : [...localFilters.sectors, sectorId as any];
    
    setLocalFilters({ ...localFilters, sectors: newSectors });
  };

  const toggleSource = (sourceId: string) => {
    const newSources = localFilters.sources.includes(sourceId)
      ? localFilters.sources.filter(s => s !== sourceId)
      : [...localFilters.sources, sourceId];
    
    setLocalFilters({ ...localFilters, sources: newSources });
  };

  const toggleContentType = (typeId: string) => {
    const newTypes = localFilters.contentTypes.includes(typeId as any)
      ? localFilters.contentTypes.filter(t => t !== typeId)
      : [...localFilters.contentTypes, typeId as any];
    
    setLocalFilters({ ...localFilters, contentTypes: newTypes });
  };

  const setDatePreset = (preset: string) => {
    setLocalFilters({
      ...localFilters,
      dateRange: { preset: preset as any }
    });
  };

  const setSortOption = (sortBy: string) => {
    setLocalFilters({ ...localFilters, sortBy: sortBy as any });
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const resetFilters = () => {
    const defaultFilters: SearchFiltersType = {
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
    setLocalFilters(defaultFilters);
  };

  const getActiveFiltersCount = () => {
    return (
      localFilters.categories.length +
      localFilters.sectors.length +
      localFilters.sources.length +
      localFilters.contentTypes.length +
      (localFilters.dateRange.preset ? 1 : 0)
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666666" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>تصفية البحث</Text>
          
          <TouchableOpacity onPress={resetFilters} style={styles.resetButton}>
            <Text style={styles.resetText}>إعادة تعيين</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>التصنيفات القانونية</Text>
            <View style={styles.chipContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.chip,
                    localFilters.categories.includes(category.id as any) && {
                      backgroundColor: category.color,
                    }
                  ]}
                  onPress={() => toggleCategory(category.id)}
                >
                  <Text style={[
                    styles.chipText,
                    localFilters.categories.includes(category.id as any) && styles.chipTextActive
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sectors */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>القطاعات</Text>
            <View style={styles.chipContainer}>
              {sectors.map((sector) => (
                <TouchableOpacity
                  key={sector.id}
                  style={[
                    styles.chip,
                    styles.sectorChip,
                    localFilters.sectors.includes(sector.id as any) && styles.chipActive
                  ]}
                  onPress={() => toggleSector(sector.id)}
                >
                  <Ionicons 
                    name={sector.icon as any} 
                    size={16} 
                    color={localFilters.sectors.includes(sector.id as any) ? '#FFFFFF' : '#666666'} 
                  />
                  <Text style={[
                    styles.chipText,
                    styles.sectorChipText,
                    localFilters.sectors.includes(sector.id as any) && styles.chipTextActive
                  ]}>
                    {sector.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sources */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>المصادر</Text>
            <View style={styles.sourceContainer}>
              {sources.map((source) => (
                <TouchableOpacity
                  key={source.id}
                  style={styles.sourceItem}
                  onPress={() => toggleSource(source.id)}
                >
                  <View style={styles.sourceInfo}>
                    <Text style={styles.sourceName}>{source.name}</Text>
                    <Text style={styles.sourceNameEn}>{source.nameEn}</Text>
                  </View>
                  <Switch
                    value={localFilters.sources.includes(source.id)}
                    onValueChange={() => toggleSource(source.id)}
                    trackColor={{ false: '#E0E0E0', true: '#E31E24' }}
                    thumbColor={localFilters.sources.includes(source.id) ? '#FFFFFF' : '#FFFFFF'}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Content Types */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>نوع المحتوى</Text>
            <View style={styles.chipContainer}>
              {contentTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.chip,
                    localFilters.contentTypes.includes(type.id as any) && styles.chipActive
                  ]}
                  onPress={() => toggleContentType(type.id)}
                >
                  <Text style={[
                    styles.chipText,
                    localFilters.contentTypes.includes(type.id as any) && styles.chipTextActive
                  ]}>
                    {type.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Date Range */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>النطاق الزمني</Text>
            <View style={styles.chipContainer}>
              {datePresets.map((preset) => (
                <TouchableOpacity
                  key={preset.id}
                  style={[
                    styles.chip,
                    localFilters.dateRange.preset === preset.id && styles.chipActive
                  ]}
                  onPress={() => setDatePreset(preset.id)}
                >
                  <Text style={[
                    styles.chipText,
                    localFilters.dateRange.preset === preset.id && styles.chipTextActive
                  ]}>
                    {preset.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sort Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ترتيب النتائج</Text>
            <View style={styles.sortContainer}>
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.sortOption,
                    localFilters.sortBy === option.id && styles.sortOptionActive
                  ]}
                  onPress={() => setSortOption(option.id)}
                >
                  <Text style={[
                    styles.sortOptionText,
                    localFilters.sortBy === option.id && styles.sortOptionTextActive
                  ]}>
                    {option.name}
                  </Text>
                  {localFilters.sortBy === option.id && (
                    <Ionicons name="checkmark" size={20} color="#E31E24" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
            <LinearGradient
              colors={['#E31E24', '#D4AF37']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.applyGradient}
            >
              <Text style={styles.applyButtonText}>
                تطبيق الفلاتر ({getActiveFiltersCount()})
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  resetText: {
    fontSize: 16,
    color: '#E31E24',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sectorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipActive: {
    backgroundColor: '#E31E24',
    borderColor: '#E31E24',
  },
  chipText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  sectorChipText: {
    marginLeft: 0,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  sourceContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  sourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sourceInfo: {
    flex: 1,
  },
  sourceName: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  sourceNameEn: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  sortContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sortOptionActive: {
    backgroundColor: '#FFF5F5',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  sortOptionTextActive: {
    color: '#E31E24',
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  applyButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  applyGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});