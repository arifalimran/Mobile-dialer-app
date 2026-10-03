import React, { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Clock3, LogOut, ShieldCheck } from 'lucide-react-native';

import { useAuthStore } from '../hooks/useAuthStore';

/**
 * Module 2: polished "Application Under Review" screen. Rendered by the
 * root router in `App.tsx` whenever the signed-in agent's KYC submission is
 * still `PENDING_VERIFICATION` (or was `REJECTED`), instead of mounting the
 * full `AppShell`.
 */
export const ApplicationUnderReviewScreen: React.FC = () => {
  const agentProfile = useAuthStore((state) => state.agentProfile);
  const verifyKyc = useAuthStore((state) => state.verifyKyc);
  const logout = useAuthStore((state) => state.logout);
  const [isChecking, setIsChecking] = useState(false);

  const isRejected = agentProfile?.kycStatus === 'REJECTED';

  const handleCheckStatus = () => {
    setIsChecking(true);
    // No approval backend yet — this simulates Head Office instantly
    // approving the submission so the flow stays testable end-to-end.
    setTimeout(() => {
      verifyKyc();
      setIsChecking(false);
    }, 900);
  };

  return (
    <View className="flex-1 items-center justify-center bg-[#070b12] px-6">
      <View className="w-full rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <View className="items-center">
          <View
            className={`h-16 w-16 items-center justify-center rounded-2xl border ${
              isRejected ? 'border-rose-800 bg-rose-950/40' : 'border-amber-800 bg-amber-950/40'
            }`}
          >
            {isRejected ? (
              <ShieldCheck size={28} color="#fb7185" />
            ) : (
              <Clock3 size={28} color="#f59e0b" />
            )}
          </View>
          <Text className="mt-4 text-xl font-bold tracking-tight text-white">
            {isRejected ? 'Application Needs Attention' : 'Application Under Review'}
          </Text>
          <Text className="mt-2 text-center text-sm leading-5 text-slate-400">
            {isRejected
              ? 'Head Office flagged an issue with your submitted NID or reference details. Please contact your Regional Hub coordinator.'
              : 'Thanks for registering, ' +
                (agentProfile?.legalName?.split(' ')[0] ?? 'Agent') +
                '. Head Office is verifying your NID and reference details before assigning your corporate SIM line.'}
          </Text>

          {agentProfile?.submittedAt && (
            <Text className="mt-3 font-mono text-xs tracking-wide text-slate-500">
              Submitted {new Date(agentProfile.submittedAt).toLocaleString()}
            </Text>
          )}
        </View>

        {!isRejected && (
          <Pressable
            onPress={handleCheckStatus}
            disabled={isChecking}
            className="mt-6 min-h-[52px] flex-row items-center justify-center rounded-xl bg-sky-600 active:scale-[0.98]"
          >
            {isChecking ? (
              <ActivityIndicator color="#e0f2fe" />
            ) : (
              <Text className="text-base font-bold tracking-tight text-white">Check Approval Status</Text>
            )}
          </Pressable>
        )}

        <Pressable
          onPress={logout}
          className="mt-3 min-h-[48px] flex-row items-center justify-center rounded-xl border border-white/10"
        >
          <LogOut size={16} color="#94a3b8" />
          <Text className="ml-2 text-sm font-semibold text-slate-300">Back to Login</Text>
        </Pressable>
      </View>
    </View>
  );
};
