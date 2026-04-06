#!/usr/bin/env bash
# POST a forensic integrity report to Supabase (kind: forensic) for /integrity-report.
# Does not replace the bi-hourly desk on /newsletter.
#
# Env:
#   SUPABASE_URL              — optional; from scripts/supabase/_load-supabase-env.sh
#   WDIWF_DESK_PUBLISH_SECRET — same secret as publish-desk-publication
# Optional:
#   FORENSIC_MD FILE   — default: newsletter/outputs/forensic/forensic-integrity-report-2026-04-05.md
#   RUN_ID             — default: UTC timestamp

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
# shellcheck disable=SC1091
source "$ROOT/scripts/supabase/_load-supabase-env.sh"
FORENSIC_FILE="${FORENSIC_MD:-$ROOT/newsletter/outputs/forensic/forensic-integrity-report-2026-04-05.md}"
RUN_ID="${RUN_ID:-$(date -u +%Y%m%dT%H%M%SZ)}"

: "${SUPABASE_URL:?Set SUPABASE_URL or ensure supabase/config.toml has project_id}"
: "${WDIWF_DESK_PUBLISH_SECRET:?Set WDIWF_DESK_PUBLISH_SECRET}"

if [[ ! -f "$FORENSIC_FILE" ]]; then
  echo "Forensic markdown not found: $FORENSIC_FILE"
  exit 1
fi

SITE_MARKDOWN="$(cat "$FORENSIC_FILE")"
if [[ -z "${SITE_MARKDOWN// }" ]]; then
  echo "Empty markdown at $FORENSIC_FILE — aborting."
  exit 1
fi

JSON="$(jq -n \
  --arg run_id "$RUN_ID" \
  --arg site "$SITE_MARKDOWN" \
  --arg path "$FORENSIC_FILE" \
  '{
    run_id: $run_id,
    kind: "forensic",
    generation_status: "completed",
    site_markdown: $site,
    published_to_site: true,
    run_log: { source_file: $path, script: "publish-forensic-publication.example.sh" }
  }')"

curl -sS -X POST "${SUPABASE_URL%/}/functions/v1/publish-desk-publication" \
  -H "Authorization: Bearer ${WDIWF_DESK_PUBLISH_SECRET}" \
  -H "Content-Type: application/json" \
  -d "$JSON" | jq .
