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

export type ShiftApprovalStatus = 'PENDING_APPROVAL' | 'APPROVED';

export type AttendanceStatus = 'COMPLETED' | 'ACTIVE';

export interface MyShiftBooking {
  id: string;
  slotId: string;
  /** ISO date (YYYY-MM-DD) the slot applies to. */
  dateIso: string;
  bookedAt: number;
  approvalStatus: ShiftApprovalStatus;
}

export interface AttendanceSession {
  id: string;
  dateIso: string;
  slotId?: string;
  startedAt: number;
  endedAt?: number;
  hoursWorked: number;
  status: AttendanceStatus;
}
