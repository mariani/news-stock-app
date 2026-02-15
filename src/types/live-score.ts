export interface LiveGame {
  id: string;
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
