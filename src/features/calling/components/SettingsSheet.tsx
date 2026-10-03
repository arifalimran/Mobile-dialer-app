import React, { useEffect, useMemo, useState } from 'react';
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
import { MONTHLY_SALARY_GATE_METRICS } from '../../wallet/utils/kpiEngine';
import type { CallProviderMode } from '../callingTypes';

interface SettingsSheetProps {
  visible: boolean;
  agentPhone: string;
  callProviderMode: CallProviderMode;
  onClose: () => void;
  onSave: (agentPhone: string, callProviderMode: CallProviderMode) => void;
  onNavigateWallet: () => void;
}

export const SettingsSheet: React.FC<SettingsSheetProps> = ({
  visible,
  agentPhone,
  callProviderMode,
  onClose,
  onSave,
  onNavigateWallet,
}) => {
  const { colors } = useAppTheme();
  const [draftPhone, setDraftPhone] = useState(agentPhone);
  const [draftMode, setDraftMode] = useState<CallProviderMode>(callProviderMode);
  const [isGuidelinesVisible, setIsGuidelinesVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setDraftPhone(agentPhone);
      setDraftMode(callProviderMode);
      setIsGuidelinesVisible(false);
    }
  }, [visible, agentPhone, callProviderMode]);

  const handleSave = () => {
    Keyboard.dismiss();
    onSave(draftPhone.trim(), draftMode);
    onClose();
  };

  const guidelines = useMemo(() => MONTHLY_SALARY_GATE_METRICS, []);

  return (
    <>
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
                onPress={() => setIsGuidelinesVisible(true)}
                style={{ marginTop: 20, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel, padding: 14 }}
              >
                <Text style={{ fontSize: 13, fontWeight: '800', color: colors.textPrimary }}>Monthly KPI &amp; Compensation Guidelines</Text>
                <Text style={{ marginTop: 6, fontSize: 12, color: colors.textSecondary }}>
                  Review the full 8-point gate, payout unlock rules, and live wallet status.
                </Text>
              </Pressable>

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

      <Modal visible={isGuidelinesVisible} transparent animationType="slide" onRequestClose={() => setIsGuidelinesVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(15, 23, 42, 0.68)', padding: 20 }}>
          <View style={{ borderRadius: 22, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, padding: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>Monthly Salary Gate</Text>
              <Pressable onPress={() => setIsGuidelinesVisible(false)} style={{ padding: 6 }}>
                <X size={18} color={colors.textPrimary} />
              </Pressable>
            </View>

            <View style={{ marginTop: 16 }}>
              {guidelines.map((metric, index) => (
                <View key={metric.key} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: index === guidelines.length - 1 ? 0 : 10 }}>
                  <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                    <Text style={{ fontSize: 10, fontWeight: '900', color: '#0F172A' }}>✓</Text>
                  </View>
                  <Text style={{ flex: 1, fontSize: 12, color: colors.textSecondary }}>{metric.label}</Text>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textPrimary }}>{metric.target}{metric.suffix}</Text>
                </View>
              ))}
            </View>

            <Pressable
              onPress={() => {
                setIsGuidelinesVisible(false);
                onNavigateWallet();
              }}
              style={{ marginTop: 20, minHeight: 48, borderRadius: 12, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#FFFFFF' }}>Check My Live Wallet Progress</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
};
