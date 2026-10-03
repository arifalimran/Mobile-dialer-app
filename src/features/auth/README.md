# `src/features/auth/` — KYC Registration & Session/Role Store

## Purpose
Owns agent identity: the 3-step KYC registration wizard, the persisted
session/role store, and Bangladesh-specific validation helpers (NID format,
age gate) plus a lightweight Division → District → Thana address dataset.

## Files
- `authTypes.ts` — `AgentRole`, `AgentProfile`, `KycStatus`, `AddressDetails`, `ReferencePerson`.
- `constants/bangladeshAddressData.ts` — partial static address cascade dataset (`DIVISIONS`, `DISTRICTS_BY_DIVISION`, `THANAS_BY_DISTRICT`) + `getDistricts()`/`getThanas()` helpers. **Not** nationwide-complete — swap for a generated dataset or backend lookup later.
- `utils/validateNid.ts` — `isValidNid()` (10/13/17-digit BD NID formats), `isAtLeast18YearsOld()`, `isIsoDateShape()`.
- `hooks/useAuthStore.ts` — Zustand store persisted via the shared `secureStorage` (SecureStore) adapter. Holds `role`, `agentProfile`, `loginAt` (used for the header's session-elapsed ticker).
- `screens/AgentRegistrationScreen.tsx` — 3-step wizard (Identity → Contact/Address → Reference). Uses the shared `SelectModal` primitive (`src/components/SelectModal.tsx`) for the address cascade pickers.

## Important trade-off: KYC gating is soft, not hard
There is no backend yet to approve/reject a submitted registration.
`submitRegistration()` truthfully records `kycStatus: 'PENDING_VERIFICATION'`
(surfaced as a badge in the drawer/header), but the app does **not**
hard-block dialer access after submission — otherwise the app would be
untestable end-to-end with no way to ever get approved. `App.tsx` only gates
on `agentProfile === null` (i.e. registration has never been submitted at
all); once submitted, the agent proceeds into the app with a visible
"Pending Verification" status. Wire a real approval gate once Head Office
review exists server-side.

## Extending
- Full address dataset: replace `bangladeshAddressData.ts` or swap the
  `getDistricts`/`getThanas` calls for an API-backed lookup.
- Real login/logout: `useAuthStore.login()`/`logout()` currently only
  set/clear the `loginAt` timestamp used for the session ticker; there is no
  password/OTP flow.
