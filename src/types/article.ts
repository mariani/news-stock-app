export interface Article {
  id: string;
  title: string;
  description: string | null;
  url: string;
  imageUrl: string | null;
  publishedAt: string;
  source: ArticleSource;
  topic?: string;
}

export interface ArticleSource {
  name: string;
  type: 'newsapi' | 'rss';
  feedUrl?: string;
}
