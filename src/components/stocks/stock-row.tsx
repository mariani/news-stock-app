import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {PriceChange} from './price-change';
import {formatCurrency} from '@/utils/format-currency';
import {colors, spacing, fontSize} from '@/constants/theme';
import type {StockQuote} from '@/types/stock';

interface Props {
  symbol: string;
  quote?: StockQuote;
  onPress: () => void;
}

export function StockRow({symbol, quote, onPress}: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.symbol}>{symbol}</Text>
      </View>
      <View style={styles.right}>
        {quote ? (
          <>
            <Text style={styles.price}>{formatCurrency(quote.price)}</Text>
            <PriceChange
              change={quote.change}
              changePercent={quote.changePercent}
            />
          </>
        ) : (
          <Text style={styles.loading}>Loading...</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  left: {
    flex: 1,
  },
  right: {
    alignItems: 'flex-end',
  },
  symbol: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  price: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  loading: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
});
