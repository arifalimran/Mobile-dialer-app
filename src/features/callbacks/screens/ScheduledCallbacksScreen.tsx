import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { AlertTriangle, Clock3, MessageSquareText } from 'lucide-react-native';
import { create } from 'zustand';

import { useAppTheme } from '../../../theme/ThemeContext';
import { MessageComposerModal } from '../../calling/components/MessageComposerModal';
import type { MessageHistoryItem } from '../../calling/callingTypes';
import { maskPhoneNumber } from '../../calling/utils/maskPhoneNumber';

const callbackSeedData = [
  {
    id: 'CB-1041',
    leadName: 'Shahana Akter',
    phone: '+8801819123456',
    project: 'Riverside Heights',
    unit: 'B-09',
    nextCallback: 'Today • 09:15 AM',
    note: 'Prospect wants a final comparison call after finance review.',
    status: 'TODAY' as const,
    lastTouch: '2 min ago',
    messageHistory: [] as MessageHistoryItem[],
  },
  {
    id: 'CB-1029',
    leadName: 'Mahmudul Hasan',
    phone: '+8801718234567',
    project: 'Skyline North',
    unit: 'C-14',
    nextCallback: 'Today • 12:40 PM',
    note: 'Requested call after job transfer approval from spouse.',
    status: 'TODAY' as const,
    lastTouch: '11 min ago',
    messageHistory: [] as MessageHistoryItem[],
  },
  {
    id: 'CB-1015',
    leadName: 'Nusrat Jahan',
    phone: '+8801918765432',
    project: 'Garden Lane',
    unit: 'A-03',
    nextCallback: 'Overdue • 07:10 AM',
    note: 'Missed earlier callback; follow-up required today before inventory lock.',
    status: 'OVERDUE' as const,
    lastTouch: '36 min ago',
    messageHistory: [] as MessageHistoryItem[],
  },
  {
    id: 'CB-1088',
    leadName: 'Zakir Hossain',
    phone: '+8801555123456',
    project: 'Harbor Crest',
    unit: 'D-22',
    nextCallback: 'Overdue • 08:30 AM',
    note: 'Customer available in the evening for site visit confirmation.',
    status: 'OVERDUE' as const,
    lastTouch: '58 min ago',
    messageHistory: [] as MessageHistoryItem[],
  },
];

type CallbackFilter = 'ALL' | 'TODAY' | 'OVERDUE';

type CallbackRow = (typeof callbackSeedData)[number];

interface ScheduledCallbackState {
  filter: CallbackFilter;
  setFilter: (filter: CallbackFilter) => void;
}

const useScheduledCallbackStore = create<ScheduledCallbackState>((set) => ({
  filter: 'TODAY',
  setFilter: (filter) => set({ filter }),
}));

function SectionBadge({ label, active, onPress, count }: { label: string; active: boolean; onPress: () => void; count: number }) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{
        minHeight: 44,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: active ? colors.accent : colors.border,
        backgroundColor: active ? colors.subpanel : 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: '700',
          letterSpacing: 0.3,
          color: active ? colors.textPrimary : colors.textSecondary,
        }}
      >
        {label} {count}
      </Text>
    </Pressable>
  );
}

interface ScheduledCallbacksScreenProps {
  onBridgeCall?: (lead: {
    id: string;
    leadName: string;
    phone: string;
  }) => void;
}

