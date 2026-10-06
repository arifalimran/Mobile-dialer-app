import React, { useEffect, useMemo, useState } from 'react';
import { AppState, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PhoneOff } from 'lucide-react-native';

import { MOCK_AGENT_PHONE } from './src/config/constants';
import { AddLeadSheet } from './src/features/calling/components/AddLeadSheet';
import { PostCallDrawer } from './src/features/calling/components/PostCallDrawer';
import { ProfileDrawer } from './src/features/calling/components/ProfileDrawer';
import { DialerScreen } from './src/features/calling/screens/DialerScreen';
import { useAgentConfig } from './src/features/calling/hooks/useAgentConfig';
import { useCallQueue } from './src/features/calling/hooks/useCallQueue';
import { useTelephonyBridge } from './src/features/calling/hooks/useTelephonyBridge';
import type { DispositionSubmission, LeadContact } from './src/features/calling/callingTypes';

import { AppHeader as GlobalAppHeader } from './src/components/navigation/AppHeader';
import { BottomTabBar } from './src/components/navigation/BottomTabBar';
import { ComingSoonScreen } from './src/components/ComingSoonScreen';

import { useAuthStore } from './src/features/auth/hooks/useAuthStore';
import { LoginScreen } from './src/features/auth/screens/LoginScreen';
import { AgentRegistrationScreen } from './src/features/auth/screens/AgentRegistrationScreen';
import { ApplicationUnderReviewScreen } from './src/features/auth/screens/ApplicationUnderReviewScreen';

import { useShiftStore } from './src/features/shifts/hooks/useShiftStore';
import { ShiftsScreen } from './src/features/shifts/screens/ShiftsScreen';
import { AttendanceDetailModal } from './src/features/shifts/components/AttendanceDetailModal';

import { KpiEvaluationScreen } from './src/features/kpi/screens/KpiEvaluationScreen';
import { UPCOMING_KPI_REVISIONS } from './src/features/kpi/constants/kpiBenchmarks';

import { useNoticeStore, useUnreadBulletinCount } from './src/features/notices/hooks/useNoticeStore';
import { MOCK_BULLETINS } from './src/features/notices/constants/mockBulletins';
import { getEmployeeRoleProfile } from './src/features/auth/constants/employeeProfiles';

import { ThemeProvider, useAppTheme } from './src/theme/ThemeContext';
import { DynamicWatermark } from './src/components/security/DynamicWatermark';
import { ScheduledCallbacksScreen } from './src/features/callbacks/screens/ScheduledCallbacksScreen';
import { DashboardScreen } from './src/features/dashboard/screens/DashboardScreen';
import { StackingMatrixScreen } from './src/features/inventory/screens/StackingMatrixScreen';
import { WalletScreen } from './src/features/wallet/screens/WalletScreen';
import type { AppScreen } from './src/types/navigation';
import { maskPhoneNumber } from './src/features/calling/utils/maskPhoneNumber';

const queryClient = new QueryClient();

/**
 * Top-level app shell for authenticated + KYC-approved agents: de-cluttered
 * global header (theme toggle, bulletins bell, avatar) -> current screen ->
 * fixed bottom tab bar -> avatar status sheet -> mandatory notice
 * gatekeeper. Screen switching is plain React state (`AppScreen`) rather
 * than @react-navigation, deliberately, to avoid adding new native modules
 * to an Expo-Go project that has already hit native-module resolution
 * issues (see PROJECT_STATUS.md).
 */
