import React, { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { create } from 'zustand';

import { useTheme } from '../../../theme/ThemeContext';

const unitLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;
const floorLabels = Array.from({ length: 13 }, (_, index) => String(index + 1));

type UnitStatus = 'AVAILABLE' | 'RESERVED' | 'HELD';

interface InventoryUnit {
  id: string;
  floor: number;
  label: string;
  status: UnitStatus;
  price: number;
}

const unitCatalog: InventoryUnit[] = floorLabels.flatMap((floorLabel, floorIndex) =>
  unitLetters.map((letter, unitIndex) => ({
    id: `${floorLabel}-${letter}`,
    floor: floorIndex + 1,
    label: `${floorLabel}${letter}`,
    status: ([0, 2, 4, 5, 7].includes(unitIndex) ? 'AVAILABLE' : unitIndex % 3 === 0 ? 'RESERVED' : 'HELD') as UnitStatus,
    price: 2800000 + floorIndex * 175000 + unitIndex * 90000,
  }))
);

interface StackingMatrixState {
  heldUnits: Record<string, boolean>;
  toggleHold: (unitId: string) => void;
}

const useStackingMatrixStore = create<StackingMatrixState>((set) => ({
  heldUnits: {},
  toggleHold: (unitId) =>
    set((state) => ({
      heldUnits: {
        ...state.heldUnits,
        [unitId]: !state.heldUnits[unitId],
      },
    })),
}));

function formatPrice(value: number): string {
  return `BDT ${new Intl.NumberFormat('en-BD', {
    maximumFractionDigits: 0,
  }).format(value)}`;
}

export function StackingMatrixScreen() {
  const { tokens } = useTheme();
  const heldUnits = useStackingMatrixStore((state) => state.heldUnits);
  const toggleHold = useStackingMatrixStore((state) => state.toggleHold);

  const floors = useMemo(() => {
    return floorLabels.map((floorLabel) => ({
      floorLabel,
      units: unitCatalog.filter((unit) => unit.floor === Number(floorLabel)),
    }));
  }, []);

  const totalAvailable = unitCatalog.filter((unit) => unit.status !== 'RESERVED').length;
  const totalHeld = Object.values(heldUnits).filter(Boolean).length;

  return (
    <View style={{ flex: 1, backgroundColor: tokens.canvas }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32 }}>
        <View style={{ marginBottom: 18 }}>
          <Text style={{ color: tokens.textPrimary, fontSize: 24, fontWeight: '800' }}>G+13 stacking matrix</Text>
          <Text style={{ color: tokens.textSecondary, fontSize: 13, marginTop: 6 }}>104 units • occupancy overview</Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            marginBottom: 18,
          }}
        >
          <View style={{ flex: 1, backgroundColor: tokens.card, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: tokens.border }}>
            <Text style={{ color: tokens.textSecondary, fontSize: 11 }}>Available</Text>
            <Text style={{ color: tokens.textPrimary, fontSize: 22, fontWeight: '800', marginTop: 4 }}>{totalAvailable}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: tokens.card, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: tokens.border }}>
            <Text style={{ color: tokens.textSecondary, fontSize: 11 }}>Hold</Text>
            <Text style={{ color: tokens.accent, fontSize: 22, fontWeight: '800', marginTop: 4 }}>{totalHeld}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: tokens.card, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: tokens.border }}>
            <Text style={{ color: tokens.textSecondary, fontSize: 11 }}>Reserved</Text>
            <Text style={{ color: tokens.warning, fontSize: 22, fontWeight: '800', marginTop: 4 }}>{unitCatalog.filter((unit) => unit.status === 'RESERVED').length}</Text>
          </View>
        </View>

        <View style={{ backgroundColor: tokens.card, borderRadius: 20, borderWidth: 1, borderColor: tokens.border, padding: 12 }}>
          <View style={{ flexDirection: 'row', marginBottom: 10 }}>
            <Text style={{ width: 34, color: tokens.textSecondary, fontSize: 12, fontWeight: '700' }}>Lvl</Text>
            {unitLetters.map((letter) => (
              <Text key={letter} style={{ flex: 1, color: tokens.textSecondary, fontSize: 12, fontWeight: '700', textAlign: 'center' }}>
                {letter}
              </Text>
            ))}
          </View>

          {floors.map(({ floorLabel, units }) => (
            <View key={floorLabel} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ width: 34, color: tokens.textPrimary, fontSize: 12, fontWeight: '700' }}>{floorLabel}</Text>
              {units.map((unit) => {
                const isHeld = Boolean(heldUnits[unit.id]);
                const isReserved = unit.status === 'RESERVED';
                const isAvailable = unit.status === 'AVAILABLE' || isHeld;

                return (
                  <Pressable
                    key={unit.id}
                    accessibilityRole="button"
                    onPress={() => toggleHold(unit.id)}
                    disabled={isReserved}
                    style={{
                      flex: 1,
                      minHeight: 74,
                      marginHorizontal: 2,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: isReserved ? tokens.border : isHeld ? tokens.accent : tokens.border,
                      backgroundColor: isReserved
                        ? 'rgba(245,158,11,0.10)'
                        : isHeld
                          ? 'rgba(200,155,74,0.16)'
                          : 'rgba(22, 35, 45, 0.95)',
                      paddingVertical: 8,
                      paddingHorizontal: 4,
                      justifyContent: 'center',
                      opacity: isReserved ? 0.9 : 1,
                    }}
                  >
                    <Text style={{ color: isAvailable ? tokens.textPrimary : tokens.textSecondary, fontSize: 10, fontWeight: '800', textAlign: 'center' }}>
                      {unit.label}
                    </Text>
                    <Text style={{ color: isAvailable ? tokens.textPrimary : tokens.textSecondary, fontSize: 9, textAlign: 'center', marginTop: 4 }}>
                      {formatPrice(unit.price)}
                    </Text>
                    <Text style={{ color: isHeld ? tokens.accent : tokens.textSecondary, fontSize: 8, textAlign: 'center', marginTop: 4, fontWeight: '700' }}>
                      {isReserved ? 'Booked' : isHeld ? '72h Hold' : 'Open'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        <View
          style={{
            marginTop: 18,
            backgroundColor: tokens.subpanel,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: tokens.border,
            padding: 14,
          }}
        >
          <Text style={{ color: tokens.textPrimary, fontSize: 17, fontWeight: '800', marginBottom: 10 }}>Hold workflow</Text>
          <Text style={{ color: tokens.textSecondary, fontSize: 13, lineHeight: 20 }}>
            Tap any open unit to place a 72-hour hold. Held units remain reserved for follow-up while the sales desk confirms payment and documentation.
          </Text>

          <Pressable
            accessibilityRole="button"
            style={{
              marginTop: 14,
              minHeight: 48,
              borderRadius: 12,
              backgroundColor: tokens.accent,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#F7F3EE', fontSize: 14, fontWeight: '800' }}>72-hour hold action</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
