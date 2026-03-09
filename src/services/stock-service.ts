import type {StockQuote, SymbolSearchResult, Recommendation} from '@/types/stock';
import {STOCK_SYMBOLS} from '@/data/stock-symbols';
import {CORS_PROXY} from './api-client';

interface YahooChartMeta {
  exchangeName: string;
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketVolume: number;
  regularMarketPreviousClose: number;
  previousClose: number;
}

interface YahooChartResult {
  meta: YahooChartMeta;
  indicators: {
    quote: Array<{close: (number | null)[]}>;
  };
}

interface YahooChartResponse {
  chart: {
    result: YahooChartResult[] | null;
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

function buildYahooChartUrl(symbol: string, range: string = '1d'): string {
  const base = 'https://query2.finance.yahoo.com';
  const path = `/v8/finance/chart/${encodeURIComponent(symbol)}`;
  const useProxy = typeof window !== 'undefined' && window.location != null;
  if (!useProxy) {
    return `${base}${path}?interval=1d&range=${range}`;
  }
  // codetabs CORS proxy — same as ESPN; encode ? and & so codetabs forwards the full URL
  return `${CORS_PROXY}${base}${path}%3Finterval%3D1d%26range%3D${range}`;
}

// Shared fetch helper — clearTimeout in finally so it always runs
async function fetchYahooChart(
  symbol: string,
  range: string = '1d',
): Promise<YahooChartResult | null> {
  const url = buildYahooChartUrl(symbol, range);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(url, {cache: 'no-store', signal: controller.signal});
    if (!response.ok) {
      return null;
    }
    const data: YahooChartResponse = await response.json();
    return data.chart?.result?.[0] ?? null;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchGlobalQuote(symbol: string): Promise<StockQuote> {
  // Use 5d range so we always have at least 2 daily closes for change calculation
  const result = await fetchYahooChart(symbol, '5d');
  const meta = result?.meta;
  if (!meta || meta.regularMarketPrice == null) {
    throw new Error(`No quote data for ${symbol}`);
  }

  const closes = (result?.indicators?.quote?.[0]?.close ?? []).filter(
    (c): c is number => c != null,
  );

  let change: number;
  let previousClose: number;

  if (meta.regularMarketChange != null && meta.regularMarketChange !== 0) {
    // Market was active today — Yahoo Finance provides the accurate intraday change
    change = meta.regularMarketChange;
    previousClose =
      meta.regularMarketPreviousClose ??
      meta.previousClose ??
      meta.regularMarketPrice - change;
  } else if (closes.length >= 2) {
    // Weekend / market closed — derive change from last two trading day closes
    change = closes[closes.length - 1] - closes[closes.length - 2];
    previousClose = closes[closes.length - 2];
  } else {
    change = 0;
    previousClose =
      meta.regularMarketPreviousClose ?? meta.previousClose ?? meta.regularMarketPrice;
  }

  const changePercent = previousClose ? change / previousClose : 0;
  return {
    symbol,
    price: meta.regularMarketPrice,
    change,
    changePercent,
    high: meta.regularMarketDayHigh ?? meta.regularMarketPrice,
    low: meta.regularMarketDayLow ?? meta.regularMarketPrice,
    volume: meta.regularMarketVolume ?? 0,
    previousClose,
    lastUpdated: new Date().toISOString(),
  };
}

// Called once per symbol; result is persisted so this only runs when exchange is unknown.
export async function fetchSymbolExchange(symbol: string): Promise<string> {
  console.log(`[fetchSymbolExchange] starting for ${symbol}`);
  try {
    const result = await fetchYahooChart(symbol, '1d');
    const exchangeName = result?.meta?.exchangeName ?? '';
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

export async function fetchDailyCloses(
  symbol: string,
  days: number,
): Promise<number[]> {
  // Use 1mo range to ensure we get enough trading days
  const result = await fetchYahooChart(symbol, '1mo');
  const closes = result?.indicators?.quote?.[0]?.close ?? [];
  return closes
    .filter((c): c is number => c != null)
    .reverse()  // most recent first
    .slice(0, days);
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
