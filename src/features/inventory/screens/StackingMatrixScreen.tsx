import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { ArrowLeft, Building2, MapPin } from 'lucide-react-native';

import { useAppTheme } from '../../../theme/ThemeContext';
import { inventoryProjects, type InventoryProject, type InventoryStatus, type InventoryUnit, type InventoryVertical } from '../types';

const verticalTabs: Array<{ label: string; value: 'ALL' | InventoryVertical }> = [
  { label: 'ALL', value: 'ALL' },
  { label: 'REAL ESTATE', value: 'REAL_ESTATE' },
  { label: 'LAND SHARE', value: 'LAND_SHARE' },
  { label: 'INTERIOR', value: 'INTERIOR' },
];

const statusMeta: Record<InventoryStatus, { label: string; color: string; bg: string }> = {
  AVAILABLE: { label: 'AVAILABLE', color: '#34D399', bg: 'rgba(52,211,153,0.15)' },
  LOCKED: { label: 'LOCKED', color: '#FBBF24', bg: 'rgba(251,191,36,0.14)' },
  BOOKED: { label: 'BOOKED', color: '#F87171', bg: 'rgba(248,113,113,0.15)' },
};

const currentAgentHoldIds = new Set(['AZAD-130A', 'AZAD-130B']);

function formatPrice(value: number): string {
  if (value >= 10000000) {
    return `BDT ${(value / 10000000).toFixed(2)} Cr`;
  }
  if (value >= 100000) {
    return `BDT ${(value / 100000).toFixed(1)} Lac`;
  }
  return `BDT ${new Intl.NumberFormat('en-BD', { maximumFractionDigits: 0 }).format(value)}`;
}

function getProjectCounts(units: InventoryUnit[]) {
  return {
    available: units.filter((unit) => unit.status === 'AVAILABLE').length,
    locked: units.filter((unit) => unit.status === 'LOCKED').length,
    booked: units.filter((unit) => unit.status === 'BOOKED').length,
  };
}

function getProjectStatusColor(status: InventoryStatus, colors: ReturnType<typeof useAppTheme>['colors']) {
  if (status === 'AVAILABLE') return colors.success;
  if (status === 'LOCKED') return colors.warning;
  return colors.danger;
}

function getTypeBadgeMeta(type: string) {
  const normalized = type.toLowerCase();
  if (normalized.includes('1600') || normalized.includes('1,600')) {
    return {
      label: 'Type B',
      accent: '#06B6D4',
      background: 'rgba(6, 182, 212, 0.15)',
      border: '#67E8F9',
    };
  }

  if (normalized.includes('1900') || normalized.includes('1,900')) {
    return {
      label: 'Type C',
      accent: '#818CF8',
      background: 'rgba(129, 140, 248, 0.15)',
      border: '#A5B4FC',
    };
  }

  return {
    label: 'Type A',
    accent: '#A2A8B5',
    background: 'rgba(162,168,181,0.12)',
    border: '#D1D5DB',
  };
}

