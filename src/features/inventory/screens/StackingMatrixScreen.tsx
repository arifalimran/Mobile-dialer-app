import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { ArrowLeft, Building2, MapPin } from 'lucide-react-native';

import { useAppTheme } from '../../../theme/ThemeContext';
import {
  inventoryProjects,
  type InventoryProject,
  type InventoryStatus,
  type InventoryUnit,
  type InventoryVertical,
} from '../types';

const verticalTabs: Array<{ label: string; value: InventoryVertical }> = [
  { label: '🏢 Real Estate', value: 'REAL_ESTATE' },
  { label: '🌿 Land Share', value: 'LAND_SHARE' },
  { label: '🛋️ Interior Solutions', value: 'INTERIOR' },
];

const statusMeta: Record<InventoryStatus, { label: string; color: string; bg: string }> = {
  AVAILABLE: { label: 'Available', color: '#34D399', bg: 'rgba(52,211,153,0.15)' },
  PENDING_APPROVAL: { label: 'Pending Approval', color: '#F59E0B', bg: 'rgba(245,158,11,0.18)' },
  LOCKED: { label: 'Hold', color: '#FBBF24', bg: 'rgba(251,191,36,0.14)' },
  BOOKED: { label: 'Booked', color: '#F87171', bg: 'rgba(248,113,113,0.15)' },
};

function formatPrice(value: number): string {
  return `BDT ${new Intl.NumberFormat('en-BD', { maximumFractionDigits: 0 }).format(value)}`;
}

