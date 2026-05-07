'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const revalidateAll = () => {
  revalidatePath('/');
  revalidatePath('/standings');
  revalidatePath('/bracket');
  revalidatePath('/admin');
};

export async function incrementScore(
  matchId: number,
  set: 1 | 2 | 3,
  side: 'a' | 'b',
  delta: 1 | -1,
) {
  const { error } = await supabase.rpc('admin_increment_score', {
    p_match_id: matchId,
    p_set: set,
    p_side: side,
    p_delta: delta,
  });
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function finalizeMatch(matchId: number) {
  const { error } = await supabase.rpc('admin_finalize_match', { p_match_id: matchId });
  if (error) throw new Error(error.message);
  revalidateAll();
  redirect('/admin?saved=1');
}

export async function reopenMatch(matchId: number) {
  const { error } = await supabase.rpc('admin_reopen_match', { p_match_id: matchId });
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function markLive(matchId: number) {
  const { error } = await supabase.rpc('admin_mark_live', { p_match_id: matchId });
  if (error) throw new Error(error.message);
  revalidateAll();
}
