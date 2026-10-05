import React, { useEffect, useMemo, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { X } from 'lucide-react-native';

import { SelectModal } from '../../../components/SelectModal';
import { useAppTheme } from '../../../theme/ThemeContext';
import { useAuthStore } from '../../auth/hooks/useAuthStore';
import { EMPLOYEE_ROLE_ORDER, getEmployeeRoleProfile } from '../../auth/constants/employeeProfiles';
import { MOCK_BULLETINS } from '../../notices/constants/mockBulletins';
import { useNoticeStore } from '../../notices/hooks/useNoticeStore';
import { MONTHLY_SALARY_GATE_METRICS } from '../../wallet/utils/kpiEngine';
import type { CallProviderMode } from '../callingTypes';

interface SettingsSheetProps {
  visible: boolean;
  agentPhone: string;
  callProviderMode: CallProviderMode;
  onClose: () => void;
  onSave: (agentPhone: string, callProviderMode: CallProviderMode) => void;
  onNavigateWallet: () => void;
  onSignOut: () => void;
}

export const SettingsSheet: React.FC<SettingsSheetProps> = ({
  visible,
  agentPhone,
  callProviderMode,
  onClose,
  onSave,
  onNavigateWallet,
  onSignOut,
}) => {
  const { colors } = useAppTheme();
  const [draftPhone, setDraftPhone] = useState(agentPhone);
  const [draftMode, setDraftMode] = useState<CallProviderMode>(callProviderMode);
  const [isGuidelinesVisible, setIsGuidelinesVisible] = useState(false);
  const [isBulletinsVisible, setIsBulletinsVisible] = useState(false);
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
  const acknowledgedIds = useNoticeStore((state) => state.acknowledgedIds);
  const acknowledge = useNoticeStore((state) => state.acknowledge);
  const role = useAuthStore((state) => state.role);
  const switchRole = useAuthStore((state) => state.switchRole);
  const agentProfile = useAuthStore((state) => state.agentProfile);
  const roleLabel = getEmployeeRoleProfile(role).label;

  useEffect(() => {
    if (visible) {
      setDraftPhone(agentPhone);
      setDraftMode(callProviderMode);
      setIsGuidelinesVisible(false);
      setIsBulletinsVisible(false);
      setIsRoleModalVisible(false);
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

              <View style={{ marginTop: 18, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel, padding: 12 }}>
                <Text style={{ fontSize: 11, fontWeight: '800', letterSpacing: 0.8, color: colors.textSecondary }}>ACTIVE PROFILE DOSSIER</Text>
                <Text style={{ marginTop: 7, fontSize: 13, color: colors.textPrimary }}>Agent: {agentProfile?.legalName ?? 'Imran Nahar'}</Text>
                <Text style={{ marginTop: 4, fontSize: 12, color: colors.textSecondary }}>Status: {agentProfile?.employeeStatus ?? 'PROBATION'} • Role: {roleLabel}</Text>
                <Text style={{ marginTop: 4, fontSize: 12, color: colors.textSecondary }}>Corporate SIM: {agentProfile?.corporateSim ?? 'Unassigned'}</Text>
                <Text style={{ marginTop: 4, fontSize: 12, color: colors.textSecondary }}>Session: {agentProfile?.sessionId ?? '#SES-8831'}</Text>
              </View>

              <Text style={{ marginTop: 20, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, color: colors.textSecondary }}>ROLE SWITCHER (MOCK SANDBOX)</Text>
              <Pressable
                onPress={() => setIsRoleModalVisible(true)}
                style={{ marginTop: 8, minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Text style={{ fontSize: 15, color: colors.textPrimary }}>{roleLabel}</Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.accent }}>Switch</Text>
              </Pressable>

              <Text style={{ marginTop: 20, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, color: colors.textSecondary }}>CALLING PROVIDER</Text>
              <View style={{ marginTop: 8, flexDirection: 'row', gap: 12 }}>
                <Pressable
                  onPress={() => setDraftMode('DIRECT_NATIVE_DIALER')}
                  style={{ minHeight: 48, flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1, borderColor: draftMode === 'DIRECT_NATIVE_DIALER' ? colors.accent : colors.border, backgroundColor: draftMode === 'DIRECT_NATIVE_DIALER' ? colors.subpanel : colors.card }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '700', color: draftMode === 'DIRECT_NATIVE_DIALER' ? colors.accent : colors.textSecondary }}>
                    Direct Native Dialer
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
                Direct Native Dialer opens the device dialer and returns to the app for disposition logging. IPTSP Bridge keeps the call inside the masked PBX flow.
              </Text>

              <Pressable
                onPress={() => setIsBulletinsVisible(true)}
                style={{ marginTop: 20, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel, padding: 14 }}
              >
                <Text style={{ fontSize: 13, fontWeight: '800', color: colors.textPrimary }}>Company Bulletins &amp; Compliance Notices</Text>
                <Text style={{ marginTop: 6, fontSize: 12, color: colors.textSecondary }}>
                  Review head-office announcements, unread notices, and acknowledge compliance updates.
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setIsGuidelinesVisible(true)}
                style={{ marginTop: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel, padding: 14 }}
              >
                <Text style={{ fontSize: 13, fontWeight: '800', color: colors.textPrimary }}>Monthly KPI &amp; Compensation Guidelines</Text>
                <Text style={{ marginTop: 6, fontSize: 12, color: colors.textSecondary }}>
                  Review the weighted gate, payout unlock rules, and live wallet status.
                </Text>
              </Pressable>

              <Pressable
                onPress={handleSave}
                style={{ marginTop: 24, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: colors.accent }}
              >
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>Save Settings</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  onClose();
                  onSignOut();
                }}
                style={{ marginTop: 10, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1, borderColor: colors.danger, backgroundColor: 'rgba(244,63,94,0.12)' }}
              >
                <Text style={{ fontSize: 15, fontWeight: '800', color: colors.danger }}>Sign Out / Clock Out</Text>
              </Pressable>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={isGuidelinesVisible} transparent animationType="slide" onRequestClose={() => setIsGuidelinesVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(15, 23, 42, 0.68)', padding: 20 }}>
          <View style={{ borderRadius: 22, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, padding: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>Monthly Compensation Gate</Text>
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
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textPrimary }}>{metric.weight}% weight</Text>
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

      <Modal visible={isBulletinsVisible} transparent animationType="slide" onRequestClose={() => setIsBulletinsVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(15, 23, 42, 0.68)', padding: 20 }}>
          <View style={{ maxHeight: '84%', borderRadius: 22, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, padding: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>Company Bulletins</Text>
              <Pressable onPress={() => setIsBulletinsVisible(false)} style={{ padding: 6 }}>
                <X size={18} color={colors.textPrimary} />
              </Pressable>
            </View>

            <ScrollView style={{ marginTop: 14 }} contentContainerStyle={{ paddingBottom: 8 }}>
              {MOCK_BULLETINS.map((bulletin) => {
                const isRead = acknowledgedIds.includes(bulletin.id);
                return (
                  <View
                    key={bulletin.id}
                    style={{
                      marginBottom: 12,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: bulletin.priority === 'HIGH' ? colors.warning : colors.border,
                      backgroundColor: bulletin.priority === 'HIGH' ? 'rgba(245,158,11,0.12)' : colors.subpanel,
                      padding: 14,
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Text style={{ flex: 1, marginRight: 10, fontSize: 14, fontWeight: '800', color: colors.textPrimary }}>{bulletin.title}</Text>
                      <Text style={{ fontSize: 10, fontWeight: '800', color: isRead ? colors.success : colors.danger }}>{isRead ? 'READ' : 'UNREAD'}</Text>
                    </View>
                    <Text style={{ marginTop: 6, fontSize: 11, color: colors.textSecondary }}>{new Date(bulletin.postedAt).toLocaleString()}</Text>
                    <Text style={{ marginTop: 8, fontSize: 13, lineHeight: 20, color: colors.textSecondary }}>{bulletin.body}</Text>
                    {!isRead && (
                      <Pressable
                        onPress={() => acknowledge(bulletin.id)}
                        style={{ marginTop: 12, minHeight: 44, borderRadius: 10, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#FFFFFF' }}>I Have Read &amp; Understood</Text>
                      </Pressable>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <SelectModal
        visible={isRoleModalVisible}
        title="Role Switcher (Mock Sandbox)"
        options={EMPLOYEE_ROLE_ORDER.map((value) => getEmployeeRoleProfile(value).label)}
        selectedValue={roleLabel}
        onSelect={(label) => {
          const nextRole = EMPLOYEE_ROLE_ORDER.find((value) => getEmployeeRoleProfile(value).label === label);
          if (nextRole) {
            switchRole(nextRole);
          }
        }}
        onClose={() => setIsRoleModalVisible(false)}
      />
    </>
  );
};
