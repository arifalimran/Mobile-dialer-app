import { create } from 'zustand';
import type { AgentProfile, AgentRole } from '../authTypes';

interface AuthState {
  isAuthenticated: boolean;
  role: AgentRole;
  agentProfile: AgentProfile | null;
  loginAt: number | null;
  setRole: (role: AgentRole) => void;
  submitRegistration: (profile: Omit<AgentProfile, 'kycStatus' | 'submittedAt'>) => void;
  /** Mock Corporate Phone/ID + PIN check — accepts any non-empty pair (no backend yet). */
  login: (identifier: string, pin: string) => boolean;
  logout: () => void;
  /**
   * Dev/testing convenience: simulates Head Office instantly approving a
   * pending KYC submission. There is no real approval backend yet, so
   * without this the "Application Under Review" screen would be a
   * permanent dead end during local testing.
   */
  verifyKyc: () => void;
}

function buildMockProfile(identifier: string): AgentProfile {
  const normalized = identifier.trim();
  const now = Date.now();
  return {
    legalName: 'Demo Agent',
    nidNumber: '0000000000',
    dateOfBirth: '1995-01-01',
    gender: 'Other',
    occupation: 'Freelancer',
    workPreference: 'FULL_TIME',
    phone: normalized,
    email: 'demo.agent@spacemaker.local',
    permanentAddress: {
      division: 'Dhaka',
      district: 'Dhaka',
      thana: 'Tejgaon',
      roadOrVillage: 'Demo House',
    },
    presentAddress: {
      division: 'Dhaka',
      district: 'Dhaka',
      thana: 'Tejgaon',
      roadOrVillage: 'Demo House',
    },
    reference: {
      fullName: 'Demo Reference',
      contactPhone: '01700000000',
      fullAddress: 'Dhaka',
    },
    role: 'MICRO_CALLER',
    corporateSim: normalized,
    kycStatus: 'VERIFIED',
    submittedAt: now,
  };
}

/**
 * Session + KYC identity store (Module 7 / Module 2 auth routing).
 * Persisted through the existing SecureStore adapter so raw NID/phone data
 * never touches AsyncStorage.
 *
 * Strict session routing (Module 2): `isAuthenticated` defaults to `false`
 * and is never auto-set on launch — `App.tsx` routes to `LoginScreen`
 * whenever it's false, rather than defaulting into a mock dialer session.
 */
export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  role: 'MICRO_CALLER',
  agentProfile: null,
  loginAt: null,
  setRole: (role) => set({ role }),
  submitRegistration: (profile) =>
    set({
      isAuthenticated: false,
      loginAt: null,
      agentProfile: {
        ...profile,
        kycStatus: 'VERIFIED',
        submittedAt: Date.now(),
      },
      role: profile.role,
    }),
  login: (identifier, pin) => {
    const normalizedIdentifier = (identifier ?? '').trim();
    const normalizedPin = (pin ?? '').trim();
    const knownCredentials = normalizedIdentifier === 'imrannahar' && normalizedPin === '123456';

    if (!normalizedIdentifier || !normalizedPin) {
      set({
        isAuthenticated: false,
        loginAt: null,
        agentProfile: null,
      });
      return false;
    }

    if (!knownCredentials) {
      set({
        isAuthenticated: false,
        loginAt: null,
        agentProfile: null,
      });
      return false;
    }

    const nextProfile = buildMockProfile(normalizedIdentifier);
    set({
      isAuthenticated: true,
      loginAt: Date.now(),
      role: nextProfile.role,
      agentProfile: {
        ...nextProfile,
        kycStatus: 'VERIFIED',
      },
    });
    return true;
  },
  logout: () =>
    set({
      isAuthenticated: false,
      loginAt: null,
      role: 'MICRO_CALLER',
      agentProfile: null,
    }),
  verifyKyc: () =>
    set((state) =>
      state.agentProfile
        ? { agentProfile: { ...state.agentProfile, kycStatus: 'VERIFIED' } }
        : state,
    ),
}));
