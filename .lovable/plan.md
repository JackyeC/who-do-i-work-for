

## Add Platform-Wide WARN/Layoff Heatmap to Founder Console

### What's Missing
The Founder Console currently has no layoff/WARN heatmap panel. The `SurvivorAlertCard` component exists but is company-specific (requires a `companyName` + `dbCompanyId`). The `company_warn_notices` table has all the data needed — we just need a platform-wide aggregation view.

### Plan

**1. Create `src/components/admin/WarnHeatmapPanel.tsx`**

A new admin panel that queries `company_warn_notices` directly (no edge function needed) to build a platform-wide state heatmap:

- Query all WARN notices from the last 12 months, grouped by `location_state`
- Sum `employees_affected` per state, count notices per state, collect top cities
- Display as a color-coded grid (same intensity scale as `SurvivorAlertCard`: critical/high/moderate/low)
- Show summary stats at top: total notices, total affected, states impacted
- Include a "Top Impacted Companies" list showing which companies have the most WARN filings
- Join to `companies` table to show company names alongside state data
- Clicking a state tile filters to show that state's company-level breakdown

**2. Add to `FounderConsole.tsx`**

Insert the `WarnHeatmapPanel` between the main grid and the Search Intelligence section — this is the "heatmap reporting" section the user is asking about.

### No database changes needed
All data already exists in `company_warn_notices` with public read RLS. The panel just needs client-side queries.

