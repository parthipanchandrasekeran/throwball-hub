'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// Browser-side Supabase client. Anon key is public-safe; RLS protects writes.
// Singleton so we don't open a new WS per render.
let _client: ReturnType<typeof createClient> | null = null;
function getClient() {
  if (_client) return _client;
  _client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
  return _client;
}

/**
 * Subscribes to live changes on the matches table over WebSocket.
 * On any INSERT / UPDATE / DELETE, calls router.refresh() so the
 * server-rendered page re-fetches and the viewer sees the new score
 * within ~500ms — no manual refresh, no polling.
 *
 * Falls back gracefully if the WS can't connect: the page still renders
 * normally, viewers just need to refresh manually (which is rare).
 */
export function RealtimeMatches() {
  const router = useRouter();

  useEffect(() => {
    const client = getClient();
    const channel = client
      .channel('public:matches')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches' },
        () => {
          // Any change to a match (score saved, cleared, teams assigned)
          // triggers a server-side re-fetch on this page.
          router.refresh();
        },
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [router]);

  return null;
}
