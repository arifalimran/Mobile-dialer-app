import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { ArrowUpRight, Crown, ShieldCheck } from 'lucide-react-native';

import { useAppTheme } from '../../../theme/ThemeContext';
import { getEmployeeRoleProfile } from '../../auth/constants/employeeProfiles';
import { useAuthStore } from '../../auth/hooks/useAuthStore';
import { maskPhoneNumber } from '../../calling/utils/maskPhoneNumber';
import {
  MONTHLY_SALARY_GATE_METRICS,
  getSampleMonthlySalaryGate,
  calculateBalances,
  evaluateSalaryGate,
} from '../utils/kpiEngine';

const recentLedgerRows = [
  { id: 'CMP-8842', title: 'Riverside Heights • A-12', amount: 18450, status: 'Cleared' },
  { id: 'CMP-8821', title: 'Skyline North • C-14', amount: 11200, status: 'Under review' },
  { id: 'CMP-8798', title: 'Garden Lane • B-06', amount: 9780, status: 'Scheduled' },
  { id: 'CMP-8755', title: 'Harbor Crest • D-22', amount: 7360, status: 'Cleared' },
];

export function WalletScreen() {
  const { colors } = useAppTheme();
  const role = useAuthStore((state) => state.role);
  const employeeStatus = useAuthStore((state) => state.employeeStatus);
  const roleProfile = getEmployeeRoleProfile(role);
  const [selectedMetricKey, setSelectedMetricKey] = useState<string | null>(null);
  const kpi = useMemo(() => getSampleMonthlySalaryGate(role), [role]);
  const gate = useMemo(() => evaluateSalaryGate(kpi, role), [kpi, role]);
  const balances = useMemo(() => calculateBalances(kpi, role, employeeStatus), [employeeStatus, kpi, role]);
  const selectedMetric = MONTHLY_SALARY_GATE_METRICS.find((metric) => metric.key === selectedMetricKey) ?? null;

  const formatCurrency = (value: number) => `৳${new Intl.NumberFormat('en-BD', { maximumFractionDigits: 0 }).format(value)}`;

  const getMetricProgress = (metricKey: string) => {
    const metric = MONTHLY_SALARY_GATE_METRICS.find((entry) => entry.key === metricKey);
    if (!metric) return 0;

    const current = kpi[metric.key as keyof typeof kpi];
    const numeric = Number(current ?? 0);

    return Math.min(100, (numeric / metric.target) * 100);
  };

  const getMetricValueLabel = (metricKey: string) => {
    const metric = MONTHLY_SALARY_GATE_METRICS.find((entry) => entry.key === metricKey);
    if (!metric) return '0';

    const current = kpi[metric.key as keyof typeof kpi];
    const numeric = Number(current ?? 0);

    if (metric.key === 'workHoursLogged') return `${numeric.toFixed(1)} hrs`;
    if (metric.key === 'callbackAdherence' || metric.key === 'newLeadDialVelocity' || metric.key === 'audioDebriefRate' || metric.key === 'complianceHealth') {
      return `${numeric.toFixed(2)} / ${metric.target.toFixed(2)}`;
    }
    return `${numeric} / ${metric.target}`;
  };

  const getMetricBadge = (metricKey: string) => {
    const metric = MONTHLY_SALARY_GATE_METRICS.find((entry) => entry.key === metricKey);
    if (!metric) return { label: 'In Progress', color: colors.warning };

    const current = kpi[metric.key as keyof typeof kpi];
    const numeric = Number(current ?? 0);
    const isMet = numeric >= metric.target;

    return { label: isMet ? 'Met' : 'In Progress', color: isMet ? colors.success : colors.warning };
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} style={{ flex: 1 }}>
        <Text style={{ color: colors.textPrimary, fontSize: 28, fontWeight: '800' }}>Agent Wallet</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 6 }} selectable={false}>
          {maskPhoneNumber('+8801819123456')} • System payout status
        </Text>

        <View style={{ marginTop: 18, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: '800', letterSpacing: 0.8, color: colors.textSecondary }}>CURRENT TIER</Text>
          <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ backgroundColor: 'rgba(200,155,74,0.16)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 }}>
              <Text style={{ color: colors.brassAccent, fontSize: 16, fontWeight: '800' }}>{roleProfile.tierLabel}</Text>
            </View>
            <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: '800' }}>{(roleProfile.commissionRate * 100).toFixed(2)}% commission</Text>
          </View>
          <Text style={{ marginTop: 10, fontSize: 13, color: colors.textSecondary }}>Tier: {roleProfile.tierLabel} • Active • Rank #2 • {employeeStatus === 'PERMANENT' ? 'Permanent' : 'Probation'}</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
          <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 14 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Cleared Payout</Text>
            <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: '800', marginTop: 8 }}>৳{balances.clearedBalance.toLocaleString('en-BD')}</Text>
            <Text style={{ color: colors.success, marginTop: 6, fontSize: 11, fontWeight: '700' }}>Disbursement on 1st &amp; 15th</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 14 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Under Verification</Text>
            <Text style={{ color: colors.warning, fontSize: 24, fontWeight: '800', marginTop: 8 }}>৳{balances.pendingBalance.toLocaleString('en-BD')}</Text>
            <Text style={{ color: colors.warning, marginTop: 6, fontSize: 11, fontWeight: '700' }}>Pending cheques/tokens</Text>
          </View>
        </View>

        <View style={{ marginTop: 18, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: '800', letterSpacing: 0.8, color: colors.textSecondary }}>BASE SALARY STATUS</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ShieldCheck size={18} color={gate.isUnlocked ? colors.success : colors.warning} />
              <Text style={{ marginLeft: 8, fontSize: 15, fontWeight: '800', color: colors.textPrimary }}>
                {balances.baseSalaryStatus}
              </Text>
            </View>
            <Text style={{ fontSize: 13, fontWeight: '700', color: gate.isUnlocked ? colors.success : colors.warning }}>
              {gate.isUnlocked ? 'UNLOCKED' : 'LOCKED'}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 18, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>Monthly Weighted Gate</Text>
            <Text style={{ fontSize: 12, fontWeight: '800', color: gate.isUnlocked ? colors.success : colors.warning }}>
              {gate.weightedScore.toFixed(1)} / 100
            </Text>
          </View>

          {MONTHLY_SALARY_GATE_METRICS.map((metric) => {
            const progress = getMetricProgress(metric.key);
            const badge = getMetricBadge(metric.key);

            return (
              <Pressable
                key={metric.key}
                onPress={() => setSelectedMetricKey(metric.key)}
                style={{
                  marginTop: 14,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.subpanel,
                  padding: 12,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>{metric.label}</Text>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: badge.color }}>{badge.label}</Text>
                </View>

                <View style={{ marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 11, color: colors.textSecondary }}>{getMetricValueLabel(metric.key)}</Text>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textPrimary }}>{Math.round(progress)}%</Text>
                </View>

                <View style={{ marginTop: 8, height: 8, borderRadius: 999, overflow: 'hidden', backgroundColor: colors.canvas }}>
                  <View style={{ height: '100%', width: `${progress}%`, backgroundColor: badge.color }} />
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={{ marginTop: 18, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>Earnings Ledger</Text>

          <View style={{ marginTop: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
              <Text style={{ color: colors.textSecondary }}>Base Salary</Text>
              <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{formatCurrency(balances.baseSalary)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
              <Text style={{ color: colors.textSecondary }}>Deal Commissions</Text>
              <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{formatCurrency(balances.commissionEarnings)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
              <Text style={{ color: colors.textSecondary }}>Active Day Allowance</Text>
              <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{formatCurrency(balances.activeDaysAllowance)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
              <Text style={{ color: colors.textSecondary }}>Attendance Allowance</Text>
              <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{formatCurrency(balances.attendanceAllowance)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
              <Text style={{ color: colors.textSecondary }}>Mobile Bill Allowance</Text>
              <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{formatCurrency(balances.mobileBillAllowance)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
              <Text style={{ color: colors.textSecondary }}>Site Visit Allowance</Text>
              <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{formatCurrency(balances.siteVisitAllowance)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, marginTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
              <Text style={{ color: colors.textPrimary, fontWeight: '800' }}>Cleared Balance</Text>
              <Text style={{ color: colors.accent, fontWeight: '800' }}>{formatCurrency(balances.clearedBalance)}</Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 18, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: '800', letterSpacing: 0.8, color: colors.textSecondary }}>TIER STATUS</Text>
          <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Crown size={18} color={colors.brassAccent} />
              <Text style={{ marginLeft: 8, fontSize: 16, fontWeight: '800', color: colors.textPrimary }}>{roleProfile.tierLabel}</Text>
            </View>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>{(roleProfile.commissionRate * 100).toFixed(2)}% commission</Text>
          </View>
          <Text style={{ marginTop: 10, fontSize: 12, color: colors.textSecondary }}>Deal weight 65% • operational score 35% • allowances unlock with compliance.</Text>
        </View>

        <View style={{ marginTop: 18, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>Recent Ledger</Text>
          {recentLedgerRows.map((entry) => (
            <View key={entry.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>{entry.title}</Text>
                <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 3 }}>{entry.id}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: colors.textPrimary }}>{formatCurrency(entry.amount)}</Text>
                <Text style={{ fontSize: 11, color: entry.status === 'Cleared' ? colors.success : colors.warning, marginTop: 3 }}>{entry.status}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal visible={Boolean(selectedMetric)} transparent animationType="slide" onRequestClose={() => setSelectedMetricKey(null)}>
        {selectedMetric && (
          <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(15, 23, 42, 0.68)', padding: 20 }}>
            <View style={{ borderRadius: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, padding: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>{selectedMetric.label}</Text>
                <Pressable onPress={() => setSelectedMetricKey(null)} style={{ padding: 6 }}>
                  <ArrowUpRight size={16} color={colors.textPrimary} />
                </Pressable>
              </View>

              <View style={{ marginTop: 14, borderRadius: 12, backgroundColor: colors.subpanel, borderWidth: 1, borderColor: colors.border, padding: 14 }}>
                <Text style={{ fontSize: 11, fontWeight: '800', letterSpacing: 0.8, color: colors.textSecondary }}>RULE</Text>
                <Text style={{ marginTop: 8, fontSize: 13, lineHeight: 20, color: colors.textPrimary }}>{selectedMetric.description}</Text>
                <Text style={{ marginTop: 12, fontSize: 12, color: colors.textSecondary }}>{selectedMetric.progressHint}</Text>
                <Text style={{ marginTop: 8, fontSize: 12, color: colors.brassAccent }}>{selectedMetric.weight}% of total gate</Text>
              </View>

              <View style={{ marginTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: colors.textSecondary }}>Current</Text>
                <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{getMetricValueLabel(selectedMetric.key)}</Text>
              </View>

              <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: colors.textSecondary }}>Target</Text>
                <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{selectedMetric.target}{selectedMetric.suffix}</Text>
              </View>

              <Pressable
                onPress={() => setSelectedMetricKey(null)}
                style={{ marginTop: 18, minHeight: 48, borderRadius: 12, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>Close Guidance</Text>
              </Pressable>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}
