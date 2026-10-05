import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { AlertTriangle, Target } from 'lucide-react-native';

import { useAppTheme } from '../../../theme/ThemeContext';
import { getEmployeeRoleProfile } from '../../auth/constants/employeeProfiles';
import { useAuthStore } from '../../auth/hooks/useAuthStore';
import { ROLE_KPI_PROFILES, UPCOMING_KPI_REVISIONS } from '../constants/kpiBenchmarks';
import {
  MONTHLY_SALARY_GATE_METRICS,
  getSampleMonthlySalaryGate,
  calculateBalances,
  evaluateSalaryGate,
} from '../../wallet/utils/kpiEngine';

/** Module 6: role-based KPI evaluation screen with 7-day advance notice revision comparison. */
export const KpiEvaluationScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const role = useAuthStore((state) => state.role);
  const employeeStatus = useAuthStore((state) => state.employeeStatus);
  const roleProfile = getEmployeeRoleProfile(role);
  const profile = ROLE_KPI_PROFILES[role];
  const revision = UPCOMING_KPI_REVISIONS.find((item) => item.role === role);
  const sample = getSampleMonthlySalaryGate(role);
  const gate = evaluateSalaryGate(sample, role);
  const balances = calculateBalances(sample, role, employeeStatus);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.canvas, paddingHorizontal: 20, paddingTop: 24 }} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Target size={22} color={colors.accent} />
        <Text style={{ marginLeft: 8, fontSize: 20, fontWeight: '800', color: colors.textPrimary }}>My KPI &amp; Evaluation Grounds</Text>
      </View>
      <Text style={{ marginTop: 4, fontSize: 13, color: colors.textSecondary }}>Role: {roleProfile.label}</Text>

      <View style={{ marginTop: 18, borderRadius: 18, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, padding: 16 }}>
        <Text style={{ fontSize: 12, fontWeight: '800', letterSpacing: 0.8, color: colors.textSecondary }}>MONTHLY COMPENSATION GATE</Text>
        <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: colors.textSecondary }}>Status</Text>
          <Text style={{ fontSize: 12, fontWeight: '800', color: gate.isUnlocked ? colors.success : colors.warning }}>
            {gate.isUnlocked ? 'UNLOCKED / CLEARED' : 'KPI IN PROGRESS'}
          </Text>
        </View>
        <View style={{ marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: colors.textSecondary }}>Progress</Text>
          <Text style={{ fontSize: 12, fontWeight: '800', color: colors.textPrimary }}>
            {gate.weightedScore.toFixed(1)}/100 score
          </Text>
        </View>
        <View style={{ marginTop: 12, height: 8, borderRadius: 999, backgroundColor: colors.subpanel, overflow: 'hidden' }}>
          <View
            style={{
              height: '100%',
              width: `${gate.weightedScore}%`,
              backgroundColor: gate.isUnlocked ? colors.success : colors.warning,
            }}
          />
        </View>
      </View>

      <View style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 0.8, color: colors.textSecondary }}>{profile.benchmarks[0]?.label ? 'CURRENT BENCHMARKS' : 'BENCHMARKS'}</Text>
        {MONTHLY_SALARY_GATE_METRICS.map((metric, index) => {
          const currentValue = sample[metric.key];
          const numericalValue = typeof currentValue === 'number' ? currentValue : 0;
          const percent = Math.min(100, (numericalValue / metric.target) * 100);
          const isMet = numericalValue >= metric.target;

          return (
            <View
              key={metric.key}
              style={{
                marginTop: 10,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                paddingHorizontal: 16,
                paddingVertical: 12,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 14, color: colors.textPrimary, fontWeight: '700' }}>{metric.label}</Text>
                <Text style={{ fontSize: 11, fontWeight: '800', color: isMet ? colors.success : colors.warning }}>
                  {isMet ? '🟢 Met' : '🟡 In Progress'}
                </Text>
              </View>

              <View style={{ marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                  {numericalValue.toFixed(metric.key === 'workHoursLogged' ? 1 : metric.key === 'callbackAdherence' || metric.key === 'newLeadDialVelocity' || metric.key === 'audioDebriefRate' || metric.key === 'complianceHealth' ? 2 : 0)}
                  {metric.key === 'callbackAdherence' || metric.key === 'newLeadDialVelocity' || metric.key === 'audioDebriefRate' || metric.key === 'complianceHealth' ? ' / 1.00' : metric.key === 'workHoursLogged' ? ` / ${roleProfile.monthlyTargetHours.toFixed(1)} hrs` : ` / ${metric.target}${metric.suffix}`}
                </Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textPrimary }}>{Math.round(percent)}%</Text>
              </View>

              <View style={{ marginTop: 8, height: 8, borderRadius: 999, overflow: 'hidden', backgroundColor: colors.subpanel }}>
                <View style={{ height: '100%', width: `${percent}%`, backgroundColor: isMet ? colors.success : colors.warning }} />
              </View>

              {index < MONTHLY_SALARY_GATE_METRICS.length - 1 && <View style={{ marginTop: 10, height: 1, backgroundColor: colors.border }} />}
            </View>
          );
        })}
      </View>

      <View style={{ marginTop: 22, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 16 }}>
        <Text style={{ fontSize: 12, fontWeight: '800', letterSpacing: 0.8, color: colors.textSecondary }}>EARNINGS &amp; BASE SALARY</Text>
        <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.textSecondary }}>Base Salary</Text>
          <Text style={{ color: gate.isUnlocked ? colors.success : colors.warning, fontWeight: '800' }}>
            {balances.baseSalaryStatus}
          </Text>
        </View>
        <View style={{ marginTop: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.textSecondary }}>Deal Commissions</Text>
          <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>৳{balances.commissionEarnings.toLocaleString('en-BD')}</Text>
        </View>
        <View style={{ marginTop: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.textSecondary }}>Attendance Allowance</Text>
          <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>৳{balances.attendanceAllowance.toLocaleString('en-BD')}</Text>
        </View>
      </View>

      {revision && (
        <View style={{ marginTop: 22, borderRadius: 18, borderWidth: 1, borderColor: colors.warning, backgroundColor: 'rgba(245,158,11,0.12)', padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <AlertTriangle size={16} color={colors.warning} />
            <Text style={{ marginLeft: 8, fontSize: 14, fontWeight: '700', color: colors.warning }}>
              Upcoming Policy Change — Effective in {revision.effectiveInDays} Days
            </Text>
          </View>

          <View style={{ marginTop: 12, flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary }}>CURRENT</Text>
              {revision.current.map((benchmark) => (
                <Text key={benchmark.label} style={{ marginTop: 8, fontSize: 12, color: colors.textSecondary }}>
                  {benchmark.label}: <Text style={{ fontFamily: 'monospace', letterSpacing: 0.8, color: colors.textPrimary }}>{benchmark.target}</Text>
                </Text>
              ))}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.warning }}>NEW POLICY</Text>
              {revision.upcoming.map((benchmark) => (
                <Text key={benchmark.label} style={{ marginTop: 8, fontSize: 12, fontWeight: '700', color: colors.warning }}>
                  {benchmark.label}: <Text style={{ fontFamily: 'monospace', letterSpacing: 0.8, color: colors.warning }}>{benchmark.target}</Text>
                </Text>
              ))}
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};
