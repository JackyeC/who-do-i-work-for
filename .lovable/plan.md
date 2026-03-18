

# Pre-Offer Audit & AI Negotiation Coach

## What Already Exists
- **StrategicOfferReview** page with 12+ sections: Reality Check, Strength Score, Risk Signals, Legal Audit, Equity Visualizer, NegotiationBot (static scripts), Decision Summary, Career Path Forecast
- **NegotiationBot** generates static copy-paste scripts based on flags, salary, and situations
- **Negotiation Simulator** — live AI chat (edge function `negotiation-simulator`) for practice rounds
- **company_signal_scans** already queried for risk signals on offer review
- **generateClashAlerts()** already detects DNA-vs-signal mismatches
- **OfferDecisionSummary** provides Go/No-Go verdict with 4 tiers

## What's Missing (3 New Capabilities)

### 1. Stability Delta — "What Changed Since You Started Interviewing"
**New component: `src/components/strategic-offer/StabilityDelta.tsx`**

- Add an optional `interviewStartDate` field to the offer input form (Step 1)
- Query `company_signal_scans` WHERE `scan_timestamp > interviewStartDate` for the company
- Compare current signals against signals from before that date
- Display drift items: new WARN notices, leadership changes, sentiment shifts, hiring slowdowns
- Each drift item shows the signal category, old vs. new state, and a plain-language "What this means"
- If no interview date provided, skip this section gracefully

**Update: `src/pages/StrategicOfferReview.tsx`**
- Add `interviewStartDate` to `OfferInput` interface
- Add date picker in Step 1 (Baseline)
- Insert `<StabilityDelta>` as first section in the dashboard (before Reality Check)
- Query both "before" and "after" signals to compute deltas

### 2. AI Negotiation Coach — "The Closer"
**New edge function: `supabase/functions/negotiation-coach/index.ts`**

Uses the existing Lovable AI gateway. System prompt incorporates:
- Company signal data (all 6 categories) passed from the client
- Offer details (salary, equity, bonus, RTO policy)
- Legal flags (non-compete, arbitration, repayment clauses)
- Comp percentile from the report
- User's DNA profile priorities

Generates 3 email versions:
- "The Collaborative" — warm, relationship-first
- "The Data-Driven" — market benchmarks, percentile references
- "The High-Value" — equity/long-term focus

Uses tool-calling to return structured JSON with `{ collaborative, dataDriven, highValue }` email texts plus a `leverageInsights` array.

**New component: `src/components/strategic-offer/NegotiationCoach.tsx`**
- "Generate My Negotiation Emails" button (Pro-gated)
- Sends offer context + signals to the edge function
- Displays 3 tabbed email drafts with copy buttons
- Shows "Leverage Insights" section (e.g., "Government contract detected — ask for equity")
- Loading state with streaming response

**Update: `src/pages/StrategicOfferReview.tsx`**
- Add NegotiationCoach below the existing NegotiationBot section
- Add "negotiate-coach" to DASHBOARD_SECTIONS nav

### 3. Outcome Feedback — "Did You Get the Bag?"
**New component: `src/components/strategic-offer/OutcomeFeedback.tsx`**

After the Decision Summary, show a card:
- "How did it go?" with 3 options:
  - "I negotiated more" → prompt for amount increase
  - "I got protections in writing" → prompt for what changed
  - "I declined" → prompt for reason
- Stores response in a new `offer_outcomes` table for product analytics

**Database migration:**
```sql
CREATE TABLE public.offer_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  outcome_type TEXT NOT NULL CHECK (outcome_type IN ('negotiated_more', 'got_protections', 'declined')),
  details TEXT,
  amount_increase INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.offer_outcomes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own outcomes" ON public.offer_outcomes
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
```

## Files Created
1. `src/components/strategic-offer/StabilityDelta.tsx`
2. `supabase/functions/negotiation-coach/index.ts`
3. `src/components/strategic-offer/NegotiationCoach.tsx`
4. `src/components/strategic-offer/OutcomeFeedback.tsx`

## Files Modified
1. `src/pages/StrategicOfferReview.tsx` — add interviewStartDate field, wire 3 new components into dashboard
2. `supabase/config.toml` — register negotiation-coach function (verify_jwt = false)

## Pro Gating
- StabilityDelta: visible to all (builds trust)
- NegotiationCoach (AI emails): Pro-only, wrapped in `<PremiumGate variant="blur">`
- OutcomeFeedback: visible to all (data collection)

