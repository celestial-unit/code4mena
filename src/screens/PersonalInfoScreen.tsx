import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, createThemedStyles } from '../contexts/ThemeContext';

interface PersonalInfoScreenProps {
  navigation: any;
}

export const PersonalInfoScreen: React.FC<PersonalInfoScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState({
    name: 'أحمد بن سالم',
    nameAr: 'أحمد بن سالم',
    email: 'ahmed.bensalem@email.com',
    phone: '+216 98 123 456',
    occupation: 'رائد أعمال تقني',
    occupationAr: 'رائد أعمال تقني',
    region: 'تونس',
    businessType: 'شركة ناشئة',
    companySize: 'صغيرة (10-49 موظف)',
    experienceLevel: 'متقدم',
  });

  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleEdit = () => {
    setIsEditing(true);
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handleSave = () => {
    // Simulate save with loading animation
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    setIsEditing(false);
    setHasChanges(false);
    
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();

    Alert.alert('تم الحفظ', 'تم حفظ معلوماتك الشخصية بنجاح');
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'إلغاء التغييرات',
        'هل أنت متأكد من إلغاء التغييرات؟',
        [
          { text: 'لا', style: 'cancel' },
          { 
            text: 'نعم', 
            onPress: () => {
              setIsEditing(false);
              setHasChanges(false);
              Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
              }).start();
            }
          },
        ]
      );
    } else {
      setIsEditing(false);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const renderFormField = (
    label: string,
    field: string,
    placeholder: string,
    icon: string,
    multiline = false
  ) => (
    <View style={styles.formField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputContainer}>
        <Ionicons name={icon as any} size={20} color="#666666" style={styles.inputIcon} />
        <TextInput
          style={[styles.textInput, multiline && styles.multilineInput]}
          value={formData[field as keyof typeof formData]}
          onChangeText={(value) => updateField(field, value)}
          placeholder={placeholder}
          placeholderTextColor="#999999"
          editable={isEditing}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
        />
      </View>
    </View>
  );

  const renderPickerField = (
    label: string,
    field: string,
    options: string[],
    icon: string
  ) => (
    <View style={styles.formField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity 
        style={styles.pickerContainer}
        disabled={!isEditing}
        onPress={() => {
          // Show picker modal
          Alert.alert('اختيار', 'سيتم إضافة قائمة الاختيار قريباً');
        }}
      >
        <Ionicons name={icon as any} size={20} color="#666666" style={styles.inputIcon} />
        <Text style={[styles.pickerText, !isEditing && styles.disabledText]}>
          {formData[field as keyof typeof formData]}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#666666" />
      </TouchableOpacity>
    </View>
  );

  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#E31E24', '#D4AF37']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>المعلومات الشخصية</Text>
        
        <Animated.View 
          style={[
            styles.headerActions,
            {
              transform: [{
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                })
              }]
            }
          ]}
        >
          {isEditing ? (
            <>
              <TouchableOpacity style={styles.headerButton} onPress={handleCancel}>
                <Text style={styles.headerButtonText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.headerButton, styles.saveButton]} 
                onPress={handleSave}
              >
                <Text style={[styles.headerButtonText, styles.saveButtonText]}>حفظ</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.headerButton} onPress={handleEdit}>
              <Ionicons name="create" size={20} color="#FFFFFF" />
              <Text style={styles.headerButtonText}>تعديل</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </LinearGradient>

      <Animated.ScrollView 
        style={[styles.content, { opacity: fadeAnim }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Personal Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={24} color="#E31E24" />
            <Text style={styles.sectionTitle}>المعلومات الأساسية</Text>
          </View>
          
          {renderFormField('الاسم الكامل', 'name', 'أدخل اسمك الكامل', 'person-outline')}
          {renderFormField('الاسم بالعربية', 'nameAr', 'أدخل اسمك بالعربية', 'language-outline')}
          {renderFormField('البريد الإلكتروني', 'email', 'example@email.com', 'mail-outline')}
          {renderFormField('رقم الهاتف', 'phone', '+216 XX XXX XXX', 'call-outline')}
        </View>

        {/* Professional Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="briefcase" size={24} color="#D4AF37" />
            <Text style={styles.sectionTitle}>المعلومات المهنية</Text>
          </View>
          
          {renderFormField('المهنة', 'occupation', 'أدخل مهنتك', 'briefcase-outline')}
          {renderFormField('المهنة بالعربية', 'occupationAr', 'أدخل مهنتك بالعربية', 'language-outline')}
          {renderPickerField('نوع النشاط', 'businessType', [], 'business-outline')}
          {renderPickerField('حجم الشركة', 'companySize', [], 'people-outline')}
          {renderPickerField('مستوى الخبرة', 'experienceLevel', [], 'school-outline')}
        </View>

        {/* Location Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={24} color="#4ECDC4" />
            <Text style={styles.sectionTitle}>معلومات الموقع</Text>
          </View>
          
          {renderPickerField('المنطقة', 'region', [], 'location-outline')}
        </View>

        {/* Account Security Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark" size={24} color="#FF6B6B" />
            <Text style={styles.sectionTitle}>أمان الحساب</Text>
          </View>
          
          <TouchableOpacity style={styles.securityOption}>
            <View style={styles.securityLeft}>
              <Ionicons name="key" size={20} color="#FF6B6B" />
              <Text style={styles.securityText}>تغيير كلمة المرور</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666666" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.securityOption}>
            <View style={styles.securityLeft}>
              <Ionicons name="finger-print" size={20} color="#4ECDC4" />
              <Text style={styles.securityText}>المصادقة البيومترية</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666666" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.securityOption}>
            <View style={styles.securityLeft}>
              <Ionicons name="phone-portrait" size={20} color="#9B59B6" />
              <Text style={styles.securityText}>الأجهزة المتصلة</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666666" />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </Animated.ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    gap: 4,
  },
  saveButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  headerButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#E31E24',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  formField: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FAFAFA',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1A1A1A',
    textAlign: 'right',
  },
  multilineInput: {
    paddingVertical: 12,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FAFAFA',
  },
  pickerText: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    textAlign: 'right',
    marginHorizontal: 12,
  },
  disabledText: {
    color: '#666666',
  },
  securityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  securityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  securityText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 50,
  },
}));