import React, {useCallback, useEffect, useState} from 'react';
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useStocksStore} from '@/store/stocks-store';
import {useSettingsStore} from '@/store/settings-store';
import {useRefreshInterval} from '@/hooks/use-refresh-interval';
import {StockRow} from '@/components/stocks/stock-row';
import {SymbolSearch} from '@/components/stocks/symbol-search';
import {WatchlistPicker} from '@/components/stocks/watchlist-picker';
import {ErrorBanner} from '@/components/common/error-banner';
import {EmptyState} from '@/components/common/empty-state';
import {colors, spacing, fontSize} from '@/constants/theme';
import type {StocksStackParamList} from '@/navigation/types';

type Props = NativeStackScreenProps<StocksStackParamList, 'Watchlist'>;

export function WatchlistScreen({navigation}: Props) {
  const [searchVisible, setSearchVisible] = useState(false);

  const watchlists = useStocksStore(s => s.watchlists);
  const activeWatchlistId = useStocksStore(s => s.activeWatchlistId);
  const quotes = useStocksStore(s => s.quotes);
  const isLoading = useStocksStore(s => s.isLoading);
  const error = useStocksStore(s => s.error);
  const fetchQuotes = useStocksStore(s => s.fetchQuotes);
  const addSymbol = useStocksStore(s => s.addSymbol);
  const removeSymbol = useStocksStore(s => s.removeSymbol);
  const refreshInterval = useSettingsStore(s => s.refreshIntervalSeconds);

  const activeList = watchlists.find(w => w.id === activeWatchlistId);
  const symbols = activeList?.symbols ?? [];

  useEffect(() => {
    if (symbols.length > 0) {
      fetchQuotes();
    }
  }, [symbols.length, fetchQuotes]);

  useRefreshInterval(fetchQuotes, refreshInterval * 1000);

  const handleAddSymbol = useCallback(
    (symbol: string) => {
      addSymbol(activeWatchlistId, symbol);
      setSearchVisible(false);
    },
    [activeWatchlistId, addSymbol],
  );

  const handleRemoveSymbol = useCallback(
    (symbol: string) => {
      Alert.alert('Remove Stock', `Remove ${symbol} from watchlist?`, [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeSymbol(activeWatchlistId, symbol),
        },
      ]);
    },
    [activeWatchlistId, removeSymbol],
  );

  const renderItem = useCallback(
    ({item}: {item: string}) => (
      <StockRow
        symbol={item}
        quote={quotes[item]}
        onPress={() => navigation.navigate('StockDetail', {symbol: item})}
      />
    ),
    [quotes, navigation],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <WatchlistPicker />
      </View>

      {error && <ErrorBanner message={error} onRetry={fetchQuotes} />}

      <FlatList
        data={symbols}
        keyExtractor={item => item}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchQuotes} />
        }
        ListEmptyComponent={
          <EmptyState
            title="No stocks yet"
            subtitle="Tap + to add stocks to your watchlist"
          />
        }
        contentContainerStyle={symbols.length === 0 && styles.emptyList}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setSearchVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={searchVisible} animationType="slide">
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setSearchVisible(false)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Add Stock</Text>
          <View style={styles.spacer} />
        </View>
        <SymbolSearch onSelect={handleAddSymbol} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  emptyList: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '300',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  cancelText: {
    fontSize: fontSize.lg,
    color: colors.primary,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  spacer: {
    width: 60,
  },
});
