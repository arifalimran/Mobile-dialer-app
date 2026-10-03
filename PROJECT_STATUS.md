# Space Maker Limited — Mobile Dialer: Project Status

**Last updated:** 3 October 2026
**Purpose:** Handoff snapshot for another AI session. Read this before changing code. The product/regulatory spec is [.github/copilot-instructions.md](.github/copilot-instructions.md).

---

## 1. What this is

React Native (Expo) front-end for Space Maker Limited, a Bangladesh multi-vertical company (Land Sharing, Real Estate, Turnkey Interiors, Structural Construction).

Remote micro-callers work a masked lead queue. They must never see a raw customer phone number. Outbound calls are meant to bridge through a licensed in-country IPTSP 096xx PBX (BTRC: no CLI spoofing, no unverified foreign VoIP). After each call the agent logs a disposition and can record a 15-second voice memo.

**Current milestone:** Front-end harness only. Telephony, auth, leads, shifts, KPI, notices, and registration flows are mocked in the app. There is no backend, no admin panel, and no ERP/CRM connection yet.

**Owner intent (next build):** Build a real backend and admin panel, then connect this dialer to an ERP/CRM that will be built separately. Do not invent a live PBX or store raw customer numbers on the device.

---

## 2. How to run

```bash
cd "/Users/mac/Space Maker/Dialer app"
npx expo start --lan -c
```

- Open the printed `exp://…` URL in Expo Go on a phone on the same Wi-Fi.
- Tunnel mode (`--tunnel`) failed here because Ngrok was down. Use `--lan`.
- Expo Go login and the dialer app login are different accounts. They do not need to match.
- `npx tsc --noEmit` was verified clean on 3 October 2026.

Mock dialer login the UI expects:

- Username: `imrannahar`
- Password: `123456`

There is also an **Enter demo desk** button that skips the typed fields and opens the dialer. This works reliably on device.

---

## 3. Verified current status

| Area | Status |
|---|---|
| Expo + TypeScript + NativeWind scaffold | Done |
| Masked dialer, mock queue, disposition drawer, voice memo | Done, front-end only |
| Global header, bottom tabs, theme toggle, bulletins, shifts, KPI, KYC wizard | Done as UI, local/mock data |
| Screen router | Plain React state in `App.tsx`. No React Navigation, by design |
| Real auth / tokens / RBAC | Not done. Mock only |
| API client (`src/api/`) | Folder exists, not yet connected |
| Telephony backend / PBX | Not started. Mock bridge logic exists only |
| Admin panel | Not started |
| ERP / CRM | Not started. Planned as a separate system this app will call |
| Typed login on device | Verified working with `imrannahar` / `123456` |
| Agent KYC registration | Verified working. The form is usable, DOB date picker opens, and submission returns to the login screen |
| Registration auto-sign-in | Fixed. Successful registration does not open the app automatically |
| Post-login crash pattern | Fixed by delaying route transition after keyboard dismissal and guarding native mount-time audio logic |

This is not an Expo SDK or macOS version mismatch. The app bundles and runs on Expo SDK 57 / Expo Go. The earlier login crash was caused by app-state/UI timing and native mount lifecycle issues, not by an SDK incompatibility.

---

## 4. Stack

From `package.json`:

- Expo SDK ~57.0.20, React Native 0.86.3, React 19.2.3
- TypeScript ~6.0.3
- NativeWind ^4.2.6, Tailwind ^3.4.19, utility `className` only
- lucide-react-native only (no other icon library)
- Zustand ^5.0.15 for UI/session state
- TanStack React Query ^5.102.8 installed and provided in `App.tsx`, not yet used for real server data
- expo-audio ~57.0.4 for the voice memo (`expo-av` is deprecated and removed in this SDK)
- expo-secure-store ~57.0.3 installed. `src/storage/secureStorage.ts` exists, but auth/theme/shift/notice stores remain in-memory after runtime crashes from persisted state and frozen UI. Do not put customer phone numbers in AsyncStorage.

---

## 5. What is built

### App shell — `App.tsx`

`QueryClientProvider` → `SafeAreaProvider` → `RootRouter`.

`RootRouter` uses local state: `LOGIN | REGISTER | APP`. It does **not** trust `useAuthStore.isAuthenticated` to change screens. The screen switch is explicit and deterministic.

- `LOGIN` renders `LoginScreen`
- `REGISTER` renders `AgentRegistrationScreen`
- `APP` renders `AppShell` (header, current tab, bottom tabs, status sheet)
- Logout returns `RootRouter` to `LOGIN`

Tabs are a `useState<AppScreen>` switch, not a navigator. Screens: Dialer, Bulletins, KPI, Shifts, plus coming-soon placeholders for Scheduled Callbacks, Site Visits, and Wallet.

### Auth — `src/features/auth/`

