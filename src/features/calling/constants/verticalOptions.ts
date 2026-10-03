import type { BusinessVertical } from '../callingTypes';

export const BUSINESS_VERTICALS: BusinessVertical[] = [
  'Land Sharing',
  'Real Estate',
  'Interior',
  'Construction',
];

export const VERTICAL_BADGE_STYLES: Record<
  BusinessVertical,
  { container: string; text: string }
> = {
  'Land Sharing': { container: 'bg-sky-950 border-sky-800', text: 'text-sky-400' },
  'Real Estate': { container: 'bg-emerald-950 border-emerald-800', text: 'text-emerald-400' },
  Interior: { container: 'bg-amber-950 border-amber-800', text: 'text-amber-400' },
  Construction: { container: 'bg-rose-950 border-rose-800', text: 'text-rose-400' },
};
