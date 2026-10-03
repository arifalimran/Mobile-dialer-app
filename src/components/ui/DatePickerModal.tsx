import React, { useMemo, useRef, useState } from 'react';
import { FlatList, Modal, Pressable, Text, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const PADDING = (WHEEL_HEIGHT - ITEM_HEIGHT) / 2;

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function daysInMonth(monthIndex: number, year: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function computeAge(dob: Date, today: Date): number {
  let age = today.getFullYear() - dob.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

interface WheelColumnProps {
  items: string[];
  selectedIndex: number;
  onChangeIndex: (index: number) => void;
  flex?: number;
}

/** A single scrollable "wheel" column, snapping one item at a time into the centre highlight band. */
const WheelColumn: React.FC<WheelColumnProps> = ({ items, selectedIndex, onChangeIndex, flex = 1 }) => {
  const listRef = useRef<FlatList<string>>(null);

  const commitOffset = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    onChangeIndex(Math.max(0, Math.min(items.length - 1, index)));
  };

  return (
    <View style={{ flex, height: WHEEL_HEIGHT }}>
      <FlatList
        ref={listRef}
        data={items}
        keyExtractor={(item, index) => `${item}-${index}`}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
        initialScrollIndex={selectedIndex}
        contentContainerStyle={{ paddingVertical: PADDING }}
        onMomentumScrollEnd={commitOffset}
        onScrollEndDrag={commitOffset}
        nestedScrollEnabled
        renderItem={({ item, index }) => (
          <View style={{ height: ITEM_HEIGHT }} className="items-center justify-center">
            <Text
              className={
                index === selectedIndex
                  ? 'font-mono text-lg font-bold tracking-wide text-sky-400'
                  : 'font-mono text-base text-slate-500'
              }
            >
              {item}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

interface DatePickerModalProps {
  visible: boolean;
  mode: 'date' | 'datetime';
  title: string;
  initialDate?: Date;
  /** Hard-stop validator: Confirm stays disabled until the selected date satisfies this minimum age. */
  minAgeYears?: number;
  onConfirm: (date: Date) => void;
  onClose: () => void;
}

/**
 * Module 4: zero-typing bottom-sheet date/datetime picker built from
 * FlatList-based "wheel" columns (no native calendar module — consistent
 * with `SelectModal`'s approach of avoiding new native deps). Automatically
 * computes applicant age from Date of Birth and enforces the `minAgeYears`
 * hard-stop without any manual user calculation.
 */
export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  mode,
  title,
  initialDate,
  minAgeYears,
  onConfirm,
  onClose,
}) => {
  const today = useMemo(() => new Date(), []);
  const base = initialDate ?? (mode === 'date'
    ? new Date(today.getFullYear() - 25, 0, 1)
    : new Date(today.getTime() + 60 * 60 * 1000));

  const [year, setYear] = useState(base.getFullYear());
  const [monthIndex, setMonthIndex] = useState(base.getMonth());
  const [day, setDay] = useState(base.getDate());
  const [hour, setHour] = useState(base.getHours());
  const [minute, setMinute] = useState(base.getMinutes());

  const years = useMemo(() => {
    if (mode === 'date') {
      const startYear = today.getFullYear() - 100;
      const endYear = today.getFullYear();
      return Array.from({ length: endYear - startYear + 1 }, (_, i) => String(startYear + i));
    }
    return [String(today.getFullYear()), String(today.getFullYear() + 1)];
  }, [mode, today]);

  const dayCount = daysInMonth(monthIndex, year);
  const days = useMemo(() => Array.from({ length: dayCount }, (_, i) => String(i + 1).padStart(2, '0')), [dayCount]);
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')), []);

  const yearIndex = years.indexOf(String(year));
  const safeDay = Math.min(day, dayCount);

  const selectedDate = new Date(year, monthIndex, safeDay, mode === 'datetime' ? hour : 0, mode === 'datetime' ? minute : 0);
  const age = mode === 'date' ? computeAge(selectedDate, today) : null;
  const isBelowMinAge = mode === 'date' && typeof minAgeYears === 'number' && (age ?? 0) < minAgeYears;
  const isFutureDob = mode === 'date' && selectedDate.getTime() > today.getTime();
  const canConfirm = !isBelowMinAge && !isFutureDob;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/60">
        <Pressable className="flex-1" onPress={onClose} />
        <View className="rounded-t-3xl border-t border-white/10 bg-slate-950 p-5">
              <Text className="text-lg font-bold tracking-tight text-white">{title}</Text>

              <View className="mt-4 flex-row items-center rounded-2xl border border-white/10 bg-slate-900">
                <View pointerEvents="none" className="absolute inset-x-0 self-center" style={{ top: PADDING, height: ITEM_HEIGHT }}>
                  <View className="mx-3 h-full rounded-xl border border-sky-500/40 bg-sky-500/10" />
                </View>

                <WheelColumn items={days} selectedIndex={safeDay - 1} onChangeIndex={(i) => setDay(i + 1)} flex={0.8} />
                <WheelColumn items={MONTH_NAMES} selectedIndex={monthIndex} onChangeIndex={setMonthIndex} flex={1} />
                <WheelColumn
                  items={years}
                  selectedIndex={yearIndex < 0 ? 0 : yearIndex}
                  onChangeIndex={(i) => setYear(Number(years[i]))}
                  flex={1.1}
                />
                {mode === 'datetime' && (
                  <>
                    <WheelColumn items={hours} selectedIndex={hour} onChangeIndex={setHour} flex={0.7} />
                    <WheelColumn items={minutes} selectedIndex={minute} onChangeIndex={setMinute} flex={0.7} />
                  </>
                )}
              </View>

              {mode === 'date' && (
                <Text className="mt-3 text-center font-mono text-sm tracking-wide text-slate-400">
                  Selected age: {age} years
                </Text>
              )}

              {isBelowMinAge && (
                <View className="mt-3 flex-row items-center justify-center rounded-xl border border-rose-800 bg-rose-950/40 px-4 py-3">
                  <AlertTriangle size={16} color="#fb7185" />
                  <Text className="ml-2 text-xs font-semibold text-rose-300">
                    Agent must be at least {minAgeYears} years old to register.
                  </Text>
                </View>
              )}
              {isFutureDob && !isBelowMinAge && (
                <View className="mt-3 flex-row items-center justify-center rounded-xl border border-rose-800 bg-rose-950/40 px-4 py-3">
                  <AlertTriangle size={16} color="#fb7185" />
                  <Text className="ml-2 text-xs font-semibold text-rose-300">Date of birth cannot be in the future.</Text>
                </View>
              )}

              <View className="mt-5 flex-row gap-3">
                <Pressable
                  onPress={onClose}
                  className="min-h-[48px] flex-1 items-center justify-center rounded-xl border border-white/10 bg-slate-900"
                >
                  <Text className="text-sm font-semibold text-slate-300">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={() => canConfirm && onConfirm(selectedDate)}
                  disabled={!canConfirm}
                  className={`min-h-[48px] flex-1 items-center justify-center rounded-xl ${
                    canConfirm ? 'bg-sky-600 active:scale-[0.98]' : 'bg-sky-900'
                  }`}
                >
                  <Text className="text-sm font-semibold text-white">Confirm</Text>
                </Pressable>
              </View>
            </View>
          </View>
    </Modal>
  );
};
