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
