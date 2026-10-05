export type InventoryVertical = 'REAL_ESTATE' | 'LAND_SHARE' | 'INTERIOR';
export type InventoryStatus = 'AVAILABLE' | 'PENDING_APPROVAL' | 'LOCKED' | 'BOOKED';
export type InventoryHoldOwner = 'ME' | 'OTHER';

export interface InventoryUnit {
  id: string;
  code: string;
  status: InventoryStatus;
  title: string;
  categoryLabel: string;
  netSize: string;
  grossSize: string;
  landSize: string;
  floorLabel: string;
  facing: string;
  viewLabel: string;
  bedrooms?: number;
  bathrooms?: number;
  verandas?: number;
  parkingSlots: number;
  price: number;
  downPaymentPercent: number;
  installmentMonths: number;
  installmentAmount: number;
  handoverDate: string;
  floor?: number;
  holdOwner?: InventoryHoldOwner;
  monthlyCommission?: number;
  holdRequestedAt?: number;
  holdExpiresAt?: number;
}

export interface InventoryProject {
  id: string;
  name: string;
  vertical: InventoryVertical;
  location: string;
  units: InventoryUnit[];
}

const createRealEstateUnits = (): InventoryUnit[] => {
  const units: InventoryUnit[] = [];
  const myHoldIds = new Set(['AZAD-07B', 'AZAD-09D']);
  const otherHoldIds = new Set(['AZAD-11F', 'AZAD-12G']);
  const now = Date.now();

  for (let floor = 13; floor >= 1; floor -= 1) {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

    letters.forEach((letter, index) => {
      const unitNumber = `${floor}${letter}`;
      const unitId = `AZAD-${unitNumber}`;
      let status: InventoryStatus = index < 3 && floor >= 10 ? 'BOOKED' : 'AVAILABLE';
      if (myHoldIds.has(unitId) || otherHoldIds.has(unitId)) {
        status = myHoldIds.has(unitId) ? 'PENDING_APPROVAL' : 'LOCKED';
      }

      const isCompact = index % 2 === 0;
      const netSize = isCompact ? '1,620 sft' : '1,890 sft';
      const grossSize = isCompact ? '1,760 sft' : '2,040 sft';
      const price = 5800000 + floor * 120000 + index * 110000;
      const facingOptions = ['South-East Corner', 'Lake View', 'Park Facing', 'South-West Open'];
      const facing = facingOptions[index % facingOptions.length] ?? 'South-East Corner';
      const installmentBase = price * (1 - 0.2) / 36;

      units.push({
        id: unitId,
        code: `Unit ${unitNumber}`,
        status,
        title: 'Residential Apartment',
        categoryLabel: 'Apartment',
        netSize,
        grossSize,
        landSize: '0.045 Katha',
        floorLabel: `Level ${floor}`,
        facing,
        viewLabel: facing,
        bedrooms: isCompact ? 3 : 4,
        bathrooms: isCompact ? 3 : 4,
        verandas: 2,
        parkingSlots: 1,
        price,
        downPaymentPercent: 20,
        installmentMonths: 36,
        installmentAmount: Math.round(installmentBase),
        handoverDate: 'December 2027',
        monthlyCommission: Math.round(price * 0.002),
        floor,
        holdOwner: myHoldIds.has(unitId) ? 'ME' : otherHoldIds.has(unitId) ? 'OTHER' : undefined,
        holdRequestedAt: myHoldIds.has(unitId) ? now - 25 * 60 * 1000 : undefined,
        holdExpiresAt: myHoldIds.has(unitId) ? now + 95 * 60 * 1000 : otherHoldIds.has(unitId) ? now + 19 * 60 * 60 * 1000 : undefined,
      });
    });
  }

  return units;
};

