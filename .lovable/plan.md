

# Fix News Ingestion Edge Function

The `news-ingestion` function is failing for two reasons. Here's the plan to fix both.

## Problem 1: No unique constraint on `title`
The code does `upsert(..., { onConflict: "title" })` but the `personalized_news` table has no unique constraint on `title`. The upsert fails with a Postgres error.

**Fix:** Add a unique index on `title` via a database migration, so the upsert deduplication works correctly.

## Problem 2: NewsData.io API response format
The API call to `newsdata.io/api/1/latest` returns a response where `data.results` is not an array (likely `undefined` or an error object when rate-limited or when the API format changed). The code does `(data.results || []).map(...)` but if `data.results` is a non-array truthy value (like an error string), the `||` fallback doesn't trigger.

**Fix:** Update the edge function to:
- Add a proper array check: `Array.isArray(data.results) ? data.results : []`
- Add logging of the raw API response status for debugging
- Handle the case where the API returns an error gracefully

## Implementation Steps

1. **Database migration** — Add unique constraint:
   ```sql
   CREATE UNIQUE INDEX IF NOT EXISTS idx_news_title_unique ON personalized_news (title);
   ```

2. **Update `supabase/functions/news-ingestion/index.ts`** — Fix the NewsData.io response parsing (line 172) to safely handle non-array responses, and add response status logging.

3. **Redeploy** — The edge function auto-deploys on save.

## After Fix
Once deployed, the user can re-trigger the ingestion and news will populate correctly, enabling the Daily Briefing card to show real content.

