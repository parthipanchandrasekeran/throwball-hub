// ArcadeBlast brand constants + Play Store URL builder.
// Centralized so we can change the package id, copy, or tracking once.

export const ARCADEBLAST = {
  name:        'ArcadeBlast',
  subtitle:    'Shockwave Arena',
  tagline:     'Dodge · Blast · Combo · Survive',
  shortBlurb:  'Free on Android · iPhone coming soon',
  packageId:   'com.arcadeblast.game',
} as const;

/**
 * Build a Play Store URL with attribution. Play Store reads UTM params
 * from a URL-encoded `referrer=` query string (NOT direct utm_* params),
 * which surfaces them in Play Console > Acquisition reports.
 */
export function playStoreUrl(medium: 'nav-cta' | 'break-card' | 'footer'): string {
  const ref = `utm_source=throwball-hub&utm_medium=${medium}&utm_campaign=may2026`;
  return `https://play.google.com/store/apps/details?id=${ARCADEBLAST.packageId}&referrer=${encodeURIComponent(ref)}`;
}
