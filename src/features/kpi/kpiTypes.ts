import type { AgentRole } from '../auth/authTypes';

export interface KpiBenchmark {
  label: string;
  target: string;
}

export interface RoleKpiProfile {
  role: AgentRole;
  benchmarks: KpiBenchmark[];
}

export interface KpiPolicyRevision {
  role: AgentRole;
  effectiveInDays: number;
  current: KpiBenchmark[];
  upcoming: KpiBenchmark[];
}
