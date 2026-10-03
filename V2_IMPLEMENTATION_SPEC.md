# Space Maker Limited — Mobile Dialer App
## Version 2: Front-End UI Architecture & Feature Specification

---

### 1. Architectural Baseline & Rules of Engagement

The Version 1 mobile harness has been stabilized and verified on **Expo SDK ~57.0.20**, **React Native 0.86.3**, and **React 19.2.3**. Version 2 expands the agent and closer user interfaces using **100% type-safe mock datasets and in-memory state** before connecting to the backend API and Supabase database[cite: 1, 3, 4].

#### Strict Stability Rules (Do Not Violate):
1. **No External Router Overhauls:** Route switching is governed deterministically in `App.tsx` via `LOGIN | REGISTER | APP` state. Do not install `@react-navigation/native` or wrap the app in experimental native containers[cite: 1, 4].
2. **Zero-Exposure Security:** Remote callers must never view, copy, or select raw phone numbers[cite: 1, 4]. Display only masked numbers (`+880 1819-***-34`) with `selectable={false}`[cite: 1, 2, 4].
3. **Storage Crash Prevention:** Do not store lead queues or authentication session payloads in `AsyncStorage` or `SecureStore`[cite: 1, 4]. Keep state in memory (`zustand` without persist middleware)[cite: 1, 4].
4. **Lazy Audio Session:** Native microphone permissions and session initialization in `expo-audio` must only execute when the user taps the mic trigger[cite: 1, 2, 4]. Never request permissions inside `useEffect` on mount[cite: 1, 2, 4].
5. **No Mount Modal Collisions:** Modals must not trigger during layout transitions or while the virtual keyboard is dismissing[cite: 1, 2, 4].

---

### 2. Design System & Theme Engine

#### Why Light/Dark Mode Failed in V1:
NativeWind color inheritance drops across nested `<View>` and `<Text>` trees on React Native 0.86. Dark/light mode must be driven by an explicit typed Theme Provider supplying color values directly into component styles.

#### Color Tokens (`src/theme/tokens.ts`):
```typescript
export type ColorTheme = 'dark' | 'light';

export const THEME = {
  dark: {
    canvas: '#10151C',
    card: '#151B23',
    subpanel: '#1C232D',
    border: 'rgba(237, 237, 231, 0.10)',
    textPrimary: '#EDEDE7',
    textSecondary: '#8B93A1',
    brassAccent: '#C89B4A',
    danger: '#E2897E',
    success: '#10B981',
  },
  light: {
    canvas: '#F4F5F7',
    card: '#FFFFFF',
    subpanel: '#E5E9F0',
    border: 'rgba(16, 21, 28, 0.12)',
    textPrimary: '#10151C',
    textSecondary: '#5A6270',
    brassAccent: '#A67C2E',
    danger: '#D9534F',
    success: '#059669',
  }
};


### Claude VS Code Execution Prompt

Paste this prompt directly into your Claude session in VS Code:

```markdown
You are a Principal Mobile Architect and Senior React Native / Expo engineer working on the Space Maker Limited mobile dialer application (`Dialer app`).

### Context & Task Summary
We are kicking off Version 2 front-end feature development. All screens and workflows will be developed using type-safe mock datasets and in-memory state first, so that the mobile app is fully interactive, bug-free, and user-friendly before connecting to live Supabase/Express APIs.

Review the project status and architecture rules in `V2_IMPLEMENTATION_SPEC.md`.

### Non-Negotiable Operational & Stability Constraints
1. **Never crash the app:**
   - Do NOT install `react-navigation` or add new native libraries to `package.json`.
   - Maintain plain deterministic React state routing inside `App.tsx` (`LOGIN | REGISTER | APP`).
   - Do NOT fire native modals, alerts, or hardware requests on the first mount frame of a screen transition.
   - Do NOT hydrate unverified persistent data via `AsyncStorage` or `SecureStore` (which previously caused app freezes).
2. **Customer Data Masking & Zero Exposure:**
   - Never display or expose unmasked customer phone numbers to callers. All phone numbers must render masked (e.g., `+880 1819-***-34`) with `selectable={false}` and no clipboard copy access.
3. **Hardware & Native Safety:**
   - Keep `expo-audio` interactions lazy: request permissions and initialize sessions ONLY when an agent taps the record button, never in `useEffect` on mount.
4. **Theme System:**
   - Fix the broken light/dark mode by replacing unstable inherited Tailwind text styling with the explicit theme token engine (`ThemeContext.tsx` and `src/theme/tokens.ts`).

### Step-by-Step Deliverables Required

