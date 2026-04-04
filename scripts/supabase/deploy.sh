#!/usr/bin/env bash
# Repeatable Supabase ship: migrations → desk Edge functions → optional health check.
# Run from anywhere; assumes supabase CLI is logged in and project is linked.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

# shellcheck disable=SC1091
source "$ROOT/scripts/supabase/_load-supabase-env.sh"

echo "==> supabase db push"
supabase db push

echo "==> supabase functions deploy publish-desk-publication"
supabase functions deploy publish-desk-publication

echo "==> supabase functions deploy desk-publication-health"
supabase functions deploy desk-publication-health

if [[ "${RUN_HEALTH_CHECK:-1}" != "0" ]]; then
  echo "==> health-check.sh (set RUN_HEALTH_CHECK=0 to skip)"
  "$ROOT/scripts/supabase/health-check.sh"
else
  echo "==> skipping health check (RUN_HEALTH_CHECK=0)"
fi

echo "==> Supabase deploy ritual complete."
echo ""
echo "=== Required before user testing (manual) ==="
echo "1) Health: passed above (or re-run: ./scripts/supabase/health-check.sh)."
echo "2) Publish: trigger a real publish if newest_live is null/stale — see docs/SUPABASE_DEPLOY.md"
echo "3) Site: open production /newsletter — must show Live desk matching latest publication."
echo "   If not: FAILURE — log: delivery layer not working (see docs/SUPABASE_DEPLOY.md)"
echo "4) UX: first-time-user pass on /newsletter — live, understandable, no obvious confusion."
echo "   If confusing but technically correct: log UX issue — does not block testers (see docs/SUPABASE_DEPLOY.md)"
