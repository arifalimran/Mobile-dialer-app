import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { useAppTheme } from '../../../theme/ThemeContext';
import { useAuthStore } from '../../auth/hooks/useAuthStore';
import { maskPhoneNumber } from '../../calling/utils/maskPhoneNumber';
import {
  COMMISSION_EARNED,
  COMMISSION_RATE,
  DAILY_ALLOWANCE_RATE,
  DAYS_WORKED,
  KPI_TASKS,
  MOBILE_BILL,
  PASS_MARK_POINTS,
  SITE_VISIT_ALLOWANCE,
  calculateSummary,
  type TaskItem,
} from '../utils/calculator';
import { KpiGuidelinesModal } from '../components/KpiGuidelinesModal';

const AGENT_RAW_PHONE = '+8801711123488';

const formatTaka = (value: number) => `৳ ${new Intl.NumberFormat('en-BD', { maximumFractionDigits: 0 }).format(value)}`;

/** Produces the exact plain-English value string requested for each task row. */
function getTaskValueLabel(task: TaskItem): string {
  switch (task.id) {
    case 'booking_deal':
      return `${task.current} / ${task.target} Deal`;
    case 'work_hours':
      return `${task.current.toFixed(1)} / ${task.target.toFixed(1)} hrs`;
    case 'callbacks':
    case 'new_leads':
    case 'voice_notes':
      return `${task.current}% Done`;
    case 'site_visits':
      return `${task.current} / ${task.target} Visits`;
    case 'installments':
      return `${task.current} / ${task.target} Buyers`;
    case 'active_days':
      return `${task.current} / ${task.target} Days`;
    default:
      return `${task.current} / ${task.target} ${task.unit}`;
  }
}

