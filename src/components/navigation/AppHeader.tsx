import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Bell, Building2, Moon, Sun } from 'lucide-react-native';

import { useThemeStore } from '../../theme/useThemeStore';

interface AppHeaderProps {
  agentName: string;
  unreadBulletinCount: number;
  onOpenBulletins: () => void;
  onOpenStatusSheet: () => void;
}

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return 'SM';
  const parts = trimmed.split(/\s+/);
  return parts.length === 1 ? parts[0].slice(0, 2).toUpperCase() : (parts[0][0] + parts[1][0]).toUpperCase();
}

/**
 * Module 1: de-cluttered, single-row 56px global header. Left: brand mark.
 * Right: theme switcher, notification bell (bulletins), agent avatar
 * (opens `AgentStatusSheet`, which now carries the live BST clock, session
 * ticker, corporate SIM, and shift status that used to clutter this row).
 */
export const AppHeader: React.FC<AppHeaderProps> = ({
  agentName,
  unreadBulletinCount,
  onOpenBulletins,
  onOpenStatusSheet,
}) => {
  const mode = useThemeStore((state) => state.mode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <View className="h-14 flex-row items-center justify-between border-b border-white/10 bg-[#070b12] px-4">
      <View className="flex-row items-center">
        <Building2 size={18} color="#0ea5e9" />
        <Text className="ml-2 text-sm font-bold tracking-tight text-white">SPACE MAKER</Text>
      </View>

      <View className="flex-row items-center">
        <Pressable
          onPress={toggleTheme}
          className="h-12 w-12 items-center justify-center rounded-full"
        >
          {mode === 'dark' ? <Moon size={20} color="#e2e8f0" /> : <Sun size={20} color="#f59e0b" />}
        </Pressable>

        <Pressable onPress={onOpenBulletins} className="h-12 w-12 items-center justify-center rounded-full">
          <View>
            <Bell size={20} color="#e2e8f0" />
            {unreadBulletinCount > 0 && (
              <View className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-rose-500" />
            )}
          </View>
        </Pressable>

        <Pressable
          onPress={onOpenStatusSheet}
          className="ml-1 h-10 w-10 items-center justify-center rounded-full border border-sky-800 bg-sky-950"
        >
          <Text className="font-mono text-xs font-bold tracking-wide text-sky-400">
            {getInitials(agentName)}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

