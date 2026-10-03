import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Megaphone } from 'lucide-react-native';

import { MOCK_BULLETINS } from '../constants/mockBulletins';
import { useNoticeStore } from '../hooks/useNoticeStore';

/** Drawer item [📢 Mandatory Bulletins] destination — full history + read status. */
export const BulletinsScreen: React.FC = () => {
  const acknowledgedIds = useNoticeStore((state) => state.acknowledgedIds);

  return (
    <ScrollView className="flex-1 bg-slate-950 px-5 pt-6" contentContainerStyle={{ paddingBottom: 32 }}>
      <View className="flex-row items-center">
        <Megaphone size={22} color="#38bdf8" />
        <Text className="ml-2 text-xl font-semibold text-white">Bulletins</Text>
      </View>

      {MOCK_BULLETINS.map((bulletin) => {
        const isRead = acknowledgedIds.includes(bulletin.id);
        return (
          <View
            key={bulletin.id}
            className={`mt-4 rounded-2xl border p-4 ${
              bulletin.priority === 'HIGH' ? 'border-amber-800 bg-amber-950/30' : 'border-slate-800 bg-slate-900'
            }`}
          >
            <View className="flex-row items-center justify-between">
              <Text className="flex-1 text-sm font-semibold text-white">{bulletin.title}</Text>
              <Text className={`ml-2 text-xs font-semibold ${isRead ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isRead ? 'READ' : 'UNREAD'}
              </Text>
            </View>
            <Text className="mt-2 text-xs text-slate-400">
              {new Date(bulletin.postedAt).toLocaleString()}
            </Text>
            <Text className="mt-2 text-sm leading-5 text-slate-300">{bulletin.body}</Text>
          </View>
        );
      })}
    </ScrollView>
  );
};
