import React, {useCallback, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {searchSymbol} from '@/services/stock-service';
import {useDebounce} from '@/hooks/use-debounce';
import {colors, spacing, fontSize} from '@/constants/theme';
import type {SymbolSearchResult} from '@/types/stock';

interface Props {
  onSelect: (symbol: string) => void;
}

export function SymbolSearch({onSelect}: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SymbolSearchResult[]>([]);
  const debouncedQuery = useDebounce(query, 500);

  React.useEffect(() => {
    if (debouncedQuery.length < 1) {
      setResults([]);
      return;
    }

    searchSymbol(debouncedQuery).then(setResults).catch(() => setResults([]));
  }, [debouncedQuery]);

  const renderResult = useCallback(
    ({item}: {item: SymbolSearchResult}) => (
      <TouchableOpacity
        style={styles.resultRow}
        onPress={() => onSelect(item.symbol)}>
        <Text style={styles.resultSymbol}>{item.symbol}</Text>
        <Text style={styles.resultName} numberOfLines={1}>
          {item.name}
        </Text>
      </TouchableOpacity>
    ),
    [onSelect],
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search stocks (e.g. AAPL)"
        placeholderTextColor={colors.textSecondary}
        value={query}
        onChangeText={setQuery}
        autoCapitalize="characters"
        autoCorrect={false}
      />
      <FlatList
        data={results}
        keyExtractor={item => item.symbol}
        renderItem={renderResult}
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={
          debouncedQuery.length > 0 &&
          !results.some(
            r => r.symbol.toLowerCase() === debouncedQuery.toLowerCase(),
          ) ? (
            <TouchableOpacity
              style={[styles.resultRow, styles.directRow]}
              onPress={() => onSelect(debouncedQuery.toUpperCase())}>
              <Text style={styles.resultSymbol}>
                {debouncedQuery.toUpperCase()}
              </Text>
              <Text style={styles.resultName}>Add directly</Text>
            </TouchableOpacity>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  input: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    color: colors.text,
  },
  hint: {
    padding: spacing.md,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  resultSymbol: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    width: 80,
  },
  resultName: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    flex: 1,
  },
  directRow: {
    opacity: 0.7,
  },
});
