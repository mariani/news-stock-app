import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useStocksStore} from '@/store/stocks-store';
import {PriceChange} from '@/components/stocks/price-change';
import {LoadingSpinner} from '@/components/common/loading-spinner';
import {formatCurrency} from '@/utils/format-currency';
import {timeAgo} from '@/utils/format-date';
import {colors, spacing, fontSize} from '@/constants/theme';
import type {StocksStackParamList} from '@/navigation/types';

type Props = NativeStackScreenProps<StocksStackParamList, 'StockDetail'>;

function DetailRow({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export function StockDetailScreen({route}: Props) {
  const {symbol} = route.params;
  const quotes = useStocksStore(s => s.quotes);
  const fetchStockDetail = useStocksStore(s => s.fetchStockDetail);
  const [loading, setLoading] = useState(!quotes[symbol]);

  useEffect(() => {
    fetchStockDetail(symbol).finally(() => setLoading(false));
  }, [symbol, fetchStockDetail]);

  const quote = quotes[symbol];

  if (loading && !quote) {
    return <LoadingSpinner />;
  }

  if (!quote) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Unable to load quote for {symbol}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.priceSection}>
        <Text style={styles.price}>{formatCurrency(quote.price)}</Text>
        <PriceChange
          change={quote.change}
          changePercent={quote.changePercent}
        />
        <Text style={styles.lastUpdated}>
          Updated {timeAgo(quote.lastUpdated)}
        </Text>
      </View>

      <View style={styles.details}>
        <DetailRow label="Previous Close" value={formatCurrency(quote.previousClose)} />
        <DetailRow label="Day High" value={formatCurrency(quote.high)} />
        <DetailRow label="Day Low" value={formatCurrency(quote.low)} />
        <DetailRow label="Volume" value={quote.volume.toLocaleString()} />
      </View>

      <View style={styles.chartPlaceholder}>
        <Text style={styles.chartText}>Chart coming soon</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  priceSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.surface,
  },
  price: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
  },
  lastUpdated: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  details: {
    backgroundColor: colors.surface,
    marginTop: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  chartPlaceholder: {
    backgroundColor: colors.surface,
    marginTop: spacing.sm,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  chartText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: fontSize.lg,
    color: colors.negative,
    textAlign: 'center',
    padding: spacing.xl,
  },
});
