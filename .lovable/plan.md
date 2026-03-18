

# Offer Intelligence & Negotiation Coach — Enhancement Plan

## What Already Exists
The Strategic Offer Review (`/strategic-offer-review`) already has: walk-away calculator, offer input form, legal audit, scoring engine, negotiation scripts, questions to ask, decision summary, and employer intelligence. This is a **refinement and integration** task, not a greenfield build.

## What's Missing (4 Gaps)

### Gap 1: Signal Engine Not Connected to Offer Evaluation
The 6 canonical signals (`hiring_activity`, `workforce_stability`, `compensation_transparency`, `company_behavior`, `innovation_activity`, `public_sentiment`) from `company_signal_scans` are NOT integrated into the offer review. The EmployerIntelligenceCard only shows civic/political data.

**Fix:** Create an `OfferRiskSignals` component that fetches canonical signals for the matched company and outputs a risk level (low / moderate / elevated) with plain-language summaries. Wire this into the scoring engine as an additional input.

### Gap 2: No "Offer Reality Check" Summary
The current decision summary ("Should You Sign?") uses 5 verdict labels. The prompt wants a cleaner 4-tier system focused on position assessment.

**Fix:** Create a new `OfferRealityCheck` component — a hero-style summary card at the top of results that shows:
- **Offer Position**: Strong Offer / Fair Offer / Needs Review / Proceed Carefully
- Summary of findings (2-3 sentences)
- Key gaps (what's missing from the offer)
- Confidence level (based on data completeness)
- Risk signal summary from the signal engine

This replaces the current `OfferDecisionSummary` or sits above it as the primary takeaway.

### Gap 3: Missing Evaluation Dimensions
Two evaluation axes from the prompt don't exist:
- **Internal Consistency**: Compare offer salary to compensation data for same company (use `compensation_data` table)
- **Transparency Signals**: Whether salary was disclosed upfront (add a simple toggle to the input form)

**Fix:** Add a "Was the salary range shared before you applied?" toggle to Step 1. Query `compensation_data` for the matched company to compare offer vs. internal benchmarks. Output: "aligned / lower / unclear" and "transparent / delayed / unclear".

### Gap 4: Negotiation Tone Doesn't Match Principles
The `NegotiationBot` uses directive scripts ("Challenge the Repayment Clause"). The prompt requires question-framed, non-pushy language.

**Fix:** Refactor negotiation output to use the "optional next steps framed as questions" pattern. Replace imperative headers with exploratory framing. Keep the copy-to-clipboard functionality.

## Implementation Steps

1. **Add input fields** — "Was salary shared upfront?" toggle + integrate into offer state
2. **Create `OfferRiskSignals` component** — fetches canonical signals, computes risk level, renders signal cards with hiring/stability/growth summaries
3. **Create `OfferRealityCheck` component** — hero summary with 4-tier verdict, findings, gaps, confidence, integrating signal engine risk level
4. **Add internal consistency check** — query `compensation_data` for matched company, compare to offer salary
5. **Update `OfferDecisionSummary`** — align verdict labels to Strong/Fair/Needs Review/Proceed Carefully
6. **Refactor `NegotiationBot`** — reframe scripts as questions ("Have you considered asking about..."), remove directive language
7. **Wire into dashboard** — add OfferRealityCheck as first section in Step 3, add OfferRiskSignals after employer intel, pass signal data into scoring

## Files Changed
- `src/pages/StrategicOfferReview.tsx` — new input toggle, wire new components, pass signal data
- `src/components/strategic-offer/OfferRealityCheck.tsx` — **NEW** — hero summary card
- `src/components/strategic-offer/OfferRiskSignals.tsx` — **NEW** — signal engine integration
- `src/components/strategic-offer/OfferDecisionSummary.tsx` — update verdict labels
- `src/components/strategic-offer/NegotiationBot.tsx` — reframe tone
- `src/lib/offerStrengthScoring.ts` — add signal engine risk as scoring input

No database changes needed — all required tables (`company_signal_scans`, `compensation_data`) already exist.

