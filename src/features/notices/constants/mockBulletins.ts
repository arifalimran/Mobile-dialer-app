import type { Bulletin } from '../noticeTypes';

/** Mock Head Office bulletins (Module 3). Replace with a real announcements API. */
export const MOCK_BULLETINS: Bulletin[] = [
  {
    id: 'bulletin-1',
    title: 'Updated BTRC Masking Compliance Notice',
    body:
      'Effective immediately, all outbound calls must continue routing exclusively through the licensed 096xx IPTSP PBX bridge or the agent\'s registered native SIM for self-sourced leads. Any attempt to use unverified foreign VoIP gateways or CLI spoofing tools will result in immediate suspension pending Head Office review. Please re-confirm your registered agent phone number in Settings today.',
    priority: 'HIGH',
    postedAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: 'bulletin-2',
    title: 'New Emerald Bay Phase 2 Inventory Released',
    body:
      'Land Sharing Phase 2 units at Space Maker Emerald Bay, Jolsiri Sector 10 are now live in the project catalog. Review the updated pricing and installment terms before your next client call.',
    priority: 'NORMAL',
    postedAt: Date.now() - 1000 * 60 * 60 * 26,
  },
];
