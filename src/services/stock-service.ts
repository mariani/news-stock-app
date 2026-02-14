import {alphaVantageClient} from './api-client';
import {alphaVantageLimiter} from '@/utils/rate-limiter';
import type {StockQuote, SymbolSearchResult} from '@/types/stock';

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

interface AlphaVantageSearchResult {
  bestMatches: {
    '1. symbol': string;
    '2. name': string;
    '3. type': string;
    '4. region': string;
    '8. currency': string;
  }[];
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
    return parseGlobalQuote(response.data['Global Quote']);
  });
}

export async function searchSymbol(
  keywords: string,
): Promise<SymbolSearchResult[]> {
  return alphaVantageLimiter.schedule(async () => {
    const response = await alphaVantageClient.get<AlphaVantageSearchResult>(
      '/query',
      {params: {function: 'SYMBOL_SEARCH', keywords}},
    );
    return (response.data.bestMatches ?? []).map(match => ({
      symbol: match['1. symbol'],
      name: match['2. name'],
      type: match['3. type'],
      region: match['4. region'],
      currency: match['8. currency'],
    }));
  });
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
