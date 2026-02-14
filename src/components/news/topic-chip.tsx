import React from 'react';
import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import {colors, spacing, fontSize} from '@/constants/theme';

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function TopicChip({label, selected, onPress}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    backgroundColor: colors.background,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  labelSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
