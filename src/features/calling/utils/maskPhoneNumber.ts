/**
 * Formats a raw Bangladesh mobile number into the masked display format used
 * across the dialer UI, e.g. "+8801819112233" -> "+880 1819-***-33".
 */
export function maskPhoneNumber(rawPhoneNumber: string): string {
  const digits = rawPhoneNumber.replace(/\D/g, '');
  const nationalNumber = digits.startsWith('880') ? digits.slice(3) : digits.slice(-10);
  const first4 = nationalNumber.slice(0, 4);
  const last2 = nationalNumber.slice(-2);
  return `+880 ${first4}-***-${last2}`;
}
