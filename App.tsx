import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PhoneOff, Plus } from 'lucide-react-native';

import { MOCK_AGENT_PHONE } from './src/config/constants';
import { AddLeadSheet } from './src/features/calling/components/AddLeadSheet';
import { AppHeader as DialerLineHeader } from './src/features/calling/components/AppHeader';
import { LeadCard } from './src/features/calling/components/LeadCard';
import { PostCallDrawer } from './src/features/calling/components/PostCallDrawer';
import { QueueTracker } from './src/features/calling/components/QueueTracker';
import { SettingsSheet } from './src/features/calling/components/SettingsSheet';
import { useAgentConfig } from './src/features/calling/hooks/useAgentConfig';
import { useCallQueue } from './src/features/calling/hooks/useCallQueue';
import { useTelephonyBridge } from './src/features/calling/hooks/useTelephonyBridge';
import type { DispositionSubmission } from './src/features/calling/callingTypes';

import { AppHeader as GlobalAppHeader } from './src/components/navigation/AppHeader';
import { AgentStatusSheet, type ShiftStatus } from './src/components/navigation/AgentStatusSheet';
import { BottomTabBar } from './src/components/navigation/BottomTabBar';
import { ComingSoonScreen } from './src/components/ComingSoonScreen';

import { useAuthStore } from './src/features/auth/hooks/useAuthStore';
import { LoginScreen } from './src/features/auth/screens/LoginScreen';
import { AgentRegistrationScreen } from './src/features/auth/screens/AgentRegistrationScreen';
import { ApplicationUnderReviewScreen } from './src/features/auth/screens/ApplicationUnderReviewScreen';

import { useShiftStore } from './src/features/shifts/hooks/useShiftStore';
import { ShiftBookingScreen } from './src/features/shifts/screens/ShiftBookingScreen';

import { KpiEvaluationScreen } from './src/features/kpi/screens/KpiEvaluationScreen';
import { UPCOMING_KPI_REVISIONS } from './src/features/kpi/constants/kpiBenchmarks';

import { MandatoryNoticeModal } from './src/features/notices/components/MandatoryNoticeModal';
import { BulletinsScreen } from './src/features/notices/screens/BulletinsScreen';
import { useUnreadBulletinCount } from './src/features/notices/hooks/useNoticeStore';

import { useThemePalette } from './src/theme/useThemeStore';
import type { AppScreen } from './src/types/navigation';

const queryClient = new QueryClient();

interface DialerScreenProps {
  isAddLeadVisible: boolean;
  onOpenAddLead: () => void;
  onCloseAddLead: () => void;
  isOnShift: boolean;
  onToggleShift: () => void;
}

