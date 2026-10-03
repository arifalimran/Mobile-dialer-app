# `src/features/shifts/` — Shift Slot Booking & Penalty Engine

## Purpose
Freelancer shift booking (Morning/Afternoon/Evening 3-hour slots) with a
client-side 7-day lockout penalty for late cancellations/no-shows.

## Files
- `shiftTypes.ts` — `ShiftSlotDefinition`, `ShiftLockStatus`, `MyShiftBooking`.
- `constants/shiftSlots.ts` — `SHIFT_SLOTS` (3 fixed daily slots), `CANCEL_GRACE_HOURS` (6), `PENALTY_LOCK_DAYS` (7).
- `hooks/useShiftStore.ts` — Zustand store persisted via `secureStorage`. `bookSlot()`, `cancelBooking()` (applies the penalty if cancelled inside the grace window), `clearExpiredLock()`.
- `screens/ShiftBookingScreen.tsx` — slot list, active booking card, and the locked-out banner with a "Contact Operations Admin" WhatsApp deep link (`OPERATIONS_ADMIN_PHONE` in `src/config/constants.ts`).

## Scope / known limitations
- **Single-agent only.** There is no multi-agent seat-capacity backend, so
  "booking a slot" just records the current agent's own booking locally —
  it does not check or decrement a shared capacity pool. Wire this to a real
  seat-availability API once agents share a backend.
- **No automatic no-show detection.** A no-show (agent simply never opens
  the app during their slot) can't be detected client-side without a
  background job; only explicit "Cancel Booking" inside the 6-hour grace
  window is penalized today.

## Penalty logic
`cancelBooking()` computes `hoursUntilStart = (slotStart - now) / 1h`. If
that's less than `CANCEL_GRACE_HOURS`, `lockStatus` becomes `'PENALIZED'`
and `lockedUntil = now + PENALTY_LOCK_DAYS`. `ShiftBookingScreen` calls
`clearExpiredLock()` on mount so an expired lock silently resets.
