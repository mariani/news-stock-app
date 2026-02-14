import * as rssParser from 'react-native-rss-parser';
import {newsApiClient} from './api-client';
import {DEFAULT_COUNTRY} from '@/constants/api';
import type {Article} from '@/types/article';

interface NewsApiArticle {
  source: {id: string | null; name: string};
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
}

interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsApiArticle[];
}

function generateId(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function mapNewsApiArticle(
  raw: NewsApiArticle,
  topic?: string,
): Article {
  return {
    id: generateId(raw.url),
    title: raw.title,
    description: raw.description,
    url: raw.url,
    imageUrl: raw.urlToImage,
    publishedAt: raw.publishedAt,
    source: {name: raw.source.name, type: 'newsapi'},
    topic,
  };
}

export async function fetchTopHeadlines(
  category: string,
): Promise<Article[]> {
  const response = await newsApiClient.get<NewsApiResponse>(
    '/top-headlines',
    {params: {category, country: DEFAULT_COUNTRY}},
  );
  return response.data.articles.map(a => mapNewsApiArticle(a, category));
}

export async function searchNews(query: string): Promise<Article[]> {
  const response = await newsApiClient.get<NewsApiResponse>('/everything', {
    params: {q: query, sortBy: 'publishedAt', pageSize: 20},
  });
  return response.data.articles.map(a => mapNewsApiArticle(a));
}

export async function fetchRssFeed(feedUrl: string): Promise<Article[]> {
  const response = await fetch(feedUrl);
  const text = await response.text();
  const feed = await rssParser.parse(text);

  return feed.items.map(item => ({
    id: generateId(item.links?.[0]?.url ?? item.id ?? item.title),
    title: item.title,
    description: item.description ?? null,
    url: item.links?.[0]?.url ?? '',
    imageUrl: null,
    publishedAt: item.published ?? new Date().toISOString(),
    source: {name: feed.title, type: 'rss' as const, feedUrl},
  }));
}

export function mergeAndSortArticles(
  ...articleSets: Article[][]
): Article[] {
  const merged = articleSets.flat();

  // Deduplicate by URL, preferring newsapi source
  const byUrl = new Map<string, Article>();
  for (const article of merged) {
    const existing = byUrl.get(article.url);
    if (!existing || (existing.source.type === 'rss' && article.source.type === 'newsapi')) {
      byUrl.set(article.url, article);
    }
  }

  return Array.from(byUrl.values()).sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}
