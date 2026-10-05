import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { AlertTriangle, Clock3, MessageSquareText } from 'lucide-react-native';
import { create } from 'zustand';

import { useAppTheme } from '../../../theme/ThemeContext';
import { MOCK_CALLBACKS } from '../constants/mockCallbacks';
import { MessageComposerModal } from '../../calling/components/MessageComposerModal';
import type { MessageHistoryItem } from '../../calling/callingTypes';
import { maskPhoneNumber } from '../../calling/utils/maskPhoneNumber';

type CallbackFilter = 'ALL' | 'TODAY' | 'OVERDUE';

type CallbackRow = (typeof MOCK_CALLBACKS)[number];

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
  resolvedCallbackIds?: string[];
  onScrollStateChange?: (isScrolled: boolean) => void;
  onDialClient?: (lead: {
    id: string;
    leadName: string;
    phone: string;
  }) => void;
}

export function ScheduledCallbacksScreen({ resolvedCallbackIds = [], onScrollStateChange, onDialClient }: ScheduledCallbacksScreenProps) {
  const { colors } = useAppTheme();
  const filter = useScheduledCallbackStore((state) => state.filter);
  const setFilter = useScheduledCallbackStore((state) => state.setFilter);
  const [lastDialId, setLastDialId] = useState<string | null>(null);
  const [callbackRows, setCallbackRows] = useState<CallbackRow[]>(MOCK_CALLBACKS);
  const [selectedLead, setSelectedLead] = useState<CallbackRow | null>(null);

  const filteredCallbacks = useMemo(() => {
    const unresolved = callbackRows.filter((callback) => !resolvedCallbackIds.includes(callback.id));
    if (filter === 'ALL') {
      return unresolved;
    }

    return unresolved.filter((callback) => callback.status === filter);
  }, [callbackRows, filter, resolvedCallbackIds]);

  const unresolvedRows = callbackRows.filter((callback) => !resolvedCallbackIds.includes(callback.id));
  const totalDue = unresolvedRows.length;
  const completedToday = unresolvedRows.filter((callback) => callback.status === 'TODAY').length;
  const adherencePercent = totalDue > 0 ? Math.round((completedToday / totalDue) * 100) : 100;
  const isAdherenceDanger = adherencePercent < 100;

  const handleDialClient = (lead: CallbackRow) => {
    setLastDialId(lead.id);
    onDialClient?.({
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
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32 }}
        onScroll={(event) => {
          onScrollStateChange?.(event.nativeEvent.contentOffset.y > 20);
        }}
        scrollEventThrottle={16}
      >
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
          const isDialQueued = lastDialId === callback.id;
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
                  onPress={() => handleDialClient(callback)}
                  style={{
                    flex: 1,
                    minHeight: 44,
                    backgroundColor: isDialQueued ? colors.accent : colors.accent,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#F7F3EE', fontSize: 13, fontWeight: '800' }}>{isDialQueued ? 'Dialing…' : 'Dial Client'}</Text>
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
