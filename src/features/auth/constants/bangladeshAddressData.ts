/**
 * Simplified Division -> District -> Thana/Upazila dataset for the KYC
 * address cascade (Module 7). This intentionally covers a representative
 * subset of Bangladesh's administrative divisions rather than the full
 * nationwide dataset — swap this file for a generated/complete dataset or
 * a backend lookup endpoint once available. Districts/thanas not listed
 * fall back to a generic "Sadar" entry via `getThanas`.
 */

export const DIVISIONS = [
  'Dhaka',
  'Chattogram',
  'Khulna',
  'Rajshahi',
  'Sylhet',
  'Barishal',
  'Rangpur',
  'Mymensingh',
] as const;

export const DISTRICTS_BY_DIVISION: Record<string, string[]> = {
  Dhaka: ['Dhaka', 'Gazipur', 'Narayanganj', 'Tangail', 'Munshiganj'],
  Chattogram: ['Chattogram', "Cox's Bazar", 'Cumilla', 'Feni', 'Noakhali'],
  Khulna: ['Khulna', 'Jessore', 'Satkhira', 'Bagerhat'],
  Rajshahi: ['Rajshahi', 'Bogura', 'Pabna', 'Natore'],
  Sylhet: ['Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj'],
  Barishal: ['Barishal', 'Patuakhali', 'Bhola', 'Barguna'],
  Rangpur: ['Rangpur', 'Dinajpur', 'Kurigram', 'Gaibandha'],
  Mymensingh: ['Mymensingh', 'Jamalpur', 'Netrokona', 'Sherpur'],
};

export const THANAS_BY_DISTRICT: Record<string, string[]> = {
  Dhaka: ['Dhanmondi', 'Gulshan', 'Uttara', 'Mirpur', 'Motijheel', 'Badda'],
  Gazipur: ['Gazipur Sadar', 'Tongi', 'Kaliakair'],
  Narayanganj: ['Narayanganj Sadar', 'Siddhirganj', 'Rupganj'],
  Chattogram: ['Kotwali', 'Pahartali', 'Panchlaish', 'Halishahar'],
};

export function getDistricts(division: string): string[] {
  return DISTRICTS_BY_DIVISION[division] ?? [];
}

export function getThanas(district: string): string[] {
  return THANAS_BY_DISTRICT[district] ?? ['Sadar'];
}
