export type RootTabParamList = {
  NewsTab: undefined;
  StocksTab: undefined;
  SettingsTab: undefined;
};

export type NewsStackParamList = {
  NewsFeed: undefined;
  ArticleDetail: {articleUrl: string; title: string};
};

export type StocksStackParamList = {
  Watchlist: undefined;
  StockDetail: {symbol: string};
};
