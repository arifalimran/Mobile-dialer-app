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

export interface CallbackNote {
  note: string;
  scheduledFor: number;
  loggedAt: number;
}

export interface LeadContact {
  id: string;
  name: string;
  vertical: BusinessVertical;
  location: string;
  budget: string;
  maskedPhoneNumber: string;
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
  | 'BOOK_SITE_VISIT'
  | 'CALLBACK_LATER'
  | 'SEND_WHATSAPP_INFO'
  | 'NOT_INTERESTED';

export type CallProviderMode = 'NATIVE_SIM' | 'IPTSP_BRIDGE';

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
