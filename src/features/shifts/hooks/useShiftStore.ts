import { create } from 'zustand';

import { CANCEL_GRACE_HOURS, PENALTY_LOCK_DAYS, SHIFT_SLOTS } from '../constants/shiftSlots';
import type { MyShiftBooking, ShiftLockStatus } from '../shiftTypes';

interface ShiftState {
  myBooking: MyShiftBooking | null;
  lockStatus: ShiftLockStatus;
  lockedUntil: number | null;
  bookSlot: (slotId: string, dateIso: string) => void;
  cancelBooking: (forcePenalty?: boolean) => void;
  clearExpiredLock: () => void;
}

function getSlotStartTimestamp(slotId: string, dateIso: string): number | null {
  const slot = SHIFT_SLOTS.find((candidate) => candidate.id === slotId);
  if (!slot) return null;
  const date = new Date(`${dateIso}T00:00:00`);
  date.setHours(slot.startHour, slot.startMinute ?? 0, 0, 0);
  return date.getTime();
}

/**
 * Module 5: Freelancer shift slot booking + 7-day penalty lockout engine.
 * Single-agent scoped (no multi-agent capacity backend yet) — booking a slot
 * just records "my" booking locally; wire this to a real seat-capacity API
 * once the backend exists.
 */
export const useShiftStore = create<ShiftState>((set, get) => ({
  myBooking: null,
  lockStatus: 'NONE',
  lockedUntil: null,

  bookSlot: (slotId, dateIso) => {
    const { lockStatus, lockedUntil } = get();
    if (lockStatus === 'PENALIZED' && lockedUntil && Date.now() < lockedUntil) return;
    set({ myBooking: { slotId, dateIso, bookedAt: Date.now() } });
  },

  cancelBooking: (forcePenalty = false) => {
    const { myBooking } = get();
    if (!myBooking) return;

    const slotStart = getSlotStartTimestamp(myBooking.slotId, myBooking.dateIso);
    const hoursUntilStart =
      slotStart !== null ? (slotStart - Date.now()) / (1000 * 60 * 60) : Number.POSITIVE_INFINITY;

    if (forcePenalty || hoursUntilStart < CANCEL_GRACE_HOURS) {
      set({
        myBooking: null,
        lockStatus: 'PENALIZED',
        lockedUntil: Date.now() + PENALTY_LOCK_DAYS * 24 * 60 * 60 * 1000,
      });
    } else {
      set({ myBooking: null });
    }
  },

  clearExpiredLock: () => {
    const { lockStatus, lockedUntil } = get();
    if (lockStatus === 'PENALIZED' && lockedUntil && Date.now() >= lockedUntil) {
      set({ lockStatus: 'NONE', lockedUntil: null });
    }
  },
}));
