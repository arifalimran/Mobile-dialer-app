import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { CalendarDays, MapPin, Clock3, Building2 } from 'lucide-react-native';

import { DatePickerModal } from '../../../components/ui/DatePickerModal';
import { useAppTheme } from '../../../theme/ThemeContext';

type ProjectVertical = 'LAND_SHARE' | 'REAL_ESTATE' | 'INTERIOR';
type TimeWindow = 'MORNING' | 'AFTERNOON' | 'EVENING';
type MeetingPoint = 'SITE' | 'OFFICE';

const projectOptions: Array<{ value: ProjectVertical; label: string }> = [
  { value: 'LAND_SHARE', label: 'Land Share' },
  { value: 'REAL_ESTATE', label: 'Real Estate' },
  { value: 'INTERIOR', label: 'Interior' },
];

const timeWindowOptions: Array<{ value: TimeWindow; label: string }> = [
  { value: 'MORNING', label: 'Morning 10-12' },
  { value: 'AFTERNOON', label: 'Afternoon 14-16' },
  { value: 'EVENING', label: 'Evening 17-19' },
];

const meetingPointOptions: Array<{ value: MeetingPoint; label: string }> = [
  { value: 'SITE', label: 'At Project Site' },
  { value: 'OFFICE', label: 'Office Pickup' },
];

interface BookSiteVisitDrawerProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (payload: {
    project: ProjectVertical;
    preferredDate: string;
    timeWindow: TimeWindow;
    meetingPoint: MeetingPoint;
    notes: string;
  }) => void;
}

export function BookSiteVisitDrawer({ visible, onClose, onConfirm }: BookSiteVisitDrawerProps) {
  const { tokens } = useAppTheme();
  const [project, setProject] = useState<ProjectVertical>('LAND_SHARE');
  const [preferredDate, setPreferredDate] = useState(new Date(Date.now() + 86400000));
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('MORNING');
  const [meetingPoint, setMeetingPoint] = useState<MeetingPoint>('SITE');
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const dateLabel = useMemo(
    () => preferredDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    [preferredDate],
  );

  const handleSubmit = () => {
    onConfirm({
      project,
      preferredDate: preferredDate.toISOString(),
      timeWindow,
      meetingPoint,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <>
      <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={{ flex: 1, backgroundColor: tokens.overlay, justifyContent: 'flex-end' }}>
          <ScrollView
            contentContainerStyle={{
              backgroundColor: tokens.card,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderTopWidth: 1,
              borderColor: tokens.border,
              padding: 20,
              paddingBottom: 32,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: tokens.textPrimary, fontSize: 24, fontWeight: '800' }}>Book site visit</Text>
              <Pressable onPress={onClose} style={{ minHeight: 40, minWidth: 40, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: tokens.textSecondary, fontSize: 18, fontWeight: '700' }}>✕</Text>
              </Pressable>
            </View>

            <View style={{ marginTop: 18 }}>
              <Text style={{ color: tokens.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 }}>
                Project / Vertical
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 8 }}>
                {projectOptions.map((option) => {
                  const active = option.value === project;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => setProject(option.value)}
                      style={{
                        minHeight: 42,
                        paddingHorizontal: 12,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: active ? tokens.accent : tokens.border,
                        backgroundColor: active ? tokens.subpanel : 'transparent',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: active ? tokens.textPrimary : tokens.textSecondary, fontSize: 12, fontWeight: '700' }}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={{ marginTop: 18 }}>
              <Text style={{ color: tokens.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 }}>
                Preferred Date
              </Text>
              <Pressable
                onPress={() => setShowDatePicker(true)}
                style={{
                  marginTop: 10,
                  minHeight: 48,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: tokens.border,
                  backgroundColor: tokens.subpanel,
                  paddingHorizontal: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <CalendarDays size={18} color={tokens.accent} />
                <Text style={{ flex: 1, color: tokens.textPrimary, fontSize: 14, fontWeight: '600', marginLeft: 10 }}>
                  {dateLabel}
                </Text>
              </Pressable>
            </View>

            <View style={{ marginTop: 18 }}>
              <Text style={{ color: tokens.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 }}>
                Time Window
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 8 }}>
                {timeWindowOptions.map((option) => {
                  const active = option.value === timeWindow;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => setTimeWindow(option.value)}
                      style={{
                        minHeight: 42,
                        paddingHorizontal: 12,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: active ? tokens.accent : tokens.border,
                        backgroundColor: active ? tokens.subpanel : 'transparent',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: active ? tokens.textPrimary : tokens.textSecondary, fontSize: 12, fontWeight: '700' }}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={{ marginTop: 18 }}>
              <Text style={{ color: tokens.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 }}>
                Meeting Point
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 8 }}>
                {meetingPointOptions.map((option) => {
                  const active = option.value === meetingPoint;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => setMeetingPoint(option.value)}
                      style={{
                        minHeight: 42,
                        paddingHorizontal: 12,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: active ? tokens.accent : tokens.border,
                        backgroundColor: active ? tokens.subpanel : 'transparent',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: active ? tokens.textPrimary : tokens.textSecondary, fontSize: 12, fontWeight: '700' }}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={{ marginTop: 18 }}>
              <Text style={{ color: tokens.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 }}>
                Client Requirement Notes
              </Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Add viewing timing preferences or special requirements."
                placeholderTextColor={tokens.textSecondary}
                multiline
                numberOfLines={4}
                style={{
                  minHeight: 100,
                  marginTop: 10,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: tokens.border,
                  backgroundColor: tokens.subpanel,
                  color: tokens.textPrimary,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  textAlignVertical: 'top',
                }}
              />
            </View>

            <Pressable
              onPress={handleSubmit}
              style={{
                marginTop: 20,
                minHeight: 52,
                borderRadius: 14,
                backgroundColor: tokens.accent,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#F7F3EE', fontSize: 15, fontWeight: '800' }}>Confirm &amp; Dispatch to Closer</Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>

      <DatePickerModal
        visible={showDatePicker}
        mode="date"
        title="Select Visit Date"
        initialDate={preferredDate}
        onConfirm={(date) => {
          setPreferredDate(date);
          setShowDatePicker(false);
        }}
        onClose={() => setShowDatePicker(false)}
      />
    </>
  );
}
