import { create } from 'zustand';

import type { CallProviderMode, CallStatus } from '../callingTypes';
import { placeCall } from '../services/callProviders';

interface StartCallParams {
  agentPhone: string;
  leadId: string;
  mode: CallProviderMode;
  rawPhoneNumber?: string;
}

interface TelephonyBridgeState {
  status: CallStatus;
  activeLeadId: string | null;
  error: string | null;
  startCall: (params: StartCallParams) => Promise<void>;
  endCall: () => void;
  reset: () => void;
}

export const useTelephonyBridge = create<TelephonyBridgeState>((set) => ({
  status: 'IDLE',
  activeLeadId: null,
  error: null,

  startCall: async ({ agentPhone, leadId, mode, rawPhoneNumber }) => {
    set({ status: 'CONNECTING', activeLeadId: leadId, error: null });

    const result = await placeCall({
      mode,
      request: { agentPhone, leadId },
      rawPhoneNumber,
    });

    if (result.success) {
      set({ status: 'ACTIVE' });
    } else {
      set({
        status: 'IDLE',
        activeLeadId: null,
        error: result.error ?? 'Failed to place call',
      });
    }
  },

  endCall: () => set({ status: 'DISPOSITION' }),

  reset: () => set({ status: 'IDLE', activeLeadId: null, error: null }),
}));
