# `src/features/notices/` — Mandatory Post-Login Announcements

## Purpose
Head Office bulletins with a hard gate: any unread `priority: 'HIGH'`
bulletin blocks the rest of the app behind a full-screen modal until the
agent scrolls to the bottom and taps "I Have Read & Understood".

## Files
- `noticeTypes.ts` — `Bulletin`, `BulletinPriority`.
- `constants/mockBulletins.ts` — `MOCK_BULLETINS` (2 sample bulletins, one HIGH). Replace with a real announcements API.
- `hooks/useNoticeStore.ts` — Zustand store persisted via `secureStorage`; tracks `acknowledgedIds`. Exposes `useUnreadHighPriorityBulletin()` (drives the gatekeeper modal) and `useUnreadBulletinCount()` (drives the drawer badge).
- `components/MandatoryNoticeModal.tsx` — the full-screen gate. Tracks scroll position via `onScroll` + `scrollEventThrottle`; the acknowledge button stays disabled until `distanceFromBottom <= 24px`. Rendered unconditionally at the bottom of `App.tsx`'s `AppShell` — it returns `null` internally when there's nothing unread, so it never blocks anything once bulletins are acknowledged.
- `screens/BulletinsScreen.tsx` — full bulletin history with READ/UNREAD status, reachable from the drawer's "Mandatory Bulletins" item.

## How the gate composes with everything else
`MandatoryNoticeModal` is mounted as a sibling to the current screen and the
drawer inside `AppShell`, so it visually sits on top of whatever screen is
active (matching the spec's "blurring background dialer views" — implemented
here as a full opaque `bg-black/80` overlay rather than a real blur filter,
since `expo-blur` would be a new native dependency).
