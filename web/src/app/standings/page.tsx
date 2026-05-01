import { getStandings } from '@/lib/data';
import type { StandingsRow } from '@/lib/types';

export const revalidate = 0;

const dotShadow = (color: string) =>
  color.toLowerCase() === '#1f1f1f' ? '0 0 0 2px rgba(255,255,255,0.18)' : undefined;

const signed = (n: number) => (n > 0 ? `+${n}` : `${n}`);
const trendClass = (n: number) =>
  n > 0 ? 'text-emerald-400' : n < 0 ? 'text-rose-400' : 'text-ink-200';

const LEGEND: { code: string; label: string }[] = [
  { code: 'P',  label: 'Points' },
  { code: 'MP', label: 'Matches Played' },
  { code: 'W',  label: 'Wins' },
  { code: 'L',  label: 'Losses' },
  { code: 'F',  label: 'Sets For' },
  { code: 'A',  label: 'Sets Against' },
  { code: 'D',  label: 'Sets Difference' },
  { code: 'PD', label: 'Points Difference' },
  { code: 'EP', label: 'Extras Points' },
];

export default async function StandingsPage() {
  const rows = await getStandings();

  return (
    <section>
      <div className="mb-6">
        <div className="kicker mb-2">Group Stage</div>
        <h2 className="display text-2xl sm:text-4xl font-bold">Standings</h2>
        <p className="text-ink-200 text-sm mt-2 max-w-xl">
          Sorted by Points, then Wins, then Sets Difference, then Points Difference. Top 4 advance to the knockout bracket.
        </p>
      </div>

      {/* MOBILE: stacked cards */}
      <div className="md:hidden space-y-2">
        {rows.map((r, i) => <MobileRow key={r.team_id} rank={i + 1} row={r} />)}
      </div>

      {/* DESKTOP: full table */}
      <div className="hidden md:block surface rounded-2xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="match-table w-full text-sm min-w-[760px]">
            <thead className="bg-ink-700/70 border-b border-white/5">
              <tr className="text-[10px] uppercase tracking-[0.18em] text-ink-200">
                <th className="text-left  px-4 py-3.5 font-bold w-12">#</th>
                <th className="text-left  px-4 py-3.5 font-bold">Team</th>
                <th className="text-right px-3 py-3.5 font-bold w-14" title="Points">P</th>
                <th className="text-right px-3 py-3.5 font-bold w-14" title="Matches Played">MP</th>
                <th className="text-right px-3 py-3.5 font-bold w-12" title="Wins">W</th>
                <th className="text-right px-3 py-3.5 font-bold w-12" title="Losses">L</th>
                <th className="text-right px-3 py-3.5 font-bold w-12" title="Sets For">F</th>
                <th className="text-right px-3 py-3.5 font-bold w-12" title="Sets Against">A</th>
                <th className="text-right px-3 py-3.5 font-bold w-14" title="Sets Difference">D</th>
                <th className="text-right px-3 py-3.5 font-bold w-16" title="Points Difference">PD</th>
                <th className="text-right px-4 py-3.5 font-bold w-12" title="Extras Points">EP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((r, i) => {
                const rank     = i + 1;
                const advances = rank <= 4;
                return (
                  <tr key={r.team_id} className={advances ? 'bg-emerald-500/[0.02]' : ''}>
                    <td className="px-4 py-4 num text-ink-200">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold ${rank === 1 ? 'bg-brand-gold/20 text-brand-gold' : 'bg-white/5 text-ink-100'}`}>
                        {rank}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center font-bold">
                        <span className="team-dot" style={{ background: r.color, boxShadow: dotShadow(r.color) }} />
                        {r.name}
                      </div>
                    </td>
                    <td className="px-3 py-4 text-right num text-base font-extrabold">{r.points}</td>
                    <td className="px-3 py-4 text-right num">{r.played}</td>
                    <td className="px-3 py-4 text-right num">{r.won}</td>
                    <td className="px-3 py-4 text-right num text-ink-200">{r.lost}</td>
                    <td className="px-3 py-4 text-right num text-ink-200">{r.sets_won}</td>
                    <td className="px-3 py-4 text-right num text-ink-200">{r.sets_lost}</td>
                    <td className={`px-3 py-4 text-right num font-semibold ${trendClass(r.sets_diff)}`}>{signed(r.sets_diff)}</td>
                    <td className={`px-3 py-4 text-right num ${trendClass(r.diff)}`}>{signed(r.diff)}</td>
                    <td className="px-4 py-4 text-right num text-ink-300">{r.extra_points}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend + qualification key */}
      <div className="mt-5 flex flex-col gap-3">
        <div className="text-[11px] text-ink-300 flex items-center">
          <span className="inline-block w-2 h-2 rounded-sm bg-emerald-500/60 align-middle mr-2" />
          Top 4 advance to knockout bracket
        </div>
        <div className="surface rounded-xl p-4">
          <div className="text-[10px] uppercase tracking-widest text-ink-300 font-semibold mb-3">Legend</div>
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-xs">
            {LEGEND.map(({ code, label }) => (
              <div key={code} className="flex items-baseline gap-2">
                <dt className="num font-bold text-ink-100 w-7 shrink-0">{code}</dt>
                <dd className="text-ink-200">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function MobileRow({ rank, row: r }: { rank: number; row: StandingsRow }) {
  const advances = rank <= 4;
  return (
    <div className={`surface rounded-xl p-3.5 ${advances ? 'border-emerald-500/15' : ''}`}>
      <div className="flex items-center gap-3">
        <span className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-bold shrink-0 num ${rank === 1 ? 'bg-brand-gold/20 text-brand-gold' : 'bg-white/5 text-ink-100'}`}>
          {rank}
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-bold flex items-center text-[15px]">
            <span className="team-dot shrink-0" style={{ background: r.color, boxShadow: dotShadow(r.color) }} />
            <span className="truncate">{r.name}</span>
          </div>
          <div className="num text-[11px] text-ink-200 mt-1 flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold">{r.won}<span className="text-ink-300">W</span> · {r.lost}<span className="text-ink-300">L</span></span>
            <span className="text-ink-400">·</span>
            <span><span className="text-ink-300">MP</span> {r.played}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="num text-2xl font-extrabold leading-none">{r.points}</div>
          <div className="text-[9px] uppercase tracking-widest text-ink-300 font-semibold mt-1">P</div>
        </div>
      </div>

      {/* Sets / Diff strip */}
      <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-5 gap-2 text-center">
        <Cell label="F"  value={r.sets_won} />
        <Cell label="A"  value={r.sets_lost} />
        <Cell label="D"  value={signed(r.sets_diff)} tone={trendClass(r.sets_diff)} />
        <Cell label="PD" value={signed(r.diff)}      tone={trendClass(r.diff)} />
        <Cell label="EP" value={r.extra_points} />
      </div>
    </div>
  );
}

function Cell({ label, value, tone }: { label: string; value: string | number; tone?: string }) {
  return (
    <div>
      <div className={`num text-sm font-bold ${tone ?? ''}`}>{value}</div>
      <div className="text-[9px] uppercase tracking-widest text-ink-300 font-semibold mt-0.5">{label}</div>
    </div>
  );
}
