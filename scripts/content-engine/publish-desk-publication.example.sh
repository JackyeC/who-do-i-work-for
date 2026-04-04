#!/usr/bin/env bash
# Example: POST latest desk outputs to Supabase Edge after a successful bi-hourly run.
# Prerequisites:
#   supabase secrets set WDIWF_DESK_PUBLISH_SECRET='...'
#   Deploy: supabase functions deploy publish-desk-publication
#
# Env:
#   SUPABASE_URL          — project URL (e.g. https://xxx.supabase.co)
#   WDIWF_DESK_PUBLISH_SECRET — same value as the Edge secret
# Optional:
#   SITE_MD FILE          — path to site-update.md (default: newsletter/outputs/live/site-update.md)
#   RUN_ID                — idempotency / trace (default: timestamp)

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SITE_FILE="${SITE_MD:-$ROOT/newsletter/outputs/live/site-update.md}"
RUN_ID="${RUN_ID:-$(date -u +%Y%m%dT%H%M%SZ)}"

: "${SUPABASE_URL:?Set SUPABASE_URL}"
: "${WDIWF_DESK_PUBLISH_SECRET:?Set WDIWF_DESK_PUBLISH_SECRET}"

read_file() {
  local f="$1"
  if [[ -f "$f" ]]; then cat "$f"; else echo ""; fi
}

SITE_MARKDOWN="$(read_file "$SITE_FILE")"
LINKEDIN="$(read_file "$ROOT/newsletter/outputs/live/linkedin.txt")"
BLUESKY="$(read_file "$ROOT/newsletter/outputs/live/bluesky.txt")"
INSTA="$(read_file "$ROOT/newsletter/outputs/live/instagram.txt")"
FB="$(read_file "$ROOT/newsletter/outputs/live/facebook.txt")"

if [[ -z "${SITE_MARKDOWN// }" ]]; then
  echo "No site markdown at $SITE_FILE — aborting POST (skipping is better than empty publish)."
  exit 1
fi

JSON="$(jq -n \
  --arg run_id "$RUN_ID" \
  --arg site "$SITE_MARKDOWN" \
  --arg li "$LINKEDIN" \
  --arg bs "$BLUESKY" \
  --arg ig "$INSTA" \
  --arg fb "$FB" \
  '{
    run_id: $run_id,
    kind: "bi_hourly",
    generation_status: "completed",
    site_markdown: $site,
    social_linkedin: (if ($li|length) > 0 then $li else null end),
    social_bluesky: (if ($bs|length) > 0 then $bs else null end),
    social_instagram: (if ($ig|length) > 0 then $ig else null end),
    social_facebook: (if ($fb|length) > 0 then $fb else null end),
    published_to_site: true,
    run_log: { inputs_used: ["filesystem: newsletter/outputs/live/*"], script: "publish-desk-publication.example.sh" }
  }')"

curl -sS -X POST "${SUPABASE_URL%/}/functions/v1/publish-desk-publication" \
  -H "Authorization: Bearer ${WDIWF_DESK_PUBLISH_SECRET}" \
  -H "Content-Type: application/json" \
  -d "$JSON" | jq .
