import type { AgentRole } from '../../auth/authTypes';
import type { KpiPolicyRevision, RoleKpiProfile } from '../kpiTypes';

/** Mock role-specific evaluation benchmarks (Module 6). Replace with a Head-Office-managed API. */
export const ROLE_KPI_PROFILES: Record<AgentRole, RoleKpiProfile> = {
  MICRO_CALLER: {
    role: 'MICRO_CALLER',
    benchmarks: [
      { label: 'Daily Dials', target: '80–120 calls/day' },
      { label: 'Connect Rate', target: '≥ 60%' },
      { label: 'Qualified Lead Transfers', target: '≥ 8/day' },
    ],
  },
  TELE_DESK: {
    role: 'TELE_DESK',
    benchmarks: [
      { label: 'Talk Time', target: '2.5h – 3h/day' },
      { label: 'Confirmed Site Visits Booked', target: '≥ 5/week' },
      { label: 'Audio Debrief Completion Rate', target: '≥ 95%' },
    ],
  },
  FIELD_CLOSER: {
    role: 'FIELD_CLOSER',
    benchmarks: [
      { label: 'Physical Tours Completed', target: '≥ 6/week' },
      { label: 'Tokens Secured', target: '≥ 2/week' },
      { label: 'GPS Check-In Compliance', target: '100%' },
    ],
  },
  ADMIN: {
    role: 'ADMIN',
    benchmarks: [{ label: 'Team Oversight', target: 'All region benchmarks green' }],
  },
};

/** Example upcoming policy revision — Head Office gives 7 days' advance notice. */
export const UPCOMING_KPI_REVISIONS: KpiPolicyRevision[] = [
  {
    role: 'MICRO_CALLER',
    effectiveInDays: 5,
    current: ROLE_KPI_PROFILES.MICRO_CALLER.benchmarks,
    upcoming: [
      { label: 'Daily Dials', target: '100–140 calls/day' },
      { label: 'Connect Rate', target: '≥ 65%' },
      { label: 'Qualified Lead Transfers', target: '≥ 10/day' },
    ],
  },
];
