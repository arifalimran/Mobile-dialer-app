import type { AgentRole } from '../../auth/authTypes';
import type { KpiPolicyRevision, RoleKpiProfile } from '../kpiTypes';

/** Mock role-specific evaluation benchmarks (Module 6). Replace with a Head-Office-managed API. */
export const ROLE_KPI_PROFILES: Record<AgentRole, RoleKpiProfile> = {
  FULL_TIME_SALES: {
    role: 'FULL_TIME_SALES',
    benchmarks: [
      { label: 'Weighted Gate', target: '75%+ unlock score' },
      { label: 'Deal Contribution', target: '65% of total wallet score' },
      { label: 'Operational Coverage', target: '7 metrics x 5% each' },
    ],
  },
  PART_TIME_SALES: {
    role: 'PART_TIME_SALES',
    benchmarks: [
      { label: 'Shift Utilization', target: '60+ monthly work hours' },
      { label: 'Callback Discipline', target: '95%+ adherence' },
      { label: 'Deal Momentum', target: '1 closed unit monthly' },
    ],
  },
  CALL_CENTER_MICRO_CALLER: {
    role: 'CALL_CENTER_MICRO_CALLER',
    benchmarks: [
      { label: 'Fresh Lead Coverage', target: '70%+ dial velocity' },
      { label: 'Audio Debriefs', target: '95%+ completion' },
      { label: 'Collections Support', target: '5 recoveries monthly' },
    ],
  },
  FREELANCER_AGENT: {
    role: 'FREELANCER_AGENT',
    benchmarks: [{ label: 'Independent Closing', target: 'Commission-led payout only' }],
  },
};

/** Example upcoming policy revision — Head Office gives 7 days' advance notice. */
export const UPCOMING_KPI_REVISIONS: KpiPolicyRevision[] = [
  {
    role: 'FULL_TIME_SALES',
    effectiveInDays: 5,
    current: ROLE_KPI_PROFILES.FULL_TIME_SALES.benchmarks,
    upcoming: [
      { label: 'Weighted Gate', target: '80%+ unlock score' },
      { label: 'Deal Contribution', target: '2 units weighted equivalent' },
      { label: 'Operational Coverage', target: '95% compliance health' },
    ],
  },
];
