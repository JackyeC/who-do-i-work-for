

# Fix Error-Level Security Finding: Realtime Channel Authorization

## Problem

`scan_alerts` and `browse_ai_change_events` are added to the `supabase_realtime` publication. Their table-level RLS restricts row access, but any authenticated user can subscribe to the Realtime channel and receive broadcast messages for these tables regardless of authorization.

Since Lovable Cloud doesn't support adding RLS to `realtime.messages` (reserved schema), the correct fix is to **remove these tables from the realtime publication**. They don't need realtime — the app can fetch data on demand via standard queries (which respect RLS).

## Plan

### 1. Create a migration to drop the two tables from the realtime publication

```sql
ALTER PUBLICATION supabase_realtime DROP TABLE public.scan_alerts;
ALTER PUBLICATION supabase_realtime DROP TABLE public.browse_ai_change_events;
```

### 2. Verify no frontend code relies on realtime subscriptions for these tables

Search the