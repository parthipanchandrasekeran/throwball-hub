import Link from 'next/link';
import { Fragment } from 'react';
import { byDivision, DIVISIONS, getSlots, getStandings, summarizeMatches } from '@/lib/data';
import { divisionLabel, formatTime, knockoutHeading, minutesBetween, placeholderSides } from '@/lib/format';
import { EVENT } from '@/lib/event';
import type { Division, Match, Slot, Team } from '@/lib/types';
import { ArcadeBlastBreakCard } from '@/components/ArcadeBlastBreakCard';
import { TeamLogo } from '@/components/TeamLogo';

type Filter = 'all' | 'done' | 'knockouts';

/** Court order + header labels for the desktop table. Court 2 is the Bronze court. */
const COURTS = [1, 2, 3] as const;
const COURT_LABEL: Record<(typeof COURTS)[number], string> = {
  1: 'Court 1 · Gold',
  2: 'Court 2 · Bronze',
  3: 'Court 3 · Gold',
};
const TABLE_COLS = 1 + COURTS.length * 2;

/** Static class strings so Tailwind can see them. */
const MINI_GRID: Record<Division, string> = {
  gold:   'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3',
  bronze: 'grid grid-cols-2 sm:grid-cols-4 gap-3',
};

function applyFilter(slots: Slot[], filter: Filter): Slot[] {
  if (filter === 'done')      return slots.filter(s => s.matches.some(m => m.status === 'done'));
  if (filter === 'knockouts') return slots.filter(s => s.matches.some(m => m.stage !== 'group'));
  return slots;
}

