import type { ShiftSlotDefinition } from '../shiftTypes';

export const SHIFT_SLOTS: ShiftSlotDefinition[] = [
  { id: 'morning', label: 'Morning · 10:00 AM – 01:00 PM', startHour: 10, endHour: 13 },
  { id: 'afternoon', label: 'Afternoon · 02:00 PM – 05:00 PM', startHour: 14, endHour: 17 },
  { id: 'evening', label: 'Evening · 06:00 PM – 09:00 PM', startHour: 18, endHour: 21 },
];

/** Agent must cancel at least this many hours before a slot starts, or it counts as a no-show/late-cancel. */
export const CANCEL_GRACE_HOURS = 6;

/** Length of the booking lockout applied after a penalized cancellation/no-show. */
export const PENALTY_LOCK_DAYS = 7;
