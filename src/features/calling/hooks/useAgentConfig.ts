import { create } from 'zustand';

import type { AgentConfig, CallProviderMode } from '../callingTypes';

interface AgentConfigState extends AgentConfig {
  setAgentPhone: (agentPhone: string) => void;
  setCallProviderMode: (callProviderMode: CallProviderMode) => void;
}

export const useAgentConfig = create<AgentConfigState>((set) => ({
  agentPhone: '',
  callProviderMode: 'IPTSP_BRIDGE',
  setAgentPhone: (agentPhone) => set({ agentPhone }),
  setCallProviderMode: (callProviderMode) => set({ callProviderMode }),
}));
