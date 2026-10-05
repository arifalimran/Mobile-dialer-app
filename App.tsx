import React, { useEffect, useMemo, useState } from 'react';
import { AppState, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PhoneOff } from 'lucide-react-native';

import { MOCK_AGENT_PHONE } from './src/config/constants';
import { AddLeadSheet } from './src/features/calling/components/AddLeadSheet';
import { LeadCard } from './src/features/calling/components/LeadCard';
import { PostCallDrawer } from './src/features/calling/components/PostCallDrawer';
import { QueueTracker } from './src/features/calling/components/QueueTracker';
import { SettingsSheet } from './src/features/calling/components/SettingsSheet';
import { useAgentConfig } from './src/features/calling/hooks/useAgentConfig';
import { useCallQueue } from './src/features/calling/hooks/useCallQueue';
import { useTelephonyBridge } from './src/features/calling/hooks/useTelephonyBridge';
import type { DispositionSubmission, LeadContact } from './src/features/calling/callingTypes';

import { AppHeader as GlobalAppHeader } from './src/components/navigation/AppHeader';
import { AgentStatusSheet, type ShiftStatus } from './src/components/navigation/AgentStatusSheet';
import { BottomTabBar } from './src/components/navigation/BottomTabBar';
import { ComingSoonScreen } from './src/components/ComingSoonScreen';

import { useAuthStore } from './src/features/auth/hooks/useAuthStore';
import { LoginScreen } from './src/features/auth/screens/LoginScreen';
import { AgentRegistrationScreen } from './src/features/auth/screens/AgentRegistrationScreen';
import { ApplicationUnderReviewScreen } from './src/features/auth/screens/ApplicationUnderReviewScreen';

import { useShiftStore } from './src/features/shifts/hooks/useShiftStore';
import { ShiftsScreen } from './src/features/shifts/screens/ShiftsScreen';

import { KpiEvaluationScreen } from './src/features/kpi/screens/KpiEvaluationScreen';
import { UPCOMING_KPI_REVISIONS } from './src/features/kpi/constants/kpiBenchmarks';

import { useUnreadBulletinCount } from './src/features/notices/hooks/useNoticeStore';
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

interface DialerScreenProps {
  activeLeadId: string | null;
  isConnecting: boolean;
  onDialLead: (lead: LeadContact) => void;
}

