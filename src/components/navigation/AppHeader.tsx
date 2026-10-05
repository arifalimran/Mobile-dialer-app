import React from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { Bell, Building2, Moon, Sun, User } from 'lucide-react-native';

import { useAppTheme } from '../../theme/ThemeContext';
import { useAuthStore } from '../../features/auth/hooks/useAuthStore';

interface AppHeaderProps {
  agentName: string;
  maskedSim: string;
  sessionId: string;
  unreadBulletinCount: number;
  isOnDuty: boolean;
  isScrolled?: boolean;
  onOpenBulletins: () => void;
  onOpenProfile: () => void;
}

/**
 * Module 1: de-cluttered, two-row global header. Row 1 (52px) carries only
 * the brand mark plus 3 compact 40x40 icon buttons: bulletins bell, theme
 * switcher, and the agent avatar (opens `ProfileDrawer`, which now owns the
 * duty/break state machine, quick actions, and settings that used to
 * clutter this row). Row 2 (34px, auto-collapses on scroll) shows the
 * masked SIM identity and a continuous login-duration ticker sourced from
 * `useAuthStore`'s `loginAt`, so it never freezes or resets across tabs.
 */
export const AppHeader: React.FC<AppHeaderProps> = ({
  agentName,
  maskedSim,
  sessionId,
  unreadBulletinCount,
  isOnDuty,
  isScrolled,
  onOpenBulletins,
  onOpenProfile,
}) => {
  const { colors, theme, toggleTheme } = useAppTheme();
  const loginAt = useAuthStore((state) => state.loginAt);
  const [ticker, setTicker] = React.useState(Date.now());
  const rowTwoProgress = React.useRef(new Animated.Value(isScrolled ? 0 : 1)).current;

  React.useEffect(() => {
    if (!loginAt) return;
    const interval = setInterval(() => setTicker(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [loginAt]);

  React.useEffect(() => {
    Animated.timing(rowTwoProgress, {
      toValue: isScrolled ? 0 : 1,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [isScrolled, rowTwoProgress]);

  const elapsedMs = loginAt ? Math.max(0, ticker - loginAt) : 0;
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const hh = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const mm = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const ss = String(totalSeconds % 60).padStart(2, '0');

  const rowTwoHeight = rowTwoProgress.interpolate({ inputRange: [0, 1], outputRange: [0, 34] });
  const rowTwoOpacity = rowTwoProgress.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <View style={{ backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <View style={{ height: 52, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Building2 size={17} color={colors.accent} />
          <Text style={{ marginLeft: 8, fontSize: 13, fontWeight: '800', letterSpacing: 0.3, color: colors.textPrimary }}>SPACE MAKER</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Pressable
            onPress={onOpenBulletins}
            style={{ height: 40, width: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 999, backgroundColor: colors.iconBtnBg, borderWidth: 1, borderColor: colors.iconBtnBorder }}
          >
            <View>
              <Bell size={17} color={colors.iconBtnText} />
              {unreadBulletinCount > 0 && (
                <View style={{ position: 'absolute', right: -4, top: -3, height: 9, width: 9, borderRadius: 999, backgroundColor: '#F43F5E' }} />
              )}
            </View>
          </Pressable>

          <Pressable
            onPress={toggleTheme}
            style={{ height: 40, width: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 999, backgroundColor: colors.iconBtnBg, borderWidth: 1, borderColor: colors.iconBtnBorder }}
          >
            {theme === 'dark' ? <Moon size={17} color={colors.iconBtnText} /> : <Sun size={17} color={colors.brassAccent} />}
          </Pressable>

          <Pressable
            onPress={onOpenProfile}
            style={{ height: 40, width: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 999, backgroundColor: colors.iconBtnBg, borderWidth: 1, borderColor: colors.iconBtnBorder }}
          >
            <View>
              <User size={18} color={colors.iconBtnText} />
              {isOnDuty && (
                <View style={{ position: 'absolute', right: -2, bottom: -2, height: 10, width: 10, borderRadius: 999, borderWidth: 2, borderColor: colors.card, backgroundColor: colors.success }} />
              )}
            </View>
          </Pressable>
        </View>
      </View>

      <Animated.View style={{ height: rowTwoHeight, opacity: rowTwoOpacity, overflow: 'hidden', backgroundColor: colors.subpanel, borderTopWidth: 1, borderTopColor: colors.border }}>
        <View style={{ height: 34, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text numberOfLines={1} style={{ flex: 1, marginRight: 8, fontSize: 12, color: colors.textPrimary }}>
            👤 {agentName} • {maskedSim}
          </Text>

          <Text style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: '700', color: '#10B981' }}>
            ⏱️ {hh}:{mm}:{ss} • {sessionId}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

