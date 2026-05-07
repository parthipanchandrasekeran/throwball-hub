'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TeamLogo } from '@/components/TeamLogo';
import type { Team } from '@/lib/types';
import { incrementScore, finalizeMatch, reopenMatch, markLive } from './actions';

type LiveMatch = {
  id: number;
  court: number;
  status: 'scheduled' | 'live' | 'done';
  score_a: number | null;
  score_b: number | null;
  set1_a: number | null; set1_b: number | null;
  set2_a: number | null; set2_b: number | null;
  set3_a: number | null; set3_b: number | null;
  team_a: Team;
  team_b: Team;
  referee: { name: string } | null;
  slot: { start_time: string; end_time: string };
};

const formatTime = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour}:${m.toString().padStart(2, '0')}`;
};

export function LiveScore({ initial }: { initial: LiveMatch }) {
  const [match, setMatch] = useState<LiveMatch>(initial);
  const [activeSet, setActiveSet] = useState<1 | 2 | 3>(() => guessActiveSet(initial));
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  // keep local state in sync if server pushes a fresher version
  useEffect(() => {
    setMatch(initial);
  }, [initial]);

  const setVal = (n: 1 | 2 | 3, side: 'a' | 'b') => {
    const k = `set${n}_${side}` as const;
    return match[k] ?? 0;
  };

  const setHasScores = (n: 1 | 2 | 3) =>
    match[`set${n}_a` as const] != null || match[`set${n}_b` as const] != null;

  const setWinner = (n: 1 | 2 | 3): 'a' | 'b' | null => {
    const a = match[`set${n}_a` as const];
    const b = match[`set${n}_b` as const];
    if (a == null || b == null) return null;
    if (a > b) return 'a'; if (b > a) return 'b'; return null;
  };

  const handleTap = (n: 1 | 2 | 3, side: 'a' | 'b', delta: 1 | -1) => {
    // Optimistic update — instant feedback
    const key = `set${n}_${side}` as const;
    const current = match[key] ?? 0;
    const next = Math.max(0, current + delta);
    setMatch({ ...match, [key]: next, status: match.status === 'scheduled' ? 'live' : match.status });
    setActiveSet(n);

    startTransition(async () => {
      try {
        await incrementScore(match.id, n, side, delta);
      } catch (e) {
        // Rollback on error
        setMatch(initial);
        alert((e as Error).message);
      }
    });
  };

  const handleFinalize = () => {
    if (!confirm(`Mark match complete?\n\nSet 1: ${setVal(1,'a')} – ${setVal(1,'b')}\nSet 2: ${setVal(2,'a')} – ${setVal(2,'b')}${setHasScores(3) ? `\nSet 3: ${setVal(3,'a')} – ${setVal(3,'b')}` : ''}`)) return;
    startTransition(async () => {
      try { await finalizeMatch(match.id); } catch (e) { alert((e as Error).message); }
    });
  };

  const handleReopen = () => {
    if (!confirm('Reopen this match for editing? Sets-won counts will be cleared.')) return;
    startTransition(async () => {
      try {
        await reopenMatch(match.id);
        router.refresh();
      } catch (e) { alert((e as Error).message); }
    });
  };

  const handleStartMatch = () => {
    startTransition(async () => {
      try { await markLive(match.id); router.refresh(); } catch (e) { alert((e as Error).message); }
    });
  };

  const isDone = match.status === 'done';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
      <Link href="/admin" className="text-xs text-ink-200 hover:text-ink-50 font-semibold inline-flex items-center gap-1">
        <span>←</span> All matches
      </Link>

      <div className="surface rounded-xl shadow-card p-4 sm:p-5 mt-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="kicker mb-1.5 text-[10px]">
              {formatTime(match.slot.start_time)} — {formatTime(match.slot.end_time)} · Court {match.court}
              {match.referee && <> · Ref {match.referee.name}</>}
            </div>
            <h1 className="display text-xl sm:text-2xl font-bold leading-tight">
              {match.team_a.name} <span className="text-ink-300">vs</span> {match.team_b.name}
            </h1>
          </div>
          <StatusPill status={match.status} />
        </div>

        {/* If match is done, show summary + reopen */}
        {isDone ? (
          <div className="mt-5">
            <div className="text-center py-6 surface rounded-lg">
              <div className="text-[11px] uppercase tracking-widest text-ink-300 font-semibold">Final</div>
              <div className="num text-4xl font-extrabold mt-1">
                {match.score_a} <span className="text-ink-300">–</span> {match.score_b}
              </div>
              <div className="text-xs text-ink-300 mt-1">sets</div>
            </div>
            <div className="space-y-2 mt-4 text-sm">
              <SummaryRow label="Set 1" a={setVal(1,'a')} b={setVal(1,'b')} winner={setWinner(1)} hasScore={setHasScores(1)} teamA={match.team_a.name} teamB={match.team_b.name} />
              <SummaryRow label="Set 2" a={setVal(2,'a')} b={setVal(2,'b')} winner={setWinner(2)} hasScore={setHasScores(2)} teamA={match.team_a.name} teamB={match.team_b.name} />
              <SummaryRow label="Set 3" a={setVal(3,'a')} b={setVal(3,'b')} winner={setWinner(3)} hasScore={setHasScores(3)} teamA={match.team_a.name} teamB={match.team_b.name} />
            </div>
            <button onClick={handleReopen} disabled={pending} className="mt-5 chip w-full px-4 py-3 rounded-md font-semibold text-sm disabled:opacity-60">
              ↶ Reopen match for editing
            </button>
          </div>
        ) : (
          <>
            {/* Set tabs */}
            <div className="mt-5 grid grid-cols-3 gap-2">
              {[1,2,3].map((n) => (
                <SetTab
                  key={n}
                  n={n as 1|2|3}
                  active={activeSet === n}
                  hasScore={setHasScores(n as 1|2|3)}
                  scoreA={setVal(n as 1|2|3,'a')}
                  scoreB={setVal(n as 1|2|3,'b')}
                  onClick={() => setActiveSet(n as 1|2|3)}
                />
              ))}
            </div>

            {/* Score rows for active set */}
            <div className="mt-5 space-y-3">
              <ScoreCard
                team={match.team_a}
                value={setVal(activeSet, 'a')}
                onPlus={() => handleTap(activeSet, 'a', 1)}
                onMinus={() => handleTap(activeSet, 'a', -1)}
                disabled={pending}
              />
              <ScoreCard
                team={match.team_b}
                value={setVal(activeSet, 'b')}
                onPlus={() => handleTap(activeSet, 'b', 1)}
                onMinus={() => handleTap(activeSet, 'b', -1)}
                disabled={pending}
              />
            </div>

            {/* Bottom: summary + finalize */}
            <div className="mt-6 pt-5 border-t border-white/5">
              <div className="kicker mb-3 text-[10px]">Match summary</div>
              <div className="space-y-2 mb-5 text-sm">
                <SummaryRow label="Set 1" a={setVal(1,'a')} b={setVal(1,'b')} winner={setWinner(1)} hasScore={setHasScores(1)} teamA={match.team_a.name} teamB={match.team_b.name} live={activeSet === 1 && match.status === 'live'} />
                <SummaryRow label="Set 2" a={setVal(2,'a')} b={setVal(2,'b')} winner={setWinner(2)} hasScore={setHasScores(2)} teamA={match.team_a.name} teamB={match.team_b.name} live={activeSet === 2 && match.status === 'live'} />
                <SummaryRow label="Set 3" a={setVal(3,'a')} b={setVal(3,'b')} winner={setWinner(3)} hasScore={setHasScores(3)} teamA={match.team_a.name} teamB={match.team_b.name} live={activeSet === 3 && match.status === 'live'} />
              </div>

              {match.status === 'scheduled' && !setHasScores(1) && !setHasScores(2) && !setHasScores(3) ? (
                <button onClick={handleStartMatch} disabled={pending} className="btn-primary w-full font-bold py-3 rounded-md text-sm uppercase tracking-widest disabled:opacity-60">
                  Start match
                </button>
              ) : (
                <button onClick={handleFinalize} disabled={pending} className="btn-gold w-full font-bold py-3.5 rounded-md text-sm uppercase tracking-widest disabled:opacity-60">
                  ✓ Mark match complete
                </button>
              )}

              <div className="mt-3 text-center text-[11px] text-ink-300">
                {match.status === 'scheduled'
                  ? 'Tap "Start match" or just tap +1 to begin scoring.'
                  : 'Tap "Mark match complete" once the match is over. Scores get locked in and standings update.'}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Direct-final-entry escape hatch */}
      <div className="mt-4 text-center">
        <Link href={`/admin/result/${match.id}`} className="text-[11px] text-ink-300 hover:text-ink-100 underline underline-offset-2">
          Need to type set scores directly? Use the final-entry form →
        </Link>
      </div>
    </div>
  );
}

/* -------- helpers -------- */

function guessActiveSet(m: { set1_a: number | null; set1_b: number | null; set2_a: number | null; set2_b: number | null; set3_a: number | null; set3_b: number | null }): 1 | 2 | 3 {
  if (m.set3_a != null || m.set3_b != null) return 3;
  if (m.set2_a != null || m.set2_b != null) return 2;
  return 1;
}

function StatusPill({ status }: { status: 'scheduled'|'live'|'done' }) {
  if (status === 'live') {
    return (
      <span className="live-pill">Live</span>
    );
  }
  if (status === 'done') {
    return <span className="pill-final px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Final</span>;
  }
  return <span className="pill-sched px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Scheduled</span>;
}

function SetTab({ n, active, hasScore, scoreA, scoreB, onClick }: {
  n: 1|2|3; active: boolean; hasScore: boolean; scoreA: number; scoreB: number; onClick: () => void;
}) {
  let tone = 'set-tab';
  if (active) tone += ' active';
  else if (hasScore) tone += ' done';
  else tone += ' future';
  return (
    <button onClick={onClick} className={tone}>
      <span>
        Set {n}
        {hasScore && <span className="ml-1.5 num font-bold">{scoreA}–{scoreB}</span>}
      </span>
    </button>
  );
}

function ScoreCard({ team, value, onPlus, onMinus, disabled }: {
  team: Team; value: number;
  onPlus: () => void; onMinus: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="score-row">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <TeamLogo team={team} size="sm" />
          <div className="team-name truncate">{team.name}</div>
        </div>
        <div className="big-num">{value}</div>
      </div>
      <div className="grid grid-cols-[1fr_64px] gap-2 items-stretch">
        <button onClick={onPlus} disabled={disabled} className="btn-plus disabled:opacity-60">+ 1</button>
        <button onClick={onMinus} disabled={disabled || value === 0} className="btn-minus disabled:opacity-30">−1</button>
      </div>
    </div>
  );
}

function SummaryRow({ label, a, b, winner, hasScore, teamA, teamB, live }: {
  label: string; a: number; b: number; winner: 'a'|'b'|null; hasScore: boolean;
  teamA: string; teamB: string; live?: boolean;
}) {
  if (!hasScore) {
    return (
      <div className="summary-pill w-full justify-between opacity-50">
        <span className="text-ink-300">{label}</span>
        <span className="text-ink-400 text-xs">— not played —</span>
        <span></span>
      </div>
    );
  }
  return (
    <div className={`summary-pill w-full justify-between ${live ? 'border-brand-red/35' : ''}`}>
      <span className="text-ink-300">{label}</span>
      <span className="num font-bold text-ink-50 text-xs">
        {teamA.split(' ').slice(-1)[0]} <span className={winner==='a' ? 'text-emerald-400' : ''}>{a}</span>
        <span className="text-ink-300"> – </span>
        <span className={winner==='b' ? 'text-emerald-400' : ''}>{b}</span> {teamB.split(' ').slice(-1)[0]}
      </span>
      {live ? (
        <span className="text-brand-red font-bold text-[10px] tracking-widest flex items-center gap-1.5">
          <span className="pulse-dot" /> LIVE
        </span>
      ) : (
        <span className="text-emerald-400 font-bold text-[10px] tracking-widest">DONE</span>
      )}
    </div>
  );
}
