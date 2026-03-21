

# Tone Down the Intelligence Advisor Opening Message

## Problem
Every time a user visits `/ask-jackye` or opens the floating widget, they're hit with a verbose, system-prompt-looking message exposing internal framework names ("People Puzzles Proprietary Talent Framework v2.6", "WDIWF Intelligence Engine"), status readouts, and jargon. It reads like debug output, not a welcoming advisor. Users shouldn't see engine version numbers or internal system names.

## Fix

### Step 1: Rewrite the opening message in AskJackye.tsx
Replace the current `OPENING_MESSAGE` with a concise, human welcome that focuses on what the advisor can **do** rather than system internals:

```
Welcome — I'm your career intelligence advisor.

I analyze company filings, political spending, workforce signals, and leadership data to give you the full picture before you make a decision.

Ask me about a company, an offer, or your next career move.
```

No version numbers. No "System:" labels. No "Status: All feeds active." No "Run the chain first."

### Step 2: Clean up the terminal header bar
The header already shows "WDIWF Intelligence Engine · Framework v2.6" — simplify to just "Career Intelligence · Online" to match the cleaner tone.

## Files to modify
- `src/pages/AskJackye.tsx` — opening message + header subtitle text

