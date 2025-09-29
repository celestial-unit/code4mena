import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface AdvancedSearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  onVoicePress?: () => void;
  onAdvancedPress?: () => void;
  placeholder?: string;
  loading?: boolean;
  suggestions?: string[];
  onSuggestionPress?: (suggestion: string) => void;
}

export const AdvancedSearchInput: React.FC<AdvancedSearchInputProps> = ({
  value,
  onChangeText,
  onSubmit,
  onClear,
  onVoicePress,
  onAdvancedPress,
  placeholder = "ابحث عن المواضيع القانونية...",
  loading = false,
  suggestions = [],
  onSuggestionPress,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    setTimeout(() => setShowSuggestions(false), 150);
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleSuggestionPress = (suggestion: string) => {
    onChangeText(suggestion);
    onSuggestionPress?.(suggestion);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E0E0E0', '#E31E24'],
  });

  const shadowOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.2],
  });

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.searchContainer,
          {
            borderColor,
            shadowOpacity,
          }
        ]}
      >
        <View style={styles.searchBar}>
          <TouchableOpacity 
            onPress={onSubmit}
            style={styles.searchButton}
            disabled={loading}
          >
            {loading ? (
              <Animated.View style={styles.loadingSpinner}>
                <Ionicons name="refresh" size={20} color="#E31E24" />
              </Animated.View>
            ) : (
              <Ionicons name="search" size={20} color="#E31E24" />
            )}
          </TouchableOpacity>

          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder={placeholder}
            placeholderTextColor="#999999"
            value={value}
            onChangeText={onChangeText}
            onSubmitEditing={onSubmit}
            onFocus={handleFocus}
            onBlur={handleBlur}
            returnKeyType="search"
            multiline={false}
            textAlign="right"
          />

          <View style={styles.actionButtons}>
            {value.length > 0 && (
              <TouchableOpacity onPress={onClear} style={styles.actionButton}>
                <Ionicons name="close-circle" size={20} color="#999999" />
              </TouchableOpacity>
            )}
            
            {onVoicePress && (
              <TouchableOpacity onPress={onVoicePress} style={styles.actionButton}>
                <Ionicons name="mic" size={20} color="#D4AF37" />
              </TouchableOpacity>
            )}
            
            {onAdvancedPress && (
              <TouchableOpacity 
                onPress={() => setShowAdvanced(true)} 
                style={styles.actionButton}
              >
                <Ionicons name="options" size={20} color="#666666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <View style={styles.suggestionsDropdown}>
            <ScrollView 
              style={styles.suggestionsList}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {suggestions.slice(0, 5).map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => handleSuggestionPress(suggestion)}
                >
                  <Ionicons name="search" size={16} color="#999999" />
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                  <Ionicons name="arrow-up-outline" size={16} color="#CCCCCC" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </Animated.View>

      {/* Advanced Search Modal */}
      <Modal
        visible={showAdvanced}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAdvanced(false)}
      >
        <View style={styles.advancedModal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowAdvanced(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#666666" />
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>البحث المتقدم</Text>
            
            <TouchableOpacity
              onPress={() => {
                setShowAdvanced(false);
                onAdvancedPress?.();
              }}
              style={styles.modalApplyButton}
            >
              <Text style={styles.modalApplyText}>تطبيق</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Search Tips */}
            <View style={styles.tipsSection}>
              <Text style={styles.sectionTitle}>نصائح البحث المتقدم</Text>
              
              <View style={styles.tipCard}>
                <View style={styles.tipHeader}>
                  <Ionicons name="bulb" size={20} color="#D4AF37" />
                  <Text style={styles.tipTitle}>البحث بالعبارات</Text>
                </View>
                <Text style={styles.tipDescription}>
                  استخدم علامات التنصيص للبحث عن عبارة محددة: "قانون الأعمال"
                </Text>
              </View>

              <View style={styles.tipCard}>
                <View style={styles.tipHeader}>
                  <Ionicons name="add-circle" size={20} color="#4CAF50" />
                  <Text style={styles.tipTitle}>البحث المتضمن</Text>
                </View>
                <Text style={styles.tipDescription}>
                  استخدم + لتضمين كلمة: +ضرائب +شركات
                </Text>
              </View>

              <View style={styles.tipCard}>
                <View style={styles.tipHeader}>
                  <Ionicons name="remove-circle" size={20} color="#FF4444" />
                  <Text style={styles.tipTitle}>البحث المستبعد</Text>
                </View>
                <Text style={styles.tipDescription}>
                  استخدم - لاستبعاد كلمة: قانون -جنائي
                </Text>
              </View>

              <View style={styles.tipCard}>
                <View style={styles.tipHeader}>
                  <Ionicons name="git-branch" size={20} color="#9C27B0" />
                  <Text style={styles.tipTitle}>البحث البديل</Text>
                </View>
                <Text style={styles.tipDescription}>
                  استخدم OR للبحث عن بدائل: (عقد OR اتفاقية)
                </Text>
              </View>
            </View>

            {/* Quick Search Templates */}
            <View style={styles.templatesSection}>
              <Text style={styles.sectionTitle}>قوالب البحث السريع</Text>
              
              {[
                { title: 'تسجيل شركة جديدة', query: '"تسجيل شركة" +متطلبات +وثائق' },
                { title: 'قوانين العمل الجديدة', query: '"قانون العمل" +2024 +تعديلات' },
                { title: 'الضرائب على الشركات', query: 'ضرائب +شركات -أفراد' },
                { title: 'حقوق المستهلك', query: '"حماية المستهلك" +حقوق +شكاوى' },
                { title: 'العقود التجارية', query: '"عقد تجاري" OR "اتفاقية تجارية"' },
              ].map((template, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.templateCard}
                  onPress={() => {
                    onChangeText(template.query);
                    setShowAdvanced(false);
                  }}
                >
                  <View style={styles.templateContent}>
                    <Text style={styles.templateTitle}>{template.title}</Text>
                    <Text style={styles.templateQuery}>{template.query}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchButton: {
    marginRight: 12,
  },
  loadingSpinner: {
    transform: [{ rotate: '45deg' }],
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    textAlign: 'right',
    paddingVertical: 0,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionButton: {
    marginLeft: 8,
    padding: 4,
  },
  suggestionsDropdown: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    maxHeight: 200,
  },
  suggestionsList: {
    flex: 1,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F8F8',
  },
  suggestionText: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    marginHorizontal: 12,
  },
  advancedModal: {
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
  modalApplyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  modalApplyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E31E24',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  tipsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  tipCard: {
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
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  tipDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  templatesSection: {
    marginBottom: 24,
  },
  templateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  templateContent: {
    flex: 1,
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  templateQuery: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'monospace',
  },
});