import {alphaVantageClient, CORS_PROXY} from './api-client';
import {alphaVantageLimiter} from '@/utils/rate-limiter';
import type {StockQuote, SymbolSearchResult, Recommendation} from '@/types/stock';
import {STOCK_SYMBOLS} from '@/data/stock-symbols';

interface AlphaVantageGlobalQuote {
  'Global Quote': {
    '01. symbol': string;
    '02. open': string;
    '03. high': string;
    '04. low': string;
    '05. price': string;
    '06. volume': string;
    '07. latest trading day': string;
    '08. previous close': string;
    '09. change': string;
    '10. change percent': string;
  };
}


function parseGlobalQuote(
  data: AlphaVantageGlobalQuote['Global Quote'],
): StockQuote {
  const changePercentStr = data['10. change percent'].replace('%', '');
  return {
    symbol: data['01. symbol'],
    price: parseFloat(data['05. price']),
    change: parseFloat(data['09. change']),
    changePercent: parseFloat(changePercentStr) / 100,
    high: parseFloat(data['03. high']),
    low: parseFloat(data['04. low']),
    volume: parseInt(data['06. volume'], 10),
    previousClose: parseFloat(data['08. previous close']),
    lastUpdated: new Date().toISOString(),
  };
}

export async function fetchGlobalQuote(
  symbol: string,
): Promise<StockQuote> {
  return alphaVantageLimiter.schedule(async () => {
    const response = await alphaVantageClient.get<AlphaVantageGlobalQuote>(
      '/query',
      {params: {function: 'GLOBAL_QUOTE', symbol}},
    );
    const quote = response.data['Global Quote'];
    if (!quote || !quote['05. price']) {
      throw new Error(`No quote data for ${symbol}`);
    }
    return parseGlobalQuote(quote);
  });
}

interface YahooChartResponse {
  chart: {
    result: Array<{meta: {exchangeName: string}}> | null;
    error: {code: string; description: string} | null;
  };
}

// Yahoo Finance exchangeName → Google Finance URL suffix
const EXCHANGE_MAP: Record<string, string> = {
  NASDAQ: 'NASDAQ',
  NYSE: 'NYSE',
  NYSEArca: 'NYSEARCA',
  'NYSE Arca': 'NYSEARCA',
  NMS: 'NASDAQ',   // Nasdaq Global Select Market
  NGM: 'NASDAQ',   // Nasdaq Global Market
  NCM: 'NASDAQ',   // Nasdaq Capital Market
  NYQ: 'NYSE',
  PCX: 'NYSEARCA',
};

function buildYahooChartUrl(symbol: string): string {
  const directUrl = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
  // Use CORS proxy in all browser contexts (Yahoo Finance blocks cross-origin requests)
  const useProxy = typeof window !== 'undefined' && window.location != null;
  if (!useProxy) {
    // React Native native — no CORS restrictions, direct fetch
    return directUrl;
  }
  // allorigins.win fetches with browser-like headers, avoiding Yahoo Finance's bot detection
  // /raw endpoint returns the response body directly (no wrapper JSON)
  return `https://api.allorigins.win/raw?url=${encodeURIComponent(directUrl)}`;
}

// Called once per symbol; result is persisted so this only runs when exchange is unknown.
export async function fetchSymbolExchange(symbol: string): Promise<string> {
  console.log(`[fetchSymbolExchange] starting for ${symbol}`);
  try {
    const url = buildYahooChartUrl(symbol);
    console.log(`[fetchSymbolExchange] url: ${url}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(url, {cache: 'no-store', signal: controller.signal});
    clearTimeout(timeoutId);
    console.log(`[fetchSymbolExchange] status ${response.status} for ${symbol}`);
    if (!response.ok) {
      return '';
    }
    const data: YahooChartResponse = await response.json();
    const exchangeName = data.chart?.result?.[0]?.meta?.exchangeName ?? '';
    const exchange = EXCHANGE_MAP[exchangeName] ?? '';
    console.log(`[fetchSymbolExchange] ${symbol} exchangeName="${exchangeName}" → "${exchange}"`);
    return exchange;
  } catch (e) {
    console.error(`[fetchSymbolExchange] error for ${symbol}:`, e);
    return '';
  }
}

export function searchSymbol(keywords: string): Promise<SymbolSearchResult[]> {
  // Local search — no API call, no quota concerns.
  const q = keywords.trim().toLowerCase();
  if (!q) {
    return Promise.resolve([]);
  }
  const results = STOCK_SYMBOLS.filter(
    s =>
      s.symbol.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q),
  ).slice(0, 10);
  return Promise.resolve(results);
}

interface AlphaVantageDailyResponse {
  'Time Series (Daily)': Record<string, {'4. close': string}>;
}

export async function fetchDailyCloses(
  symbol: string,
  days: number,
): Promise<number[]> {
  return alphaVantageLimiter.schedule(async () => {
    const response = await alphaVantageClient.get<AlphaVantageDailyResponse>(
      '/query',
      {params: {function: 'TIME_SERIES_DAILY', symbol, outputsize: 'compact'}},
    );
    const series = response.data['Time Series (Daily)'];
    if (!series) {
      return [];
    }
    return Object.keys(series)
      .sort((a, b) => b.localeCompare(a))
      .slice(0, days)
      .map(date => parseFloat(series[date]['4. close']));
  });
}

export function computeRecommendation(
  stockCloses: number[],
  diaCloses: number[],
  qqqCloses: number[],
): Recommendation {
  // Need 4 stock closes (today + 3 prior) and 3 index closes (today + 2 prior)
  if (stockCloses.length < 4 || diaCloses.length < 3 || qqqCloses.length < 3) {
    return 'HOLD';
  }
  // Stock down >= 10% over past 3 business days
  const stockChange = (stockCloses[0] - stockCloses[3]) / stockCloses[3];
  const stockDown10pct = stockChange <= -0.1;

  // Either Dow (DIA) or NASDAQ (QQQ) index down over past 2 business days
  const diaDown = diaCloses[0] < diaCloses[2];
  const qqqDown = qqqCloses[0] < qqqCloses[2];

  return stockDown10pct && (diaDown || qqqDown) ? 'BUY' : 'HOLD';
}

export async function fetchBulkQuotes(
  symbols: string[],
): Promise<StockQuote[]> {
  const results: StockQuote[] = [];
  for (const symbol of symbols) {
    try {
      const quote = await fetchGlobalQuote(symbol);
      results.push(quote);
    } catch {
      // Skip failed quotes silently — partial results are acceptable
    }
  }
  return results;
}
