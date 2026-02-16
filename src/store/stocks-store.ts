import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {fetchGlobalQuote, fetchBulkQuotes} from '@/services/stock-service';
import type {StockQuote, Watchlist} from '@/types/stock';

const CACHE_MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const DEFAULT_WATCHLIST: Watchlist = {
  id: 'default',
  name: 'My Watchlist',
  symbols: [],
  createdAt: new Date().toISOString(),
};

interface StocksState {
  watchlists: Watchlist[];
  activeWatchlistId: string;
  quotes: Record<string, StockQuote>;
  lastFetchedAt: number | null;
  isLoading: boolean;
  error: string | null;
  createWatchlist: (name: string) => void;
  deleteWatchlist: (id: string) => void;
  renameWatchlist: (id: string, name: string) => void;
  addSymbol: (watchlistId: string, symbol: string) => void;
  removeSymbol: (watchlistId: string, symbol: string) => void;
  setActiveWatchlist: (id: string) => void;
  fetchQuotes: (force?: boolean) => Promise<void>;
  fetchStockDetail: (symbol: string) => Promise<StockQuote>;
}

export const useStocksStore = create<StocksState>()(
  persist(
    (set, get) => ({
      watchlists: [DEFAULT_WATCHLIST],
      activeWatchlistId: 'default',
      quotes: {},
      lastFetchedAt: null,
      isLoading: false,
      error: null,

      createWatchlist: (name: string) => {
        const newList: Watchlist = {
          id: generateId(),
          name,
          symbols: [],
          createdAt: new Date().toISOString(),
        };
        set(state => ({watchlists: [...state.watchlists, newList]}));
      },

      deleteWatchlist: (id: string) =>
        set(state => {
          const filtered = state.watchlists.filter(w => w.id !== id);
          const activeId =
            state.activeWatchlistId === id
              ? filtered[0]?.id ?? ''
              : state.activeWatchlistId;
          return {watchlists: filtered, activeWatchlistId: activeId};
        }),

      renameWatchlist: (id: string, name: string) =>
        set(state => ({
          watchlists: state.watchlists.map(w =>
            w.id === id ? {...w, name} : w,
          ),
        })),

      addSymbol: (watchlistId: string, symbol: string) =>
        set(state => ({
          watchlists: state.watchlists.map(w =>
            w.id === watchlistId && !w.symbols.includes(symbol)
              ? {...w, symbols: [...w.symbols, symbol]}
              : w,
          ),
        })),

      removeSymbol: (watchlistId: string, symbol: string) =>
        set(state => ({
          watchlists: state.watchlists.map(w =>
            w.id === watchlistId
              ? {...w, symbols: w.symbols.filter(s => s !== symbol)}
              : w,
          ),
        })),

      setActiveWatchlist: (id: string) => set({activeWatchlistId: id}),

      fetchQuotes: async (force = false) => {
        const {watchlists, activeWatchlistId, lastFetchedAt, quotes} = get();
        const activeList = watchlists.find(w => w.id === activeWatchlistId);
        if (!activeList || activeList.symbols.length === 0) {
          return;
        }

        const hasCache =
          lastFetchedAt &&
          activeList.symbols.every(s => quotes[s]) &&
          Date.now() - lastFetchedAt < CACHE_MAX_AGE_MS;

        if (!force && hasCache) {
          return;
        }

        set({isLoading: true, error: null});
        try {
          const fetched = await fetchBulkQuotes(activeList.symbols);
          const quotesMap: Record<string, StockQuote> = {...get().quotes};
          for (const quote of fetched) {
            quotesMap[quote.symbol] = quote;
          }
          set({quotes: quotesMap, lastFetchedAt: Date.now(), isLoading: false});
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch quotes',
            isLoading: false,
          });
        }
      },

      fetchStockDetail: async (symbol: string) => {
        const quote = await fetchGlobalQuote(symbol);
        set(state => ({
          quotes: {...state.quotes, [symbol]: quote},
        }));
        return quote;
      },
    }),
    {
      name: 'stocks-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        watchlists: state.watchlists,
        activeWatchlistId: state.activeWatchlistId,
        quotes: state.quotes,
        lastFetchedAt: state.lastFetchedAt,
      }),
    },
  ),
);
