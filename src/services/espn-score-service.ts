import type {
  EspnScoreboardResponse,
  EspnCompetition,
  LiveGame,
} from '@/types/live-score';
import {CORS_PROXY} from './api-client';

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports';

// ESPN blocks cross-origin browser requests; detect browser context (not RN native)
function inWebBrowser(): boolean {
  return typeof window !== 'undefined' && window.location != null;
}

// TheSportsDB league IDs for soccer — used to fetch past results (ESPN doesn't serve them)
const SPORTSDB_SOCCER_IDS: Partial<Record<string, number>> = {
  'Premier League': 4328,
  'FA Cup': 4529,
  'League Cup': 4514,
  'Champions League': 4480,
  'Europa League': 4481,
  MLS: 4346,
};

const LEAGUES: [string, string][] = [
  ['basketball/nba', 'NBA'],
  ['football/nfl', 'NFL'],
  ['baseball/mlb', 'MLB'],
  ['hockey/nhl', 'NHL'],
  ['soccer/eng.1', 'Premier League'],
  ['soccer/eng.fa', 'FA Cup'],
  ['soccer/eng.league_cup', 'League Cup'],
  ['soccer/uefa.champions', 'Champions League'],
  ['soccer/uefa.europa', 'Europa League'],
  ['soccer/usa.1', 'MLS'],
];

function mapCompetition(
  eventId: string,
  eventDate: string,
  comp: EspnCompetition,
  league: string,
): LiveGame {
  const home = comp.competitors.find(c => c.homeAway === 'home')!;
  const away = comp.competitors.find(c => c.homeAway === 'away')!;

  return {
    id: eventId,
    date: eventDate,
    homeTeam: home.team.displayName,
    awayTeam: away.team.displayName,
    homeScore: home.score,
    awayScore: away.score,
    displayClock: comp.status.displayClock,
    statusDetail: comp.status.type.detail,
    state: comp.status.type.state,
    league,
  };
}

function espnDateRange(): string {
  const today = new Date();
  const future = new Date(today);
  future.setDate(today.getDate() + 7);
  const fmt = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '');
  return `${fmt(today)}-${fmt(future)}`;
}

// ── TheSportsDB ──────────────────────────────────────────────────────────────

interface SportsDbEvent {
  idEvent: string;
  dateEvent: string;  // "YYYY-MM-DD"
  strTime: string;    // "HH:MM:SS+00:00" or "HH:MM:SS"
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
}

interface SportsDbResponse {
  events: SportsDbEvent[] | null;
}

async function fetchSportsDbPast(
  leagueId: number,
  leagueName: string,
): Promise<LiveGame[]> {
  const url = `https://www.thesportsdb.com/api/v1/json/3/eventspastleague.php?id=${leagueId}`;
  const response = await fetch(url, {cache: 'no-store'});
  if (!response.ok) {
    return [];
  }
  const data: SportsDbResponse = await response.json();
  if (!data.events) {
    return [];
  }
  return data.events
    .filter(e => e.intHomeScore != null && e.intAwayScore != null)
    .map(e => {
      // strTime may include timezone offset; strip to bare HH:MM:SS then append Z
      const timeBase = e.strTime.replace(/[+-]\d{2}:\d{2}$/, '');
      return {
        id: `tsdb-${e.idEvent}`,
        date: `${e.dateEvent}T${timeBase}Z`,
        homeTeam: e.strHomeTeam,
        awayTeam: e.strAwayTeam,
        homeScore: e.intHomeScore!,
        awayScore: e.intAwayScore!,
        displayClock: '',
        statusDetail: 'Final',
        state: 'post' as const,
        league: leagueName,
      };
    });
}

// ── ESPN helpers ─────────────────────────────────────────────────────────────

async function fetchLeagueScoreboard(
  sportLeague: string,
  leagueName: string,
): Promise<LiveGame[]> {
  const base = `${ESPN_BASE}/${sportLeague}/scoreboard`;
  const dates = espnDateRange();
  // Fetch a 7-day window so upcoming games (not just today's) appear
  const url = inWebBrowser()
    ? `${CORS_PROXY}${base}%3Fdates%3D${dates}%26_t%3D${Date.now()}`
    : `${base}?dates=${dates}`;

  const response = await fetch(url, {cache: 'no-store'});
  if (!response.ok) {
    return [];
  }

  const data: EspnScoreboardResponse = await response.json();
  return data.events.flatMap(event =>
    event.competitions.map(comp => mapCompetition(event.id, event.date, comp, leagueName)),
  );
}

export async function fetchAllLiveScores(): Promise<LiveGame[]> {
  // Sequential (not parallel) to avoid proxy rate limits
  const results: LiveGame[] = [];
  for (const [path, name] of LEAGUES) {
    try {
      const games = await fetchLeagueScoreboard(path, name);
      results.push(...games);
    } catch {
      // Skip failed leagues silently
    }
  }
  return results;
}

// Fetch recent past scores — called once on mount.
// Soccer leagues use TheSportsDB (ESPN doesn't return historical soccer results).
// Non-soccer leagues use ESPN's default scoreboard (returns today's/recent games).
export async function fetchAllPastScores(): Promise<LiveGame[]> {
  const results: LiveGame[] = [];
  for (const [path, name] of LEAGUES) {
    try {
      const sportsDbId = SPORTSDB_SOCCER_IDS[name];
      if (sportsDbId != null) {
        const games = await fetchSportsDbPast(sportsDbId, name);
        results.push(...games);
      } else {
        // ESPN default scoreboard (no dates) returns the current/most-recent matchday
        const base = `${ESPN_BASE}/${path}/scoreboard`;
        const url = inWebBrowser()
          ? `${CORS_PROXY}${base}%3F_t%3D${Date.now()}`
          : `${base}?_t=${Date.now()}`;
        const response = await fetch(url, {cache: 'no-store'});
        if (response.ok) {
          const data: EspnScoreboardResponse = await response.json();
          const games = (data.events ?? []).flatMap(event =>
            event.competitions.map(comp =>
              mapCompetition(event.id, event.date, comp, name),
            ),
          );
          results.push(...games);
        }
      }
    } catch {
      // Skip failed leagues silently
    }
  }
  return results;
}

export function filterGamesForTeams(
  games: LiveGame[],
  userTeams: string[],
): LiveGame[] {
  if (userTeams.length === 0) {
    return [];
  }
  return games.filter(
    game =>
      teamMatchesAny(game.homeTeam, userTeams) ||
      teamMatchesAny(game.awayTeam, userTeams),
  );
}

function teamMatchesAny(displayName: string, userTeams: string[]): boolean {
  const lowerName = displayName.toLowerCase();
  return userTeams.some(team => lowerName.includes(team.toLowerCase()));
}
