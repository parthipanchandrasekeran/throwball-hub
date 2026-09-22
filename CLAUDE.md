# Throwball Hub — session context primer

Read this first if you're picking up a session on this project cold. Pairs with the
top-level `README.md` (run/setup) and `web/AGENTS.md` (Next.js version warning).

## What this is

Tournament scoring web app for the **Throwball Federation of Canada**. Public
site shows schedule/standings/bracket; admin enters live scores and results.

Currently loaded: **TFC Throwball Tournament, September 2026** — 10 teams in
two divisions (Gold 6 / Bronze 4), 3 courts, 30 matches. The previous event
(Women's National Championship, 9 May 2026) is archived in
`docs/archive/2026-05-09-womens-nationals.json`. Event name/date/counts live in
`web/src/lib/event.ts`.

## Live URLs

Public viewer pages:
- Schedule (home): https://throwball-hub.netlify.app
- Standings: https://throwball-hub.netlify.app/standings
- Bracket: https://throwball-hub.netlify.app/bracket

Admin:
- https://throwball-hub.netlify.app/admin

Backend:
- Supabase dashboard: https://supabase.com/dashboard/project/fbvzlbgyxuucjgutugkk

## Stack

- Next.js 15 App Router (TypeScript, Tailwind v4) — **NOT vanilla Next.js**, see
  `web/AGENTS.md`. Always read `node_modules/next/dist/docs/` before writing
  Next.js code.
- Supabase Postgres + RLS (project ref `fbvzlbgyxuucjgutugkk`, region `ca-central-1`)
- Netlify hosting

## Repo layout

```
throwball-hub/
├── preview/                 design lock — static HTML of schedule page
└── web/                     Next.js app (the real product)
    ├── src/app/(public)/    public pages: schedule, standings, bracket
    ├── src/app/admin/       admin: login, score/[id], result/[id]
    └── src/lib/
        ├── data.ts          Supabase queries (getSlots, getStandings)
        ├── supabase.ts      client
        └── types.ts         shared types
```

## Database

Project ref: `fbvzlbgyxuucjgutugkk` — use Supabase MCP for queries.

Tables (all RLS-enabled):

- `teams` (10 rows) — `id`, `name`, `short_name`, `color`, `logo_url`,
  `division` (`'gold' | 'bronze'`)
- `referees` (5 rows)
- `slots` (12 rows) — time slots; `display_order`, `start_time`, `end_time`,
  `kind` (`play`/`break`), optional `bye_team_id` (unused this event)
- `matches` (30 rows) — see below

`standings` is a **view**, derived from `matches`; includes `division` so the
app renders one table per division. Don't write to it.

### `matches` columns that matter

- `court` — 1, 2 or 3 (Court 2 is the Bronze court)
- `division` — `'gold' | 'bronze'` (stored on the match because knockout rows
  have no teams until the bracket fills)
- `stage` — `'group' | 'qf' | 'sf' | 'final' | 'third_place'`
- `bracket_key` — `'QF1' | 'QF2' | 'SF1' | 'SF2' | 'FINAL' | 'THIRD'`, null for
  group matches. Knockouts are identified by `(division, bracket_key)`, never
  by court.
- `status` — `'scheduled' | 'live' | 'done'`
- `score_a`, `score_b` — sets won (final result)
- `set1_a/b`, `set2_a/b`, `set3_a/b` — points per set
- `team_a_id`, `team_b_id` — null for knockout matches until the bracket fills
- `referee_id` (FK), `line_ref_team_id` (FK → teams; the team on line duty)

## Tournament flow (Sept 2026)

- **Gold**: 6 teams, 15 group matches, then QF1 (3rd v 6th), QF2 (4th v 5th),
  SF1 (1st v QF2 winner), SF2 (2nd v QF1 winner), Final, 3rd Place.
- **Bronze**: 4 teams, 6 group matches, then SF1 (1st v 4th), SF2 (2nd v 3rd),
  Final. No 3rd-place match.
- Knockout `team_a_id`/`team_b_id` **auto-populate** via the
  `matches_auto_advance` trigger (function rewritten in migration
  `sept_2026_two_divisions`), per division:
  - All of a division's group matches `'done'` → seeds read from `standings`
    filtered to that division. Gold fills QF1/QF2 and the `team_a` side of
    SF1/SF2; Bronze fills both SFs.
  - A Gold QF done → its winner fills `team_b` of the cross SF (QF2 → SF1,
    QF1 → SF2).
  - Both SFs done → Final = winners; 3rd Place = losers (Gold only).
- Trigger only fills `NULL` slots (`coalesce`), so manual overrides via
  `/admin/result/<id>` (RPC `admin_assign_knockout_teams`) still win. The
  admin form only offers teams from the match's division.
- Reopening a finalised match (status back to `scheduled`/`live`) does NOT
  undo earlier auto-assignments — clear `team_a_id`/`team_b_id` manually if
  you want to re-run the assignment.

## Common ops

### Reset all scores for testing

```sql
-- Clears scores + status, leaves group team assignments intact
UPDATE matches
SET status='scheduled',
    score_a=NULL, score_b=NULL,
    set1_a=NULL, set1_b=NULL,
    set2_a=NULL, set2_b=NULL,
    set3_a=NULL, set3_b=NULL;

-- Knockout slots also need teams cleared so they regenerate from group results
UPDATE matches
SET team_a_id=NULL, team_b_id=NULL
WHERE stage IN ('qf','sf','final','third_place');
```

Run via Supabase MCP `execute_sql` (project `fbvzlbgyxuucjgutugkk`).

## Environment

`web/.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

Anon key is safe to expose — only allows `SELECT` per RLS policies. Admin
writes use the service-role key server-side.
