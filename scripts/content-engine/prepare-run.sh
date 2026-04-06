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

# Default poster prompt (satirical, per docs/VIRAL_POSTER_IMAGE_SPEC.md).
# This is created at prepare time so a "manual run" always has a poster concept ready.
# Writers can edit/replace it during generation; don't overwrite if it already exists.
if [[ "$MODE" != "friday" && ! -f "$OUT/poster-prompt.md" ]]; then
  SIGNALS_JSON="$INPUT_LIVE/signals.json"
  HEADLINE=""
  if [[ -f "$SIGNALS_JSON" ]]; then
    # Extract first headline from signals.json (array or {items: []}); tolerate malformed input.
    HEADLINE="$(python3 - <<'PY' 2>/dev/null || true
import json, pathlib
p = pathlib.Path('"$SIGNALS_JSON"')
try:
  raw = p.read_text(encoding='utf-8')
  data = json.loads(raw) if raw.strip() else None
  items = data.get("items") if isinstance(data, dict) else data
  if isinstance(items, list) and items:
    h = items[0].get("headline") if isinstance(items[0], dict) else None
    if isinstance(h, str):
      print(h.strip())
except Exception:
  pass
PY
)"
  fi

  # Choose a fake product + workplace truth based on the top signal (light heuristic).
  WORKPLACE_TRUTH="workplace instability sold as strategy"
  FAKE_PRODUCT="ALIGNMENT™"
  LOWER_HEADLINE="$(printf "%s" "${HEADLINE:-}" | tr '[:upper:]' '[:lower:]')"
  if echo "$LOWER_HEADLINE" | grep -Eq 'layoff|cuts|cut |restructur|headcount|reduction'; then
    WORKPLACE_TRUTH="layoffs reframed as “AI transformation”"
    FAKE_PRODUCT="AI ALIGNMENT™"
  elif echo "$LOWER_HEADLINE" | grep -Eq 'lockout|strike|union|teamster|steelworker'; then
    WORKPLACE_TRUTH="labor power treated like a PR problem"
    FAKE_PRODUCT="CONTINUITY™"
  elif echo "$LOWER_HEADLINE" | grep -Eq 'ceo|appoint|steps down|succession'; then
    WORKPLACE_TRUTH="leadership churn packaged as stability"
    FAKE_PRODUCT="CONTINUITY™"
  fi

  cat > "$OUT/poster-prompt.md" << EOF
# Poster prompt (satirical) — REQUIRED for bi-hourly runs

**Spec:** \`docs/VIRAL_POSTER_IMAGE_SPEC.md\` (mid‑century sincere ad + modern labor truth).

## Story hook (from signals)

${HEADLINE:-"(no signals headline found — edit this line)"} 

## Generator prompt (copy/paste)

Generate a single poster image: 1950s–1960s American consumer print advertising aesthetic — confident art direction, period typography, technicolor or muted magazine palette, professional illustration or staged photo look. Cheerful, aspirational composition. **No** real company logos. **No** glamorized smoking/alcohol/harmful products. The ad promotes a fake satirical product \`${FAKE_PRODUCT}\` about \`${WORKPLACE_TRUTH}\`. The tone is sincerely vintage; the message is modern labor satire. Include subtle footer text: “Who Do I Work For” and “Jackye Clayton”. Print-quality, clean edges, high resolution.

**Variant A (headline)**: “Now With 20% More ‘Efficiency.’”
**Variant B (headline)**: “Because Stability Is A Mindset.”

**Alt text (required):** Mid‑century ad style; smiling manager / cheerful workplace scene; copy reveals the satire about ${WORKPLACE_TRUTH}.
EOF
fi

if [[ "$MODE" == "friday" ]]; then
  echo "$OUT" > "$ROOT/newsletter/outputs/friday/LATEST_RUN.txt"
else
  echo "$OUT" > "$ROOT/newsletter/outputs/live/LATEST_RUN.txt"
fi

echo "READY: $OUT"
echo "$OUT"
exit 0
