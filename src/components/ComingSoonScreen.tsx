import React from 'react';
import { Text, View } from 'react-native';
import { Construction } from 'lucide-react-native';

interface ComingSoonScreenProps {
  title: string;
  description?: string;
}

/** Lightweight placeholder for drawer destinations that don't have a backend yet. */
export const ComingSoonScreen: React.FC<ComingSoonScreenProps> = ({ title, description }) => (
  <View className="flex-1 items-center justify-center bg-slate-950 px-8">
    <Construction size={32} color="#475569" />
    <Text className="mt-3 text-lg font-semibold text-white">{title}</Text>
    <Text className="mt-2 text-center text-sm text-slate-500">
      {description ?? 'This module is wired up in the UI but is waiting on a backend endpoint.'}
    </Text>
  </View>
);
