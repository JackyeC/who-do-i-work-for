# WDIWF content engine — Cursor Automations

This folder is the **executable spec** for recurring editorial runs. Cursor Automations are configured in the **Cursor product** (cloud agent + schedule); this repo holds the **instructions, outputs layout, and handoff contracts**.

**Full narrative (Parts 1–9):** [`../docs/WDIWF_CONTENT_ENGINE_AUTOMATION_LAYER.md`](../docs/WDIWF_CONTENT_ENGINE_AUTOMATION_LAYER.md)

## Files

| File | Use |
|------|-----|
| [`AUTOMATIONS_REGISTRY.md`](AUTOMATIONS_REGISTRY.md) | **Registry:** display names, execution ids, schedules, outputs — **do not enable until validation passes** |
| [`HOT_SIGNAL_ENGINE.md`](HOT_SIGNAL_ENGINE.md) | Paste **entire** body into **BI-HOURLY CONTENT ENGINE** (`0 */2 * * *` → `newsletter/outputs/live/`) |
| [`FRIDAY_NEWSLETTER.md`](FRIDAY_NEWSLETTER.md) | Paste **entire** body into **FRIDAY NEWSLETTER ENGINE** (Friday AM → `newsletter/outputs/friday/`) |
| [`bi-hourly-agent-instructions.md`](bi-hourly-agent-instructions.md) | Short pointer to `HOT_SIGNAL_ENGINE.md` (optional) |
| [`friday-agent-instructions.md`](friday-agent-instructions.md) | Short pointer to `FRIDAY_NEWSLETTER.md` (optional) |
| [`CURSOR_DASHBOARD_SETUP.md`](CURSOR_DASHBOARD_SETUP.md) | Step-by-step: create automations, repo link, schedule, MCP |

## Repo layout

```
newsletter/inputs/live/       # ingest before bi-hourly run
newsletter/outputs/live/run-* # bi-hourly artifacts
newsletter/outputs/friday/run-* # Friday artifacts
newsletter/delivery/PUBLISHING.md # APIs & webhooks
scripts/content-engine/       # prepare-run.sh, archive-runs.sh
```

## Scripts

```bash
# Creates run-* folder; blocks bi-hourly if inputs/live is empty
./scripts/content-engine/prepare-run.sh bi-hourly
./scripts/content-engine/prepare-run.sh friday

# Optional: prune runs older than 30 days
./scripts/content-engine/archive-runs.sh
DRY_RUN=1 ./scripts/content-engine/archive-runs.sh
```

npm: `npm run content:prepare` / `npm run content:prepare:friday`

## Source of truth (every run)

- `docs/visual-references/` + `docs/visual-references/README.md`
- `docs/VIRAL_POSTER_IMAGE_SPEC.md`
- `docs/BUILD_BIBLE.md`
- `docs/MESSAGE_SYSTEM.md`
- `newsletter/style/jackye-voice.md`
- `newsletter/style/enforcement.md`

## Priority

**MESSAGE > VOICE > DESIGN**
