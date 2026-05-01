export function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour}:${m.toString().padStart(2, '0')}`;
}

export const stageLabel: Record<string, string> = {
  sf: 'Semi-final',
  final: 'Final',
  third_place: '3rd Place',
};

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
