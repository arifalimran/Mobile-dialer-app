import React, { useEffect, useState } from 'react';
import { Modal, Pressable, Text, TouchableWithoutFeedback, View } from 'react-native';
import { LogOut, MapPin, Plus, Settings, Target } from 'lucide-react-native';

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
        <View className="flex-1 justify-end bg-black/60">
          <TouchableWithoutFeedback>
            <View className="rounded-t-3xl border-t border-white/10 bg-slate-950 p-5">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-bold tracking-tight text-white" numberOfLines={1}>
                  {agentName || 'Unregistered Agent'}
                </Text>
                <View className="rounded-full border border-sky-800 bg-sky-950 px-3 py-1">
                  <Text className="text-xs font-semibold text-sky-400">{role.replace('_', ' ')}</Text>
                </View>
              </View>
              <Text className="mt-1 font-mono text-xs tracking-wide text-slate-500">{corporateSim}</Text>

              <View className="mt-4 rounded-2xl border border-white/10 bg-slate-900 p-4">
                <Text className="font-mono text-xs tracking-wide text-slate-400">{formatBstNow(new Date(now))}</Text>
                <View className="mt-2 flex-row items-center justify-between">
                  <Text className="font-mono text-sm tracking-wide text-slate-300">
                    ⏱ Session: {formatElapsed(loginAt ? now - loginAt : 0)}
                  </Text>
                  <View className={`rounded-full border px-2 py-0.5 ${shiftPill.container}`}>
                    <Text className={`text-[10px] font-semibold ${shiftPill.text}`}>{shiftPill.label}</Text>
                  </View>
                </View>
              </View>

              <View className="mt-4">
                <Pressable
                  onPress={() => handleAction(onNavigateKpi)}
                  className="min-h-[48px] flex-row items-center justify-between rounded-xl px-1"
                >
                  <View className="flex-row items-center">
                    <Target size={18} color="#94a3b8" />
                    <Text className="ml-3 text-sm text-slate-200">My KPI &amp; Evaluation Grounds</Text>
                  </View>
                  {hasKpiRevisionAlert && <View className="h-2.5 w-2.5 rounded-full bg-amber-500" />}
                </Pressable>

                <Pressable
                  onPress={() => handleAction(onAddSelfSourcedLead)}
                  className="min-h-[48px] flex-row items-center px-1"
                >
                  <Plus size={18} color="#94a3b8" />
                  <Text className="ml-3 text-sm text-slate-200">Add Self-Sourced Lead</Text>
                </Pressable>

                {canSeeSiteVisits && (
                  <Pressable
                    onPress={() => handleAction(onNavigateSiteVisits)}
                    className="min-h-[48px] flex-row items-center px-1"
                  >
                    <MapPin size={18} color="#94a3b8" />
                    <Text className="ml-3 text-sm text-slate-200">Site Visits &amp; GPS Check-In</Text>
                  </Pressable>
                )}

                <Pressable
                  onPress={() => handleAction(onOpenSettings)}
                  className="min-h-[48px] flex-row items-center px-1"
                >
                  <Settings size={18} color="#94a3b8" />
                  <Text className="ml-3 text-sm text-slate-200">Line Settings</Text>
                </Pressable>

                <Pressable
                  onPress={() => setIsConfirmingLogout(true)}
                  className="mt-2 min-h-[48px] flex-row items-center rounded-xl border-t border-white/10 px-1 pt-3"
                >
                  <LogOut size={18} color="#fb7185" />
                  <Text className="ml-3 text-sm font-semibold text-rose-400">End Shift &amp; Logout</Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>

      {isConfirmingLogout && (
        <View className="absolute inset-0 items-center justify-center bg-black/70 px-8">
          <View className="w-full rounded-2xl border border-white/10 bg-slate-950 p-5">
            <Text className="text-base font-semibold text-white">End your shift?</Text>
            <Text className="mt-2 text-sm text-slate-400">
              You will be signed out and your session timer will reset.
            </Text>
            <View className="mt-4 flex-row gap-3">
              <Pressable
                onPress={() => setIsConfirmingLogout(false)}
                className="min-h-[48px] flex-1 items-center justify-center rounded-xl border border-white/10 bg-slate-900"
              >
                <Text className="text-sm font-semibold text-slate-300">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setIsConfirmingLogout(false);
                  onClose();
                  onLogout();
                }}
                className="min-h-[48px] flex-1 items-center justify-center rounded-xl bg-rose-600"
              >
                <Text className="text-sm font-semibold text-white">End Shift</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </Modal>
  );
};
