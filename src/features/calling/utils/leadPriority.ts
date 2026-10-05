import type { LeadContact, LeadSource } from '../callingTypes';

export interface LeadPriorityMeta {
  stars: 1 | 2 | 3;
  label: string;
  accent: string;
  background: string;
}

const PRIORITY_BY_SOURCE: Record<LeadSource, LeadPriorityMeta> = {
  Referral: {
    stars: 3,
    label: 'Referral Lead',
    accent: '#D6A243',
    background: 'rgba(214,162,67,0.14)',
  },
  'Facebook Ads': {
    stars: 2,
    label: 'Digital Inbound',
    accent: '#10B981',
    background: 'rgba(16,185,129,0.14)',
  },
  Website: {
    stars: 2,
    label: 'Digital Inbound',
    accent: '#10B981',
    background: 'rgba(16,185,129,0.14)',
  },
  'Walk-in': {
    stars: 2,
    label: 'Digital Inbound',
    accent: '#10B981',
    background: 'rgba(16,185,129,0.14)',
  },
  'Cold List': {
    stars: 1,
    label: 'Cold Market Intake',
    accent: '#64748B',
    background: 'rgba(100,116,139,0.16)',
  },
  'Field Agent Entry': {
    stars: 1,
    label: 'Cold Market Intake',
    accent: '#64748B',
    background: 'rgba(100,116,139,0.16)',
  },
};

export function getLeadPriorityMeta(source: LeadSource): LeadPriorityMeta {
  return PRIORITY_BY_SOURCE[source] ?? PRIORITY_BY_SOURCE['Cold List'];
}

export function compareLeadPriority(a: LeadContact, b: LeadContact): number {
  const aStars = getLeadPriorityMeta(a.source).stars;
  const bStars = getLeadPriorityMeta(b.source).stars;

  if (aStars !== bStars) {
    return bStars - aStars;
  }

  return a.name.localeCompare(b.name);
}