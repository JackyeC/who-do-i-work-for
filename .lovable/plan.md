

## Plan: Fix persistent mammoth build error

### Problem
`supabase/functions/parse-career-document/index.ts` line 27 uses `npm:mammoth@1.6.0` which Deno cannot resolve, blocking **all** edge function deployments.

### Fix
Single line change on line 27:
```
npm:mammoth@1.6.0  →  https://esm.sh/mammoth@1.6.0
```

This is the same fix applied multiple times previously but keeps reverting. This time I'll also check if `deno.lock` needs deletion to prevent stale lockfile issues.

### About the "internal error" message
That error (ID `9343b6e1324d65a600163aaa9aabbd50`) is caused by this exact build failure — none of the edge functions can deploy while this import breaks the build. Fixing this one line unblocks everything.

The resilient architecture work (retry, caching, fallback UI) was already implemented in the previous round and is ready once functions deploy successfully.

