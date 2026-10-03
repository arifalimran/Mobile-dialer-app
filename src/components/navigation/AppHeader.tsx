import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Bell, Building2, Moon, Sun } from 'lucide-react-native';

import { useAppTheme } from '../../theme/ThemeContext';

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
  const { colors, theme, toggleTheme } = useAppTheme();

  return (
    <View style={{ height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Building2 size={18} color={colors.accent} />
        <Text style={{ marginLeft: 8, fontSize: 14, fontWeight: '800', letterSpacing: 0.3, color: colors.textPrimary }}>SPACE MAKER</Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Pressable onPress={toggleTheme} style={{ height: 48, width: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 999, backgroundColor: colors.subpanel }}>
          {theme === 'dark' ? <Moon size={20} color={colors.textPrimary} /> : <Sun size={20} color={colors.brassAccent} />}
        </Pressable>

        <Pressable onPress={onOpenBulletins} style={{ height: 48, width: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 999, backgroundColor: colors.subpanel, marginLeft: 8 }}>
          <View>
            <Bell size={20} color={colors.textPrimary} />
            {unreadBulletinCount > 0 && (
              <View style={{ position: 'absolute', right: -4, top: -2, height: 10, width: 10, borderRadius: 999, backgroundColor: '#F43F5E' }} />
            )}
          </View>
        </Pressable>

        <Pressable onPress={onOpenStatusSheet} style={{ marginLeft: 8, height: 40, width: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.subpanel }}>
          <Text style={{ fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: colors.accent }}>
            {getInitials(agentName)}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