- `screens/LoginScreen.tsx` — typed username/password form, failure alert, and **Enter demo desk**
- `screens/AgentRegistrationScreen.tsx` — 3-step KYC wizard (identity, address cascade, reference). Next/Submit show alerts if required fields are missing
- `screens/ApplicationUnderReviewScreen.tsx` — pending KYC screen. It is not the active gate in the current mock flow
- `hooks/useAuthStore.ts` — in-memory Zustand mock. `login()` accepts only `imrannahar` / `123456` and builds a verified demo profile. It is not persisted
- `utils/validateNid.ts`, `constants/bangladeshAddressData.ts` — NID/age checks and a partial Division → District → Thana list

### Calling — `src/features/calling/`

- `LeadCard`, `PostCallDrawer`, `AddLeadSheet`, `QueueTracker`, `SettingsSheet`
- `useCallQueue` — mock queue with masked lead numbers
- `useTelephonyBridge` — `IDLE → CONNECTING → ACTIVE → DISPOSITION`
- `services/callingApi.ts` / `callProviders.ts` — mock bridge, no network
- `useAudioRecorder` — lazy mic permission and record start only when the user presses the mic trigger; safe cleanup avoids unmounted native recorder crashes

### Other front-end modules

- `src/components/navigation/` — header, bottom tabs, agent status sheet
- `src/components/ui/` — `InputField`, `DatePickerModal`
- `src/features/notices/` — bulletins + mandatory notice modal (local mock)
- `src/features/shifts/` — slot booking + local penalty lock
- `src/features/kpi/` — role benchmark screens
- `src/theme/` — dark tokens and app palette

---

## 6. Verified implementation notes

### Typed login flow

Verified working:

1. `LoginScreen.handleSignIn` dismisses the keyboard, validates `imrannahar` / `123456`, and calls `useAuthStore.getState().login(...)`.
2. On success it clears the error and triggers `onSignedIn()` without a success alert.
3. `App.tsx` changes the route to `APP` immediately.

The previous crash pattern was caused by a native lifecycle race: the keyboard was still animating while the route changed, and some mount-time audio setup was firing before the screen fully stabilized.

### Registration flow

Verified working:

1. The date-of-birth picker opens and closes correctly.
2. KYC fields validate on Next and Submit.
3. Successful registration returns to the login screen instead of auto-signing the user in.
4. The app stays in the correct route and does not silently create a logged-in session from registration alone.

### Compliance / notice modal

The mandatory notice modal was adjusted to avoid presenting a modal while the app route was still settling, and it no longer relies on the deprecated `InteractionManager` warning path.

---

## 7. Constraints the next model must keep

- Do not show raw customer phone numbers to agents. Mask them. `selectable={false}`. No clipboard copy.
- Do not store customer/lead phone numbers in AsyncStorage or SecureStore.
- No CLI spoofing. Future call API is `POST /api/v1/telephony/bridge-call` with `{ agentPhone, leadId }`. The PBX rings the agent, rings the prospect from the company 096xx number, and bridges them.
- Styling: NativeWind `className` only. Dark slate background, sky/emerald/amber/rose accents. Touch targets at least 48px.
- Icons: `lucide-react-native` only.
- Do not add React Navigation or new native modules unless required. This project already hit Expo Go native-module failures.
- Feature folders stay under `src/features/`.

---

## 8. Next build: backend, admin panel, ERP/CRM

Nothing below exists yet. Build it as a separate service. This repo is the agent mobile client only.

Suggested order:

1. Add `src/api/` base client, auth headers, and React Query hooks.
2. Replace hard-coded mock auth with real server-side login / JWT and RBAC.
3. Admin panel (web): approve/reject KYC, assign corporate SIM, publish bulletins, set KPI rules, control shift seats.
4. Lead/queue API with masked numbers only. The bridge endpoint receives `leadId` and the agent phone, never raw customer numbers.
5. Disposition + voice memo upload.
6. ERP/CRM integration: this dialer should call the CRM for lead assignment, disposition write-back, callback scheduling, and project specs. Keep the ERP as the system of record.

Proposed future endpoints, not implemented:

- `POST /api/v1/auth/login`
- `POST /api/v1/telephony/bridge-call`
- `GET /api/v1/leads/queue`
- `POST /api/v1/leads/:id/disposition`
- Admin: agents, KYC review, bulletins, shifts, KPI rules

---

## 9. Historical notes

- `expo-av` / `ExponentAV` is not in Expo Go on SDK 57. Use `expo-audio`.
- Naive use of `zustand/middleware` `persist` and SecureStore caused app freeze/crashes; current stores remain in-memory.
- NativeWind `Text` color classes must be applied directly to `Text`, not inherited from a parent `View`.
- The app should be developed with plain React state routing in `App.tsx` to avoid native-module friction in Expo Go.

---

## 10. Verified final state

The app is now in the following confirmed state:

- typed login with `imrannahar` / `123456` opens the desk
- demo desk also opens the desk
- registration works, DOB picker works, and successful registration returns to the login screen
- no auto-sign-in occurs on KYC submit
- the app remains a front-end-only mock, with a clear path to a server-backed auth and admin system later

The next engineering step is to add the backend auth and lead APIs, then wire the current local mock flows to real server contracts without exposing raw customer numbers.
