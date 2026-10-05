import React from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { Bell, Building2, Cog, Moon, Plus, Sun } from 'lucide-react-native';

import { useAppTheme } from '../../theme/ThemeContext';

interface AppHeaderProps {
  agentName: string;
  employeeStatus: 'PROBATION' | 'PERMANENT';
  sessionId: string;
  unreadBulletinCount: number;
  dutyStartedAt: number | null;
  dutyHoursToday: number;
  pendingDutyHours: number;
  isScrolled?: boolean;
  isOnDuty: boolean;
  onOpenBulletins: () => void;
  onOpenAddLead: () => void;
  onToggleDuty: () => void;
  onOpenSettings: () => void;
  onOpenStatusSheet?: () => void;
}

/**
 * Module 1: de-cluttered, single-row 56px global header. Left: brand mark.
 * Right: theme switcher, notification bell (settings shortcut), agent avatar
 * (opens `AgentStatusSheet`, which now carries the live BST clock, session
 * ticker, corporate SIM, and shift status that used to clutter this row).
 */
export const AppHeader: React.FC<AppHeaderProps> = ({
  agentName,
  employeeStatus,
  sessionId,
  unreadBulletinCount,
  dutyStartedAt,
  dutyHoursToday,
  pendingDutyHours,
  isScrolled,
  isOnDuty,
  onOpenBulletins,
  onOpenAddLead,
  onToggleDuty,
  onOpenSettings,
  onOpenStatusSheet,
}) => {
  const { colors, theme, toggleTheme } = useAppTheme();
  const [ticker, setTicker] = React.useState(Date.now());
  const rowTwoProgress = React.useRef(new Animated.Value(isScrolled ? 0 : 1)).current;

  React.useEffect(() => {
    if (!isOnDuty || !dutyStartedAt) return;
    const interval = setInterval(() => setTicker(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [dutyStartedAt, isOnDuty]);

  React.useEffect(() => {
    Animated.timing(rowTwoProgress, {
      toValue: isScrolled ? 0 : 1,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [isScrolled, rowTwoProgress]);

  const elapsedMs = isOnDuty && dutyStartedAt ? Math.max(0, ticker - dutyStartedAt) : 0;
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const hh = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const mm = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const ss = String(totalSeconds % 60).padStart(2, '0');

  const rowTwoHeight = rowTwoProgress.interpolate({ inputRange: [0, 1], outputRange: [0, 34] });
  const rowTwoOpacity = rowTwoProgress.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <View style={{ backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <View style={{ height: 48, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Building2 size={17} color={colors.accent} />
          <Text style={{ marginLeft: 8, fontSize: 13, fontWeight: '800', letterSpacing: 0.3, color: colors.textPrimary }}>SPACE MAKER</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 6 }}>
          <Pressable onPress={toggleTheme} style={{ height: 34, width: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 999, backgroundColor: colors.subpanel }}>
            {theme === 'dark' ? <Moon size={16} color={colors.textPrimary} /> : <Sun size={16} color={colors.brassAccent} />}
          </Pressable>

          <Pressable onPress={onOpenBulletins} style={{ height: 34, width: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 999, backgroundColor: colors.subpanel }}>
            <View>
              <Bell size={16} color={colors.textPrimary} />
              {unreadBulletinCount > 0 && (
                <View style={{ position: 'absolute', right: -4, top: -3, height: 9, width: 9, borderRadius: 999, backgroundColor: '#F43F5E' }} />
              )}
            </View>
          </Pressable>

          <Pressable onPress={onOpenAddLead} style={{ height: 34, width: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 999, backgroundColor: colors.subpanel }}>
            <Plus size={16} color={colors.accent} />
          </Pressable>

          <Pressable onPress={onOpenStatusSheet ?? onOpenSettings} style={{ minHeight: 30, borderRadius: 999, borderWidth: 1, borderColor: isOnDuty ? colors.success : colors.border, backgroundColor: isOnDuty ? 'rgba(16,185,129,0.12)' : colors.subpanel, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 10, fontWeight: '800', color: isOnDuty ? colors.success : colors.textSecondary }}>
              {isOnDuty ? '● On Duty' : '○ Off Duty'}
            </Text>
          </Pressable>

          <Pressable onPress={onOpenSettings} style={{ height: 34, width: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 999, backgroundColor: colors.subpanel }}>
            <Cog size={16} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      <Animated.View style={{ height: rowTwoHeight, opacity: rowTwoOpacity, overflow: 'hidden', backgroundColor: colors.subpanel, borderTopWidth: 1, borderTopColor: colors.border }}>
        <View style={{ height: 34, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: colors.textPrimary }}>👤 {agentName}</Text>
            <View style={{ marginLeft: 8, borderRadius: 999, borderWidth: 1, borderColor: employeeStatus === 'PROBATION' ? colors.warning : colors.success, backgroundColor: colors.card, paddingHorizontal: 7, paddingVertical: 2 }}>
              <Text style={{ fontSize: 9, fontWeight: '800', color: employeeStatus === 'PROBATION' ? colors.warning : colors.success }}>
                [{employeeStatus}]
              </Text>
            </View>
          </View>

          <Text style={{ fontSize: 11, color: colors.textSecondary }}>
            ⏱️ {hh}:{mm}:{ss} • {sessionId}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

