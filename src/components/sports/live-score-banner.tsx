import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useNewsStore} from '@/store/news-store';
import {useLiveScores} from '@/hooks/use-live-scores';
import {ScoreRow} from './score-row';
import {colors, spacing, fontSize} from '@/constants/theme';

export function LiveScoreBanner() {
  const sportsTeams = useNewsStore(s => s.sportsTeams);
  const {liveGames} = useLiveScores(sportsTeams);

  if (liveGames.length === 0) {
    return null;
  }

  const hasLive = liveGames.some(g => g.state === 'in');
  const hasUpcoming = liveGames.some(g => g.state === 'pre');
  const label = hasLive ? 'LIVE' : hasUpcoming ? 'UPCOMING' : 'FINAL';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {hasLive && <View style={styles.liveDot} />}
        <Text style={[styles.headerText, !hasLive && styles.headerTextPre]}>
          {label}
        </Text>
      </View>
      {liveGames.map(game => (
        <ScoreRow key={game.id} game={game} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.negative,
    marginRight: spacing.xs,
  },
  headerText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.negative,
    letterSpacing: 1,
  },
  headerTextPre: {
    color: colors.textSecondary,
  },
});
