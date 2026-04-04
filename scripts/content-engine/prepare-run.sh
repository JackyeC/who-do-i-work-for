#!/usr/bin/env bash
# Prepares a timestamped output directory for the WDIWF content engine.
# Usage: ./scripts/content-engine/prepare-run.sh bi-hourly|friday
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
MODE="${1:-bi-hourly}"
RUN_ID="$(date -u +%Y%m%dT%H%M%SZ)"
INPUT_LIVE="$ROOT/newsletter/inputs/live"

if [[ "$MODE" == "friday" ]]; then
  OUT="$ROOT/newsletter/outputs/friday/run-$RUN_ID"
else
  OUT="$ROOT/newsletter/outputs/live/run-$RUN_ID"
fi

mkdir -p "$OUT"

# Count ingestible inputs (exclude README, examples, processed/)
has_input=0
while IFS= read -r -d '' f; do
  has_input=1
  break
done < <(find "$INPUT_LIVE" -maxdepth 1 -type f \
  ! -name 'README.md' \
  ! -name '.gitkeep' \
  ! -name 'signals.example.json' \
  -print0 2>/dev/null || true)

if [[ "$MODE" != "friday" && "$has_input" -eq 0 ]]; then
  cat > "$OUT/RUN_BLOCKERS.md" << EOF
# Run blocked — no inputs

**No new signals. Skipping run.**

**Run:** \`run-$RUN_ID\`  
**Mode:** bi-hourly

## Blockers

- No ingestible files in \`newsletter/inputs/live/\` (only README / examples present).

## Required actions

1. Add \`signals.json\`, \`urls.txt\`, \`notes.md\`, or \`feed-snapshot.md\` to \`newsletter/inputs/live/\`.
2. Re-run the automation or: \`npm run content:prepare\`

Do **not** fabricate news to fill this run.
EOF
  echo "No new signals. Skipping run."
  echo "BLOCKED: no inputs — wrote $OUT/RUN_BLOCKERS.md"
  echo "$OUT"
  exit 1
fi

cat > "$OUT/RUN_META.md" << EOF
# Run metadata

- **Run id:** \`run-$RUN_ID\`
- **Mode:** \`$MODE\`
- **UTC time:** \`$(date -u +%Y-%m-%dT%H:%M:%SZ)\`
- **Output directory:** \`newsletter/outputs/$( [[ "$MODE" == "friday" ]] && echo friday || echo live )/run-$RUN_ID\`
- **Generation status:** \`pending\` — agent must set to \`completed\` or \`skipped\` (see \`docs/CONTENT_ENGINE_PRODUCTION_VALIDATION.md\`)

## Inputs observed at prepare time

\`\`\`
$(ls -la "$INPUT_LIVE" 2>/dev/null | head -30 || echo "(none)")
\`\`\`
EOF

if [[ "$MODE" == "friday" ]]; then
  echo "$OUT" > "$ROOT/newsletter/outputs/friday/LATEST_RUN.txt"
else
  echo "$OUT" > "$ROOT/newsletter/outputs/live/LATEST_RUN.txt"
fi

echo "READY: $OUT"
echo "$OUT"
exit 0
