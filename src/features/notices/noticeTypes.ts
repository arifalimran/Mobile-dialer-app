export type BulletinPriority = 'HIGH' | 'NORMAL';

export interface Bulletin {
  id: string;
  title: string;
  body: string;
  priority: BulletinPriority;
  postedAt: number;
}