export function StackingMatrixScreen() {
  const { colors } = useAppTheme();
  const [selectedVertical, setSelectedVertical] = useState<'ALL' | InventoryVertical>('ALL');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<InventoryUnit | null>(null);
  const [projects, setProjects] = useState<InventoryProject[]>(inventoryProjects);

  const visibleProjects = useMemo(() => {
    if (selectedVertical === 'ALL') return projects;
    return projects.filter((project) => project.vertical === selectedVertical);
  }, [projects, selectedVertical]);

  const selectedProject = useMemo(
    () => visibleProjects.find((project) => project.id === selectedProjectId) ?? null,
    [selectedProjectId, visibleProjects],
  );

  const showProjectDetail = Boolean(selectedProjectId && selectedProject);

  const handleHoldUnit = () => {
    if (!selectedProject || !selectedUnit) return;

    setProjects((current) =>
      current.map((project) =>
        project.id === selectedProject.id
          ? {
              ...project,
              units: project.units.map((unit) =>
                unit.id === selectedUnit.id ? { ...unit, status: 'LOCKED' } : unit,
              ),
            }
          : project,
      ),
    );

    setSelectedUnit(null);
  };

  const renderStatusBadge = (status: InventoryStatus) => {
    const meta = statusMeta[status];
    return (
      <View style={{ alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: meta.bg, borderWidth: 1, borderColor: meta.color }}>
        <Text style={{ fontSize: 9, fontWeight: '800', letterSpacing: 0.5, color: meta.color }}>{meta.label}</Text>
      </View>
    );
  };

  const renderUnitCard = (unit: InventoryUnit, projectId: string, compact: boolean) => {
    const typeMeta = getTypeBadgeMeta(unit.type);
    const isCompact = compact || unit.code.length > 4;
    const isCurrentAgentHold = currentAgentHoldIds.has(unit.id);

    return (
      <Pressable
        key={unit.id}
        onPress={() => setSelectedUnit(unit)}
        style={{
          width: projectId === 'azad-residency' ? '12.5%' : '24%',
          minWidth: 52,
          minHeight: isCompact ? 44 : 52,
          marginRight: 4,
          marginBottom: 6,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: getProjectStatusColor(unit.status, colors),
          backgroundColor: statusMeta[unit.status].bg,
          paddingVertical: 8,
          paddingHorizontal: 4,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View style={{ position: 'absolute', right: 5, top: 5, width: 7, height: 7, borderRadius: 999, backgroundColor: getProjectStatusColor(unit.status, colors) }} />
        <View
          style={{
            position: 'absolute',
            left: 4,
            top: 4,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: typeMeta.border,
            backgroundColor: typeMeta.background,
            paddingHorizontal: 4,
            paddingVertical: 2,
          }}
        >
          <Text style={{ fontSize: 7, fontWeight: '800', color: typeMeta.accent }}>{typeMeta.label}</Text>
        </View>
        <Text style={{ fontSize: 11, fontWeight: '800', color: colors.textPrimary, marginTop: 10 }}>{unit.code}</Text>
        {unit.status === 'LOCKED' && (
          <Text style={{ marginTop: 3, fontSize: 7, fontWeight: '700', color: isCurrentAgentHold ? colors.warning : colors.textSecondary }}>
            {isCurrentAgentHold ? '02:14:08' : 'Locked'}
          </Text>
        )}
      </Pressable>
    );
  };

  const renderProjectDetail = () => {
    if (!selectedProject) return null;

    if (selectedProject.vertical === 'REAL_ESTATE') {
      return (
        <View style={{ marginTop: 16 }}>
          {Array.from({ length: 13 }, (_, index) => 13 - index).map((floor) => {
            const floorUnits = selectedProject.units.filter((unit) => unit.floor === floor);
            return (
              <View key={floor} style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ width: 26, fontSize: 11, fontWeight: '800', color: colors.textSecondary }}>{floor}</Text>
                <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap' }}>
                  {floorUnits.map((unit) => renderUnitCard(unit, selectedProject.id, true))}
                </View>
              </View>
            );
          })}
        </View>
      );
    }

    return (
      <View style={{ marginTop: 16, flexDirection: 'row', flexWrap: 'wrap' }}>
        {selectedProject.units.map((unit) => renderUnitCard(unit, selectedProject.id, false))}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 18 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.textPrimary }}>Inventory Portfolio</Text>
          <Text style={{ marginTop: 4, fontSize: 12, color: colors.textSecondary }}>Portfolio summary and unit availability matrix</Text>

          <View style={{ marginTop: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {verticalTabs.map((tab) => {
              const isActive = selectedVertical === tab.value;
              return (
                <Pressable
                  key={tab.value}
                  onPress={() => {
                    setSelectedVertical(tab.value);
                    if (tab.value === 'ALL') {
                      setSelectedProjectId(null);
                    } else {
                      const nextProject = projects.find((project) => project.vertical === tab.value);
                      setSelectedProjectId(nextProject?.id ?? null);
                    }
                  }}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: isActive ? colors.brassAccent : colors.border,
                    backgroundColor: isActive ? 'rgba(216,162,67,0.12)' : colors.card,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '800', color: isActive ? colors.brassAccent : colors.textSecondary }}>{tab.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {!visibleProjects.length ? (
            <View style={{ marginTop: 18, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 18 }}>
              <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '700' }}>No projects in this filter.</Text>
            </View>
          ) : !showProjectDetail ? (
            <View style={{ marginTop: 18 }}>
              {visibleProjects.map((project) => {
                const counts = getProjectCounts(project.units);
                const total = project.units.length;
                const barSegments = [
                  { label: 'Available', value: counts.available, color: colors.success },
                  { label: 'Locked', value: counts.locked, color: colors.warning },
                  { label: 'Booked', value: counts.booked, color: colors.danger },
                ];

                return (
                  <Pressable
                    key={project.id}
                    onPress={() => setSelectedProjectId(project.id)}
                    style={{
                      borderRadius: 18,
                      borderWidth: 1,
                      borderColor: colors.border,
                      backgroundColor: colors.card,
                      padding: 16,
                      marginBottom: 12,
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary }}>{project.name}</Text>
                        <Text style={{ marginTop: 4, fontSize: 11, color: colors.textSecondary }}>{project.location}</Text>
                      </View>
                      <View style={{ borderRadius: 999, backgroundColor: 'rgba(216,162,67,0.12)', paddingHorizontal: 8, paddingVertical: 4 }}>
                        <Text style={{ fontSize: 10, fontWeight: '800', color: colors.brassAccent }}>{project.vertical.replace('_', ' ')}</Text>
                      </View>
                    </View>

                    <View style={{ marginTop: 14, height: 8, borderRadius: 999, overflow: 'hidden', backgroundColor: colors.subpanel, flexDirection: 'row' }}>
                      {barSegments.map((segment) => (
                        <View
                          key={segment.label}
                          style={{
                            flex: total === 0 ? 0 : segment.value / total,
                            backgroundColor: segment.color,
                          }}
                        />
                      ))}
                    </View>

                    <View style={{ marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      <View style={{ borderRadius: 999, backgroundColor: 'rgba(52,211,153,0.12)', paddingHorizontal: 8, paddingVertical: 5 }}>
                        <Text style={{ fontSize: 10, color: colors.success }}>🟢 {counts.available} Available</Text>
                      </View>
                      <View style={{ borderRadius: 999, backgroundColor: 'rgba(251,191,36,0.12)', paddingHorizontal: 8, paddingVertical: 5 }}>
                        <Text style={{ fontSize: 10, color: colors.warning }}>🟡 {counts.locked} Hold</Text>
                      </View>
                      <View style={{ borderRadius: 999, backgroundColor: 'rgba(248,113,113,0.12)', paddingHorizontal: 8, paddingVertical: 5 }}>
                        <Text style={{ fontSize: 10, color: colors.danger }}>🔴 {counts.booked} Booked</Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : selectedProject ? (
            <View style={{ marginTop: 18 }}>
              <View style={{ borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Pressable onPress={() => setSelectedProjectId(null)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6 }}>
                    <ArrowLeft size={16} color={colors.textPrimary} />
                    <Text style={{ marginLeft: 6, fontSize: 12, fontWeight: '700', color: colors.textPrimary }}>Back to Projects</Text>
                  </Pressable>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: colors.success }} />
                    <Text style={{ fontSize: 10, color: colors.textSecondary }}>Avail</Text>
                    <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: colors.warning }} />
                    <Text style={{ fontSize: 10, color: colors.textSecondary }}>Hold</Text>
                    <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: colors.danger }} />
                    <Text style={{ fontSize: 10, color: colors.textSecondary }}>Booked</Text>
                  </View>
                </View>

                <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
                  <Building2 size={18} color={colors.brassAccent} />
                  <Text style={{ marginLeft: 8, fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>{selectedProject.name}</Text>
                </View>
                <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center' }}>
                  <MapPin size={14} color={colors.textSecondary} />
                  <Text style={{ marginLeft: 6, fontSize: 12, color: colors.textSecondary }}>{selectedProject.location}</Text>
                </View>

                {renderProjectDetail()}
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <Modal visible={Boolean(selectedUnit)} transparent animationType="slide" onRequestClose={() => setSelectedUnit(null)}>
        {selectedUnit && (
          <Pressable onPress={() => setSelectedUnit(null)} style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
            <Pressable onPress={() => undefined} style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border, padding: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textPrimary }}>{selectedUnit.code}</Text>
                  <Text style={{ marginTop: 4, fontSize: 12, color: colors.textSecondary }}>{selectedUnit.type}</Text>
                </View>
                {renderStatusBadge(selectedUnit.status)}
              </View>

              <View style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View
                  style={{
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: getTypeBadgeMeta(selectedUnit.type).border,
                    backgroundColor: getTypeBadgeMeta(selectedUnit.type).background,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: '800', color: getTypeBadgeMeta(selectedUnit.type).accent }}>
                    {getTypeBadgeMeta(selectedUnit.type).label}
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: '700' }}>
                  {selectedUnit.status === 'LOCKED' && currentAgentHoldIds.has(selectedUnit.id) ? '72h hold countdown active' : 'Locked by another agent'}
                </Text>
              </View>

              <View style={{ marginTop: 16, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel, padding: 14 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary }}>Area</Text>
                <Text style={{ marginTop: 4, fontSize: 16, fontWeight: '800', color: colors.textPrimary }}>{selectedUnit.area}</Text>
                <Text style={{ marginTop: 14, fontSize: 11, fontWeight: '700', color: colors.textSecondary }}>Asking Price</Text>
                <Text style={{ marginTop: 4, fontSize: 18, fontWeight: '800', color: colors.brassAccent }}>{formatPrice(selectedUnit.price)}</Text>
              </View>

              {selectedUnit.status === 'AVAILABLE' && (
                <View style={{ marginTop: 18, gap: 10 }}>
                  <Pressable
                    onPress={handleHoldUnit}
                    style={{ minHeight: 48, borderRadius: 12, backgroundColor: colors.brassAccent, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text style={{ fontSize: 15, fontWeight: '800', color: '#0F172A' }}>Place 72-Hour Hold</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setSelectedUnit(null)}
                    style={{ minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>Book Site Visit</Text>
                  </Pressable>
                </View>
              )}

              {selectedUnit.status !== 'AVAILABLE' && (
                <View style={{ marginTop: 18 }}>
                  <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                    {selectedUnit.status === 'LOCKED'
                      ? currentAgentHoldIds.has(selectedUnit.id)
                        ? 'Only your active hold shows a countdown timer. Other tracked holds remain generic and hidden from client detail views.'
                        : 'This unit is currently locked by another agent. Client details remain hidden for privacy and compliance.'
                      : 'This unit is already booked and is unavailable for new holds.'}
                  </Text>
                  <Pressable onPress={() => setSelectedUnit(null)} style={{ marginTop: 18, minHeight: 48, borderRadius: 12, backgroundColor: colors.subpanel, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>Close</Text>
                  </Pressable>
                </View>
              )}
            </Pressable>
          </Pressable>
        )}
      </Modal>
    </View>
  );
}
