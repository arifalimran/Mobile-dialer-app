/**
 * Validates a Bangladesh NID number.
 * Accepts the 10-digit "Smart NID" format or the legacy 13/17-digit formats.
 */
export function isValidNid(nid: string): boolean {
  if (!/^\d+$/.test(nid)) return false;
  return nid.length === 10 || nid.length === 13 || nid.length === 17;
}

/**
 * Validates that an ISO date-of-birth string ("YYYY-MM-DD") represents
 * someone who is at least 18 years old as of today.
 */
export function isAtLeast18YearsOld(dateOfBirthIso: string): boolean {
  const dob = new Date(dateOfBirthIso);
  if (Number.isNaN(dob.getTime())) return false;

  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

  return dob.getTime() <= eighteenYearsAgo.getTime();
}

/** Matches a basic "YYYY-MM-DD" shape before attempting a full Date parse. */
export function isIsoDateShape(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}
