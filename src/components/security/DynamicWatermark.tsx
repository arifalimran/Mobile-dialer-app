import React, { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { useAuthStore } from '../../features/auth/hooks/useAuthStore';
import { useAppTheme } from '../../theme/ThemeContext';

interface DynamicWatermarkProps {
  agentId?: string;
}

export function DynamicWatermark({ agentId }: DynamicWatermarkProps) {
  const { tokens } = useAppTheme();
  const agentProfile = useAuthStore((state) => state.agentProfile);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10_000);
    return () => clearInterval(timer);
  }, []);

  const watermarkLabel = useMemo(() => {
    const displayedAgent = agentProfile?.corporateSim ?? agentId ?? 'AGT-01';
    const iso = new Date(now.getTime()).toISOString();
    return `${displayedAgent} • ${iso} • SPACE MAKER CONFIDENTIAL`;
  }, [agentId, agentProfile?.corporateSim, now]);

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        opacity: 0.04,
        zIndex: 100,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ rotate: '-22deg' }],
      }}
    >
      {Array.from({ length: 10 }, (_, index) => (
        <Text
          key={`${watermarkLabel}-${index}`}
          style={{
            color: tokens.textPrimary,
            fontSize: 18,
            fontWeight: '800',
            letterSpacing: 1.5,
            marginVertical: 16,
          }}
        >
          {watermarkLabel}
        </Text>
      ))}
    </View>
  );
}
