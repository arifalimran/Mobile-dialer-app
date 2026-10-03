import * as SecureStore from 'expo-secure-store';
import type { StateStorage } from 'zustand/middleware';

/**
 * Zustand-compatible storage adapter backed by expo-secure-store.
 * Used only for non-sensitive-to-agent, agent-owned data (e.g. the agent's
 * own phone number / calling preferences) — never for customer/lead data.
 */
export const secureStorage: StateStorage = {
  getItem: async (name) => {
    return (await SecureStore.getItemAsync(name)) ?? null;
  },
  setItem: async (name, value) => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name) => {
    await SecureStore.deleteItemAsync(name);
  },
};
