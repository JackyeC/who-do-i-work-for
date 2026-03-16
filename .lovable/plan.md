

## Audit: "Master Build Prompt" vs Current State

After reviewing the full codebase, **the vast majority of this prompt is already implemented**. Here's the status and the small gaps remaining:

### Already Built ✅

| Item | Status |
|---|---|
| Hero H1: "See who you really work for before you say yes." | ✅ Line 80 of Index.tsx |
| Hero subtext about "in the rooms where it happens" | ✅ Line 294 |
| Founder bio quote (background check the industry never wanted) | ✅ Lines 289-291 |
| 5-Pillar layout on landing page | ✅ Lines 178-199 (Power & Influence, People & Experience, Pay & Benefits, Practice & Policy, Process & Tech) |
| 5-Pillar sections in CompanyProfile | ✅ Full implementation with all cards |
| TransparencyGhosting ("Nothing" signal) | ✅ Component exists with 8 signal types |
| Watchdog/extremist association layer | ✅ Per memory, already built |
| Legal footer on landing page | ✅ Line 488-490 |
| "View Source" buttons on high-risk links | ✅ Per memory |
| Job board with credits, 30-day expiry | ✅ Per memory + deactivate-expired-jobs function |
| Founding Partner $599/yr pricing | ✅ Per memory |
| Single credit $199 | ✅ Per memory |
| Jackye Insight + Connection Chain on job listings | ✅ Per memory |
| Global search with "not vetted" prompt | ✅ Per memory |
| Admin dashboard with queues | ✅ FounderConsole.tsx |
| Lazy-loading (Suspense wrappers) | ✅ Lines 8-20 of Index.tsx |
| WCAG high-contrast on risk data | ✅ Destructive/amber colors used |

### Gaps to Fix (3 items)

**1. Missing signature line**: "Unapologetically Transparent. — Jackye Clayton" is not present anywhere on the landing page.

**2. TransparencyGhosting wording mismatch**: Current text says "Transparency Gaps — They're Not Showing You This" with tooltip explanations. The prompt requests the explicit text: **"Data Not Disclosed: This employer has not made this information public."** — the current component is close but doesn't use this exact phrasing.

**3. Missing hero subtext**: The prompt specifies a specific hero subtext: *"The background check just flipped. I've been blessed to be in the rooms where it happens—now I'm taking everything I've learned and putting it into your hands."* — currently a different (arguably better) subtext is used on lines 83-85. The Jackye section lower on the page has a similar sentiment but not this exact text.

### Plan

1. **Add signature** to the bottom of the Jackye section on the landing page (after line 295): `"Unapologetically Transparent. — Jackye Clayton"` in styled mono text.

2. **Update TransparencyGhosting** to use the exact "Data Not Disclosed" language per the prompt, while keeping the existing rich tooltip behavior.

3. **Update hero subtext** (line 83-85) to match the requested copy while preserving the existing search and CTA flow.

All three changes are text/copy updates — no new components, tables, or APIs needed.

