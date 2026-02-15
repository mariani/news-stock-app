import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, spacing, fontSize} from '@/constants/theme';
import type {LiveGame} from '@/types/live-score';

interface Props {
  game: LiveGame;
}

export function ScoreRow({game}: Props) {
  const isLive = game.state === 'in';

  return (
    <View style={styles.row}>
      <View style={styles.teams}>
        <Text style={styles.teamName} numberOfLines={1}>
          {game.awayTeam}
        </Text>
        <Text style={styles.teamName} numberOfLines={1}>
          {game.homeTeam}
        </Text>
      </View>
      {isLive ? (
        <View style={styles.scores}>
          <Text style={styles.score}>{game.awayScore}</Text>
          <Text style={styles.score}>{game.homeScore}</Text>
        </View>
      ) : (
        <Text style={styles.vs}>vs</Text>
      )}
      <View style={styles.status}>
        <Text style={styles.league}>{game.league}</Text>
        <Text style={[styles.clock, !isLive && styles.clockPre]}>
          {game.statusDetail}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  teams: {
    flex: 1,
  },
  teamName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 18,
  },
  scores: {
    width: 32,
    alignItems: 'center',
  },
  score: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 18,
  },
  vs: {
    width: 32,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  status: {
    marginLeft: spacing.md,
    alignItems: 'flex-end',
    minWidth: 80,
  },
  league: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  clock: {
    fontSize: fontSize.sm,
    color: colors.warning,
    fontWeight: '600',
    lineHeight: 16,
  },
  clockPre: {
    color: colors.textSecondary,
    fontWeight: '400',
  },
});
