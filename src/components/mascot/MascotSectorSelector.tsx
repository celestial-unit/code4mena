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
import { useMascot } from '../../contexts/MascotContext';
import { useTheme } from '../../contexts/ThemeContext';
import { MascotSector } from '../../types/mascot';

interface MascotSectorSelectorProps {
  onSectorChange?: (sector: MascotSector) => void;
  horizontal?: boolean;
  showLabels?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

export const MascotSectorSelector: React.FC<MascotSectorSelectorProps> = ({
  onSectorChange,
  horizontal = true,
  showLabels = true,
}) => {
  const { mascotState, updateSector } = useMascot();
  const { theme } = useTheme();

  const sectors = [
    {
      key: MascotSector.GENERAL,
      name: 'عام',
      nameEn: 'General',
      icon: 'home-outline',
      color: theme.colors.primary,
      description: 'المساعدة العامة',
    },
    {
      key: MascotSector.LEGAL,
      name: 'قانوني',
      nameEn: 'Legal',
      icon: 'library-outline',
      color: '#1E3A8A',
      description: 'الاستشارات القانونية',
    },
    {
      key: MascotSector.BUSINESS,
      name: 'أعمال',
      nameEn: 'Business',
      icon: 'briefcase-outline',
      color: '#059669',
      description: 'القانون التجاري',
    },
    {
      key: MascotSector.FAMILY,
      name: 'أسرة',
      nameEn: 'Family',
      icon: 'people-outline',
      color: '#DC2626',
      description: 'قانون الأسرة',
    },
    {
      key: MascotSector.PROPERTY,
      name: 'عقارات',
      nameEn: 'Property',
      icon: 'business-outline',
      color: '#7C3AED',
      description: 'القانون العقاري',
    },
    {
      key: MascotSector.LABOR,
      name: 'عمل',
      nameEn: 'Labor',
      icon: 'construct-outline',
      color: '#EA580C',
      description: 'قانون العمل',
    },
    {
      key: MascotSector.CRIMINAL,
      name: 'جنائي',
      nameEn: 'Criminal',
      icon: 'shield-outline',
      color: '#BE123C',
      description: 'القانون الجنائي',
    },
    {
      key: MascotSector.ADMINISTRATIVE,
      name: 'إداري',
      nameEn: 'Administrative',
      icon: 'document-text-outline',
      color: '#0891B2',
      description: 'القانون الإداري',
    },
  ];

  const handleSectorSelect = (sector: MascotSector) => {
    updateSector(sector);
    onSectorChange?.(sector);
  };

  const renderSectorItem = (sector: (typeof sectors)[0], index: number) => {
    const isSelected = mascotState.currentSector === sector.key;

    return (
      <TouchableOpacity
        key={sector.key}
        style={[
          styles.sectorItem,
          horizontal && styles.sectorItemHorizontal,
          {
            backgroundColor: theme.colors.surface,
            borderColor: isSelected ? sector.color : theme.colors.border,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
        onPress={() => handleSectorSelect(sector.key)}
        activeOpacity={0.7}
      >
        {isSelected && (
          <LinearGradient
            colors={[sector.color + '20', sector.color + '10']}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        )}

        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isSelected
                ? sector.color
                : theme.colors.background,
            },
          ]}
        >
          <Ionicons
            name={sector.icon as any}
            size={24}
            color={isSelected ? '#FFFFFF' : sector.color}
          />
        </View>

        {showLabels && (
          <View style={styles.labelContainer}>
            <Text
              style={[
                styles.sectorName,
                {
                  color: isSelected ? sector.color : theme.colors.text,
                  fontWeight: isSelected ? 'bold' : '600',
                },
              ]}
            >
              {sector.name}
            </Text>
            <Text
              style={[
                styles.sectorNameEn,
                {
                  color: isSelected ? sector.color : theme.colors.textSecondary,
                  fontSize: horizontal ? 11 : 12,
                },
              ]}
            >
              {sector.nameEn}
            </Text>
            {!horizontal && (
              <Text
                style={[
                  styles.sectorDescription,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {sector.description}
              </Text>
            )}
          </View>
        )}

        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Ionicons name="checkmark-circle" size={20} color={sector.color} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (horizontal) {
    return (
      <View style={styles.container}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalContainer}
        >
          {sectors.map((sector, index) => renderSectorItem(sector, index))}
        </ScrollView>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.verticalContainer}
    >
      {sectors.map((sector, index) => renderSectorItem(sector, index))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  horizontalContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  verticalContainer: {
    padding: 16,
  },
  sectorItem: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  sectorItemHorizontal: {
    width: 100,
    marginRight: 12,
    marginBottom: 0,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  labelContainer: {
    flex: 1,
    alignItems: 'center',
  },
  sectorName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  sectorNameEn: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  sectorDescription: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
