export interface ShiftSlotDefinition {
  id: string;
  label: string;
  /** 24-hour clock hour the slot starts at. */
  startHour: number;
  /** 24-hour clock hour the slot ends at. */
  endHour: number;
  /** Optional minute offset used for 2:30 PM / 6:30 PM style slots. */
  startMinute?: number;
  endMinute?: number;
}

export type ShiftLockStatus = 'NONE' | 'PENALIZED';

export interface MyShiftBooking {
  slotId: string;
  /** ISO date (YYYY-MM-DD) the slot applies to. */
  dateIso: string;
  bookedAt: number;
}
