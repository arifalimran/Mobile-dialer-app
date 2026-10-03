import type { MonthlySalaryGate, SalaryGateEvaluation, WalletBalanceSummary } from '../types';

export interface MonthlySalaryGateMetric {
  key: keyof MonthlySalaryGate;
  label: string;
  target: number;
  suffix: string;
  description: string;
  progressHint: string;
}

export const SAMPLE_MONTHLY_SALARY_GATE: MonthlySalaryGate = {
  workHoursLogged: 128,
  callbackAdherence: 1,
  newLeadDialVelocity: 0.78,
  verifiedSiteVisits: 4,
  installmentCollections: 6,
  closedWonDeals: 1,
  audioDebriefRate: 0.97,
  disputesUpheld: 0,
};

export const MONTHLY_SALARY_GATE_METRICS: MonthlySalaryGateMetric[] = [
  {
    key: 'workHoursLogged',
    label: 'Work Hours Logged',
    target: 120,
    suffix: 'hrs',
    description: 'Track shift adherence across all booked slots to maintain a full-duty production week.',
    progressHint: 'Target: 120.0 hrs across shift slots.',
  },
  {
    key: 'callbackAdherence',
    label: 'Callback Adherence',
    target: 1,
    suffix: '%',
    description: 'Complete all scheduled callback follow-ups within the daily coverage window to protect conversion quality.',
    progressHint: 'Target: 100% daily callback coverage.',
  },
  {
    key: 'newLeadDialVelocity',
    label: 'New Lead Dial Velocity',
    target: 0.7,
    suffix: '%',
    description: 'Keep a steady daily flow of fresh lead attempts to prevent queue stagnation and missed conversions.',
    progressHint: 'Target: 70% daily lead contact coverage.',
  },
  {
    key: 'verifiedSiteVisits',
    label: 'Verified Site Visits',
    target: 3,
    suffix: 'visits',
    description: 'Complete site inspections and handoff checks with head office verification on each visit.',
    progressHint: 'Target: 3 verified site visits per month.',
  },
  {
    key: 'installmentCollections',
    label: 'Installment Collections',
    target: 5,
    suffix: 'collections',
    description: 'Recover scheduled installment checks and document each payment in the ledger before the cut-off date.',
    progressHint: 'Target: 5 successful collections.',
  },
  {
    key: 'closedWonDeals',
    label: 'Closed-Won Deals',
    target: 1,
    suffix: 'unit',
    description: 'Lock a successful unit sale and confirm the sale record is closed with valid documentation.',
    progressHint: 'Target: 1 closed-won unit this month.',
  },
  {
    key: 'audioDebriefRate',
    label: 'Audio Debrief Rate',
    target: 0.95,
    suffix: '%',
    description: 'Submit call debriefs for nearly every call to support coaching, QA, and dispute resolution.',
    progressHint: 'Target: 95% of calls require an audio debrief.',
  },
  {
    key: 'disputesUpheld',
    label: 'Disputes Upheld',
    target: 0,
    suffix: 'violations',
    description: 'Avoid upheld dispute cases and compliance violations so the wallet remains in good standing.',
    progressHint: 'Target: 0 upheld disputes or violations.',
  },
];

export function evaluateSalaryGate(kpi: MonthlySalaryGate): SalaryGateEvaluation {
  const thresholdChecks = [
    kpi.workHoursLogged >= 120,
    kpi.callbackAdherence >= 1,
    kpi.newLeadDialVelocity >= 0.7,
    kpi.verifiedSiteVisits >= 3,
    kpi.installmentCollections >= 5,
    kpi.closedWonDeals >= 1,
    kpi.audioDebriefRate >= 0.95,
    kpi.disputesUpheld <= 0,
  ];

  const completedCount = thresholdChecks.filter(Boolean).length;

  return {
    isUnlocked: completedCount === thresholdChecks.length,
    completedCount,
    totalCriteria: 8,
  };
}

export function calculateBalances(kpi: MonthlySalaryGate): WalletBalanceSummary {
  const gate = evaluateSalaryGate(kpi);

  const commissionEarnings = kpi.closedWonDeals * 1500000 * 0.0125;
  const recoveryBounties = kpi.installmentCollections * 1500;
  const siteVisitFees = kpi.verifiedSiteVisits * 500;

  const baseSalary = gate.isUnlocked ? 20000 : 0;
  const clearedBalance = gate.isUnlocked ? baseSalary + commissionEarnings + recoveryBounties + siteVisitFees : commissionEarnings + recoveryBounties + siteVisitFees;

  return {
    baseSalary,
    baseSalaryStatus: gate.isUnlocked ? 'UNLOCKED / CLEARED' : 'LOCKED (KPI IN PROGRESS)',
    clearedBalance,
    pendingBalance: gate.isUnlocked ? 0 : 20000,
    commissionEarnings,
    recoveryBounties,
    siteVisitFees,
    totalAccrued: commissionEarnings + recoveryBounties + siteVisitFees,
  };
}
