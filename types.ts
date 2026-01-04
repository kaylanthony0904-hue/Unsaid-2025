
export interface Story {
  id: string;
  message_body: string;
  nickname?: string;
  image_url?: string;
  reaction_count: number;
  report_count: number;
  timestamp: number;
}

export type View = 'home' | 'submit' | 'wall';
export type FilterType = 'latest' | 'trending';
