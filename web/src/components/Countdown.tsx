'use client';

import { useEffect, useState } from 'react';

// 9 May 2026 8:30 AM Toronto (EDT, UTC-4)
const TARGET_MS = Date.UTC(2026, 4, 9, 12, 30, 0); // 12:30 UTC == 8:30 EDT

function pad(n: number) { return n.toString().padStart(2, '0'); }

export function Countdown() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  if (now === null) {
    // SSR placeholder; same height so no layout shift on hydration
    return (
      <div className="mt-5 sm:mt-6 inline-flex items-center gap-3 px-3.5 py-2 rounded-full surface text-xs text-ink-300 invisible" aria-hidden>
        Tournament starts in&nbsp; 0d 00h 00m 00s
      </div>
    );
  }

  const ms = TARGET_MS - now;

  if (ms <= 0) {
    return (
      <div className="mt-5 sm:mt-6 inline-flex items-center gap-2 px-3.5 py-2 rounded-full pill-final text-xs font-bold uppercase tracking-widest">
        <span className="kicker !text-current after:hidden">Tournament Live</span>
      </div>
    );
  }

  const sec   = Math.floor(ms / 1000);
  const days  = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  const mins  = Math.floor((sec % 3600) / 60);
  const secs  = sec % 60;

  return (
    <div className="mt-5 sm:mt-6 inline-flex items-center gap-3 px-3.5 py-2 rounded-full surface text-xs">
      <span className="text-[10px] uppercase tracking-widest text-ink-300 font-semibold">
        Tournament starts in
      </span>
      <span
        className="num font-bold text-ink-50 text-sm"
        suppressHydrationWarning
        aria-live="polite"
      >
        {days}d {pad(hours)}h {pad(mins)}m {pad(secs)}s
      </span>
    </div>
  );
}
