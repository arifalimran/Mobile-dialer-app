import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Megaphone } from 'lucide-react-native';

import { useAppTheme } from '../../../theme/ThemeContext';
import { MOCK_BULLETINS } from '../constants/mockBulletins';
import { useNoticeStore } from '../hooks/useNoticeStore';

/** Drawer item [📢 Mandatory Bulletins] destination — full history + read status. */
export const BulletinsScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const acknowledgedIds = useNoticeStore((state) => state.acknowledgedIds);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.canvas, paddingHorizontal: 20, paddingTop: 24 }} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Megaphone size={22} color={colors.accent} />
        <Text style={{ marginLeft: 8, fontSize: 20, fontWeight: '700', color: colors.textPrimary }}>Bulletins</Text>
      </View>

      {MOCK_BULLETINS.map((bulletin) => {
        const isRead = acknowledgedIds.includes(bulletin.id);
        return (
          <View
            key={bulletin.id}
            style={{
              marginTop: 16,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: bulletin.priority === 'HIGH' ? colors.warning : colors.border,
              backgroundColor: bulletin.priority === 'HIGH' ? 'rgba(245,158,11,0.12)' : colors.card,
              padding: 16,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ flex: 1, fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>{bulletin.title}</Text>
              <Text style={{ marginLeft: 8, fontSize: 11, fontWeight: '700', color: isRead ? colors.success : colors.danger }}>
                {isRead ? 'READ' : 'UNREAD'}
              </Text>
            </View>
            <Text style={{ marginTop: 8, fontSize: 11, color: colors.textSecondary }}>
              {new Date(bulletin.postedAt).toLocaleString()}
            </Text>
            <Text style={{ marginTop: 8, fontSize: 14, lineHeight: 20, color: colors.textSecondary }}>{bulletin.body}</Text>
          </View>
        );
      })}
    </ScrollView>
  );
};
