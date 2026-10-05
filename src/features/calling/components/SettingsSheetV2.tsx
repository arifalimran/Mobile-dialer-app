import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LogOut, ShieldCheck, Smartphone, Sparkles, Volume2 } from 'lucide-react-native';
import { useAppTheme } from '../../../theme/ThemeContext';
import { useAuthStore } from '../../auth/hooks/useAuthStore';

const roleOptions = [
  { key: 'FULL_TIME_SALES', label: 'Full-Time Sales', hours: '120h', base: '৳12k', closingGate: '65% closing gate' },
  { key: 'PART_TIME_SALES', label: 'Part-Time Sales', hours: '60h', base: '৳6k', closingGate: '50% closing gate' },
  { key: 'MICRO_CALLER', label: 'Call Center Micro-Caller', hours: '120h', base: '৳8k', closingGate: '0% closing gate, holds disabled' },
  { key: 'FREELANCER', label: 'Freelancer Partner', hours: '0h', base: '৳0', closingGate: 'pure 1.5% commission, no dialer/shifts' },
] as const;

const lineOptions = [
  { key: 'NATIVE_SIM', label: 'Native SIM Dialer (Default)' },
  { key: 'IPTSP_PBX', label: 'IPTSP 096xx PBX Bridge' },
] as const;

export function SettingsSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { colors, toggleTheme } = useAppTheme();
  const [role, setRole] = useState<string>('FULL_TIME_SALES');
  const [lineMode, setLineMode] = useState<string>('NATIVE_SIM');

  const handleRoleChange = (nextRole: string) => {
    setRole(nextRole);
    useAuthStore.getState().switchRole(nextRole as any);
  };

  const handleLogout = () => {
    useAuthStore.getState().logout();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.card ?? '#0f172a', borderColor: '#334155' }]} onPress={() => undefined}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: colors.textPrimary ?? '#e2e8f0' }]}>Settings</Text>
            <Pressable onPress={toggleTheme} style={[styles.themeButton, { backgroundColor: colors.subpanel ?? '#111827' }]}>
              <Sparkles size={14} color={colors.textPrimary ?? '#e2e8f0'} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <View style={[styles.section, { backgroundColor: colors.subpanel ?? '#111827' }]}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary ?? '#e2e8f0' }]}>Active Profile Dossier</Text>
              <Text style={[styles.valueLine, { color: colors.textSecondary ?? '#94a3b8' }]}>Name: Imran Nahar</Text>
              <Text style={[styles.valueLine, { color: colors.textSecondary ?? '#94a3b8' }]}>SIM: +880 1711-***-88</Text>
              <Text style={[styles.valueLine, { color: colors.textSecondary ?? '#94a3b8' }]}>Role: FULL_TIME_SALES</Text>
              <View style={[styles.badge, { backgroundColor: '#f59e0b' }]}>
                <Text style={styles.badgeText}>PROBATION</Text>
              </View>
            </View>

            <View style={[styles.section, { backgroundColor: colors.subpanel ?? '#111827' }]}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary ?? '#e2e8f0' }]}>Role Sandbox Switcher</Text>
              {roleOptions.map((option) => {
                const selected = option.key === role;
                return (
                  <Pressable key={option.key} onPress={() => handleRoleChange(option.key)} style={[styles.optionRow, { borderColor: selected ? colors.accent ?? '#0284c7' : '#475569' }]}>
                    <View style={styles.optionMeta}>
                      <Text style={[styles.optionLabel, { color: colors.textPrimary ?? '#e2e8f0' }]}>{option.label}</Text>
                      <Text style={[styles.optionHint, { color: colors.textSecondary ?? '#94a3b8' }]}>{option.hours} • {option.base} • {option.closingGate}</Text>
                    </View>
                    <View style={[styles.radio, { borderColor: selected ? colors.accent ?? '#0284c7' : '#64748b', backgroundColor: selected ? colors.accent ?? '#0284c7' : 'transparent' }]} />
                  </Pressable>
                );
              })}
            </View>

            <View style={[styles.section, { backgroundColor: colors.subpanel ?? '#111827' }]}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary ?? '#e2e8f0' }]}>Telephony Line Routing</Text>
              {lineOptions.map((option) => {
                const selected = option.key === lineMode;
                return (
                  <Pressable key={option.key} onPress={() => setLineMode(option.key)} style={[styles.optionRow, { borderColor: selected ? colors.accent ?? '#0284c7' : '#475569' }]}>
                    <View style={styles.optionMeta}>
                      <Text style={[styles.optionLabel, { color: colors.textPrimary ?? '#e2e8f0' }]}>{option.label}</Text>
                    </View>
                    <View style={[styles.radio, { borderColor: selected ? colors.accent ?? '#0284c7' : '#64748b', backgroundColor: selected ? colors.accent ?? '#0284c7' : 'transparent' }]} />
                  </Pressable>
                );
              })}
            </View>

            <View style={[styles.section, { backgroundColor: colors.subpanel ?? '#111827' }]}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary ?? '#e2e8f0' }]}>Policies & Bulletins</Text>
              <Pressable style={[styles.primaryButton, { backgroundColor: '#10b981' }]}>
                <ShieldCheck size={16} color="#f8fafc" />
                <Text style={styles.primaryButtonText}>Open Bulletins & Compliance</Text>
              </Pressable>
            </View>

            <Pressable style={[styles.logoutButton, { backgroundColor: '#ef4444' }]} onPress={handleLogout}>
              <LogOut size={16} color="#f8fafc" />
              <Text style={styles.logoutButtonText}>Sign Out / Clock Out</Text>
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(2,6,23,0.45)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, maxHeight: '82%', paddingTop: 16, paddingBottom: 28 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '700' },
  themeButton: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 20, gap: 14 },
  section: { borderRadius: 16, padding: 14 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  valueLine: { fontSize: 13, marginBottom: 6 },
  badge: { alignSelf: 'flex-start', marginTop: 8, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { color: '#111827', fontWeight: '700', fontSize: 10 },
  optionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 8 },
  optionMeta: { flex: 1, paddingRight: 12 },
  optionLabel: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  optionHint: { fontSize: 11, lineHeight: 16 },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2 },
  primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 44, borderRadius: 10 },
  primaryButtonText: { color: '#f8fafc', fontSize: 14, fontWeight: '700' },
  logoutButton: { marginHorizontal: 20, marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 48, borderRadius: 12 },
  logoutButtonText: { color: '#f8fafc', fontSize: 15, fontWeight: '700' },
});

export default SettingsSheet;
