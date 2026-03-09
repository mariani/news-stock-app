import {useState, useEffect, useRef, useCallback} from 'react';
import {useIsFocused} from '@react-navigation/native';
import {fetchAllLiveScores} from '@/services/espn-score-service';
import type {LiveGame} from '@/types/live-score';

const POLL_INTERVAL_MS = 30_000;

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

// Keep all live games + only the next upcoming game per configured team, sorted by date.
function selectGamesToShow(allGames: LiveGame[], teams: string[]): LiveGame[] {
  const live = allGames.filter(
    g => g.state === 'in' && matchesTeams(g, teams),
  );

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

  // Sort the selected upcoming games by date
  nextPerTeam.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return [...live, ...nextPerTeam];
}

export function useLiveScores(teams: string[]): {liveGames: LiveGame[]} {
  const [liveGames, setLiveGames] = useState<LiveGame[]>([]);
  const isFocused = useIsFocused();
  const teamsRef = useRef(teams);

  useEffect(() => {
    teamsRef.current = teams;
  }, [teams]);

  const refresh = useCallback(async () => {
    if (teamsRef.current.length === 0) {
      setLiveGames([]);
      return;
    }
    try {
      const allGames = await fetchAllLiveScores();
      setLiveGames(selectGamesToShow(allGames, teamsRef.current));
    } catch {
      setLiveGames([]);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [teams, refresh]);

  useEffect(() => {
    if (!isFocused || teams.length === 0) {
      return;
    }

    const id = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isFocused, teams.length, refresh]);

  return {liveGames};
}
