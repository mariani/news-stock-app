export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  previousClose: number;
  lastUpdated: string;
}

export interface Watchlist {
  id: string;
  name: string;
  symbols: string[];
  createdAt: string;
}

export interface SymbolSearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
  currency: string;
}