const createLandShareUnits = (): InventoryUnit[] => {
  const units: InventoryUnit[] = [];

  for (let index = 1; index <= 24; index += 1) {
    const code = `LS-${String(index).padStart(2, '0')}`;
    let status: InventoryStatus;

    if (index <= 18) {
      status = 'AVAILABLE';
    } else if (index === 19) {
      status = 'PENDING_APPROVAL';
    } else if (index <= 20) {
      status = 'LOCKED';
    } else {
      status = 'BOOKED';
    }

    const area = ['3.5 Katha', '4.0 Katha', '4.5 Katha', '5.0 Katha'][index % 4] ?? '4.0 Katha';
    const price = 1850000 + index * 225000;
    const installmentBase = price * (1 - 0.25) / 36;

    units.push({
      id: `GREEN-${code}`,
      code: `Plot ${String(index).padStart(2, '0')}`,
      status,
      title: 'Land Share Plot',
      categoryLabel: 'Plot',
      netSize: area,
      grossSize: area,
      landSize: area,
      floorLabel: 'Ground Plot',
      facing: index % 2 === 0 ? 'Main Road Frontage' : 'Canal-Side Approach',
      viewLabel: index % 2 === 0 ? 'Main Road Frontage' : 'Canal-Side Approach',
      parkingSlots: 2,
      price,
      downPaymentPercent: 25,
      installmentMonths: 36,
      installmentAmount: Math.round(installmentBase),
      handoverDate: 'March 2028',
      monthlyCommission: Math.round(price * 0.002),
      holdOwner: status === 'PENDING_APPROVAL' ? 'ME' : status === 'LOCKED' ? 'OTHER' : undefined,
      holdRequestedAt: status === 'PENDING_APPROVAL' ? Date.now() - 18 * 60 * 1000 : undefined,
      holdExpiresAt: status === 'PENDING_APPROVAL' ? Date.now() + 102 * 60 * 1000 : status === 'LOCKED' ? Date.now() + 14 * 60 * 60 * 1000 : undefined,
    });
  }

  return units;
};

const createInteriorUnits = (): InventoryUnit[] => {
  const units: InventoryUnit[] = [];

  for (let index = 1; index <= 15; index += 1) {
    const code = `INT-${String(index).padStart(2, '0')}`;
    const status: InventoryStatus = index <= 9 ? 'AVAILABLE' : index === 10 ? 'PENDING_APPROVAL' : index === 11 ? 'LOCKED' : 'BOOKED';
    const area = [1200, 1500, 1800, 2200, 2500][index % 5] ?? 1600;
    const price = 4200000 + index * 380000;
    const installmentBase = price * (1 - 0.3) / 36;

    units.push({
      id: `EXEC-${code}`,
      code: `Package ${String(index).padStart(2, '0')}`,
      status,
      title: 'Turnkey Interior Package',
      categoryLabel: 'Interior Package',
      netSize: `${area} sft`,
      grossSize: `${area + 110} sft`,
      landSize: 'Not Applicable',
      floorLabel: 'Client Residence Scope',
      facing: 'Custom Site Orientation',
      viewLabel: 'Material & Finish Catalog',
      bedrooms: area > 1800 ? 4 : 3,
      bathrooms: area > 1800 ? 4 : 3,
      verandas: 2,
      parkingSlots: 1,
      price,
      downPaymentPercent: 30,
      installmentMonths: 36,
      installmentAmount: Math.round(installmentBase),
      handoverDate: 'September 2027',
      monthlyCommission: Math.round(price * 0.002),
      holdOwner: status === 'PENDING_APPROVAL' ? 'ME' : status === 'LOCKED' ? 'OTHER' : undefined,
      holdRequestedAt: status === 'PENDING_APPROVAL' ? Date.now() - 40 * 60 * 1000 : undefined,
      holdExpiresAt: status === 'PENDING_APPROVAL' ? Date.now() + 80 * 60 * 1000 : status === 'LOCKED' ? Date.now() + 22 * 60 * 60 * 1000 : undefined,
    });
  }

  return units;
};

export const inventoryProjects: InventoryProject[] = [
  {
    id: 'azad-residency',
    name: 'Azad Residency G+13',
    vertical: 'REAL_ESTATE',
    location: 'Rayerbazar',
    units: createRealEstateUnits(),
  },
  {
    id: 'green-valley',
    name: 'Green Valley Plots',
    vertical: 'LAND_SHARE',
    location: 'Savar',
    units: createLandShareUnits(),
  },
  {
    id: 'executive-turnkey',
    name: 'Executive Turnkey Interior Packages',
    vertical: 'INTERIOR',
    location: 'Dhaka Metro',
    units: createInteriorUnits(),
  },
];