function DialerScreen({
  activeLeadId,
  isConnecting,
  onDialLead,
}: DialerScreenProps) {
  const {
    currentLead,
    queueLength,
    queuePosition,
    isQueueComplete,
    recordLeadMessage,
    dailyTarget,
    dailyCompletedCount,
    activeBatchNumber,
    activeBatchSize,
    activeBatchCompletedCount,
    activeBatchLeads,
    totalBatches,
  } = useCallQueue();
  const { colors } = useAppTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 14 }}>
        <View style={{ borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 14 }}>
          <Text style={{ fontSize: 13, fontWeight: '800', color: colors.textPrimary }}>
            Daily Target: {dailyCompletedCount} / {dailyTarget} Completed • Active Batch: {activeBatchCompletedCount} / {activeBatchSize}
          </Text>
          <Text style={{ marginTop: 4, fontSize: 11, color: colors.textSecondary }}>Batch {activeBatchNumber} / {totalBatches} is currently unlocked for action.</Text>
        </View>

        <View style={{ marginTop: 12, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 12 }}>
          <Text style={{ fontSize: 11, fontWeight: '800', letterSpacing: 0.8, color: colors.textSecondary }}>5-LEAD ACTIVE BOARD</Text>
          <View style={{ marginTop: 10, gap: 8 }}>
            {activeBatchLeads.map((lead) => (
              <View
                key={lead.id}
                style={{
                  minHeight: 48,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: lead.isActioned ? colors.success : colors.border,
                  backgroundColor: lead.isActioned ? 'rgba(16,185,129,0.10)' : colors.subpanel,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  justifyContent: 'center',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>{lead.name}</Text>
                    <Text style={{ marginTop: 3, fontSize: 11, color: colors.textSecondary }}>{lead.source}</Text>
                  </View>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: lead.isActioned ? colors.success : colors.warning }}>
                    {lead.isActioned ? 'ACTIONED' : 'PENDING'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }} contentContainerStyle={{ paddingBottom: 32 }}>
        <QueueTracker position={queuePosition} total={queueLength} />

        <View style={{ marginTop: 16 }}>
          {currentLead ? (
            <LeadCard
              lead={currentLead}
              isConnecting={isConnecting && activeLeadId === currentLead.id}
              onStartCall={() => onDialLead(currentLead)}
              onRecordMessage={(entry) => recordLeadMessage(currentLead.id, entry)}
            />
          ) : (
            <View style={{ borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 24 }}>
              <Text style={{ textAlign: 'center', fontSize: 16, color: colors.textSecondary }}>
                {isQueueComplete ? 'Daily target complete. All 30 leads have been actioned.' : 'Finish the current 5-lead batch to unlock the next board.'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

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
  const hasKpiRevisionAlert = UPCOMING_KPI_REVISIONS.some((revision) => revision.role === role);
  const { addLeadToFront, scheduleCallback, completeLeadAction } = useCallQueue();

  const { agentPhone, callProviderMode, setAgentPhone, setCallProviderMode } = useAgentConfig();
  const roleProfile = getEmployeeRoleProfile(role);

  const [currentScreen, setCurrentScreen] = useState<AppScreen>('DASHBOARD');
  const [isStatusSheetOpen, setIsStatusSheetOpen] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isAddLeadVisible, setIsAddLeadVisible] = useState(false);
  const [dutyModalMode, setDutyModalMode] = useState<'START' | 'END' | null>(null);
  const [dutyFeedback, setDutyFeedback] = useState<string | null>(null);
  const [pendingDialLead, setPendingDialLead] = useState<{
    source: 'QUEUE' | 'CALLBACK';
    id: string;
    leadName: string;
    maskedPhoneNumber: string;
    rawPhoneNumber?: string;
  } | null>(null);
  const [activeDialContext, setActiveDialContext] = useState<{
    source: 'QUEUE' | 'CALLBACK';
    id: string;
    leadName: string;
    maskedPhoneNumber: string;
    rawPhoneNumber?: string;
  } | null>(null);

  const isShiftLocked = lockStatus === 'PENALIZED' && !!lockedUntil && Date.now() < lockedUntil;
  const isActiveCall = telephonyState.status === 'ACTIVE' && telephonyState.activeMode === 'IPTSP_BRIDGE';
  const isOnDuty = Boolean(activeSessionStartedAt) && !isShiftLocked;
  const canDial = featureFlags.canUseDialer && (isOnDuty || role === 'FREELANCER_AGENT');

  useEffect(() => {
    const visibleTabs = roleProfile.visibleTabs;
    if (visibleTabs.includes(currentScreen as typeof visibleTabs[number])) return;
    if (currentScreen === 'KPI' || currentScreen === 'SITE_VISITS') return;
    setCurrentScreen('DASHBOARD');
  }, [currentScreen, roleProfile.visibleTabs]);

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
  const shiftStatus: ShiftStatus = isShiftLocked ? 'LOCKED' : isOnDuty ? 'ON_DUTY' : 'BREAK';

  const handleQueueDial = (lead: LeadContact) => {
    if (!canDial) {
      setDutyFeedback(role === 'FREELANCER_AGENT' ? 'Dialer access is not enabled for this employee type.' : 'Start an approved duty session before dialing clients.');
      return;
    }

    setPendingDialLead({
      source: 'QUEUE',
      id: lead.id,
      leadName: lead.name,
      maskedPhoneNumber: lead.maskedPhoneNumber,
      rawPhoneNumber: lead.rawPhoneNumber,
    });
  };

  const handleCallbackDial = (lead: { id: string; leadName: string; phone: string }) => {
    if (!canDial) {
      setDutyFeedback(role === 'FREELANCER_AGENT' ? 'Dialer access is not enabled for this employee type.' : 'Start an approved duty session before dialing clients.');
      return;
    }

    setPendingDialLead({
      source: 'CALLBACK',
      id: lead.id,
      leadName: lead.leadName,
      maskedPhoneNumber: maskPhoneNumber(lead.phone),
      rawPhoneNumber: lead.phone,
    });
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

  const handleDutyToggle = () => {
    setDutyModalMode(isOnDuty ? 'END' : 'START');
  };

  const confirmDutyToggle = () => {
    if (dutyModalMode === 'START') {
      const result = startDutySession();
      setDutyFeedback(result.ok ? 'Duty session started. The dialer and callback desk are now unlocked.' : result.reason ?? 'Unable to start duty session.');
    }

    if (dutyModalMode === 'END') {
      const endedSession = endDutySession();
      setDutyFeedback(endedSession ? `Duty session closed with ${endedSession.hoursWorked.toFixed(2)} hours logged.` : 'There is no active duty session to close.');
    }

    setDutyModalMode(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.canvas }} edges={['top', 'left', 'right']}>
      <DynamicWatermark agentId={agentProfile?.corporateSim ?? 'AGT-01'} />
      <GlobalAppHeader
        agentName={agentProfile?.legalName ?? 'Agent'}
        employeeStatus={agentProfile?.employeeStatus ?? 'PROBATION'}
        sessionId={agentProfile?.sessionId ?? '#SES-0000'}
        unreadBulletinCount={unreadBulletinCount}
        dutyStartedAt={activeSessionStartedAt}
        dutyHoursToday={0}
        pendingDutyHours={0}
        isOnDuty={isOnDuty}
        onOpenBulletins={() => setCurrentScreen('DASHBOARD')}
        onOpenAddLead={() => {
          if (!featureFlags.canUseDialer) {
            setDutyFeedback('Custom lead intake is not enabled for this employee type.');
            return;
          }
          setCurrentScreen('DIALER');
          setIsAddLeadVisible(true);
        }}
        onToggleDuty={handleDutyToggle}
        onOpenSettings={() => setIsSettingsVisible(true)}
        onOpenStatusSheet={() => setIsStatusSheetOpen(true)}
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
            shiftStatus={shiftStatus}
            onNavigateDialer={() => setCurrentScreen('DIALER')}
            onNavigateCallbacks={() => setCurrentScreen('CALLBACKS')}
            onNavigateInventory={() => setCurrentScreen('INVENTORY')}
            onNavigateWallet={() => setCurrentScreen('WALLET')}
          />
        )}
        {currentScreen === 'DIALER' && (
          <DialerScreen
            activeLeadId={telephonyState.activeLeadId}
            isConnecting={telephonyState.status === 'CONNECTING'}
            onDialLead={handleQueueDial}
          />
        )}
        {currentScreen === 'KPI' && <KpiEvaluationScreen />}
        {currentScreen === 'SHIFTS' && <ShiftsScreen />}
        {currentScreen === 'CALLBACKS' && (
          <ScheduledCallbacksScreen
            onDialClient={handleCallbackDial}
          />
        )}
        {currentScreen === 'INVENTORY' && <StackingMatrixScreen />}
        {currentScreen === 'SITE_VISITS' && <ComingSoonScreen title="Site Visits & GPS Check-In" />}
        {currentScreen === 'WALLET' && <WalletScreen />}
      </View>

      <BottomTabBar activeScreen={currentScreen} onNavigate={setCurrentScreen} />

      <AgentStatusSheet
        visible={isStatusSheetOpen}
        agentName={agentProfile?.legalName ?? 'Agent'}
        corporateSim={agentProfile?.corporateSim ?? 'Unassigned SIM'}
        role={role}
        shiftStatus={shiftStatus}
        hasKpiRevisionAlert={hasKpiRevisionAlert}
        onClose={() => setIsStatusSheetOpen(false)}
        onNavigateKpi={() => setCurrentScreen('KPI')}
        onNavigateSiteVisits={() => setCurrentScreen('SITE_VISITS')}
        onAddSelfSourcedLead={() => {
          setCurrentScreen('DIALER');
          setIsAddLeadVisible(true);
        }}
        onOpenSettings={() => setIsSettingsVisible(true)}
        onLogout={onLogout}
      />

      <SettingsSheet
        visible={isSettingsVisible}
        agentPhone={agentPhone}
        callProviderMode={callProviderMode}
        onClose={() => setIsSettingsVisible(false)}
        onSave={(nextAgentPhone, nextMode) => {
          setAgentPhone(nextAgentPhone);
          setCallProviderMode(nextMode);
        }}
        onNavigateWallet={() => {
          setIsSettingsVisible(false);
          setCurrentScreen('WALLET');
        }}
        onSignOut={() => {
          setIsSettingsVisible(false);
          onLogout();
        }}
      />

      <AddLeadSheet
        visible={isAddLeadVisible}
        onClose={() => setIsAddLeadVisible(false)}
        onAddLead={addLeadToFront}
      />

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

      <Modal visible={Boolean(dutyModalMode)} transparent animationType="fade" onRequestClose={() => setDutyModalMode(null)}>
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(15,23,42,0.7)', padding: 20 }}>
          <View style={{ borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>
              {dutyModalMode === 'START' ? 'Go On Duty?' : 'Go Off Duty?'}
            </Text>
            <Text style={{ marginTop: 10, fontSize: 14, lineHeight: 21, color: colors.textSecondary }}>
              {dutyModalMode === 'START'
                ? 'Starting duty unlocks the dialer only when you have an approved slot for today.'
                : 'Ending duty logs your attendance session and moves the header back to off-duty mode.'}
            </Text>
            <View style={{ marginTop: 18, flexDirection: 'row', gap: 10 }}>
              <Pressable onPress={() => setDutyModalMode(null)} style={{ flex: 1, minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={confirmDutyToggle} style={{ flex: 1, minHeight: 48, borderRadius: 12, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>Confirm</Text>
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


