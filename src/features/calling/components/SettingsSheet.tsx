import React, { useEffect, useState } from 'react';
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
import { X } from 'lucide-react-native';

import type { CallProviderMode } from '../callingTypes';

interface SettingsSheetProps {
  visible: boolean;
  agentPhone: string;
  callProviderMode: CallProviderMode;
  onClose: () => void;
  onSave: (agentPhone: string, callProviderMode: CallProviderMode) => void;
}

export const SettingsSheet: React.FC<SettingsSheetProps> = ({
  visible,
  agentPhone,
  callProviderMode,
  onClose,
  onSave,
}) => {
  const [draftPhone, setDraftPhone] = useState(agentPhone);
  const [draftMode, setDraftMode] = useState<CallProviderMode>(callProviderMode);

  useEffect(() => {
    if (visible) {
      setDraftPhone(agentPhone);
      setDraftMode(callProviderMode);
    }
  }, [visible, agentPhone, callProviderMode]);

  const handleSave = () => {
    Keyboard.dismiss();
    onSave(draftPhone.trim(), draftMode);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="rounded-t-3xl border-t border-slate-800 bg-slate-950 p-5">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-white">Agent Settings</Text>
              <Pressable
                onPress={() => {
                  Keyboard.dismiss();
                  onClose();
                }}
                className="h-10 w-10 items-center justify-center rounded-full bg-slate-900"
              >
                <X size={18} color="#e2e8f0" />
              </Pressable>
            </View>

            <Text className="mt-5 text-xs font-medium text-slate-400">YOUR PHONE NUMBER</Text>
            <TextInput
              value={draftPhone}
              onChangeText={setDraftPhone}
              placeholder="+8801XXXXXXXXX"
              placeholderTextColor="#475569"
              keyboardType="phone-pad"
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
              className="mt-2 min-h-[48px] rounded-xl border border-slate-800 bg-slate-900 px-4 text-base text-white"
            />

        <Text className="mt-5 text-xs font-medium text-slate-400">CALLING PROVIDER</Text>
        <View className="mt-2 flex-row gap-3">
          <Pressable
            onPress={() => setDraftMode('NATIVE_SIM')}
            className={`min-h-[48px] flex-1 items-center justify-center rounded-xl border ${
              draftMode === 'NATIVE_SIM' ? 'border-sky-600 bg-sky-950' : 'border-slate-800 bg-slate-900'
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                draftMode === 'NATIVE_SIM' ? 'text-sky-400' : 'text-slate-400'
              }`}
            >
              Native SIM
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setDraftMode('IPTSP_BRIDGE')}
            className={`min-h-[48px] flex-1 items-center justify-center rounded-xl border ${
              draftMode === 'IPTSP_BRIDGE' ? 'border-sky-600 bg-sky-950' : 'border-slate-800 bg-slate-900'
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                draftMode === 'IPTSP_BRIDGE' ? 'text-sky-400' : 'text-slate-400'
              }`}
            >
              IPTSP Bridge
            </Text>
          </Pressable>
        </View>
        <Text className="mt-2 text-xs text-slate-500">
          Native SIM opens your phone&apos;s own dialer (masked leads cannot be dialed this way).
          IPTSP Bridge simulates the masked cloud PBX call.
        </Text>

            <Pressable
              onPress={handleSave}
              className="mt-6 min-h-[48px] items-center justify-center rounded-xl bg-sky-600"
            >
              <Text className="text-base font-semibold text-white">Save Settings</Text>
            </Pressable>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};
