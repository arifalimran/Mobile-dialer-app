export type AgentRole = 'MICRO_CALLER' | 'TELE_DESK' | 'FIELD_CLOSER' | 'ADMIN';

export type WorkPreference = 'PART_TIME' | 'FULL_TIME';

export type Occupation = 'Student' | 'Housewife' | 'Job Holder' | 'Freelancer' | 'Business';

export type Gender = 'Male' | 'Female' | 'Other';

export type KycStatus = 'NOT_STARTED' | 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED';

export interface AddressDetails {
  division: string;
  district: string;
  thana: string;
  roadOrVillage: string;
}

export interface ReferencePerson {
  fullName: string;
  contactPhone: string;
  fullAddress: string;
}

export interface AgentProfile {
  legalName: string;
  nidNumber: string;
  /** ISO date string, e.g. "1998-04-12". */
  dateOfBirth: string;
  gender: Gender;
  occupation: Occupation;
  workPreference: WorkPreference;
  phone: string;
  email: string;
  permanentAddress: AddressDetails;
  presentAddress: AddressDetails;
  reference: ReferencePerson;
  role: AgentRole;
  kycStatus: KycStatus;
  /** Set once Head Office approves — masked corporate SIM assigned to this agent. */
  corporateSim?: string;
  regionalHub?: string;
  submittedAt?: number;
}

export const EMPTY_ADDRESS: AddressDetails = {
  division: '',
  district: '',
  thana: '',
  roadOrVillage: '',
};
