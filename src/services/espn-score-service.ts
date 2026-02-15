import type {
  EspnScoreboardResponse,
  EspnCompetition,
  LiveGame,
} from '@/types/live-score';

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports';

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
  comp: EspnCompetition,
  league: string,
): LiveGame {
  const home = comp.competitors.find(c => c.homeAway === 'home')!;
  const away = comp.competitors.find(c => c.homeAway === 'away')!;

  return {
    id: eventId,
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

async function fetchLeagueScoreboard(
  sportLeague: string,
  leagueName: string,
): Promise<LiveGame[]> {
  const response = await fetch(`${ESPN_BASE}/${sportLeague}/scoreboard`);
  if (!response.ok) {
    return [];
  }

  const data: EspnScoreboardResponse = await response.json();

  return data.events.flatMap(event =>
    event.competitions.map(comp => mapCompetition(event.id, comp, leagueName)),
  );
}

export async function fetchAllLiveScores(): Promise<LiveGame[]> {
  const results = await Promise.all(
    LEAGUES.map(([path, name]) =>
      fetchLeagueScoreboard(path, name).catch(() => [] as LiveGame[]),
    ),
  );

  return results.flat();
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
