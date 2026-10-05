import { create } from 'zustand';

import type { CallProviderMode, CallStatus } from '../callingTypes';
import { placeCall } from '../services/callProviders';

interface StartCallParams {
  agentPhone: string;
  leadId: string;
  mode: CallProviderMode;
  rawPhoneNumber?: string;
  leadName?: string;
  maskedPhoneNumber?: string;
}

interface TelephonyBridgeState {
  status: CallStatus;
  activeLeadId: string | null;
  activeLeadName: string | null;
  activePhone: string | null;
  activeMode: CallProviderMode | null;
  shouldOpenDispositionOnForeground: boolean;
  callDurationSeconds: number;
  error: string | null;
  startCall: (params: StartCallParams) => Promise<void>;
  endCall: () => void;
  handleNativeDialerReturn: () => void;
  reset: () => void;
}

let activeTimer: ReturnType<typeof setInterval> | null = null;

export const useTelephonyBridge = create<TelephonyBridgeState>((set) => ({
  status: 'IDLE',
  activeLeadId: null,
  activeLeadName: null,
  activePhone: null,
  activeMode: null,
  shouldOpenDispositionOnForeground: false,
  callDurationSeconds: 0,
  error: null,

  startCall: async ({ agentPhone, leadId, mode, rawPhoneNumber, leadName, maskedPhoneNumber }) => {
    if (activeTimer) {
      clearInterval(activeTimer);
      activeTimer = null;
    }

    set({
      status: 'CONNECTING',
      activeLeadId: leadId,
      activeLeadName: leadName ?? null,
      activePhone: maskedPhoneNumber ?? rawPhoneNumber ?? null,
      callDurationSeconds: 0,
      error: null,
    });

    const result = await placeCall({
      mode,
      request: { agentPhone, leadId },
      rawPhoneNumber,
    });

    if (result.success) {
      if (result.mode === 'IPTSP_BRIDGE') {
        const startedAt = Date.now();
        activeTimer = setInterval(() => {
          set((state) => ({
            ...state,
            callDurationSeconds: Math.floor((Date.now() - startedAt) / 1000),
          }));
        }, 1000);
      }

      set({
        status: 'ACTIVE',
        activeLeadId: leadId,
        activeLeadName: leadName ?? null,
        activePhone: maskedPhoneNumber ?? rawPhoneNumber ?? null,
        activeMode: result.mode,
        shouldOpenDispositionOnForeground: result.mode === 'DIRECT_NATIVE_DIALER',
      });
    } else {
      if (activeTimer) {
        clearInterval(activeTimer);
        activeTimer = null;
      }

      set({
        status: 'IDLE',
        activeLeadId: null,
        activeLeadName: null,
        activePhone: null,
        activeMode: null,
        shouldOpenDispositionOnForeground: false,
        callDurationSeconds: 0,
        error: result.error ?? 'Failed to place call',
      });
    }
  },

  endCall: () => {
    if (activeTimer) {
      clearInterval(activeTimer);
      activeTimer = null;
    }

    set({
      status: 'DISPOSITION',
      shouldOpenDispositionOnForeground: false,
      callDurationSeconds: 0,
      error: null,
    });
  },

  handleNativeDialerReturn: () => {
    if (activeTimer) {
      clearInterval(activeTimer);
      activeTimer = null;
    }

    set((state) => {
      if (state.activeMode !== 'DIRECT_NATIVE_DIALER' || !state.shouldOpenDispositionOnForeground) {
        return state;
      }

      return {
        ...state,
        status: 'DISPOSITION',
        shouldOpenDispositionOnForeground: false,
        callDurationSeconds: 0,
      };
    });
  },

  reset: () => {
    if (activeTimer) {
      clearInterval(activeTimer);
      activeTimer = null;
    }

    set({
      status: 'IDLE',
      activeLeadId: null,
      activeLeadName: null,
      activePhone: null,
      activeMode: null,
      shouldOpenDispositionOnForeground: false,
      callDurationSeconds: 0,
      error: null,
    });
  },
}));
