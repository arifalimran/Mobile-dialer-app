# `src/features/kpi/` — Role-Based KPI Evaluation

## Purpose
Displays role-specific performance benchmarks and, when Head Office has
scheduled a benchmark revision, a side-by-side "Current vs New Policy"
comparison with a countdown.

## Files
- `kpiTypes.ts` — `KpiBenchmark`, `RoleKpiProfile`, `KpiPolicyRevision`.
- `constants/kpiBenchmarks.ts` — `ROLE_KPI_PROFILES` (mock benchmarks per `AgentRole`) and `UPCOMING_KPI_REVISIONS` (mock 7-day-notice revisions). Replace both with a Head-Office-managed API.
- `screens/KpiEvaluationScreen.tsx` — reads `role` from `useAuthStore`, renders the matching benchmark list, and — if a revision exists for that role — the amber "Effective in X Days" comparison card.

## Drawer badge
`App.tsx` computes `hasKpiRevisionAlert = UPCOMING_KPI_REVISIONS.some(r => r.role === role)`
and passes it to `AgentDrawerMenu` so the "My KPI & Evaluation Grounds" item
gets an amber alert dot whenever the signed-in role has a pending revision.
