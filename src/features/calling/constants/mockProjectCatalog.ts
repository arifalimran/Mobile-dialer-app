import type { BusinessVertical } from '../callingTypes';

export interface ProjectSpec {
  id: string;
  vertical: BusinessVertical;
  projectName: string;
  exactLocation: string;
  frontRoadWidth: string;
  facing: string;
  unitSize: string;
  availability: string;
  extraFeatures: string[];
  nearestLandmark: string;
  documentation: string;
  pricingTerms: string;
}

/** Module 4: multi-vertical project specs catalog. Replace with a live ERP feed later. */
export const PROJECT_SPEC_CATALOG: Record<string, ProjectSpec> = {
  'emerald-bay-phase2': {
    id: 'emerald-bay-phase2',
    vertical: 'Land Sharing',
    projectName: 'Space Maker Emerald Bay, Jolsiri Sector 10',
    exactLocation: 'Jolsiri Abason Sector 10, Purbachal, Dhaka',
    frontRoadWidth: '40 Feet Avenue',
    facing: 'South Facing, Corner Plot',
    unitSize: '5 Katha • 2 of 4 Shares Available',
    availability: '2 of 4 shares available',
    extraFeatures: ['Lake View', 'Park Facing', 'Boundary Wall Done', 'Soil Tested'],
    nearestLandmark: '3 mins from 100ft Madani Avenue',
    documentation: 'Rajuk Approved, CS/SA/RS/City Jorip Verified, Mutation Ready',
    pricingTerms: '৳45 Lakh • 20% Down Payment • 36-month installment plan',
  },
  'uttara-sky-residency': {
    id: 'uttara-sky-residency',
    vertical: 'Real Estate',
    projectName: 'Space Maker Sky Residency, Uttara Sector 11',
    exactLocation: 'Road 8, Sector 11, Uttara, Dhaka',
    frontRoadWidth: '30 Feet Road',
    facing: 'North-East Facing',
    unitSize: '1,450 sqft • 3 Bed / 3 Bath',
    availability: '6 of 20 units available',
    extraFeatures: ['Rooftop Garden', 'Backup Generator', 'Community Hall'],
    nearestLandmark: '5 mins from Uttara Sector 10 Metro Station',
    documentation: 'Rajuk Approved, Ready for Registration',
    pricingTerms: '৳1.2 Crore • 15% Down Payment • Bank Loan-Assist Available',
  },
  'gulshan-turnkey-interior': {
    id: 'gulshan-turnkey-interior',
    vertical: 'Interior',
    projectName: 'Space Maker Turnkey Interiors, Gulshan 2',
    exactLocation: 'Road 46, Gulshan 2, Dhaka',
    frontRoadWidth: 'N/A (Apartment Interior Package)',
    facing: 'N/A',
    unitSize: '1,600 sqft package',
    availability: 'Fixed-price package, immediate slot open',
    extraFeatures: ['False Ceiling', 'Modular Kitchen', 'Smart Lighting'],
    nearestLandmark: '2 mins from Gulshan 2 Circle',
    documentation: 'Fixed-Price Contract, 1-Year Workmanship Warranty',
    pricingTerms: '৳8.5 Lakh • 30% Advance • Balance on Milestones',
  },
  'chattogram-structural-build': {
    id: 'chattogram-structural-build',
    vertical: 'Construction',
    projectName: 'Space Maker Structural Build, Chattogram City',
    exactLocation: 'Nasirabad Housing Society, Chattogram',
    frontRoadWidth: '25 Feet Road',
    facing: 'East Facing',
    unitSize: '3,200 sqft footprint, G+5 approved',
    availability: 'Engineering slot open for Q1',
    extraFeatures: ['Engineer-Certified Plans', 'Earthquake-Resistant Design'],
    nearestLandmark: '10 mins from Chattogram GEC Circle',
    documentation: 'CDA Approved, Soil Test Report Included',
    pricingTerms: '৳2 Crore • 25% Advance • Milestone-based installments',
  },
};
