export type Division = 'gold' | 'bronze';

export type Team = {
  id: number;
  name: string;
  short_name: string | null;
  color: string;
  /** Optional path/URL to a square team logo. NULL → fall back to colored bar/dot. */
  logo_url: string | null;
  division: Division;
};

export type Referee = { id: number; name: string };

export type MatchStage = 'group' | 'qf' | 'sf' | 'final' | 'third_place';
export type MatchStatus = 'scheduled' | 'live' | 'done';
export type SlotKind = 'play' | 'break';
/** Identifies a knockout match within its division. NULL for group matches. */
export type BracketKey = 'QF1' | 'QF2' | 'SF1' | 'SF2' | 'FINAL' | 'THIRD';

export type Match = {
  id: number;
  court: number;
  division: Division;
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
  bracket_key: BracketKey | null;
  stage_label: string | null;
  referee: { name: string } | null;
  /** Team on line-referee duty for this match (group stage). */
  line_ref_team: Team | null;
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
  logo_url: string | null;
  division: Division;
  /** MP — Matches Played */
  played: number;
  /** W */
  won: number;
  /** L */
  lost: number;
  /** F — Sets For */
  sets_won: number;
  /** A — Sets Against */
  sets_lost: number;
  /** D — Sets Difference */
  sets_diff: number;
  pf: number;
  pa: number;
  /** PD — Points Difference */
  diff: number;
  /** P */
  points: number;
  /** EP — Extras Points (reserved for future scoring rules) */
  extra_points: number;
};
