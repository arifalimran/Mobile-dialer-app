import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { useAppTheme } from '../../../theme/ThemeContext';
import { useCallQueue } from '../../calling/hooks/useCallQueue';
import { MOCK_CALLBACKS } from '../../callbacks/constants/mockCallbacks';
import { KPI_TASKS, PASS_MARK_POINTS, FIXED_BASE_SALARY, calculateSummary } from '../../wallet/utils/calculator';
import { KpiGuidelinesModal } from '../../wallet/components/KpiGuidelinesModal';
import { InventoryRulesModal } from '../../inventory/components/InventoryRulesModal';
import { QuickUnitHoldModal } from '../../inventory/components/QuickUnitHoldModal';
import { TokenDepositDrawer } from '../../finance/components/TokenDepositDrawer';
import { portfolioHoldQuota, portfolioTotals } from '../../inventory/data/portfolioSummary';
import type { EmployeeStatus } from '../../auth/authTypes';
import type { AppScreen } from '../../../types/navigation';

interface DashboardScreenProps {
  agentName: string;
  corporateSim: string;
  tierLabel: string;
  employeeStatus: EmployeeStatus;
  onNavigate: (screen: AppScreen) => void;
  onOpenAddLead: () => void;
}

/** Mock-only: no live calling-activity-by-day API exists yet. Oldest to newest, ending today. */
const MOCK_WEEKLY_DIALS_LAST_7_DAYS = [22, 30, 28, 31, 24, 29, 14];
const WEEKLY_DIAL_BAR_SCALE = 35;

const formatTaka = (value: number) => `৳${new Intl.NumberFormat('en-BD', { maximumFractionDigits: 0 }).format(value)}`;

function getLast7DayLabels(): string[] {
  const today = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const offsetFromToday = 6 - index;
    if (offsetFromToday === 0) return 'Today';
    const date = new Date(today);
    date.setDate(today.getDate() - offsetFromToday);
    return date.toLocaleDateString('en-GB', { weekday: 'short' });
  });
}

const LAUNCHPAD_CHIP_STYLE = { minHeight: 38, borderRadius: 8, borderWidth: 1 } as const;

