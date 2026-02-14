import React, {useState} from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';
import {useStocksStore} from '@/store/stocks-store';
import {colors, spacing, fontSize} from '@/constants/theme';

export function WatchlistPicker() {
  const [visible, setVisible] = useState(false);
  const watchlists = useStocksStore(s => s.watchlists);
  const activeWatchlistId = useStocksStore(s => s.activeWatchlistId);
  const setActiveWatchlist = useStocksStore(s => s.setActiveWatchlist);

  const activeList = watchlists.find(w => w.id === activeWatchlistId);

  return (
    <>
      <TouchableOpacity onPress={() => setVisible(true)} style={styles.trigger}>
        <Text style={styles.triggerText}>{activeList?.name ?? 'Watchlist'}</Text>
        <Text style={styles.arrow}>{'\u25BC'}</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}>
          <View style={styles.dropdown}>
            <FlatList
              data={watchlists}
              keyExtractor={item => item.id}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.id === activeWatchlistId && styles.optionActive,
                  ]}
                  onPress={() => {
                    setActiveWatchlist(item.id);
                    setVisible(false);
                  }}>
                  <Text
                    style={[
                      styles.optionText,
                      item.id === activeWatchlistId && styles.optionTextActive,
                    ]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  triggerText: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  arrow: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    width: '70%',
    maxHeight: 300,
    overflow: 'hidden',
  },
  option: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  optionActive: {
    backgroundColor: colors.background,
  },
  optionText: {
    fontSize: fontSize.lg,
    color: colors.text,
  },
  optionTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});
