

# Homepage "War Room" Overhaul

This is a significant restructuring of `src/pages/Index.tsx` to shift the messaging from "search for a job" to "audit your career." The goal: any visitor understands in under 10 seconds that this is intelligence, not a job board.

---

## What Changes

### 1. Hero Section — "Stop Guessing. Start Auditing."

Replace the current hero headline and search bar with:
- **Headline:** "Stop guessing. Start Auditing."
- **Sub-headline:** "Most job boards show you Marketing. We show you Intelligence. Use 15+ years of recruiting data to find your Purple Squirrel job — the one that matches your DNA and your worth."
- **Primary CTA:** `[Calibrate My Workplace DNA]` → links to `/career-map` (the existing DNA faders flow)
- **Secondary CTA:** `[Scan an Employer]` → keeps the search functionality but as secondary
- Keep the Koch Industries live preview card on the right (it already demonstrates the "War Room" value)

### 2. "Choose Your Track" — Two-Column Pricing Section

New section directly after hero with two side-by-side cards:

| The Investigator (One-Off) | The Executive (Yearly Autopilot) |
|---|---|
| "I have an interview or an offer." | "I want to be hunted." |
| Deep-Dive Audit + Negotiation Script | 5-Year Career Map + Purple Squirrel Auto-Apply |
| **Buy One Audit — $275** (existing Stripe price `price_1TCTQX7Qj0W6UtN9T019lM6x`) | **Go on Autopilot — $999/yr** (new Stripe product/price needed) |

- The $275 button triggers the existing `create-checkout` edge function
- The $999/yr requires creating a new Stripe product + recurring price, then wiring it into the checkout function

### 3. "What You Get" — Three Feature Cards

Replace the current "Five Pillars" section with three clear value cards:
- **The Truth:** Clarity Scores, Ghost-Post Detection, Reality Gap Analysis
- **The Strategy:** DNA Calibration, 5-Year Mapping, Internal Gigs
- **The Strike:** Auto-Apply, Interview Briefs, Negotiation Coaching

### 4. "The Jackye Factor" — Authority Section

Keep the existing Jackye section but update the quote to the suggested copy: "I've spent 15+ years building the hiring machines..."  and add the "Founder & Executive Agent" title.

### 5. Comparison Table — "Generic Job Boards vs. WDIWF"

New section with a two-column comparison:
- Left: "Indeed / LinkedIn" — Lists, no context, apply and pray
- Right: "WDIWF" — Intelligence reports, negotiation scripts, auto-apply with DNA match

### 6. Sections to Remove or Consolidate

- Remove "How It Works" 3-step (redundant once the value cards are in)
- Remove "Audiences" tabs (too much cognitive load; the two tracks cover this)
- Keep: Intelligence Dashboard, Rivalry Tracker, Social Proof, FAQ, Email Capture, Footer

---

## Technical Steps

1. **Create Stripe product + price** for "Executive Yearly Autopilot" at $999/yr recurring
2. **Update `create-checkout` edge function** to accept the new yearly price ID
3. **Rewrite `src/pages/Index.tsx`** hero, add pricing tracks section, add 3 feature cards, add comparison table, update Jackye section copy, remove redundant sections
4. **Keep `HeroSearch` component** but reposition it as a secondary action below the main CTA

---

## Files Modified

- `src/pages/Index.tsx` — major restructure
- `supabase/functions/create-checkout/index.ts` — add yearly price ID to allowed set
- New Stripe product via tool call

