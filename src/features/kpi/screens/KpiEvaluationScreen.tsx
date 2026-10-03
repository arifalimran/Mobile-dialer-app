import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { AlertTriangle, Target } from 'lucide-react-native';

import { useAppTheme } from '../../../theme/ThemeContext';
import { useAuthStore } from '../../auth/hooks/useAuthStore';
import { ROLE_KPI_PROFILES, UPCOMING_KPI_REVISIONS } from '../constants/kpiBenchmarks';

/** Module 6: role-based KPI evaluation screen with 7-day advance notice revision comparison. */
export const KpiEvaluationScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const role = useAuthStore((state) => state.role);
  const profile = ROLE_KPI_PROFILES[role];
  const revision = UPCOMING_KPI_REVISIONS.find((item) => item.role === role);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.canvas, paddingHorizontal: 20, paddingTop: 24 }} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Target size={22} color={colors.accent} />
        <Text style={{ marginLeft: 8, fontSize: 20, fontWeight: '800', color: colors.textPrimary }}>My KPI &amp; Evaluation Grounds</Text>
      </View>
      <Text style={{ marginTop: 4, fontSize: 13, color: colors.textSecondary }}>Role: {role.replace('_', ' ')}</Text>

      <View style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 0.8, color: colors.textSecondary }}>CURRENT BENCHMARKS</Text>
        {profile.benchmarks.map((benchmark) => (
          <View
            key={benchmark.label}
            style={{
              marginTop: 10,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}
          >
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>{benchmark.label}</Text>
            <Text style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: '700', letterSpacing: 0.8, color: colors.textPrimary }}>{benchmark.target}</Text>
          </View>
        ))}
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