function DialerScreen({
  isAddLeadVisible,
  onOpenAddLead,
  onCloseAddLead,
  isOnShift,
  onToggleShift,
}: DialerScreenProps) {
  const {
    currentLead,
    queueLength,
    queuePosition,
    isQueueComplete,
    advanceToNextLead,
    addLeadToFront,
    scheduleCallback,
  } = useCallQueue();
  const { status, startCall, endCall, reset } = useTelephonyBridge();
  const { agentPhone, callProviderMode } = useAgentConfig();

  const isConnecting = status === 'CONNECTING';
  const isActive = status === 'ACTIVE';
  const isDisposition = status === 'DISPOSITION';

  const handleStartCall = () => {
    if (!currentLead) return;
    startCall({
      agentPhone: agentPhone || MOCK_AGENT_PHONE,
      leadId: currentLead.id,
      mode: callProviderMode,
      rawPhoneNumber: currentLead.rawPhoneNumber,
    });
  };

  const handleSubmitDisposition = (submission: DispositionSubmission) => {
    // TODO: forward `submission` to the WhatsApp/SMS trigger pipeline once the backend exists.
    if (submission.disposition === 'CALLBACK_LATER' && submission.callbackAt) {
      scheduleCallback(submission.leadId, submission.callbackNote ?? '', submission.callbackAt);
    } else {
      advanceToNextLead();
    }
    reset();
  };

  return (
    <View className="flex-1">
      <DialerLineHeader
        agentPhone={agentPhone}
        isOnShift={isOnShift}
        onToggleShift={onToggleShift}
      />

      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 32 }}>
        <QueueTracker position={queuePosition} total={queueLength} />

        <Pressable
          onPress={onOpenAddLead}
          className="mt-4 min-h-[48px] flex-row items-center justify-center rounded-xl border border-dashed border-white/10 bg-slate-900"
        >
          <Plus size={18} color="#38bdf8" />
          <Text className="ml-2 text-sm font-semibold text-sky-400">Add Custom Lead</Text>
        </Pressable>

        <View className="mt-4">
          {currentLead ? (
            <LeadCard
              lead={currentLead}
              isConnecting={isConnecting}
              onStartCall={handleStartCall}
            />
          ) : (
            <View className="rounded-2xl border border-white/10 bg-slate-900 p-6">
              <Text className="text-center text-base text-slate-400">
                {isQueueComplete ? 'Queue complete. No more leads to call.' : 'Loading leads…'}
              </Text>
            </View>
          )}
        </View>

        {isActive && (
          <Pressable
            onPress={endCall}
            className="mt-5 min-h-[48px] flex-row items-center justify-center rounded-xl bg-rose-600"
          >
            <PhoneOff size={18} color="#ffffff" />
            <Text className="ml-2 text-base font-semibold text-white">
              End Call &amp; Log Outcome
            </Text>
          </Pressable>
        )}
      </ScrollView>

      {currentLead && isDisposition && (
        <PostCallDrawer
          visible={isDisposition}
          leadId={currentLead.id}
          onSubmit={handleSubmitDisposition}
        />
      )}

      <AddLeadSheet
        visible={isAddLeadVisible}
        onClose={onCloseAddLead}
        onAddLead={addLeadToFront}
      />
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
  const agentProfile = useAuthStore((state) => state.agentProfile);
  const role = useAuthStore((state) => state.role);
  const lockStatus = useShiftStore((state) => state.lockStatus);
  const lockedUntil = useShiftStore((state) => state.lockedUntil);
  const unreadBulletinCount = useUnreadBulletinCount();
  const hasKpiRevisionAlert = UPCOMING_KPI_REVISIONS.some((revision) => revision.role === role);
  const palette = useThemePalette();

  const { agentPhone, callProviderMode, setAgentPhone, setCallProviderMode } = useAgentConfig();

  const [currentScreen, setCurrentScreen] = useState<AppScreen>('DIALER');
  const [isStatusSheetOpen, setIsStatusSheetOpen] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isAddLeadVisible, setIsAddLeadVisible] = useState(false);
  const [isOnShift, setIsOnShift] = useState(true);

  const isShiftLocked = lockStatus === 'PENALIZED' && !!lockedUntil && Date.now() < lockedUntil;
  const shiftStatus: ShiftStatus = isShiftLocked ? 'LOCKED' : isOnShift ? 'ON_DUTY' : 'BREAK';

  return (
    <SafeAreaView className={`flex-1 ${palette.rootClassName}`} edges={['top', 'left', 'right']}>
      <GlobalAppHeader
        agentName={agentProfile?.legalName ?? 'Agent'}
        unreadBulletinCount={unreadBulletinCount}
        onOpenBulletins={() => setCurrentScreen('BULLETINS')}
        onOpenStatusSheet={() => setIsStatusSheetOpen(true)}
      />

      <View className="flex-1">
        {currentScreen === 'DIALER' && (
          <DialerScreen
            isAddLeadVisible={isAddLeadVisible}
            onOpenAddLead={() => setIsAddLeadVisible(true)}
            onCloseAddLead={() => setIsAddLeadVisible(false)}
            isOnShift={isOnShift}
            onToggleShift={() => setIsOnShift((previous) => !previous)}
          />
        )}
        {currentScreen === 'BULLETINS' && <BulletinsScreen />}
        {currentScreen === 'KPI' && <KpiEvaluationScreen />}
        {currentScreen === 'SHIFTS' && <ShiftBookingScreen />}
        {currentScreen === 'SCHEDULED_CALLBACKS' && (
          <ComingSoonScreen
            title="Scheduled Callbacks"
            description="Will resurface leads with a lastCallbackNote once queue state is shared globally instead of living inside DialerScreen."
          />
        )}
        {currentScreen === 'SITE_VISITS' && <ComingSoonScreen title="Site Visits & GPS Check-In" />}
        {currentScreen === 'WALLET' && <ComingSoonScreen title="Earnings & Wallet" />}
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
      />

      <MandatoryNoticeModal />

      <StatusBar style="light" />
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
  const palette = useThemePalette();
  const [screen, setScreen] = useState<'LOGIN' | 'REGISTER' | 'APP'>('LOGIN');

  if (screen === 'APP') {
    return <AppShell onLogout={() => setScreen('LOGIN')} />;
  }

  return (
    <SafeAreaView className={`flex-1 ${palette.rootClassName}`} edges={['top', 'left', 'right']}>
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
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <RootRouter />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}


