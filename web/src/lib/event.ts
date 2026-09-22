// Single source of truth for the current tournament's identity and date.
// Header, countdown, page metadata and the "Match Day" kickers all read
// from here, so loading the next event is a one-file change.
export const EVENT = {
  /** Kicker above the hero title. */
  season: 'Season 2026',
  /** Hero title, two lines; the second line is highlighted in red. */
  titleLines: ['TFC Throwball', 'Tournament'] as const,
  name: 'TFC Throwball Tournament',
  /** Shown in the top bar and page metadata. */
  dateLabel: 'Sat 26 Sept 2026',
  kicker: 'Match Day · 26 Sept',
  /**
   * Epoch ms of first serve: 26 Sept 2026, 9:00 AM Toronto (EDT, UTC-4)
   * == 13:00 UTC. Set to null to hide the countdown.
   */
  startsAt: Date.UTC(2026, 8, 26, 13, 0, 0) as number | null,
  teams: 10,
  matches: 30,
  courts: 3,
};