export function DashboardScreen({ agentName, corporateSim, tierLabel, employeeStatus, onNavigate, onOpenAddLead }: DashboardScreenProps) {
  const { colors } = useAppTheme();
  const { dailyCompletedCount, dailyTarget, activeBatchNumber, totalBatches } = useCallQueue();
  const [isKpiModalVisible, setIsKpiModalVisible] = useState(false);
  const [isInventoryRulesVisible, setIsInventoryRulesVisible] = useState(false);
  const [isQuickHoldVisible, setIsQuickHoldVisible] = useState(false);
  const [isCollectTkVisible, setIsCollectTkVisible] = useState(false);

  const callbackSummary = useMemo(() => {
    const dueToday = MOCK_CALLBACKS.filter((callback) => callback.status === 'TODAY').length;
    const overdue = MOCK_CALLBACKS.filter((callback) => callback.status === 'OVERDUE').length;
    return { dueToday, overdue };
  }, []);

  const summary = useMemo(() => calculateSummary(), []);
  const workHoursTask = KPI_TASKS.find((task) => task.id === 'work_hours');
  const activeDaysTask = KPI_TASKS.find((task) => task.id === 'active_days');
  const workHoursCurrent = workHoursTask?.current ?? 0;
  const workHoursTarget = Math.max(1, workHoursTask?.target ?? 1);
  const hoursProgress = Math.min(100, (workHoursCurrent / workHoursTarget) * 100);
  const daysWorked = activeDaysTask?.current ?? 0;
  const daysTarget = activeDaysTask?.target ?? 30;

  const dayLabels = useMemo(getLast7DayLabels, []);

  const showComingSoonAlert = (message: string) => Alert.alert('Coming Soon', message);

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 36 }}>
        <View style={{ borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 16 }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: colors.textPrimary }} numberOfLines={1}>
            {agentName} • <Text selectable={false}>{corporateSim}</Text> • {tierLabel} [{employeeStatus}]
          </Text>
          <Text style={{ marginTop: 6, fontSize: 12, color: colors.textSecondary }} numberOfLines={1}>
            {formatTaka(summary.clearedPayout)} Earned To Date • {summary.totalScore} / {PASS_MARK_POINTS} Salary Points • {portfolioHoldQuota.activeHolds} Active Holds
          </Text>
        </View>

        <View style={{ marginTop: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {[
            { emoji: '📞', label: 'Dial Batch', onPress: () => onNavigate('DIALER') },
            { emoji: '➕', label: 'Add Lead', onPress: onOpenAddLead },
            { emoji: '📅', label: 'Callbacks', onPress: () => onNavigate('CALLBACKS') },
            { emoji: '🏢', label: 'Holdings', onPress: () => onNavigate('INVENTORY') },
            { emoji: '💵', label: 'Collect Tk', onPress: () => setIsCollectTkVisible(true) },
            { emoji: '⏱️', label: 'Log Shift', onPress: () => onNavigate('SHIFTS') },
            { emoji: '📊', label: 'KPI Policy', onPress: () => setIsKpiModalVisible(true) },
            { emoji: '🏷️', label: 'Quick Hold', onPress: () => setIsQuickHoldVisible(true) },
          ].map((chip) => (
            <Pressable
              key={chip.label}
              onPress={chip.onPress}
              hitSlop={8}
              style={{
                ...LAUNCHPAD_CHIP_STYLE,
                width: '23.5%',
                borderColor: colors.border,
                backgroundColor: colors.card,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' }} numberOfLines={1}>
                {chip.emoji} {chip.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={{ marginTop: 18, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 16 }}>
          <Text style={{ fontSize: 11, fontWeight: '800', letterSpacing: 0.8, color: colors.brassAccent, textTransform: 'uppercase' }}>
            Weekly Calling Activity (Last 7 Days)
          </Text>

          <View style={{ marginTop: 14, height: 90, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            {MOCK_WEEKLY_DIALS_LAST_7_DAYS.map((calls, index) => {
              const isToday = index === MOCK_WEEKLY_DIALS_LAST_7_DAYS.length - 1;
              const barHeightPercent = Math.min(100, (calls / WEEKLY_DIAL_BAR_SCALE) * 100);
              return (
                <View key={dayLabels[index]} style={{ flex: 1, alignItems: 'center' }}>
                  <View style={{ flex: 1, width: 14, justifyContent: 'flex-end' }}>
                    <View
                      style={{
                        width: '100%',
                        height: `${barHeightPercent}%`,
                        borderRadius: 4,
                        backgroundColor: isToday ? colors.brassAccent : 'rgba(216,162,67,0.35)',
                      }}
                    />
                  </View>
                  <Text style={{ marginTop: 6, fontSize: 9, fontWeight: isToday ? '800' : '500', color: isToday ? colors.brassAccent : colors.textSecondary }}>
                    {dayLabels[index]}
                  </Text>
                </View>
              );
            })}
          </View>

          <Text style={{ marginTop: 12, fontSize: 11, color: colors.textSecondary }}>
            Today&apos;s Intake: {dailyCompletedCount} / {dailyTarget} Dials Completed (Batch {activeBatchNumber}/{totalBatches} Active)
          </Text>
        </View>

        <View style={{ marginTop: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          <View style={{ width: '48%', borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 12 }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: colors.textPrimary }}>Scheduled Callbacks</Text>
            <Text style={{ marginTop: 6, fontSize: 11, color: colors.textSecondary }}>
              {callbackSummary.dueToday} Due Today • {callbackSummary.overdue} Overdue
            </Text>
            <Text style={{ marginTop: 4, fontSize: 10, color: callbackSummary.overdue === 0 ? colors.success : colors.danger }}>
              {callbackSummary.overdue === 0 ? '🟢 Normal SLA' : '🔴 SLA Breach'}
            </Text>
          </View>

          <View style={{ width: '48%', borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 12 }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: colors.textPrimary }}>Monthly Shift Work</Text>
            <Text style={{ marginTop: 6, fontSize: 11, color: colors.textSecondary }}>
              {workHoursCurrent.toFixed(1)} / {workHoursTarget.toFixed(1)} hrs ({daysWorked} / {daysTarget} Days Clocked)
            </Text>
            <View style={{ marginTop: 8, height: 6, borderRadius: 999, overflow: 'hidden', backgroundColor: colors.subpanel }}>
              <View style={{ height: '100%', width: `${hoursProgress}%`, backgroundColor: colors.success }} />
            </View>
          </View>

          <View style={{ width: '48%', borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 12 }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: colors.textPrimary }}>Portfolio Status</Text>
            <Text style={{ marginTop: 6, fontSize: 11, color: colors.textSecondary }}>
              {portfolioTotals.totalUnits} Units Active • {portfolioTotals.developmentsCount} Developments • {portfolioHoldQuota.activeHolds} Holds Placed
            </Text>
          </View>

          <View style={{ width: '48%', borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 12 }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: colors.textPrimary }}>Salary Pass Score</Text>
            <Text style={{ marginTop: 6, fontSize: 11, color: colors.textSecondary }}>
              {summary.totalScore} / {PASS_MARK_POINTS} Points ({formatTaka(FIXED_BASE_SALARY)} Base Unlocks at {PASS_MARK_POINTS} pts)
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 18 }}>
          <Text style={{ fontSize: 11, fontWeight: '800', letterSpacing: 0.8, color: colors.brassAccent, textTransform: 'uppercase' }}>
            🚀 New Projects &amp; Coming Soon Pipeline
          </Text>

          <View style={{ marginTop: 10, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary }}>🌟 Gulshan Prime Suites (Real Estate)</Text>
            <View
              style={{
                marginTop: 8,
                alignSelf: 'flex-start',
                borderRadius: 999,
                borderWidth: 1,
                borderColor: '#F59E0B',
                backgroundColor: 'rgba(245,158,11,0.12)',
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '800', color: '#F59E0B' }}>⏳ COMING SOON - PRE-LAUNCH</Text>
            </View>
            <Text style={{ marginTop: 8, fontSize: 12, lineHeight: 18, color: colors.textSecondary }}>
              18-storey luxury studio and duplex suites. Pre-launch registrations opening next month.
            </Text>
            <View style={{ marginTop: 12, flexDirection: 'row', gap: 8 }}>
              <Pressable
                onPress={() => showComingSoonAlert('Project teaser media is not available in this mock build.')}
                style={{ flex: 1, minHeight: 44, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textPrimary }} numberOfLines={1}>📄 View Project Teaser</Text>
              </Pressable>
              <Pressable
                onPress={() => showComingSoonAlert('Client interest registration will be available once the backend is connected.')}
                style={{ flex: 1, minHeight: 44, borderRadius: 10, backgroundColor: colors.brassAccent, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#0F172A' }} numberOfLines={1}>🔔 Register Client Interest</Text>
              </Pressable>
            </View>
          </View>

          <View style={{ marginTop: 12, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary }}>🌿 Padma Eco Park (Land Share)</Text>
            <View
              style={{
                marginTop: 8,
                alignSelf: 'flex-start',
                borderRadius: 999,
                borderWidth: 1,
                borderColor: '#10B981',
                backgroundColor: 'rgba(16,185,129,0.12)',
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '800', color: '#10B981' }}>🚜 SITE DEVELOPMENT</Text>
            </View>
            <Text style={{ marginTop: 8, fontSize: 12, lineHeight: 18, color: colors.textSecondary }}>
              Waterfront land share plots near Mawa Expressway. 12 of 30 initial shares booked.
            </Text>
            <View style={{ marginTop: 12, flexDirection: 'row', gap: 8 }}>
              <Pressable
                onPress={() => showComingSoonAlert('The layout plan viewer is not available in this mock build.')}
                style={{ flex: 1, minHeight: 44, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textPrimary }} numberOfLines={1}>🗺️ View Layout Plan</Text>
              </Pressable>
              <Pressable
                onPress={() => showComingSoonAlert('Real holds need the 3-hold quota check and lead attachment, which come with the backend.')}
                style={{ flex: 1, minHeight: 44, borderRadius: 10, backgroundColor: colors.brassAccent, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#0F172A' }} numberOfLines={1}>🏷️ Place Pre-Hold</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      <KpiGuidelinesModal visible={isKpiModalVisible} onClose={() => setIsKpiModalVisible(false)} />
      <InventoryRulesModal visible={isInventoryRulesVisible} onClose={() => setIsInventoryRulesVisible(false)} />
      <QuickUnitHoldModal visible={isQuickHoldVisible} onClose={() => setIsQuickHoldVisible(false)} />
      <TokenDepositDrawer visible={isCollectTkVisible} onClose={() => setIsCollectTkVisible(false)} onSubmit={() => setIsCollectTkVisible(false)} />
    </View>
  );
}
