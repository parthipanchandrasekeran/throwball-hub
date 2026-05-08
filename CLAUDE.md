# Throwball Hub — session context primer

Read this first if you're picking up a session on this project cold. Pairs with the
top-level `README.md` (run/setup) and `web/AGENTS.md` (Next.js version warning).

## What this is

Tournament scoring web app for the **Throwball Federation of Canada — Women's
National Championship 2026**. Public site shows schedule/standings/bracket;
admin enters live scores and results.

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

- `teams` (6 rows) — `id`, `name`, `short_name`, `color`, `logo_url`
- `referees` (3 rows)
- `slots` (11 rows) — time slots; `display_order`, `start_time`, `end_time`,
  `kind`, optional `bye_team_id`
- `matches` (19 rows) — see below

`standings` is a **view**, derived from `matches`. Don't write to it.

### `matches` columns that matter

- `court` — 1 or 2
- `stage` — `'group' | 'sf' | 'final' | 'third_place'`
- `status` — `'scheduled' | 'live' | 'done'`
- `score_a`, `score_b` — sets won (final result)
- `set1_a/b`, `set2_a/b`, `set3_a/b` — points per set
- `team_a_id`, `team_b_id` — null for knockout matches until groups finish
- `referee` (FK)

## Tournament flow

- 6 teams, 15 group-stage matches (round-robin)
- 4 knockout matches: 2× SF, 1× Final, 1× third-place
- Knockout `team_a_id`/`team_b_id` **auto-populate** via the
  `matches_auto_advance` trigger (migration `auto_advance_brackets`):
  - All 15 group matches → status `'done'`: SF court 1 = seed1 vs seed4,
    SF court 2 = seed2 vs seed3 (seeds read from `standings` view).
  - Both SFs done: Final = SF1 winner vs SF2 winner, 3rd-place = SF1 loser
    vs SF2 loser.
- Trigger only fills `NULL` slots, so manual overrides via
  `/admin/result/<id>` (RPC `admin_assign_knockout_teams`) still win.
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
WHERE stage IN ('sf','final','third_place');
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
