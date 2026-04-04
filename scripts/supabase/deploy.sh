#!/usr/bin/env bash
# Repeatable Supabase ship: migrations → desk Edge functions → optional health check.
# Run from anywhere; assumes supabase CLI is logged in and project is linked.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

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
