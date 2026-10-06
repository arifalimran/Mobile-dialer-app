import React, { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { ArrowRight, CalendarClock, ChartNoAxesColumn, Phone, Wallet, Warehouse } from 'lucide-react-native';

import { useAppTheme } from '../../../theme/ThemeContext';
import { useCallQueue } from '../../calling/hooks/useCallQueue';
import { MOCK_CALLBACKS } from '../../callbacks/constants/mockCallbacks';
import { KPI_TASKS, PASS_MARK_POINTS, calculateSummary } from '../../wallet/utils/calculator';
import type { ShiftStatus } from '../../../components/navigation/AgentStatusSheet';

interface DashboardScreenProps {
  agentName: string;
  corporateSim: string;
  shiftStatus: ShiftStatus;
  onNavigateDialer: () => void;
  onNavigateCallbacks: () => void;
  onNavigateInventory: () => void;
  onNavigateWallet: () => void;
}

function getShiftBadge(shiftStatus: ShiftStatus) {
  if (shiftStatus === 'LOCKED') {
    return {
      label: 'Shift Locked',
      color: '#F87171',
      background: 'rgba(248,113,113,0.14)',
    };
  }

  if (shiftStatus === 'BREAK') {
    return {
      label: 'On Break',
      color: '#F59E0B',
      background: 'rgba(245,158,11,0.14)',
    };
  }

  return {
    label: 'Online',
    color: '#10B981',
    background: 'rgba(16,185,129,0.14)',
  };
}

export function DashboardScreen({
  agentName,
  corporateSim,
  shiftStatus,
  onNavigateDialer,
  onNavigateCallbacks,
  onNavigateInventory,
  onNavigateWallet,
}: DashboardScreenProps) {
  const { colors } = useAppTheme();
  const { dailyCompletedCount, dailyTarget } = useCallQueue();

  const callbackSummary = useMemo(() => {
    const dueToday = MOCK_CALLBACKS.filter((callback) => callback.status === 'TODAY').length;
    const overdue = MOCK_CALLBACKS.filter((callback) => callback.status === 'OVERDUE').length;
    return { dueToday, overdue };
  }, []);

  const summary = useMemo(() => calculateSummary(), []);
  const workHoursTask = KPI_TASKS.find((task) => task.id === 'work_hours');
  const workHoursCurrent = workHoursTask?.current ?? 0;
  const workHoursTarget = Math.max(1, workHoursTask?.target ?? 1);
  const shiftBadge = getShiftBadge(shiftStatus);
  const hoursProgress = Math.min(100, (workHoursCurrent / workHoursTarget) * 100);

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 36 }}>
        <View style={{ borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 18 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: colors.textPrimary }}>{agentName}</Text>
              <Text style={{ marginTop: 6, fontSize: 12, fontFamily: 'monospace', color: colors.textSecondary }}>{corporateSim}</Text>
            </View>
            <View style={{ borderRadius: 999, backgroundColor: shiftBadge.background, borderWidth: 1, borderColor: shiftBadge.color, paddingHorizontal: 10, paddingVertical: 6 }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: shiftBadge.color }}>{shiftBadge.label}</Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 18, gap: 12 }}>
          <View style={{ borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Phone size={18} color={colors.accent} />
              <Text style={{ marginLeft: 8, fontSize: 15, fontWeight: '800', color: colors.textPrimary }}>Daily Calls</Text>
            </View>
            <Text style={{ fontSize: 13, fontWeight: '800', color: colors.brassAccent }}>{dailyCompletedCount} / {dailyTarget} Leads Dialed</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <CalendarClock size={18} color={colors.warning} />
                <Text style={{ marginLeft: 8, fontSize: 13, fontWeight: '800', color: colors.textPrimary, flexShrink: 1 }}>Scheduled Callbacks</Text>
              </View>
              <Text style={{ marginTop: 10, fontSize: 12, fontWeight: '700', color: colors.textSecondary }}>
                {callbackSummary.dueToday} Due Today • <Text style={{ color: colors.danger }}>{callbackSummary.overdue} Overdue</Text>
              </Text>
            </View>

            <View style={{ flex: 1, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ChartNoAxesColumn size={18} color={colors.success} />
                <Text style={{ marginLeft: 8, fontSize: 13, fontWeight: '800', color: colors.textPrimary, flexShrink: 1 }}>Monthly Work Hours</Text>
              </View>
              <Text style={{ marginTop: 10, fontSize: 12, fontWeight: '700', color: colors.textSecondary }}>{workHoursCurrent.toFixed(1)} / {workHoursTarget.toFixed(1)} hrs</Text>
              <View style={{ marginTop: 8, height: 8, borderRadius: 999, overflow: 'hidden', backgroundColor: colors.subpanel }}>
                <View style={{ height: '100%', width: `${hoursProgress}%`, backgroundColor: colors.success }} />
              </View>
            </View>
          </View>

          <View style={{ borderRadius: 18, borderWidth: 1, borderColor: summary.isBaseUnlocked ? colors.success : colors.warning, backgroundColor: summary.isBaseUnlocked ? 'rgba(16,185,129,0.14)' : 'rgba(245,158,11,0.14)', padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Wallet size={18} color={summary.isBaseUnlocked ? colors.success : colors.warning} />
              <Text style={{ marginLeft: 8, fontSize: 14, fontWeight: '800', color: colors.textPrimary, flexShrink: 1 }}>
                {summary.isBaseUnlocked ? '🟢 Base Salary Unlocked' : '🟡 Base Salary Locked'} (Score: {summary.totalScore} / {PASS_MARK_POINTS} Points)
              </Text>
            </View>
            <Pressable
              onPress={onNavigateWallet}
              style={{ marginTop: 12, minHeight: 48, borderRadius: 12, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}
            >
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>View Requirements</Text>
              <ArrowRight size={16} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </Pressable>
          </View>
        </View>

        <View style={{ marginTop: 18, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary }}>Action Shortcuts</Text>

          <Pressable
            onPress={onNavigateDialer}
            style={{ marginTop: 14, minHeight: 48, borderRadius: 12, backgroundColor: colors.subpanel, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>Start Next Lead Batch</Text>
            <ArrowRight size={16} color={colors.textSecondary} />
          </Pressable>

          <Pressable
            onPress={onNavigateCallbacks}
            style={{ marginTop: 10, minHeight: 48, borderRadius: 12, backgroundColor: colors.subpanel, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>Review Due Callbacks</Text>
            <ArrowRight size={16} color={colors.textSecondary} />
          </Pressable>

          <Pressable
            onPress={onNavigateInventory}
            style={{ marginTop: 10, minHeight: 48, borderRadius: 12, backgroundColor: colors.subpanel, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Warehouse size={16} color={colors.textSecondary} />
              <Text style={{ marginLeft: 10, fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>Browse Inventory</Text>
            </View>
            <ArrowRight size={16} color={colors.textSecondary} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}