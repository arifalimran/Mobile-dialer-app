import { create } from 'zustand';

import { MOCK_BULLETINS } from '../constants/mockBulletins';

interface NoticeState {
  acknowledgedIds: string[];
  acknowledge: (id: string) => void;
}

/** Module 3: tracks which bulletins the agent has scrolled-through and acknowledged. */
export const useNoticeStore = create<NoticeState>((set) => ({
  acknowledgedIds: [],
  acknowledge: (id) =>
    set((state) => ({
      acknowledgedIds: state.acknowledgedIds.includes(id)
        ? state.acknowledgedIds
        : [...state.acknowledgedIds, id],
    })),
}));

export function useUnreadHighPriorityBulletin() {
  const acknowledgedIds = useNoticeStore((state) => state.acknowledgedIds);
  return MOCK_BULLETINS.find(
    (bulletin) => bulletin.priority === 'HIGH' && !acknowledgedIds.includes(bulletin.id),
  );
}

export function useUnreadBulletinCount() {
  const acknowledgedIds = useNoticeStore((state) => state.acknowledgedIds);
  return MOCK_BULLETINS.filter((bulletin) => !acknowledgedIds.includes(bulletin.id)).length;
}
