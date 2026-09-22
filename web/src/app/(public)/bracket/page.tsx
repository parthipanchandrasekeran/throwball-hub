import { byDivision, getSlots, getStandings } from '@/lib/data';
import { divisionLabel, formatTime, knockoutHeading, placeholderSides, setBreakdown } from '@/lib/format';
import type { BracketKey, Division, Match, Slot, StandingsRow, Team } from '@/lib/types';
import { TeamLogo } from '@/components/TeamLogo';

// Always fresh — see comment in (public)/page.tsx.
export const dynamic = 'force-dynamic';

type Entry = { slot: Slot; match: Match };
type ColumnSpec = { title: string; keys: BracketKey[]; final?: boolean };

const GOLD_COLUMNS: ColumnSpec[] = [
  { title: 'Quarter-finals',    keys: ['QF1', 'QF2'] },
  { title: 'Semi-finals',       keys: ['SF1', 'SF2'] },
  { title: 'Final & 3rd Place', keys: ['FINAL', 'THIRD'], final: true },
];
const BRONZE_COLUMNS: ColumnSpec[] = [
  { title: 'Semi-finals', keys: ['SF1', 'SF2'] },
  { title: 'Final',       keys: ['FINAL'], final: true },
];

export default async function BracketPage() {
  const [slots, standings] = await Promise.all([getSlots(), getStandings()]);

  // pull knockout matches out of the slot list
  const knockouts: Entry[] = slots.flatMap(s =>
    s.matches.filter(m => m.stage !== 'group').map(match => ({ slot: s, match })),
  );
  const seeds = byDivision(standings);
  const gold   = knockouts.filter(e => e.match.division === 'gold');
  const bronze = knockouts.filter(e => e.match.division === 'bronze');

  return (
    <section>
      <div className="mb-6">
        <div className="kicker mb-2">Knockout Stage</div>
        <h2 className="display text-3xl sm:text-4xl font-bold">Bracket</h2>
        <p className="text-ink-200 text-sm mt-2 max-w-xl">
          Two divisions, two brackets. In Gold the top two seeds skip to the semi-finals while
          3rd to 6th play quarter-finals. In Bronze all four teams are seeded into the semi-finals.
        </p>
      </div>

      <div className="pulse-panel rounded-lg p-5 sm:p-6 mb-8 shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <BracketMetric label="Gold Knockouts" value={gold.length} accent />
          <BracketMetric label="Bronze Knockouts" value={bronze.length} />
          <div className="text-sm text-ink-200">
            Each bracket locks in from its division&apos;s table, then updates as results are entered.
          </div>
        </div>
      </div>

      <div className="space-y-14">
        <DivisionBracket division="gold"   seeds={seeds.gold}   seedCount={6} entries={gold}   columns={GOLD_COLUMNS} />
        <DivisionBracket division="bronze" seeds={seeds.bronze} seedCount={4} entries={bronze} columns={BRONZE_COLUMNS} />
      </div>
    </section>
  );
}

