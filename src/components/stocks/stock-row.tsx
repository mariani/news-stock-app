import React, {useCallback} from 'react';
import {Linking, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {PriceChange} from './price-change';
import {formatCurrency} from '@/utils/format-currency';
import {colors, spacing, fontSize} from '@/constants/theme';
import type {Recommendation, StockQuote} from '@/types/stock';

interface Props {
  symbol: string;
  exchange?: string;
  quote?: StockQuote;
  recommendation?: Recommendation;
  onPress: () => void;
}

export function StockRow({symbol, exchange, quote, recommendation, onPress}: Props) {
  const handleTickerPress = useCallback(() => {
    const suffix = exchange ? `:${exchange}` : '';
    Linking.openURL(`https://www.google.com/finance/quote/${symbol}${suffix}`);
  }, [symbol, exchange]);

  return (
    <TouchableOpacity onPress={onPress} style={styles.row}>
      <View style={styles.left}>
        <View style={styles.symbolRow}>
          <TouchableOpacity onPress={handleTickerPress}>
            <Text style={styles.symbol}>{symbol}</Text>
          </TouchableOpacity>
          {recommendation ? (
            <View style={[styles.badge, recommendation === 'BUY' ? styles.badgeBuy : styles.badgeHold]}>
              <Text style={[styles.badgeText, recommendation === 'BUY' ? styles.badgeTextBuy : styles.badgeTextHold]}>
                {recommendation}
              </Text>
            </View>
          ) : null}
        </View>
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
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badge: {
    borderRadius: 4,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  badgeBuy: {
    backgroundColor: '#D4F5DC',
  },
  badgeHold: {
    backgroundColor: colors.background,
  },
  badgeText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  badgeTextBuy: {
    color: colors.positive,
  },
  badgeTextHold: {
    color: colors.textSecondary,
  },
  right: {
    alignItems: 'flex-end',
  },
  symbol: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.primary,
    textDecorationLine: 'underline',
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
