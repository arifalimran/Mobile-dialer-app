import { useMemo } from 'react';

import { create } from 'zustand';

import type { LeadContact, MessageHistoryItem } from '../callingTypes';
import { compareLeadPriority } from '../utils/leadPriority';

const DAILY_TARGET = 30;
const ACTIVE_BATCH_SIZE = 5;

const LEAD_BLUEPRINTS: Array<Omit<LeadContact, 'id'>> = [
  {
    name: 'Farzana Akter',
    vertical: 'Real Estate',
    customerType: 'Investor',
    companyName: 'Akter Holdings',
    designation: 'Director',
    homeAddress: 'House 17, Road 5, Uttara Sector 11, Dhaka',
    location: 'Uttara Sector 11, Dhaka',
    budget: '৳1,20,00,000',
    maskedPhoneNumber: '+880 1712-***-56',
    rawPhoneNumber: '+8801712456756',
    source: 'Referral',
    quickPitchScript: 'Highlight ready apartment inventory and flexible EMI and loan-assist options.',
    objectionPointers: ['Price negotiation', 'Loan and EMI eligibility doubts', 'Handover timeline'],
    projectSpecId: 'uttara-sky-residency',
  },
  {
    name: 'Mahmudul Hasan',
    vertical: 'Land Sharing',
    customerType: 'Investor',
    companyName: 'Hasan Estates',
    designation: 'Land Owner',
    homeAddress: 'Block G, Bashundhara R/A, Dhaka',
    location: 'Bashundhara R/A, Dhaka',
    budget: '৳45,00,000',
    maskedPhoneNumber: '+880 1819-***-34',
    rawPhoneNumber: '+8801819123434',
    source: 'Facebook Ads',
    quickPitchScript: 'Introduce the land-sharing partnership model and the development-profit split.',
    objectionPointers: ['Land title and CS mutation concerns', 'Profit-sharing ratio pushback', 'Timeline skepticism'],
    projectSpecId: 'emerald-bay-phase2',
  },
  {
    name: 'Kamrul Islam',
    vertical: 'Interior',
    customerType: 'End-User',
    companyName: 'K Residence',
    designation: 'Homeowner',
    homeAddress: 'Road 54, Gulshan 2, Dhaka',
    location: 'Gulshan 2, Dhaka',
    budget: '৳8,50,000',
    maskedPhoneNumber: '+880 1911-***-78',
    rawPhoneNumber: '+8801911456778',
    source: 'Website',
    quickPitchScript: 'Pitch the turnkey interior package with fixed pricing and a guaranteed delivery date.',
    objectionPointers: ['Budget too low for scope', 'Material quality concerns', 'Timeline for completion'],
    projectSpecId: 'gulshan-turnkey-interior',
  },
  {
    name: 'Nusrat Jahan',
    vertical: 'Construction',
    customerType: 'Corporate',
    companyName: 'Jahan Developments',
    designation: 'Procurement Head',
    homeAddress: 'Agrabad Commercial Area, Chattogram',
    location: 'Chattogram City',
    budget: '৳2,00,00,000',
    maskedPhoneNumber: '+880 1615-***-12',
    rawPhoneNumber: '+8801615456712',
    source: 'Cold List',
    quickPitchScript: 'Position Space Maker as a turnkey structural construction partner with engineer-certified plans.',
    objectionPointers: ['Engineering compliance doubts', 'Cost overrun fears', 'Contractor reliability'],
    projectSpecId: 'chattogram-structural-build',
  },
  {
    name: 'Abdur Rahman',
    vertical: 'Land Sharing',
    customerType: 'Individual',
    companyName: 'Self-Owned Asset',
    designation: 'Land Owner',
    homeAddress: 'Sector 7, Purbachal, Dhaka',
    location: 'Purbachal, Dhaka',
    budget: '৳30,00,000',
    maskedPhoneNumber: '+880 1518-***-90',
    rawPhoneNumber: '+8801518123490',
    source: 'Walk-in',
    quickPitchScript: 'Open with the land partnership structure, development support, and revenue upside.',
    objectionPointers: ['Mutation concerns', 'Project duration', 'Profit split clarity'],
  },
  {
    name: 'Sharmin Sultana',
    vertical: 'Real Estate',
    customerType: 'End-User',
    companyName: 'Sharmin Family Office',
    designation: 'Buyer',
    homeAddress: 'Dhanmondi 27, Dhaka',
    location: 'Dhanmondi, Dhaka',
    budget: '৳95,00,000',
    maskedPhoneNumber: '+880 1724-***-21',
    rawPhoneNumber: '+8801724789021',
    source: 'Referral',
    quickPitchScript: 'Lead with family-ready layouts, parking convenience, and December 2027 handover confidence.',
    objectionPointers: ['School-distance concern', 'Facing preference', 'Parking availability'],
  },
  {
    name: 'Sabbir Hossain',
    vertical: 'Interior',
    customerType: 'Corporate',
    companyName: 'Sabbir Retail Ventures',
    designation: 'Managing Partner',
    homeAddress: 'Banani DOHS, Dhaka',
    location: 'Banani, Dhaka',
    budget: '৳11,00,000',
    maskedPhoneNumber: '+880 1884-***-43',
    rawPhoneNumber: '+8801884678943',
    source: 'Facebook Ads',
    quickPitchScript: 'Show the turnkey fit-out timeline, material catalog, and staged milestone billing.',
    objectionPointers: ['Material quality', 'Delivery reliability', 'Scope creep'],
  },
  {
    name: 'Tahmina Noor',
    vertical: 'Real Estate',
    customerType: 'Investor',
    companyName: 'Noor Capital',
    designation: 'Partner',
    homeAddress: 'Mirpur DOHS, Dhaka',
    location: 'Mirpur DOHS, Dhaka',
    budget: '৳1,35,00,000',
    maskedPhoneNumber: '+880 1967-***-65',
    rawPhoneNumber: '+8801967123465',
    source: 'Website',
    quickPitchScript: 'Position premium corner units with lake-facing openness and flexible payment planning.',
    objectionPointers: ['Family layout fit', 'Installment pressure', 'Possession date'],
  },
  {
    name: 'Md. Rafiq',
    vertical: 'Land Sharing',
    customerType: 'Individual',
    companyName: 'Personal Land Asset',
    designation: 'Owner',
    homeAddress: 'Hemayetpur, Savar, Dhaka',
    location: 'Savar, Dhaka',
    budget: '৳52,00,000',
    maskedPhoneNumber: '+880 1577-***-87',
    rawPhoneNumber: '+8801577123487',
    source: 'Cold List',
    quickPitchScript: 'Frame the land-share proposal around passive development upside without construction hassle.',
    objectionPointers: ['Developer trust', 'Legal safeguards', 'Cash-flow timing'],
  },
  {
    name: 'Anika Karim',
    vertical: 'Real Estate',
    customerType: 'Corporate',
    companyName: 'Karim Trading',
    designation: 'Finance Director',
    homeAddress: 'Bashundhara Block B, Dhaka',
    location: 'Bashundhara, Dhaka',
    budget: '৳1,05,00,000',
    maskedPhoneNumber: '+880 1799-***-09',
    rawPhoneNumber: '+8801799123409',
    source: 'Referral',
    quickPitchScript: 'Start with resale-resistant location strength and practical family apartment planning.',
    objectionPointers: ['Price comparison', 'Developer track record', 'Booking commitment'],
  },
];

