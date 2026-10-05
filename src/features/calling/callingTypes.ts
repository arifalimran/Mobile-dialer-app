export type BusinessVertical =
  | 'Land Sharing'
  | 'Real Estate'
  | 'Interior'
  | 'Construction';

export type LeadSource =
  | 'Facebook Ads'
  | 'Referral'
  | 'Walk-in'
  | 'Cold List'
  | 'Website'
  | 'Field Agent Entry';

export type CustomerType = 'Individual' | 'Corporate' | 'Investor' | 'End-User';

export interface CallbackNote {
  note: string;
  scheduledFor: number;
  loggedAt: number;
}

export interface MessageHistoryItem {
  id: string;
  channel: 'sms' | 'whatsapp';
  message: string;
  sentAt: number;
}

export interface LeadContact {
  id: string;
  name: string;
  vertical: BusinessVertical;
  customerType?: CustomerType;
  companyName?: string;
  designation?: string;
  homeAddress?: string;
  location: string;
  budget: string;
  maskedPhoneNumber: string;
  messageHistory?: MessageHistoryItem[];
  /**
   * Only populated for leads the agent typed in themselves (Add Custom Lead).
   * Investor-database leads must never carry a dialable raw number here —
   * that is the entire point of the masking requirement.
   */
  rawPhoneNumber?: string;
  source: LeadSource;
  quickPitchScript?: string;
  objectionPointers?: string[];
  lastCallbackNote?: CallbackNote;
  /** Optional link into `mockProjectCatalog` for the Project Specs accordion (Module 4). */
  projectSpecId?: string;
}

export type CallStatus = 'IDLE' | 'CONNECTING' | 'ACTIVE' | 'DISPOSITION';

export type Disposition =
  | 'INTERESTED_SITE_VISIT'
  | 'CALLBACK_SCHEDULED'
  | 'WRONG_PERSON'
  | 'INVALID_NUMBER'
  | 'NO_ANSWER_ATTEMPT_1'
  | 'FAKE_LEAD'
  | 'NOT_INTERESTED';

export type CallProviderMode = 'DIRECT_NATIVE_DIALER' | 'IPTSP_BRIDGE';

export interface AgentConfig {
  agentPhone: string;
  callProviderMode: CallProviderMode;
}

export interface AudioMemoMetadata {
  uri: string;
  durationMs: number;
}

export interface DispositionSubmission {
  leadId: string;
  disposition: Disposition;
  audioMemo?: AudioMemoMetadata;
  callbackNote?: string;
  callbackAt?: number;
  submittedAt: number;
}

export interface BridgeCallRequest {
  agentPhone: string;
  leadId: string;
}
