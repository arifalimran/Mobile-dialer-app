import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Bell, MoonStar, Plus, Settings, SunMedium, UserRound } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';

const formatClock = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

export type AppHeaderProps = {
  isScrolled?: boolean;
  onPressAddLead?: () => void;
  onPressBell?: () => void;
  onPressSettings?: () => void;
};

export function AppHeader({
  isScrolled = false,
  onPressAddLead,
  onPressBell,
  onPressSettings,
}: AppHeaderProps) {
  const { colors, theme, toggleTheme } = useAppTheme();
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [seconds, setSeconds] = useState(0);

  React.useEffect(() => {
    if (!isOnDuty) return;
    const interval = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(interval);
  }, [isOnDuty]);

  const onDutyLabel = isOnDuty ? 'On Duty' : 'Off Duty';
  const pendingHours = 0;
  const totalLoggedHours = useMemo(() => seconds / 3600, [seconds]);

  const confirmStatusToggle = () => {
    const nextState = !isOnDuty;
    setIsOnDuty(nextState);
    setShowStatusModal(false);
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.background ?? '#020617' }]}> 
      <View style={[styles.row, styles.primaryRow, { backgroundColor: colors.card ?? '#0f172a', paddingHorizontal: 12 }]}> 
        <View style={styles.brandWrap}>
          <View style={[styles.logo, { backgroundColor: colors.accent ?? '#0284c7' }]}>
            <Text style={styles.logoText}>SM</Text>
          </View>
          <Text style={[styles.brandText, { color: colors.textPrimary ?? '#e2e8f0' }]}>SPACE MAKER</Text>
        </View>

        <View style={styles.actionsRow}>
          <Pressable onPress={() => toggleTheme()} style={[styles.iconButton, { backgroundColor: colors.subpanel ?? '#111827' }]}>
            {theme === 'dark' ? <SunMedium size={16} color={colors.textPrimary ?? '#e2e8f0'} /> : <MoonStar size={16} color={colors.textPrimary ?? '#e2e8f0'} />}
          </Pressable>

          <Pressable onPress={onPressBell ?? (() => undefined)} style={[styles.iconButton, { backgroundColor: colors.subpanel ?? '#111827' }]}>
            <Bell size={16} color={colors.textPrimary ?? '#e2e8f0'} />
          </Pressable>

          <Pressable onPress={onPressAddLead ?? (() => undefined)} style={[styles.iconButton, { backgroundColor: colors.subpanel ?? '#111827' }]}>
            <Plus size={16} color={colors.textPrimary ?? '#e2e8f0'} />
          </Pressable>

          <Pressable onPress={() => setShowStatusModal(true)} style={[styles.statusPill, { backgroundColor: isOnDuty ? '#10b981' : '#f59e0b' }]}>
            <Text style={styles.statusDot}>{isOnDuty ? '●' : '○'}</Text>
            <Text style={styles.statusText}>{onDutyLabel}</Text>
          </Pressable>

          <Pressable onPress={onPressSettings ?? (() => undefined)} style={[styles.iconButton, { backgroundColor: colors.subpanel ?? '#111827' }]}>
            <Settings size={16} color={colors.textPrimary ?? '#e2e8f0'} />
          </Pressable>
        </View>
      </View>

      <View style={[styles.row, styles.identityRow, { backgroundColor: colors.subpanel ?? '#111827', height: isScrolled ? 0 : 34, opacity: isScrolled ? 0 : 1, overflow: 'hidden' }]}>
        <View style={styles.identityLeft}>
          <UserRound size={14} color={colors.textPrimary ?? '#e2e8f0'} />
          <Text style={[styles.identityText, { color: colors.textPrimary ?? '#e2e8f0' }]}>Imran Nahar</Text>
          <View style={[styles.badge, { backgroundColor: colors.warning ?? '#f59e0b' }]}>
            <Text style={styles.badgeText}>PROBATION</Text>
          </View>
        </View>

        <View style={styles.identityRight}>
          <Text style={[styles.clockText, { color: colors.textPrimary ?? '#e2e8f0' }]}>⏱️ {formatClock(seconds)}</Text>
          <Text style={[styles.sessionText, { color: colors.textSecondary ?? '#94a3b8' }]}>#SES-8831</Text>
        </View>
      </View>

      <Modal transparent visible={showStatusModal} animationType="fade" onRequestClose={() => setShowStatusModal(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setShowStatusModal(false)}>
          <Pressable style={[styles.modalCard, { backgroundColor: colors.card ?? '#0f172a' }]} onPress={() => undefined}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary ?? '#e2e8f0' }]}>
              {pendingHours <= 0 ? 'Excellent work today!' : 'Are you sure?'}
            </Text>
            <Text style={[styles.modalCopy, { color: colors.textSecondary ?? '#94a3b8' }]}>
              {pendingHours <= 0
                ? 'You have cleared the day’s pending hours. Great job.'
                : `Logged ${totalLoggedHours.toFixed(1)} hrs today. ${pendingHours.toFixed(1)} pending hours left.`}
            </Text>
            <Pressable style={[styles.modalButton, { backgroundColor: colors.accent ?? '#0284c7' }]} onPress={confirmStatusToggle}>
              <Text style={styles.modalButtonText}>{isOnDuty ? 'Clock Out' : 'Clock In'}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%', borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  row: { width: '100%', flexDirection: 'row', alignItems: 'center' },
  primaryRow: { justifyContent: 'space-between', height: 48 },
  brandWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { width: 22, height: 22, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 10, fontWeight: '700', color: '#f8fafc' },
  brandText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.8 },
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconButton: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  statusDot: { fontSize: 10, color: '#f8fafc', fontWeight: '700' },
  statusText: { color: '#f8fafc', fontSize: 10, fontWeight: '700' },
  identityRow: { justifyContent: 'space-between', paddingHorizontal: 12, borderTopWidth: 1, borderTopColor: '#1e293b', opacity: 1 },
  identityLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  identityText: { fontSize: 11, fontWeight: '600' },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  badgeText: { fontSize: 8, color: '#111827', fontWeight: '700' },
  identityRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  clockText: { fontSize: 11, fontWeight: '600' },
  sessionText: { fontSize: 10, fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(2,6,23,0.4)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { width: '90%', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#334155' },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  modalCopy: { fontSize: 13, marginBottom: 16, lineHeight: 20 },
  modalButton: { alignItems: 'center', justifyContent: 'center', minHeight: 44, borderRadius: 10 },
  modalButtonText: { color: '#f8fafc', fontSize: 14, fontWeight: '700' },
});

export default AppHeader;
