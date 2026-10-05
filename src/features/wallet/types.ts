import type { AgentRole, EmployeeStatus } from '../auth/authTypes';

export type MonthlySalaryGate = {
  activeDays: number;
  workHoursLogged: number;
  callbackAdherence: number;
  newLeadDialVelocity: number;
  verifiedSiteVisits: number;
  installmentCollections: number;
  closedWonDeals: number;
  audioDebriefRate: number;
  complianceHealth: number;
};

export interface WeightedMetricResult {
  key: keyof MonthlySalaryGate;
  label: string;
  value: number;
  target: number;
  weight: number;
  normalizedScore: number;
}

export interface SalaryGateEvaluation {
  isUnlocked: boolean;
  weightedScore: number;
  completedCount: number;
  totalCriteria: number;
  dealScore: number;
  operationalScore: number;
  metricBreakdown: WeightedMetricResult[];
}

export interface WalletBalanceSummary {
  role: AgentRole;
  employeeStatus: EmployeeStatus;
  baseSalary: number;
  baseSalaryStatus: 'LOCKED (KPI IN PROGRESS)' | 'UNLOCKED / CLEARED';
  clearedBalance: number;
  pendingBalance: number;
  commissionEarnings: number;
  activeDaysAllowance: number;
  attendanceAllowance: number;
  mobileBillAllowance: number;
  siteVisitAllowance: number;
  totalAccrued: number;
}