function DivisionBracket({
  division, seeds, seedCount, entries, columns,
}: {
  division: Division;
  seeds: StandingsRow[];
  seedCount: number;
  entries: Entry[];
  columns: ColumnSpec[];
}) {
  const shown = seeds.slice(0, seedCount);
  const byKey = (k: BracketKey) => entries.find(e => e.match.bracket_key === k) ?? null;
  // Static class strings so Tailwind can see them.
  const seedGrid = seedCount === 6
    ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8'
    : 'grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8';
  const columnGrid = columns.length === 3
    ? 'grid grid-cols-1 lg:grid-cols-3 gap-6'
    : 'grid grid-cols-1 lg:grid-cols-2 gap-6';

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className={`display text-xl sm:text-2xl font-bold ${division === 'gold' ? 'text-brand-gold' : 'text-ink-50'}`}>
          {divisionLabel[division]} Division
        </h3>
        <span className="text-xs text-ink-300">{seedCount} teams · {entries.length} knockout matches</span>
      </div>

      {/* Seeds */}
      <div className={seedGrid}>
        {shown.length > 0 ? shown.map((s, i) => (
          <div key={s.team_id} className="surface surface-hover rounded-lg p-4 shadow-card">
            <div className={`text-[10px] font-bold tracking-widest uppercase ${i === 0 ? 'text-brand-gold' : 'text-ink-100'}`}>
              Seed {i + 1}
            </div>
            <div className="mt-2 font-bold flex items-center gap-2.5">
              <TeamLogo team={s} size="sm" />
              <span className="truncate">{s.name}</span>
            </div>
            <div className="text-[11px] text-ink-200 mt-1 num">{s.points} pts · {s.won}W·{s.lost}L</div>
          </div>
        )) : (
          <div className="col-span-full text-center text-ink-300 italic py-8 surface rounded-lg shadow-card">
            Seeds will appear once the group stage completes.
          </div>
        )}
      </div>

      {/* Bracket columns */}
      <div className={columnGrid}>
        {columns.map(col => (
          <Column key={col.title} title={col.title} final={col.final}>
            {col.keys.map(k => {
              const e = byKey(k);
              return e ? <BracketCard key={k} entry={e} highlight={k === 'FINAL'} /> : null;
            })}
          </Column>
        ))}
      </div>
    </div>
  );
}

function Column({ title, final, children }: { title: string; final?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className={`text-[10px] uppercase tracking-[0.2em] font-extrabold ${final ? 'text-ink-50' : 'text-brand-gold'}`}>
        {title}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function BracketMetric({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div>
      <div className={`num text-4xl font-extrabold leading-none ${accent ? 'text-brand-gold' : 'text-ink-50'}`}>{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-widest text-ink-300 font-semibold">{label}</div>
    </div>
  );
}

function BracketCard({ entry: { slot, match }, highlight }: { entry: Entry; highlight?: boolean }) {
  const done = match.status === 'done';
  const [fa, fb] = placeholderSides(match.stage_label);
  const aWon = done && (match.score_a ?? 0) > (match.score_b ?? 0);
  const bWon = done && (match.score_b ?? 0) > (match.score_a ?? 0);
  const sets = done ? setBreakdown(match) : null;

  return (
    <div className={`surface surface-hover rounded-lg p-4 ${highlight ? 'shadow-card border-brand-gold/25' : 'shadow-card'}`}>
      <div className={`text-[10px] uppercase tracking-widest font-extrabold mb-2 ${match.bracket_key === 'FINAL' ? 'gold-text' : 'text-brand-gold'}`}>
        {knockoutHeading(match)}
      </div>
      <div className="flex items-center justify-between mb-2 text-[10px] text-ink-300 uppercase tracking-wider">
        <span className="num">{formatTime(slot.start_time)}</span>
        <span>Court {match.court}{match.referee ? ` · ${match.referee.name}` : ''}</span>
      </div>
      <div className="space-y-2">
        <SideLine team={match.team_a} fallback={fa} score={done ? match.score_a : null} winner={aWon} />
        <SideLine team={match.team_b} fallback={fb} score={done ? match.score_b : null} winner={bWon} />
      </div>
      {sets && (
        <div className="mt-2 pt-2 border-t border-white/5 num text-[11px] text-ink-300">{sets}</div>
      )}
      {match.status === 'live' && (
        <div className="mt-2"><span className="live-pill">Live</span></div>
      )}
    </div>
  );
}

/** One side of a knockout card: the team if known (with sets won once done), else its placeholder. */
function SideLine({ team, fallback, score, winner }: {
  team: Team | null; fallback: string; score: number | null; winner: boolean;
}) {
  if (!team) return <div className="font-semibold text-ink-100 italic text-sm">{fallback}</div>;
  return (
    <div className={`flex items-center gap-2 font-bold ${winner ? 'winner' : ''}`}>
      <TeamLogo team={team} size="xs" />
      <span className="truncate flex-1 min-w-0">{team.name}</span>
      {score != null && <span className={`num text-sm ${winner ? 'text-ink-50' : 'text-ink-300'}`}>{score}</span>}
      {winner && <span className="text-brand-red">✓</span>}
    </div>
  );
}
