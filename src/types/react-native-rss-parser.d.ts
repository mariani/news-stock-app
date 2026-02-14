declare module 'react-native-rss-parser' {
  interface FeedLink {
    url: string;
    rel?: string;
  }

  interface FeedItem {
    id: string;
    title: string;
    description?: string;
    links?: FeedLink[];
    published?: string;
    authors?: {name: string}[];
    categories?: string[];
  }

  interface Feed {
    title: string;
    description?: string;
    links?: FeedLink[];
    items: FeedItem[];
    language?: string;
  }

  export function parse(xml: string): Promise<Feed>;
}
