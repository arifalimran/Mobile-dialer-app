import React, { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  CalendarCheck,
  Clock,
  MessageCircle,
  Mic,
  Square,
  XCircle,
} from 'lucide-react-native';

import { DatePickerModal } from '../../../components/ui/DatePickerModal';

import type { AudioMemoMetadata, Disposition, DispositionSubmission } from '../callingTypes';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

interface PostCallDrawerProps {
  visible: boolean;
  leadId: string;
  onSubmit: (submission: DispositionSubmission) => void;
}

interface DispositionOption {
  value: Disposition;
  label: string;
  Icon: typeof CalendarCheck;
  className: string;
}

const DISPOSITION_OPTIONS: DispositionOption[] = [
  {
    value: 'BOOK_SITE_VISIT',
    label: 'Book Site Visit',
    Icon: CalendarCheck,
    className: 'bg-emerald-600',
  },
  {
    value: 'CALLBACK_LATER',
    label: 'Callback Later',
    Icon: Clock,
    className: 'bg-amber-600',
  },
  {
    value: 'SEND_WHATSAPP_INFO',
    label: 'Send WhatsApp Info',
    Icon: MessageCircle,
    className: 'bg-sky-600',
  },
  {
    value: 'NOT_INTERESTED',
    label: 'Not Interested',
    Icon: XCircle,
    className: 'bg-rose-600',
  },
];

