import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import {
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

const BREAK_OPTIONS_MIN = [15, 30, 60, 120];
const BREAK_OPTION_LABELS: Record<number, string> = { 15: '15m', 30: '30m', 60: '1h', 120: '2h' };

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
  const employeeStatus = useAuthStore((state) => state.employeeStatus);
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
  const [isBreakOptionsVisible, setIsBreakOptionsVisible] = useState(false);
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

  const handleSignOut = () => {
    if (dutyStatus !== 'OFF_DUTY') {
      endDutySession();
    }
    useAuthStore.getState().logout();
    onClose();
    onLogout();
  };

  const quickActions = [
    { key: 'add-lead', label: 'Add New Custom Lead', Icon: Plus, onPress: () => handleAction(onOpenAddLead) },
    { key: 'site-visit', label: 'Book Site Visit / Field Inspection', Icon: MapPin, onPress: () => setIsSiteVisitVisible(true) },
    { key: 'unit-hold', label: 'Quick Unit Hold Request', Icon: Tag, onPress: () => setIsUnitHoldVisible(true) },
    { key: 'token-deposit', label: 'Submit Advance Token / Payment', Icon: Wallet, onPress: () => setIsTokenDepositVisible(true) },
    { key: 'attendance', label: 'My Attendance Ledger & Shift History', Icon: Clock3, onPress: () => handleAction(openAttendanceModal) },
    { key: 'brochure', label: 'Send Project Brochure & Price List', Icon: FileText, onPress: () => setIsBrochureVisible(true) },
  ];

  const agentInitial = (agentProfile?.legalName ?? 'Agent').trim().charAt(0).toUpperCase() || 'A';

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay }}>
          <TouchableWithoutFeedback>
            <View style={{ maxHeight: '88%', borderTopWidth: 1, borderTopColor: colors.border, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: colors.card }}>
              <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
                {/* 1. Agent header (~64px): avatar + name/SIM/probation cluster, close button inline to save a row. */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                    <Pressable
                      onPress={() => setIsAvatarMenuVisible(true)}
                      hitSlop={2}
                      style={{ height: 44, width: 44, borderRadius: 22, backgroundColor: colors.subpanel, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}
                    >
                      <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textSecondary }}>{agentInitial}</Text>
                    </Pressable>

                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: '800', color: colors.textPrimary, flexShrink: 1 }}>
                          {agentProfile?.legalName ?? 'Agent'}
                        </Text>
                        {employeeStatus === 'PROBATION' && (
                          <View style={{ marginLeft: 6, borderRadius: 999, backgroundColor: 'rgba(245,158,11,0.16)', paddingHorizontal: 6, paddingVertical: 1 }}>
                            <Text style={{ fontSize: 9, fontWeight: '800', color: colors.warning }}>PROBATION</Text>
                          </View>
                        )}
                      </View>
                      <Text selectable={false} numberOfLines={1} style={{ marginTop: 2, fontFamily: 'monospace', fontSize: 11, color: colors.textSecondary }}>
                        {agentProfile?.corporateSim ?? 'Unassigned SIM'}
                      </Text>
                    </View>
                  </View>

                  <Pressable
                    onPress={onClose}
                    hitSlop={8}
                    style={{ height: 32, width: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 999, backgroundColor: colors.subpanel }}
                  >
                    <X size={14} color={colors.textPrimary} />
                  </Pressable>
                </View>

                {/* 2. Duty & break (~90px worst case, break sub-pills expanded). */}
                <View style={{ marginTop: 6, padding: 8, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ fontSize: 10, fontWeight: '800', letterSpacing: 0.6, color: colors.textSecondary }}>DUTY &amp; BREAK</Text>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: statusMeta.color }}>{statusMeta.label}</Text>
                  </View>

                  {isShiftLocked ? (
                    <Text style={{ fontSize: 11, color: colors.danger }}>
                      Locked until {lockedUntil ? new Date(lockedUntil).toLocaleString() : '—'}.
                    </Text>
                  ) : (
                    <>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <Pressable
                          onPress={handleGoOnDuty}
                          disabled={dutyStatus === 'ON_DUTY'}
                          hitSlop={7}
                          style={{
                            flex: 1,
                            height: 34,
                            paddingVertical: 4,
                            paddingHorizontal: 8,
                            borderRadius: 999,
                            borderWidth: 1,
                            borderColor: dutyStatus === 'ON_DUTY' ? colors.success : colors.border,
                            backgroundColor: dutyStatus === 'ON_DUTY' ? 'rgba(16,185,129,0.14)' : 'transparent',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: dutyStatus === 'ON_DUTY' ? 0.6 : 1,
                          }}
                        >
                          <Text numberOfLines={1} style={{ fontSize: 11, fontWeight: '800', color: dutyStatus === 'ON_DUTY' ? colors.success : colors.textPrimary }}>On Duty</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => setIsBreakOptionsVisible((current) => !current)}
                          disabled={dutyStatus !== 'ON_DUTY'}
                          hitSlop={7}
                          style={{
                            flex: 1,
                            height: 34,
                            paddingVertical: 4,
                            paddingHorizontal: 8,
                            borderRadius: 999,
                            borderWidth: 1,
                            borderColor: colors.border,
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: dutyStatus !== 'ON_DUTY' ? 0.4 : 1,
                          }}
                        >
                          <Text numberOfLines={1} style={{ fontSize: 11, fontWeight: '800', color: colors.textPrimary }}>Take Break</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => setIsOffDutyConfirmVisible(true)}
                          disabled={dutyStatus === 'OFF_DUTY'}
                          hitSlop={7}
                          style={{
                            flex: 1,
                            height: 34,
                            paddingVertical: 4,
                            paddingHorizontal: 8,
                            borderRadius: 999,
                            borderWidth: 1,
                            borderColor: colors.danger,
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: dutyStatus === 'OFF_DUTY' ? 0.4 : 1,
                          }}
                        >
                          <Text numberOfLines={1} style={{ fontSize: 11, fontWeight: '800', color: colors.danger }}>Off Duty</Text>
                        </Pressable>
                      </View>

                      {isOnBreak ? (
                        <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Coffee size={12} color={colors.warning} />
                            <Text style={{ marginLeft: 6, fontSize: 11, color: colors.warning }}>{Math.ceil(breakRemainingMs / 60000)}m left on break</Text>
                          </View>
                          <Pressable onPress={endBreak} hitSlop={10} style={{ height: 28, paddingVertical: 2, paddingHorizontal: 6, borderRadius: 999, borderWidth: 1, borderColor: colors.warning, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 10, fontWeight: '800', color: colors.warning }}>End Break</Text>
                          </Pressable>
                        </View>
                      ) : (
                        isBreakOptionsVisible && (
                          <View style={{ marginTop: 6, flexDirection: 'row', gap: 6 }}>
                            {BREAK_OPTIONS_MIN.map((minutes) => (
                              <Pressable
                                key={minutes}
                                onPress={() => {
                                  startBreak(minutes);
                                  setIsBreakOptionsVisible(false);
                                }}
                                hitSlop={10}
                                style={{ flex: 1, height: 28, paddingVertical: 2, paddingHorizontal: 6, borderRadius: 999, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}
                              >
                                <Text style={{ fontSize: 10, fontWeight: '800', color: colors.textPrimary }}>{BREAK_OPTION_LABELS[minutes]}</Text>
                              </Pressable>
                            ))}
                          </View>
                        )
                      )}
                    </>
                  )}
                </View>

                {/* 3. Quick actions (~150px): 2-column grid keeps all 6 shortcuts inside the height budget. */}
                <View style={{ marginTop: 10 }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', letterSpacing: 0.6, color: colors.textSecondary, marginBottom: 6 }}>QUICK ACTIONS</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {quickActions.map(({ key, label, Icon, onPress }) => (
                      <Pressable
                        key={key}
                        onPress={onPress}
                        hitSlop={5}
                        style={{ width: '48.5%', minHeight: 38, paddingVertical: 7, paddingHorizontal: 8, borderRadius: 8, backgroundColor: colors.subpanel, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center' }}
                      >
                        <Icon size={16} color={colors.textSecondary} />
                        <Text numberOfLines={1} style={{ marginLeft: 8, fontSize: 12, color: colors.textPrimary, flexShrink: 1 }}>{label}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* 4. Workspace links (~100px for 3 rows: role sandbox, telephony routing, KPI policy). */}
                <View style={{ marginTop: 10 }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', letterSpacing: 0.6, color: colors.textSecondary, marginBottom: 2 }}>WORKSPACE</Text>
                  <Pressable onPress={() => setIsRoleModalVisible(true)} hitSlop={11} style={{ paddingVertical: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Shuffle size={16} color={colors.textSecondary} />
                      <Text numberOfLines={1} style={{ marginLeft: 10, fontSize: 12, color: colors.textPrimary }}>Role Sandbox · {roleProfile.label}</Text>
                    </View>
                    <ChevronRight size={14} color={colors.textSecondary} />
                  </Pressable>

                  <Pressable onPress={() => setIsTelephonyModalVisible(true)} hitSlop={11} style={{ paddingVertical: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Phone size={16} color={colors.textSecondary} />
                      <Text numberOfLines={1} style={{ marginLeft: 10, fontSize: 12, color: colors.textPrimary }}>Telephony Line Routing</Text>
                    </View>
                    <ChevronRight size={14} color={colors.textSecondary} />
                  </Pressable>

                  <Pressable onPress={() => setIsKpiGuidelinesVisible(true)} hitSlop={11} style={{ paddingVertical: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Wallet size={16} color={colors.textSecondary} />
                      <Text numberOfLines={1} style={{ marginLeft: 10, fontSize: 12, color: colors.textPrimary }}>Monthly KPI &amp; Compensation Policy</Text>
                    </View>
                    <ChevronRight size={14} color={colors.textSecondary} />
                  </Pressable>
                </View>

                {/* 5. Sign out (~48px). */}
                <Pressable
                  onPress={handleSignOut}
                  hitSlop={4}
                  style={{ marginTop: 8, height: 40, borderRadius: 8, backgroundColor: colors.danger, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                >
                  <LogOut size={15} color="#FFFFFF" />
                  <Text style={{ marginLeft: 8, fontSize: 13, fontWeight: '800', color: '#FFFFFF' }}>Sign Out / Clock Out</Text>
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
