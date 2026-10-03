import React from 'react';
import { Text, View } from 'react-native';

import { useAppTheme } from '../../../theme/ThemeContext';

interface QueueTrackerProps {
  position: number;
  total: number;
}

export const QueueTracker: React.FC<QueueTrackerProps> = ({ position, total }) => {
  const { colors } = useAppTheme();
  const percent = total > 0 ? Math.min(100, Math.round((position / total) * 100)) : 0;

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary }}>
          Lead {Math.min(position, total)} of {total}
        </Text>
        <Text style={{ fontSize: 11, color: colors.textSecondary }}>{percent}%</Text>
      </View>
      <View style={{ marginTop: 8, height: 8, width: '100%', overflow: 'hidden', borderRadius: 999, backgroundColor: colors.subpanel }}>
        <View style={{ height: 8, borderRadius: 999, backgroundColor: colors.accent, width: `${percent}%` }} />
      </View>
    </View>
  );
};
