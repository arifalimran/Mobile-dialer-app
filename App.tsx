import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
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

import { ThemeProvider, useAppTheme } from './src/theme/ThemeContext';
import { DynamicWatermark } from './src/components/security/DynamicWatermark';
import { ScheduledCallbacksScreen } from './src/features/callbacks/screens/ScheduledCallbacksScreen';
import { StackingMatrixScreen } from './src/features/inventory/screens/StackingMatrixScreen';
import { WalletScreen } from './src/features/wallet/screens/WalletScreen';
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
  const { colors } = useAppTheme();
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
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <DialerLineHeader
        agentPhone={agentPhone}
        isOnShift={isOnShift}
        onToggleShift={onToggleShift}
      />

      <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }} contentContainerStyle={{ paddingBottom: 32 }}>
        <QueueTracker position={queuePosition} total={queueLength} />

        <Pressable
          onPress={onOpenAddLead}
          style={{ marginTop: 16, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card }}
        >
          <Plus size={18} color={colors.accent} />
          <Text style={{ marginLeft: 8, fontSize: 14, fontWeight: '700', color: colors.accent }}>Add Custom Lead</Text>
        </Pressable>

        <View style={{ marginTop: 16 }}>
          {currentLead ? (
            <LeadCard
              lead={currentLead}
              isConnecting={isConnecting}
              onStartCall={handleStartCall}
            />
          ) : (
            <View style={{ borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 24 }}>
              <Text style={{ textAlign: 'center', fontSize: 16, color: colors.textSecondary }}>
                {isQueueComplete ? 'Queue complete. No more leads to call.' : 'Loading leads…'}
              </Text>
            </View>
          )}
        </View>

        {isActive && (
          <Pressable
            onPress={endCall}
            style={{ marginTop: 20, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#F43F5E' }}
          >
            <PhoneOff size={18} color="#FFFFFF" />
            <Text style={{ marginLeft: 8, fontSize: 15, fontWeight: '700', color: '#FFFFFF' }}>
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
  const { colors, theme } = useAppTheme();
  const agentProfile = useAuthStore((state) => state.agentProfile);
  const role = useAuthStore((state) => state.role);
  const lockStatus = useShiftStore((state) => state.lockStatus);
  const lockedUntil = useShiftStore((state) => state.lockedUntil);
  const unreadBulletinCount = useUnreadBulletinCount();
  const hasKpiRevisionAlert = UPCOMING_KPI_REVISIONS.some((revision) => revision.role === role);

  const { agentPhone, callProviderMode, setAgentPhone, setCallProviderMode } = useAgentConfig();

  const [currentScreen, setCurrentScreen] = useState<AppScreen>('DIALER');
  const [isStatusSheetOpen, setIsStatusSheetOpen] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isAddLeadVisible, setIsAddLeadVisible] = useState(false);
  const [isOnShift, setIsOnShift] = useState(true);
  const [bridgeLead, setBridgeLead] = useState<{ id: string; leadName: string; phone: string } | null>(null);

  const isShiftLocked = lockStatus === 'PENALIZED' && !!lockedUntil && Date.now() < lockedUntil;
  const shiftStatus: ShiftStatus = isShiftLocked ? 'LOCKED' : isOnShift ? 'ON_DUTY' : 'BREAK';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.canvas }} edges={['top', 'left', 'right']}>
      <DynamicWatermark agentId={agentProfile?.corporateSim ?? 'AGT-01'} />
      <GlobalAppHeader
        agentName={agentProfile?.legalName ?? 'Agent'}
        unreadBulletinCount={unreadBulletinCount}
        onOpenBulletins={() => setCurrentScreen('BULLETINS')}
        onOpenStatusSheet={() => setIsStatusSheetOpen(true)}
      />

      <View style={{ flex: 1, backgroundColor: colors.canvas }}>
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
        {currentScreen === 'CALLBACKS' && (
          <ScheduledCallbacksScreen
            onBridgeCall={(lead) => {
              setBridgeLead({
                id: lead.id,
                leadName: lead.leadName,
                phone: lead.phone,
              });
            }}
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
      />

      <MandatoryNoticeModal />

      <Modal visible={Boolean(bridgeLead)} transparent animationType="slide" onRequestClose={() => setBridgeLead(null)}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ width: '100%', borderTopWidth: 1, borderTopColor: colors.border, borderRadius: 24, backgroundColor: colors.card, padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>Bridge Call</Text>
            <Text style={{ marginTop: 6, fontSize: 14, color: colors.textSecondary }}>
              {bridgeLead?.leadName ?? 'Lead'} is ready to connect through the licensed PBX bridge.
            </Text>
            <Pressable
              onPress={() => setBridgeLead(null)}
              style={{ marginTop: 20, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: colors.accent }}
            >
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>Proceed to Bridge</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

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


