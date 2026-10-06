import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import {
  Camera,
  ChevronRight,
  Clock3,
  Coffee,
  FileText,
  LogOut,
  MapPin,
  Phone,
  Plus,
  Shuffle,
  Tag,
  User,
  Wallet,
  X,
} from 'lucide-react-native';

import { useAppTheme } from '../../../theme/ThemeContext';
import { useAuthStore } from '../../auth/hooks/useAuthStore';
import type { AgentRole } from '../../auth/authTypes';
import { EMPLOYEE_ROLE_ORDER, getEmployeeRoleProfile } from '../../auth/constants/employeeProfiles';
import { useAgentConfig } from '../hooks/useAgentConfig';
import type { CallProviderMode } from '../callingTypes';
import { useShiftStore } from '../../shifts/hooks/useShiftStore';
import { TokenDepositDrawer } from '../../finance/components/TokenDepositDrawer';
import { KpiGuidelinesModal } from '../../wallet/components/KpiGuidelinesModal';

const BREAK_OPTIONS_MIN = [15, 30, 45, 60, 90, 120];

function formatElapsed(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(hours)}h ${pad(minutes)}m`;
}

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onOpenAddLead: () => void;
  onNavigateWallet: () => void;
}

/**
 * Module 2: WhatsApp-style slide-up profile drawer. Replaces the old
 * `AgentStatusSheet` + `SettingsSheet` pair with a single consolidated
 * surface: profile identity, the duty/break state machine, quick actions,
 * workspace settings (role sandbox + telephony routing), and sign-out.
 */
export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({ isOpen, onClose, onLogout, onOpenAddLead, onNavigateWallet }) => {
  const { colors } = useAppTheme();
  const agentProfile = useAuthStore((state) => state.agentProfile);
  const role = useAuthStore((state) => state.role);
  const switchRole = useAuthStore((state) => state.switchRole);
  const { agentPhone, callProviderMode, setCallProviderMode } = useAgentConfig();

  const lockStatus = useShiftStore((state) => state.lockStatus);
  const lockedUntil = useShiftStore((state) => state.lockedUntil);
  const activeSessionStartedAt = useShiftStore((state) => state.activeSessionStartedAt);
  const isOnBreak = useShiftStore((state) => state.isOnBreak);
  const breakEndsAt = useShiftStore((state) => state.breakEndsAt);
  const accumulatedBreakMs = useShiftStore((state) => state.accumulatedBreakMs);
  const attendanceHistory = useShiftStore((state) => state.attendanceHistory);
  const startDutySession = useShiftStore((state) => state.startDutySession);
  const endDutySession = useShiftStore((state) => state.endDutySession);
  const startBreak = useShiftStore((state) => state.startBreak);
  const endBreak = useShiftStore((state) => state.endBreak);
  const checkBreakExpiry = useShiftStore((state) => state.checkBreakExpiry);
  const openAttendanceModal = useShiftStore((state) => state.openAttendanceModal);

  const [now, setNow] = useState(Date.now());
  const [dutyFeedback, setDutyFeedback] = useState<string | null>(null);
  const [isBreakMenuVisible, setIsBreakMenuVisible] = useState(false);
  const [isOffDutyConfirmVisible, setIsOffDutyConfirmVisible] = useState(false);
  const [isAvatarMenuVisible, setIsAvatarMenuVisible] = useState(false);
  const [isSiteVisitVisible, setIsSiteVisitVisible] = useState(false);
  const [isUnitHoldVisible, setIsUnitHoldVisible] = useState(false);
  const [unitHoldCode, setUnitHoldCode] = useState('');
  const [unitHoldConfirmed, setUnitHoldConfirmed] = useState<string | null>(null);
  const [isTokenDepositVisible, setIsTokenDepositVisible] = useState(false);
  const [isBrochureVisible, setIsBrochureVisible] = useState(false);
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
  const [isTelephonyModalVisible, setIsTelephonyModalVisible] = useState(false);
  const [isKpiGuidelinesVisible, setIsKpiGuidelinesVisible] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setNow(Date.now());
      checkBreakExpiry();
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, checkBreakExpiry]);

  const isShiftLocked = lockStatus === 'PENALIZED' && !!lockedUntil && now < lockedUntil;
  const dutyStatus: 'ON_DUTY' | 'ON_BREAK' | 'OFF_DUTY' = !activeSessionStartedAt
    ? 'OFF_DUTY'
    : isOnBreak
      ? 'ON_BREAK'
      : 'ON_DUTY';

  const roleProfile = getEmployeeRoleProfile(role);
  const monthlyHoursCompleted = attendanceHistory.reduce((total, session) => total + session.hoursWorked, 0);
  const hoursToday = activeSessionStartedAt
    ? Math.max(0, (now - activeSessionStartedAt - accumulatedBreakMs) / (1000 * 60 * 60))
    : 0;
  const breakRemainingMs = isOnBreak && breakEndsAt ? Math.max(0, breakEndsAt - now) : 0;

  const statusMeta = useMemo(() => {
    if (dutyStatus === 'ON_DUTY') return { label: '● On Duty', color: colors.success, bg: 'rgba(16,185,129,0.14)' };
    if (dutyStatus === 'ON_BREAK') return { label: `☕ On Break (${Math.ceil(breakRemainingMs / 60000)}m left)`, color: colors.warning, bg: 'rgba(245,158,11,0.14)' };
    return { label: '○ Off Duty', color: colors.textSecondary, bg: colors.subpanel };
  }, [dutyStatus, breakRemainingMs, colors]);

  const handleGoOnDuty = () => {
    if (dutyStatus === 'ON_BREAK') {
      endBreak();
      return;
    }
    const result = startDutySession();
    if (!result.ok) {
      setDutyFeedback(result.reason ?? 'Unable to start duty session.');
      return;
    }
    onClose();
  };

  const confirmOffDuty = () => {
    const session = endDutySession();
    setIsOffDutyConfirmVisible(false);
    setDutyFeedback(session ? `Duty session closed with ${session.hoursWorked.toFixed(2)} hours logged.` : 'There is no active duty session to close.');
  };

  const handleAction = (action: () => void) => {
    onClose();
    action();
  };

  const quickActions = [
    { key: 'add-lead', label: 'Add New Custom Lead', Icon: Plus, onPress: () => handleAction(onOpenAddLead) },
    { key: 'site-visit', label: 'Book Site Visit / Field Inspection', Icon: MapPin, onPress: () => setIsSiteVisitVisible(true) },
    { key: 'unit-hold', label: 'Quick Unit Hold Request', Icon: Tag, onPress: () => setIsUnitHoldVisible(true) },
    { key: 'token-deposit', label: 'Submit Advance Token / Payment', Icon: Wallet, onPress: () => setIsTokenDepositVisible(true) },
    { key: 'attendance', label: 'My Attendance Ledger & Shift History', Icon: Clock3, onPress: () => handleAction(openAttendanceModal) },
    { key: 'brochure', label: 'Send Project Brochure & Price List', Icon: FileText, onPress: () => setIsBrochureVisible(true) },
  ];

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay }}>
          <TouchableWithoutFeedback>
            <View style={{ maxHeight: '88%', borderTopWidth: 1, borderTopColor: colors.border, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: colors.card }}>
              <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>Profile</Text>
                  <Pressable onPress={onClose} style={{ height: 36, width: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 999, backgroundColor: colors.subpanel }}>
                    <X size={16} color={colors.textPrimary} />
                  </Pressable>
                </View>

                <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center' }}>
                  <Pressable
                    onPress={() => setIsAvatarMenuVisible(true)}
                    style={{ height: 64, width: 64, borderRadius: 32, backgroundColor: colors.subpanel, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}
                  >
                    <User size={28} color={colors.textSecondary} />
                    <View style={{ position: 'absolute', right: -2, bottom: -2, height: 24, width: 24, borderRadius: 999, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.card }}>
                      <Camera size={12} color="#FFFFFF" />
                    </View>
                  </Pressable>

                  <View style={{ marginLeft: 14, flex: 1 }}>
                    <Text numberOfLines={1} style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary }}>
                      {agentProfile?.legalName ?? 'Agent'}
                    </Text>
                    <Text selectable={false} style={{ marginTop: 2, fontFamily: 'monospace', fontSize: 12, color: colors.textSecondary }}>
                      {agentProfile?.corporateSim ?? 'Unassigned SIM'}
                    </Text>
                    <View style={{ marginTop: 6, alignSelf: 'flex-start', borderRadius: 999, backgroundColor: statusMeta.bg, paddingHorizontal: 10, paddingVertical: 4 }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: statusMeta.color }}>{statusMeta.label}</Text>
                    </View>
                  </View>
                </View>

                <View style={{ marginTop: 18, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel, padding: 14 }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: colors.textSecondary }}>DUTY &amp; BREAK</Text>
                  <Text style={{ marginTop: 8, fontSize: 13, color: colors.textPrimary }}>Logged today: {formatElapsed(hoursToday * 60 * 60 * 1000)}</Text>

                  {isShiftLocked ? (
                    <Text style={{ marginTop: 10, fontSize: 12, color: colors.danger }}>
                      Shift booking is locked until {lockedUntil ? new Date(lockedUntil).toLocaleString() : '—'}.
                    </Text>
                  ) : (
                    <View style={{ marginTop: 12, flexDirection: 'row', gap: 8 }}>
                      <Pressable
                        onPress={handleGoOnDuty}
                        disabled={dutyStatus === 'ON_DUTY'}
                        style={{ flex: 1, minHeight: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: dutyStatus === 'ON_DUTY' ? colors.subpanel : colors.success, opacity: dutyStatus === 'ON_DUTY' ? 0.5 : 1 }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: '800', color: dutyStatus === 'ON_DUTY' ? colors.textSecondary : '#FFFFFF' }}>On Duty</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setIsBreakMenuVisible(true)}
                        disabled={dutyStatus !== 'ON_DUTY'}
                        style={{ flex: 1, minHeight: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.warning, opacity: dutyStatus !== 'ON_DUTY' ? 0.4 : 1 }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: '800', color: '#FFFFFF' }}>Take Break</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setIsOffDutyConfirmVisible(true)}
                        disabled={dutyStatus === 'OFF_DUTY'}
                        style={{ flex: 1, minHeight: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.danger, opacity: dutyStatus === 'OFF_DUTY' ? 0.4 : 1 }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: '800', color: '#FFFFFF' }}>Off Duty</Text>
                      </Pressable>
                    </View>
                  )}
                </View>

                <View style={{ marginTop: 20 }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: colors.textSecondary }}>QUICK ACTIONS</Text>
                  <View style={{ marginTop: 8 }}>
                    {quickActions.map(({ key, label, Icon, onPress }) => (
                      <Pressable key={key} onPress={onPress} style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Icon size={18} color={colors.textSecondary} />
                          <Text style={{ marginLeft: 12, fontSize: 14, color: colors.textPrimary }}>{label}</Text>
                        </View>
                        <ChevronRight size={16} color={colors.textSecondary} />
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={{ marginTop: 20 }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: colors.textSecondary }}>WORKSPACE SETTINGS</Text>
                  <View style={{ marginTop: 8 }}>
                    <Pressable onPress={() => setIsRoleModalVisible(true)} style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Shuffle size={18} color={colors.textSecondary} />
                        <Text style={{ marginLeft: 12, fontSize: 14, color: colors.textPrimary }}>Role Sandbox · {roleProfile.label}</Text>
                      </View>
                      <ChevronRight size={16} color={colors.textSecondary} />
                    </Pressable>

                    <Pressable onPress={() => setIsTelephonyModalVisible(true)} style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Phone size={18} color={colors.textSecondary} />
                        <Text style={{ marginLeft: 12, fontSize: 14, color: colors.textPrimary }}>Telephony Line Routing</Text>
                      </View>
                      <ChevronRight size={16} color={colors.textSecondary} />
                    </Pressable>

                    <Pressable onPress={() => setIsKpiGuidelinesVisible(true)} style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Wallet size={18} color={colors.textSecondary} />
                        <Text style={{ marginLeft: 12, fontSize: 14, color: colors.textPrimary }}>Monthly KPI &amp; Compensation Policy</Text>
                      </View>
                      <ChevronRight size={16} color={colors.textSecondary} />
                    </Pressable>
                  </View>
                </View>

                <Pressable
                  onPress={() => {
                    useAuthStore.getState().logout();
                    onClose();
                    onLogout();
                  }}
                  style={{ marginTop: 24, minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.danger, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                >
                  <LogOut size={16} color={colors.danger} />
                  <Text style={{ marginLeft: 8, fontSize: 14, fontWeight: '800', color: colors.danger }}>Sign Out</Text>
                </Pressable>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>

      {/* Avatar picker stub (no image-picker dependency available in this build) */}
      <Modal visible={isAvatarMenuVisible} transparent animationType="fade" onRequestClose={() => setIsAvatarMenuVisible(false)}>
        <Pressable onPress={() => setIsAvatarMenuVisible(false)} style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.overlay, padding: 24 }}>
          <View style={{ borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 16 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: colors.textPrimary }}>Update Profile Photo</Text>
            <Pressable onPress={() => setIsAvatarMenuVisible(false)} style={{ marginTop: 14, minHeight: 46, borderRadius: 12, backgroundColor: colors.subpanel, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>Take Photo with Camera</Text>
            </Pressable>
            <Pressable onPress={() => setIsAvatarMenuVisible(false)} style={{ marginTop: 10, minHeight: 46, borderRadius: 12, backgroundColor: colors.subpanel, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>Choose from Gallery</Text>
            </Pressable>
            <Pressable onPress={() => setIsAvatarMenuVisible(false)} style={{ marginTop: 10, minHeight: 46, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textSecondary }}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={isBreakMenuVisible} transparent animationType="fade" onRequestClose={() => setIsBreakMenuVisible(false)}>
        <Pressable onPress={() => setIsBreakMenuVisible(false)} style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.overlay, padding: 24 }}>
          <View style={{ borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Coffee size={18} color={colors.warning} />
              <Text style={{ marginLeft: 8, fontSize: 15, fontWeight: '800', color: colors.textPrimary }}>Select Break Duration</Text>
            </View>
            <View style={{ marginTop: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {BREAK_OPTIONS_MIN.map((minutes) => (
                <Pressable
                  key={minutes}
                  onPress={() => {
                    startBreak(minutes);
                    setIsBreakMenuVisible(false);
                  }}
                  style={{ minWidth: '30%', minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>{minutes} min</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={isOffDutyConfirmVisible} transparent animationType="fade" onRequestClose={() => setIsOffDutyConfirmVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.overlay, padding: 24 }}>
          <View style={{ borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 18 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary }}>End active shift?</Text>
            <Text style={{ marginTop: 8, fontSize: 13, color: colors.textSecondary }}>
              You have logged {hoursToday.toFixed(1)} hours. Monthly progress: {monthlyHoursCompleted.toFixed(1)} / {roleProfile.monthlyTargetHours.toFixed(1)} hrs.
            </Text>
            <View style={{ marginTop: 16, flexDirection: 'row', gap: 10 }}>
              <Pressable onPress={() => setIsOffDutyConfirmVisible(false)} style={{ flex: 1, minHeight: 46, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={confirmOffDuty} style={{ flex: 1, minHeight: 46, borderRadius: 12, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#FFFFFF' }}>Confirm Off Duty</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={Boolean(dutyFeedback)} transparent animationType="fade" onRequestClose={() => setDutyFeedback(null)}>
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.overlay, padding: 24 }}>
          <View style={{ borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 18 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary }}>Duty Update</Text>
            <Text style={{ marginTop: 8, fontSize: 13, color: colors.textSecondary }}>{dutyFeedback}</Text>
            <Pressable onPress={() => setDutyFeedback(null)} style={{ marginTop: 16, minHeight: 46, borderRadius: 12, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#FFFFFF' }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={isSiteVisitVisible} transparent animationType="slide" onRequestClose={() => setIsSiteVisitVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay }}>
          <View style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 20, paddingBottom: 32 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>Book Site Visit</Text>
            <Text style={{ marginTop: 8, fontSize: 13, color: colors.textSecondary }}>
              Request a field inspection slot with GPS check-in. This syncs with the Inventory hold queue once confirmed.
            </Text>
            <Pressable onPress={() => setIsSiteVisitVisible(false)} style={{ marginTop: 18, minHeight: 48, borderRadius: 12, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>Confirm Booking Request</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={isUnitHoldVisible} transparent animationType="slide" onRequestClose={() => setIsUnitHoldVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay }}>
          <View style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 20, paddingBottom: 32 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>Quick Unit Hold Request</Text>
            <Text style={{ marginTop: 8, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, color: colors.textSecondary }}>UNIT / PLOT CODE</Text>
            <TextInput
              value={unitHoldCode}
              onChangeText={setUnitHoldCode}
              placeholder="e.g. AZAD-09D"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="characters"
              style={{ marginTop: 8, minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel, paddingHorizontal: 16, fontSize: 15, color: colors.textPrimary }}
            />
            <Pressable
              onPress={() => {
                if (!unitHoldCode.trim()) return;
                setUnitHoldConfirmed(unitHoldCode.trim());
                setUnitHoldCode('');
                setIsUnitHoldVisible(false);
              }}
              style={{ marginTop: 16, minHeight: 48, borderRadius: 12, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>Request 2-Hour Hold</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={Boolean(unitHoldConfirmed)} transparent animationType="fade" onRequestClose={() => setUnitHoldConfirmed(null)}>
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.overlay, padding: 24 }}>
          <View style={{ borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 18 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary }}>Hold Requested</Text>
            <Text style={{ marginTop: 8, fontSize: 13, color: colors.textSecondary }}>
              Soft hold requested for {unitHoldConfirmed}. Awaiting Head Office approval (2-hour window).
            </Text>
            <Pressable onPress={() => setUnitHoldConfirmed(null)} style={{ marginTop: 16, minHeight: 46, borderRadius: 12, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#FFFFFF' }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <TokenDepositDrawer visible={isTokenDepositVisible} onClose={() => setIsTokenDepositVisible(false)} onSubmit={() => setIsTokenDepositVisible(false)} />

      <KpiGuidelinesModal
        visible={isKpiGuidelinesVisible}
        onClose={() => setIsKpiGuidelinesVisible(false)}
        onNavigateWallet={() => handleAction(onNavigateWallet)}
      />

      <Modal visible={isBrochureVisible} transparent animationType="fade" onRequestClose={() => setIsBrochureVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.overlay, padding: 24 }}>
          <View style={{ borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 18 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary }}>Send Project Brochure</Text>
            <Text style={{ marginTop: 8, fontSize: 13, color: colors.textSecondary }}>
              Choose a lead from the dialer queue to send the latest brochure and price list via WhatsApp.
            </Text>
            <Pressable onPress={() => setIsBrochureVisible(false)} style={{ marginTop: 16, minHeight: 46, borderRadius: 12, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#FFFFFF' }}>Got It</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={isRoleModalVisible} transparent animationType="slide" onRequestClose={() => setIsRoleModalVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay }}>
          <View style={{ maxHeight: '75%', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>Role Sandbox</Text>
            <ScrollView style={{ marginTop: 12 }} showsVerticalScrollIndicator={false}>
              {EMPLOYEE_ROLE_ORDER.map((candidateRole: AgentRole) => {
                const candidateProfile = getEmployeeRoleProfile(candidateRole);
                const isSelected = candidateRole === role;
                return (
                  <Pressable
                    key={candidateRole}
                    onPress={() => {
                      switchRole(candidateRole);
                      setIsRoleModalVisible(false);
                    }}
                    style={{ marginBottom: 10, borderRadius: 14, borderWidth: 1, borderColor: isSelected ? colors.accent : colors.border, backgroundColor: isSelected ? 'rgba(56,189,248,0.10)' : colors.subpanel, padding: 14 }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary }}>{candidateProfile.label}</Text>
                    <Text style={{ marginTop: 4, fontSize: 12, color: colors.textSecondary }}>
                      {candidateProfile.monthlyTargetHours}h target · ৳{candidateProfile.baseSalary.toLocaleString('en-BD')} base · {Math.round(candidateProfile.closingGateRatio * 100)}% gate
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={isTelephonyModalVisible} transparent animationType="slide" onRequestClose={() => setIsTelephonyModalVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay }}>
          <View style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 20, paddingBottom: 32 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>Telephony Line Routing</Text>
            <Text style={{ marginTop: 6, fontSize: 12, color: colors.textSecondary }}>Agent line: {agentPhone || 'Not set'}</Text>
            <View style={{ marginTop: 14, gap: 10 }}>
              {([
                { value: 'IPTSP_BRIDGE' as CallProviderMode, label: 'Licensed IPTSP Bridge (recommended)', description: 'BTRC-compliant 096xx PBX bridge. Masked identity protected end to end.' },
                { value: 'DIRECT_NATIVE_DIALER' as CallProviderMode, label: 'Direct Native Dialer', description: 'Opens the device dialer app directly.' },
              ]).map((option) => {
                const isSelected = callProviderMode === option.value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setCallProviderMode(option.value)}
                    style={{ borderRadius: 14, borderWidth: 1, borderColor: isSelected ? colors.accent : colors.border, backgroundColor: isSelected ? 'rgba(56,189,248,0.10)' : colors.subpanel, padding: 14 }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary }}>{option.label}</Text>
                    <Text style={{ marginTop: 4, fontSize: 12, color: colors.textSecondary }}>{option.description}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Pressable onPress={() => setIsTelephonyModalVisible(false)} style={{ marginTop: 16, minHeight: 46, borderRadius: 12, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#FFFFFF' }}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};
