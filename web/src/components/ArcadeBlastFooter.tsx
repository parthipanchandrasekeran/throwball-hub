import Image from 'next/image';
import { ARCADEBLAST, playStoreUrl } from '@/lib/arcadeblast';

/**
 * Slim brand strip rendered below the throwball footer.
 * Tasteful attribution + Play Store entry point.
 */
export function ArcadeBlastFooter() {
  return (
    <div className="ab-footer-strip">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <a
          href={playStoreUrl('footer')}
          target="_blank"
          rel="noopener sponsored"
          className="flex items-center gap-3 group"
          aria-label="ArcadeBlast on Google Play"
        >
          <Image src="/ab-icon.png" alt="" width={36} height={36} className="w-9 h-9 rounded-lg shrink-0" />
          <div className="text-xs text-center sm:text-left">
            <div className="text-ink-100 font-semibold">
              Built by the team behind <span className="ab-gradient-text font-bold">{ARCADEBLAST.name}</span>
            </div>
            <div className="text-ink-300 text-[11px]">
              {ARCADEBLAST.subtitle} · {ARCADEBLAST.shortBlurb}
            </div>
          </div>
        </a>
        <a
          href={playStoreUrl('footer')}
          target="_blank"
          rel="noopener sponsored"
          aria-label="Get ArcadeBlast on Google Play"
          className="shrink-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/google-play-badge.svg" alt="Get it on Google Play" width={135} height={40} className="h-10 w-auto" />
        </a>
      </div>
    </div>
  );
}
