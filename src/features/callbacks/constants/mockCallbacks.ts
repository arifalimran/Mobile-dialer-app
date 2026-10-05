import type { MessageHistoryItem } from '../../calling/callingTypes';

export interface ScheduledCallbackSeed {
  id: string;
  leadName: string;
  phone: string;
  project: string;
  unit: string;
  nextCallback: string;
  note: string;
  status: 'TODAY' | 'OVERDUE';
  lastTouch: string;
  messageHistory: MessageHistoryItem[];
}

export const MOCK_CALLBACKS: ScheduledCallbackSeed[] = [
  {
    id: 'CB-1041',
    leadName: 'Shahana Akter',
    phone: '+8801819123456',
    project: 'Riverside Heights',
    unit: 'B-09',
    nextCallback: 'Today • 09:15 AM',
    note: 'Prospect wants a final comparison call after finance review.',
    status: 'TODAY',
    lastTouch: '2 min ago',
    messageHistory: [],
  },
  {
    id: 'CB-1029',
    leadName: 'Mahmudul Hasan',
    phone: '+8801718234567',
    project: 'Skyline North',
    unit: 'C-14',
    nextCallback: 'Today • 12:40 PM',
    note: 'Requested call after job transfer approval from spouse.',
    status: 'TODAY',
    lastTouch: '11 min ago',
    messageHistory: [],
  },
  {
    id: 'CB-1015',
    leadName: 'Nusrat Jahan',
    phone: '+8801918765432',
    project: 'Garden Lane',
    unit: 'A-03',
    nextCallback: 'Overdue • 07:10 AM',
    note: 'Missed earlier callback; follow-up required today before inventory lock.',
    status: 'OVERDUE',
    lastTouch: '36 min ago',
    messageHistory: [],
  },
  {
    id: 'CB-1088',
    leadName: 'Zakir Hossain',
    phone: '+8801555123456',
    project: 'Harbor Crest',
    unit: 'D-22',
    nextCallback: 'Overdue • 08:30 AM',
    note: 'Customer available in the evening for site visit confirmation.',
    status: 'OVERDUE',
    lastTouch: '58 min ago',
    messageHistory: [],
  },
];