export type MonthlySalaryGate = {
  workHoursLogged: number;
  callbackAdherence: number;
  newLeadDialVelocity: number;
  verifiedSiteVisits: number;
  installmentCollections: number;
  closedWonDeals: number;
  audioDebriefRate: number;
  disputesUpheld: number;
};

export interface SalaryGateEvaluation {
  isUnlocked: boolean;
  completedCount: number;
  totalCriteria: 8;
}

export interface WalletBalanceSummary {
  baseSalary: number;
  baseSalaryStatus: 'LOCKED (KPI IN PROGRESS)' | 'UNLOCKED / CLEARED';
  clearedBalance: number;
  pendingBalance: number;
  commissionEarnings: number;
  recoveryBounties: number;
  siteVisitFees: number;
  totalAccrued: number;
}
