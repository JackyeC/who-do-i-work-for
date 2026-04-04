#!/usr/bin/env bash
# Push WDIWF_DESK_PUBLISH_SECRET from .env.supabase.local to the linked Supabase project (Edge secrets).
# One-time after you create or rotate the secret; then ./scripts/supabase/deploy.sh redeploys functions.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

# shellcheck disable=SC1091
source "$ROOT/scripts/supabase/_load-supabase-env.sh"

if [[ -z "${WDIWF_DESK_PUBLISH_SECRET:-}" ]]; then
  echo "WDIWF_DESK_PUBLISH_SECRET is not set." >&2
  echo "Copy scripts/supabase/env.supabase.local.example to .env.supabase.local and edit it." >&2
  exit 1
fi

echo "==> supabase secrets set WDIWF_DESK_PUBLISH_SECRET=*** (linked project)"
supabase secrets set "WDIWF_DESK_PUBLISH_SECRET=${WDIWF_DESK_PUBLISH_SECRET}"

echo "==> Edge secret updated. Redeploy desk functions so they pick up env:"
echo "    ./scripts/supabase/deploy.sh"
echo "    (or: RUN_HEALTH_CHECK=0 ./scripts/supabase/deploy.sh  to skip health check)"
