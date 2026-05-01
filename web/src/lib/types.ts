export type Team = {
  id: number;
  name: string;
  short_name: string | null;
  color: string;
};

export type Referee = { id: number; name: string };

export type MatchStage = 'group' | 'sf' | 'final' | 'third_place';
export type MatchStatus = 'scheduled' | 'done';
export type SlotKind = 'play' | 'break';

export type Match = {
  id: number;
  court: number;
  /** Sets won by team A (0, 1, or 2). */
  score_a: number | null;
  /** Sets won by team B (0, 1, or 2). */
  score_b: number | null;
  set1_a: number | null;
  set1_b: number | null;
  set2_a: number | null;
  set2_b: number | null;
  set3_a: number | null;
  set3_b: number | null;
  status: MatchStatus;
  stage: MatchStage;
  stage_label: string | null;
  referee: { name: string } | null;
  team_a: Team | null;
  team_b: Team | null;
};

export type Slot = {
  id: number;
  display_order: number;
  start_time: string;
  end_time: string;
  kind: SlotKind;
  bye_label: string | null;
  bye_team: Team | null;
  matches: Match[];
};

export type StandingsRow = {
  team_id: number;
  name: string;
  color: string;
  short_name: string | null;
  played: number;
  won: number;
  lost: number;
  sets_won: number;
  sets_lost: number;
  pf: number;
  pa: number;
  diff: number;
  points: number;
};
