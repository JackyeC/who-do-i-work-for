# Forensic integrity reports (long-form)

These editions are **separate from the bi-hourly desk**: they publish to **`/integrity-report`** via Supabase rows with `kind: "forensic"` so the daily **`/newsletter`** brief is not replaced.

## Files

- `forensic-integrity-report-YYYY-MM-DD.md` — markdown body with Signal Check™ + source map (see WDIWF charter / `docs/SIGNAL_CHECK_FRAMEWORK.md`).

## Publish

```bash
export SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
export WDIWF_DESK_PUBLISH_SECRET="…"
./scripts/content-engine/publish-forensic-publication.example.sh
```

Optional:

```bash
FORENSIC_MD=/path/to/report.md RUN_ID=my-run-id ./scripts/content-engine/publish-forensic-publication.example.sh
```

Defaults: `FORENSIC_MD` = this folder’s `forensic-integrity-report-2026-04-05.md`.

See also [`docs/CONTENT_ENGINE_LIVE_DELIVERY.md`](../../docs/CONTENT_ENGINE_LIVE_DELIVERY.md) and [`newsletter/delivery/PUBLISHING.md`](../delivery/PUBLISHING.md).
