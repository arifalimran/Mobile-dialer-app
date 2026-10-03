import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';
import { Megaphone } from 'lucide-react-native';

import { useAppTheme } from '../../../theme/ThemeContext';
import { useNoticeStore, useUnreadHighPriorityBulletin } from '../hooks/useNoticeStore';

const SCROLL_BOTTOM_THRESHOLD_PX = 24;

/**
 * Module 3: Mandatory Post-Login Announcement Gatekeeper.
 * Intercepts the dialer desk whenever an unread HIGH priority bulletin
 * exists. Requires scrolling to the bottom before "I Have Read &
 * Understood" becomes enabled, then records an acknowledgment timestamp.
 */
export const MandatoryNoticeModal: React.FC = () => {
  const { colors } = useAppTheme();
  const bulletin = useUnreadHighPriorityBulletin();
  const acknowledge = useNoticeStore((state) => state.acknowledge);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);

  // Never present a native Modal on the first frame after the login -> app
  // transition; wait for the keyboard/route animation to settle.
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 800);
    return () => clearTimeout(timer);
  }, []);

  if (!bulletin || !isReady) return null;

  // Short bulletins never scroll; without this the button stays disabled and
  // the whole app is permanently locked behind the modal.
  const handleContentSizeChange = (_width: number, contentHeight: number) => {
    if (viewportHeight > 0 && contentHeight <= viewportHeight + SCROLL_BOTTOM_THRESHOLD_PX) {
      setHasScrolledToBottom(true);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromBottom =
      contentSize.height - contentOffset.y - layoutMeasurement.height;
    if (distanceFromBottom <= SCROLL_BOTTOM_THRESHOLD_PX) {
      setHasScrolledToBottom(true);
    }
  };

  return (
    <Modal visible transparent animationType="fade">
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.72)', paddingHorizontal: 20 }}>
        <View style={{ maxHeight: '80%', width: '100%', borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Megaphone size={20} color={colors.warning} />
            <Text style={{ marginLeft: 8, fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>{bulletin.title}</Text>
          </View>

          <ScrollView
            style={{ marginTop: 16 }}
            onScroll={handleScroll}
            scrollEventThrottle={32}
            onLayout={(event) => setViewportHeight(event.nativeEvent.layout.height)}
            onContentSizeChange={handleContentSizeChange}
          >
            <Text style={{ fontSize: 14, lineHeight: 22, color: colors.textSecondary }}>{bulletin.body}</Text>
          </ScrollView>

          <Pressable
            onPress={() => acknowledge(bulletin.id)}
            disabled={!hasScrolledToBottom}
            style={{
              marginTop: 20,
              minHeight: 48,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              backgroundColor: hasScrolledToBottom ? colors.success : colors.subpanel,
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '700', color: hasScrolledToBottom ? '#F7F3EE' : colors.textSecondary }}>
              {hasScrolledToBottom ? '☑️ I Have Read & Understood' : 'Scroll to the bottom to continue'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};
