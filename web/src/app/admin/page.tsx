import Link from 'next/link';
import { getSlots, summarizeMatches } from '@/lib/data';
import { formatTime, setBreakdown } from '@/lib/format';
import type { Match, Slot } from '@/lib/types';

export const revalidate = 0;

export default async function AdminDashboard() {
  const slots = await getSlots();
  const summary = summarizeMatches(slots);

  // Flatten to a list of matches with their slot, sorted by display order then court.
  const rows: { slot: Slot; match: Match }[] = [];
  for (const s of slots) {
    for (const m of s.matches) rows.push({ slot: s, match: m });
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="kicker mb-2">Match Day · 9 May</div>
        <h1 className="display text-2xl sm:text-3xl font-bold">All matches</h1>
        <p className="text-ink-200 text-sm mt-2 max-w-xl">
          Pick a match and enter the final score. Group standings and the bracket update automatically.
        </p>
      </div>

      {/* Summary strip */}
      <div className="surface rounded-xl px-4 sm:px-5 py-3 mb-5 grid grid-cols-3 gap-4 sm:flex sm:items-center sm:gap-6 w-full sm:w-auto sm:inline-flex">
        <Stat label="Total" value={summary.total} />
        <Stat label="Done"  value={summary.done} accent="red" />
        <Stat label="Group" value={`${summary.groupDone}/${summary.groupTotal}`} />
      </div>

      {/* MOBILE: stacked cards */}
      <div className="md:hidden space-y-3">
        {rows.map(({ slot, match }) => {
          const known = match.team_a && match.team_b;
          const done  = match.status === 'done';
          return (
            <Link
              key={match.id}
              href={`/admin/result/${match.id}`}
              className="tap block surface rounded-xl p-4 active:bg-white/5 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-baseline gap-2 min-w-0">
                  <span className="num font-bold text-base">{formatTime(slot.start_time)}</span>
                  <span className="text-[10px] uppercase tracking-wider text-ink-300 font-semibold truncate">
                    Court {match.court}
                    {match.referee && <> · {match.referee.name}</>}
                  </span>
                </div>
                {done
                  ? <span className="pill-final shrink-0 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase">Final</span>
                  : <span className="pill-sched shrink-0 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase">Scheduled</span>}
              </div>

              <div className="flex items-baseline gap-2 mb-1">
                <span className={`text-[10px] uppercase tracking-widest font-bold ${stageColor(match.stage)}`}>
                  {stageLabel(match.stage)}
                </span>
              </div>

              {known ? (
                <div className="font-semibold text-[15px] leading-snug">
                  {match.team_a!.name} <span className="text-ink-300">vs</span> {match.team_b!.name}
                </div>
              ) : (
                <div className="font-semibold text-ink-200 italic text-[15px]">{match.stage_label}</div>
              )}

              {done && (
                <div className="mt-1">
                  <div className="num text-ink-100 text-base font-bold">
                    {match.score_a} <span className="text-ink-300">—</span> {match.score_b}{' '}
                    <span className="text-[10px] uppercase tracking-widest text-ink-300 font-semibold ml-1">sets</span>
                  </div>
                  {setBreakdown(match) && (
                    <div className="num text-[11px] text-ink-300 mt-0.5">{setBreakdown(match)}</div>
                  )}
                </div>
              )}

              <div className="mt-3 text-xs text-brand-red font-bold flex items-center gap-1">
                {done ? 'Edit result' : known ? 'Enter result' : 'Set teams'}
                <span aria-hidden>→</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* DESKTOP: full table */}
      <div className="hidden md:block surface rounded-2xl overflow-hidden shadow-card">
        <table className="match-table w-full text-sm">
          <thead className="bg-ink-700/70 border-b border-white/5">
            <tr className="text-[10px] uppercase tracking-[0.18em] text-ink-200">
              <th className="text-left  px-4 py-3 font-bold w-24">Time</th>
              <th className="text-left  px-4 py-3 font-bold w-16">Court</th>
              <th className="text-left  px-4 py-3 font-bold w-20">Stage</th>
              <th className="text-left  px-4 py-3 font-bold">Match</th>
              <th className="text-left  px-4 py-3 font-bold w-28">Referee</th>
              <th className="text-left  px-4 py-3 font-bold w-28">Status</th>
              <th className="text-right px-4 py-3 font-bold w-32"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map(({ slot, match }) => {
              const known = match.team_a && match.team_b;
              const done  = match.status === 'done';
              return (
                <tr key={match.id} className={done ? 'row-done' : ''}>
                  <td className="px-4 py-3 num font-bold">{formatTime(slot.start_time)}</td>
                  <td className="px-4 py-3 num text-ink-200">{match.court}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] uppercase tracking-widest font-bold ${stageColor(match.stage)}`}>
                      {stageLabel(match.stage)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {known ? (
                      <div className="space-y-1">
                        <div className="font-semibold">{match.team_a!.name} <span className="text-ink-300">vs</span> {match.team_b!.name}</div>
                        {done && (
                          <div className="num text-ink-200 text-xs">
                            <span className="font-bold">{match.score_a}–{match.score_b}</span>
                            {setBreakdown(match) && <span className="text-ink-300 ml-2">({setBreakdown(match)})</span>}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="font-semibold text-ink-200 italic">{match.stage_label}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-100">
                    {match.referee?.name ?? <span className="text-ink-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {done
                      ? <span className="pill-final inline-block px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase">Final</span>
                      : <span className="pill-sched inline-block px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase">Scheduled</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/result/${match.id}`}
                      className="inline-block bg-white text-ink-900 hover:bg-ink-100 transition-colors font-semibold px-3 py-1.5 rounded-md text-xs"
                    >
                      {done ? 'Edit result' : known ? 'Enter result' : 'Set teams'}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: 'red' }) {
  return (
    <div>
      <div className={`num text-xl sm:text-2xl font-extrabold ${accent === 'red' ? 'text-brand-red' : ''}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-ink-300 font-semibold">{label}</div>
    </div>
  );
}

function stageLabel(stage: string) {
  if (stage === 'group') return 'Group';
  if (stage === 'sf')    return 'Semi';
  if (stage === 'final') return 'Final';
  if (stage === 'third_place') return '3rd';
  return stage;
}

function stageColor(stage: string) {
  if (stage === 'final') return 'gold-text';
  if (stage === 'sf' || stage === 'third_place') return 'text-brand-gold';
  return 'text-ink-300';
}
