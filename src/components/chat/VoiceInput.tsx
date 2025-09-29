import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LegalCategory } from '../../types';
import { useAudioRecording } from '../../hooks/useAudioRecording';

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
  const [waveformData, setWaveformData] = useState<number[]>([]);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const waveformTimer = useRef<NodeJS.Timeout | null>(null);

  // Use the audio recording hook
  const {
    state: audioState,
    startRecording,
    stopRecording,
    playRecording,
    clearRecording,
    requestPermissions,
  } = useAudioRecording();

  useEffect(() => {
    // Animate modal appearance
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();

    return () => {
      if (waveformTimer.current) {
        clearInterval(waveformTimer.current);
      }
      clearRecording();
    };
  }, []);

  useEffect(() => {
    if (audioState.isRecording) {
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

      // Start waveform visualization timer
      waveformTimer.current = setInterval(() => {
        // Generate mock waveform data for visualization
        setWaveformData(prev => [
          ...prev.slice(-20),
          Math.random() * 100
        ]);
      }, 100);
    } else {
      pulseAnim.stopAnimation();
      waveAnim.stopAnimation();
      if (waveformTimer.current) {
        clearInterval(waveformTimer.current);
        waveformTimer.current = null;
      }
      setWaveformData([]);
    }
  }, [audioState.isRecording]);

  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert(
        'خطأ في التسجيل',
        'لم نتمكن من بدء التسجيل. يرجى التأكد من إعطاء الإذن للوصول إلى الميكروفون.',
        [{ text: 'حسناً', style: 'default' }]
      );
    }
  };

  const handleStopRecording = async () => {
    try {
      const audioBlob = await stopRecording();

      if (audioBlob && audioBlob.size > 0) {
        console.log('[VoiceInput] Audio recorded successfully:', audioBlob.size, 'bytes');
        onVoiceMessage(audioBlob);
        handleClose();
      } else {
        Alert.alert(
          'خطأ في التسجيل',
          'لم نتمكن من حفظ التسجيل الصوتي. يرجى المحاولة مرة أخرى.',
          [{ text: 'حسناً', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert(
        'خطأ في التسجيل',
        'حدث خطأ أثناء إيقاف التسجيل. يرجى المحاولة مرة أخرى.',
        [{ text: 'حسناً', style: 'default' }]
      );
    }
  };

  const handleCancelRecording = () => {
    clearRecording();
    setWaveformData([]);
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

  const formatDuration = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
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
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
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
              {audioState.isRecording ? (
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
                    {formatDuration(audioState.duration)}
                  </Text>
                </>
              ) : audioState.isLoading ? (
                <>
                  <View style={styles.micContainer}>
                    <Ionicons name="hourglass-outline" size={40} color="#FFFFFF" />
                  </View>
                  <Text style={styles.instructionText}>
                    جاري التحضير...
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

              {/* Show error if any */}
              {audioState.error && (
                <Text style={styles.errorText}>
                  {audioState.error}
                </Text>
              )}
            </View>

            {/* Waveform Visualization */}
            {audioState.isRecording && renderWaveform()}

            {/* Controls */}
            <View style={styles.controlsContainer}>
              {!audioState.isRecording ? (
                <TouchableOpacity
                  style={[styles.recordButton, audioState.isLoading && styles.disabledButton]}
                  onPress={handleStartRecording}
                  disabled={audioState.isLoading}
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
                    disabled={audioState.isLoading}
                  >
                    <Ionicons name="stop" size={24} color="#FFFFFF" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancelRecording}
                    disabled={audioState.isLoading}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Tips */}
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>نصائح للحصول على أفضل النتائج:</Text>
              <Text style={styles.tipText}>• تحدث بوضوح وببطء</Text>
              <Text style={styles.tipText}>• استخدم اللهجة التونسية الطبيعية</Text>
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
  errorText: {
    fontSize: 12,
    color: '#FFB3B3',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
});