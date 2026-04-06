# Site launch audit

- Base: https://wdiwf.jackyeclayton.com/
- Date: 2026-04-06T09:29:10.671Z
- Crawled internal pages: 121
- Discovered internal link targets: 9
- Sampled external links: 5 (limit 50)
- Seeded routes from: src/App.tsx

## Internal page health
- 4xx/5xx/failed: 0
- Redirects (3xx): 0
- Placeholder-suspected pages: 0
- Missing <title>: 0
- Missing meta description: 0

## External link sample health
- Bad/failed in sample: 3

### Bad/failed external links (sample)
- 404 https://aeulesuqxcnaonlxcjcm.supabase.co/
- 404 https://fonts.googleapis.com/
- 404 https://fonts.gstatic.com/

## Notes
- This checks HTTP status and basic SEO metadata; it does not run client-side JS or detect runtime console errors.
- If you have authenticated/role-gated routes, this will only see the public experience.