export function WalletScreen() {
  const { colors } = useAppTheme();
  const agentProfile = useAuthStore((state) => state.agentProfile);
  const [showScores, setShowScores] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [isPolicyVisible, setIsPolicyVisible] = useState(false);
  const summary = useMemo(() => calculateSummary(), []);

  const bookingTask = KPI_TASKS.find((task) => task.id === 'booking_deal');
  const dealsNeeded = bookingTask ? Math.max(0, bookingTask.target - bookingTask.current) : 0;
  const scoreProgressPercent = Math.max(0, Math.min(100, (summary.totalScore / PASS_MARK_POINTS) * 100));

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '800', flexShrink: 1, marginRight: 8 }}>
            🥇 My Level: Gold Caller ({(COMMISSION_RATE * 100).toFixed(1)}% Bonus)
          </Text>
          <View style={{ borderRadius: 999, backgroundColor: 'rgba(245,158,11,0.16)', paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ fontSize: 10, fontWeight: '800', color: colors.warning }}>PROBATION M2</Text>
          </View>
        </View>
        <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }} selectable={false}>
          {agentProfile?.legalName ?? 'Agent'} • {maskPhoneNumber(AGENT_RAW_PHONE)} • Rank #2 in Team
        </Text>

        <View style={{ marginTop: 16, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 16 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Cleared Payout (Ready)</Text>
              <Text style={{ color: '#10B981', fontSize: 24, fontWeight: '800', marginTop: 4 }}>{formatTaka(summary.clearedPayout)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Under Office Check</Text>
              <Text style={{ color: colors.warning, fontSize: 24, fontWeight: '800', marginTop: 4 }}>{formatTaka(summary.underVerification)}</Text>
            </View>
          </View>
          <Text style={{ marginTop: 10, fontSize: 11, color: colors.textSecondary }}>📅 Paid to your account on the 1st &amp; 15th of each month</Text>
        </View>

        <View style={{ marginTop: 14, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary }}>
            {formatTaka(summary.baseSalaryPayable || 12000)} Base Salary: {summary.isBaseUnlocked ? '✅ UNLOCKED' : '🔒 LOCKED'}
          </Text>
          <Text style={{ marginTop: 6, fontSize: 12, color: colors.textSecondary }}>
            Score: {summary.totalScore} / {PASS_MARK_POINTS} Points Needed
            {!summary.isBaseUnlocked && dealsNeeded > 0 ? ` (Need ${dealsNeeded} Booking Deal to Unlock)` : ''}
          </Text>
          <View style={{ marginTop: 10, height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: colors.subpanel }}>
            <View style={{ height: '100%', width: `${scoreProgressPercent}%`, backgroundColor: summary.isBaseUnlocked ? colors.success : colors.warning }} />
          </View>
        </View>

        <Pressable
          onPress={() => setIsPolicyVisible(true)}
          style={{ marginTop: 14, minHeight: 48, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary, flexShrink: 1, marginRight: 8 }}>
            ℹ️ How Salary is Calculated &amp; Official Policy
          </Text>
          <Text style={{ fontSize: 13, fontWeight: '800', color: colors.accent }}>View &gt;</Text>
        </Pressable>

        <View style={{ marginTop: 14, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, overflow: 'hidden' }}>
          <Pressable
            onPress={() => setShowScores((current) => !current)}
            style={{ minHeight: 48, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Text style={{ fontSize: 13, fontWeight: '800', color: colors.textPrimary }}>📊 Tap to See 8 Daily Task Scores</Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>{showScores ? '▲' : '▼'}</Text>
          </Pressable>

          {showScores && (
            <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
              {KPI_TASKS.map((task) => {
                const progress = Math.max(0, Math.min(100, (task.current / task.target) * 100));
                const isGreen = task.pointsEarned > 0;

                return (
                  <Pressable
                    key={task.id}
                    onPress={() => Alert.alert(task.simpleName, task.plainRule)}
                    style={{ marginTop: 10, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel, padding: 12 }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>
                      {task.simpleName} ({task.pointsWorth} pts)
                    </Text>
                    <Text style={{ marginTop: 4, fontSize: 12, color: colors.textSecondary }}>
                      {getTaskValueLabel(task)} ({task.pointsEarned.toFixed(1)} / {task.pointsWorth} pts) {isGreen ? '🟢' : '🔴'}
                    </Text>
                    <View style={{ marginTop: 8, height: 6, borderRadius: 3, overflow: 'hidden', backgroundColor: colors.canvas }}>
                      <View style={{ height: '100%', width: `${progress}%`, backgroundColor: isGreen ? colors.success : colors.danger }} />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <View style={{ marginTop: 14, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, overflow: 'hidden' }}>
          <Pressable
            onPress={() => setShowBreakdown((current) => !current)}
            style={{ minHeight: 48, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Text style={{ fontSize: 13, fontWeight: '800', color: colors.textPrimary }}>🧾 Tap to See Earnings Breakdown</Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>{showBreakdown ? '▲' : '▼'}</Text>
          </Pressable>

          {showBreakdown && (
            <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
                <Text style={{ fontSize: 13, color: colors.textSecondary }}>Base Salary</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>
                  {formatTaka(summary.baseSalaryPayable)} {summary.isBaseUnlocked ? '' : `(Locked — need ${PASS_MARK_POINTS} points)`}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
                <Text style={{ fontSize: 13, color: colors.textSecondary }}>Mobile Phone Bill</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>+{formatTaka(MOBILE_BILL)}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
                <Text style={{ fontSize: 13, color: colors.textSecondary }}>Project Site Visits</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>+{formatTaka(SITE_VISIT_ALLOWANCE)}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
                <Text style={{ fontSize: 13, color: colors.textSecondary }}>Daily Attendance ({DAYS_WORKED} days × {formatTaka(DAILY_ALLOWANCE_RATE)})</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>+{formatTaka(summary.attendanceAllowance)}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
                <Text style={{ fontSize: 13, color: colors.textSecondary }}>Deal Sales Commission ({(COMMISSION_RATE * 100).toFixed(1)}%)</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>+{formatTaka(COMMISSION_EARNED)}</Text>
              </View>

              <View style={{ marginTop: 10, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary }}>Total Cleared Money Ready to Pay</Text>
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#10B981' }}>{formatTaka(summary.clearedPayout)}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <KpiGuidelinesModal visible={isPolicyVisible} onClose={() => setIsPolicyVisible(false)} />
    </View>
  );
}