export const PostCallDrawer: React.FC<PostCallDrawerProps> = ({
  visible,
  leadId,
  onSubmit,
}) => {
  const { isRecording, durationMs, startRecording, stopRecording } = useAudioRecorder();
  const [audioMemo, setAudioMemo] = useState<AudioMemoMetadata | null>(null);
  const [isSchedulingCallback, setIsSchedulingCallback] = useState(false);
  const [callbackAt, setCallbackAt] = useState<number | null>(null);
  const [callbackNote, setCallbackNote] = useState('');
  const [showCustomDateTime, setShowCustomDateTime] = useState(false);

  const handleMicPressIn = () => {
    startRecording();
  };

  const handleMicPressOut = async () => {
    const memo = await stopRecording();
    if (memo) {
      setAudioMemo(memo);
    }
  };

  const resetCallbackState = () => {
    Keyboard.dismiss();
    setIsSchedulingCallback(false);
    setCallbackAt(null);
    setCallbackNote('');
    setShowCustomDateTime(false);
  };

  const submitDisposition = (
    disposition: Disposition,
    extra?: { callbackAt?: number; callbackNote?: string },
  ) => {
    Keyboard.dismiss();
    onSubmit({
      leadId,
      disposition,
      audioMemo: audioMemo ?? undefined,
      callbackAt: extra?.callbackAt,
      callbackNote: extra?.callbackNote,
      submittedAt: Date.now(),
    });
    setAudioMemo(null);
    resetCallbackState();
  };

  const handleDispositionPress = (disposition: Disposition) => {
    if (disposition === 'CALLBACK_LATER') {
      setIsSchedulingCallback(true);
      return;
    }
    submitDisposition(disposition);
  };

  const handlePresetHours = (hours: number) => {
    setCallbackAt(Date.now() + hours * 60 * 60 * 1000);
  };

  const handleTomorrowMorning = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    setCallbackAt(tomorrow.getTime());
  };

  const handleConfirmCallback = () => {
    if (!callbackAt || callbackNote.trim().length === 0) return;
    submitDisposition('CALLBACK_LATER', { callbackAt, callbackNote: callbackNote.trim() });
  };

  const seconds = Math.min(15, Math.floor(durationMs / 1000));

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="rounded-t-3xl border-t border-slate-800 bg-slate-950 p-5">
            <Text className="text-lg font-semibold text-white">Log Call Outcome</Text>
            <Text className="mt-1 text-sm text-slate-400">
              Select a disposition to advance to the next lead.
            </Text>

        <View className="mt-5 flex-row items-center rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
          <Pressable
            onPressIn={handleMicPressIn}
            onPressOut={handleMicPressOut}
            className={`h-12 w-12 items-center justify-center rounded-full ${
              isRecording ? 'bg-rose-600' : 'bg-slate-800'
            }`}
          >
            {isRecording ? (
              <Square size={18} color="#ffffff" />
            ) : (
              <Mic size={20} color="#ffffff" />
            )}
          </Pressable>
          <Text className="ml-3 text-sm text-slate-300">
            {isRecording
              ? `Recording… ${seconds}s / 15s`
              : audioMemo
                ? `Voice memo captured (${Math.floor(audioMemo.durationMs / 1000)}s)`
                : 'Hold to record a 15s debrief'}
          </Text>
        </View>

        {isSchedulingCallback ? (
          <View className="mt-5 rounded-xl border border-amber-800 bg-amber-950/40 p-4">
            <Text className="text-sm font-semibold text-amber-300">Schedule Follow-up</Text>

            <View className="mt-3 flex-row flex-wrap gap-2">
              <Pressable
                onPress={() => handlePresetHours(2)}
                className="min-h-[48px] items-center justify-center rounded-lg border border-amber-800 bg-slate-950 px-3"
              >
                <Text className="text-sm text-amber-100">In 2 hours</Text>
              </Pressable>
              <Pressable
                onPress={handleTomorrowMorning}
                className="min-h-[48px] items-center justify-center rounded-lg border border-amber-800 bg-slate-950 px-3"
              >
                <Text className="text-sm text-amber-100">Tomorrow Morning</Text>
              </Pressable>
              <Pressable
                onPress={() => setShowCustomDateTime(true)}
                className="min-h-[48px] items-center justify-center rounded-lg border border-amber-800 bg-slate-950 px-3"
              >
                <Text className="text-sm text-amber-100">Custom date/time</Text>
              </Pressable>
            </View>

            <DatePickerModal
              visible={showCustomDateTime}
              mode="datetime"
              title="Schedule Follow-up"
              onConfirm={(date) => {
                setCallbackAt(date.getTime());
                setShowCustomDateTime(false);
              }}
              onClose={() => setShowCustomDateTime(false)}
            />

            {callbackAt && (
              <Text className="mt-2 text-xs text-amber-200">
                Scheduled for {new Date(callbackAt).toLocaleString()}
              </Text>
            )}

            <TextInput
              value={callbackNote}
              onChangeText={setCallbackNote}
              placeholder="Follow-up Notes / Summary of Last Talk"
              placeholderTextColor="#78716c"
              multiline
              numberOfLines={3}
              className="mt-3 min-h-[80px] rounded-lg border border-amber-800 bg-slate-950 px-3 py-2 text-sm text-white"
            />

            <View className="mt-3 flex-row gap-2">
              <Pressable
                onPress={resetCallbackState}
                className="min-h-[48px] flex-1 items-center justify-center rounded-lg border border-slate-700"
              >
                <Text className="text-sm font-semibold text-slate-300">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleConfirmCallback}
                disabled={!callbackAt || callbackNote.trim().length === 0}
                className={`min-h-[48px] flex-1 items-center justify-center rounded-lg ${
                  !callbackAt || callbackNote.trim().length === 0 ? 'bg-amber-900' : 'bg-amber-600'
                }`}
              >
                <Text className="text-sm font-semibold text-white">Confirm &amp; Log</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View className="mt-5 flex-row flex-wrap gap-3">
            {DISPOSITION_OPTIONS.map(({ value, label, Icon, className }) => (
              <Pressable
                key={value}
                onPress={() => handleDispositionPress(value)}
                className={`min-h-[48px] w-[48%] flex-row items-center justify-center rounded-xl ${className}`}
              >
                <Icon size={18} color="#ffffff" />
                <Text className="ml-2 text-sm font-semibold text-white">{label}</Text>
              </Pressable>
            ))}
          </View>
        )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};
