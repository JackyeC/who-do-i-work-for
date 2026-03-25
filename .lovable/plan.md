

## Plan: Seed Workforce Intelligence with Breaking News Data

You shared 4 major workforce stories from this week. I'll insert them into the existing `work_news` and `briefing_items` tables so they appear on the Workforce Intelligence Brief page and the Daily Briefing card on the dashboard.

### Data to Insert

**work_news table** (4 articles for the Workforce Brief page):

| Headline | Category | Tone | Source |
|----------|----------|------|--------|
| More Workers Are Struggling Than Thriving for the First Time, Gallup Finds | future_of_work | Negative | Gallup |
| Healthcare Is Carrying 109% of All US Private Sector Job Growth | future_of_work | Neutral | ADP Research |
| Half of All Companies Expect AI to Replace Zero Roles in 2026, NBER Survey Finds | ai_workplace | Positive | NBER |
| Tech Employment Declined in 2025 but AI-Skilled Roles Lead 2026 Rebound | ai_workplace | Neutral | CompTIA |

**briefing_items table** (4 signal alerts for the Daily Briefing card):

| Company/Topic | Signal | Headline |
|---------------|--------|----------|
| US Labor Market | amber_flag | Gallup: More US workers now "struggling" than "thriving" — first time ever recorded |
| Healthcare Sector | info | ADP: Healthcare accounts for 109% of net private-sector job growth; all other sectors contracting |
| AI Employment | green_badge | NBER: 50% of CFOs surveyed expect AI to replace zero roles in 2026; projected impact < 0.4% |
| Tech Sector | info | CompTIA: Tech employment fell in 2025, but AI-skilled roles projected to lead 2026 rebound; median tech wages 126% above national average |

### Technical Steps

1. **Run a single SQL migration** with INSERT statements for both tables, using the real source URLs (Gallup, ADP, NBER, CompTIA) and published date of 2026-03-24.

2. **No code changes needed** — the existing `WorkNewsRepository`, `WorkNewsTicker`, and `DailyBriefingCard` components will automatically pick up the new rows.

### What You'll See After

- The **Workforce Intelligence Brief** page will show the 4 new articles with category badges, tone labels, and source links.
- The **Daily Briefing** card on the dashboard will show the 4 signal items with color-coded severity badges.
- The **Work News Ticker** will scroll the new headlines.

