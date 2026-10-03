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
import { useAppTheme } from '../../../theme/ThemeContext';

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
  const { colors } = useAppTheme();
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
        style={{ flex: 1, justifyContent: 'flex-end' }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ borderTopWidth: 1, borderTopColor: colors.border, borderRadius: 24, backgroundColor: colors.card, padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>Log Call Outcome</Text>
            <Text style={{ marginTop: 4, fontSize: 14, color: colors.textSecondary }}>
              Select a disposition to advance to the next lead.
            </Text>

            <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel, paddingHorizontal: 16, paddingVertical: 12 }}>
              <Pressable
                onPressIn={handleMicPressIn}
                onPressOut={handleMicPressOut}
                style={{ height: 48, width: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 999, backgroundColor: isRecording ? '#F43F5E' : colors.subpanel }}
              >
                {isRecording ? <Square size={18} color="#ffffff" /> : <Mic size={20} color="#ffffff" />}
              </Pressable>
              <Text style={{ marginLeft: 12, fontSize: 14, color: colors.textSecondary }}>
                {isRecording
                  ? `Recording… ${seconds}s / 15s`
                  : audioMemo
                    ? `Voice memo captured (${Math.floor(audioMemo.durationMs / 1000)}s)`
                    : 'Hold to record a 15s debrief'}
              </Text>
            </View>

            {isSchedulingCallback ? (
              <View style={{ marginTop: 20, borderRadius: 16, borderWidth: 1, borderColor: colors.warning, backgroundColor: 'rgba(245,158,11,0.12)', padding: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.warning }}>Schedule Follow-up</Text>

                <View style={{ marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  <Pressable
                    onPress={() => handlePresetHours(2)}
                    style={{ minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: colors.warning, backgroundColor: colors.card, paddingHorizontal: 12 }}
                  >
                    <Text style={{ fontSize: 13, color: colors.textPrimary }}>In 2 hours</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleTomorrowMorning}
                    style={{ minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: colors.warning, backgroundColor: colors.card, paddingHorizontal: 12 }}
                  >
                    <Text style={{ fontSize: 13, color: colors.textPrimary }}>Tomorrow Morning</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setShowCustomDateTime(true)}
                    style={{ minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: colors.warning, backgroundColor: colors.card, paddingHorizontal: 12 }}
                  >
                    <Text style={{ fontSize: 13, color: colors.textPrimary }}>Custom date/time</Text>
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
                  <Text style={{ marginTop: 8, fontSize: 12, color: colors.textPrimary }}>
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
                  style={{ marginTop: 12, minHeight: 80, borderRadius: 10, borderWidth: 1, borderColor: colors.warning, backgroundColor: colors.card, padding: 12, fontSize: 14, color: colors.textPrimary }}
                />

                <View style={{ marginTop: 12, flexDirection: 'row', gap: 8 }}>
                  <Pressable
                    onPress={resetCallbackState}
                    style={{ minHeight: 48, flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: colors.border }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textSecondary }}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleConfirmCallback}
                    disabled={!callbackAt || callbackNote.trim().length === 0}
                    style={{ minHeight: 48, flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: !callbackAt || callbackNote.trim().length === 0 ? colors.subpanel : colors.warning }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '700', color: !callbackAt || callbackNote.trim().length === 0 ? colors.textSecondary : '#FFFFFF' }}>Confirm &amp; Log</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={{ marginTop: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                {DISPOSITION_OPTIONS.map(({ value, label, Icon, className }) => (
                  <Pressable
                    key={value}
                    onPress={() => handleDispositionPress(value)}
                    style={{ minHeight: 48, width: '48%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: value === 'BOOK_SITE_VISIT' ? '#10B981' : value === 'CALLBACK_LATER' ? '#F59E0B' : value === 'SEND_WHATSAPP_INFO' ? '#38BDF8' : '#F43F5E' }}
                  >
                    <Icon size={18} color="#ffffff" />
                    <Text style={{ marginLeft: 8, fontSize: 13, fontWeight: '700', color: '#FFFFFF' }}>{label}</Text>
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