#### Step 1: Design System Theme Fix
- Implement `src/theme/tokens.ts` and `src/theme/ThemeContext.tsx` using the design system colors (Canvas `#10151C`, Card `#151B23`, Subpanel `#1C232D`, Border `rgba(237,237,231,0.10)`, Text Primary `#EDEDE7`, Text Secondary `#8B93A1`, Brass Accent `#C89B4A`, Danger `#E2897E`, Success `#10B981`, and their corresponding light tokens).
- Add a theme toggle button to the top header that immediately swaps palette tokens cleanly across all active views without unmount glitches.

#### Step 2: Build Missing Modules (Mock Data Driven)
1. **Scheduled Callbacks Desk (`src/features/callbacks/screens/ScheduledCallbacksScreen.tsx`)**:
   - Filterable callback queue (Today, Overdue, Upcoming) with client name, project vertical, scheduled time, notes, and a one-touch masked "Bridge Call" action.
2. **G+13 Stacking Viewer Matrix (`src/features/inventory/screens/StackingMatrixScreen.tsx`)**:
   - Visual floor-by-floor occupancy grid reflecting the 104-unit portfolio (45 booked, 59 vacant, across 1600 sft and 1900 sft types).
   - Unit detail sheet with asking price and a 72-hour temporary hold action updating in-memory status.
3. **Site Visit Management & Token Drawer**:
   - For Callers: Site visit appointment drawer (date, time window, project selection, caller debrief notes).
   - For Closers: Token deposit drawer (`TokenDepositDrawer.tsx`) supporting bKash/Nagad `mfs_trx_id` or bank cheque submission.
4. **Agent Wallet & Tier Engine (`src/features/wallet/screens/WalletScreen.tsx`)**:
   - Metric cards for Under Verification balance, Cleared Payout, and Bronze → Platinum reputation tier status.
5. **Dynamic Screen Watermark (`src/components/security/DynamicWatermark.tsx`)**:
   - Overlay showing Agent ID, IP placeholder, and UTC timestamp with `pointerEvents="none"`.

#### Step 3: Wire into `App.tsx`
- Connect new screens into the tab switch without breaking the existing `imrannahar` / `123456` login or `useAudioRecorder` lifecycle.
- Run `npx tsc --noEmit` and ensure zero TypeScript errors.

Provide complete, production-ready TypeScript code step-by-step.

```

---

### File to Create in VS Code Root: `V2_IMPLEMENTATION_SPEC.md`

Save the following markdown file as `V2_IMPLEMENTATION_SPEC.md` in the root of your mobile app workspace (`/Users/mac/Space Maker/Dialer app/`):

```markdown
# Space Maker Limited — Mobile Dialer App
## Version 2: Front-End UI Architecture & Feature Specification

---

### 1. Architectural Baseline & Rules of Engagement

The Version 1 mobile harness has been stabilized and verified on **Expo SDK ~57.0.20**, **React Native 0.86.3**, and **React 19.2.3**[cite: 1, 4]. Version 2 expands the agent and closer user interfaces using **100% type-safe mock datasets and in-memory state** before connecting to the backend API and Supabase database[cite: 1, 3, 4].

#### Strict Stability Rules (Do Not Violate):
1. **No External Router Overhauls:** Route switching is governed deterministically in `App.tsx` via `LOGIN | REGISTER | APP` state[cite: 1, 4]. Do not install `@react-navigation/native` or wrap the app in experimental native containers[cite: 1, 4].
2. **Zero-Exposure Security:** Remote callers must never view, copy, or select raw phone numbers[cite: 1, 4]. Display only masked numbers (`+880 1819-***-34`) with `selectable={false}`[cite: 1, 2, 4].
3. **Storage Crash Prevention:** Do not store lead queues or authentication session payloads in `AsyncStorage` or `SecureStore`[cite: 1, 4]. Keep state in memory (`zustand` without persist middleware)[cite: 1, 4].
4. **Lazy Audio Session:** Native microphone permissions and session initialization in `expo-audio` must only execute when the user taps the mic trigger[cite: 1, 2, 4]. Never request permissions inside `useEffect` on mount[cite: 1, 2, 4].
5. **No Mount Modal Collisions:** Modals must not trigger during layout transitions or while the virtual keyboard is dismissing[cite: 1, 2, 4].

---

### 2. Design System & Theme Engine

#### Why Light/Dark Mode Failed in V1:
NativeWind color inheritance drops across nested `<View>` and `<Text>` trees on React Native 0.86[cite: 4]. Dark/light mode must be driven by an explicit typed Theme Provider supplying color values directly into component styles[cite: 3].

