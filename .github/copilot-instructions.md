# Space Maker Limited: Mobile Dialer MVP & Telephony Specification

## 1. Project Overview & Operational Context
This project houses the mobile calling front-end for **Space Maker Limited**, an asset-light, multi-vertical enterprise covering Land Sharing Partnerships, Real Estate Development, Turnkey Interiors, and Structural Construction[cite: 2, 8].
The primary purpose of this application is to empower remote micro-callers (homemakers, students, distributed freelancers) to work through a controlled lead queue while strictly protecting investor database privacy and adhering to local Bangladesh telecommunication laws[cite: 2, 5, 8].

- **Primary Goal:** Provide a clean, single-screen masked dialer workflow featuring lead cards, a 48px+ calling trigger, a mandatory post-call disposition drawer, a 15-second voice memo debrief recorder, and automated trigger payloads[cite: 1, 2, 6].
- **Core Strategy:** Build and test the React Native front-end dialer harness first before integrating the full ERP or complex back-office systems[cite: 3].

## 2. Technology Stack & Hard Constraints
- **Framework:** React Native via Expo (TypeScript strict mode)[cite: 2, 3].
- **Styling:** NativeWind (Tailwind CSS for React Native)[cite: 2, 3]. Use inline utility classes (`className="..."`) exclusively.
- **Icons:** `lucide-react-native` strictly[cite: 2, 3]. Do not import from any other icon library.
- **State Management:** Zustand for UI and session state; TanStack React Query for asynchronous server state.
- **Audio / Media:** `expo-audio` for voice recording and playback (`expo-av` is deprecated and its native module is no longer bundled in Expo Go).
- **Security:** `expo-secure-store` for tokens[cite: 2, 3]. Never store raw phone numbers in local storage or AsyncStorage[cite: 2].
- **Design Palette:**
  - Backgrounds: Dark slate palette (`bg-slate-950`, `bg-slate-900`, `bg-slate-800`)[cite: 2].
  - Accents: Sky blue (`#0284c7`, `#38bdf8`) for actions, Emerald (`#10b981`) for completed/success states, Amber (`#f59e0b`) for pending/callbacks, Rose (`#f43f5e`) for alarms/urgent actions[cite: 2].
- **Touch Target Constraint:** Minimum 48px height and width for all interactive elements to prevent mis-taps on mobile devices.

## 3. Regulatory Rules & Telephony Flow (BTRC / Bangladesh Compliance)
- **Zero CLI Spoofing:** In compliance with BTRC regulations, CLI spoofing and unverified foreign VoIP gateways are strictly prohibited[cite: 5]. All outbound calls run via an in-country licensed IPTSP 096xx PBX bridge (e.g., AmberIT, Link3, BDCOM)[cite: 1, 5].
- **Customer Phone Number Masking:**
  - Raw phone numbers must NEVER be exposed in clear text to remote agents (display format: `+880 1819-***-34`)[cite: 1, 2, 6].
  - Clipboard copy-paste (`selectable={false}`) and long-press actions on customer phone numbers must be completely disabled[cite: 1, 2, 6].
- **Two-Way PSTN Call Bridge Execution:**
  - Remote callers tap the primary "Connect Call" action.
  - The app dispatches `POST /api/v1/telephony/bridge-call` with `{ agentPhone, leadId }`.
  - The PBX rings the caller's phone, rings the prospect via the company 096xx number, and bridges both lines together[cite: 1, 5].

## 4. Architectural Pattern: Feature-Sliced Design (FSD)
Organize all front-end codebase files according to this directory tree[cite: 2, 7]:

```text
src/
├── api/                         # Central API client, endpoints, React Query client
├── components/                  # Global primitive components (buttons, text inputs, modals)
├── config/                      # Constants, timing thresholds, environment schemas
├── features/
│   ├── calling/                 # Dialer domain
│   │   ├── components/          # LeadCard.tsx, PostCallDrawer.tsx, AudioDebriefBar.tsx
│   │   ├── hooks/               # useTelephonyBridge.ts, useCallQueue.ts, useAudioRecorder.ts
│   │   ├── services/            # callingApi.ts
│   │   └── callingTypes.ts      # Dispositions, LeadContact interfaces
│   └── auth/                    # Session management and RBAC rules
├── storage/                     # SecureStore wrappers
├── theme/                       # Color constants and design tokens
└── types/                       # Universal TypeScript declarations