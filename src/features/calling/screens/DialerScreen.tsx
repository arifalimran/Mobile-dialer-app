import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { useAppTheme } from '../../../theme/ThemeContext';
import { LeadCard } from '../components/LeadCard';
import { QueueTracker } from '../components/QueueTracker';
import { useCallQueue } from '../hooks/useCallQueue';
import type { LeadContact } from '../callingTypes';

interface DialerScreenProps {
  activeLeadId: string | null;
  isConnecting: boolean;
  onDialLead: (lead: LeadContact) => void;
  onScrollStateChange?: (isScrolled: boolean) => void;
}

export const DialerScreen: React.FC<DialerScreenProps> = ({
  activeLeadId,
  isConnecting,
  onDialLead,
  onScrollStateChange,
}) => {
  const {
    queueLength,
    queuePosition,
    isQueueComplete,
    recordLeadMessage,
    dailyTarget,
    dailyCompletedCount,
    activeBatchLeads,
  } = useCallQueue();
  const { colors } = useAppTheme();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const completionRatio = dailyTarget > 0 ? dailyCompletedCount / dailyTarget : 0;
  const completionPercent = Math.round(completionRatio * 100);

  useEffect(() => {
    if (!activeBatchLeads.length) {
      setSelectedLeadId(null);
      return;
    }

    if (selectedLeadId && activeBatchLeads.some((lead) => lead.id === selectedLeadId)) return;

    const firstPending = activeBatchLeads.find((lead) => !lead.isActioned);
    setSelectedLeadId(firstPending?.id ?? activeBatchLeads[0]?.id ?? null);
  }, [activeBatchLeads, selectedLeadId]);

  const selectedLead = useMemo(
    () => activeBatchLeads.find((lead) => lead.id === selectedLeadId) ?? null,
    [activeBatchLeads, selectedLeadId],
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 28 }}
        onScroll={(event) => {
          onScrollStateChange?.(event.nativeEvent.contentOffset.y > 20);
        }}
        scrollEventThrottle={16}
      >
        <View style={{ borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, paddingHorizontal: 12, paddingVertical: 9 }}>
          <View style={{ minHeight: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 12, fontWeight: '800', color: colors.textPrimary }}>
              Target: {dailyTarget} | Done: {dailyCompletedCount} ({completionPercent}%)
            </Text>
            <Text style={{ fontSize: 11, color: colors.textSecondary }}>Queue {queuePosition}/{queueLength}</Text>
          </View>
          <View style={{ marginTop: 6, height: 6, borderRadius: 3, backgroundColor: colors.subpanel, overflow: 'hidden' }}>
            <View style={{ width: `${Math.min(100, completionPercent)}%`, height: '100%', backgroundColor: colors.brassAccent }} />
          </View>
        </View>

        <View style={{ marginTop: 10, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, paddingHorizontal: 10, paddingVertical: 10 }}>
          <Text style={{ fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: colors.textSecondary }}>5-LEAD ACTIVE BOARD</Text>
          <View style={{ marginTop: 8, minHeight: 68, maxHeight: 80, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {activeBatchLeads.map((lead) => {
              const isSelected = lead.id === selectedLeadId;
              const statusDot = lead.isActioned ? '🟢' : '🟡';

              return (
                <Pressable
                  key={lead.id}
                  onPress={() => setSelectedLeadId(lead.id)}
                  style={{
                    width: '49%',
                    minHeight: 30,
                    marginBottom: 6,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: isSelected ? colors.brassAccent : lead.isActioned ? colors.success : colors.border,
                    backgroundColor: isSelected ? 'rgba(216,162,67,0.16)' : colors.subpanel,
                    paddingHorizontal: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text numberOfLines={1} style={{ flex: 1, marginRight: 8, fontSize: 12, fontWeight: '700', color: colors.textPrimary }}>
                    {lead.name}
                  </Text>
                  <Text style={{ fontSize: 11 }}>{statusDot}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ marginTop: 12 }}>
          {selectedLead ? (
            <LeadCard
              lead={selectedLead}
              isConnecting={isConnecting && activeLeadId === selectedLead.id}
              onStartCall={() => onDialLead(selectedLead)}
              onRecordMessage={(entry) => recordLeadMessage(selectedLead.id, entry)}
            />
          ) : (
            <View style={{ borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 22 }}>
              <Text style={{ textAlign: 'center', fontSize: 14, color: colors.textSecondary }}>
                {isQueueComplete
                  ? 'Daily target complete. All 30 leads have been actioned.'
                  : 'Finish the current 5-lead batch to unlock the next board.'}
              </Text>
            </View>
          )}
        </View>

        <View style={{ marginTop: 12 }}>
          <QueueTracker position={queuePosition} total={queueLength} />
        </View>
      </ScrollView>
    </View>
  );
};