function buildInitialLeads(): LeadContact[] {
  return Array.from({ length: DAILY_TARGET }, (_, index) => {
    const blueprint = LEAD_BLUEPRINTS[index % LEAD_BLUEPRINTS.length];
    return {
      ...blueprint,
      id: `lead-${String(index + 1).padStart(2, '0')}`,
    };
  }).sort(compareLeadPriority);
}

const INITIAL_LEADS = buildInitialLeads();

interface CallQueueStoreState {
  queue: LeadContact[];
  actionedLeadIds: string[];
  activeBatchIndex: number;
  addLeadToFront: (lead: LeadContact) => void;
  completeLeadAction: (leadId: string) => void;
  scheduleCallback: (leadId: string, note: string, scheduledFor: number) => void;
  recordLeadMessage: (leadId: string, entry: MessageHistoryItem) => void;
}

function getActiveBatch(queue: LeadContact[], activeBatchIndex: number) {
  const batchStart = activeBatchIndex * ACTIVE_BATCH_SIZE;
  return queue.slice(batchStart, batchStart + ACTIVE_BATCH_SIZE);
}

function getNextBatchIndex(queue: LeadContact[], actionedLeadIds: string[], activeBatchIndex: number) {
  let nextBatchIndex = activeBatchIndex;

  while (true) {
    const activeBatch = getActiveBatch(queue, nextBatchIndex);
    if (activeBatch.length === 0) {
      return nextBatchIndex;
    }

    const isBatchComplete = activeBatch.every((lead) => actionedLeadIds.includes(lead.id));
    if (!isBatchComplete) {
      return nextBatchIndex;
    }

    nextBatchIndex += 1;
  }
}

