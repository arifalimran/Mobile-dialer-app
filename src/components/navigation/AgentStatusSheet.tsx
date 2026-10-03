import React, { useEffect, useState } from 'react';
import { Modal, Pressable, Text, TouchableWithoutFeedback, View } from 'react-native';
import { LogOut, MapPin, Plus, Settings, Target } from 'lucide-react-native';

import { useAppTheme } from '../../theme/ThemeContext';
import { useAuthStore } from '../../features/auth/hooks/useAuthStore';
import type { AgentRole } from '../../features/auth/authTypes';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** Bangladesh Standard Time is a fixed UTC+6 offset with no DST. */
function toBstParts(date: Date) {
  const utcMs = date.getTime() + date.getTimezoneOffset() * 60000;
  const bst = new Date(utcMs + 6 * 60 * 60 * 1000);
  return {
    weekday: WEEKDAYS[bst.getUTCDay()],
    day: bst.getUTCDate(),
    month: MONTHS[bst.getUTCMonth()],
    year: bst.getUTCFullYear(),
    hours: bst.getUTCHours(),
    minutes: bst.getUTCMinutes(),
    seconds: bst.getUTCSeconds(),
  };
}

function formatBstNow(date: Date): string {
  const parts = toBstParts(date);
  const hour12 = parts.hours % 12 === 0 ? 12 : parts.hours % 12;
  const ampm = parts.hours >= 12 ? 'PM' : 'AM';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${parts.weekday}, ${pad(parts.day)} ${parts.month} ${parts.year} • ${pad(hour12)}:${pad(parts.minutes)}:${pad(parts.seconds)} ${ampm}`;
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export type ShiftStatus = 'ON_DUTY' | 'BREAK' | 'LOCKED';

const SHIFT_PILL_STYLES: Record<ShiftStatus, { container: string; text: string; label: string }> = {
  ON_DUTY: { container: 'border-emerald-700 bg-emerald-950', text: 'text-emerald-400', label: '🟢 On-Duty' },
  BREAK: { container: 'border-amber-700 bg-amber-950', text: 'text-amber-400', label: '🟡 Break' },
  LOCKED: { container: 'border-rose-700 bg-rose-950', text: 'text-rose-400', label: '🔴 Shift Locked' },
};

interface AgentStatusSheetProps {
  visible: boolean;
  agentName: string;
  corporateSim: string;
  role: AgentRole;
  shiftStatus: ShiftStatus;
  hasKpiRevisionAlert: boolean;
  onClose: () => void;
  onNavigateKpi: () => void;
  onNavigateSiteVisits: () => void;
  onAddSelfSourcedLead: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
}

/**
 * Module 1: the expandable sheet triggered by tapping the header avatar.
 * Consolidates everything that used to clutter the persistent top row (live
 * BST clock, session ticker, corporate SIM, shift status) plus the
 * remaining destinations that aren't one of the 4 bottom tabs or the bell
 * icon (KPI, Site Visits, Add Self-Sourced Lead, Line Settings, Logout) —
 * this replaces the old `AgentDrawerMenu` hamburger drawer entirely.
 */
export const AgentStatusSheet: React.FC<AgentStatusSheetProps> = ({
  visible,
  agentName,
  corporateSim,
  role,
  shiftStatus,
  hasKpiRevisionAlert,
  onClose,
  onNavigateKpi,
  onNavigateSiteVisits,
  onAddSelfSourcedLead,
  onOpenSettings,
  onLogout,
}) => {
  const { colors } = useAppTheme();
  const loginAt = useAuthStore((state) => state.loginAt);
  const [now, setNow] = useState(Date.now());
  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [visible]);

  const shiftPill = SHIFT_PILL_STYLES[shiftStatus];
  const canSeeSiteVisits = role === 'FIELD_CLOSER' || role === 'ADMIN';

  const handleAction = (action: () => void) => {
    onClose();
    action();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay }}>
          <TouchableWithoutFeedback>
            <View style={{ borderTopWidth: 1, borderTopColor: colors.border, borderRadius: 24, backgroundColor: colors.card, padding: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ flex: 1, fontSize: 18, fontWeight: '800', color: colors.textPrimary }} numberOfLines={1}>
                  {agentName || 'Unregistered Agent'}
                </Text>
                <View style={{ borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel, paddingHorizontal: 12, paddingVertical: 6 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.accent }}>{role.replace('_', ' ')}</Text>
                </View>
              </View>
              <Text style={{ marginTop: 4, fontFamily: 'monospace', fontSize: 11, letterSpacing: 0.8, color: colors.textSecondary }}>{corporateSim}</Text>

              <View style={{ marginTop: 16, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel, padding: 16 }}>
                <Text style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: 0.8, color: colors.textSecondary }}>{formatBstNow(new Date(now))}</Text>
                <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontFamily: 'monospace', fontSize: 13, letterSpacing: 0.8, color: colors.textPrimary }}>
                    ⏱ Session: {formatElapsed(loginAt ? now - loginAt : 0)}
                  </Text>
                  <View style={{ borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, paddingHorizontal: 8, paddingVertical: 2 }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: shiftPill.text === 'text-emerald-400' ? colors.success : shiftPill.text === 'text-amber-400' ? colors.warning : colors.danger }}>{shiftPill.label}</Text>
                  </View>
                </View>
              </View>

              <View style={{ marginTop: 16 }}>
                <Pressable
                  onPress={() => handleAction(onNavigateKpi)}
                  style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 12, paddingHorizontal: 4 }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Target size={18} color={colors.textSecondary} />
                    <Text style={{ marginLeft: 12, fontSize: 14, color: colors.textPrimary }}>My KPI &amp; Evaluation Grounds</Text>
                  </View>
                  {hasKpiRevisionAlert && <View style={{ height: 10, width: 10, borderRadius: 999, backgroundColor: colors.warning }} />}
                </Pressable>

                <Pressable
                  onPress={() => handleAction(onAddSelfSourcedLead)}
                  style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4 }}
                >
                  <Plus size={18} color={colors.textSecondary} />
                  <Text style={{ marginLeft: 12, fontSize: 14, color: colors.textPrimary }}>Add Self-Sourced Lead</Text>
                </Pressable>

                {canSeeSiteVisits && (
                  <Pressable
                    onPress={() => handleAction(onNavigateSiteVisits)}
                    style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4 }}
                  >
                    <MapPin size={18} color={colors.textSecondary} />
                    <Text style={{ marginLeft: 12, fontSize: 14, color: colors.textPrimary }}>Site Visits &amp; GPS Check-In</Text>
                  </Pressable>
                )}

                <Pressable
                  onPress={() => handleAction(onOpenSettings)}
                  style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4 }}
                >
                  <Settings size={18} color={colors.textSecondary} />
                  <Text style={{ marginLeft: 12, fontSize: 14, color: colors.textPrimary }}>Line Settings</Text>
                </Pressable>

                <Pressable
                  onPress={() => setIsConfirmingLogout(true)}
                  style={{ marginTop: 8, minHeight: 48, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border, borderRadius: 12, paddingHorizontal: 4, paddingTop: 12 }}
                >
                  <LogOut size={18} color={colors.danger} />
                  <Text style={{ marginLeft: 12, fontSize: 14, fontWeight: '700', color: colors.danger }}>End Shift &amp; Logout</Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>

      {isConfirmingLogout && (
        <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 32 }}>
          <View style={{ width: '100%', borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>End your shift?</Text>
            <Text style={{ marginTop: 8, fontSize: 14, color: colors.textSecondary }}>
              You will be signed out and your session timer will reset.
            </Text>
            <View style={{ marginTop: 16, flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={() => setIsConfirmingLogout(false)}
                style={{ minHeight: 48, flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textSecondary }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setIsConfirmingLogout(false);
                  onClose();
                  onLogout();
                }}
                style={{ minHeight: 48, flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: colors.danger }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFFFFF' }}>End Shift</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </Modal>
  );
};
