

# Fix Negotiation Simulator Feedback

## Problems Identified

1. **Feedback fires on the AI's opening message** — before the user has said anything. The AI gives feedback on its own greeting, which is nonsensical ("What worked: Opening with a warm welcome"). Feedback should only appear after user input.

2. **Feedback renders at the bottom of the chat, not inline** — all feedback cards are dumped below all messages instead of appearing after each user→assistant exchange.

3. **Feedback fields are shallow** — "what worked / could be stronger / better version / shorter version" reads like a copywriting critique, not negotiation coaching. It doesn't tell the user what *tactic* they used, what *leverage* they missed, or what to do next.

---

## Changes

### 1. Fix the system prompt — no feedback on opening message

In `supabase/functions/negotiation-simulator/index.ts`, update both system prompts:
- Change rule 4 from "If no user messages yet, open with a greeting" to explicitly say: **"If no user messages yet, open with a 1-2 sentence greeting ONLY. Do NOT include a [FEEDBACK] block on the opening message."**
- This stops the nonsensical self-feedback on Round 1.

### 2. Upgrade feedback fields for real negotiation coaching

Update the `[FEEDBACK]` JSON schema in both prompts to include richer fields:

| Field | Purpose |
|---|---|
| `tactic_used` | Name the negotiation tactic the user employed (e.g. "anchoring", "silence", "value framing", "concession trading") |
| `what_worked` | What was effective in their approach |
| `missed_opportunity` | What leverage or angle they left on the table |
| `suggested_response` | A single rewritten version they could have said |
| `power_move` | A bold alternative for advanced practice |
| `tone` | too_soft / balanced / too_aggressive (keep this) |
| `effectiveness` | 1-5 rating of how likely this would move a real negotiation forward |

### 3. Update `FeedbackData` interface and `RoundFeedback` component

In `src/components/negotiation/RoundFeedback.tsx`:
- Update the `FeedbackData` interface with the new fields (keep old fields as optional for backward compatibility)
- Redesign the card: show tactic badge, effectiveness score (1-5 dots or bar), missed opportunity callout, and a single "Try this instead" suggestion
- Remove the redundant "shorter version" field — it adds no coaching value

### 4. Render feedback inline after each exchange, not at the bottom

In `src/components/negotiation/SimulatorChat.tsx`:
- Instead of rendering all feedbacks after all messages, interleave them: after each assistant message that follows a user message, render the corresponding feedback card
- Logic: pair feedback[i] with the (i+1)th assistant message (since feedback[0] corresponds to the first user→assistant exchange)

### 5. Increase `max_tokens` to 600

The richer feedback JSON needs more room. Bump from 400 to 600 in the edge function.

---

## Files Modified

- `supabase/functions/negotiation-simulator/index.ts` — updated prompts, increased max_tokens
- `src/components/negotiation/RoundFeedback.tsx` — new FeedbackData interface, redesigned card
- `src/components/negotiation/SimulatorChat.tsx` — inline feedback rendering
- `src/components/negotiation/SessionSummary.tsx` — adapt to new feedback fields

