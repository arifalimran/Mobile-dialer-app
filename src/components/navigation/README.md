# `src/components/navigation/` — Global App Chrome

## Purpose
Global (not calling-feature-specific) navigation chrome: the persistent top
header with live telemetry, and the role-gated slide-out drawer menu.

## Files
- `AppHeader.tsx` — Module 1. Brand/hub row, agent badge (name, corporate SIM, role pill), 1-tap dark/light theme toggle (`useThemeStore`), hamburger button, and a live telemetry sub-strip:
  - BST clock, ticking every second (`toBstParts()` computes a fixed UTC+6 offset manually — no reliance on device timezone or `Intl`, since Bangladesh doesn't observe DST).
  - Session-elapsed ticker, derived from `useAuthStore().loginAt`.
  - Shift status pill (`ON_DUTY` / `BREAK` / `LOCKED`), driven by a `shiftStatus` prop that `App.tsx` computes from the existing calling on/off-shift toggle plus `useShiftStore().lockStatus`.

  **Naming note:** this is a *different* component from
  `src/features/calling/components/AppHeader.tsx` (the dialer-specific line
  display + settings gear, unchanged). `App.tsx` imports both under aliases
  (`GlobalAppHeader` / `DialerLineHeader`) to avoid confusion — there is no
  file-path collision since they live in different folders.

- `AgentDrawerMenu.tsx` — Module 2. Slide-out panel (dimmed backdrop,
  tap-outside-to-close) that **auto-closes on every item press**. Menu items
  are role-gated via an optional `roles: AgentRole[]` allow-list (e.g. "Site
  Visits & GPS Check-In" only shows for `FIELD_CLOSER`/`ADMIN`). "Add
  Self-Sourced Lead" isn't a real screen — pressing it calls
  `onAddSelfSourcedLead()`, which `App.tsx` wires to switch to the Dialer
  screen and open the existing `AddLeadSheet`. "End Shift & Logout" opens an
  inline confirmation panel before calling `onLogout()`.

## Known simplification
The drawer slides in as a `Modal` with `animationType="fade"` rather than a
true left-to-right slide transition, to avoid hand-rolling `Animated.timing`
choreography for this pass. Swap in `Animated.View` + `PanResponder` (or
`react-native-reanimated`, already installed) later if a real slide gesture
is wanted.
