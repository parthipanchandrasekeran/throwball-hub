import { getSlots, getStandings } from '@/lib/data';
import { formatTime } from '@/lib/format';
import type { Match, Slot } from '@/lib/types';

export const revalidate = 0;

export default async function BracketPage() {
  const [slots, standings] = await Promise.all([getSlots(), getStandings()]);

  // pull knockout matches out of the slot list
  const knockoutSlots = slots.filter(s => s.matches.some(m => m.stage !== 'group'));
  const sf  = collect(knockoutSlots, 'sf');
  const fin = collect(knockoutSlots, 'final')[0]       ?? null;
  const trd = collect(knockoutSlots, 'third_place')[0] ?? null;

  const seeds = standings.slice(0, 4);

  return (
    <section>
      <div className="mb-6">
        <div className="kicker mb-2">Knockout Stage</div>
        <h2 className="display text-3xl sm:text-4xl font-bold">Bracket</h2>
        <p className="text-ink-200 text-sm mt-2 max-w-xl">
          Top 4 group-stage seeds advance. Semi-finals play first; winners contest the gold,
          losers play for bronze.
        </p>
      </div>

      {/* Seeds */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {seeds.length > 0 ? seeds.map((s, i) => (
          <div key={s.team_id} className="surface rounded-xl p-4">
            <div className={`text-[10px] font-bold tracking-widest uppercase ${i === 0 ? 'text-brand-gold' : 'text-ink-100'}`}>
              Seed {i + 1}
            </div>
            <div className="mt-1 font-bold flex items-center">
              <span
                className="team-dot"
                style={{
                  background: s.color,
                  boxShadow: s.color.toLowerCase() === '#1f1f1f' ? '0 0 0 2px rgba(255,255,255,0.18)' : undefined,
                }}
              />
              {s.name}
            </div>
            <div className="text-[11px] text-ink-200 mt-1 num">{s.points} pts · {s.won}W·{s.lost}L</div>
          </div>
        )) : (
          <div className="col-span-2 sm:col-span-4 text-center text-ink-300 italic py-8 surface rounded-xl">
            Seeds will appear once the group stage completes.
          </div>
        )}
      </div>

      {/* Bracket */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Column title="Semi-finals" tone="gold">
          {sf.map(({ slot, match }) => (
            <BracketCard key={match.id} slot={slot} match={match} />
          ))}
        </Column>
        <Column title="Final" tone="champion">
          {fin && <BracketCard slot={fin.slot} match={fin.match} highlight />}
        </Column>
        <Column title="3rd Place" tone="bronze">
          {trd && <BracketCard slot={trd.slot} match={trd.match} />}
        </Column>
      </div>
    </section>
  );
}

function Column({ title, tone, children }: { title: string; tone: 'gold' | 'champion' | 'bronze'; children: React.ReactNode }) {
  const heading = tone === 'champion' ? 'gold-text' : 'text-brand-gold';
  return (
    <div className="space-y-3">
      <div className={`text-[10px] uppercase tracking-[0.2em] font-extrabold ${heading}`}>
        {tone === 'champion' && '★ '}{title}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function BracketCard({ slot, match, highlight }: { slot: Slot; match: Match; highlight?: boolean }) {
  const known = match.team_a && match.team_b;
  return (
    <div className={`surface rounded-xl p-4 ${highlight ? 'shadow-card' : ''}`}>
      <div className="flex items-center justify-between mb-2 text-[10px] text-ink-300 uppercase tracking-wider">
        <span className="num">{formatTime(slot.start_time)}</span>
        <span>Court {match.court}</span>
      </div>
      {known ? (
        <div className="space-y-1.5">
          <div className="font-bold flex items-center">
            <span
              className="team-bar"
              style={{
                background: match.team_a!.color,
                boxShadow: match.team_a!.color.toLowerCase() === '#1f1f1f' ? '0 0 0 2px rgba(255,255,255,0.18)' : undefined,
              }}
            />{match.team_a!.name}
          </div>
          <div className="font-bold flex items-center">
            <span
              className="team-bar"
              style={{
                background: match.team_b!.color,
                boxShadow: match.team_b!.color.toLowerCase() === '#1f1f1f' ? '0 0 0 2px rgba(255,255,255,0.18)' : undefined,
              }}
            />{match.team_b!.name}
          </div>
        </div>
      ) : (
        <div className="font-semibold text-ink-100 italic text-sm">{match.stage_label}</div>
      )}
    </div>
  );
}

function collect(slots: Slot[], stage: 'sf' | 'final' | 'third_place') {
  const out: { slot: Slot; match: Match }[] = [];
  for (const s of slots) {
    for (const m of s.matches) {
      if (m.stage === stage) out.push({ slot: s, match: m });
    }
  }
  return out;
}
