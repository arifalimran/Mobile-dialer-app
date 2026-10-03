export type InventoryVertical = 'REAL_ESTATE' | 'LAND_SHARE' | 'INTERIOR';
export type InventoryStatus = 'AVAILABLE' | 'LOCKED' | 'BOOKED';

export interface InventoryUnit {
  id: string;
  code: string;
  status: InventoryStatus;
  type: string;
  area: string;
  price: number;
  floor?: number;
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

  for (let floor = 13; floor >= 1; floor -= 1) {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

    letters.forEach((letter, index) => {
      const unitNumber = `${floor}${letter}`;
      const status: InventoryStatus = index < 45 ? 'BOOKED' : 'AVAILABLE';
      const type = index % 2 === 0 ? '1,600 sft' : '1,900 sft';
      const price = 5800000 + floor * 120000 + index * 110000;

      units.push({
        id: `AZAD-${unitNumber}`,
        code: unitNumber,
        status,
        type,
        area: type,
        price,
        floor,
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
    } else if (index <= 20) {
      status = 'LOCKED';
    } else {
      status = 'BOOKED';
    }

    const area = ['3.5 Katha', '4.0 Katha', '4.5 Katha', '5.0 Katha'][index % 4] ?? '4.0 Katha';
    const price = 1850000 + index * 225000;

    units.push({
      id: `GREEN-${code}`,
      code,
      status,
      type: 'Land Share Plot',
      area,
      price,
    });
  }

  return units;
};

const createInteriorUnits = (): InventoryUnit[] => {
  const units: InventoryUnit[] = [];

  for (let index = 1; index <= 15; index += 1) {
    const code = `INT-${String(index).padStart(2, '0')}`;
    const status: InventoryStatus = index <= 10 ? 'AVAILABLE' : 'BOOKED';
    const area = [1200, 1500, 1800, 2200, 2500][index % 5] ?? 1600;
    const price = 4200000 + index * 380000;

    units.push({
      id: `EXEC-${code}`,
      code,
      status,
      type: 'Turnkey Interior',
      area: `${area} sft`,
      price,
    });
  }

  return units;
};

export const inventoryProjects: InventoryProject[] = [
  {
    id: 'azad-residency',
    name: 'Azad Residency & Towers',
    vertical: 'REAL_ESTATE',
    location: 'Rayerbazar',
    units: createRealEstateUnits(),
  },
  {
    id: 'green-valley',
    name: 'Green Valley Land Share',
    vertical: 'LAND_SHARE',
    location: 'Savar',
    units: createLandShareUnits(),
  },
  {
    id: 'executive-turnkey',
    name: 'Executive Turnkey Interior',
    vertical: 'INTERIOR',
    location: 'Dhaka Metro',
    units: createInteriorUnits(),
  },
];
