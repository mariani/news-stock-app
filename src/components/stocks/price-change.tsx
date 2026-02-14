import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {formatChange, formatChangePercent} from '@/utils/format-currency';
import {colors, fontSize} from '@/constants/theme';

interface Props {
  change: number;
  changePercent: number;
}

export function PriceChange({change, changePercent}: Props) {
  const isPositive = change >= 0;
  const color = isPositive ? colors.positive : colors.negative;
  const arrow = isPositive ? '\u25B2' : '\u25BC';

  return (
    <View style={styles.container}>
      <Text style={[styles.text, {color}]}>
        {arrow} {formatChange(change)} ({formatChangePercent(changePercent)})
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: fontSize.md,
    fontWeight: '500',
  },
});
