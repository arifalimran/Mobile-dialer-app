import type { ShiftSlotDefinition } from '../shiftTypes';

export const SHIFT_SLOTS: ShiftSlotDefinition[] = [
  { id: 'slot-a', label: 'Slot A · 10:00 AM – 2:00 PM', startHour: 10, endHour: 14 },
  { id: 'slot-b', label: 'Slot B · 2:30 PM – 6:30 PM', startHour: 14, endHour: 18, startMinute: 30, endMinute: 30 },
];

/** Agent must cancel at least 48 hours before a slot starts, or it counts as a late cancellation/no-show. */
export const CANCEL_GRACE_HOURS = 48;

/** Length of the booking lockout applied after a penalized cancellation/no-show. */
export const PENALTY_LOCK_DAYS = 7;
