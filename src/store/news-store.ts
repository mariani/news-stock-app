import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fetchTopHeadlines,
  fetchRssFeed,
  searchNews,
  mergeAndSortArticles,
} from '@/services/news-service';
import {DEFAULT_TOPICS} from '@/constants/topics';
import type {Article} from '@/types/article';
import type {NewsTopic} from '@/types/settings';

interface NewsState {
  selectedTopics: NewsTopic[];
  rssFeedUrls: string[];
  sportsTeams: string[];
  articles: Article[];
  isLoading: boolean;
  error: string | null;
  addTopic: (topic: NewsTopic) => void;
  removeTopic: (topic: NewsTopic) => void;
  setTopics: (topics: NewsTopic[]) => void;
  addRssFeed: (url: string) => void;
  removeRssFeed: (url: string) => void;
  addSportsTeam: (team: string) => void;
  removeSportsTeam: (team: string) => void;
  fetchArticles: () => Promise<void>;
}

export const useNewsStore = create<NewsState>()(
  persist(
    (set, get) => ({
      selectedTopics: DEFAULT_TOPICS,
      rssFeedUrls: [],
      sportsTeams: [],
      articles: [],
      isLoading: false,
      error: null,

      addTopic: (topic: NewsTopic) =>
        set(state => ({
          selectedTopics: state.selectedTopics.includes(topic)
            ? state.selectedTopics
            : [...state.selectedTopics, topic],
        })),

      removeTopic: (topic: NewsTopic) =>
        set(state => ({
          selectedTopics: state.selectedTopics.filter(t => t !== topic),
        })),

      setTopics: (topics: NewsTopic[]) => set({selectedTopics: topics}),

      addRssFeed: (url: string) =>
        set(state => ({
          rssFeedUrls: state.rssFeedUrls.includes(url)
            ? state.rssFeedUrls
            : [...state.rssFeedUrls, url],
        })),

      removeRssFeed: (url: string) =>
        set(state => ({
          rssFeedUrls: state.rssFeedUrls.filter(u => u !== url),
        })),

      addSportsTeam: (team: string) => {
        const {sportsTeams} = get();
        if (sportsTeams.includes(team)) return;
        set({sportsTeams: [...sportsTeams, team]});
        get().fetchArticles();
      },

      removeSportsTeam: (team: string) =>
        set(state => ({
          sportsTeams: state.sportsTeams.filter(t => t !== team),
        })),

      fetchArticles: async () => {
        set({isLoading: true, error: null});
        try {
          const {selectedTopics, rssFeedUrls, sportsTeams} = get();

          const topicPromises = selectedTopics.map(topic =>
            fetchTopHeadlines(topic).catch(() => [] as Article[]),
          );
          const rssPromises = rssFeedUrls.map(url =>
            fetchRssFeed(url).catch(() => [] as Article[]),
          );
          const teamPromises = sportsTeams.map(team =>
            searchNews(team).catch(() => [] as Article[]),
          );

          const results = await Promise.all([
            ...topicPromises,
            ...rssPromises,
            ...teamPromises,
          ]);
          const articles = mergeAndSortArticles(...results);

          set({articles, isLoading: false});
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch articles',
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'news-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        selectedTopics: state.selectedTopics,
        rssFeedUrls: state.rssFeedUrls,
        sportsTeams: state.sportsTeams,
      }),
    },
  ),
);
