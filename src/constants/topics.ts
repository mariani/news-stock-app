import type {NewsTopic} from '@/types/settings';

export const AVAILABLE_TOPICS: {label: string; value: NewsTopic}[] = [
  {label: 'Business', value: 'business'},
  {label: 'Entertainment', value: 'entertainment'},
  {label: 'General', value: 'general'},
  {label: 'Health', value: 'health'},
  {label: 'Science', value: 'science'},
  {label: 'Sports', value: 'sports'},
  {label: 'Technology', value: 'technology'},
];

export const DEFAULT_TOPICS: NewsTopic[] = ['technology', 'business'];
