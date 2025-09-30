/**
 * Custom hook for audio recording using Expo AV
 * Handles recording, playback, and audio file management
 */

import { useState, useRef } from 'react';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

interface AudioRecordingState {
  isRecording: boolean;
  isLoading: boolean;
  duration: number;
  uri: string | null;
  error: string | null;
}

interface UseAudioRecordingReturn {
  state: AudioRecordingState;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  playRecording: () => Promise<void>;
  stopPlayback: () => Promise<void>;
  clearRecording: () => void;
  requestPermissions: () => Promise<boolean>;
}

export const useAudioRecording = (): UseAudioRecordingReturn => {
  const [state, setState] = useState<AudioRecordingState>({
    isRecording: false,
    isLoading: false,
    duration: 0,
    uri: null,
    error: null,
  });

  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const durationTimer = useRef<NodeJS.Timeout | null>(null);

  const requestPermissions = async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const { status } = await Audio.requestPermissionsAsync();

      if (status !== 'granted') {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error:
            'يرجى السماح بالوصول إلى الميكروفون لاستخدام ميزة التسجيل الصوتي',
        }));
        return false;
      }

      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });

      setState(prev => ({ ...prev, isLoading: false }));
      return true;
    } catch (error) {
      console.error('Error requesting audio permissions:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'خطأ في طلب إذن الوصول للميكروفون',
      }));
      return false;
    }
  };

  const startRecording = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Request permissions first
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        return;
      }

      // Clear any existing recording
      if (recordingRef.current) {
        await recordingRef.current.unloadAsync();
        recordingRef.current = null;
      }

      // Create new recording
      const { recording } = await Audio.Recording.createAsync({
        android: {
          extension: '.webm',
          outputFormat: Audio.AndroidOutputFormat.WEBM,
          audioEncoder: Audio.AndroidAudioEncoder.OPUS,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 64000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm;codecs=opus',
          bitsPerSecond: 64000,
        },
      });

      recordingRef.current = recording;

      // Start duration timer
      let duration = 0;
      durationTimer.current = setInterval(() => {
        duration += 100;
        setState(prev => ({ ...prev, duration }));
      }, 100);

      setState(prev => ({
        ...prev,
        isRecording: true,
        isLoading: false,
        duration: 0,
      }));

      console.log('[Audio] Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'خطأ في بدء التسجيل. يرجى المحاولة مرة أخرى.',
      }));
    }
  };

  const stopRecording = async (): Promise<Blob | null> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      if (!recordingRef.current) {
        setState(prev => ({ ...prev, isLoading: false }));
        return null;
      }

      // Stop duration timer
      if (durationTimer.current) {
        clearInterval(durationTimer.current);
        durationTimer.current = null;
      }

      // Stop recording
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();

      setState(prev => ({
        ...prev,
        isRecording: false,
        isLoading: false,
        uri,
      }));

      console.log('[Audio] Recording stopped, URI:', uri);

      // Convert to Blob for web/API upload
      if (uri) {
        try {
          if (Platform.OS === 'web') {
            // For web, fetch the blob directly
            const response = await fetch(uri);
            const blob = await response.blob();
            console.log(
              '[Audio] Audio blob created:',
              blob.size,
              'bytes, type:',
              blob.type
            );
            return blob;
          } else {
            // For mobile, read file and create blob
            const response = await fetch(uri);
            const arrayBuffer = await response.arrayBuffer();
            const blob = new Blob([arrayBuffer], {
              type: Platform.OS === 'android' ? 'audio/webm' : 'audio/wav',
            });
            console.log(
              '[Audio] Audio blob created:',
              blob.size,
              'bytes, type:',
              blob.type
            );
            return blob;
          }
        } catch (blobError) {
          console.error('Error creating blob from audio:', blobError);
          setState(prev => ({
            ...prev,
            error: 'خطأ في معالجة الملف الصوتي',
          }));
          return null;
        }
      }

      return null;
    } catch (error) {
      console.error('Error stopping recording:', error);
      setState(prev => ({
        ...prev,
        isRecording: false,
        isLoading: false,
        error: 'خطأ في إيقاف التسجيل',
      }));
      return null;
    }
  };

  const playRecording = async (): Promise<void> => {
    try {
      if (!state.uri) return;

      // Stop any existing playback
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync({ uri: state.uri });
      soundRef.current = sound;

      await sound.playAsync();
      console.log('[Audio] Playback started');
    } catch (error) {
      console.error('Error playing recording:', error);
      setState(prev => ({
        ...prev,
        error: 'خطأ في تشغيل التسجيل',
      }));
    }
  };

  const stopPlayback = async (): Promise<void> => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      console.log('[Audio] Playback stopped');
    } catch (error) {
      console.error('Error stopping playback:', error);
    }
  };

  const clearRecording = (): void => {
    setState(prev => ({
      ...prev,
      uri: null,
      duration: 0,
      error: null,
    }));

    if (durationTimer.current) {
      clearInterval(durationTimer.current);
      durationTimer.current = null;
    }
  };

  return {
    state,
    startRecording,
    stopRecording,
    playRecording,
    stopPlayback,
    clearRecording,
    requestPermissions,
  };
};
