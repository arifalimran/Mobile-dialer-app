export interface ShiftSlotDefinition {
  id: string;
  label: string;
  /** 24-hour clock hour the slot starts at. */
  startHour: number;
  /** 24-hour clock hour the slot ends at. */
  endHour: number;
}

export type ShiftLockStatus = 'NONE' | 'PENALIZED';

export interface MyShiftBooking {
  slotId: string;
  /** ISO date (YYYY-MM-DD) the slot applies to. */
  dateIso: string;
  bookedAt: number;
}
