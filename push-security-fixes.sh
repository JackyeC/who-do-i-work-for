#!/bin/bash
# Push all security fixes to the production repo
cd ~/wdiwf-prod

# Pull latest first
git pull --rebase origin main

# Copy security code changes
cp ~/who-do-i-work-for/src/hooks/use-linkedin.ts src/hooks/use-linkedin.ts
cp ~/who-do-i-work-for/supabase/functions/linkedin-share-certificate/index.ts supabase/functions/linkedin-share-certificate/index.ts
cp ~/who-do-i-work-for/supabase/migrations/20260331000001_security_encrypt_linkedin_token.sql supabase/migrations/ 2>/dev/null
cp ~/who-do-i-work-for/supabase/migrations/20260331000002_linkedin_token_rpc.sql supabase/migrations/ 2>/dev/null
cp ~/who-do-i-work-for/SECURITY-ALL-MIGRATIONS.sql . 2>/dev/null
cp ~/who-do-i-work-for/SECURITY-RUNBOOK.md . 2>/dev/null

# Commit and push
git add -A
git commit -m "Security: encrypt LinkedIn tokens, safe view, lock down token RPC"
git push origin main

echo ""
echo "Done! Now open this URL and paste the SQL:"
echo "https://supabase.com/dashboard/project/tdetybqdxadmowjivtjy/sql/new"