function formatDuration(expiresAt?: number): string {
  if (!expiresAt) return '72h 00m';
  const remainingMs = Math.max(0, expiresAt - Date.now());
  const totalHours = Math.floor(remainingMs / (1000 * 60 * 60));
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${String(totalHours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
}

function getProjectCounts(units: InventoryUnit[]) {
  return {
    available: units.filter((unit) => unit.status === 'AVAILABLE').length,
    pending: units.filter((unit) => unit.status === 'PENDING_APPROVAL').length,
    locked: units.filter((unit) => unit.status === 'LOCKED').length,
    booked: units.filter((unit) => unit.status === 'BOOKED').length,
  };
}

function getStatusColor(status: InventoryStatus, colors: ReturnType<typeof useAppTheme>['colors']) {
  if (status === 'AVAILABLE') return colors.success;
  if (status === 'PENDING_APPROVAL') return '#F59E0B';
  if (status === 'LOCKED') return colors.warning;
  return colors.danger;
}

function getVerticalHeader(vertical: InventoryVertical) {
  if (vertical === 'REAL_ESTATE') return 'Floor Matrix';
  if (vertical === 'LAND_SHARE') return 'Plot Layout';
  return 'Package List';
}

export function StackingMatrixScreen({ onScrollStateChange }: { onScrollStateChange?: (isScrolled: boolean) => void } = {}) {
  const { colors } = useAppTheme();
  const [selectedVertical, setSelectedVertical] = useState<InventoryVertical>('REAL_ESTATE');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState<InventoryProject[]>(inventoryProjects);

  const visibleProjects = useMemo(
    () =>
      projects.filter((project) => {
        if (project.vertical !== selectedVertical) return false;
        const query = searchTerm.trim().toLowerCase();
        if (!query) return true;

        return (
          project.name.toLowerCase().includes(query) ||
          project.location.toLowerCase().includes(query) ||
          project.units.some((unit) => unit.code.toLowerCase().includes(query) || unit.title.toLowerCase().includes(query))
        );
      }),
    [projects, searchTerm, selectedVertical],
  );

  const selectedProject = useMemo(
    () => visibleProjects.find((project) => project.id === selectedProjectId) ?? null,
    [selectedProjectId, visibleProjects],
  );

  const selectedUnit = useMemo(
    () => selectedProject?.units.find((unit) => unit.id === selectedUnitId) ?? null,
    [selectedProject, selectedUnitId],
  );

  const selectedProjectUnits = useMemo(() => {
    if (!selectedProject) return [];
    const query = searchTerm.trim().toLowerCase();
    if (!query) return selectedProject.units;

    return selectedProject.units.filter((unit) => {
      return (
        unit.code.toLowerCase().includes(query) ||
        unit.title.toLowerCase().includes(query) ||
        unit.categoryLabel.toLowerCase().includes(query) ||
        unit.floorLabel.toLowerCase().includes(query)
      );
    });
  }, [searchTerm, selectedProject]);

  const portfolioStats = useMemo(() => {
    const allUnits = projects.flatMap((project) => project.units);
    const counts = getProjectCounts(allUnits);
    const total = Math.max(1, allUnits.length);
    const byVertical = {
      realEstate: projects.filter((project) => project.vertical === 'REAL_ESTATE').flatMap((project) => project.units).length,
      landShare: projects.filter((project) => project.vertical === 'LAND_SHARE').flatMap((project) => project.units).length,
      interior: projects.filter((project) => project.vertical === 'INTERIOR').flatMap((project) => project.units).length,
    };
    const myHolds = allUnits.filter(
      (unit) => (unit.status === 'PENDING_APPROVAL' || unit.status === 'LOCKED') && unit.holdOwner === 'ME',
    ).length;

    return {
      total: allUnits.length,
      available: counts.available,
      pending: counts.pending,
      locked: counts.locked,
      booked: counts.booked,
      holdRatio: Math.round(((counts.pending + counts.locked) / total) * 100),
      byVertical,
      myHolds,
      totalHolds: counts.pending + counts.locked,
    };
  }, [projects]);

  const updateUnit = (updater: (unit: InventoryUnit) => InventoryUnit) => {
    if (!selectedProject || !selectedUnit) return;

    setProjects((current) =>
      current.map((project) =>
        project.id === selectedProject.id
          ? {
              ...project,
              units: project.units.map((unit) => (unit.id === selectedUnit.id ? updater(unit) : unit)),
            }
          : project,
      ),
    );
  };

  const handleHoldUnit = () => {
    updateUnit((unit) => ({
      ...unit,
      status: 'PENDING_APPROVAL',
      holdOwner: 'ME',
      holdRequestedAt: Date.now(),
      holdExpiresAt: Date.now() + 2 * 60 * 60 * 1000,
    }));
  };

  const handleApproveHold = () => {
    updateUnit((unit) => ({
      ...unit,
      status: 'LOCKED',
      holdOwner: 'ME',
      holdRequestedAt: undefined,
      holdExpiresAt: Date.now() + 72 * 60 * 60 * 1000,
    }));
  };

  const handleReleaseHold = () => {
    updateUnit((unit) => ({
      ...unit,
      status: 'AVAILABLE',
      holdOwner: undefined,
      holdRequestedAt: undefined,
      holdExpiresAt: undefined,
    }));
  };

  const handleSubmitToken = () => {
    updateUnit((unit) => ({
      ...unit,
      status: 'BOOKED',
      holdOwner: undefined,
      holdRequestedAt: undefined,
      holdExpiresAt: undefined,
    }));
  };

  const renderStatusBadge = (unit: InventoryUnit) => {
    const meta = statusMeta[unit.status];
    return (
      <View style={{ alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: meta.bg, borderWidth: 1, borderColor: meta.color }}>
        <Text style={{ fontSize: 9, fontWeight: '800', letterSpacing: 0.5, color: meta.color }}>{meta.label}</Text>
      </View>
    );
  };

  const renderUnitCard = (unit: InventoryUnit) => {
    const isMatrix = selectedProject?.vertical === 'REAL_ESTATE';
    const isMine = (unit.status === 'LOCKED' || unit.status === 'PENDING_APPROVAL') && unit.holdOwner === 'ME';
    const isTeamHold = unit.status === 'LOCKED' && unit.holdOwner === 'OTHER';
    const resolvedStatusColor = isTeamHold ? '#A855F7' : getStatusColor(unit.status, colors);
    const resolvedStatusBg = isTeamHold ? 'rgba(168,85,247,0.15)' : statusMeta[unit.status].bg;

    return (
      <Pressable
        key={unit.id}
        onPress={() => setSelectedUnitId(unit.id)}
        style={{
          width: isMatrix ? '24%' : '48%',
          minHeight: 72,
          marginBottom: 8,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: resolvedStatusColor,
          backgroundColor: resolvedStatusBg,
          paddingHorizontal: 10,
          paddingVertical: 10,
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: '800', color: colors.textPrimary }}>{unit.code}</Text>
        <Text style={{ marginTop: 4, fontSize: 10, color: colors.textSecondary }}>{unit.netSize}</Text>
        <Text style={{ marginTop: 4, fontSize: 10, fontWeight: '700', color: isMine ? colors.warning : resolvedStatusColor }}>
          {unit.status === 'LOCKED' || unit.status === 'PENDING_APPROVAL'
            ? isMine
              ? formatDuration(unit.holdExpiresAt)
              : statusMeta[unit.status].label
            : statusMeta[unit.status].label}
        </Text>
      </Pressable>
    );
  };

  const renderProjectDetail = () => {
    if (!selectedProject) return null;

    if (selectedProject.vertical === 'REAL_ESTATE') {
      const floors = Array.from(new Set(selectedProjectUnits.map((unit) => unit.floor).filter(Boolean) as number[])).sort((a, b) => b - a);
      return (
        <View style={{ marginTop: 16 }}>
          {floors.map((floor) => {
            const floorUnits = selectedProjectUnits.filter((unit) => unit.floor === floor);
            return (
              <View key={floor} style={{ marginBottom: 10 }}>
                <Text style={{ marginBottom: 8, fontSize: 12, fontWeight: '800', color: colors.textSecondary }}>Level {floor}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                  {floorUnits.map((unit) => renderUnitCard(unit))}
                </View>
              </View>
            );
          })}
        </View>
      );
    }

    return (
      <View style={{ marginTop: 16, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {selectedProjectUnits.map((unit) => renderUnitCard(unit))}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        style={{ flex: 1 }}
        onScroll={(event) => {
          onScrollStateChange?.(event.nativeEvent.contentOffset.y > 20);
        }}
        scrollEventThrottle={16}
      >
        <View style={{ paddingHorizontal: 16, paddingTop: 18 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.textPrimary }}>Inventory Portfolio</Text>
          <Text style={{ marginTop: 4, fontSize: 12, color: colors.textSecondary }}>Strictly isolated by business vertical with privacy-safe hold control.</Text>

          <TextInput
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search project, unit, or package"
            placeholderTextColor={colors.textSecondary}
            style={{ marginTop: 14, minHeight: 48, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, paddingHorizontal: 16, color: colors.textPrimary }}
          />

          <View style={{ marginTop: 14, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 16 }}>
            <Text style={{ fontSize: 12, fontWeight: '800', letterSpacing: 0.8, color: colors.textSecondary }}>PORTFOLIO SNAPSHOT</Text>
            <Text style={{ marginTop: 10, fontSize: 13, color: colors.textPrimary }}>
              RealEstate: {portfolioStats.byVertical.realEstate} | Land: {portfolioStats.byVertical.landShare} | Interior: {portfolioStats.byVertical.interior}
            </Text>
            <Text style={{ marginTop: 6, fontSize: 13, color: colors.textPrimary }}>
              My Holds: {portfolioStats.myHolds} | Total Holds: {portfolioStats.totalHolds}
            </Text>
            <Text style={{ marginTop: 10, fontSize: 12, color: colors.textSecondary }}>
              Available {portfolioStats.available} • Pending approval {portfolioStats.pending} • Approved holds {portfolioStats.locked}
            </Text>
          </View>

          <View style={{ marginTop: 12, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 12 }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: colors.textSecondary }}>STATUS LEGEND</Text>
            <View style={{ marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {Object.entries(statusMeta).map(([status, meta]) => (
                <View key={status} style={{ borderRadius: 999, borderWidth: 1, borderColor: meta.color, backgroundColor: meta.bg, paddingHorizontal: 10, paddingVertical: 5 }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: meta.color }}>{meta.label}</Text>
                </View>
              ))}
              <View style={{ borderRadius: 999, borderWidth: 1, borderColor: '#A855F7', backgroundColor: 'rgba(168,85,247,0.15)', paddingHorizontal: 10, paddingVertical: 5 }}>
                <Text style={{ fontSize: 10, fontWeight: '800', color: '#A855F7' }}>Team Hold (Other Agent)</Text>
              </View>
            </View>
          </View>

          <View style={{ marginTop: 16, flexDirection: 'row', gap: 8 }}>
            {verticalTabs.map((tab) => {
              const isActive = selectedVertical === tab.value;
              return (
                <Pressable
                  key={tab.value}
                  onPress={() => {
                    setSelectedVertical(tab.value);
                    setSelectedProjectId(null);
                    setSelectedUnitId(null);
                  }}
                  style={{
                    flex: 1,
                    minHeight: 48,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: isActive ? colors.brassAccent : colors.border,
                    backgroundColor: isActive ? 'rgba(216,162,67,0.12)' : colors.card,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 8,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '800', color: isActive ? colors.brassAccent : colors.textSecondary, textAlign: 'center' }}>{tab.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {!selectedProject ? (
            <View style={{ marginTop: 18 }}>
              {visibleProjects.map((project) => {
                const counts = getProjectCounts(project.units);
                const total = project.units.length;

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
                    <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary }}>{project.name}</Text>
                    <Text style={{ marginTop: 4, fontSize: 11, color: colors.textSecondary }}>{project.location}</Text>
                    <Text style={{ marginTop: 8, fontSize: 12, color: colors.textSecondary }}>{getVerticalHeader(project.vertical)}</Text>

                    <View style={{ marginTop: 14, height: 8, borderRadius: 999, overflow: 'hidden', backgroundColor: colors.subpanel, flexDirection: 'row' }}>
                      <View style={{ flex: total === 0 ? 0 : counts.available / total, backgroundColor: colors.success }} />
                      <View style={{ flex: total === 0 ? 0 : counts.pending / total, backgroundColor: '#F59E0B' }} />
                      <View style={{ flex: total === 0 ? 0 : counts.locked / total, backgroundColor: colors.warning }} />
                      <View style={{ flex: total === 0 ? 0 : counts.booked / total, backgroundColor: colors.danger }} />
                    </View>

                    <View style={{ marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      <View style={{ borderRadius: 999, backgroundColor: 'rgba(52,211,153,0.12)', paddingHorizontal: 8, paddingVertical: 5 }}>
                        <Text style={{ fontSize: 10, color: colors.success }}>🟢 {counts.available} Available</Text>
                      </View>
                      <View style={{ borderRadius: 999, backgroundColor: 'rgba(245,158,11,0.14)', paddingHorizontal: 8, paddingVertical: 5 }}>
                        <Text style={{ fontSize: 10, color: '#F59E0B' }}>🟠 {counts.pending} Pending</Text>
                      </View>
                      <View style={{ borderRadius: 999, backgroundColor: 'rgba(251,191,36,0.12)', paddingHorizontal: 8, paddingVertical: 5 }}>
                        <Text style={{ fontSize: 10, color: colors.warning }}>🟡 {counts.locked} Approved Hold</Text>
                      </View>
                      <View style={{ borderRadius: 999, backgroundColor: 'rgba(248,113,113,0.12)', paddingHorizontal: 8, paddingVertical: 5 }}>
                        <Text style={{ fontSize: 10, color: colors.danger }}>🔴 {counts.booked} Booked</Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View style={{ marginTop: 18 }}>
              <View style={{ borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 14 }}>
                <Pressable onPress={() => { setSelectedProjectId(null); setSelectedUnitId(null); }} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6 }}>
                  <ArrowLeft size={16} color={colors.textPrimary} />
                  <Text style={{ marginLeft: 6, fontSize: 12, fontWeight: '700', color: colors.textPrimary }}>Back to Projects</Text>
                </Pressable>

                <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
                  <Building2 size={18} color={colors.brassAccent} />
                  <Text style={{ marginLeft: 8, fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>{selectedProject.name}</Text>
                </View>
                <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center' }}>
                  <MapPin size={14} color={colors.textSecondary} />
                  <Text style={{ marginLeft: 6, fontSize: 12, color: colors.textSecondary }}>{selectedProject.location}</Text>
                </View>
                <Text style={{ marginTop: 8, fontSize: 12, color: colors.textSecondary }}>{getVerticalHeader(selectedProject.vertical)}</Text>
                <Text style={{ marginTop: 6, fontSize: 12, color: colors.textSecondary }}>Search is active across unit codes, titles, and floor labels.</Text>

                {renderProjectDetail()}
              </View>
            </View>
          )}

        </View>
      </ScrollView>

      <Modal visible={Boolean(selectedUnit)} transparent animationType="slide" onRequestClose={() => setSelectedUnitId(null)}>
        {selectedUnit && (
          <Pressable onPress={() => setSelectedUnitId(null)} style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
            <Pressable onPress={() => undefined} style={{ maxHeight: '88%', borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border, padding: 20 }}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textPrimary }}>{selectedUnit.code}</Text>
                    <Text style={{ marginTop: 4, fontSize: 12, color: colors.textSecondary }}>{selectedUnit.title}</Text>
                  </View>
                  {renderStatusBadge(selectedUnit)}
                </View>

                <View style={{ marginTop: 16, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel, padding: 14 }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', letterSpacing: 0.8, color: colors.textSecondary }}>ARCHITECTURAL &amp; LAYOUT SPECS</Text>
                  <Text style={{ marginTop: 10, fontSize: 13, color: colors.textPrimary }}>Unit Code: {selectedUnit.code}</Text>
                  <Text style={{ marginTop: 6, fontSize: 13, color: colors.textPrimary }}>Net &amp; Gross Size: {selectedUnit.netSize} / {selectedUnit.grossSize}</Text>
                  <Text style={{ marginTop: 6, fontSize: 13, color: colors.textPrimary }}>Land Size: {selectedUnit.landSize}</Text>
                  <Text style={{ marginTop: 6, fontSize: 13, color: colors.textPrimary }}>Floor Level: {selectedUnit.floorLabel}</Text>
                  <Text style={{ marginTop: 6, fontSize: 13, color: colors.textPrimary }}>Directional Facing: {selectedUnit.facing}</Text>
                  <Text style={{ marginTop: 6, fontSize: 13, color: colors.textPrimary }}>View / Outlook: {selectedUnit.viewLabel}</Text>
                  <Text style={{ marginTop: 6, fontSize: 13, color: colors.textPrimary }}>Bed / Bath / Veranda: {selectedUnit.bedrooms ?? 'N/A'} / {selectedUnit.bathrooms ?? 'N/A'} / {selectedUnit.verandas ?? 'N/A'}</Text>
                  <Text style={{ marginTop: 6, fontSize: 13, color: colors.textPrimary }}>Parking Allocation: {selectedUnit.parkingSlots}</Text>
                </View>

                <View style={{ marginTop: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel, padding: 14 }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', letterSpacing: 0.8, color: colors.textSecondary }}>COMMERCIAL &amp; PAYMENT BREAKDOWN</Text>
                  <Text style={{ marginTop: 10, fontSize: 13, color: colors.textPrimary }}>
                    Total Asking Price: {selectedUnit.status === 'BOOKED' ? 'HIDDEN' : formatPrice(selectedUnit.price)}
                  </Text>
                  <Text style={{ marginTop: 6, fontSize: 13, color: colors.textPrimary }}>
                    Down Payment: {selectedUnit.status === 'BOOKED' ? 'HIDDEN' : `${selectedUnit.downPaymentPercent}%`}
                  </Text>
                  <Text style={{ marginTop: 6, fontSize: 13, color: colors.textPrimary }}>
                    {selectedUnit.installmentMonths}-Month Installment: {selectedUnit.status === 'BOOKED' ? 'HIDDEN' : `${formatPrice(selectedUnit.installmentAmount)} / month`}
                  </Text>
                  <Text style={{ marginTop: 6, fontSize: 13, color: colors.textPrimary }}>Handover Date: {selectedUnit.handoverDate}</Text>
                  <Text style={{ marginTop: 6, fontSize: 13, color: colors.textPrimary }}>
                    Projected Monthly Commission: {selectedUnit.status === 'BOOKED' ? 'HIDDEN' : formatPrice(selectedUnit.monthlyCommission ?? 0)}
                  </Text>
                </View>

                {selectedUnit.status === 'AVAILABLE' && (
                  <View style={{ marginTop: 18, gap: 10 }}>
                    <Text style={{ fontSize: 13, color: colors.success }}>🟢 Available: Full specs visible. Hold request enters a 2-hour head-office approval lane first.</Text>
                    <Pressable onPress={handleHoldUnit} style={{ minHeight: 48, borderRadius: 12, backgroundColor: colors.brassAccent, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 15, fontWeight: '800', color: '#0F172A' }}>Request Hold Approval</Text>
                    </Pressable>
                  </View>
                )}

                {selectedUnit.status === 'PENDING_APPROVAL' && selectedUnit.holdOwner === 'ME' && (
                  <View style={{ marginTop: 18, gap: 10 }}>
                    <Text style={{ fontSize: 13, color: '#F59E0B' }}>🟠 Pending Approval: Soft lock active for {formatDuration(selectedUnit.holdExpiresAt)} while head office reviews the hold.</Text>
                    <Pressable onPress={handleReleaseHold} style={{ minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: '#F59E0B', backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 15, fontWeight: '800', color: '#F59E0B' }}>Withdraw Request</Text>
                    </Pressable>
                    <Pressable onPress={handleApproveHold} style={{ minHeight: 48, borderRadius: 12, backgroundColor: colors.warning, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 15, fontWeight: '800', color: '#0F172A' }}>Simulate Head Office Approval</Text>
                    </Pressable>
                  </View>
                )}

                {selectedUnit.status === 'LOCKED' && selectedUnit.holdOwner === 'ME' && (
                  <View style={{ marginTop: 18, gap: 10 }}>
                    <Text style={{ fontSize: 13, color: colors.warning }}>🟡 Approved Hold: Countdown active for {formatDuration(selectedUnit.holdExpiresAt)}.</Text>
                    <Pressable onPress={handleReleaseHold} style={{ minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.warning, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 15, fontWeight: '800', color: colors.warning }}>Release Hold</Text>
                    </Pressable>
                    <Pressable onPress={handleSubmitToken} style={{ minHeight: 48, borderRadius: 12, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 15, fontWeight: '800', color: '#FFFFFF' }}>Submit Token</Text>
                    </Pressable>
                  </View>
                )}

                {selectedUnit.status === 'LOCKED' && selectedUnit.holdOwner === 'OTHER' && (
                  <View style={{ marginTop: 18 }}>
                    <Text style={{ fontSize: 13, color: colors.warning }}>🟡 Other Agent&apos;s Approved Hold: Locked by Sales Team until {selectedUnit.holdExpiresAt ? new Date(selectedUnit.holdExpiresAt).toLocaleString() : 'TBD'}.</Text>
                    <Text style={{ marginTop: 8, fontSize: 13, color: colors.textSecondary }}>Customer identity, payment notes, and negotiation details remain hidden.</Text>
                  </View>
                )}

                {selectedUnit.status === 'PENDING_APPROVAL' && selectedUnit.holdOwner === 'OTHER' && (
                  <View style={{ marginTop: 18 }}>
                    <Text style={{ fontSize: 13, color: '#F59E0B' }}>🟠 Other Agent&apos;s Pending Approval: Soft-locked while head office reviews the request.</Text>
                    <Text style={{ marginTop: 8, fontSize: 13, color: colors.textSecondary }}>All customer identity and private notes remain hidden.</Text>
                  </View>
                )}

                {selectedUnit.status === 'BOOKED' && (
                  <View style={{ marginTop: 18 }}>
                    <Text style={{ fontSize: 13, color: colors.danger }}>🔴 Sold / Unavailable</Text>
                    <Text style={{ marginTop: 8, fontSize: 13, color: colors.textSecondary }}>Buyer personal finances and phone numbers remain fully masked.</Text>
                  </View>
                )}

                <Pressable onPress={() => setSelectedUnitId(null)} style={{ marginTop: 18, minHeight: 48, borderRadius: 12, backgroundColor: colors.subpanel, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>Close</Text>
                </Pressable>
              </ScrollView>
            </Pressable>
          </Pressable>
        )}
      </Modal>
    </View>
  );
}
