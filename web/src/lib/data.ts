import { supabase } from './supabase';
import type { Slot, StandingsRow } from './types';

const SLOT_QUERY = `
  id,
  display_order,
  start_time,
  end_time,
  kind,
  bye_label,
  bye_team:teams!bye_team_id ( id, name, short_name, color ),
  matches (
    id,
    court,
    score_a,
    score_b,
    status,
    stage,
    stage_label,
    referee:referees ( name ),
    team_a:teams!team_a_id ( id, name, short_name, color ),
    team_b:teams!team_b_id ( id, name, short_name, color )
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

  // Standard tournament sort: points desc, diff desc, won desc, name asc.
  return (data ?? []).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.diff   !== a.diff)   return b.diff   - a.diff;
    if (b.won    !== a.won)    return b.won    - a.won;
    return a.name.localeCompare(b.name);
  });
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
