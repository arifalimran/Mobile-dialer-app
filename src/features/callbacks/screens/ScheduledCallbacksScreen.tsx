import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { create } from 'zustand';

import { maskPhoneNumber } from '../../calling/utils/maskPhoneNumber';
import { useTheme } from '../../../theme/ThemeContext';

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
  },
] as const;

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
  const { tokens } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{
        minHeight: 44,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: active ? tokens.accent : tokens.border,
        backgroundColor: active ? tokens.subpanel : 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: '700',
          letterSpacing: 0.3,
          color: active ? tokens.textPrimary : tokens.textSecondary,
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
  const { tokens } = useTheme();
  const filter = useScheduledCallbackStore((state) => state.filter);
  const setFilter = useScheduledCallbackStore((state) => state.setFilter);
  const [lastBridgeId, setLastBridgeId] = useState<string | null>(null);

  const filteredCallbacks = useMemo(() => {
    if (filter === 'ALL') {
      return callbackSeedData;
    }

    return callbackSeedData.filter((callback) => callback.status === filter);
  }, [filter]);

  const handleBridgeCall = (lead: CallbackRow) => {
    setLastBridgeId(lead.id);
    onBridgeCall?.({
      id: lead.id,
      leadName: lead.leadName,
      phone: lead.phone,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: tokens.canvas }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32 }}>
        <View style={{ marginBottom: 18 }}>
          <Text style={{ color: tokens.textPrimary, fontSize: 24, fontWeight: '800' }}>Scheduled callbacks</Text>
          <Text style={{ color: tokens.textSecondary, fontSize: 13, marginTop: 6 }}>
            Re-engage warm leads before demand drops.
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            marginBottom: 16,
            backgroundColor: tokens.card,
            borderRadius: 16,
            padding: 8,
            borderWidth: 1,
            borderColor: tokens.border,
          }}
        >
          <SectionBadge label="Today" active={filter === 'TODAY'} onPress={() => setFilter('TODAY')} count={2} />
          <SectionBadge label="Overdue" active={filter === 'OVERDUE'} onPress={() => setFilter('OVERDUE')} count={2} />
          <SectionBadge label="All" active={filter === 'ALL'} onPress={() => setFilter('ALL')} count={4} />
        </View>

        {filteredCallbacks.map((callback) => {
          const isBridgeQueued = lastBridgeId === callback.id;
          const maskedPhone = maskPhoneNumber(callback.phone);

          return (
            <View
              key={callback.id}
              style={{
                backgroundColor: tokens.card,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: tokens.border,
                padding: 16,
                marginBottom: 14,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: tokens.textPrimary, fontSize: 18, fontWeight: '700' }}>{callback.leadName}</Text>
                  <Text
                    selectable={false}
                    style={{ color: tokens.textSecondary, fontSize: 13, marginTop: 4 }}
                  >
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
                      color: callback.status === 'TODAY' ? tokens.success : tokens.warning,
                      fontSize: 11,
                      fontWeight: '700',
                    }}
                  >
                    {callback.status}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 8,
                  marginTop: 12,
                }}
              >
                <View style={{ backgroundColor: tokens.subpanel, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 }}>
                  <Text style={{ color: tokens.textSecondary, fontSize: 11 }}>Project</Text>
                  <Text style={{ color: tokens.textPrimary, fontSize: 12, fontWeight: '700', marginTop: 2 }}>{callback.project}</Text>
                </View>
                <View style={{ backgroundColor: tokens.subpanel, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 }}>
                  <Text style={{ color: tokens.textSecondary, fontSize: 11 }}>Unit</Text>
                  <Text style={{ color: tokens.textPrimary, fontSize: 12, fontWeight: '700', marginTop: 2 }}>{callback.unit}</Text>
                </View>
                <View style={{ backgroundColor: tokens.subpanel, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 }}>
                  <Text style={{ color: tokens.textSecondary, fontSize: 11 }}>Touch</Text>
                  <Text style={{ color: tokens.textPrimary, fontSize: 12, fontWeight: '700', marginTop: 2 }}>{callback.lastTouch}</Text>
                </View>
              </View>

              <Text style={{ color: tokens.textSecondary, fontSize: 13, lineHeight: 20, marginTop: 14 }}>
                {callback.nextCallback}
              </Text>
              <Text style={{ color: tokens.textSecondary, fontSize: 13, lineHeight: 20, marginTop: 8 }}>
                {callback.note}
              </Text>

              <View style={{ marginTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: tokens.textSecondary, fontSize: 12 }}>Queued for bridge</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => handleBridgeCall(callback)}
                  style={{
                    minHeight: 44,
                    minWidth: 130,
                    backgroundColor: isBridgeQueued ? tokens.accentStrong : tokens.accent,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#F7F3EE', fontSize: 13, fontWeight: '800' }}>
                    {isBridgeQueued ? 'Dialing…' : 'Bridge Call'}
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
