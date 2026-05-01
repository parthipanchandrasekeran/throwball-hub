import Image from 'next/image';
import { NavLinks } from '@/components/NavLinks';

export function SiteHeader() {
  return (
    <>
      {/* top bar */}
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-3 text-ink-200 min-w-0">
            <span className="kicker shrink-0">Live</span>
            <span className="hidden sm:inline truncate">Toronto · Sat 30 Apr 2026</span>
          </div>
          <NavLinks />
        </div>
      </div>

      {/* hero */}
      <header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-16 pb-6 sm:pb-12">
          <div className="flex items-start gap-4 sm:gap-10">
            {/* small logo on mobile, large on desktop */}
            <div className="relative shrink-0">
              <div className="absolute inset-0 -m-4 sm:-m-6 logo-ring blur-2xl" />
              <div className="relative w-16 h-16 sm:w-28 sm:h-28 lg:w-36 lg:h-36 rounded-xl sm:rounded-2xl surface flex items-center justify-center p-2 sm:p-3">
                <Image src="/tfc-logo.png" alt="TFC" width={144} height={144} className="w-full h-full object-contain" priority />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="kicker mb-2 sm:mb-3 text-[10px] sm:text-[11px]">
                <span className="hidden sm:inline">Throwball Federation of Canada · </span>
                <span className="sm:hidden">TFC · </span>
                Season 2026
              </div>
              <h1 className="hero-title text-3xl sm:text-6xl lg:text-7xl">
                Women&apos;s National<br />
                <span className="text-brand-red">Championship</span>
              </h1>
            </div>
          </div>

          {/* stat strip — 2 cols on mobile (no dividers), inline on sm+ */}
          <dl className="mt-5 sm:mt-6 grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-x-6 gap-y-3 text-sm text-ink-100">
            <Stat label="Edition" value="2026" gold />
            <Divider />
            <Stat label="Teams"   value="06" />
            <Divider />
            <Stat label="Matches" value="11" />
            <Divider />
            <Stat label="Courts"  value="02" />
          </dl>
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
