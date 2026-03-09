export interface LiveGame {
  id: string;
  date: string; // ISO 8601, e.g. "2026-03-10T00:00Z"
  homeTeam: string;
  awayTeam: string;
  homeScore: string;
  awayScore: string;
  displayClock: string;
  statusDetail: string;
  state: 'pre' | 'in' | 'post';
  league: string;
}

export interface EspnScoreboardResponse {
  events: EspnEvent[];
}

export interface EspnEvent {
  id: string;
  date: string;
  competitions: EspnCompetition[];
}

export interface EspnCompetition {
  competitors: EspnCompetitor[];
  status: {
    displayClock: string;
    type: {
      state: 'pre' | 'in' | 'post';
      detail: string;
    };
  };
}

export interface EspnCompetitor {
  homeAway: 'home' | 'away';
  score: string;
  team: {
    displayName: string;
  };
}
