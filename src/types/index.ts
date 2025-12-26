export type Platform = 'YouTube' | 'Short' | 'Reel' | 'Podcast' | 'Email';
export type Status = 'Idea' | 'Scripting' | 'Recording' | 'Editing' | 'Scheduled' | 'Published';

export interface ContentItem {
  id: string;
  title: string;
  platform: Platform;
  status: Status;
  type: string; // e.g., 'Tutorial', 'Vlog', 'Deep Dive'
  targetDate: string; // ISO string
  isSponsored: boolean;
  notes: string;
}
