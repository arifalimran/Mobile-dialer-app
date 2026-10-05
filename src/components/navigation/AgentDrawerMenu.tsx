import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TouchableWithoutFeedback, View } from 'react-native';
import {
  Bell,
  Calendar,
  CalendarClock,
  LogOut,
  MapPin,
  Phone,
  Plus,
  Target,
  Wallet,
} from 'lucide-react-native';

import type { AgentRole } from '../../features/auth/authTypes';
import type { AppScreen } from '../../types/navigation';

interface DrawerMenuItem {
  screen: AppScreen | 'ADD_LEAD';
  label: string;
  Icon: typeof Bell;
  badge?: number;
  alert?: boolean;
  roles?: AgentRole[];
}

interface AgentDrawerMenuProps {
  visible: boolean;
  role: AgentRole;
  agentName: string;
  nidStatusLabel: string;
  unreadBulletinCount: number;
  hasKpiRevisionAlert: boolean;
  onClose: () => void;
  onNavigate: (screen: AppScreen) => void;
  onAddSelfSourcedLead: () => void;
  onLogout: () => void;
}

/**
 * Module 2: Auto-collapsible agent drawer menu. Auto-closes on every item
 * press. Items are role-gated via the optional `roles` allow-list.
 */
export const AgentDrawerMenu: React.FC<AgentDrawerMenuProps> = ({
  visible,
  role,
  agentName,
  nidStatusLabel,
  unreadBulletinCount,
  hasKpiRevisionAlert,
  onClose,
  onNavigate,
  onAddSelfSourcedLead,
  onLogout,
}) => {
  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);

  const items: DrawerMenuItem[] = [
    { screen: 'BULLETINS', label: 'Mandatory Bulletins', Icon: Bell, badge: unreadBulletinCount },
    { screen: 'KPI', label: 'My KPI & Evaluation Grounds', Icon: Target, alert: hasKpiRevisionAlert },
    { screen: 'SHIFTS', label: 'Shift Slot Booking', Icon: CalendarClock },
    { screen: 'DIALER', label: 'Dialer Desk', Icon: Phone },
    { screen: 'SCHEDULED_CALLBACKS', label: 'Scheduled Callbacks', Icon: Calendar },
    { screen: 'ADD_LEAD', label: 'Add Self-Sourced Lead', Icon: Plus },
    {
      screen: 'SITE_VISITS',
      label: 'Site Visits & GPS Check-In',
      Icon: MapPin,
      roles: ['FULL_TIME_SALES', 'PART_TIME_SALES'],
    },
    { screen: 'WALLET', label: 'Earnings & Wallet', Icon: Wallet },
  ];

  const visibleItems = items.filter((item) => !item.roles || item.roles.includes(role));

  const handlePress = (item: DrawerMenuItem) => {
    onClose();
    if (item.screen === 'ADD_LEAD') {
      onAddSelfSourcedLead();
      return;
    }
    onNavigate(item.screen);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 flex-row bg-black/60">
        <View className="w-[80%] max-w-[320px] border-r border-slate-800 bg-slate-950 pt-14">
          <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
            <View className="border-b border-slate-800 px-5 pb-4">
              <Text className="text-lg font-semibold text-white" numberOfLines={1}>
                {agentName || 'Unregistered Agent'}
              </Text>
              <View className="mt-2 self-start rounded-full border border-slate-700 bg-slate-900 px-3 py-1">
                <Text className="text-xs text-slate-400">{nidStatusLabel}</Text>
              </View>
              <View className="mt-2 self-start rounded-full border border-sky-800 bg-sky-950 px-3 py-1">
                <Text className="text-xs font-semibold text-sky-400">{role.replace('_', ' ')}</Text>
              </View>
            </View>

            <View className="px-3 pt-2">
              {visibleItems.map((item) => (
                <Pressable
                  key={item.label}
                  onPress={() => handlePress(item)}
                  className="mt-1 min-h-[48px] flex-row items-center justify-between rounded-xl px-3"
                >
                  <View className="flex-row items-center">
                    <item.Icon size={18} color="#94a3b8" />
                    <Text className="ml-3 text-sm text-slate-200">{item.label}</Text>
                  </View>
                  {!!item.badge && item.badge > 0 && (
                    <View className="min-w-[20px] items-center justify-center rounded-full bg-rose-600 px-1.5 py-0.5">
                      <Text className="text-[10px] font-bold text-white">{item.badge}</Text>
                    </View>
                  )}
                  {item.alert && (
                    <View className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  )}
                </Pressable>
              ))}

              <Pressable
                onPress={() => setIsConfirmingLogout(true)}
                className="mt-3 min-h-[48px] flex-row items-center rounded-xl border-t border-slate-800 px-3 pt-3"
              >
                <LogOut size={18} color="#fb7185" />
                <Text className="ml-3 text-sm font-semibold text-rose-400">End Shift &amp; Logout</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>

        <TouchableWithoutFeedback onPress={onClose}>
          <View className="flex-1" />
        </TouchableWithoutFeedback>
      </View>

      {isConfirmingLogout && (
        <View className="absolute inset-0 items-center justify-center bg-black/70 px-8">
          <View className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <Text className="text-base font-semibold text-white">End your shift?</Text>
            <Text className="mt-2 text-sm text-slate-400">
              You will be logged out and your session timer will reset.
            </Text>
            <View className="mt-4 flex-row gap-3">
              <Pressable
                onPress={() => setIsConfirmingLogout(false)}
                className="min-h-[48px] flex-1 items-center justify-center rounded-xl border border-slate-800 bg-slate-900"
              >
                <Text className="text-sm font-semibold text-slate-300">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setIsConfirmingLogout(false);
                  onClose();
                  onLogout();
                }}
                className="min-h-[48px] flex-1 items-center justify-center rounded-xl bg-rose-600"
              >
                <Text className="text-sm font-semibold text-white">End Shift</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </Modal>
  );
};
