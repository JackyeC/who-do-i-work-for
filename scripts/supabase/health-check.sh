#!/usr/bin/env bash
# Post-deploy gate: Edge health + DB/RPC sanity for the newsletter desk pipeline.
# Requires: SUPABASE_URL, WDIWF_DESK_PUBLISH_SECRET, curl, jq
set -euo pipefail

: "${SUPABASE_URL:?Set SUPABASE_URL (e.g. https://xxx.supabase.co)}"
: "${WDIWF_DESK_PUBLISH_SECRET:?Set WDIWF_DESK_PUBLISH_SECRET}"

URL="${SUPABASE_URL%/}/functions/v1/desk-publication-health"

TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

echo "GET $URL"
HTTP_CODE="$(curl -sS -o "$TMP" -w "%{http_code}" -H "Authorization: Bearer ${WDIWF_DESK_PUBLISH_SECRET}" "$URL")"
HTTP_BODY="$(cat "$TMP")"

echo "$HTTP_BODY" | jq . 2>/dev/null || echo "$HTTP_BODY"

if [[ "$HTTP_CODE" != "200" ]]; then
  echo "health-check: HTTP $HTTP_CODE (expected 200)" >&2
  exit 1
fi

if ! echo "$HTTP_BODY" | jq -e '.ok == true' >/dev/null 2>&1; then
  echo "health-check: body ok is not true — fix checks.rpc_latest_live_desk or publications_table before testers" >&2
  exit 1
fi

echo "health-check: OK (safe_for_newsletter_desk=$(echo "$HTTP_BODY" | jq -r '.safe_for_newsletter_desk // false'))"