#### Color Tokens (`src/theme/tokens.ts`):
```typescript
export type ColorTheme = 'dark' | 'light';

export const THEME = {
  dark: {
    canvas: '#10151C',
    card: '#151B23',
    subpanel: '#1C232D',
    border: 'rgba(237, 237, 231, 0.10)',
    textPrimary: '#EDEDE7',
    textSecondary: '#8B93A1',
    brassAccent: '#C89B4A',
    danger: '#E2897E',
    success: '#10B981',
  },
  light: {
    canvas: '#F4F5F7',
    card: '#FFFFFF',
    subpanel: '#E5E9F0',
    border: 'rgba(16, 21, 28, 0.12)',
    textPrimary: '#10151C',
    textSecondary: '#5A6270',
    brassAccent: '#A67C2E',
    danger: '#D9534F',
    success: '#059669',
  }
};

```

---

### 3. Version 2 Feature Deliverables & Mock Specifications

```
src/
├── features/
│   ├── callbacks/         <-- Scheduled Callbacks Desk
│   ├── inventory/         <-- G+13 Live Unit Stacking Matrix
│   ├── visits/            <-- Site Visit Booking & Closer Dossier
│   ├── finance/           <-- Token Deposit Submission (MFS / Cheque)
│   └── wallet/            <-- Agent Earnings & Reputation Tiers
├── components/
│   └── security/          <-- Dynamic Watermark Overlay
└── theme/                 <-- Typed Theme Provider & Tokens

```

#### Feature 1: Scheduled Callbacks Desk

* **File:** `src/features/callbacks/screens/ScheduledCallbacksScreen.tsx`
* **Purpose:** Allows telemarketers to track upcoming and overdue customer callbacks.


* **Requirements:**
* Top status filters: `ALL`, `OVERDUE`, `TODAY`, `UPCOMING`.
* Lead card showing client name, masked phone (`+880 1819-***-20`), callback time, project type, and caller notes.


* Overdue entries highlighted in `colors.danger`.


* "Bridge Call" action triggering the existing telephony bridge modal.





#### Feature 2: G+13 Stacking Viewer Matrix

* **File:** `src/features/inventory/screens/StackingMatrixScreen.tsx`
* **Purpose:** Mobile floor-by-floor view of the 104-unit portfolio (45 booked, 59 vacant).


* **Portfolio Data Rules (from Azad Properties ERP Register):**
* 13 Floors, 8 units per floor (A through H).


* Types A, B, G, H: 1,600 sft (Baseline target ৳5.0M–৳5.5M).


* Types C, D, E, F: 1,900 sft (Baseline target ৳6.0M–৳6.6M).


* Status types: `AVAILABLE` (green), `BOOKED` (red), `LOCKED` (amber).




* **Interactions:**
* Tapping an available unit opens a bottom summary drawer showing size, floor, and calculated price.


* Provides a "Place 72-Hour Hold" button that updates the unit state in memory.





#### Feature 3: Site Visit Management & Token Drawer

* **Site Visit Drawer (`src/features/visits/components/BookSiteVisitDrawer.tsx`):**
* Allows callers to select preferred date, time slot (Morning, Afternoon, Evening), vertical (`LAND_SHARE`, `REAL_ESTATE`, `INTERIOR`), and enter buyer requirements.




* **Token Deposit Drawer (`src/features/finance/components/TokenDepositDrawer.tsx`):**
* Allows field closers to submit advance payments for locked units.


* Toggle between `bKash/Nagad (MFS)` and `Bank Cheque`.


* Form inputs for transaction reference (`mfs_trx_id` or cheque number) and amount in BDT.





#### Feature 4: Agent Wallet & Tier Hub

* **File:** `src/features/wallet/screens/WalletScreen.tsx`
* **Purpose:** Displays caller and field agent commission status and performance tier.


* **Metrics:**
* Cleared Balance (available for monthly disbursement).


* Pending Verification (tokens awaiting admin clearing).


* Current Tier badge: Bronze, Silver, Gold, or Platinum with commission rate multipliers.





#### Feature 5: Security Watermark Overlay

* **File:** `src/components/security/DynamicWatermark.tsx`
* **Purpose:** Protection against unauthorized screenshots and internal data leaks.


* **Implementation:**
* Absolute positioned view with `pointerEvents="none"` at the root of `AppShell`.


* Faint, repeated diagonal text displaying `Agent ID`, `SPACE MAKER CONFIDENTIAL`, and live UTC timestamp.





---

### 4. Integration Checklist in `App.tsx`

* [ ] ThemeProvider wraps the root view.
* [ ] Tab bar exposes: `DIALER`, `CALLBACKS`, `INVENTORY`, `WALLET`, `BULLETINS`, `SHIFTS`.


* [ ] Dynamic watermark renders permanently above active tabs.


* [ ] `useAudioRecorder` remains decoupled from screen mount events.


* [ ] Zero TypeScript errors via `npx tsc --noEmit`.



```

```