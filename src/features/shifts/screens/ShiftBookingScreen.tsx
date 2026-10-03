import React, { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { CalendarClock, Lock, Phone } from 'lucide-react-native';

import { OPERATIONS_ADMIN_PHONE } from '../../../config/constants';
import { SHIFT_SLOTS } from '../constants/shiftSlots';
import { useShiftStore } from '../hooks/useShiftStore';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Module 5 screen: pick a shift slot, see current booking, or see the penalty lockout banner. */
export const ShiftBookingScreen: React.FC = () => {
  const { myBooking, lockStatus, lockedUntil, bookSlot, cancelBooking, clearExpiredLock } =
    useShiftStore();
  const [dateIso] = useState(todayIso());

  useEffect(() => {
    clearExpiredLock();
  }, [clearExpiredLock]);

  const isLocked = lockStatus === 'PENALIZED' && !!lockedUntil && Date.now() < lockedUntil;

  const handleContactOps = () => {
    Linking.openURL(`https://wa.me/${OPERATIONS_ADMIN_PHONE.replace(/[^\d]/g, '')}`);
  };

  return (
    <ScrollView className="flex-1 bg-slate-950 px-5 pt-6" contentContainerStyle={{ paddingBottom: 32 }}>
      <View className="flex-row items-center">
        <CalendarClock size={22} color="#38bdf8" />
        <Text className="ml-2 text-xl font-bold tracking-tight text-white">Shift Slot Booking</Text>
      </View>
      <Text className="mt-1 font-mono text-sm tracking-wide text-slate-400">Today · {dateIso}</Text>

      {isLocked && (
        <View className="mt-5 rounded-2xl border border-rose-800 bg-rose-950/40 p-4">
          <View className="flex-row items-center">
            <Lock size={16} color="#fb7185" />
            <Text className="ml-2 text-sm font-semibold text-rose-300">Shift Booking Locked</Text>
          </View>
          <Text className="mt-2 text-xs text-rose-200">
            A late cancellation or no-show triggered a 7-day penalty. Booking unlocks on{' '}
            <Text className="font-mono tracking-wide">
              {lockedUntil ? new Date(lockedUntil).toLocaleString() : '—'}
            </Text>
            .
          </Text>
          <Pressable
            onPress={handleContactOps}
            className="mt-3 min-h-[48px] flex-row items-center justify-center rounded-xl bg-rose-700"
          >
            <Phone size={16} color="#ffffff" />
            <Text className="ml-2 text-sm font-semibold text-white">
              Contact Operations Admin to Request Early Unlock
            </Text>
          </Pressable>
        </View>
      )}

      {myBooking && !isLocked && (
        <View className="mt-5 rounded-2xl border border-emerald-800 bg-emerald-950/40 p-4">
          <Text className="text-sm font-semibold text-emerald-300">Active Booking</Text>
          <Text className="mt-1 text-sm text-emerald-100">
            {SHIFT_SLOTS.find((slot) => slot.id === myBooking.slotId)?.label ?? myBooking.slotId}
          </Text>
          <Text className="mt-1 text-xs text-emerald-400">
            Cancelling less than {6} hours before start applies a 7-day penalty.
          </Text>
          <Pressable
            onPress={cancelBooking}
            className="mt-3 min-h-[48px] items-center justify-center rounded-xl border border-emerald-700 bg-slate-950"
          >
            <Text className="text-sm font-semibold text-emerald-300">Cancel Booking</Text>
          </Pressable>
        </View>
      )}

      {!isLocked && (
        <View className="mt-5">
          <Text className="text-xs font-medium text-slate-400">AVAILABLE SLOTS</Text>
          {SHIFT_SLOTS.map((slot) => {
            const isMine = myBooking?.slotId === slot.id;
            return (
              <Pressable
                key={slot.id}
                onPress={() => bookSlot(slot.id, dateIso)}
                disabled={!!myBooking}
                className={`mt-2 min-h-[56px] flex-row items-center justify-between rounded-xl border px-4 ${
                  isMine
                    ? 'border-emerald-700 bg-emerald-950/40'
                    : myBooking
                      ? 'border-slate-900 bg-slate-900/60'
                      : 'border-white/10 bg-slate-900'
                }`}
              >
                <Text className={`text-sm ${isMine ? 'text-emerald-300' : 'text-slate-200'}`}>
                  {slot.label}
                </Text>
                {isMine && <Text className="text-xs font-semibold text-emerald-400">BOOKED</Text>}
              </Pressable>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};
