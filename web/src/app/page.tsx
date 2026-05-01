import { getSlots, getStandings, summarizeMatches } from '@/lib/data';
import { formatTime, setBreakdown } from '@/lib/format';
import type { Match, Slot, Team } from '@/lib/types';

export const revalidate = 0;

export default async function HomePage() {
  const [slots, standings] = await Promise.all([getSlots(), getStandings()]);
  const summary = summarizeMatches(slots);

  return (
    <>
      {/* MINI STANDINGS */}
      <section className="mb-14">
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="kicker mb-2">Group Stage</div>
            <h2 className="display text-2xl sm:text-3xl font-bold">Standings</h2>
          </div>
          <a href="/standings" className="text-xs sm:text-sm font-semibold text-ink-100 hover:text-brand-red transition-colors">
            Full table →
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {standings.map((row, i) => {
            const rank = i + 1;
            const isFirst = rank === 1;
            return (
              <div key={row.team_id} className="surface surface-hover relative overflow-hidden rounded-xl p-4 shadow-card">
                <div className={`rank-bg ${isFirst ? 'rank-bg-gold' : ''}`}>{String(rank).padStart(2, '0')}</div>
                <div className="relative">
                  <div className={`text-[10px] font-bold tracking-widest uppercase ${isFirst ? 'text-brand-gold' : 'text-ink-100'}`}>
                    {ordinal(rank)}
                  </div>
                  <div className="mt-1 font-bold text-base flex items-center">
                    <TeamDot color={row.color} />{row.name}
                  </div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="num text-2xl font-extrabold">{row.points}</span>
                    <span className="text-[10px] uppercase tracking-wider text-ink-300 font-semibold">pts</span>
                  </div>
                  <div className="text-[11px] text-ink-200 mt-1 num">{row.won}W · {row.lost}L</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 text-[11px] text-ink-300 italic">
          Updated after {summary.groupDone} of {summary.groupTotal} group matches.
        </div>
      </section>

      {/* SCHEDULE */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
          <div>
            <div className="kicker mb-2">Match Day · 30 Apr</div>
            <h2 className="display text-2xl sm:text-3xl font-bold">Schedule</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="chip-on px-3.5 py-1.5 rounded-full font-semibold text-xs">All</button>
            <button className="chip   px-3.5 py-1.5 rounded-full font-semibold text-xs">Today</button>
            <button className="chip   px-3.5 py-1.5 rounded-full font-semibold text-xs">Done</button>
            <button className="chip   px-3.5 py-1.5 rounded-full font-semibold text-xs">Knockouts</button>
          </div>
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block surface rounded-2xl overflow-hidden shadow-card">
          <table className="match-table w-full text-sm">
            <thead className="bg-ink-700/70 border-b border-white/5">
              <tr className="text-[10px] uppercase tracking-[0.18em] text-ink-200">
                <th className="text-left px-5 py-3.5 font-bold w-28">Time</th>
                <th className="text-left px-5 py-3.5 font-bold">Court 1</th>
                <th className="text-left px-5 py-3.5 font-bold w-28">Referee</th>
                <th className="text-left px-5 py-3.5 font-bold">Court 2</th>
                <th className="text-left px-5 py-3.5 font-bold w-28">Referee</th>
                <th className="text-left px-5 py-3.5 font-bold w-32">Bye</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {slots.map((slot, i) => (
                <SlotRow key={slot.id} slot={slot} prevSlot={i > 0 ? slots[i - 1] : null} />
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden space-y-3">
          {slots.map((slot, i) => (
            <SlotMobile key={slot.id} slot={slot} prevSlot={i > 0 ? slots[i - 1] : null} />
          ))}
        </div>
      </section>
    </>
  );
}

/* ----------------------- helpers + sub-components ----------------------- */

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function TeamDot({ color }: { color: string }) {
  const isDark = color.toLowerCase() === '#1f1f1f';
  return (
    <span
      className="team-dot"
      style={{
        background: color,
        boxShadow: isDark ? '0 0 0 2px rgba(255,255,255,0.18)' : undefined,
      }}
    />
  );
}

function TeamBar({ color }: { color: string }) {
  const isDark = color.toLowerCase() === '#1f1f1f';
  return (
    <span
      className="team-bar"
      style={{
        background: color,
        boxShadow: isDark ? '0 0 0 2px rgba(255,255,255,0.18)' : undefined,
      }}
    />
  );
}

/* ----------------------- desktop slot row ----------------------- */

function SlotRow({ slot, prevSlot }: { slot: Slot; prevSlot: Slot | null }) {
  // Stage divider before first knockout slot
  const showDivider = isKnockout(slot) && (!prevSlot || !isKnockout(prevSlot));

  if (slot.kind === 'break') {
    return (
      <tr>
        <td className="px-5 py-3 align-middle">
          <div className="num font-bold text-base">{formatTime(slot.start_time)}</div>
          <div className="text-[10px] text-ink-300 num">{formatTime(slot.end_time)}</div>
        </td>
        <td colSpan={5} className="px-5 py-3 text-center">
          <span className="pill-break inline-block px-4 py-1.5 rounded-full text-[11px] font-bold tracking-[0.2em] uppercase">— Break —</span>
        </td>
      </tr>
    );
  }

  const c1 = slot.matches.find(m => m.court === 1) ?? null;
  const c2 = slot.matches.find(m => m.court === 2) ?? null;

  return (
    <>
      {showDivider && (
        <tr className="stage-divider">
          <td colSpan={6} className="px-5 py-3 text-center">
            <span className="kicker text-brand-gold!" style={{ color: '#D4AF37' }}>Knockout Stage</span>
          </td>
        </tr>
      )}
      <tr className={anyDone(slot) ? 'row-done' : ''}>
        <td className="px-5 py-4 align-top">
          <div className="num font-bold text-base">{formatTime(slot.start_time)}</div>
          <div className="text-[10px] text-ink-300 num">{formatTime(slot.end_time)}</div>
          {statusPill(slot)}
        </td>
        <td className="px-5 py-4">{c1 ? <MatchCell match={c1} /> : <Empty />}</td>
        <td className="px-5 py-4 text-ink-100 font-medium">{c1?.referee?.name ?? <span className="text-ink-300">{isKnockout(slot) ? 'TBD' : '—'}</span>}</td>
        <td className="px-5 py-4">{c2 ? <MatchCell match={c2} /> : <Empty />}</td>
        <td className="px-5 py-4 text-ink-100 font-medium">{c2?.referee?.name ?? <span className="text-ink-300">{isKnockout(slot) ? 'TBD' : '—'}</span>}</td>
        <td className="px-5 py-4">{byeCell(slot)}</td>
      </tr>
    </>
  );
}

function MatchCell({ match }: { match: Match }) {
  // Knockout placeholder match (no teams yet)
  if (match.team_a == null || match.team_b == null) {
    return (
      <div>
        <div className={`text-[10px] uppercase tracking-widest font-extrabold mb-1 ${match.stage === 'final' ? 'gold-text' : 'text-brand-gold'}`}>
          {match.stage === 'final' ? '★ Final' : match.stage === 'third_place' ? '3rd Place' : stageHeading(match)}
        </div>
        <div className="font-semibold text-ink-100 italic">
          {match.stage_label?.split(' vs ').map((part, i) => (
            <span key={i}>
              {i > 0 && <span className="text-ink-300"> vs </span>}
              {part}
            </span>
          ))}
        </div>
      </div>
    );
  }

  const done = match.status === 'done';
  const aWon = done && (match.score_a ?? 0) > (match.score_b ?? 0);
  const bWon = done && (match.score_b ?? 0) > (match.score_a ?? 0);
  const breakdown = done ? setBreakdown(match) : null;

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0 space-y-1.5">
        <TeamLine team={match.team_a} winner={aWon} done={done} />
        <TeamLine team={match.team_b} winner={bWon} done={done} />
        {breakdown && (
          <div className="num text-[10px] text-ink-300 mt-1">
            {breakdown}
          </div>
        )}
      </div>
      {done && (
        <div className="text-right space-y-1 shrink-0">
          <div className={`score ${aWon ? '' : 'loser'}`}>{match.score_a}</div>
          <div className={`score ${bWon ? '' : 'loser'}`}>{match.score_b}</div>
          <div className="text-[9px] uppercase tracking-widest text-ink-300 font-semibold">sets</div>
        </div>
      )}
    </div>
  );
}

function TeamLine({ team, winner, done }: { team: Team; winner: boolean; done: boolean }) {
  const cls = done
    ? winner
      ? 'winner font-bold flex items-center'
      : 'loser font-medium flex items-center line-through decoration-1'
    : 'font-semibold flex items-center';
  return <div className={cls}><TeamBar color={team.color} />{team.name}</div>;
}

function statusPill(slot: Slot) {
  if (allDone(slot)) {
    return <div className="mt-2"><span className="pill-final inline-block px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase">Final</span></div>;
  }
  return null;
}

function byeCell(slot: Slot) {
  if (slot.bye_team) {
    return <span className="pill-bye inline-block px-2.5 py-1 rounded text-[11px] font-semibold">{slot.bye_team.name}</span>;
  }
  if (slot.bye_label) {
    return <span className="text-ink-300 text-xs">{slot.bye_label}</span>;
  }
  return <span className="text-ink-300">—</span>;
}

function Empty() {
  return <span className="text-ink-400 text-3xl font-light">—</span>;
}

function isKnockout(slot: Slot) {
  return slot.matches.some(m => m.stage !== 'group');
}
function anyDone(slot: Slot) {
  return slot.matches.some(m => m.status === 'done');
}
function allDone(slot: Slot) {
  return slot.matches.length > 0 && slot.matches.every(m => m.status === 'done');
}
function stageHeading(match: Match) {
  if (match.stage === 'sf') return match.court === 1 ? 'Semi-final 1' : 'Semi-final 2';
  return '';
}

/* ----------------------- mobile slot ----------------------- */

function SlotMobile({ slot, prevSlot }: { slot: Slot; prevSlot: Slot | null }) {
  if (slot.kind === 'break') {
    return (
      <div className="flex items-center justify-center py-2">
        <span className="pill-break inline-block px-4 py-1.5 rounded-full text-[11px] font-bold tracking-[0.2em] uppercase">
          {formatTime(slot.start_time)} — Break — {formatTime(slot.end_time)}
        </span>
      </div>
    );
  }

  const showDivider = isKnockout(slot) && (!prevSlot || !isKnockout(prevSlot));

  return (
    <>
      {showDivider && (
        <div className="flex items-center justify-center py-3 stage-divider rounded-xl">
          <span className="kicker" style={{ color: '#D4AF37' }}>Knockout Stage</span>
        </div>
      )}
      {slot.matches.map(m => <MatchCardMobile key={m.id} slot={slot} match={m} />)}
      {slot.matches.length === 0 && (
        <div className="text-center text-ink-300 text-xs py-2">No matches scheduled</div>
      )}
      {slot.bye_team && (
        <div className="text-[11px] text-ink-300 -mt-1 text-right">
          Bye: <span className="pill-bye inline-block px-2 py-0.5 rounded font-semibold ml-1">{slot.bye_team.name}</span>
        </div>
      )}
    </>
  );
}

function MatchCardMobile({ slot, match }: { slot: Slot; match: Match }) {
  if (match.team_a == null || match.team_b == null) {
    return (
      <div className="surface rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="num font-bold">{formatTime(slot.start_time)}</div>
          <span className="text-[10px] text-ink-300 uppercase tracking-wider">Court {match.court}</span>
        </div>
        <div className={`text-[11px] uppercase tracking-widest font-extrabold mb-1 ${match.stage === 'final' ? 'gold-text' : 'text-brand-gold'}`}>
          {match.stage === 'final' ? '★ Final' : match.stage === 'third_place' ? '3rd Place' : stageHeading(match)}
        </div>
        <div className="font-semibold text-ink-100 italic">{match.stage_label}</div>
      </div>
    );
  }

  const done = match.status === 'done';
  const aWon = done && (match.score_a ?? 0) > (match.score_b ?? 0);
  const bWon = done && (match.score_b ?? 0) > (match.score_a ?? 0);
  const breakdown = done ? setBreakdown(match) : null;

  return (
    <div className="surface rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="num font-bold">{formatTime(slot.start_time)}</div>
          <div className="text-[10px] text-ink-300 uppercase tracking-wider">
            Court {match.court}{match.referee ? ` · ${match.referee.name}` : ''}
          </div>
        </div>
        {done
          ? <span className="pill-final px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase">Final</span>
          : <span className="pill-sched px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase">Scheduled</span>}
      </div>
      <div className={`flex items-center justify-between py-1.5 ${done && !aWon ? 'loser' : ''}`}>
        <div className={`flex items-center ${done && !aWon ? 'font-medium line-through' : 'font-bold'}`}>
          <TeamBar color={match.team_a.color} />{match.team_a.name}
        </div>
        {done && <div className="score-sm">{match.score_a}</div>}
      </div>
      <div className={`flex items-center justify-between py-1.5 ${done && !bWon ? 'loser' : ''}`}>
        <div className={`flex items-center ${done && !bWon ? 'font-medium line-through' : 'font-bold'}`}>
          <TeamBar color={match.team_b.color} />{match.team_b.name}
        </div>
        {done && <div className="score-sm">{match.score_b}</div>}
      </div>
      {breakdown && (
        <div className="num text-[11px] text-ink-300 mt-2 pt-2 border-t border-white/5">
          Sets: {breakdown}
        </div>
      )}
    </div>
  );
}