export function ScheduledCallbacksScreen({ onBridgeCall }: ScheduledCallbacksScreenProps) {
  const { colors } = useAppTheme();
  const filter = useScheduledCallbackStore((state) => state.filter);
  const setFilter = useScheduledCallbackStore((state) => state.setFilter);
  const [lastBridgeId, setLastBridgeId] = useState<string | null>(null);
  const [callbackRows, setCallbackRows] = useState<CallbackRow[]>(callbackSeedData);
  const [selectedLead, setSelectedLead] = useState<CallbackRow | null>(null);

  const filteredCallbacks = useMemo(() => {
    if (filter === 'ALL') {
      return callbackRows;
    }

    return callbackRows.filter((callback) => callback.status === filter);
  }, [callbackRows, filter]);

  const totalDue = callbackRows.length;
  const completedToday = callbackRows.filter((callback) => callback.status === 'TODAY').length;
  const adherencePercent = Math.round((completedToday / totalDue) * 100);
  const isAdherenceDanger = adherencePercent < 100;

  const handleBridgeCall = (lead: CallbackRow) => {
    setLastBridgeId(lead.id);
    onBridgeCall?.({
      id: lead.id,
      leadName: lead.leadName,
      phone: lead.phone,
    });
  };

  const handleSendMessage = (entry: MessageHistoryItem) => {
    if (!selectedLead) return;
    setCallbackRows((previous) =>
      previous.map((row) =>
        row.id === selectedLead.id
          ? { ...row, messageHistory: [...(row.messageHistory ?? []), entry] }
          : row,
      ),
    );
    setSelectedLead(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32 }}>
        <View style={{ marginBottom: 18 }}>
          <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: '800' }}>Scheduled callbacks</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 6 }}>
            Re-engage warm leads before demand drops.
          </Text>
        </View>

        <View
          style={{
            marginBottom: 16,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: isAdherenceDanger ? '#F87171' : colors.border,
            backgroundColor: isAdherenceDanger ? 'rgba(248,113,113,0.12)' : colors.card,
            padding: 14,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Clock3 size={18} color={isAdherenceDanger ? '#FECACA' : colors.success} />
            <Text style={{ marginLeft: 8, fontSize: 12, fontWeight: '800', color: isAdherenceDanger ? '#FECACA' : colors.textPrimary }}>
              Today&apos;s Callback Adherence: {completedToday} / {totalDue} Completed (Target: 100%)
            </Text>
          </View>
          <View style={{ marginTop: 10, height: 8, borderRadius: 999, backgroundColor: colors.subpanel, overflow: 'hidden' }}>
            <View style={{ height: '100%', width: `${Math.min(100, adherencePercent)}%`, backgroundColor: isAdherenceDanger ? '#F87171' : colors.success }} />
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            marginBottom: 16,
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 8,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <SectionBadge label="Today" active={filter === 'TODAY'} onPress={() => setFilter('TODAY')} count={2} />
          <SectionBadge label="Overdue" active={filter === 'OVERDUE'} onPress={() => setFilter('OVERDUE')} count={2} />
          <SectionBadge label="All" active={filter === 'ALL'} onPress={() => setFilter('ALL')} count={4} />
        </View>

        {filteredCallbacks.map((callback) => {
          const isBridgeQueued = lastBridgeId === callback.id;
          const maskedPhone = maskPhoneNumber(callback.phone);
          const isOverdue = callback.status === 'OVERDUE';

          return (
            <View
              key={callback.id}
              style={{
                backgroundColor: colors.card,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: isOverdue ? '#F87171' : colors.border,
                padding: 16,
                marginBottom: 14,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '700' }}>{callback.leadName}</Text>
                  <Text selectable={false} style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>
                    {maskedPhone}
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: callback.status === 'TODAY' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                    borderRadius: 10,
                    paddingHorizontal: 8,
                    paddingVertical: 5,
                  }}
                >
                  <Text
                    style={{
                      color: callback.status === 'TODAY' ? colors.success : colors.warning,
                      fontSize: 11,
                      fontWeight: '700',
                    }}
                  >
                    {callback.status}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                <View style={{ backgroundColor: colors.subpanel, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Project</Text>
                  <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '700', marginTop: 2 }}>{callback.project}</Text>
                </View>
                <View style={{ backgroundColor: colors.subpanel, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Unit</Text>
                  <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '700', marginTop: 2 }}>{callback.unit}</Text>
                </View>
                <View style={{ backgroundColor: colors.subpanel, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Touch</Text>
                  <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '700', marginTop: 2 }}>{callback.lastTouch}</Text>
                </View>
              </View>

              <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 20, marginTop: 14 }}>{callback.nextCallback}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 20, marginTop: 8 }}>{callback.note}</Text>

              <View style={{ marginTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <Pressable
                  onPress={() => setSelectedLead(callback)}
                  style={{
                    flex: 1,
                    minHeight: 44,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.subpanel,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MessageSquareText size={15} color={colors.textPrimary} />
                  <Text style={{ marginLeft: 8, fontSize: 12, fontWeight: '700', color: colors.textPrimary }}>💬 Message</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => handleBridgeCall(callback)}
                  style={{
                    flex: 1,
                    minHeight: 44,
                    backgroundColor: isBridgeQueued ? colors.accent : colors.accent,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#F7F3EE', fontSize: 13, fontWeight: '800' }}>{isBridgeQueued ? 'Dialing…' : 'Bridge Call'}</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <MessageComposerModal
        visible={Boolean(selectedLead)}
        lead={selectedLead ? {
          id: selectedLead.id,
          name: selectedLead.leadName,
          maskedPhoneNumber: maskPhoneNumber(selectedLead.phone),
          rawPhoneNumber: selectedLead.phone,
          messageHistory: selectedLead.messageHistory ?? [],
        } : null}
        onClose={() => setSelectedLead(null)}
        onSendMessage={handleSendMessage}
      />
    </View>
  );
}
