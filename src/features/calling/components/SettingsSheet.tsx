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

import { useAppTheme } from '../../../theme/ThemeContext';
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
  const { colors } = useAppTheme();
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
        style={{ flex: 1, justifyContent: 'flex-end' }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ borderTopWidth: 1, borderTopColor: colors.border, borderRadius: 24, backgroundColor: colors.card, padding: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>Agent Settings</Text>
              <Pressable
                onPress={() => {
                  Keyboard.dismiss();
                  onClose();
                }}
                style={{ height: 40, width: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: colors.subpanel }}
              >
                <X size={18} color={colors.textPrimary} />
              </Pressable>
            </View>

            <Text style={{ marginTop: 20, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, color: colors.textSecondary }}>YOUR PHONE NUMBER</Text>
            <TextInput
              value={draftPhone}
              onChangeText={setDraftPhone}
              placeholder="+8801XXXXXXXXX"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
              style={{ marginTop: 8, minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel, paddingHorizontal: 16, fontSize: 16, color: colors.textPrimary }}
            />

            <Text style={{ marginTop: 20, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, color: colors.textSecondary }}>CALLING PROVIDER</Text>
            <View style={{ marginTop: 8, flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={() => setDraftMode('NATIVE_SIM')}
                style={{ minHeight: 48, flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1, borderColor: draftMode === 'NATIVE_SIM' ? colors.accent : colors.border, backgroundColor: draftMode === 'NATIVE_SIM' ? colors.subpanel : colors.card }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: draftMode === 'NATIVE_SIM' ? colors.accent : colors.textSecondary }}>
                  Native SIM
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setDraftMode('IPTSP_BRIDGE')}
                style={{ minHeight: 48, flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1, borderColor: draftMode === 'IPTSP_BRIDGE' ? colors.accent : colors.border, backgroundColor: draftMode === 'IPTSP_BRIDGE' ? colors.subpanel : colors.card }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: draftMode === 'IPTSP_BRIDGE' ? colors.accent : colors.textSecondary }}>
                  IPTSP Bridge
                </Text>
              </Pressable>
            </View>
            <Text style={{ marginTop: 8, fontSize: 12, color: colors.textSecondary }}>
              Native SIM opens your phone&apos;s own dialer (masked leads cannot be dialed this way). IPTSP Bridge simulates the masked cloud PBX call.
            </Text>

            <Pressable
              onPress={handleSave}
              style={{ marginTop: 24, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: colors.accent }}
            >
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>Save Settings</Text>
            </Pressable>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};
