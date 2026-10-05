import React, { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { CalendarClock, Lock, Phone } from 'lucide-react-native';

import { useAppTheme } from '../../../theme/ThemeContext';
import { OPERATIONS_ADMIN_PHONE } from '../../../config/constants';
import { SHIFT_SLOTS } from '../constants/shiftSlots';
import { useShiftStore } from '../hooks/useShiftStore';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Module 5 screen: pick a shift slot, see current booking, or see the penalty lockout banner. */
export const ShiftBookingScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { bookings, lockStatus, lockedUntil, bookSlot, cancelBooking, clearExpiredLock } =
    useShiftStore();
  const [dateIso] = useState(todayIso());
  const myBooking = bookings.find((booking) => booking.dateIso === dateIso) ?? null;

  useEffect(() => {
    clearExpiredLock();
  }, [clearExpiredLock]);

  const isLocked = lockStatus === 'PENALIZED' && !!lockedUntil && Date.now() < lockedUntil;

  const handleContactOps = () => {
    Linking.openURL(`https://wa.me/${OPERATIONS_ADMIN_PHONE.replace(/[^\d]/g, '')}`);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.canvas, paddingHorizontal: 20, paddingTop: 24 }} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <CalendarClock size={22} color={colors.accent} />
        <Text style={{ marginLeft: 8, fontSize: 20, fontWeight: '800', letterSpacing: 0.3, color: colors.textPrimary }}>Shift Slot Booking</Text>
      </View>
      <Text style={{ marginTop: 4, fontFamily: 'monospace', fontSize: 12, letterSpacing: 0.8, color: colors.textSecondary }}>Today · {dateIso}</Text>

      {isLocked && (
        <View style={{ marginTop: 20, borderRadius: 18, borderWidth: 1, borderColor: '#F43F5E', backgroundColor: 'rgba(244,63,94,0.12)', padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Lock size={16} color={colors.danger} />
            <Text style={{ marginLeft: 8, fontSize: 14, fontWeight: '700', color: colors.danger }}>Shift Booking Locked</Text>
          </View>
          <Text style={{ marginTop: 8, fontSize: 12, lineHeight: 18, color: '#FEC7D0' }}>
            A late cancellation or no-show triggered a 7-day penalty. Booking unlocks on{' '}
            <Text style={{ fontFamily: 'monospace', letterSpacing: 0.8, color: '#FEC7D0' }}>
              {lockedUntil ? new Date(lockedUntil).toLocaleString() : '—'}
            </Text>
            .
          </Text>
          <Pressable
            onPress={handleContactOps}
            style={{ marginTop: 12, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: colors.danger }}
          >
            <Phone size={16} color="#FFFFFF" />
            <Text style={{ marginLeft: 8, fontSize: 13, fontWeight: '700', color: '#FFFFFF' }}>
              Contact Operations Admin to Request Early Unlock
            </Text>
          </Pressable>
        </View>
      )}

      {myBooking && !isLocked && (
        <View style={{ marginTop: 20, borderRadius: 18, borderWidth: 1, borderColor: colors.success, backgroundColor: 'rgba(16,185,129,0.12)', padding: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.success }}>Active Booking</Text>
          <Text style={{ marginTop: 6, fontSize: 14, color: colors.textPrimary }}>
            {SHIFT_SLOTS.find((slot) => slot.id === myBooking.slotId)?.label ?? myBooking.slotId}
          </Text>
          <Text style={{ marginTop: 6, fontSize: 11, color: colors.success }}>
            Cancelling within 48 hours before start applies a 7-day penalty.
          </Text>
          <Pressable
            onPress={() => cancelBooking(myBooking.id)}
            style={{ marginTop: 12, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1, borderColor: colors.success, backgroundColor: colors.card }}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.success }}>Cancel Booking</Text>
          </Pressable>
        </View>
      )}

      {!isLocked && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 0.9, color: colors.textSecondary }}>AVAILABLE SLOTS</Text>
          {SHIFT_SLOTS.map((slot) => {
            const isMine = myBooking?.slotId === slot.id;
            return (
              <Pressable
                key={slot.id}
                onPress={() => bookSlot(slot.id, dateIso)}
                disabled={!!myBooking}
                style={{
                  marginTop: 10,
                  minHeight: 56,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: isMine ? colors.success : myBooking ? colors.border : colors.border,
                  backgroundColor: isMine ? 'rgba(16,185,129,0.12)' : myBooking ? colors.subpanel : colors.card,
                  paddingHorizontal: 16,
                }}
              >
                <Text style={{ fontSize: 14, color: isMine ? colors.success : colors.textPrimary }}>{slot.label}</Text>
                {isMine && <Text style={{ fontSize: 11, fontWeight: '700', color: colors.success }}>BOOKED</Text>}
              </Pressable>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};
