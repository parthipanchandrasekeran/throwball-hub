import Image from 'next/image';
import Link from 'next/link';

export function SiteHeader() {
  return (
    <>
      {/* top bar */}
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 text-ink-200">
            <span className="kicker">Live</span>
            <span className="hidden sm:inline">Toronto · Sat 30 Apr 2026</span>
          </div>
          <nav className="flex items-center gap-1 text-ink-100">
            <Link href="/"          className="px-3 py-1.5 rounded-md hover:bg-white/5 font-semibold">Schedule</Link>
            <Link href="/standings" className="px-3 py-1.5 rounded-md hover:bg-white/5 font-semibold text-ink-200">Standings</Link>
            <Link href="/bracket"   className="px-3 py-1.5 rounded-md hover:bg-white/5 font-semibold text-ink-200">Bracket</Link>
          </nav>
        </div>
      </div>

      {/* hero */}
      <header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-8 sm:pb-12">
          <div className="flex items-start gap-6 sm:gap-10">
            <div className="relative shrink-0 hidden sm:block">
              <div className="absolute inset-0 -m-6 logo-ring blur-2xl" />
              <div className="relative w-28 h-28 lg:w-36 lg:h-36 rounded-2xl surface flex items-center justify-center p-3">
                <Image src="/tfc-logo.png" alt="TFC" width={144} height={144} className="w-full h-full object-contain" priority />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="kicker mb-3">Throwball Federation of Canada · Season 2026</div>
              <h1 className="hero-title text-4xl sm:text-6xl lg:text-7xl">
                Women&apos;s National<br />
                <span className="text-brand-red">Championship</span>
              </h1>
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-100">
                <Stat label="Edition"  value="2026" gold />
                <Divider />
                <Stat label="Teams"    value="06" />
                <Divider />
                <Stat label="Matches"  value="11" />
                <Divider />
                <Stat label="Courts"   value="02" />
              </div>
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
    <div className="flex items-center gap-2">
      <span className={`num font-bold text-lg ${gold ? 'text-brand-gold' : ''}`}>{value}</span>
      <span className="text-ink-300">{label}</span>
    </div>
  );
}

function Divider() {
  return <div className="h-4 w-px bg-white/10" />;
}
