import { create } from 'zustand';

import { CANCEL_GRACE_HOURS, PENALTY_LOCK_DAYS, SHIFT_SLOTS } from '../constants/shiftSlots';
import type { AttendanceSession, MyShiftBooking, ShiftLockStatus } from '../shiftTypes';

interface ShiftState {
  bookings: MyShiftBooking[];
  lockStatus: ShiftLockStatus;
  lockedUntil: number | null;
  attendanceHistory: AttendanceSession[];
  activeSessionStartedAt: number | null;
  bookSlot: (slotId: string, dateIso: string) => void;
  cancelBooking: (bookingId: string, forcePenalty?: boolean) => void;
  clearExpiredLock: () => void;
  startDutySession: () => { ok: boolean; reason?: string };
  endDutySession: () => AttendanceSession | null;
}

const MAX_SLOTS_PER_WEEK = 6;

function formatDateIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getTodayIso(): string {
  return formatDateIso(new Date());
}

function getLastSevenDayCount(bookings: MyShiftBooking[]): number {
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

  return bookings.filter((booking) => {
    const start = getSlotStartTimestamp(booking.slotId, booking.dateIso);
    return start !== null && start >= sevenDaysAgo;
  }).length;
}

function getApprovedBookingForToday(bookings: MyShiftBooking[]): MyShiftBooking | null {
  const todayIso = getTodayIso();
  return bookings.find((booking) => booking.dateIso === todayIso && booking.approvalStatus === 'APPROVED') ?? null;
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
  bookings: [],
  lockStatus: 'NONE',
  lockedUntil: null,
  attendanceHistory: [],
  activeSessionStartedAt: null,

  bookSlot: (slotId, dateIso) => {
    const { lockStatus, lockedUntil, bookings } = get();
    if (lockStatus === 'PENALIZED' && lockedUntil && Date.now() < lockedUntil) return;
    if (bookings.some((booking) => booking.dateIso === dateIso)) return;
    if (getLastSevenDayCount(bookings) >= MAX_SLOTS_PER_WEEK) return;

    const approvalStatus = dateIso === getTodayIso() ? 'APPROVED' : 'PENDING_APPROVAL';
    set({
      bookings: [
        ...bookings,
        {
          id: `booking-${dateIso}-${slotId}`,
          slotId,
          dateIso,
          bookedAt: Date.now(),
          approvalStatus,
        },
      ],
    });
  },

  cancelBooking: (bookingId, forcePenalty = false) => {
    const { bookings } = get();
    const booking = bookings.find((item) => item.id === bookingId);
    if (!booking) return;

    const slotStart = getSlotStartTimestamp(booking.slotId, booking.dateIso);
    const hoursUntilStart =
      slotStart !== null ? (slotStart - Date.now()) / (1000 * 60 * 60) : Number.POSITIVE_INFINITY;

    if (forcePenalty || hoursUntilStart < CANCEL_GRACE_HOURS) {
      set({
        bookings: bookings.filter((item) => item.id !== bookingId),
        lockStatus: 'PENALIZED',
        lockedUntil: Date.now() + PENALTY_LOCK_DAYS * 24 * 60 * 60 * 1000,
      });
    } else {
      set({ bookings: bookings.filter((item) => item.id !== bookingId) });
    }
  },

  clearExpiredLock: () => {
    const { lockStatus, lockedUntil } = get();
    if (lockStatus === 'PENALIZED' && lockedUntil && Date.now() >= lockedUntil) {
      set({ lockStatus: 'NONE', lockedUntil: null });
    }
  },

  startDutySession: () => {
    const { activeSessionStartedAt, bookings } = get();
    if (activeSessionStartedAt) {
      return { ok: false, reason: 'You are already on duty.' };
    }
    const approvedBooking = getApprovedBookingForToday(bookings);
    if (!approvedBooking) {
      return { ok: false, reason: 'Dialer duty unlocks only during approved shift slots.' };
    }

    set({ activeSessionStartedAt: Date.now() });
    return { ok: true };
  },

  endDutySession: () => {
    const { activeSessionStartedAt, attendanceHistory, bookings } = get();
    if (!activeSessionStartedAt) return null;

    const endedAt = Date.now();
    const hoursWorked = Number(((endedAt - activeSessionStartedAt) / (1000 * 60 * 60)).toFixed(2));
    const approvedBooking = getApprovedBookingForToday(bookings);
    const session: AttendanceSession = {
      id: `attendance-${endedAt}`,
      dateIso: getTodayIso(),
      slotId: approvedBooking?.slotId,
      startedAt: activeSessionStartedAt,
      endedAt,
      hoursWorked,
      status: 'COMPLETED',
    };

    set({
      activeSessionStartedAt: null,
      attendanceHistory: [session, ...attendanceHistory],
    });
    return session;
  },
}));
