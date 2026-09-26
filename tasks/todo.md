# Sept 2026 tournament schedule load

Source: `C:\Users\pc\Downloads\TFC Sept 2026 Tournament Schedule.pdf`
Plan: `C:\Users\pc\.claude\plans\zazzy-petting-horizon.md`

## Tasks

- [x] Archive May 2026 data to `docs/archive/2026-05-09-womens-nationals.json`
- [x] Migration `sept_2026_two_divisions` (division, court 1-3, qf stage, bracket_key, line_ref_team_id, standings view, trigger rewrite)
- [x] Load Sept data: 10 teams, 5 referees, 12 slots, 30 matches
- [x] Sanity query: 15 gold + 6 bronze group matches, 5 per gold team, 3 per bronze team
- [x] Frontend: types, data, format, event constant
- [x] Frontend: schedule page (3 courts, line refs, division mini-standings, knockout headings)
- [x] Frontend: standings page (per division)
- [x] Frontend: bracket page (Gold QF/SF/F/3rd, Bronze SF/F)
- [x] Frontend: admin dashboard + result page (qf, division filter)
- [x] Frontend: header stats, countdown, metadata, UTM campaign
- [x] Docs: CLAUDE.md database section, README blurb
- [x] Verify: `npm run build`
- [x] Verify: trigger dry run in a rolled-back DO block
- [x] Verify: local preview screenshots (desktop + mobile)
- [x] Commit (88c1eff), push, confirm Netlify deploy is live (2026-09-22: `/`, `/standings`, `/bracket` serve the three-court, two-division layout)

## Review

- Sanity query after load: teams 10, referees 5, slots 12, matches 30
  (15 Gold group, 6 Bronze group, 9 knockouts); every Gold team in 5 group
  matches, every Bronze team in 3; no cross-division pairings; every group
  row has a referee and a line-referee team.
- Trigger dry run (all group matches 2-0 to team A, then QFs, then SFs)
  produced: Bronze SF1 = KWC v KW, SF2 = Ruach v Sonic Squad; Gold QF1 =
  Super Sonics v Canadian Warriors, QF2 = Waterloo v Sauga Slayers,
  SF1.a = GTA, SF2.a = Sauga Strikers; after QFs SF1 = GTA v Waterloo,
  SF2 = Strikers v Sonics; after SFs Gold Final = GTA v Strikers, 3rd =
  Waterloo v Sonics, Bronze Final = KWC v Ruach. All rolled back; confirmed
  0 rows with scores or knockout teams afterwards.
- `next build` passes (TypeScript clean). Only warning is the pre-existing
  middleware -> proxy deprecation notice from Next 16.
- Local preview checked at 1400px (three-court table, per-division standings,
  both brackets) and 375px (stacked cards with court, referee and line
  referee).

## Open items for the user

- ~~Tournament date is not in the PDF~~ — set to Sat 26 Sept 2026, 9:00 AM
  Toronto in `web/src/lib/event.ts`; countdown is back on.
- ~~Six new teams have no logo~~ — added 2026-09-25 from the user's
  `archive (6)` folder via `web/scripts/make-logo.mjs` (trim + square + 512px);
  `teams.logo_url` set for all ten teams. Returning teams kept their existing
  logos even though newer files were supplied (GTA Fireballs, Sauga Strikers,
  Sauga Slayers, Super Sonics).
- Admin accounts: admin1–admin5 (2026-09-25). Values in `web/.env.local` and
  mirrored to Netlify env vars via the CLI; site redeployed.
