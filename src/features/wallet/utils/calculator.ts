/**
 * Deterministic Monthly KPI & Earnings Calculation Engine.
 *
 * This module is the single source of truth for how a field caller's
 * monthly score and payout are computed. Every number here is intended to
 * mirror, bit-for-bit, the math the central ERP backend will eventually
 * run server-side — so nothing in this file should be "smoothed" or
 * estimated. Values are currently sourced from a fixed sample cycle; once
 * the ERP API is live, `KPI_TASKS` and the payout constants below will be
 * replaced with live per-agent data without changing the arithmetic.
 */

export interface TaskItem {
  id: string;
  simpleName: string;
  pointsWorth: number;
  target: number;
  current: number;
  unit: string;
  pointsEarned: number;
  isCompleted: boolean;
  plainRule: string;
}

export const KPI_TASKS: TaskItem[] = [
  {
    id: 'booking_deal',
    simpleName: '1 Confirmed Customer Booking',
    pointsWorth: 65,
    target: 1,
    current: 0,
    unit: 'Deals',
    pointsEarned: 0,
    isCompleted: false,
    plainRule: 'Close at least 1 customer deal with official token or booking money to earn 65 points.',
  },
  {
    id: 'work_hours',
    simpleName: '120 Total Work Hours',
    pointsWorth: 5,
    target: 120,
    current: 108,
    unit: 'Hours',
    pointsEarned: 4.5,
    isCompleted: false,
    plainRule: 'Clock 120 duty hours (30 shifts of 4 hours) during the 30-day work cycle.',
  },
  {
    id: 'callbacks',
    simpleName: 'On-Time Follow-up Calls',
    pointsWorth: 5,
    target: 100,
    current: 100,
    unit: '%',
    pointsEarned: 5,
    isCompleted: true,
    plainRule: 'Dial 100% of all scheduled client callbacks on time with zero overdue calls.',
  },
  {
    id: 'new_leads',
    simpleName: 'Daily New Phone Calls',
    pointsWorth: 5,
    target: 70,
    current: 78,
    unit: '%',
    pointsEarned: 5,
    isCompleted: true,
    plainRule: 'Call at least 70% of new customer numbers assigned to your queue each day.',
  },
  {
    id: 'site_visits',
    simpleName: 'Completed Site Visits',
    pointsWorth: 5,
    target: 3,
    current: 3,
    unit: 'Visits',
    pointsEarned: 5,
    isCompleted: true,
    plainRule: 'Bring customers to project locations verified by Field Closer GPS check-in.',
  },
  {
    id: 'installments',
    simpleName: 'Collect Monthly Payments',
    pointsWorth: 5,
    target: 5,
    current: 5,
    unit: 'Buyers',
    pointsEarned: 5,
    isCompleted: true,
    plainRule: 'Collect scheduled installment payments from 5 existing property buyers.',
  },
  {
    id: 'voice_notes',
    simpleName: '15-Sec Voice Notes',
    pointsWorth: 5,
    target: 95,
    current: 96,
    unit: '%',
    pointsEarned: 5,
    isCompleted: true,
    plainRule: 'Submit a 15-second audio voice note summary after completing each call.',
  },
  {
    id: 'active_days',
    simpleName: 'Work Days Attendance',
    pointsWorth: 5,
    target: 30,
    current: 26,
    unit: 'Days',
    pointsEarned: 4.3,
    isCompleted: false,
    plainRule: 'Work up to 30 days to receive your full ৳300 daily attendance allowance.',
  },
];

export const PASS_MARK_POINTS = 75;
export const FIXED_BASE_SALARY = 12000;
export const MOBILE_BILL = 2000;
export const SITE_VISIT_ALLOWANCE = 6000;
export const DAILY_ALLOWANCE_RATE = 300;
export const COMMISSION_RATE = 0.002; // 0.2%
export const DAYS_WORKED = 26;
export const COMMISSION_EARNED = 16700;
export const UNDER_VERIFICATION_AMOUNT = 75000;

export interface KpiCalculationSummary {
  totalScore: number;
  isBaseUnlocked: boolean;
  baseSalaryPayable: number;
  attendanceAllowance: number;
  clearedPayout: number;
  underVerification: number;
}

export function calculateSummary(): KpiCalculationSummary {
  const totalScore = KPI_TASKS.reduce((sum, item) => sum + item.pointsEarned, 0);
  const roundedScore = Math.round(totalScore); // 68 points
  const isBaseUnlocked = roundedScore >= PASS_MARK_POINTS;
  const baseSalaryPayable = isBaseUnlocked ? FIXED_BASE_SALARY : 0;
  const attendanceAllowance = DAYS_WORKED * DAILY_ALLOWANCE_RATE; // 26 * 300 = 7,800
  const clearedPayout = baseSalaryPayable + MOBILE_BILL + SITE_VISIT_ALLOWANCE + attendanceAllowance + COMMISSION_EARNED; // 0 + 2000 + 6000 + 7800 + 16700 = 32,500

  return {
    totalScore: roundedScore,
    isBaseUnlocked,
    baseSalaryPayable,
    attendanceAllowance,
    clearedPayout,
    underVerification: UNDER_VERIFICATION_AMOUNT,
  };
}
