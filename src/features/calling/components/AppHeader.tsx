import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { useAppTheme } from '../../../theme/ThemeContext';

interface AppHeaderProps {
  agentPhone: string;
  isOnShift: boolean;
  onToggleShift: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  agentPhone,
  isOnShift,
  onToggleShift,
}) => {
  const { colors } = useAppTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.card, paddingHorizontal: 16, paddingVertical: 12 }}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textSecondary }}>ACTIVE LINE</Text>
        <Text style={{ marginTop: 4, fontFamily: 'monospace', fontSize: 15, fontWeight: '700', letterSpacing: 0.8, color: colors.textPrimary }} numberOfLines={1}>
          {agentPhone ? `Line: ${agentPhone}` : 'Line: Not configured'}
        </Text>
      </View>

      <Pressable
        onPress={onToggleShift}
        style={{ minHeight: 48, flexShrink: 0, alignItems: 'center', justifyContent: 'center', borderRadius: 999, borderWidth: 1, borderColor: isOnShift ? colors.success : colors.border, backgroundColor: isOnShift ? 'rgba(16,185,129,0.12)' : colors.subpanel, paddingHorizontal: 16 }}
      >
        <Text style={{ fontSize: 11, fontWeight: '700', color: isOnShift ? colors.success : colors.textSecondary }}>
          {isOnShift ? 'On Shift' : 'Off Shift'}
        </Text>
      </Pressable>
    </View>
  );
};

