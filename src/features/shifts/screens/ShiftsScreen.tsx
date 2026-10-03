import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { CalendarClock, Clock3, Lock, ShieldAlert } from 'lucide-react-native';

import { useAppTheme } from '../../../theme/ThemeContext';
import { useShiftStore } from '../hooks/useShiftStore';
import { SHIFT_SLOTS } from '../constants/shiftSlots';

function getCurrentMonthDay(): number {
  const today = new Date();
  return today.getDate();
}

function formatSlotDate(date: Date) {
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function getSlotStartTimestamp(slotId: string, dateIso: string): number | null {
  const slot = SHIFT_SLOTS.find((candidate) => candidate.id === slotId);
  if (!slot) return null;

  const date = new Date(`${dateIso}T00:00:00`);
  date.setHours(slot.startHour, 0, 0, 0);
  return date.getTime();
}

export function ShiftsScreen() {
  const { colors } = useAppTheme();
  const { myBooking, lockStatus, lockedUntil, bookSlot, cancelBooking, clearExpiredLock } = useShiftStore();
  const [penaltyModalVisible, setPenaltyModalVisible] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<{ slotId: string; dateIso: string } | null>(null);

  useEffect(() => {
    clearExpiredLock();
  }, [clearExpiredLock]);

  const isLocked = lockStatus === 'PENALIZED' && !!lockedUntil && Date.now() < lockedUntil;
  const monthlyHoursCompleted = 84.5;
  const monthlyHoursTotal = 120;
  const monthlyProgress = Math.min(100, (monthlyHoursCompleted / monthlyHoursTotal) * 100);
  const monthDay = getCurrentMonthDay();

  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, index) => {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + index);
      return {
        iso: nextDate.toISOString().slice(0, 10),
        label: formatSlotDate(nextDate),
        slots: [
          { id: 'slot-a', label: 'Slot A', range: '10:00 AM – 2:00 PM', startHour: 10, endHour: 14 },
          { id: 'slot-b', label: 'Slot B', range: '2:30 PM – 6:30 PM', startHour: 14, endHour: 18 },
        ],
      };
    });
  }, []);

  const startCancelFlow = (slotId: string, dateIso: string) => {
    const slotStart = getSlotStartTimestamp(slotId, dateIso);
    const hoursUntilStart = slotStart !== null ? (slotStart - Date.now()) / (1000 * 60 * 60) : Number.POSITIVE_INFINITY;

    if (hoursUntilStart >= 48) {
      cancelBooking();
      return;
    }

    setBookingToCancel({ slotId, dateIso });
    setPenaltyModalVisible(true);
  };

  const confirmPenaltyCancellation = () => {
    if (!bookingToCancel) return;
    cancelBooking(true);
    setPenaltyModalVisible(false);
    setBookingToCancel(null);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.canvas }} contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 24, paddingBottom: 36 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <CalendarClock size={22} color={colors.accent} />
        <Text style={{ marginLeft: 8, fontSize: 22, fontWeight: '800', color: colors.textPrimary }}>7-Day Shift Scheduler</Text>
      </View>

      <View style={{ marginTop: 18, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 16 }}>
        <Text style={{ fontSize: 12, fontWeight: '800', letterSpacing: 0.8, color: colors.textSecondary }}>MONTHLY KPI TRACKER</Text>
        <View style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>Total Monthly Work Hours</Text>
          <Text style={{ fontSize: 12, fontWeight: '800', color: colors.textSecondary }}>{monthlyHoursCompleted.toFixed(1)} / {monthlyHoursTotal.toFixed(1)} hrs</Text>
        </View>
        <View style={{ marginTop: 10, height: 10, borderRadius: 999, backgroundColor: colors.subpanel, overflow: 'hidden' }}>
          <View style={{ height: '100%', width: `${monthlyProgress}%`, backgroundColor: colors.accent }} />
        </View>
        <Text style={{ marginTop: 8, fontSize: 12, color: colors.textSecondary }}>Monthly cycle indicator: Day {monthDay} / 30</Text>
      </View>

      {isLocked && (
        <View style={{ marginTop: 18, borderRadius: 18, borderWidth: 1, borderColor: '#F87171', backgroundColor: 'rgba(248,113,113,0.12)', padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Lock size={18} color="#FECACA" />
            <Text style={{ marginLeft: 8, fontSize: 15, fontWeight: '800', color: '#FECACA' }}>Shift Booking Locked</Text>
          </View>
          <Text style={{ marginTop: 8, fontSize: 12, color: '#FECACA', lineHeight: 18 }}>
            A late cancellation triggered a 7-day lockout. New bookings remain blocked until{' '}
            <Text style={{ fontWeight: '700' }}>{lockedUntil ? new Date(lockedUntil).toLocaleString() : '—'}</Text>.
          </Text>
        </View>
      )}

      <View style={{ marginTop: 18 }}>
        <Text style={{ fontSize: 11, fontWeight: '800', letterSpacing: 0.8, color: colors.textSecondary }}>7-DAY SLOT CALENDAR</Text>
        {days.map((day) => (
          <View key={day.iso} style={{ marginTop: 12, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 14 }}>
            <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary }}>{day.label}</Text>
            <View style={{ marginTop: 12, gap: 10 }}>
              {day.slots.map((slot) => {
                const bookingExists = myBooking?.slotId === slot.id && myBooking?.dateIso === day.iso;
                const isDayLocked = isLocked;

                return (
                  <Pressable
                    key={`${day.iso}-${slot.id}`}
                    onPress={() => {
                      if (bookingExists) {
                        startCancelFlow(slot.id, day.iso);
                        return;
                      }
                      if (!isDayLocked) {
                        bookSlot(slot.id, day.iso);
                      }
                    }}
                    disabled={isDayLocked && !bookingExists}
                    style={{
                      minHeight: 56,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: bookingExists ? colors.success : colors.border,
                      backgroundColor: bookingExists ? 'rgba(16,185,129,0.12)' : colors.subpanel,
                      paddingHorizontal: 14,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <View>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: colors.textPrimary }}>{slot.label}</Text>
                      <Text style={{ marginTop: 3, fontSize: 11, color: colors.textSecondary }}>{slot.range}</Text>
                    </View>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: bookingExists ? colors.success : colors.textSecondary }}>
                      {bookingExists ? 'BOOKED' : 'AVAILABLE'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </View>

      <Modal visible={penaltyModalVisible} transparent animationType="slide" onRequestClose={() => setPenaltyModalVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(15, 23, 42, 0.68)', padding: 20 }}>
          <View style={{ borderRadius: 20, borderWidth: 1, borderColor: '#F87171', backgroundColor: colors.card, padding: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ShieldAlert size={18} color="#FCA5A5" />
              <Text style={{ marginLeft: 8, fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>48-Hour Cancellation Rule</Text>
            </View>
            <Text style={{ marginTop: 12, fontSize: 13, lineHeight: 20, color: colors.textSecondary }}>
              Cancelling within 48 hours of the slot start time triggers a 7-day hold. Confirm to apply the penalty lockout and release the slot.
            </Text>
            <View style={{ marginTop: 18, flexDirection: 'row', gap: 10 }}>
              <Pressable
                onPress={() => setPenaltyModalVisible(false)}
                style={{ flex: 1, minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={confirmPenaltyCancellation}
                style={{ flex: 1, minHeight: 48, borderRadius: 12, backgroundColor: '#F43F5E', alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>Confirm Lockout</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
