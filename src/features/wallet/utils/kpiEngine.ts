import { getEmployeeRoleProfile } from '../../auth/constants/employeeProfiles';
import type { AgentRole, EmployeeStatus } from '../../auth/authTypes';
import type { MonthlySalaryGate, SalaryGateEvaluation, WalletBalanceSummary } from '../types';

export interface MonthlySalaryGateMetric {
  key: keyof MonthlySalaryGate;
  label: string;
  target: number;
  suffix: string;
  weight: number;
  description: string;
  progressHint: string;
}

export const MONTHLY_SALARY_GATE_METRICS: MonthlySalaryGateMetric[] = [
  {
    key: 'activeDays',
    label: 'Active Days',
    target: 26,
    suffix: 'days',
    weight: 5,
    description: 'Stay operational across the month so queue, inventory, and client follow-up stay covered.',
    progressHint: 'Target: maintain consistent active work days across the full month.',
  },
  {
    key: 'workHoursLogged',
    label: 'Work Hours Logged',
    target: 120,
    suffix: 'hrs',
    weight: 5,
    description: 'Track shift adherence across all booked slots to maintain a full-duty production week.',
    progressHint: 'Target: 120.0 hrs across shift slots.',
  },
  {
    key: 'callbackAdherence',
    label: 'Callback Adherence',
    target: 1,
    suffix: '%',
    weight: 5,
    description: 'Complete all scheduled callback follow-ups within the daily coverage window to protect conversion quality.',
    progressHint: 'Target: 100% daily callback coverage.',
  },
  {
    key: 'newLeadDialVelocity',
    label: 'New Lead Dial Velocity',
    target: 0.7,
    suffix: '%',
    weight: 5,
    description: 'Keep a steady daily flow of fresh lead attempts to prevent queue stagnation and missed conversions.',
    progressHint: 'Target: 70% daily lead contact coverage.',
  },
  {
    key: 'verifiedSiteVisits',
    label: 'Verified Site Visits',
    target: 3,
    suffix: 'visits',
    weight: 5,
    description: 'Complete site inspections and handoff checks with head office verification on each visit.',
    progressHint: 'Target: 3 verified site visits per month.',
  },
  {
    key: 'installmentCollections',
    label: 'Installment Collections',
    target: 5,
    suffix: 'collections',
    weight: 5,
    description: 'Recover scheduled installment checks and document each payment in the ledger before the cut-off date.',
    progressHint: 'Target: 5 successful collections.',
  },
  {
    key: 'audioDebriefRate',
    label: 'Audio Debrief Rate',
    target: 0.95,
    suffix: '%',
    weight: 5,
    description: 'Submit call debriefs for nearly every call to support coaching, QA, and dispute resolution.',
    progressHint: 'Target: 95% of calls require an audio debrief.',
  },
  {
    key: 'complianceHealth',
    label: 'Compliance Health',
    target: 1,
    suffix: '%',
    weight: 5,
    description: 'Keep compliance quality at a clean pass rate so operational payouts remain active.',
    progressHint: 'Target: maintain a clean compliance record throughout the month.',
  },
];

export function getSampleMonthlySalaryGate(role: AgentRole): MonthlySalaryGate {
  if (role === 'FREELANCER_AGENT') {
    return {
      activeDays: 12,
      workHoursLogged: 0,
      callbackAdherence: 0,
      newLeadDialVelocity: 0,
      verifiedSiteVisits: 1,
      installmentCollections: 2,
      closedWonDeals: 2,
      audioDebriefRate: 0,
      complianceHealth: 1,
    };
  }

  if (role === 'CALL_CENTER_MICRO_CALLER') {
    return {
      activeDays: 24,
      workHoursLogged: 122,
      callbackAdherence: 0.96,
      newLeadDialVelocity: 0.74,
      verifiedSiteVisits: 0,
      installmentCollections: 3,
      closedWonDeals: 0,
      audioDebriefRate: 0.98,
      complianceHealth: 1,
    };
  }

  if (role === 'PART_TIME_SALES') {
    return {
      activeDays: 18,
      workHoursLogged: 58,
      callbackAdherence: 0.94,
      newLeadDialVelocity: 0.68,
      verifiedSiteVisits: 2,
      installmentCollections: 4,
      closedWonDeals: 1,
      audioDebriefRate: 0.95,
      complianceHealth: 1,
    };
  }

  return {
    activeDays: 27,
    workHoursLogged: 128,
    callbackAdherence: 1,
    newLeadDialVelocity: 0.78,
    verifiedSiteVisits: 4,
    installmentCollections: 6,
    closedWonDeals: 1,
    audioDebriefRate: 0.97,
    complianceHealth: 1,
  };
}

