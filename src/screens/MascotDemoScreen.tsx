import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useMascotInteractions } from '../hooks/useMascotInteractions';
import {
  TunisianMascot3D,
  MascotCustomization,
  MascotSectorSelector,
  MascotAchievementCelebration,
} from '../components/mascot';
import { Enhanced3DMascot } from '../components/mascot/Enhanced3DMascot';
import { MascotSector, MascotEmotion } from '../types/mascot';

interface MascotDemoScreenProps {
  navigation: any;
}

export const MascotDemoScreen: React.FC<MascotDemoScreenProps> = ({
  navigation,
}) => {
  const { theme } = useTheme();
  const {
    currentSector,
    currentEmotion,
    isAnimating,
    greetUser,
    celebrateAchievement,
    showThinking,
    showExcitement,
    showConcern,
    showHappiness,
    switchToSector,
    explainConcept,
    reactToUserAction,
    celebrateTunisianEvent,
  } = useMascotInteractions();

  const [showCustomization, setShowCustomization] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);

  const demoAchievement = {
    id: 'first_legal_query',
    title: 'أول استشارة قانونية',
    titleEn: 'First Legal Consultation',
    description: 'لقد قمت بأول استشارة قانونية بنجاح!',
    descriptionEn:
      'You have successfully completed your first legal consultation!',
    icon: 'trophy',
    rarity: 'rare' as const,
    culturalSignificance: 'خطوة مهمة في رحلتك القانونية التونسية',
  };

  const emotionButtons = [
    {
      emotion: 'greeting',
      label: 'ترحيب',
      icon: 'hand-left-outline',
      action: greetUser,
    },
    {
      emotion: 'thinking',
      label: 'تفكير',
      icon: 'bulb-outline',
      action: showThinking,
    },
    {
      emotion: 'happy',
      label: 'سعادة',
      icon: 'happy-outline',
      action: showHappiness,
    },
    {
      emotion: 'excited',
      label: 'حماس',
      icon: 'flash-outline',
      action: showExcitement,
    },
    {
      emotion: 'concerned',
      label: 'قلق',
      icon: 'alert-circle-outline',
      action: showConcern,
    },
    {
      emotion: 'explaining',
      label: 'شرح',
      icon: 'chatbubble-outline',
      action: explainConcept,
    },
  ];

  const actionButtons = [
    {
      action: 'success',
      label: 'نجاح',
      icon: 'checkmark-circle',
      color: theme.colors.success,
    },
    {
      action: 'error',
      label: 'خطأ',
      icon: 'close-circle',
      color: theme.colors.error,
    },
    {
      action: 'help',
      label: 'مساعدة',
      icon: 'help-circle',
      color: theme.colors.info,
    },
    {
      action: 'search',
      label: 'بحث',
      icon: 'search',
      color: theme.colors.accent,
    },
    {
      action: 'chat',
      label: 'محادثة',
      icon: 'chatbubble',
      color: theme.colors.primary,
    },
  ];

  const culturalEvents = [
    { event: 'independence', label: 'الاستقلال', icon: 'flag' },
    { event: 'revolution', label: 'الثورة', icon: 'flower' },
    { event: 'ramadan', label: 'رمضان', icon: 'moon' },
    { event: 'eid', label: 'العيد', icon: 'star' },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          عرض الشخصية التونسية
        </Text>

        <TouchableOpacity
          style={styles.customizeButton}
          onPress={() => setShowCustomization(true)}
        >
          <Ionicons
            name="color-palette"
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Mascot Display */}
        <View
          style={[
            styles.mascotSection,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            الشخصية التونسية ثلاثية الأبعاد
          </Text>
          <Text
            style={[
              styles.sectionSubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            3D Tunisian Mascot
          </Text>

          <View style={styles.mascotContainer}>
            <Enhanced3DMascot size={250} interactive={true} />
            <View style={styles.interactionHint}>
              <Ionicons
                name="hand-left"
                size={16}
                color={theme.colors.textSecondary}
              />
              <Text
                style={[styles.hintText, { color: theme.colors.textSecondary }]}
              >
                اسحب للتفاعل مع الشخصية
              </Text>
            </View>
          </View>

          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusItem,
                { backgroundColor: theme.colors.background },
              ]}
            >
              <Text
                style={[
                  styles.statusLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                القطاع الحالي
              </Text>
              <Text style={[styles.statusValue, { color: theme.colors.text }]}>
                {currentSector}
              </Text>
            </View>
            <View
              style={[
                styles.statusItem,
                { backgroundColor: theme.colors.background },
              ]}
            >
              <Text
                style={[
                  styles.statusLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                المشاعر
              </Text>
              <Text style={[styles.statusValue, { color: theme.colors.text }]}>
                {currentEmotion}
              </Text>
            </View>
            <View
              style={[
                styles.statusItem,
                { backgroundColor: theme.colors.background },
              ]}
            >
              <Text
                style={[
                  styles.statusLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                متحرك
              </Text>
              <Text
                style={[
                  styles.statusValue,
                  {
                    color: isAnimating
                      ? theme.colors.success
                      : theme.colors.textSecondary,
                  },
                ]}
              >
                {isAnimating ? 'نعم' : 'لا'}
              </Text>
            </View>
          </View>
        </View>

        {/* Sector Selector */}
        <View
          style={[styles.section, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            اختيار القطاع القانوني
          </Text>
          <Text
            style={[
              styles.sectionSubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            Legal Sector Selection
          </Text>

          <MascotSectorSelector
            onSectorChange={sector => {
              console.log('Sector changed to:', sector);
            }}
            horizontal={false}
            showLabels={true}
          />
        </View>

        {/* Emotion Controls */}
        <View
          style={[styles.section, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            التحكم في المشاعر
          </Text>
          <Text
            style={[
              styles.sectionSubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            Emotion Controls
          </Text>

          <View style={styles.buttonGrid}>
            {emotionButtons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.emotionButton,
                  { backgroundColor: theme.colors.background },
                ]}
                onPress={button.action}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={button.icon as any}
                  size={24}
                  color={theme.colors.primary}
                />
                <Text style={[styles.buttonText, { color: theme.colors.text }]}>
                  {button.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Reactions */}
        <View
          style={[styles.section, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            ردود الفعل التفاعلية
          </Text>
          <Text
            style={[
              styles.sectionSubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            Interactive Reactions
          </Text>

          <View style={styles.buttonGrid}>
            {actionButtons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.actionButton,
                  { backgroundColor: theme.colors.background },
                ]}
                onPress={() => reactToUserAction(button.action as any)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={button.icon as any}
                  size={24}
                  color={button.color}
                />
                <Text style={[styles.buttonText, { color: theme.colors.text }]}>
                  {button.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Cultural Celebrations */}
        <View
          style={[styles.section, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            الاحتفالات الثقافية التونسية
          </Text>
          <Text
            style={[
              styles.sectionSubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            Tunisian Cultural Celebrations
          </Text>

          <View style={styles.buttonGrid}>
            {culturalEvents.map((event, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.culturalButton,
                  { backgroundColor: theme.colors.background },
                ]}
                onPress={() => celebrateTunisianEvent(event.event as any)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={event.icon as any}
                  size={24}
                  color={theme.colors.accent}
                />
                <Text style={[styles.buttonText, { color: theme.colors.text }]}>
                  {event.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Achievement Demo */}
        <View
          style={[styles.section, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            عرض الإنجازات
          </Text>
          <Text
            style={[
              styles.sectionSubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            Achievement Demo
          </Text>

          <TouchableOpacity
            style={styles.achievementButton}
            onPress={() => setShowAchievement(true)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.accent]}
              style={styles.achievementButtonGradient}
            >
              <Ionicons name="trophy" size={24} color="#FFFFFF" />
              <Text style={styles.achievementButtonText}>عرض إنجاز تجريبي</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Customization Modal */}
      <MascotCustomization
        visible={showCustomization}
        onClose={() => setShowCustomization(false)}
      />

      {/* Achievement Celebration Modal */}
      <MascotAchievementCelebration
        achievement={showAchievement ? demoAchievement : null}
        visible={showAchievement}
        onClose={() => setShowAchievement(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(227, 30, 36, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customizeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(227, 30, 36, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  mascotSection: {
    margin: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  section: {
    margin: 16,
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  mascotContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  interactionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 20,
  },
  hintText: {
    fontSize: 12,
    marginLeft: 6,
    fontStyle: 'italic',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  statusItem: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    minWidth: 80,
  },
  statusLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emotionButton: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionButton: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  culturalButton: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  achievementButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  achievementButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  achievementButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
});
