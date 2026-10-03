import React from 'react';
import { Text, View } from 'react-native';

interface QueueTrackerProps {
  position: number;
  total: number;
}

export const QueueTracker: React.FC<QueueTrackerProps> = ({ position, total }) => {
  const percent = total > 0 ? Math.min(100, Math.round((position / total) * 100)) : 0;

  return (
    <View>
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-medium text-slate-300">
          Lead {Math.min(position, total)} of {total}
        </Text>
        <Text className="text-xs text-slate-500">{percent}%</Text>
      </View>
      <View className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <View className="h-2 rounded-full bg-sky-600" style={{ width: `${percent}%` }} />
      </View>
    </View>
  );
};
