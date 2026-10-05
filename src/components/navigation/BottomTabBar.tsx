import React from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarClock, Clock, Home, Phone, Warehouse, Wallet } from 'lucide-react-native';

import { useAppTheme } from '../../theme/ThemeContext';
import { useAuthStore } from '../../features/auth/hooks/useAuthStore';
import { getEmployeeRoleProfile } from '../../features/auth/constants/employeeProfiles';
import type { AppScreen, BottomNavScreen } from '../../types/navigation';

interface TabDefinition {
  screen: BottomNavScreen;
  label: string;
  Icon: typeof Phone;
}

const TABS: TabDefinition[] = [
  { screen: 'DASHBOARD', label: 'Dashboard', Icon: Home },
  { screen: 'DIALER', label: 'Dialer', Icon: Phone },
  { screen: 'CALLBACKS', label: 'Callbacks', Icon: Clock },
  { screen: 'INVENTORY', label: 'Inventory', Icon: Warehouse },
  { screen: 'WALLET', label: 'Wallet', Icon: Wallet },
  { screen: 'SHIFTS', label: 'Shifts', Icon: CalendarClock },
];

interface BottomTabBarProps {
  activeScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
}

/**
 * Module 1: fixed 64px bottom tab bar covering the 4 primary daily-workflow
 * destinations. Everything else (KPI, Site Visits, Add Lead,
 * Settings, Logout) lives behind the header's bell icon / avatar sheet.
 */
export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeScreen, onNavigate }) => {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const role = useAuthStore((state) => state.role);
  const featureFlags = useAuthStore((state) => state.featureFlags);
  const visibleTabs = getEmployeeRoleProfile(role).visibleTabs;
  const tabs = TABS.filter((tab) => {
    if (!visibleTabs.includes(tab.screen)) return false;
    if (tab.screen === 'DIALER') return featureFlags.canUseDialer;
    if (tab.screen === 'CALLBACKS') return featureFlags.canUseCallbacks;
    if (tab.screen === 'INVENTORY') return featureFlags.canUseInventory;
    if (tab.screen === 'WALLET') return featureFlags.canUseWallet;
    if (tab.screen === 'SHIFTS') return featureFlags.canUseShifts;
    return true;
  });

  return (
    <View
      style={{
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.card,
        paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 8 : 0),
      }}
    >
      {tabs.map(({ screen, label, Icon }) => {
        const isActive = activeScreen === screen;
        return (
          <Pressable
            key={screen}
            onPress={() => onNavigate(screen)}
            style={{ height: 64, flex: 1, alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon size={22} color={isActive ? colors.brassAccent : colors.textSecondary} />
            <Text style={{ marginTop: 4, fontSize: 11, fontWeight: '700', color: isActive ? colors.brassAccent : colors.textSecondary }}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};
