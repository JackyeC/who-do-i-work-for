# Live outputs — bi-hourly runs

Each run writes a **timestamped folder**:

```
run-20260404T1400Z/
  linkedin.txt
  bluesky.txt
  instagram.txt
  facebook.txt
  youtube-short.md      # Shorts script/reco; SKIP line if not a video story
  site-update.md
  poster-prompt.md      # SKIP if no poster
  RUN_META.md           # run id, inputs used, blockers (if any)
```

## Latest pointer

`LATEST_RUN.txt` is updated when **`prepare-run.sh`** succeeds (inputs present). It points at the **working directory** for that tick — **not** guaranteed to mean “content generation completed.”

**Before publishing:** open that folder’s **`RUN_META.md`** and confirm **`## Generation status`** is **`completed`**. If **`skipped`** or **`pending`**, do not use `linkedin.txt` / `site-update.md` from that run.

See **`docs/CONTENT_ENGINE_PRODUCTION_VALIDATION.md`**.

## Git

High churn: optionally add to `.gitignore`:

```
newsletter/outputs/live/run-*
```

and keep only `README.md` + `LATEST_RUN.txt` tracked — or commit everything for an audit trail.

## Handoff

See `newsletter/delivery/PUBLISHING.md` for webhooks, Beehiiv, and social connectors.
