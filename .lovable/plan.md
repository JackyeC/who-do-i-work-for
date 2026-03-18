

# Offer Acceptance Email Generator — "The Closing Script"

## What It Is
An AI-generated "Offer Acceptance" email that documents the intelligence-backed terms the user negotiated. It sits between the Negotiation Coach results and the Outcome Feedback card — the natural moment when the user has finalized terms and is ready to accept.

## Architecture

### 1. New Edge Function: `supabase/functions/acceptance-email/index.ts`
- Uses Lovable AI gateway (Gemini 3 Flash) with tool-calling
- Accepts: companyName, roleTitle, baseSalary, bonus, equity, signOnBonus, startDate, recruiterName, userName, departmentName, negotiatedTerms (array of what was clarified/changed), topSignals (company signals referenced during negotiation)
- Returns structured JSON: `{ subject, body }` — a professional acceptance email that references specific intelligence points (stability roadmap, patent signals, comp transparency) without exposing the tool
- System prompt enforces the "Ground Truth" tone: professional, specific, documents what was discussed, references company signals naturally

### 2. New Component: `src/components/strategic-offer/AcceptanceEmail.tsx`
- Appears after NegotiationCoach generates results (conditionally rendered)
- Small form for: userName, recruiterName, startDate, departmentName, negotiatedTerms (multi-select chips from leverageInsights + free text)
- "Generate Acceptance Email" button → calls edge function
- Result displayed in a styled card with copy-to-clipboard
- Pro-gated (same tier as NegotiationCoach)

### 3. Integration into `StrategicOfferReview.tsx`
- Add `<AcceptanceEmail>` between NegotiationCoach and OutcomeFeedback
- Add `{ id: "acceptance", label: "Accept" }` to DASHBOARD_SECTIONS nav
- Pass offer details + riskSignals as props

### 4. Edge Function Registration
- Add `[functions.acceptance-email]` with `verify_jwt = false` to `supabase/config.toml`

## Files

| Action | File |
|--------|------|
| Create | `supabase/functions/acceptance-email/index.ts` |
| Create | `src/components/strategic-offer/AcceptanceEmail.tsx` |
| Modify | `src/pages/StrategicOfferReview.tsx` — add component + nav item |
| Modify | `supabase/config.toml` — register function |

## User Flow
1. User generates negotiation emails via Coach
2. Negotiations conclude — user scrolls to "Accept" section
3. Fills in recruiter name, start date, department, and selects which terms were clarified
4. AI generates a professional acceptance email referencing the intelligence profile
5. User copies and sends
6. Scrolls to Outcome Feedback ("Did you get the bag?")

