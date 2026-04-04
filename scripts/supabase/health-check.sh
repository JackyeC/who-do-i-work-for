#!/usr/bin/env bash
# Post-deploy gate: Edge health + DB/RPC sanity for the newsletter desk pipeline.
# Requires: curl, jq. Loads SUPABASE_URL + WDIWF_DESK_PUBLISH_SECRET from .env.supabase.local if present
# (see scripts/supabase/env.supabase.local.example); SUPABASE_URL defaults from supabase/config.toml.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
# shellcheck disable=SC1091
source "$ROOT/scripts/supabase/_load-supabase-env.sh"

if [[ -z "${SUPABASE_URL:-}" ]]; then
  echo "SUPABASE_URL is not set and could not be derived from supabase/config.toml." >&2
  exit 1
fi

if [[ -z "${WDIWF_DESK_PUBLISH_SECRET:-}" ]]; then
  echo "WDIWF_DESK_PUBLISH_SECRET is not set." >&2
  echo "1) Copy scripts/supabase/env.supabase.local.example to .env.supabase.local in the repo root" >&2
  echo "2) Put your secret in that file (same value as Supabase Edge — use ./scripts/supabase/push-edge-secrets.sh to sync)" >&2
  exit 1
fi

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
echo "health-check: Step 1 done. Before testers: steps 2–3 (publish + /newsletter technical verify), then step 4 UX sanity (docs/SUPABASE_DEPLOY.md)."
