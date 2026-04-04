# Flow-based HR-tech audit matrix (2026)

**Legend:** **Y** = strong, **P** = partial, **N** = weak or missing for that lens.

**Lenses:** (1) Entry clarity — (2) Flow fit — (3) Feedback loop — (4) Share atom — (5) Trust / data

## Priority deep-dive (highest leverage)

| Path | Entry | Flow | Feedback | Share | Data | Notes |
|------|-------|------|------------|-------|------|-------|
| `/` Index | Y | P | P | P | Y | Strong hero; many paths — progressive disclosure could tighten first visit. |
| `/check` | Y | P | Y | P | Y | Tabs (company / offer / candidate); results-driven feedback. |
| `/dashboard` | P | P | Y | P | Y | Many tabs — onboarding helps; civic impact now wired to real counts ([`useCivicImpact`](../src/hooks/use-civic-impact.ts)). |
| `/company/:id` | Y | P | Y | Y | Y | Scorecard + dossier; share via [`social-share`](../src/lib/social-share.ts) patterns. |
| `/offer-check/:companyId` | P | P | Y | Y | Y | Share card; PDF/export gated. |
| `/strategic-offer-review` | P | P | Y | P | Y | Deep form — adaptive help still an opportunity. |
| `/offer-clarity` | P | P | Y | P | Y | Upload + AI; tier gate via [`PremiumGate`](../src/components/PremiumGate.tsx). |
| `/my-offer-checks` | Y | Y | Y | P | Y | History + stale section counts. |

## Explore & research

| Path | 1 | 2 | 3 | 4 | 5 |
|------|---|---|---|---|---|
| `/browse` | Y | Y | Y | P | Y |
| `/search` | Y | P | Y | P | Y |
| `/values-search` | Y | P | Y | P | Y |
| `/intelligence` | Y | P | Y | Y | Y |
| `/investigative` | P | P | Y | P | Y |
| `/compare` | Y | Y | Y | Y | Y |

## Tools & analyzers

| Path | 1 | 2 | 3 | 4 | 5 |
|------|---|---|---|---|---|
| `/check` | Y | P | Y | P | Y |
| `/strategic-offer-review` | P | P | Y | P | Y |
| `/offer-clarity` | P | P | Y | P | Y |
| `/would-you-work-here` | Y | Y | Y | Y | P |
| `/employer-receipt` | Y | P | Y | Y | Y |
| `/employer-promise-check` | P | P | Y | P | Y |
| `/what-am-i-supporting` | Y | P | Y | Y | Y |
| `/embed/jobs` | Y | Y | Y | N | P | Partner iframe shell; no PII — see [`JobBoardEmbed`](../src/pages/JobBoardEmbed.tsx). |

## Career intelligence

| Path | 1 | 2 | 3 | 4 | 5 |
|------|---|---|---|---|---|
| `/career-intelligence` | P | P | Y | P | Y |
| `/career-map` → `/career-intelligence` | — | — | — | — | — |
| `/jobs` | Y | Y | Y | P | Y |
| `/job-dashboard` | P | P | Y | P | Y |
| `/relationship-intelligence` | P | P | Y | P | Y |
| `/ask-jackye` | Y | P | Y | P | Y |

## My dashboard (auth)

| Path | 1 | 2 | 3 | 4 | 5 |
|------|---|---|---|---|---|
| `/dashboard` | P | P | Y | P | Y |
| `/my-offer-checks` | Y | Y | Y | P | Y |
| `/signal-alerts` | Y | Y | Y | P | Y |

## Policy & economy

| Path | 1 | 2 | 3 | 4 | 5 |
|------|---|---|---|---|---|
| `/policy` | Y | P | Y | P | Y |
| `/economy` | Y | P | Y | P | Y |
| `/follow-the-money` | P | P | Y | P | Y |
| `/board-intelligence` | P | P | Y | P | Y |
| `/intelligence-chain` | Y | Y | Y | Y | Y |

## Resources

| Path | 1 | 2 | 3 | 4 | 5 |
|------|---|---|---|---|---|
| `/pricing` | Y | Y | Y | P | Y |
| `/methodology` | Y | Y | Y | Y | Y |
| `/work-with-jackye` | Y | Y | Y | P | Y |
| `/recruiting` | Y | P | Y | P | Y |
| `/request-correction` | Y | Y | Y | N | Y |
| `/privacy` | Y | Y | N | N | Y |
| `/terms` | Y | Y | N | N | Y |
| `/disclaimers` | Y | Y | N | N | Y |

## Engagement / growth (sidebar & App routes)

| Path | 1 | 2 | 3 | 4 | 5 |
|------|---|---|---|---|---|
| `/brand-madness` | Y | Y | Y | Y | Y |
| `/rivalries` | Y | Y | Y | Y | P |
| `/play` People Puzzles | Y | Y | Y | Y | P |
| `/quiz` | Y | Y | Y | P | P |

## Backlog (from this audit)

1. **Adaptive flow:** Dwell-time or persona-based simplification on `/check` and heavy offer flows.
2. **Share atoms:** More OG-ready deep links for intelligence report permutations.
3. **Data lifecycle:** User-visible TTL per upload feature; automated archival jobs (server).
4. **Policy:** Central tier checks in [`access-policy`](../src/lib/access-policy.ts); mirror rules in Supabase RLS (see [ACCESS_POLICY.md](ACCESS_POLICY.md)).

_Last updated: flow-ux audit implementation._
