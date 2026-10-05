import React from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { BadgeCheck, CalendarClock, X } from 'lucide-react-native';

import { useAppTheme } from '../../../theme/ThemeContext';
import { useShiftStore } from '../hooks/useShiftStore';

interface DemoAttendanceSession {
  id: string;
  dateLabel: string;
  slotLabel: string;
  clockRange: string;
  hours: number;
  calls: number;
  allowance: number;
}

const DEMO_SESSIONS: DemoAttendanceSession[] = [
  { id: 'demo-1', dateLabel: 'Sun, 04 Oct 2026', slotLabel: 'Slot A (10:00–14:00)', clockRange: '10:02 AM – 02:00 PM', hours: 3.97, calls: 18, allowance: 300 },
  { id: 'demo-2', dateLabel: 'Sat, 03 Oct 2026', slotLabel: 'Slot B (14:30–18:30)', clockRange: '02:30 PM – 06:30 PM', hours: 4.0, calls: 22, allowance: 300 },
  { id: 'demo-3', dateLabel: 'Fri, 02 Oct 2026', slotLabel: 'Slot A (10:00–14:00)', clockRange: '10:00 AM – 02:00 PM', hours: 4.0, calls: 15, allowance: 300 },
  { id: 'demo-4', dateLabel: 'Thu, 01 Oct 2026', slotLabel: 'Slot A (10:00–14:00)', clockRange: '10:15 AM – 02:00 PM', hours: 3.75, calls: 14, allowance: 300 },
];

const TOTAL_LOGGED_HOURS = 64.0;
const TOTAL_TARGET_HOURS = 120.0;
const DAYS_CLOCKED = 16;
const DAYS_TARGET = 30;
const ATTENDANCE_BONUS = 4800;

/**
 * Module 6: rich attendance history modal shared by `ShiftsScreen` (ledger
 * card) and `ProfileDrawer` (quick action shortcut). Visibility is driven
 * globally by `useShiftStore` so either entry point opens the same modal.
 */
export const AttendanceDetailModal: React.FC = () => {
  const { colors } = useAppTheme();
  const isOpen = useShiftStore((state) => state.isAttendanceModalOpen);
  const closeAttendanceModal = useShiftStore((state) => state.closeAttendanceModal);

  const progressPercent = Math.min(100, Math.round((TOTAL_LOGGED_HOURS / TOTAL_TARGET_HOURS) * 100));

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={closeAttendanceModal}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay }}>
        <View style={{ maxHeight: '85%', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CalendarClock size={20} color={colors.accent} />
              <Text style={{ marginLeft: 8, fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>Attendance Ledger</Text>
            </View>
            <Pressable onPress={closeAttendanceModal} style={{ height: 36, width: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 999, backgroundColor: colors.subpanel }}>
              <X size={16} color={colors.textPrimary} />
            </Pressable>
          </View>

          <ScrollView style={{ marginTop: 16 }} showsVerticalScrollIndicator={false}>
            <View style={{ borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel, padding: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 12, fontWeight: '800', color: colors.textSecondary }}>TOTAL LOGGED</Text>
                <Text style={{ fontSize: 13, fontWeight: '800', color: colors.textPrimary }}>
                  {TOTAL_LOGGED_HOURS.toFixed(1)} / {TOTAL_TARGET_HOURS.toFixed(1)} hrs
                </Text>
              </View>
              <View style={{ marginTop: 10, height: 10, borderRadius: 999, backgroundColor: colors.card, overflow: 'hidden' }}>
                <View style={{ height: '100%', width: `${progressPercent}%`, backgroundColor: colors.accent }} />
              </View>

              <View style={{ marginTop: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 12, fontWeight: '800', color: colors.textSecondary }}>DAYS CLOCKED</Text>
                <Text style={{ fontSize: 13, fontWeight: '800', color: colors.success }}>
                  {DAYS_CLOCKED}/{DAYS_TARGET} Days (+৳{ATTENDANCE_BONUS.toLocaleString('en-BD')} at ৳300/day)
                </Text>
              </View>
            </View>

            <Text style={{ marginTop: 18, fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: colors.textSecondary }}>RECENT SESSIONS</Text>

            {DEMO_SESSIONS.map((session) => (
              <View key={session.id} style={{ marginTop: 10, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel, padding: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: colors.textPrimary }}>{session.dateLabel}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <BadgeCheck size={13} color={colors.success} />
                    <Text style={{ marginLeft: 4, fontSize: 10, fontWeight: '800', color: colors.success }}>VERIFIED</Text>
                  </View>
                </View>
                <Text style={{ marginTop: 4, fontSize: 12, color: colors.textSecondary }}>{session.slotLabel}</Text>
                <Text style={{ marginTop: 6, fontSize: 12, color: colors.textSecondary }}>Clock {session.clockRange}</Text>
                <View style={{ marginTop: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textPrimary }}>{session.hours.toFixed(2)} hrs</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textPrimary }}>{session.calls} calls</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: colors.success }}>+৳{session.allowance}</Text>
                </View>
              </View>
            ))}

            <View style={{ marginTop: 20, flexDirection: 'row', gap: 10 }}>
              <Pressable
                onPress={closeAttendanceModal}
                style={{ flex: 1, minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>Dispute / Request Review</Text>
              </Pressable>
              <Pressable
                onPress={closeAttendanceModal}
                style={{ flex: 1, minHeight: 48, borderRadius: 12, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#FFFFFF' }}>Close Ledger</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
