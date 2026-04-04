#!/usr/bin/env bash
# Prune old run folders (default: older than 30 days). Dry-run with DRY_RUN=1.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DAYS="${CONTENT_ENGINE_RETENTION_DAYS:-30}"
DRY_RUN="${DRY_RUN:-0}"

prune_dir() {
  local base="$1"
  [[ -d "$base" ]] || return 0
  find "$base" -maxdepth 1 -type d -name 'run-*' -mtime "+$DAYS" | while read -r dir; do
    if [[ "$DRY_RUN" == "1" ]]; then
      echo "would remove: $dir"
    else
      echo "removing: $dir"
      rm -rf "$dir"
    fi
  done
}

prune_dir "$ROOT/newsletter/outputs/live"
prune_dir "$ROOT/newsletter/outputs/friday"
echo "Done (retention ${DAYS} days, DRY_RUN=$DRY_RUN)."
