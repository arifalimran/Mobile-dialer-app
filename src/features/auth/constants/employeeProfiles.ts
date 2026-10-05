import type { BottomNavScreen } from '../../../types/navigation';
import type { AgentRole, EmployeeFeatureFlags, EmployeeStatus } from '../authTypes';

export interface EmployeeRoleProfile {
  role: AgentRole;
  label: string;
  monthlyTargetHours: number;
  baseSalary: number;
  closingGateRatio: number;
  commissionRate: number;
  visitBounty: number;
  mobileBillAllowance: number;
  siteVisitAllowance: number;
  attendanceAllowancePerDay: number;
  activeDaysTarget: number;
  defaultStatus: EmployeeStatus;
  tierLabel: string;
  featureFlags: EmployeeFeatureFlags;
  visibleTabs: BottomNavScreen[];
}

export const EMPLOYEE_ROLE_ORDER: AgentRole[] = [
  'FULL_TIME_SALES',
  'PART_TIME_SALES',
  'CALL_CENTER_MICRO_CALLER',
  'FREELANCER_AGENT',
];

export const EMPLOYEE_ROLE_PROFILES: Record<AgentRole, EmployeeRoleProfile> = {
  FULL_TIME_SALES: {
    role: 'FULL_TIME_SALES',
    label: 'Full-Time Sales',
    monthlyTargetHours: 120,
    baseSalary: 12000,
    closingGateRatio: 0.65,
    commissionRate: 0.002,
    visitBounty: 0,
    mobileBillAllowance: 2000,
    siteVisitAllowance: 6000,
    attendanceAllowancePerDay: 300,
    activeDaysTarget: 30,
    defaultStatus: 'PROBATION',
    tierLabel: 'Gold Caller',
    featureFlags: {
      canUseDialer: true,
      canUseCallbacks: true,
      canUseInventory: true,
      canUseWallet: true,
      canUseShifts: true,
      canUseKpi: true,
      canUseSiteVisits: true,
      canPlaceInventoryHold: true,
    },
    visibleTabs: ['DASHBOARD', 'DIALER', 'CALLBACKS', 'INVENTORY', 'WALLET', 'SHIFTS'],
  },
  PART_TIME_SALES: {
    role: 'PART_TIME_SALES',
    label: 'Part-Time Sales',
    monthlyTargetHours: 60,
    baseSalary: 6000,
    closingGateRatio: 0.5,
    commissionRate: 0.002,
    visitBounty: 0,
    mobileBillAllowance: 2000,
    siteVisitAllowance: 3000,
    attendanceAllowancePerDay: 300,
    activeDaysTarget: 20,
    defaultStatus: 'PROBATION',
    tierLabel: 'Growth Caller',
    featureFlags: {
      canUseDialer: true,
      canUseCallbacks: true,
      canUseInventory: true,
      canUseWallet: true,
      canUseShifts: true,
      canUseKpi: true,
      canUseSiteVisits: true,
      canPlaceInventoryHold: true,
    },
    visibleTabs: ['DASHBOARD', 'DIALER', 'CALLBACKS', 'INVENTORY', 'WALLET', 'SHIFTS'],
  },
  CALL_CENTER_MICRO_CALLER: {
    role: 'CALL_CENTER_MICRO_CALLER',
    label: 'Call Center Micro Caller',
    monthlyTargetHours: 120,
    baseSalary: 8000,
    closingGateRatio: 0,
    commissionRate: 0,
    visitBounty: 500,
    mobileBillAllowance: 0,
    siteVisitAllowance: 0,
    attendanceAllowancePerDay: 300,
    activeDaysTarget: 30,
    defaultStatus: 'PROBATION',
    tierLabel: 'Operations Caller',
    featureFlags: {
      canUseDialer: true,
      canUseCallbacks: true,
      canUseInventory: true,
      canUseWallet: true,
      canUseShifts: true,
      canUseKpi: true,
      canUseSiteVisits: false,
      canPlaceInventoryHold: false,
    },
    visibleTabs: ['DASHBOARD', 'DIALER', 'CALLBACKS', 'INVENTORY', 'WALLET', 'SHIFTS'],
  },
  FREELANCER_AGENT: {
    role: 'FREELANCER_AGENT',
    label: 'Freelancer Partner',
    monthlyTargetHours: 0,
    baseSalary: 0,
    closingGateRatio: 0,
    commissionRate: 0.015,
    visitBounty: 0,
    mobileBillAllowance: 0,
    siteVisitAllowance: 0,
    attendanceAllowancePerDay: 0,
    activeDaysTarget: 0,
    defaultStatus: 'PERMANENT',
    tierLabel: 'Independent Closer',
    featureFlags: {
      canUseDialer: false,
      canUseCallbacks: false,
      canUseInventory: true,
      canUseWallet: true,
      canUseShifts: false,
      canUseKpi: true,
      canUseSiteVisits: false,
      canPlaceInventoryHold: true,
    },
    visibleTabs: ['DASHBOARD', 'INVENTORY', 'WALLET'],
  },
};

export function getEmployeeRoleProfile(role: AgentRole): EmployeeRoleProfile {
  return EMPLOYEE_ROLE_PROFILES[role];
}