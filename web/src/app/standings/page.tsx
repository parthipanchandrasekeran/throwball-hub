import { getStandings } from '@/lib/data';

export const revalidate = 0;

const dotShadow = (color: string) =>
  color.toLowerCase() === '#1f1f1f' ? '0 0 0 2px rgba(255,255,255,0.18)' : undefined;

const diffClass = (n: number) =>
  n > 0 ? 'text-emerald-400' : n < 0 ? 'text-rose-400' : 'text-ink-200';

export default async function StandingsPage() {
  const rows = await getStandings();

  return (
    <section>
      <div className="mb-6">
        <div className="kicker mb-2">Group Stage</div>
        <h2 className="display text-2xl sm:text-4xl font-bold">Standings</h2>
        <p className="text-ink-200 text-sm mt-2 max-w-xl">
          Sorted by points, then point differential, then wins. Top 4 advance to the knockout bracket.
        </p>
      </div>

      {/* MOBILE: stacked cards */}
      <div className="md:hidden space-y-2">
        {rows.map((r, i) => {
          const rank = i + 1;
          const advances = rank <= 4;
          return (
            <div
              key={r.team_id}
              className={`surface rounded-xl p-3.5 flex items-center gap-3 ${advances ? 'border-emerald-500/15' : ''}`}
            >
              <span className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-bold shrink-0 num ${rank === 1 ? 'bg-brand-gold/20 text-brand-gold' : 'bg-white/5 text-ink-100'}`}>
                {rank}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-bold flex items-center text-[15px]">
                  <span className="team-dot shrink-0" style={{ background: r.color, boxShadow: dotShadow(r.color) }} />
                  <span className="truncate">{r.name}</span>
                </div>
                <div className="num text-[11px] text-ink-200 mt-1 flex items-center gap-2 flex-wrap">
                  <span>{r.won}<span className="text-ink-300">W</span> · {r.lost}<span className="text-ink-300">L</span></span>
                  <span className="text-ink-400">·</span>
                  <span className={diffClass(r.diff)}>{r.diff > 0 ? `+${r.diff}` : r.diff}</span>
                  <span className="text-ink-400">·</span>
                  <span className="text-ink-300">{r.pf}/{r.pa}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="num text-2xl font-extrabold leading-none">{r.points}</div>
                <div className="text-[9px] uppercase tracking-widest text-ink-300 font-semibold mt-1">pts</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP: full table */}
      <div className="hidden md:block surface rounded-2xl overflow-hidden shadow-card">
        <table className="match-table w-full text-sm">
          <thead className="bg-ink-700/70 border-b border-white/5">
            <tr className="text-[10px] uppercase tracking-[0.18em] text-ink-200">
              <th className="text-left  px-5 py-3.5 font-bold w-12">#</th>
              <th className="text-left  px-5 py-3.5 font-bold">Team</th>
              <th className="text-right px-5 py-3.5 font-bold w-12">P</th>
              <th className="text-right px-5 py-3.5 font-bold w-12">W</th>
              <th className="text-right px-5 py-3.5 font-bold w-12">L</th>
              <th className="text-right px-5 py-3.5 font-bold w-16">PF</th>
              <th className="text-right px-5 py-3.5 font-bold w-16">PA</th>
              <th className="text-right px-5 py-3.5 font-bold w-16">+/-</th>
              <th className="text-right px-5 py-3.5 font-bold w-20">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((r, i) => {
              const rank = i + 1;
              const advances = rank <= 4;
              return (
                <tr key={r.team_id} className={advances ? 'bg-emerald-500/[0.02]' : ''}>
                  <td className="px-5 py-4 num text-ink-200">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold ${rank === 1 ? 'bg-brand-gold/20 text-brand-gold' : 'bg-white/5 text-ink-100'}`}>
                      {rank}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center font-bold">
                      <span className="team-dot" style={{ background: r.color, boxShadow: dotShadow(r.color) }} />
                      {r.name}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right num">{r.played}</td>
                  <td className="px-5 py-4 text-right num">{r.won}</td>
                  <td className="px-5 py-4 text-right num text-ink-200">{r.lost}</td>
                  <td className="px-5 py-4 text-right num text-ink-200">{r.pf}</td>
                  <td className="px-5 py-4 text-right num text-ink-200">{r.pa}</td>
                  <td className={`px-5 py-4 text-right num ${diffClass(r.diff)}`}>
                    {r.diff > 0 ? `+${r.diff}` : r.diff}
                  </td>
                  <td className="px-5 py-4 text-right num text-lg font-extrabold">{r.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-[11px] text-ink-300">
        <span className="inline-block w-2 h-2 rounded-sm bg-emerald-500/60 align-middle mr-2" />
        Top 4 advance to knockout bracket
      </div>
    </section>
  );
}
