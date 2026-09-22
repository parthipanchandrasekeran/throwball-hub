# Throwball Hub

Tournament site for the **Throwball Federation of Canada**. Currently loaded with the
TFC Throwball Tournament, September 2026 (Gold and Bronze divisions). Previous events are
archived under `docs/archive/`.

## Layout

```
throwball-hub/
├── preview/        # static HTML preview of the schedule page (design lock)
└── web/            # Next.js 15 app (the real product)
```

## Stack

- Next.js 15 (App Router, TypeScript, Tailwind v4)
- Supabase (Postgres + RLS)
- Hosted on Netlify (Phase 2)

## Phase status

- [x] **Phase 1** — Schema, seed data, public site (Schedule, Standings, Bracket)
- [ ] **Phase 2** — Admin login + result entry
- [ ] **Phase 3** — Netlify deploy

## Run locally

```bash
cd web
npm install
npm run dev
```

Then open http://localhost:3000

## Environment

`web/.env.local` holds:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

The anon/publishable key is safe to expose — it only allows the `SELECT` policies
defined in the schema. Admin writes (Phase 2) will use the service-role key
server-side.

## Database

Project: `throwball-hub` · Region: `ca-central-1` · Org: parthipanchandrasekeran's Org

Tables: `teams`, `referees`, `slots`, `matches` · View: `standings`

Seed (Sept 2026): 10 teams in two divisions, 5 referees, 12 time slots, 30 matches
(15 Gold + 6 Bronze group, 9 knockout placeholders). See `CLAUDE.md` for the schema.
