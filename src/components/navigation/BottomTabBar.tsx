import React from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarClock, Clock, Phone, Wallet } from 'lucide-react-native';

import type { AppScreen } from '../../types/navigation';

type BottomTabScreen = 'DIALER' | 'SCHEDULED_CALLBACKS' | 'SHIFTS' | 'WALLET';

interface TabDefinition {
  screen: BottomTabScreen;
  label: string;
  Icon: typeof Phone;
}

const TABS: TabDefinition[] = [
  { screen: 'DIALER', label: 'Dialer Desk', Icon: Phone },
  { screen: 'SCHEDULED_CALLBACKS', label: 'Callbacks', Icon: Clock },
  { screen: 'SHIFTS', label: 'Shifts', Icon: CalendarClock },
  { screen: 'WALLET', label: 'Wallet', Icon: Wallet },
];

interface BottomTabBarProps {
  activeScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
}

/**
 * Module 1: fixed 64px bottom tab bar covering the 4 primary daily-workflow
 * destinations. Everything else (Bulletins, KPI, Site Visits, Add Lead,
 * Settings, Logout) lives behind the header's bell icon / avatar sheet.
 */
export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeScreen, onNavigate }) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 8 : 0) }}
      className="flex-row border-t border-white/10 bg-[#070b12]"
    >
      {TABS.map(({ screen, label, Icon }) => {
        const isActive = activeScreen === screen;
        return (
          <Pressable
            key={screen}
            onPress={() => onNavigate(screen)}
            className="h-16 flex-1 items-center justify-center"
          >
            <Icon size={22} color={isActive ? '#0ea5e9' : '#64748b'} />
            <Text className={`mt-1 text-[11px] font-semibold ${isActive ? 'text-sky-500' : 'text-slate-500'}`}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};
