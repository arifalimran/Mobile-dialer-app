import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';
import { Megaphone } from 'lucide-react-native';

import { useNoticeStore, useUnreadHighPriorityBulletin } from '../hooks/useNoticeStore';

const SCROLL_BOTTOM_THRESHOLD_PX = 24;

/**
 * Module 3: Mandatory Post-Login Announcement Gatekeeper.
 * Intercepts the dialer desk whenever an unread HIGH priority bulletin
 * exists. Requires scrolling to the bottom before "I Have Read &
 * Understood" becomes enabled, then records an acknowledgment timestamp.
 */
export const MandatoryNoticeModal: React.FC = () => {
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
      <View className="flex-1 items-center justify-center bg-black/80 px-5">
        <View className="max-h-[80%] w-full rounded-2xl border border-amber-800 bg-slate-950 p-5">
          <View className="flex-row items-center">
            <Megaphone size={20} color="#fbbf24" />
            <Text className="ml-2 text-lg font-semibold text-white">{bulletin.title}</Text>
          </View>

          <ScrollView
            className="mt-4"
            onScroll={handleScroll}
            scrollEventThrottle={32}
            onLayout={(event) => setViewportHeight(event.nativeEvent.layout.height)}
            onContentSizeChange={handleContentSizeChange}
          >
            <Text className="text-sm leading-6 text-slate-300">{bulletin.body}</Text>
          </ScrollView>

          <Pressable
            onPress={() => acknowledge(bulletin.id)}
            disabled={!hasScrolledToBottom}
            className={`mt-5 min-h-[48px] items-center justify-center rounded-xl ${
              hasScrolledToBottom ? 'bg-emerald-600' : 'bg-slate-800'
            }`}
          >
            <Text className="text-base font-semibold text-white">
              {hasScrolledToBottom ? '☑️ I Have Read & Understood' : 'Scroll to the bottom to continue'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};
