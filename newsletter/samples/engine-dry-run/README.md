# Content engine — static dry-run preview

This folder is a **human-readable snapshot** of what a **completed** bi-hourly run is supposed to look like (no Cursor required).

**Script dry run (empty inputs):**

```bash
./scripts/content-engine/prepare-run.sh bi-hourly
```

Expect exit code **1**, stdout **`No new signals. Skipping run.`**, and a `run-*` folder containing only **`RUN_BLOCKERS.md`**.

**Script dry run (with inputs):** drop `signals.json` (or `notes.md`, etc.) in `newsletter/inputs/live/`, then:

```bash
./scripts/content-engine/prepare-run.sh bi-hourly
```

Expect exit **0**, a new `newsletter/outputs/live/run-*/` with **`RUN_META.md`** (`Generation status: pending` until an agent fills files), then the agent writes `site-update.md`, `linkedin.txt`, etc. per `automations/HOT_SIGNAL_ENGINE.md`.

**Files here:** fictional story, **preview only** — not published news.

| File | What |
|------|------|
| `preview-site-update.md` | Site-style Markdown brief + Signal Check™ |
| `preview-substack-daily-filled.md` | **Full daily email** (Substack-shaped), all sections filled — pairs with `newsletter/template-substack-daily.md` |
| `preview-linkedin.txt` / `preview-bluesky.txt` | Short social |
| `preview-RUN_META.md` | Example run metadata |
