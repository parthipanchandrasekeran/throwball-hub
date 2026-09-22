import { supabase } from './supabase';
import type { Division, Slot, StandingsRow } from './types';

const TEAM_FIELDS = 'id, name, short_name, color, logo_url, division';

const SLOT_QUERY = `
  id,
  display_order,
  start_time,
  end_time,
  kind,
  bye_label,
  bye_team:teams!bye_team_id ( ${TEAM_FIELDS} ),
  matches (
    id,
    court,
    division,
    score_a, score_b,
    set1_a, set1_b,
    set2_a, set2_b,
    set3_a, set3_b,
    status,
    stage,
    bracket_key,
    stage_label,
    referee:referees ( name ),
    line_ref_team:teams!line_ref_team_id ( ${TEAM_FIELDS} ),
    team_a:teams!team_a_id ( ${TEAM_FIELDS} ),
    team_b:teams!team_b_id ( ${TEAM_FIELDS} )
  )
`;

export async function getSlots(): Promise<Slot[]> {
  const { data, error } = await supabase
    .from('slots')
    .select(SLOT_QUERY)
    .order('display_order');

  if (error) throw new Error(`Failed to load slots: ${error.message}`);

  // Sort matches within each slot by court so Court 1 always appears first.
  const slots = (data ?? []) as unknown as Slot[];
  for (const s of slots) s.matches.sort((a, b) => a.court - b.court);
  return slots;
}

export async function getStandings(): Promise<StandingsRow[]> {
  const { data, error } = await supabase
    .from('standings')
    .select('*');

  if (error) throw new Error(`Failed to load standings: ${error.message}`);

  // Tiebreakers: total Points → Wins → Sets Difference → Points Difference → name.
  return (data ?? []).sort((a, b) => {
    if (b.points    !== a.points)    return b.points    - a.points;
    if (b.won       !== a.won)       return b.won       - a.won;
    if (b.sets_diff !== a.sets_diff) return b.sets_diff - a.sets_diff;
    if (b.diff      !== a.diff)      return b.diff      - a.diff;
    return a.name.localeCompare(b.name);
  });
}

/** Render order for the two divisions. */
export const DIVISIONS: Division[] = ['gold', 'bronze'];

/** Splits any division-tagged rows (standings, matches, teams) into one list per division, order preserved. */
export function byDivision<T extends { division: Division }>(rows: T[]): Record<Division, T[]> {
  return {
    gold:   rows.filter(r => r.division === 'gold'),
    bronze: rows.filter(r => r.division === 'bronze'),
  };
}

export type MatchSummary = {
  total: number;
  done: number;
  groupTotal: number;
  groupDone: number;
};

export function summarizeMatches(slots: Slot[]): MatchSummary {
  let total = 0, done = 0, groupTotal = 0, groupDone = 0;
  for (const s of slots) {
    for (const m of s.matches) {
      total++;
      if (m.status === 'done') done++;
      if (m.stage === 'group') {
        groupTotal++;
        if (m.status === 'done') groupDone++;
      }
    }
  }
  return { total, done, groupTotal, groupDone };
}
