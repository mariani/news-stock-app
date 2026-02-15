import {useState, useEffect, useRef, useCallback} from 'react';
import {useIsFocused} from '@react-navigation/native';
import {fetchAllLiveScores} from '@/services/espn-score-service';
import type {LiveGame} from '@/types/live-score';

const POLL_INTERVAL_MS = 30_000;

function matchesTeams(game: LiveGame, teams: string[]): boolean {
  const h = game.homeTeam.toLowerCase();
  const a = game.awayTeam.toLowerCase();
  return teams.some(t => {
    const lt = t.toLowerCase();
    return h.includes(lt) || a.includes(lt);
  });
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
      const matched = allGames.filter(g => matchesTeams(g, teamsRef.current));
      setLiveGames(matched);
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
