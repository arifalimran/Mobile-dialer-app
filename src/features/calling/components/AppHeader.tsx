import React from 'react';
import { Pressable, Text, View } from 'react-native';

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
  return (
    <View className="flex-row items-center justify-between border-b border-white/10 bg-[#070b12] px-4 py-3">
      <View className="flex-1 pr-3">
        <Text className="text-xs font-medium text-slate-500">ACTIVE LINE</Text>
        <Text className="mt-0.5 font-mono text-base font-semibold tracking-wide text-white" numberOfLines={1}>
          {agentPhone ? `Line: ${agentPhone}` : 'Line: Not configured'}
        </Text>
      </View>

      <Pressable
        onPress={onToggleShift}
        className={`min-h-[48px] shrink-0 items-center justify-center rounded-full border px-4 ${
          isOnShift ? 'border-emerald-700 bg-emerald-950' : 'border-slate-700 bg-slate-900'
        }`}
      >
        <Text className={`text-xs font-semibold ${isOnShift ? 'text-emerald-400' : 'text-slate-400'}`}>
          {isOnShift ? 'On Shift' : 'Off Shift'}
        </Text>
      </Pressable>
    </View>
  );
};

