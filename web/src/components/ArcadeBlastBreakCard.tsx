import Image from 'next/image';
import { ARCADEBLAST, playStoreUrl } from '@/lib/arcadeblast';
import { formatTime } from '@/lib/format';

/**
 * Sponsored card shown in place of the 12:35–1:00 break row.
 * One responsive layout that works inside the desktop schedule table
 * (when wrapped in a colspan cell) and inside the mobile slot stack.
 */
export function ArcadeBlastBreakCard({
  startTime, endTime, durationMin = 25,
}: { startTime: string; endTime: string; durationMin?: number }) {
  return (
    <a
      href={playStoreUrl('break-card')}
      target="_blank"
      rel="noopener sponsored"
      aria-label="Get ArcadeBlast on Google Play"
      className="ab-break group block rounded-xl px-4 sm:px-5 py-4 transition-transform active:scale-[0.998] sm:hover:scale-[1.005]"
    >
      <div className="flex items-center gap-3 sm:gap-5">
        <Image
          src="/ab-icon.png"
          alt=""
          width={64}
          height={64}
          className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-1">
            <span className="text-[10px] uppercase tracking-widest font-bold text-ab-neon">
              ⏸ Lunch break · {formatTime(startTime)}–{formatTime(endTime)}
            </span>
            <span className="hidden sm:inline text-[11px] text-ink-300 font-semibold">— while you wait</span>
          </div>
          <div className="display text-base sm:text-2xl font-bold leading-tight text-ink-50">
            {ARCADEBLAST.name}<span className="hidden sm:inline"> — </span>
            <span className="block sm:inline ab-gradient-text">
              {ARCADEBLAST.subtitle}
            </span>
          </div>
          <div className="text-[11px] sm:text-xs text-ink-100 mt-1 truncate">
            {ARCADEBLAST.tagline} · <span className="text-ink-300">{ARCADEBLAST.shortBlurb}</span>
          </div>
        </div>
        <div className="hidden sm:flex flex-col items-end gap-1.5 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/google-play-badge.svg" alt="Get it on Google Play" width={135} height={40} className="h-10 w-auto" />
        </div>
      </div>
      {/* Mobile-only Play badge row, kept aligned to the schedule edge */}
      <div className="sm:hidden mt-3 pt-3 border-t border-white/5 flex items-center justify-between gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/google-play-badge.svg" alt="Get it on Google Play" width={135} height={40} className="h-9 w-auto" />
        <span className="text-[9px] uppercase tracking-widest text-ink-300 font-semibold">{durationMin} min · free</span>
      </div>
    </a>
  );
}
