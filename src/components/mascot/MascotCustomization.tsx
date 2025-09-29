import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useMascot } from '../../contexts/MascotContext';
import { useTheme } from '../../contexts/ThemeContext';
import { TunisianMascot3D } from './TunisianMascot3D';
import {
  MascotCulturalVariation,
  MascotCustomization as MascotCustomizationType
} from '../../types/mascot';

interface MascotCustomizationProps {
  visible: boolean;
  onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const MascotCustomization: React.FC<MascotCustomizationProps> = ({
  visible,
  onClose
}) => {
  const { mascotState, updateCustomization } = useMascot();
  const { theme } = useTheme();
  const [selectedTab, setSelectedTab] = useState<'style' | 'clothing' | 'accessories' | 'colors'>('style');

  const culturalVariations = [
    {
      key: MascotCulturalVariation.TRADITIONAL,
      name: 'تقليدي',
      nameEn: 'Traditional',
      description: 'النمط التونسي التقليدي الأصيل',
      descriptionEn: 'Authentic traditional Tunisian style',
      icon: 'library-outline'
    },
    {
      key: MascotCulturalVariation.MODERN,
      name: 'عصري',
      nameEn: 'Modern',
      description: 'النمط العصري المعاصر',
      descriptionEn: 'Contemporary modern style',
      icon: 'phone-portrait-outline'
    },
    {
      key: MascotCulturalVariation.COASTAL,
      name: 'ساحلي',
      nameEn: 'Coastal',
      description: 'نمط المناطق الساحلية',
      descriptionEn: 'Coastal regions style',
      icon: 'water-outline'
    },
    {
      key: MascotCulturalVariation.DESERT,
      name: 'صحراوي',
      nameEn: 'Desert',
      description: 'نمط المناطق الصحراوية',
      descriptionEn: 'Desert regions style',
      icon: 'sunny-outline'
    },
    {
      key: MascotCulturalVariation.URBAN,
      name: 'حضري',
      nameEn: 'Urban',
      description: 'النمط الحضري المدني',
      descriptionEn: 'Urban city style',
      icon: 'business-outline'
    }
  ];

  const clothingStyles = [
    {
      key: 'traditional' as const,
      name: 'جبة تقليدية',
      nameEn: 'Traditional Djellaba',
      description: 'الزي التونسي التقليدي',
      icon: 'shirt-outline'
    },
    {
      key: 'modern' as const,
      name: 'ملابس عصرية',
      nameEn: 'Modern Attire',
      description: 'ملابس عصرية أنيقة',
      icon: 'business-outline'
    },
    {
      key: 'professional' as const,
      name: 'زي مهني',
      nameEn: 'Professional Wear',
      description: 'زي مهني للعمل',
      icon: 'briefcase-outline'
    }
  ];

  const accessories = [
    {
      key: 'olive_branch',
      name: 'غصن زيتون',
      nameEn: 'Olive Branch',
      description: 'رمز السلام التونسي',
      icon: 'leaf-outline'
    },
    {
      key: 'traditional_hat',
      name: 'شاشية',
      nameEn: 'Traditional Hat',
      description: 'الشاشية التونسية التقليدية',
      icon: 'hat-outline'
    },
    {
      key: 'berber_jewelry',
      name: 'حلي أمازيغية',
      nameEn: 'Berber Jewelry',
      description: 'الحلي الأمازيغية التقليدية',
      icon: 'diamond-outline'
    },
    {
      key: 'palm_symbol',
      name: 'رمز النخلة',
      nameEn: 'Palm Symbol',
      description: 'رمز النخلة التونسية',
      icon: 'flower-outline'
    }
  ];

  const colorSchemes = [
    {
      key: 'default' as const,
      name: 'افتراضي',
      nameEn: 'Default',
      colors: [theme.colors.primary, theme.colors.accent]
    },
    {
      key: 'warm' as const,
      name: 'دافئ',
      nameEn: 'Warm',
      colors: ['#FF6B35', '#F7931E']
    },
    {
      key: 'cool' as const,
      name: 'بارد',
      nameEn: 'Cool',
      colors: ['#4ECDC4', '#44A08D']
    },
    {
      key: 'earth' as const,
      name: 'ترابي',
      nameEn: 'Earth',
      colors: ['#8B4513', '#DAA520']
    }
  ];

  const handleCustomizationChange = (updates: Partial<MascotCustomizationType>) => {
    updateCustomization(updates);
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'style':
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              النمط الثقافي / Cultural Style
            </Text>
            {culturalVariations.map((variation) => (
              <TouchableOpacity
                key={variation.key}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: mascotState.customization.culturalVariation === variation.key
                      ? theme.colors.primary
                      : theme.colors.border
                  }
                ]}
                onPress={() => handleCustomizationChange({ culturalVariation: variation.key })}
              >
                <View style={styles.optionHeader}>
                  <Ionicons
                    name={variation.icon as any}
                    size={24}
                    color={mascotState.customization.culturalVariation === variation.key
                      ? theme.colors.primary
                      : theme.colors.textSecondary
                    }
                  />
                  <View style={styles.optionText}>
                    <Text style={[styles.optionName, { color: theme.colors.text }]}>
                      {variation.name}
                    </Text>
                    <Text style={[styles.optionNameEn, { color: theme.colors.textSecondary }]}>
                      {variation.nameEn}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>
                  {variation.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'clothing':
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              نمط الملابس / Clothing Style
            </Text>
            {clothingStyles.map((clothing) => (
              <TouchableOpacity
                key={clothing.key}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: mascotState.customization.clothingStyle === clothing.key
                      ? theme.colors.primary
                      : theme.colors.border
                  }
                ]}
                onPress={() => handleCustomizationChange({ clothingStyle: clothing.key })}
              >
                <View style={styles.optionHeader}>
                  <Ionicons
                    name={clothing.icon as any}
                    size={24}
                    color={mascotState.customization.clothingStyle === clothing.key
                      ? theme.colors.primary
                      : theme.colors.textSecondary
                    }
                  />
                  <View style={styles.optionText}>
                    <Text style={[styles.optionName, { color: theme.colors.text }]}>
                      {clothing.name}
                    </Text>
                    <Text style={[styles.optionNameEn, { color: theme.colors.textSecondary }]}>
                      {clothing.nameEn}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>
                  {clothing.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'accessories':
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              الإكسسوارات / Accessories
            </Text>
            {accessories.map((accessory) => {
              const isSelected = mascotState.customization.accessories.includes(accessory.key);
              return (
                <TouchableOpacity
                  key={accessory.key}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: isSelected ? theme.colors.primary : theme.colors.border
                    }
                  ]}
                  onPress={() => {
                    const currentAccessories = mascotState.customization.accessories;
                    const newAccessories = isSelected
                      ? currentAccessories.filter(acc => acc !== accessory.key)
                      : [...currentAccessories, accessory.key];
                    handleCustomizationChange({ accessories: newAccessories });
                  }}
                >
                  <View style={styles.optionHeader}>
                    <Ionicons
                      name={accessory.icon as any}
                      size={24}
                      color={isSelected ? theme.colors.primary : theme.colors.textSecondary}
                    />
                    <View style={styles.optionText}>
                      <Text style={[styles.optionName, { color: theme.colors.text }]}>
                        {accessory.name}
                      </Text>
                      <Text style={[styles.optionNameEn, { color: theme.colors.textSecondary }]}>
                        {accessory.nameEn}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={theme.colors.primary}
                      />
                    )}
                  </View>
                  <Text style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>
                    {accessory.description}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        );

      case 'colors':
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              نظام الألوان / Color Scheme
            </Text>
            {colorSchemes.map((scheme) => (
              <TouchableOpacity
                key={scheme.key}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: mascotState.customization.colorScheme === scheme.key
                      ? theme.colors.primary
                      : theme.colors.border
                  }
                ]}
                onPress={() => handleCustomizationChange({ colorScheme: scheme.key })}
              >
                <View style={styles.optionHeader}>
                  <LinearGradient
                    colors={scheme.colors as [string, string, ...string[]]}
                    style={styles.colorPreview}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                  <View style={styles.optionText}>
                    <Text style={[styles.optionName, { color: theme.colors.text }]}>
                      {scheme.name}
                    </Text>
                    <Text style={[styles.optionNameEn, { color: theme.colors.textSecondary }]}>
                      {scheme.nameEn}
                    </Text>
                  </View>
                  {mascotState.customization.colorScheme === scheme.key && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={theme.colors.primary}
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            تخصيص الشخصية
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            Mascot Customization
          </Text>
        </View>

        {/* Preview */}
        <View style={[styles.previewSection, { backgroundColor: theme.colors.surface }]}>
          <TunisianMascot3D size={150} showShadow={true} interactive={false} />
        </View>

        {/* Tabs */}
        <View style={[styles.tabBar, { backgroundColor: theme.colors.surface }]}>
          {[
            { key: 'style', name: 'النمط', icon: 'color-palette-outline' },
            { key: 'clothing', name: 'الملابس', icon: 'shirt-outline' },
            { key: 'accessories', name: 'الإكسسوارات', icon: 'diamond-outline' },
            { key: 'colors', name: 'الألوان', icon: 'color-fill-outline' }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                selectedTab === tab.key && { backgroundColor: theme.colors.primary + '20' }
              ]}
              onPress={() => setSelectedTab(tab.key as any)}
            >
              <Ionicons
                name={tab.icon as any}
                size={20}
                color={selectedTab === tab.key ? theme.colors.primary : theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.tabText,
                  {
                    color: selectedTab === tab.key ? theme.colors.primary : theme.colors.textSecondary
                  }
                ]}
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderTabContent()}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    marginTop: 4,
    textAlign: 'center',
  },
  previewSection: {
    paddingVertical: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  optionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionText: {
    flex: 1,
    marginLeft: 12,
  },
  optionName: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionNameEn: {
    fontSize: 14,
    marginTop: 2,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});