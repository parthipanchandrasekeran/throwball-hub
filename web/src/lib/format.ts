import type { BracketKey, Division, MatchStage } from './types';

export function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour}:${m.toString().padStart(2, '0')}`;
}

/** Whole minutes between two "HH:MM" strings on the same day. */
export function minutesBetween(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}

export const divisionLabel: Record<Division, string> = {
  gold:   'Gold',
  bronze: 'Bronze',
};

export const stageLabel: Record<string, string> = {
  qf: 'Quarter-final',
  sf: 'Semi-final',
  final: 'Final',
  third_place: '3rd Place',
};

/**
 * Heading for a knockout match, e.g. "Gold · Quarter-final 1", "★ Bronze Final".
 * Empty string for group matches so callers can render conditionally.
 */
export function knockoutHeading(m: { division: Division; stage: MatchStage; bracket_key: BracketKey | null }): string {
  if (m.stage === 'group') return '';
  const div = divisionLabel[m.division];
  switch (m.bracket_key) {
    case 'QF1':   return `${div} · Quarter-final 1`;
    case 'QF2':   return `${div} · Quarter-final 2`;
    case 'SF1':   return `${div} · Semi-final 1`;
    case 'SF2':   return `${div} · Semi-final 2`;
    case 'FINAL': return `★ ${div} Final`;
    case 'THIRD': return `${div} · 3rd Place`;
    default:      return `${div} · ${stageLabel[m.stage] ?? m.stage}`;
  }
}

/** Splits a knockout placeholder like "1st vs QF2 winner" into its two sides. */
export function placeholderSides(label: string | null): [string, string] {
  const [a, b] = (label ?? '').split(' vs ');
  return [a || 'TBD', b || 'TBD'];
}

/**
 * Formats the per-set breakdown for a completed match,
 * e.g. "15-12, 13-15, 15-10". Returns null if no sets played.
 */
export function setBreakdown(m: {
  set1_a: number | null; set1_b: number | null;
  set2_a: number | null; set2_b: number | null;
  set3_a: number | null; set3_b: number | null;
}): string | null {
  const parts: string[] = [];
  if (m.set1_a != null && m.set1_b != null) parts.push(`${m.set1_a}–${m.set1_b}`);
  if (m.set2_a != null && m.set2_b != null) parts.push(`${m.set2_a}–${m.set2_b}`);
  if (m.set3_a != null && m.set3_b != null) parts.push(`${m.set3_a}–${m.set3_b}`);
  return parts.length ? parts.join(', ') : null;
}
