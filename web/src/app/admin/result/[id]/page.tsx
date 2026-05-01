import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { formatTime, setBreakdown } from '@/lib/format';
import type { Team } from '@/lib/types';

export const revalidate = 0;

type MatchRow = {
  id: number;
  court: number;
  score_a: number | null;
  score_b: number | null;
  set1_a: number | null; set1_b: number | null;
  set2_a: number | null; set2_b: number | null;
  set3_a: number | null; set3_b: number | null;
  status: 'scheduled' | 'done';
  stage: 'group' | 'sf' | 'final' | 'third_place';
  stage_label: string | null;
  team_a: Team | null;
  team_b: Team | null;
  referee: { name: string } | null;
  slot: { start_time: string; end_time: string };
};

async function loadMatch(id: number): Promise<MatchRow | null> {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      id, court,
      score_a, score_b,
      set1_a, set1_b, set2_a, set2_b, set3_a, set3_b,
      status, stage, stage_label,
      team_a:teams!team_a_id ( id, name, short_name, color ),
      team_b:teams!team_b_id ( id, name, short_name, color ),
      referee:referees ( name ),
      slot:slots!slot_id ( start_time, end_time )
    `)
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return data as unknown as MatchRow;
}

async function loadTeams(): Promise<Team[]> {
  const { data } = await supabase.from('teams').select('id, name, short_name, color').order('display_order');
  return (data ?? []) as Team[];
}

/* -------- server actions -------- */

function readSet(formData: FormData, prefix: string): { a: number | null; b: number | null } {
  const ra = formData.get(`${prefix}_a`);
  const rb = formData.get(`${prefix}_b`);
  const aStr = String(ra ?? '').trim();
  const bStr = String(rb ?? '').trim();
  if (aStr === '' && bStr === '') return { a: null, b: null };
  return { a: aStr === '' ? null : Number(aStr), b: bStr === '' ? null : Number(bStr) };
}

async function saveScore(formData: FormData) {
  'use server';
  const id = Number(formData.get('id'));
  const s1 = readSet(formData, 'set1');
  const s2 = readSet(formData, 'set2');
  const s3 = readSet(formData, 'set3');

  const { error } = await supabase.rpc('admin_save_match_result', {
    p_match_id: id,
    p_set1_a: s1.a, p_set1_b: s1.b,
    p_set2_a: s2.a, p_set2_b: s2.b,
    p_set3_a: s3.a, p_set3_b: s3.b,
  });
  if (error) redirect(`/admin/result/${id}?error=${encodeURIComponent(error.message)}`);

  revalidatePath('/');
  revalidatePath('/standings');
  revalidatePath('/bracket');
  revalidatePath('/admin');
  redirect('/admin?saved=1');
}

async function clearScore(formData: FormData) {
  'use server';
  const id = Number(formData.get('id'));
  const { error } = await supabase.rpc('admin_clear_match_result', { p_match_id: id });
  if (error) redirect(`/admin/result/${id}?error=${encodeURIComponent(error.message)}`);

  revalidatePath('/');
  revalidatePath('/standings');
  revalidatePath('/bracket');
  revalidatePath('/admin');
  redirect(`/admin/result/${id}`);
}

async function assignTeams(formData: FormData) {
  'use server';
  const id        = Number(formData.get('id'));
  const team_a_id = Number(formData.get('team_a_id'));
  const team_b_id = Number(formData.get('team_b_id'));

  const { error } = await supabase.rpc('admin_assign_knockout_teams', {
    p_match_id:  id,
    p_team_a_id: team_a_id,
    p_team_b_id: team_b_id,
  });
  if (error) redirect(`/admin/result/${id}?error=${encodeURIComponent(error.message)}`);

  revalidatePath('/');
  revalidatePath('/bracket');
  revalidatePath('/admin');
  redirect(`/admin/result/${id}`);
}

/* -------- page -------- */

export default async function ResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) notFound();

  const [match, teams] = await Promise.all([loadMatch(id), loadTeams()]);
  if (!match) notFound();

  const sp = await searchParams;
  const known = match.team_a && match.team_b;
  const done  = match.status === 'done';
  const isKnockout = match.stage !== 'group';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <Link href="/admin" className="text-xs text-ink-200 hover:text-ink-50 font-semibold">
        ← All matches
      </Link>

      <div className="mt-4 mb-6">
        <div className="kicker mb-2 text-[10px] sm:text-[11px]">
          {formatTime(match.slot.start_time)} — {formatTime(match.slot.end_time)} · Court {match.court}
          {match.referee && <> · Ref {match.referee.name}</>}
        </div>
        <h1 className="display text-xl sm:text-3xl font-bold leading-tight">
          {known ? <>{match.team_a!.name} <span className="text-ink-300">vs</span> {match.team_b!.name}</>
                 : <span className="italic text-ink-100">{match.stage_label}</span>}
        </h1>
        {done && (
          <div className="mt-3 flex items-baseline gap-3">
            <span className="num text-2xl font-extrabold">{match.score_a}–{match.score_b}</span>
            <span className="text-[10px] uppercase tracking-widest text-ink-300 font-semibold">sets</span>
            {setBreakdown(match) && (
              <span className="num text-xs text-ink-300">{setBreakdown(match)}</span>
            )}
          </div>
        )}
      </div>

      {sp.error && (
        <div className="mb-5 px-3 py-2 rounded-lg text-xs font-semibold pill-final">
          {decodeURIComponent(sp.error)}
        </div>
      )}

      {/* TEAM ASSIGNMENT (knockouts, before teams set) */}
      {isKnockout && !known && (
        <form action={assignTeams} className="surface rounded-2xl p-5 sm:p-6 mb-5 shadow-card">
          <input type="hidden" name="id" value={match.id} />
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-gold mb-1">Step 1 · Assign teams</h2>
          <p className="text-xs text-ink-300 mb-5">Once group standings are settled, pick the two teams playing this knockout match.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TeamSelect name="team_a_id" label="Team A" teams={teams} />
            <TeamSelect name="team_b_id" label="Team B" teams={teams} />
          </div>
          <button type="submit" className="mt-6 w-full sm:w-auto bg-brand-gold hover:bg-brand-goldLt transition-colors text-ink-900 font-bold py-3 sm:py-2.5 px-5 rounded-lg text-sm">
            Save teams
          </button>
        </form>
      )}

      {/* SCORE ENTRY (best-of-3 sets) */}
      {known && (
        <form action={saveScore} className="surface rounded-2xl p-5 sm:p-6 shadow-card">
          <input type="hidden" name="id" value={match.id} />

          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-ink-100">
              {done ? 'Edit set scores' : 'Enter set scores'}
            </h2>
            <span className="text-[10px] text-ink-300 uppercase tracking-widest font-semibold">Best of 3 · first to 15</span>
          </div>

          {/* Header row */}
          <div className="hidden sm:grid grid-cols-[1fr_64px_64px_64px] gap-3 items-center text-[10px] uppercase tracking-widest text-ink-300 font-semibold mb-2">
            <div></div>
            <div className="text-center">Set 1</div>
            <div className="text-center">Set 2</div>
            <div className="text-center">Set 3</div>
          </div>

          <TeamRow
            label={match.team_a!.name}
            color={match.team_a!.color}
            namePrefix="a"
            defaults={[match.set1_a, match.set2_a, match.set3_a]}
          />
          <div className="my-2 border-t border-white/5" />
          <TeamRow
            label={match.team_b!.name}
            color={match.team_b!.color}
            namePrefix="b"
            defaults={[match.set1_b, match.set2_b, match.set3_b]}
          />

          <p className="mt-4 text-[11px] text-ink-300">
            Leave Set 3 blank if one team won the first two sets.
          </p>

          <div className="mt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <Link href="/admin" className="chip text-center px-4 py-3 sm:py-2 rounded-md font-semibold text-sm">Cancel</Link>
            <button type="submit" className="flex-1 sm:flex-none bg-brand-red hover:bg-brand-redDk transition-colors text-white font-bold py-3 sm:py-2.5 px-5 rounded-lg text-sm">
              {done ? 'Update result' : 'Save result'}
            </button>
          </div>
        </form>
      )}

      {done && (
        <form action={clearScore} className="mt-5">
          <input type="hidden" name="id" value={match.id} />
          <button
            type="submit"
            className="text-xs text-ink-300 hover:text-rose-400 font-semibold underline underline-offset-2"
          >
            Clear result and revert to scheduled
          </button>
        </form>
      )}
    </div>
  );
}

/* -------- form bits -------- */

function TeamRow({
  label, color, namePrefix, defaults,
}: { label: string; color: string; namePrefix: 'a' | 'b'; defaults: (number | null)[] }) {
  return (
    <div className="grid grid-cols-[1fr_64px_64px_64px] sm:grid-cols-[1fr_64px_64px_64px] gap-3 items-center">
      <div className="flex items-center font-bold text-sm sm:text-base min-w-0">
        <span
          className="team-bar mr-2 shrink-0"
          style={{
            background: color,
            boxShadow: color.toLowerCase() === '#1f1f1f' ? '0 0 0 2px rgba(255,255,255,0.18)' : undefined,
          }}
        />
        <span className="truncate">{label}</span>
      </div>
      <SetInput name={`set1_${namePrefix}`} defaultValue={defaults[0]} mobileLabel="S1" />
      <SetInput name={`set2_${namePrefix}`} defaultValue={defaults[1]} mobileLabel="S2" />
      <SetInput name={`set3_${namePrefix}`} defaultValue={defaults[2]} mobileLabel="S3" optional />
    </div>
  );
}

function SetInput({
  name, defaultValue, mobileLabel, optional,
}: { name: string; defaultValue: number | null; mobileLabel: string; optional?: boolean }) {
  return (
    <label className="block">
      <span className="sm:hidden text-[9px] uppercase tracking-widest text-ink-300 font-semibold block mb-1 text-center">
        {mobileLabel}{optional ? ' (opt)' : ''}
      </span>
      <input
        type="number"
        inputMode="numeric"
        pattern="[0-9]*"
        name={name}
        min={0}
        max={50}
        defaultValue={defaultValue ?? ''}
        placeholder={optional ? '—' : '0'}
        className="w-full bg-ink-700/60 border border-white/10 rounded-lg px-2 py-3 sm:py-2.5 text-xl sm:text-lg font-mono font-bold text-center focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/30"
      />
    </label>
  );
}

function TeamSelect({ name, label, teams }: { name: string; label: string; teams: Team[] }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-widest text-ink-200 font-semibold">{label}</span>
      <select
        name={name}
        required
        defaultValue=""
        className="mt-1 w-full bg-ink-700/60 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
      >
        <option value="" disabled>Select a team…</option>
        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
    </label>
  );
}
