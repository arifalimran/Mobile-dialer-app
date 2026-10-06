import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated } from 'react-native';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder as useExpoAudioRecorder,
} from 'expo-audio';

import type { AudioMemoMetadata } from '../callingTypes';

const MAX_DURATION_MS = 15000;
const HOLD_THRESHOLD_MS = 600;
const TICK_MS = 250;

function formatCountdown(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `⏱️ ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export interface UseAudioRecorderResult {
  isRecording: boolean;
  countdownLabel: string;
  pulseOpacity: Animated.Value;
  onMicPressIn: () => void;
  onMicPressOut: () => void;
}

/**
 * Press-and-hold or tap-to-toggle voice memo recorder.
 *
 * - No native audio calls happen on mount. Mic permission and the recording
 *   audio mode are requested lazily, only the first time the mic is pressed.
 * - Gesture state (press start time, ignored release, in-flight guard) is
 *   tracked with refs, never React state, because start/stop are async and
 *   a fast tap can fire onPressOut before onPressIn's promise settles.
 * - `onMemoCaptured` is called (instead of returning a promise) whenever a
 *   memo is produced, either from a manual stop or the automatic 15s cutoff,
 *   so both paths share the exact same stop code.
 */
export function useAudioRecorder(
  onMemoCaptured: (memo: AudioMemoMetadata) => void,
): UseAudioRecorderResult {
  const recorder = useExpoAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const [isRecording, setIsRecording] = useState(false);
  const [countdownLabel, setCountdownLabel] = useState(formatCountdown(MAX_DURATION_MS));

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const startPromiseRef = useRef<Promise<void> | null>(null);
  const preparedRef = useRef(false);
  const permissionGrantedRef = useRef(false);

  // Gesture refs (not state) so onPressIn/onPressOut read synchronous,
  // up-to-date values even while an async start/stop call is in flight.
  const isRecordingRef = useRef(false);
  const pressStartRef = useRef<number | null>(null);
  const ignoreReleaseRef = useRef(false);
  const busyRef = useRef(false);
  const pendingReleaseAtRef = useRef<number | null>(null);

  const pulseOpacity = useRef(new Animated.Value(1)).current;
  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  // No native audio calls on mount: permission and audio mode are requested
  // only when the mic button is pressed.
  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const stopPulse = useCallback(() => {
    pulseLoopRef.current?.stop();
    pulseLoopRef.current = null;
    pulseOpacity.setValue(1);
  }, [pulseOpacity]);

  const startPulse = useCallback(() => {
    pulseOpacity.setValue(1);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseOpacity, { toValue: 0.3, duration: 450, useNativeDriver: true }),
        Animated.timing(pulseOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
      ]),
    );
    pulseLoopRef.current = loop;
    loop.start();
  }, [pulseOpacity]);

  const stopRecording = useCallback(async (): Promise<AudioMemoMetadata | null> => {
    if (startPromiseRef.current) {
      await startPromiseRef.current;
    }
    clearTimer();
    stopPulse();

    if (!preparedRef.current || !recorder.isRecording) {
      isRecordingRef.current = false;
      setIsRecording(false);
      return null;
    }

    try {
      await recorder.stop();
    } catch {
      isRecordingRef.current = false;
      setIsRecording(false);
      return null;
    }

    isRecordingRef.current = false;
    setIsRecording(false);

    const elapsedMs = startedAtRef.current ? Date.now() - startedAtRef.current : 0;
    const finalDurationMs = Math.min(MAX_DURATION_MS, elapsedMs);
    startedAtRef.current = null;
    setCountdownLabel(formatCountdown(MAX_DURATION_MS));

    const uri = recorder.uri;
    if (!uri) {
      return null;
    }

    return { uri, durationMs: finalDurationMs };
  }, [clearTimer, stopPulse, recorder]);

  const finishAndCapture = useCallback(async () => {
    const memo = await stopRecording();
    if (memo) {
      onMemoCaptured(memo);
    }
  }, [stopRecording, onMemoCaptured]);

  const startRecording = useCallback(async () => {
    const startPromise = (async () => {
      try {
        if (!permissionGrantedRef.current) {
          const permission = await requestRecordingPermissionsAsync();
          if (!permission.granted) {
            Alert.alert(
              'Microphone permission needed',
              'Enable microphone access in system settings to record a voice debrief.',
            );
            return;
          }
          await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
          permissionGrantedRef.current = true;
        }

        await recorder.prepareToRecordAsync();
        preparedRef.current = true;
        recorder.record();

        startedAtRef.current = Date.now();
        setCountdownLabel(formatCountdown(MAX_DURATION_MS));
        isRecordingRef.current = true;
        setIsRecording(true);
        startPulse();

        intervalRef.current = setInterval(() => {
          const elapsed = Date.now() - (startedAtRef.current ?? Date.now());
          setCountdownLabel(formatCountdown(MAX_DURATION_MS - elapsed));
          if (elapsed >= MAX_DURATION_MS) {
            clearTimer();
            void finishAndCapture();
          }
        }, TICK_MS);
      } catch (error) {
        console.warn('Audio start failed:', error);
        preparedRef.current = false;
        isRecordingRef.current = false;
        setIsRecording(false);
      }
    })();

    startPromiseRef.current = startPromise;
    await startPromise;
    startPromiseRef.current = null;
  }, [recorder, startPulse, clearTimer, finishAndCapture]);

  // Decide, once any in-flight start/stop has settled, whether the release
  // that already happened should end the recording (hold-to-record) or
  // leave it running (tap-to-toggle).
  const maybeStopFromRelease = useCallback(
    (releasedAt: number) => {
      if (ignoreReleaseRef.current) {
        ignoreReleaseRef.current = false;
        return;
      }
      if (!isRecordingRef.current) return;

      const heldMs = pressStartRef.current ? releasedAt - pressStartRef.current : 0;
      pressStartRef.current = null;

      if (heldMs >= HOLD_THRESHOLD_MS) {
        if (busyRef.current) return;
        busyRef.current = true;
        void (async () => {
          try {
            await finishAndCapture();
          } finally {
            busyRef.current = false;
          }
        })();
      }
    },
    [finishAndCapture],
  );

  const onMicPressIn = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    pendingReleaseAtRef.current = null;

    void (async () => {
      try {
        if (isRecordingRef.current) {
          // Already recording: this press is the "tap again to stop" toggle-off.
          ignoreReleaseRef.current = true;
          await finishAndCapture();
        } else {
          pressStartRef.current = Date.now();
          await startRecording();
        }
      } finally {
        busyRef.current = false;
        if (pendingReleaseAtRef.current !== null) {
          const releasedAt = pendingReleaseAtRef.current;
          pendingReleaseAtRef.current = null;
          maybeStopFromRelease(releasedAt);
        }
      }
    })();
  }, [finishAndCapture, startRecording, maybeStopFromRelease]);

  const onMicPressOut = useCallback(() => {
    if (ignoreReleaseRef.current) {
      ignoreReleaseRef.current = false;
      return;
    }
    if (busyRef.current) {
      // onPressIn (start, or a permission prompt) hasn't settled yet.
      // Remember the release time and resolve hold-vs-tap once it does.
      pendingReleaseAtRef.current = Date.now();
      return;
    }
    maybeStopFromRelease(Date.now());
  }, [maybeStopFromRelease]);

  useEffect(() => {
    return () => {
      clearTimer();
      stopPulse();
      if (!preparedRef.current) return;
      try {
        if (recorder.isRecording) {
          void recorder.stop();
        }
      } catch {
        // Recorder was never initialized. Do not unload it on screen change.
      }
    };
  }, [clearTimer, stopPulse, recorder]);

  return { isRecording, countdownLabel, pulseOpacity, onMicPressIn, onMicPressOut };
}
