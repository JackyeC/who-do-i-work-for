

# Logic Bible V8.0: Final Gap — Live Signal Intelligence Ticker

## Status: Almost Fully Implemented

Your Logic Bible V8.0 is **95% built**. Here's what's already live:

- Signal scoring with hidden 0.0-1.0 mapped to human statements (all 6 categories)
- Department-aware signal priority on job cards (Tech→Innovation+Stability, etc.)
- Mixed-score "Risk Signal" elevation when user dial >70%
- Values DNA clash alerts
- Ghost Posting Risk detection and UI banner
- "Before You Sign" decision checkpoint with blur-gated Pro content
- DB function `search_path` hardening

## The One Remaining Gap: Live Signal Ticker

The TopBar ticker currently shows static platform stats ("512 companies tracked", "34 OSINT scans completed"). It should stream **real company signal changes** from `company_signal_scans` — the "Bloomberg terminal" effect that creates FOMO and daily active usage.

### Changes

**File: `src/components/layout/TopBar.tsx`**

Replace the static `tickerStats` query with a query that fetches the **10 most recent signal scan changes** from `company_signal_scans` joined with `companies.name`. Map each to a ticker string using the existing `getUiStatement()` function:

- `"AMZN: Active hiring across roles"` (hiring_activity = high)
- `"META: Recent layoffs reported"` (workforce_stability = low)  
- `"AAPL: Salary range provided"` (compensation_transparency = high)

Format: `{COMPANY}: {uiStatement}` — monospace, 12px, no jargon, no numeric scores.

Keep 2-3 static platform stats as fallback when no recent signals exist.

Add a `direction` indicator: `↑` for increase, `↓` for decrease, `—` for stable, appended after the statement.

### Technical Detail

Query: Select from `company_signal_scans` joined to `companies`, ordered by `scan_timestamp DESC`, limit 10. Map each row through `getUiStatement(signal_category, value_normalized)`. No new tables or edge functions needed.