// Always render fresh on each request. Necessary for live score updates:
// Netlify's CDN cache doesn't reliably invalidate via revalidatePath for App
// Router pages, which broke realtime: router.refresh() would hit a stale
// "Next.js; hit" and viewers wouldn't see new scores. With force-dynamic,
// every request goes to the origin function, RealtimeMatches' router.refresh
// always gets the latest data, and viewers see updates within ~600ms.
export const dynamic = 'force-dynamic';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const sp = await searchParams;
  const filter: Filter =
    sp.filter === 'done' || sp.filter === 'knockouts' ? sp.filter : 'all';

  const [slots, standings] = await Promise.all([getSlots(), getStandings()]);
  const summary = summarizeMatches(slots);
  const visibleSlots = applyFilter(slots, filter);
  const progress = percent(summary.done, summary.total);
  const groupProgress = percent(summary.groupDone, summary.groupTotal);
  const knockoutMatches = slots.flatMap(s => s.matches).filter(m => m.stage !== 'group').length;
  const standingsByDivision = byDivision(standings);

  return (
    <>
      <div className="flex flex-col">
      {/* TOURNAMENT PULSE */}
      <section className="order-2 mb-7 sm:order-1 sm:mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr_1fr] gap-3">
          <div className="pulse-panel rounded-lg p-5 sm:p-6 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="kicker mb-2">Tournament Pulse</div>
                <h2 className="display text-2xl sm:text-3xl font-bold">Tournament dashboard</h2>
                <p className="mt-2 text-sm text-ink-200 max-w-xl">
                  Live scores and schedule updates for players, officials, and supporters.
                </p>
              </div>
              <div className="text-right">
                <div className="num text-4xl font-extrabold leading-none">{progress}%</div>
                <div className="mt-1 text-[10px] uppercase tracking-widest text-ink-300 font-semibold">Complete</div>
              </div>
            </div>
            <div className="mt-5 progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-ink-300">
              <span><span className="num text-ink-50 font-bold">{summary.done}</span> of {summary.total} matches final</span>
              <span><span className="num text-ink-50 font-bold">{summary.groupDone}</span> of {summary.groupTotal} group matches final</span>
            </div>
          </div>

          <PulseMetric label="Group Progress" value={`${groupProgress}%`} note="Gold and Bronze divisions" />
          <PulseMetric label="Knockout Matches" value={knockoutMatches} note="Quarter-finals, semi-finals and finals" gold />
        </div>
      </section>

      {/* MINI STANDINGS */}
      <section className="order-3 mb-10 sm:order-2 sm:mb-14">
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="kicker mb-2">Group Stage</div>
            <h2 className="display text-2xl sm:text-3xl font-bold">Standings</h2>
          </div>
          <a href="/standings" className="inline-flex items-center px-3 py-2 -mx-1 rounded-md text-xs sm:text-sm font-semibold text-ink-100 hover:text-brand-red hover:bg-white/5 transition-colors">
            Full table →
          </a>
        </div>

        <div className="space-y-6">
          {DIVISIONS.map(div => (
            <div key={div}>
              <div className="mb-3 flex items-baseline gap-2">
                <span className={`text-[10px] uppercase tracking-widest font-extrabold ${div === 'gold' ? 'text-brand-gold' : 'text-ink-100'}`}>
                  {divisionLabel[div]} Division
                </span>
                <span className="text-[11px] text-ink-300">{standingsByDivision[div].length} teams</span>
              </div>
              <div className={MINI_GRID[div]}>
                {standingsByDivision[div].map((row, i) => {
                  const rank = i + 1;
                  const isFirst = rank === 1;
                  return (
                    <div key={row.team_id} className="surface surface-hover relative overflow-hidden rounded-lg p-4 shadow-card">
                      <div className={`rank-bg ${isFirst ? 'rank-bg-gold' : ''}`}>{String(rank).padStart(2, '0')}</div>
                      <div className="relative flex flex-col items-center text-center">
                        <TeamLogo team={row} size="md" />
                        <div className={`mt-3 text-[10px] font-bold tracking-widest uppercase ${isFirst ? 'text-brand-gold' : 'text-ink-100'}`}>
                          {ordinal(rank)}
                        </div>
                        <div className="mt-1 font-bold text-sm w-full truncate">{row.name}</div>
                        <div className="mt-2 flex items-baseline gap-1">
                          <span className="num text-2xl font-extrabold">{row.points}</span>
                          <span className="text-[10px] uppercase tracking-wider text-ink-300 font-semibold">pts</span>
                        </div>
                        <div className="text-[11px] text-ink-200 mt-0.5 num">{row.won}W · {row.lost}L</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-[11px] text-ink-300 italic">
          Updated after {summary.groupDone} of {summary.groupTotal} group matches.
        </div>
      </section>

      {/* SCHEDULE */}
      <section id="schedule" className="order-1 scroll-mt-20 mb-10 sm:order-3 sm:mb-0">
        <div className="sticky top-[49px] z-20 -mx-3 mb-4 border-y border-white/5 bg-ink-900/88 px-3 py-3 backdrop-blur-md sm:static sm:mx-0 sm:mb-5 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-0 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="kicker mb-2">{EVENT.kicker}</div>
            <h2 className="display text-2xl sm:text-3xl font-bold">Schedule</h2>
          </div>
          <div className="flex w-full items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:w-auto">
            <FilterChip current={filter} value="all"       label="All"        />
            <FilterChip current={filter} value="done"      label="Done"       />
            <FilterChip current={filter} value="knockouts" label="Knockouts"  />
          </div>
        </div>

        {/* EMPTY STATE — when a filter returns no slots */}
        {visibleSlots.length === 0 && (
          <div className="surface rounded-lg px-6 py-12 text-center text-ink-200 shadow-card">
            {filter === 'done' ? (
              <>
                <div className="text-base font-semibold">No matches completed yet</div>
                <div className="text-sm text-ink-300 mt-1">Scores will appear here as soon as the first match wraps up.</div>
              </>
            ) : (
              <>
                <div className="text-base font-semibold">Nothing to show for this filter</div>
                <div className="mt-3"><FilterChip current={filter} value="all" label="Show everything" /></div>
              </>
            )}
          </div>
        )}

        {visibleSlots.length > 0 && (
          <>
            {/* DESKTOP TABLE — three courts need the full width, so cards stay until lg */}
            <div className="hidden lg:block surface rounded-lg overflow-hidden shadow-card">
              <table className="match-table w-full text-sm">
                <thead className="bg-ink-700/70 border-b border-white/5">
                  <tr className="text-[10px] uppercase tracking-[0.18em] text-ink-200">
                    <th className="text-left px-4 py-3.5 font-bold w-24">Time</th>
                    {COURTS.map(c => (
                      <Fragment key={c}>
                        <th className="text-left px-4 py-3.5 font-bold">{COURT_LABEL[c]}</th>
                        <th className="text-left px-4 py-3.5 font-bold w-28">Referee</th>
                      </Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {visibleSlots.map((slot, i) => (
                    <SlotRow key={slot.id} slot={slot} prevSlot={i > 0 ? visibleSlots[i - 1] : null} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE / TABLET CARDS */}
            <div className="lg:hidden space-y-3">
              {visibleSlots.map((slot, i) => (
                <SlotMobile key={slot.id} slot={slot} prevSlot={i > 0 ? visibleSlots[i - 1] : null} />
              ))}
            </div>
          </>
        )}
      </section>
      </div>
    </>
  );
}

/* ----------------------- helpers + sub-components ----------------------- */

function FilterChip({ current, value, label }: { current: Filter; value: Filter; label: string }) {
  const active = current === value;
  // Default chip targets "/" with no query so the URL stays clean for the common case.
  const href = value === 'all' ? '/#schedule' : `/?filter=${value}#schedule`;
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      scroll={false}
      className={
        active
          ? 'chip-on shrink-0 px-3.5 py-2 rounded-full font-semibold text-xs'
          : 'chip shrink-0 px-3.5 py-2 rounded-full font-semibold text-xs'
      }
    >
      {label}
    </Link>
  );
}

function PulseMetric({
  label,
  value,
  note,
  gold,
}: {
  label: string;
  value: string | number;
  note: string;
  gold?: boolean;
}) {
  return (
    <div className="surface metric-card rounded-lg p-5 shadow-card">
      <div className="text-[10px] uppercase tracking-widest text-ink-300 font-semibold">{label}</div>
      <div className={`relative mt-3 num text-4xl font-extrabold leading-none ${gold ? 'text-brand-gold' : 'text-ink-50'}`}>
        {value}
      </div>
      <div className="relative mt-2 text-xs text-ink-200">{note}</div>
    </div>
  );
}

function percent(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/* ----------------------- desktop slot row ----------------------- */

function SlotRow({ slot, prevSlot }: { slot: Slot; prevSlot: Slot | null }) {
  // Divider before the first slot made up entirely of knockout matches. Bronze
  // semis run alongside Gold group play earlier in the day; those carry their
  // own headings inside the cell instead.
  const showDivider = isAllKnockout(slot) && (!prevSlot || !isAllKnockout(prevSlot));

  if (slot.kind === 'break') {
    const mins = minutesBetween(slot.start_time, slot.end_time);
    return (
      <tr>
        <td className="px-4 py-3 align-middle">
          <div className="num font-bold text-base">{formatTime(slot.start_time)}</div>
          <div className="text-[10px] text-ink-300 num">{formatTime(slot.end_time)}</div>
          <div className="mt-1.5 inline-block px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            {mins} min
          </div>
        </td>
        <td colSpan={TABLE_COLS - 1} className="px-3 py-3">
          <ArcadeBlastBreakCard startTime={slot.start_time} endTime={slot.end_time} durationMin={mins} />
        </td>
      </tr>
    );
  }

  return (
    <>
      {showDivider && (
        <tr className="stage-divider">
          <td colSpan={TABLE_COLS} className="px-5 py-3 text-center">
            <span className="kicker text-brand-gold!" style={{ color: '#D4AF37' }}>Knockout Stage</span>
          </td>
        </tr>
      )}
      <tr className={anyDone(slot) ? 'row-done' : ''}>
        <td className="px-4 py-4 align-top">
          <div className="num font-bold text-base">{formatTime(slot.start_time)}</div>
          <div className="text-[10px] text-ink-300 num">{formatTime(slot.end_time)}</div>
          {statusPill(slot)}
        </td>
        {COURTS.map(c => {
          const m = slot.matches.find(x => x.court === c) ?? null;
          return (
            <Fragment key={c}>
              <td className="px-4 py-4">{m ? <MatchCell match={m} /> : <Free />}</td>
              <td className="px-4 py-4">{m ? <RefCell match={m} /> : <span className="text-ink-300">—</span>}</td>
            </Fragment>
          );
        })}
      </tr>
    </>
  );
}

function RefCell({ match }: { match: Match }) {
  return (
    <div className="text-ink-100 font-medium">
      <div>{match.referee?.name ?? <span className="text-ink-300">{match.stage === 'group' ? '—' : 'TBD'}</span>}</div>
      {match.line_ref_team && (
        <div className="mt-0.5 text-[10px] text-ink-300 leading-tight">Line · {match.line_ref_team.name}</div>
      )}
    </div>
  );
}

function MatchCell({ match }: { match: Match }) {
  const heading = knockoutHeading(match);
  const headingCls = `text-[10px] uppercase tracking-widest font-extrabold mb-1 ${match.bracket_key === 'FINAL' ? 'gold-text' : 'text-brand-gold'}`;

  // Knockout match whose teams aren't all known yet
  if (match.team_a == null || match.team_b == null) {
    const [a, b] = placeholderSides(match.stage_label);
    return (
      <div>
        {heading && <div className={headingCls}>{heading}</div>}
        <div className="space-y-1.5">
          <PendingLine team={match.team_a} fallback={a} />
          <PendingLine team={match.team_b} fallback={b} />
        </div>
      </div>
    );
  }

  const done = match.status === 'done';
  const live = match.status === 'live';

  // No scores entered yet (and not done) — just show team names
  if (!done && !live) {
    return (
      <div>
        {heading && <div className={headingCls}>{heading}</div>}
        <div className="space-y-1.5">
          <TeamLine team={match.team_a} winner={false} done={false} />
          <TeamLine team={match.team_b} winner={false} done={false} />
        </div>
      </div>
    );
  }

  // Winner check: only meaningful once the match is done. During live, neither
  // team should show a check mark — the match isn't over.
  const aWon = done && (match.score_a ?? 0) > (match.score_b ?? 0);
  const bWon = done && (match.score_b ?? 0) > (match.score_a ?? 0);
  const totalA = (match.set1_a ?? 0) + (match.set2_a ?? 0) + (match.set3_a ?? 0);
  const totalB = (match.set1_b ?? 0) + (match.set2_b ?? 0) + (match.set3_b ?? 0);

  return (
    <div>
      {heading && <div className={headingCls}>{heading}</div>}
      {live && (
        <div className="mb-2"><span className="live-pill">Live</span></div>
      )}
      <ScoreGrid match={match} aWon={aWon} bWon={bWon} totalA={totalA} totalB={totalB} />
    </div>
  );
}

/* per-set grid: header row + one row per team */
function ScoreGrid({
  match, aWon, bWon, totalA, totalB,
}: { match: Match; aWon: boolean; bWon: boolean; totalA: number; totalB: number }) {
  return (
    <div className="space-y-1">
      <div className="grid grid-cols-[1fr_repeat(4,28px)] gap-1 text-[9px] uppercase tracking-widest text-ink-300 font-bold">
        <span />
        <span className="text-center">S1</span>
        <span className="text-center">S2</span>
        <span className="text-center">S3</span>
        <span className="text-center">T</span>
      </div>
      <ScoreRow
        team={match.team_a!}
        winner={aWon}
        sets={[match.set1_a, match.set2_a, match.set3_a]}
        total={totalA}
      />
      <ScoreRow
        team={match.team_b!}
        winner={bWon}
        sets={[match.set1_b, match.set2_b, match.set3_b]}
        total={totalB}
      />
    </div>
  );
}

function ScoreRow({ team, winner, sets, total }: {
  team: Team; winner: boolean;
  sets: (number | null)[]; total: number;
}) {
  const labelCls = winner ? 'winner font-bold' : 'loser font-medium';
  const numCls   = winner ? 'num text-center font-semibold text-ink-50' : 'num text-center text-ink-300';
  return (
    <div className="grid grid-cols-[1fr_repeat(4,28px)] gap-1 items-center text-[13px]">
      <div className={`${labelCls} flex items-center gap-2 min-w-0`}>
        <TeamLogo team={team} size="xs" />
        <span className="truncate">{team.name}</span>
        {winner && <span className="ml-1 text-brand-red">✓</span>}
      </div>
      {sets.map((v, i) => (
        <div key={i} className={numCls}>{v ?? <span className="text-ink-400">—</span>}</div>
      ))}
      <div className={`num text-center font-extrabold ${winner ? 'text-ink-50' : 'text-ink-200'}`}>{total}</div>
    </div>
  );
}

function TeamLine({ team, winner, done }: { team: Team; winner: boolean; done: boolean }) {
  const cls = done
    ? winner
      ? 'winner font-bold flex items-center gap-2'
      : 'loser font-medium flex items-center gap-2 line-through decoration-1'
    : 'font-semibold flex items-center gap-2';
  return (
    <div className={cls}>
      <TeamLogo team={team} size="xs" />
      <span className="min-w-0 truncate">{team.name}</span>
    </div>
  );
}

/** One side of a knockout match: the team if already known, else its seed placeholder. */
function PendingLine({ team, fallback }: { team: Team | null; fallback: string }) {
  if (team) return <TeamLine team={team} winner={false} done={false} />;
  return <div className="font-semibold text-ink-100 italic">{fallback}</div>;
}

function statusPill(slot: Slot) {
  // Per-match status badges live inside MatchCell now (so live courts each
  // get their own indicator). Slot-level pill only shows when the WHOLE slot
  // is in a uniform state worth flagging — currently just "all done → Final".
  if (allDone(slot) && !anyLive(slot)) {
    return <div className="mt-2"><span className="pill-final inline-block px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase">Final</span></div>;
  }
  return null;
}

function Free() {
  return <span className="text-[10px] uppercase tracking-widest text-ink-400 font-semibold">Free</span>;
}

function isAllKnockout(slot: Slot) {
  return slot.matches.length > 0 && slot.matches.every(m => m.stage !== 'group');
}
function anyDone(slot: Slot) {
  return slot.matches.some(m => m.status === 'done');
}
function anyLive(slot: Slot) {
  return slot.matches.some(m => m.status === 'live');
}
function allDone(slot: Slot) {
  return slot.matches.length > 0 && slot.matches.every(m => m.status === 'done');
}

/* ----------------------- mobile slot ----------------------- */

function SlotMobile({ slot, prevSlot }: { slot: Slot; prevSlot: Slot | null }) {
  if (slot.kind === 'break') {
    return (
      <ArcadeBlastBreakCard
        startTime={slot.start_time}
        endTime={slot.end_time}
        durationMin={minutesBetween(slot.start_time, slot.end_time)}
      />
    );
  }

  const showDivider = isAllKnockout(slot) && (!prevSlot || !isAllKnockout(prevSlot));

  return (
    <>
      {showDivider && (
          <div className="flex items-center justify-center py-3 stage-divider rounded-lg">
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
  const heading = knockoutHeading(match);
  const headingCls = `text-[11px] uppercase tracking-widest font-extrabold mb-1 ${match.bracket_key === 'FINAL' ? 'gold-text' : 'text-brand-gold'}`;
  const meta = `Court ${match.court}${match.referee ? ` · ${match.referee.name}` : ''}`;

  if (match.team_a == null || match.team_b == null) {
    const [a, b] = placeholderSides(match.stage_label);
    return (
      <div className="surface rounded-lg p-3.5 shadow-card">
        <div className="flex items-center justify-between mb-2">
          <div className="num font-bold">{formatTime(slot.start_time)}</div>
          <span className="text-[10px] text-ink-300 uppercase tracking-wider">{meta}</span>
        </div>
        {heading && <div className={headingCls}>{heading}</div>}
        <div className="space-y-1.5">
          <PendingLine team={match.team_a} fallback={a} />
          <PendingLine team={match.team_b} fallback={b} />
        </div>
      </div>
    );
  }

  const done = match.status === 'done';
  const live = match.status === 'live';
  const aWon = done && (match.score_a ?? 0) > (match.score_b ?? 0);
  const bWon = done && (match.score_b ?? 0) > (match.score_a ?? 0);
  const totalA = (match.set1_a ?? 0) + (match.set2_a ?? 0) + (match.set3_a ?? 0);
  const totalB = (match.set1_b ?? 0) + (match.set2_b ?? 0) + (match.set3_b ?? 0);

  return (
    <div className="surface rounded-lg p-3.5 shadow-card">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="num text-lg font-extrabold leading-none">{formatTime(slot.start_time)}</div>
          <div className="text-[10px] text-ink-300 uppercase tracking-wider">{meta}</div>
        </div>
        {live
          ? <span className="live-pill">Live</span>
          : done
            ? <span className="pill-final px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase">Final {match.score_a}-{match.score_b}</span>
            : <span className="pill-sched px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase">Scheduled</span>}
      </div>

      {heading && <div className={headingCls}>{heading}</div>}

      {!done && !live ? (
        <>
          <div className="flex items-center gap-2 rounded-md bg-white/[0.025] px-2.5 py-2 font-bold"><TeamLogo team={match.team_a} size="xs" /><span className="min-w-0 truncate">{match.team_a.name}</span></div>
          <div className="flex items-center gap-2 rounded-md bg-white/[0.025] px-2.5 py-2 font-bold"><TeamLogo team={match.team_b} size="xs" /><span className="min-w-0 truncate">{match.team_b.name}</span></div>
        </>
      ) : (
        <ScoreGrid match={match} aWon={aWon} bWon={bWon} totalA={totalA} totalB={totalB} />
      )}

      {match.line_ref_team && (
        <div className="mt-2 text-[10px] text-ink-300">Line referee · {match.line_ref_team.name}</div>
      )}
    </div>
  );
}
