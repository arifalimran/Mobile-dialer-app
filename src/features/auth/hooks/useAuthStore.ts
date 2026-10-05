import { create } from 'zustand';
import { EMPLOYEE_ROLE_PROFILES, getEmployeeRoleProfile } from '../constants/employeeProfiles';
import type { AgentProfile, AgentRole, EmployeeFeatureFlags, EmployeeStatus } from '../authTypes';

interface AuthState {
  isAuthenticated: boolean;
  role: AgentRole;
  featureFlags: EmployeeFeatureFlags;
  employeeStatus: EmployeeStatus;
  agentProfile: AgentProfile | null;
  loginAt: number | null;
  setRole: (role: AgentRole) => void;
  switchRole: (role: AgentRole) => void;
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
  const now = Date.now();
  const defaultRole: AgentRole = 'FULL_TIME_SALES';
  const profile = EMPLOYEE_ROLE_PROFILES[defaultRole];
  return {
    legalName: 'Imran Nahar',
    nidNumber: '0000000000',
    dateOfBirth: '1995-01-01',
    gender: 'Other',
    occupation: 'Freelancer',
    workPreference: 'FULL_TIME',
    phone: identifier.trim(),
    email: 'imran.nahar@spacemaker.local',
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
    role: defaultRole,
    employeeStatus: profile.defaultStatus,
    corporateSim: '+880 1711-***-88',
    sessionId: '#SES-8831',
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
  role: 'FULL_TIME_SALES',
  featureFlags: EMPLOYEE_ROLE_PROFILES.FULL_TIME_SALES.featureFlags,
  employeeStatus: EMPLOYEE_ROLE_PROFILES.FULL_TIME_SALES.defaultStatus,
  agentProfile: null,
  loginAt: null,
  setRole: (role) => {
    const profile = getEmployeeRoleProfile(role);
    set((state) => ({
      role,
      featureFlags: profile.featureFlags,
      employeeStatus: profile.defaultStatus,
      agentProfile: state.agentProfile
        ? {
            ...state.agentProfile,
            role,
            employeeStatus: profile.defaultStatus,
          }
        : state.agentProfile,
    }));
  },
  switchRole: (role) => {
    const profile = getEmployeeRoleProfile(role);
    set((state) => ({
      role,
      featureFlags: profile.featureFlags,
      employeeStatus: profile.defaultStatus,
      agentProfile: state.agentProfile
        ? {
            ...state.agentProfile,
            role,
            employeeStatus: profile.defaultStatus,
          }
        : state.agentProfile,
    }));
  },
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
      featureFlags: getEmployeeRoleProfile(profile.role).featureFlags,
      employeeStatus: getEmployeeRoleProfile(profile.role).defaultStatus,
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
    const nextRoleProfile = getEmployeeRoleProfile(nextProfile.role);
    set({
      isAuthenticated: true,
      loginAt: Date.now(),
      role: nextProfile.role,
      featureFlags: nextRoleProfile.featureFlags,
      employeeStatus: nextRoleProfile.defaultStatus,
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
      role: 'FULL_TIME_SALES',
      featureFlags: EMPLOYEE_ROLE_PROFILES.FULL_TIME_SALES.featureFlags,
      employeeStatus: EMPLOYEE_ROLE_PROFILES.FULL_TIME_SALES.defaultStatus,
      agentProfile: null,
    }),
  verifyKyc: () =>
    set((state) =>
      state.agentProfile
        ? { agentProfile: { ...state.agentProfile, kycStatus: 'VERIFIED' } }
        : state,
    ),
}));
