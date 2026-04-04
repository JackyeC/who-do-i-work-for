# Run metadata

- **Run id:** `run-20260404T195535Z`
- **Mode:** `bi-hourly`
- **UTC time (prepare):** `2026-04-04T19:55:35Z`
- **UTC time (generation complete):** `2026-04-04T20:05:00Z`
- **Output directory:** `newsletter/outputs/live/run-20260404T195535Z`
- **Generation status:** `completed`

## Ingest method

- **HOT_SIGNAL_ENGINE** — Cursor agent run for Monday launch prep.
- **Primary input:** `newsletter/inputs/live/signals.json` (5 items; CEO change, labor lockout/authorization, corporate restructuring cluster).

## Dedup check

- **Prior live runs:** none under `newsletter/outputs/live/run-*` before this run.
- **Result:** no duplicate angles vs recent desk output.

## Outputs created

| File | Status |
|------|--------|
| `site-update.md` | completed |
| `linkedin.txt` | completed |
| `bluesky.txt` | completed |
| `instagram.txt` | completed |
| `facebook.txt` | completed |
| `poster-prompt.md` | SKIP |
| `youtube-short.md` | SKIP |

## Delivery status

- **Desk publish:** operator — run `./scripts/content-engine/publish-desk-publication.example.sh` with `SUPABASE_URL` + `WDIWF_DESK_PUBLISH_SECRET` (or set `SITE_MD` to this folder’s `site-update.md`). Copies also written to `newsletter/outputs/live/*` for the default script paths.
- **Vercel:** push frontend branch when ready; `/newsletter` reads live desk via Supabase RPC after publish.

## Inputs observed at prepare time

```
signals.json (5 signals), README.md, signals.example.json, .gitkeep
```
