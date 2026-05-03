'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Silently re-fetches the current server-rendered page every `intervalMs`
 * so viewers see admin score updates without manually refreshing.
 *
 * - router.refresh() refetches RSC payload only — no full page reload, no flash.
 * - Skips when the tab is hidden, so backgrounded tabs don't burn battery.
 */
export function AutoRefresh({ intervalMs = 15000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === 'visible') router.refresh();
    };
    const t = setInterval(tick, intervalMs);
    // Refresh immediately when tab becomes visible after being hidden
    const onVis = () => { if (document.visibilityState === 'visible') router.refresh(); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [router, intervalMs]);

  return null;
}
