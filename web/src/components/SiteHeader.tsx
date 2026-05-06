import Image from 'next/image';
import { NavLinks } from '@/components/NavLinks';
import { playStoreUrl } from '@/lib/arcadeblast';

export function SiteHeader() {
  return (
    <>
      {/* top bar */}
      <div className="sticky top-0 z-30 border-b border-white/5 bg-ink-900/80 backdrop-blur-md sm:bg-ink-900/35">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between text-xs gap-2 sm:gap-3">
          <div className="hidden items-center gap-3 text-ink-200 min-w-0 sm:flex">
            <span className="kicker shrink-0">Live</span>
            <span className="hidden sm:inline truncate">Toronto · Sat 9 May 2026</span>
          </div>
          <div className="flex min-w-0 flex-1 items-center justify-between gap-2 sm:flex-none sm:justify-end">
            <NavLinks />
            <span className="hidden sm:inline-block w-px h-4 bg-white/10 mx-0.5"></span>
            <a
              href={playStoreUrl('nav-cta')}
              target="_blank"
              rel="noopener sponsored"
              aria-label="Get ArcadeBlast on Google Play"
              className="ab-pill px-2.5 sm:px-3 py-2 rounded-md font-bold text-xs flex items-center gap-1.5 shrink-0"
            >
              <span className="hidden sm:inline">Get the App</span>
              <span className="sm:hidden">App</span>
            </a>
          </div>
        </div>
      </div>

      {/* hero — banner card (left) + info column (right) on desktop, stacked on mobile */}
      <header>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-10 pb-5 sm:pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4 sm:gap-6 lg:gap-10 items-center">

            {/* Banner card — TFC + ITF logos and federation wordmark all live inside this artwork */}
            <div className="rounded-lg overflow-hidden shadow-[0_22px_55px_-28px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.08)]">
              <Image
                src="/hero-banner.jpg"
                alt="Throwball Federation of Canada — Aim High, Throw Hard"
                width={1600}
                height={950}
                priority
                unoptimized
                className="w-full h-auto block"
                sizes="(min-width: 1024px) 60vw, 100vw"
              />
            </div>

            {/* Info column */}
            <div className="min-w-0">
              <div className="kicker mb-2 sm:mb-3">Season 2026</div>
              <h1 className="hero-title text-3xl sm:text-5xl lg:text-6xl">
                Women&apos;s National<br />
                <span className="text-brand-red">Championship</span>
              </h1>

              {/* stats */}
              <dl className="mt-4 sm:mt-5 grid grid-cols-4 sm:flex sm:flex-wrap sm:items-center gap-2 sm:gap-x-5 sm:gap-y-3 text-sm text-ink-100">
                <Stat label="Edition" value="2026" gold />
                <Divider />
                <Stat label="Teams"   value="06" />
                <Divider />
                <Stat label="Matches" value="11" />
                <Divider />
                <Stat label="Courts"  value="02" />
              </dl>
            </div>

          </div>
        </div>
        <div className="h-[3px] bg-gradient-to-r from-brand-red via-brand-redDk to-transparent" />
      </header>
    </>
  );
}

function Stat({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div className="flex items-baseline gap-2">
      <dt className="sr-only">{label}</dt>
      <dd className={`num font-bold text-lg ${gold ? 'text-brand-gold' : ''}`}>{value}</dd>
      <span className="text-ink-300 text-xs sm:text-sm">{label}</span>
    </div>
  );
}

function Divider() {
  return <div className="hidden sm:block h-4 w-px bg-white/10" />;
}
