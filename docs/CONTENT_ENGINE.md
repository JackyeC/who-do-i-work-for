# WDIWF content engine (automated editorial workflow)

**Purpose:** Recurring **Cursor Automations** + repo-native **inputs/outputs** + **delivery** handoff — not documentation-only.

## Canonical spec (read this first)

**[`WDIWF_CONTENT_ENGINE_AUTOMATION_LAYER.md`](WDIWF_CONTENT_ENGINE_AUTOMATION_LAYER.md)** — complete automation layer: source-of-truth table, folders, both automations step-by-step, scripts, credentials, ingest, poster example, 10-step launch, hard blockers.

**[`CONTENT_ENGINE_PRODUCTION_VALIDATION.md`](CONTENT_ENGINE_PRODUCTION_VALIDATION.md)** — **enable this before automation:** inputs, dedup, quality filter, required outputs, voice, skip rules, publish-ready handoff, logging.

## Quick links

| Doc | Role |
|-----|------|
| [`WDIWF_CONTENT_ENGINE_AUTOMATION_LAYER.md`](WDIWF_CONTENT_ENGINE_AUTOMATION_LAYER.md) | **Full layer doc (Parts 1–9)** |
| [`automations/README.md`](../automations/README.md) | Entry point, scripts, file list |
| [`automations/CURSOR_DASHBOARD_SETUP.md`](../automations/CURSOR_DASHBOARD_SETUP.md) | Create the two automations in Cursor UI |
| [`automations/AUTOMATIONS_REGISTRY.md`](../automations/AUTOMATIONS_REGISTRY.md) | Names, schedules, procedure files, outputs |
| [`automations/HOT_SIGNAL_ENGINE.md`](../automations/HOT_SIGNAL_ENGINE.md) | Paste into **BI-HOURLY CONTENT ENGINE** |
| [`automations/FRIDAY_NEWSLETTER.md`](../automations/FRIDAY_NEWSLETTER.md) | Paste into **FRIDAY NEWSLETTER ENGINE** |
| [`newsletter/delivery/PUBLISHING.md`](../newsletter/delivery/PUBLISHING.md) | APIs, webhooks, credentials |

## Folders

```
newsletter/inputs/live/          # signals.json, notes.md, urls.txt, …
newsletter/outputs/live/run-*  # bi-hourly artifacts
newsletter/outputs/friday/run-* # weekly artifacts
```

## Commands

```bash
./scripts/content-engine/prepare-run.sh bi-hourly   # fails if no inputs
./scripts/content-engine/prepare-run.sh friday
npm run content:prepare
npm run content:prepare:friday
```

## Source of truth (every run)

Listed in `automations/README.md` — includes `MESSAGE_SYSTEM`, voice, enforcement, visual spec, Build Bible.

## Operational note

**Cursor** owns the schedule; **this repo** owns the contract (paths, filenames, prompts). Delivery to Beehiiv/social/site requires additional secrets and optional CI — see `PUBLISHING.md`.
