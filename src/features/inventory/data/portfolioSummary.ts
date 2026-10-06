// Single source of truth for the cross-portfolio overview numbers shown on
// the Inventory "Portfolio Overview" card. The Dashboard screen imports this
// same file so the two surfaces never drift apart.

export interface PortfolioVerticalSummary {
  key: 'REAL_ESTATE' | 'LAND_SHARE' | 'INTERIOR';
  emoji: string;
  label: string;
  projectName: string;
  unitLabel: string;
  totalCount: number;
  available: number;
  hold: number;
  sold: number;
  soldLabel: 'Sold' | 'Booked';
}

export const portfolioVerticalSummaries: PortfolioVerticalSummary[] = [
  {
    key: 'REAL_ESTATE',
    emoji: '🏢',
    label: 'Real Estate',
    projectName: 'Azad Residency (G+13)',
    unitLabel: 'Units',
    totalCount: 104,
    available: 59,
    hold: 0,
    sold: 45,
    soldLabel: 'Sold',
  },
  {
    key: 'LAND_SHARE',
    emoji: '🌿',
    label: 'Land Share',
    projectName: 'Green Valley Savar',
    unitLabel: 'Plots',
    totalCount: 24,
    available: 18,
    hold: 2,
    sold: 4,
    soldLabel: 'Sold',
  },
  {
    key: 'INTERIOR',
    emoji: '🛋️',
    label: 'Turnkey Interior',
    projectName: 'Executive Packages',
    unitLabel: 'Slots',
    totalCount: 15,
    available: 10,
    hold: 0,
    sold: 5,
    soldLabel: 'Booked',
  },
];

export const portfolioTotals = {
  totalUnits: portfolioVerticalSummaries.reduce((sum, item) => sum + item.totalCount, 0),
  available: portfolioVerticalSummaries.reduce((sum, item) => sum + item.available, 0),
  hold: portfolioVerticalSummaries.reduce((sum, item) => sum + item.hold, 0),
  sold: portfolioVerticalSummaries.reduce((sum, item) => sum + item.sold, 0),
  developmentsCount: portfolioVerticalSummaries.length,
};

export const portfolioHoldQuota = {
  activeHolds: 2,
  quota: 3,
};

export function getPortfolioPercent(count: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((count / total) * 100);
}
