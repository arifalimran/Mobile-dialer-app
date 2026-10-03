import { useCallback, useMemo, useState } from 'react';

import type { LeadContact } from '../callingTypes';

const INITIAL_LEADS: LeadContact[] = [
  {
    id: 'lead-1',
    name: 'Mahmudul Hasan',
    vertical: 'Land Sharing',
    location: 'Bashundhara R/A, Dhaka',
    budget: '৳45,00,000',
    maskedPhoneNumber: '+880 1819-***-34',
    source: 'Facebook Ads',
    quickPitchScript:
      'Introduce the land-sharing partnership model — client contributes land, Space Maker handles development and profit split.',
    objectionPointers: ['Land title & CS mutation concerns', 'Profit-sharing ratio pushback', 'Timeline skepticism'],
    projectSpecId: 'emerald-bay-phase2',
  },
  {
    id: 'lead-2',
    name: 'Farzana Akter',
    vertical: 'Real Estate',
    location: 'Uttara Sector 11, Dhaka',
    budget: '৳1,20,00,000',
    maskedPhoneNumber: '+880 1712-***-56',
    source: 'Referral',
    quickPitchScript: 'Highlight ready apartment inventory and flexible EMI/loan-assist options.',
    objectionPointers: ['Price negotiation', 'Loan/EMI eligibility doubts', 'Handover timeline'],
    projectSpecId: 'uttara-sky-residency',
  },
  {
    id: 'lead-3',
    name: 'Kamrul Islam',
    vertical: 'Interior',
    location: 'Gulshan 2, Dhaka',
    budget: '৳8,50,000',
    maskedPhoneNumber: '+880 1911-***-78',
    source: 'Website',
    quickPitchScript: 'Pitch the turnkey interior package with fixed pricing and a guaranteed delivery date.',
    objectionPointers: ['Budget too low for scope', 'Material quality concerns', 'Timeline for completion'],
    projectSpecId: 'gulshan-turnkey-interior',
  },
  {
    id: 'lead-4',
    name: 'Nusrat Jahan',
    vertical: 'Construction',
    location: 'Chattogram City',
    budget: '৳2,00,00,000',
    maskedPhoneNumber: '+880 1615-***-12',
    source: 'Cold List',
    quickPitchScript: 'Position Space Maker as a turnkey structural construction partner with engineer-certified plans.',
    objectionPointers: ['Engineering compliance doubts', 'Cost overrun fears', 'Contractor reliability'],
    projectSpecId: 'chattogram-structural-build',
  },
  {
    id: 'lead-5',
    name: 'Abdur Rahman',
    vertical: 'Land Sharing',
    location: 'Purbachal, Dhaka',
    budget: '৳30,00,000',
    maskedPhoneNumber: '+880 1518-***-90',
    source: 'Walk-in',
    quickPitchScript:
      'Introduce the land-sharing partnership model — client contributes land, Space Maker handles development and profit split.',
    objectionPointers: ['Land title & CS mutation concerns', 'Profit-sharing ratio pushback', 'Timeline skepticism'],
  },
];

export interface UseCallQueueResult {
  currentLead: LeadContact | null;
  queueLength: number;
  queuePosition: number;
  isQueueComplete: boolean;
  advanceToNextLead: () => void;
  addLeadToFront: (lead: LeadContact) => void;
  scheduleCallback: (leadId: string, note: string, scheduledFor: number) => void;
}

export function useCallQueue(): UseCallQueueResult {
  const [queue, setQueue] = useState<LeadContact[]>(INITIAL_LEADS);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentLead = useMemo(
    () => (currentIndex < queue.length ? queue[currentIndex] : null),
    [queue, currentIndex],
  );

  const advanceToNextLead = useCallback(() => {
    setCurrentIndex((previousIndex) => Math.min(previousIndex + 1, queue.length));
  }, [queue.length]);

  const addLeadToFront = useCallback(
    (lead: LeadContact) => {
      setQueue((previousQueue) => {
        const before = previousQueue.slice(0, currentIndex);
        const after = previousQueue.slice(currentIndex);
        return [...before, lead, ...after];
      });
    },
    [currentIndex],
  );

  const scheduleCallback = useCallback((leadId: string, note: string, scheduledFor: number) => {
    setQueue((previousQueue) => {
      const target = previousQueue.find((lead) => lead.id === leadId);
      if (!target) return previousQueue;

      const updatedLead: LeadContact = {
        ...target,
        lastCallbackNote: { note, scheduledFor, loggedAt: Date.now() },
      };

      const withoutTarget = previousQueue.filter((lead) => lead.id !== leadId);
      return [...withoutTarget, updatedLead];
    });
  }, []);

  return {
    currentLead,
    queueLength: queue.length,
    queuePosition: Math.min(currentIndex + 1, queue.length),
    isQueueComplete: currentIndex >= queue.length,
    advanceToNextLead,
    addLeadToFront,
    scheduleCallback,
  };
}
