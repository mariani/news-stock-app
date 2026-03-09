import {useState, useEffect, useRef, useCallback} from 'react';
import {useIsFocused} from '@react-navigation/native';
import {fetchAllLiveScores, fetchAllPastScores} from '@/services/espn-score-service';
import type {LiveGame} from '@/types/live-score';

const POLL_INTERVAL_MS = 30_000;
const RECENT_CUTOFF_MS = 48 * 60 * 60 * 1000; // 48 hours

function teamInGame(game: LiveGame, team: string): boolean {
  const lt = team.toLowerCase();
  return (
    game.homeTeam.toLowerCase().includes(lt) ||
    game.awayTeam.toLowerCase().includes(lt)
  );
}

function matchesTeams(game: LiveGame, teams: string[]): boolean {
  return teams.some(t => teamInGame(game, t));
}

// Live games + recent finals (last 48h) + next upcoming per team, sorted by date.
function selectGamesToShow(allGames: LiveGame[], teams: string[]): LiveGame[] {
  const now = Date.now();

  const live = allGames.filter(
    g => g.state === 'in' && matchesTeams(g, teams),
  );

  // Finished games from the last 48 hours, most recent first
  const recentFinal = allGames
    .filter(
      g =>
        g.state === 'post' &&
        matchesTeams(g, teams) &&
        now - new Date(g.date).getTime() <= RECENT_CUTOFF_MS,
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const upcoming = allGames
    .filter(g => g.state === 'pre' && matchesTeams(g, teams))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // For each team pick their next (earliest) upcoming game
  const seen = new Set<string>();
  const nextPerTeam: LiveGame[] = [];
  for (const team of teams) {
    const next = upcoming.find(g => teamInGame(g, team) && !seen.has(g.id));
    if (next) {
      seen.add(next.id);
      nextPerTeam.push(next);
    }
  }

  nextPerTeam.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return [...live, ...recentFinal, ...nextPerTeam];
}

export function useLiveScores(teams: string[]): {liveGames: LiveGame[]} {
  const [liveGames, setLiveGames] = useState<LiveGame[]>([]);
  const isFocused = useIsFocused();
  const teamsRef = useRef(teams);
  const pastGamesRef = useRef<LiveGame[]>([]);

  useEffect(() => {
    teamsRef.current = teams;
  }, [teams]);

  const refresh = useCallback(async () => {
    if (teamsRef.current.length === 0) {
      setLiveGames([]);
      return;
    }
    try {
      const liveGamesData = await fetchAllLiveScores();
      // Merge with cached past games, skipping any IDs already in the live feed
      const liveIds = new Set(liveGamesData.map(g => g.id));
      const past = pastGamesRef.current.filter(g => !liveIds.has(g.id));
      setLiveGames(selectGamesToShow([...liveGamesData, ...past], teamsRef.current));
    } catch {
      setLiveGames([]);
    }
  }, []);

  useEffect(() => {
    if (teams.length === 0) {
      setLiveGames([]);
      pastGamesRef.current = [];
      return;
    }
    // Fetch yesterday's completed games first (sequentially before live polling
    // to avoid concurrent requests hitting the codetabs proxy rate limit)
    fetchAllPastScores()
      .then(past => {
        pastGamesRef.current = past;
      })
      .catch(() => {
        pastGamesRef.current = [];
      })
      .finally(() => {
        refresh();
      });
  }, [teams.length, refresh]);

  useEffect(() => {
    if (!isFocused || teams.length === 0) {
      return;
    }

    const id = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isFocused, teams.length, refresh]);

  return {liveGames};
}