const useCallQueueStore = create<CallQueueStoreState>((set) => ({
  queue: INITIAL_LEADS,
  actionedLeadIds: [],
  activeBatchIndex: 0,

  addLeadToFront: (lead) =>
    set((state) => {
      const batchStart = state.activeBatchIndex * ACTIVE_BATCH_SIZE;
      const nextQueue = [...state.queue];
      nextQueue.splice(batchStart, 0, lead);
      return { queue: nextQueue };
    }),

  completeLeadAction: (leadId) =>
    set((state) => {
      if (state.actionedLeadIds.includes(leadId)) {
        return state;
      }

      const actionedLeadIds = [...state.actionedLeadIds, leadId];
      return {
        actionedLeadIds,
        activeBatchIndex: getNextBatchIndex(state.queue, actionedLeadIds, state.activeBatchIndex),
      };
    }),

  scheduleCallback: (leadId, note, scheduledFor) =>
    set((state) => ({
      queue: state.queue.map((lead) =>
        lead.id === leadId
          ? {
              ...lead,
              lastCallbackNote: { note, scheduledFor, loggedAt: Date.now() },
            }
          : lead,
      ),
    })),

  recordLeadMessage: (leadId, entry) =>
    set((state) => {
      const queue = state.queue.map((lead) =>
        lead.id === leadId
          ? {
              ...lead,
              messageHistory: [...(lead.messageHistory ?? []), entry],
            }
          : lead,
      );

      const actionedLeadIds = state.actionedLeadIds.includes(leadId)
        ? state.actionedLeadIds
        : [...state.actionedLeadIds, leadId];

      return {
        queue,
        actionedLeadIds,
        activeBatchIndex: getNextBatchIndex(queue, actionedLeadIds, state.activeBatchIndex),
      };
    }),
}));

export interface UseCallQueueResult {
  currentLead: LeadContact | null;
  queueLength: number;
  queuePosition: number;
  isQueueComplete: boolean;
  dailyTarget: number;
  dailyCompletedCount: number;
  activeBatchNumber: number;
  activeBatchSize: number;
  activeBatchCompletedCount: number;
  totalBatches: number;
  activeBatchLeads: Array<LeadContact & { isActioned: boolean }>;
  addLeadToFront: (lead: LeadContact) => void;
  completeLeadAction: (leadId: string) => void;
  scheduleCallback: (leadId: string, note: string, scheduledFor: number) => void;
  recordLeadMessage: (leadId: string, entry: MessageHistoryItem) => void;
}

export function useCallQueue(): UseCallQueueResult {
  const queue = useCallQueueStore((state) => state.queue);
  const actionedLeadIds = useCallQueueStore((state) => state.actionedLeadIds);
  const activeBatchIndex = useCallQueueStore((state) => state.activeBatchIndex);
  const addLeadToFront = useCallQueueStore((state) => state.addLeadToFront);
  const completeLeadAction = useCallQueueStore((state) => state.completeLeadAction);
  const scheduleCallback = useCallQueueStore((state) => state.scheduleCallback);
  const recordLeadMessage = useCallQueueStore((state) => state.recordLeadMessage);

  const targetScopedQueue = useMemo(() => queue.slice(0, DAILY_TARGET), [queue]);
  const activeBatchLeads = useMemo(() => {
    const activeBatch = getActiveBatch(queue, activeBatchIndex);
    return activeBatch.map((lead) => ({
      ...lead,
      isActioned: actionedLeadIds.includes(lead.id),
    }));
  }, [queue, activeBatchIndex, actionedLeadIds]);

  const currentLead = useMemo(
    () => activeBatchLeads.find((lead) => !lead.isActioned) ?? null,
    [activeBatchLeads],
  );

  const dailyCompletedCount = useMemo(
    () => targetScopedQueue.filter((lead) => actionedLeadIds.includes(lead.id)).length,
    [targetScopedQueue, actionedLeadIds],
  );

  const firstPendingIndex = useMemo(
    () => queue.findIndex((lead) => !actionedLeadIds.includes(lead.id)),
    [queue, actionedLeadIds],
  );

  const queuePosition = firstPendingIndex === -1 ? queue.length : firstPendingIndex + 1;
  const totalBatches = Math.ceil(DAILY_TARGET / ACTIVE_BATCH_SIZE);
  const activeBatchNumber = Math.min(activeBatchIndex + 1, totalBatches);
  const activeBatchCompletedCount = activeBatchLeads.filter((lead) => lead.isActioned).length;

  return {
    currentLead,
    queueLength: queue.length,
    queuePosition,
    isQueueComplete: dailyCompletedCount >= DAILY_TARGET,
    dailyTarget: DAILY_TARGET,
    dailyCompletedCount,
    activeBatchNumber,
    activeBatchSize: ACTIVE_BATCH_SIZE,
    activeBatchCompletedCount,
    totalBatches,
    activeBatchLeads,
    addLeadToFront,
    completeLeadAction,
    scheduleCallback,
    recordLeadMessage,
  };
}
