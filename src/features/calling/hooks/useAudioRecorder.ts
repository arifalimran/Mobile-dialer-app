import { useCallback, useEffect, useRef, useState } from 'react';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder as useExpoAudioRecorder,
} from 'expo-audio';

import type { AudioMemoMetadata } from '../callingTypes';

const MAX_DURATION_MS = 15000;

export interface UseAudioRecorderResult {
  isRecording: boolean;
  durationMs: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<AudioMemoMetadata | null>;
}

export function useAudioRecorder(): UseAudioRecorderResult {
  const recorder = useExpoAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startPromiseRef = useRef<Promise<void> | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [durationMs, setDurationMs] = useState(0);
  const preparedRef = useRef(false);

  // No native audio calls on mount: permission and audio mode are requested
  // only when the mic button is pressed.
  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<AudioMemoMetadata | null> => {
    if (startPromiseRef.current) {
      await startPromiseRef.current;
    }
    clearTimer();

    if (!preparedRef.current || !recorder.isRecording) {
      setIsRecording(false);
      return null;
    }

    try {
      await recorder.stop();
    } catch {
      setIsRecording(false);
      return null;
    }

    setIsRecording(false);

    const finalDurationMs = durationMs;
    setDurationMs(0);

    const uri = recorder.uri;
    if (!uri) {
      return null;
    }

    return { uri, durationMs: finalDurationMs };
  }, [clearTimer, durationMs, recorder]);

  const startRecording = useCallback(async () => {
    const startPromise = (async () => {
      try {
        const permission = await requestRecordingPermissionsAsync();
        if (!permission.granted) {
          return;
        }

        await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
        await recorder.prepareToRecordAsync();
        preparedRef.current = true;
        recorder.record();
        setDurationMs(0);
        setIsRecording(true);

        const startedAt = Date.now();
        intervalRef.current = setInterval(() => {
          const elapsed = Date.now() - startedAt;
          setDurationMs(elapsed);
          if (elapsed >= MAX_DURATION_MS) {
            stopRecording();
          }
        }, 200);
      } catch (error) {
        console.warn('Audio start failed:', error);
        preparedRef.current = false;
        setIsRecording(false);
      }
    })();

    startPromiseRef.current = startPromise;
    await startPromise;
    startPromiseRef.current = null;
  }, [recorder, stopRecording]);

  useEffect(() => {
    return () => {
      clearTimer();
      if (!preparedRef.current) return;
      try {
        if (recorder.isRecording) {
          void recorder.stop();
        }
      } catch {
        // Recorder was never initialized. Do not unload it on screen change.
      }
    };
  }, [clearTimer, recorder]);

  return { isRecording, durationMs, startRecording, stopRecording };
}
