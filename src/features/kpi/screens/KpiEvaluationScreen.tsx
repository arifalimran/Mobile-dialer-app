import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { AlertTriangle, Target } from 'lucide-react-native';

import { useAuthStore } from '../../auth/hooks/useAuthStore';
import { ROLE_KPI_PROFILES, UPCOMING_KPI_REVISIONS } from '../constants/kpiBenchmarks';

/** Module 6: role-based KPI evaluation screen with 7-day advance notice revision comparison. */
export const KpiEvaluationScreen: React.FC = () => {
  const role = useAuthStore((state) => state.role);
  const profile = ROLE_KPI_PROFILES[role];
  const revision = UPCOMING_KPI_REVISIONS.find((item) => item.role === role);

  return (
    <ScrollView className="flex-1 bg-slate-950 px-5 pt-6" contentContainerStyle={{ paddingBottom: 32 }}>
      <View className="flex-row items-center">
        <Target size={22} color="#38bdf8" />
        <Text className="ml-2 text-xl font-bold tracking-tight text-white">My KPI &amp; Evaluation Grounds</Text>
      </View>
      <Text className="mt-1 text-sm text-slate-400">Role: {role.replace('_', ' ')}</Text>

      <View className="mt-5">
        <Text className="text-xs font-medium text-slate-400">CURRENT BENCHMARKS</Text>
        {profile.benchmarks.map((benchmark) => (
          <View
            key={benchmark.label}
            className="mt-2 flex-row items-center justify-between rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
          >
            <Text className="text-sm text-slate-300">{benchmark.label}</Text>
            <Text className="font-mono text-sm font-semibold tracking-wide text-white">{benchmark.target}</Text>
          </View>
        ))}
      </View>

      {revision && (
        <View className="mt-6 rounded-2xl border border-amber-800 bg-amber-950/40 p-4">
          <View className="flex-row items-center">
            <AlertTriangle size={16} color="#fbbf24" />
            <Text className="ml-2 text-sm font-semibold text-amber-300">
              Upcoming Policy Change — Effective in {revision.effectiveInDays} Days
            </Text>
          </View>

          <View className="mt-3 flex-row gap-3">
            <View className="flex-1">
              <Text className="text-xs font-medium text-slate-400">CURRENT</Text>
              {revision.current.map((benchmark) => (
                <Text key={benchmark.label} className="mt-2 text-xs text-slate-300">
                  {benchmark.label}: <Text className="font-mono tracking-wide">{benchmark.target}</Text>
                </Text>
              ))}
            </View>
            <View className="flex-1">
              <Text className="text-xs font-medium text-amber-400">NEW POLICY</Text>
              {revision.upcoming.map((benchmark) => (
                <Text key={benchmark.label} className="mt-2 text-xs font-semibold text-amber-200">
                  {benchmark.label}: <Text className="font-mono tracking-wide">{benchmark.target}</Text>
                </Text>
              ))}
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};
