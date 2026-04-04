#!/usr/bin/env bash
# Apply desk operability DDL (publish_status, RPC, RLS) to the linked project.
# Use when the table exists but health check errors on publish_status / RPC — e.g. only the
# first desk migration was applied manually. Prefer -f (never "$(cat file)") so SQL comments are not parsed as CLI flags.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
FILE="$ROOT/supabase/migrations/20260405120000_wdiwf_desk_publications_operability.sql"

if [[ ! -f "$FILE" ]]; then
  echo "Missing $FILE" >&2
  exit 1
fi

echo "==> supabase db query --linked -f $(basename "$FILE")"
cd "$ROOT"
supabase db query --linked -f "$FILE"

echo "==> Done. Run ./scripts/supabase/health-check.sh (after .env.supabase.local) or ./scripts/supabase/deploy.sh"