function getNormalizedMetricScore(kpi: MonthlySalaryGate, metric: MonthlySalaryGateMetric): number {
  const currentValue = Number(kpi[metric.key] ?? 0);
  return Math.max(0, Math.min(1, currentValue / metric.target));
}

export function evaluateSalaryGate(kpi: MonthlySalaryGate, role: AgentRole): SalaryGateEvaluation {
  const roleProfile = getEmployeeRoleProfile(role);
  const applicableMetrics = MONTHLY_SALARY_GATE_METRICS.filter((metric) => {
    if (role === 'FREELANCER_AGENT') {
      return metric.key === 'installmentCollections' || metric.key === 'verifiedSiteVisits' || metric.key === 'complianceHealth';
    }
    if (role === 'CALL_CENTER_MICRO_CALLER') {
      return metric.key !== 'verifiedSiteVisits';
    }
    return true;
  });

  const metricBreakdown = applicableMetrics.map((metric) => ({
    key: metric.key,
    label: metric.label,
    value: Number(kpi[metric.key] ?? 0),
    target: metric.target,
    weight: metric.weight,
    normalizedScore: getNormalizedMetricScore(kpi, metric),
  }));

  const operationalScore = metricBreakdown.reduce((total, metric) => total + metric.normalizedScore * metric.weight, 0);
  const dealScore = Math.min(65, (kpi.closedWonDeals / Math.max(1, roleProfile.closingGateRatio > 0 ? 1 : 2)) * 65);
  const weightedScore = Number((operationalScore + dealScore).toFixed(1));
  const completedCount = metricBreakdown.filter((metric) => metric.normalizedScore >= 1).length + (dealScore >= 65 ? 1 : 0);

  return {
    isUnlocked: weightedScore >= 75,
    weightedScore,
    completedCount,
    totalCriteria: metricBreakdown.length + 1,
    dealScore,
    operationalScore: Number(operationalScore.toFixed(1)),
    metricBreakdown,
  };
}

export function calculateBalances(kpi: MonthlySalaryGate, role: AgentRole, employeeStatus: EmployeeStatus): WalletBalanceSummary {
  const roleProfile = getEmployeeRoleProfile(role);
  const gate = evaluateSalaryGate(kpi, role);

  const commissionEarnings = kpi.closedWonDeals * 1500000 * roleProfile.commissionRate;
  const activeDaysAllowance = Math.min(kpi.activeDays, roleProfile.activeDaysTarget) * 150;
  const attendanceAllowance = Math.min(kpi.activeDays, roleProfile.activeDaysTarget) * roleProfile.attendanceAllowancePerDay;
  const mobileBillAllowance = gate.isUnlocked ? roleProfile.mobileBillAllowance : 0;
  const siteVisitAllowance = gate.isUnlocked ? roleProfile.siteVisitAllowance : 0;

  const baseSalary = gate.isUnlocked ? roleProfile.baseSalary : 0;
  const clearedBalance = gate.isUnlocked
    ? baseSalary + commissionEarnings + activeDaysAllowance + attendanceAllowance + mobileBillAllowance + siteVisitAllowance
    : commissionEarnings + activeDaysAllowance;

  return {
    role,
    employeeStatus,
    baseSalary,
    baseSalaryStatus: gate.isUnlocked ? 'UNLOCKED / CLEARED' : 'LOCKED (KPI IN PROGRESS)',
    clearedBalance,
    pendingBalance: gate.isUnlocked ? 0 : roleProfile.baseSalary,
    commissionEarnings,
    activeDaysAllowance,
    attendanceAllowance,
    mobileBillAllowance,
    siteVisitAllowance,
    totalAccrued: commissionEarnings + activeDaysAllowance + attendanceAllowance + mobileBillAllowance + siteVisitAllowance,
  };
}
