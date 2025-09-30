import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LegalCategory } from '../../types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface VoiceInputProps {
  onClose: () => void;
  onVoiceMessage: (audioData: Blob) => void;
  category: LegalCategory;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onClose,
  onVoiceMessage,
  category,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Animate modal appearance
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();

    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Start waveform animation
      Animated.loop(
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        })
      ).start();

      // Start recording timer
      recordingTimer.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
        // Generate mock waveform data
        setWaveformData(prev => [...prev.slice(-20), Math.random() * 100]);
      }, 100);
    } else {
      pulseAnim.stopAnimation();
      waveAnim.stopAnimation();
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    }
  }, [isRecording]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingDuration(0);
    setWaveformData([]);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // Simulate audio data
    const mockAudioData = new Blob(['mock audio data'], { type: 'audio/wav' });
    onVoiceMessage(mockAudioData);
    handleClose();
  };

  const handleClose = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryDisplayName = (category: LegalCategory): string => {
    const categoryNames: Record<LegalCategory, string> = {
      business_law: 'قانون الأعمال',
      civil_law: 'القانون المدني',
      administrative_law: 'القانون الإداري',
      labor_law: 'قانون العمل',
      tax_law: 'القانون الضريبي',
      family_law: 'قانون الأسرة',
      criminal_law: 'القانون الجنائي',
      constitutional_law: 'القانون الدستوري',
      commercial_law: 'القانون التجاري',
      environmental_law: 'القانون البيئي',
    };
    return categoryNames[category] || 'استشارة قانونية';
  };

  const renderWaveform = () => (
    <View style={styles.waveformContainer}>
      {waveformData.map((height, index) => (
        <Animated.View
          key={index}
          style={[
            styles.waveformBar,
            {
              height: Math.max(4, height * 0.6),
              opacity: waveAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
              }),
            },
          ]}
        />
      ))}
    </View>
  );

  return (
    <Modal
      visible={true}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['#E31E24', '#D4AF37']}
            style={styles.gradient}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.title}>التسجيل الصوتي</Text>
              <View style={styles.placeholder} />
            </View>

            {/* Category Badge */}
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {getCategoryDisplayName(category)}
              </Text>
            </View>

            {/* Recording Status */}
            <View style={styles.statusContainer}>
              {isRecording ? (
                <>
                  <Animated.View
                    style={[
                      styles.recordingIndicator,
                      { transform: [{ scale: pulseAnim }] },
                    ]}
                  >
                    <Ionicons name="mic" size={40} color="#FFFFFF" />
                  </Animated.View>
                  <Text style={styles.recordingText}>جاري التسجيل...</Text>
                  <Text style={styles.durationText}>
                    {formatDuration(Math.floor(recordingDuration / 10))}
                  </Text>
                </>
              ) : (
                <>
                  <View style={styles.micContainer}>
                    <Ionicons name="mic-outline" size={40} color="#FFFFFF" />
                  </View>
                  <Text style={styles.instructionText}>
                    اضغط للبدء في التسجيل
                  </Text>
                  <Text style={styles.hintText}>
                    تحدث بوضوح باللهجة التونسية
                  </Text>
                </>
              )}
            </View>

            {/* Waveform Visualization */}
            {isRecording && renderWaveform()}

            {/* Controls */}
            <View style={styles.controlsContainer}>
              {!isRecording ? (
                <TouchableOpacity
                  style={styles.recordButton}
                  onPress={handleStartRecording}
                >
                  <LinearGradient
                    colors={['#FFFFFF', '#F0F0F0']}
                    style={styles.recordButtonGradient}
                  >
                    <Ionicons name="mic" size={32} color="#E31E24" />
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <View style={styles.recordingControls}>
                  <TouchableOpacity
                    style={styles.stopButton}
                    onPress={handleStopRecording}
                  >
                    <Ionicons name="stop" size={24} color="#FFFFFF" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setIsRecording(false);
                      setRecordingDuration(0);
                      setWaveformData([]);
                    }}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Tips */}
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>
                نصائح للحصول على أفضل النتائج:
              </Text>
              <Text style={styles.tipText}>• تحدث بوضوح وببطء</Text>
              <Text style={styles.tipText}>
                • استخدم اللهجة التونسية الطبيعية
              </Text>
              <Text style={styles.tipText}>• تجنب الضوضاء في الخلفية</Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: screenWidth * 0.9,
    maxHeight: screenHeight * 0.8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    padding: 24,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 24,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  recordingIndicator: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  micContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  recordingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  durationText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  instructionText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  hintText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    marginBottom: 24,
    gap: 2,
  },
  waveformBar: {
    width: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 1.5,
  },
  controlsContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  recordButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingControls: {
    flexDirection: 'row',
    gap: 20,
  },
  stopButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'right',
  },
  tipText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
    textAlign: 'right',
  },
});
