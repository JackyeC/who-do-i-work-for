-- Schedule news-ingestion to run every 4 hours to keep personalized_news fresh
SELECT cron.schedule(
  'news-ingestion-4h',
  '0 */4 * * *',
  $$
  SELECT net.http_post(
    url := 'https://tdetybqdxadmowjivtjy.supabase.co/functions/v1/news-ingestion',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkZXR5YnFkeGFkbW93aml2dGp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MjU0MTcsImV4cCI6MjA4ODQwMTQxN30.gM_5tF5Qs8f0LUfE9ZB5PM-TeHhDVe4KZF6_p60A3Lc"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Schedule generate-briefing batch mode at 8am CT (13:00 UTC) daily
-- Generates briefings for all users with news_onboarding_complete=true
SELECT cron.schedule(
  'generate-briefings-8am-ct',
  '0 13 * * *',
  $$
  SELECT net.http_post(
    url := 'https://tdetybqdxadmowjivtjy.supabase.co/functions/v1/generate-briefing',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkZXR5YnFkeGFkbW93aml2dGp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MjU0MTcsImV4cCI6MjA4ODQwMTQxN30.gM_5tF5Qs8f0LUfE9ZB5PM-TeHhDVe4KZF6_p60A3Lc"}'::jsonb,
    body := '{"mode": "batch"}'::jsonb
  ) AS request_id;
  $$
);
