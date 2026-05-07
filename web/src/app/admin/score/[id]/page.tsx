import { notFound, redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LiveScore } from './LiveScore';

export const dynamic = 'force-dynamic';

export default async function ScorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) notFound();

  const { data, error } = await supabase
    .from('matches')
    .select(`
      id, court, status, score_a, score_b,
      set1_a, set1_b, set2_a, set2_b, set3_a, set3_b,
      team_a:teams!team_a_id ( id, name, short_name, color, logo_url ),
      team_b:teams!team_b_id ( id, name, short_name, color, logo_url ),
      referee:referees ( name ),
      slot:slots!slot_id ( start_time, end_time )
    `)
    .eq('id', id)
    .single();

  if (error || !data) notFound();

  // Knockout matches without teams assigned: redirect to the team-assignment form
  if (!data.team_a || !data.team_b) {
    redirect(`/admin/result/${id}`);
  }

  return <LiveScore initial={data as never} />;
}