function AppShell({ onLogout }: { onLogout: () => void }) {
  const { colors, theme } = useAppTheme();
  const telephonyState = useTelephonyBridge();
  const agentProfile = useAuthStore((state) => state.agentProfile);
  const role = useAuthStore((state) => state.role);
  const featureFlags = useAuthStore((state) => state.featureFlags);
  const lockStatus = useShiftStore((state) => state.lockStatus);
  const lockedUntil = useShiftStore((state) => state.lockedUntil);
  const activeSessionStartedAt = useShiftStore((state) => state.activeSessionStartedAt);
  const startDutySession = useShiftStore((state) => state.startDutySession);
  const endDutySession = useShiftStore((state) => state.endDutySession);
  const unreadBulletinCount = useUnreadBulletinCount();
  const acknowledgedBulletinIds = useNoticeStore((state) => state.acknowledgedIds);
  const hasKpiRevisionAlert = UPCOMING_KPI_REVISIONS.some((revision) => revision.role === role);
  const { addLeadToFront, scheduleCallback, completeLeadAction } = useCallQueue();

  const { agentPhone, callProviderMode, setAgentPhone, setCallProviderMode } = useAgentConfig();
  const roleProfile = getEmployeeRoleProfile(role);

  const [currentScreen, setCurrentScreen] = useState<AppScreen>('DASHBOARD');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBulletinsVisible, setIsBulletinsVisible] = useState(false);
  const [isAddLeadVisible, setIsAddLeadVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [dutyFeedback, setDutyFeedback] = useState<string | null>(null);
  type DialCandidate = {
    source: 'QUEUE' | 'CALLBACK';
    id: string;
    leadName: string;
    maskedPhoneNumber: string;
    rawPhoneNumber?: string;
  };
  const [pendingDialLead, setPendingDialLead] = useState<DialCandidate | null>(null);
  const [offDutyDialRequest, setOffDutyDialRequest] = useState<DialCandidate | null>(null);
  const [activeDialContext, setActiveDialContext] = useState<DialCandidate | null>(null);

  const isShiftLocked = lockStatus === 'PENALIZED' && !!lockedUntil && Date.now() < lockedUntil;
  const isActiveCall = telephonyState.status === 'ACTIVE' && telephonyState.activeMode === 'IPTSP_BRIDGE';
  const isOnDuty = Boolean(activeSessionStartedAt) && !isShiftLocked;

  useEffect(() => {
    const visibleTabs = roleProfile.visibleTabs;
    if (visibleTabs.includes(currentScreen as typeof visibleTabs[number])) return;
    if (currentScreen === 'KPI' || currentScreen === 'SITE_VISITS') return;
    setCurrentScreen('DASHBOARD');
  }, [currentScreen, roleProfile.visibleTabs]);

  useEffect(() => {
    setIsScrolled(false);
  }, [currentScreen]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        telephonyState.handleNativeDialerReturn();
      }
    });

    return () => subscription.remove();
  }, [telephonyState]);

  const formatCallDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainingSeconds}`;
  };

  const requestDial = (candidate: DialCandidate) => {
    if (!featureFlags.canUseDialer) {
      setDutyFeedback('Dialer access is not enabled for this employee type.');
      return;
    }

    if (isOnDuty || role === 'FREELANCER_AGENT') {
      setPendingDialLead(candidate);
      return;
    }

    if (isShiftLocked) {
      setDutyFeedback('Shift booking is locked due to a late-cancellation penalty. Dialing is unavailable until the lockout clears.');
      return;
    }

    setOffDutyDialRequest(candidate);
  };

  const handleQueueDial = (lead: LeadContact) => {
    requestDial({
      source: 'QUEUE',
      id: lead.id,
      leadName: lead.name,
      maskedPhoneNumber: lead.maskedPhoneNumber,
      rawPhoneNumber: lead.rawPhoneNumber,
    });
  };

  const handleCallbackDial = (lead: { id: string; leadName: string; phone: string }) => {
    requestDial({
      source: 'CALLBACK',
      id: lead.id,
      leadName: lead.leadName,
      maskedPhoneNumber: maskPhoneNumber(lead.phone),
      rawPhoneNumber: lead.phone,
    });
  };

  const confirmOffDutyDial = () => {
    if (!offDutyDialRequest) return;
    const result = startDutySession();
    if (!result.ok) {
      setDutyFeedback(result.reason ?? 'Unable to start duty session.');
      setOffDutyDialRequest(null);
      return;
    }
    setPendingDialLead(offDutyDialRequest);
    setOffDutyDialRequest(null);
  };

  const confirmDialLead = async () => {
    if (!pendingDialLead) return;
    setActiveDialContext(pendingDialLead);
    await telephonyState.startCall({
      agentPhone: agentPhone || MOCK_AGENT_PHONE,
      leadId: pendingDialLead.id,
      mode: callProviderMode,
      rawPhoneNumber: pendingDialLead.rawPhoneNumber,
      leadName: pendingDialLead.leadName,
      maskedPhoneNumber: pendingDialLead.maskedPhoneNumber,
    });
    const nextTelephonyState = useTelephonyBridge.getState();
    setPendingDialLead(nextTelephonyState.error ? pendingDialLead : null);
    if (nextTelephonyState.error) {
      setActiveDialContext(null);
    }
    if (currentScreen !== 'DIALER' && callProviderMode === 'IPTSP_BRIDGE') {
      setCurrentScreen('DIALER');
    }
  };

  const handleDispositionSubmit = (submission: DispositionSubmission) => {
    if (submission.disposition === 'CALLBACK_SCHEDULED' && submission.callbackAt) {
      scheduleCallback(submission.leadId, submission.callbackNote ?? '', submission.callbackAt);
    }
    if (activeDialContext?.source === 'QUEUE') {
      completeLeadAction(submission.leadId);
    }
    telephonyState.reset();
    setPendingDialLead(null);
    setActiveDialContext(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.canvas }} edges={['top', 'left', 'right']}>
      <DynamicWatermark agentId={agentProfile?.corporateSim ?? 'AGT-01'} />
      <GlobalAppHeader
        agentName={agentProfile?.legalName ?? 'Agent'}
        maskedSim={agentProfile?.corporateSim ?? 'Unassigned SIM'}
        sessionId={agentProfile?.sessionId ?? '#SES-0000'}
        unreadBulletinCount={unreadBulletinCount}
        isOnDuty={isOnDuty}
        isScrolled={isScrolled}
        onOpenBulletins={() => setIsBulletinsVisible(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {isActiveCall && (
        <View style={{ position: 'absolute', left: 12, right: 12, bottom: 88, zIndex: 20 }}>
          <View style={{ borderRadius: 18, borderWidth: 1, borderColor: '#F87171', backgroundColor: 'rgba(15,23,42,0.92)', padding: 14, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#F8FAFC' }}>{telephonyState.activeLeadName ?? 'Active Lead'}</Text>
                <Text selectable={false} style={{ marginTop: 4, fontSize: 12, color: '#CBD5E1', fontFamily: 'monospace' }}>
                  {telephonyState.activePhone ?? '+880 1819-***-34'}
                </Text>
              </View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#FCA5A5' }}>{formatCallDuration(telephonyState.callDurationSeconds)}</Text>
            </View>

            <Pressable
              onPress={() => {
                telephonyState.endCall();
                setCurrentScreen('DIALER');
              }}
              style={{ marginTop: 12, minHeight: 48, borderRadius: 12, backgroundColor: '#F43F5E', alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#FFFFFF' }}>End Call</Text>
            </Pressable>
          </View>
        </View>
      )}

      <View style={{ flex: 1, backgroundColor: colors.canvas }}>
        {currentScreen === 'DASHBOARD' && (
          <DashboardScreen
            agentName={agentProfile?.legalName ?? 'Agent'}
            corporateSim={agentProfile?.corporateSim ?? 'Unassigned SIM'}
            tierLabel={roleProfile.tierLabel}
            employeeStatus={agentProfile?.employeeStatus ?? roleProfile.defaultStatus}
            onNavigate={setCurrentScreen}
            onOpenAddLead={() => {
              if (!featureFlags.canUseDialer) {
                setDutyFeedback('Custom lead intake is not enabled for this employee type.');
                return;
              }
              setIsAddLeadVisible(true);
            }}
          />
        )}
        {currentScreen === 'DIALER' && (
          <DialerScreen
            activeLeadId={telephonyState.activeLeadId}
            isConnecting={telephonyState.status === 'CONNECTING'}
            onDialLead={handleQueueDial}
            onScrollStateChange={setIsScrolled}
            onOpenAddLead={() => {
              if (!featureFlags.canUseDialer) {
                setDutyFeedback('Custom lead intake is not enabled for this employee type.');
                return;
              }
              setIsAddLeadVisible(true);
            }}
          />
        )}
        {currentScreen === 'KPI' && <KpiEvaluationScreen />}
        {currentScreen === 'SHIFTS' && <ShiftsScreen />}
        {currentScreen === 'CALLBACKS' && (
          <ScheduledCallbacksScreen
            onDialClient={handleCallbackDial}
            onScrollStateChange={setIsScrolled}
          />
        )}
        {currentScreen === 'INVENTORY' && <StackingMatrixScreen onScrollStateChange={setIsScrolled} />}
        {currentScreen === 'SITE_VISITS' && <ComingSoonScreen title="Site Visits & GPS Check-In" />}
        {currentScreen === 'WALLET' && <WalletScreen />}
      </View>

      <BottomTabBar activeScreen={currentScreen} onNavigate={setCurrentScreen} />

      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onLogout={onLogout}
        onOpenAddLead={() => {
          if (!featureFlags.canUseDialer) {
            setDutyFeedback('Custom lead intake is not enabled for this employee type.');
            return;
          }
          setCurrentScreen('DIALER');
          setIsAddLeadVisible(true);
        }}
        onNavigateWallet={() => setCurrentScreen('WALLET')}
      />

      <AttendanceDetailModal />

      <AddLeadSheet
        visible={isAddLeadVisible}
        onClose={() => setIsAddLeadVisible(false)}
        onAddLead={addLeadToFront}
      />

      <Modal visible={isBulletinsVisible} transparent animationType="slide" onRequestClose={() => setIsBulletinsVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ maxHeight: '80%', width: '100%', borderTopWidth: 1, borderTopColor: colors.border, borderRadius: 24, backgroundColor: colors.card, padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>Head Office Bulletins</Text>
            <ScrollView style={{ marginTop: 14 }} showsVerticalScrollIndicator={false}>
              {MOCK_BULLETINS.map((bulletin) => {
                const isAcknowledged = acknowledgedBulletinIds.includes(bulletin.id);
                return (
                  <View
                    key={bulletin.id}
                    style={{ marginBottom: 12, borderRadius: 14, borderWidth: 1, borderColor: bulletin.priority === 'HIGH' ? '#F43F5E' : colors.border, backgroundColor: colors.subpanel, padding: 14 }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary }}>{bulletin.title}</Text>
                    <Text style={{ marginTop: 6, fontSize: 12, lineHeight: 18, color: colors.textSecondary }}>{bulletin.body}</Text>
                    <Pressable
                      onPress={() => useNoticeStore.getState().acknowledge(bulletin.id)}
                      style={{ marginTop: 10, minHeight: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: isAcknowledged ? colors.subpanel : colors.accent, borderWidth: isAcknowledged ? 1 : 0, borderColor: colors.border }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '700', color: isAcknowledged ? colors.textSecondary : '#FFFFFF' }}>
                        {isAcknowledged ? 'Acknowledged' : 'Mark as Read'}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </ScrollView>
            <Pressable onPress={() => setIsBulletinsVisible(false)} style={{ marginTop: 10, minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={Boolean(offDutyDialRequest)} transparent animationType="fade" onRequestClose={() => setOffDutyDialRequest(null)}>
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(15,23,42,0.7)', padding: 20 }}>
          <View style={{ borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>You're Off Duty</Text>
            <Text style={{ marginTop: 10, fontSize: 14, lineHeight: 21, color: colors.textSecondary }}>
              Start an approved duty session now to dial {offDutyDialRequest?.leadName}, or cancel and go on duty later from your profile.
            </Text>
            <View style={{ marginTop: 18, flexDirection: 'row', gap: 10 }}>
              <Pressable onPress={() => setOffDutyDialRequest(null)} style={{ flex: 1, minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={confirmOffDutyDial} style={{ flex: 1, minHeight: 48, borderRadius: 12, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>Turn On Duty &amp; Dial</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={Boolean(pendingDialLead)} transparent animationType="slide" onRequestClose={() => setPendingDialLead(null)}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ width: '100%', borderTopWidth: 1, borderTopColor: colors.border, borderRadius: 24, backgroundColor: colors.card, padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>Proceed to Dial {pendingDialLead?.leadName}?</Text>
            <Text style={{ marginTop: 6, fontSize: 14, color: colors.textSecondary }}>
              {callProviderMode === 'DIRECT_NATIVE_DIALER'
                ? 'This will open the device dialer and return here to capture the post-call outcome.'
                : 'This will route the call through the licensed IPTSP bridge and keep the masked lead identity protected.'}
            </Text>
            <Text selectable={false} style={{ marginTop: 8, fontSize: 13, color: colors.textPrimary }}>{pendingDialLead?.maskedPhoneNumber}</Text>
            <View style={{ marginTop: 20, flexDirection: 'row', gap: 10 }}>
              <Pressable
                onPress={() => setPendingDialLead(null)}
                style={{ flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1, borderColor: colors.border }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>Cancel</Text>
              </Pressable>
            <Pressable
              onPress={confirmDialLead}
              style={{ flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: colors.accent }}
            >
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>Proceed</Text>
            </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={Boolean(dutyFeedback)} transparent animationType="fade" onRequestClose={() => setDutyFeedback(null)}>
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(15,23,42,0.7)', padding: 20 }}>
          <View style={{ borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>Duty Update</Text>
            <Text style={{ marginTop: 10, fontSize: 14, lineHeight: 21, color: colors.textSecondary }}>{dutyFeedback}</Text>
            <Pressable onPress={() => setDutyFeedback(null)} style={{ marginTop: 18, minHeight: 48, borderRadius: 12, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {telephonyState.activeLeadId && telephonyState.status === 'DISPOSITION' && (
        <PostCallDrawer visible leadId={telephonyState.activeLeadId} onSubmit={handleDispositionSubmit} />
      )}

      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </SafeAreaView>
  );
}

type PreAuthScreen = 'LOGIN' | 'REGISTER';

/**
 * Module 2: strict session state routing. No secure-storage token ->
 * `LoginScreen` (never defaults into a mock dialer session). A submitted
 * KYC registration authenticates the agent immediately but keeps them on
 * `ApplicationUnderReviewScreen` until Head Office approval flips
 * `kycStatus` to `VERIFIED`.
 */
function RootRouter() {
  const { colors, theme } = useAppTheme();
  const [screen, setScreen] = useState<'LOGIN' | 'REGISTER' | 'APP'>('LOGIN');

  if (screen === 'APP') {
    return <AppShell onLogout={() => setScreen('LOGIN')} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.canvas }} edges={['top', 'left', 'right']}>
      {screen === 'REGISTER' ? (
        <AgentRegistrationScreen
          onComplete={() => setScreen('LOGIN')}
          onBack={() => setScreen('LOGIN')}
        />
      ) : (
        <LoginScreen
          onRegister={() => setScreen('REGISTER')}
          onSignedIn={() => setScreen('APP')}
        />
      )}
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <ThemeProvider>
          <RootRouter />
        </ThemeProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}


