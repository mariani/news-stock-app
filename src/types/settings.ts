export type NewsTopic =
  | 'business'
  | 'entertainment'
  | 'general'
  | 'health'
  | 'science'
  | 'sports'
  | 'technology';

export interface UserPreferences {
  newsTopics: NewsTopic[];
  rssFeedUrls: string[];
  refreshIntervalSeconds: number;
}
