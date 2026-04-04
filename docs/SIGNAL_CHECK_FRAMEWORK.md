# Signal Check™ — WDIWF multi-source coverage framework

**Purpose:** Repeatable, **system-ready** pattern for how WDIWF treats a story — **structure over opinion**, **patterns over link dumps**, **clarity without academic fog**. This is WDIWF’s editorial engine (and future **Signal** product layer). **Do not** name third-party aggregation brands in **reader-facing** copy; the methodology stays in docs and prompts.

**Charter tie-in:** Bias labels, 4-outlet / DEVELOPING, and source maps live in [`newsletter/WDIWF_NEWS_CHARTER.md`](../newsletter/WDIWF_NEWS_CHARTER.md).

**Precedence:** Facts first. Framing is **shown**, not shouted. **No** “both sides” false equivalence on dignity or rights (per charter).

**Drift rule for agents:** If you cannot substantiate a bucket (lean / gap / incentive), **omit** that line — never fabricate to complete the template.

---

## 1. What Signal Check™ is

One story → **map how coverage clusters and what’s missing** → **signal strength** → **People Puzzles / Jackye lens** → **decision impact** for the reader. Same block every time so **Cursor and humans don’t improvise**.

---

## 2. Repeatable section structure (ship in this order)

Use these **heads** (emoji optional in email; keep heads in automations for parsing consistency).

| # | Block | Job |
|---|--------|-----|
| 1 | **What happened** | **One sentence**, factual — no adjectives of judgment. |
| 2 | **Where the coverage leans** | **Left / Center / Right** — **one line each** on *weight and frame*, not a link list. |
| 3 | **Bridge line** | Short punch, e.g. *Same ruling. Different weight depending on where you read it.* (adapt to story). |
| 4 | **What changes depending on the source** | **≤3 bullets** — what shifts (stakes, main character, risk frame, etc.). |
| 5 | **What’s not being said** | **2–3 bullets**, **pattern-focused** (precedent, frequency, second-order questions). Substantiated only. |
| 6 | **Pattern bridge** (optional, one line each) | e.g. *Everyone is debating implications.* / *Almost no one is showing patterns.* — only if true. |
| 7 | **Who shapes what you’re reading** | **≤3 bullets**, **incentive-based** (wire speed, audience alignment, engagement optimization) — no unsourced smears. |
| 8 | **Incentive bridge** (optional) | e.g. *You’re not just reading reporting. You’re reading incentives.* |
| 9 | **Signal strength** | **High / Medium / Low** with **one short explanation each** for what’s firm vs contested vs speculative (see §5). |
| 10 | **People Puzzles take** | Short **systems + behavior** insight — Jackye voice; connects slow institutions vs fast news cycles when relevant. |
| 11 | **The question that matters** | **One** sharp, reflective closing question. |
| 12 | **Decision impact** | **👉 What this should or could change for you this week:** one concrete line (bridge from interesting → actionable). |

**Source map** (URLs + bias labels) still belongs **elsewhere** in the piece per charter — Signal Check™ is the **synthesis layer**, not the bibliography.

---

## 3. Filled example (structure only — replace with real reporting)

```markdown
## Signal Check™

### What happened
A federal judge rejected the DOJ’s attempt to reinstate subpoenas connected to Sidney Powell, limiting how prosecutors can pursue parts of the case tied to post-election activity.

### Where the coverage leans
- **Left** → Heavy coverage, framed as accountability tied to Trump-related legal pressure  
- **Center** → Procedural focus on the ruling itself  
- **Right** → Selective coverage emphasizing limits on DOJ authority  

👉 Same ruling. Different weight depending on where you read it.

### What changes depending on the source
- The importance of the ruling (major setback vs routine legal step)  
- The main character (Powell vs DOJ vs broader system)  
- The risk framing (threat to democracy vs government overreach vs neutral process)  

### What’s not being said
- What precedent this sets for future federal subpoenas  
- Whether this meaningfully weakens broader election-related cases  
- How often DOJ loses motions like this (pattern vs one-off)  

👉 Everyone is debating implications.  
👉 Almost no one is showing patterns.

### Who shapes what you’re reading
- Wire-dependent outlets → speed over interpretation  
- Large media groups → aligned to audience expectations  
- Niche outlets → optimize for engagement, not completeness  

👉 You’re not just reading reporting.  
👉 You’re reading incentives.

### Signal strength
- **High** → The ruling itself (confirmed across sources)  
- **Medium** → Legal meaning (varies by framing)  
- **Low** → Long-term impact (largely speculative or ignored)  

### People Puzzles take
This isn’t really about Powell. It’s about what happens when legal systems move slowly, media cycles move instantly, and the public is asked to interpret both at the same time. When those speeds don’t match, people don’t wait — they fill the gap with belief.

### The question that matters
If the same decision can be framed as accountability, overreach, or routine — what are you actually reacting to: the ruling, or the version you were handed?

### Decision impact
👉 **What this should or could change for you this week:** _[One concrete behavior, risk check, or conversation — tied to work/life decisions, not punditry.]_
```

---

## 4. Cursor-ready prompt (paste verbatim — automations / Projects)

Use this **exact** block for **every** Signal Check generation. Replace only the story context you inject below the prompt.

```
Generate a "Signal Check™" section for a news story.

Requirements:
- Write in a sharp, grounded, human tone (no fluff, no academic language).
- Focus on structure over opinion.
- Do not list links in the Signal Check block. Synthesize coverage patterns (source map lives elsewhere in the charter workflow).
- Do not name third-party news-aggregation products or brands.

Structure:
1. What happened (1 sentence, factual)
2. Where the coverage leans (Left, Center, Right — 1 line each)
3. One bridge line (same event, different weight by outlet cluster)
4. What changes depending on the source (3 bullets max)
5. What’s not being said (2–3 bullets, pattern-focused; omit if unsubstantiated)
6. Who shapes what you’re reading (3 bullets max, incentive-based; no unsourced attacks)
7. Signal strength (High / Medium / Low with short explanation each — map to verified fact vs contested meaning vs speculation)
8. People Puzzles take (short insight connecting systems + behavior)
9. One closing question (sharp, reflective)
10. Decision impact — line starting with: 👉 What this should or could change for you this week:

Rules:
- No filler phrases
- No "both sides" language
- No long paragraphs
- Prioritize clarity and pattern recognition over completeness
- If data is missing for a subsection, skip that subsection rather than inventing it
```

---

## 5. Signal strength (aligned with charter)

| Label | Use when |
|--------|----------|
| **High** | Core **fact** or event is **multi-source** or document-backed (charter **Verified** lane). |
| **Medium** | Facts established but **meaning, emphasis, or legal significance** diverges by cluster. |
| **Low** | **DEVELOPING**, thin sourcing, or **impact / narrative** mostly speculative — label clearly. |

---

## 6. Anti-patterns (automation QA)

- Headline stack + “curated” with **no** synthesis.  
- Invented outlet counts, fake blind spots, or invented incentive claims.  
- Signal Check **as** the only sourcing (still need **source map** per charter where the format includes URLs).  
- Skipping **Decision impact** on major items — that line is the **bridge to actionable**.

---

## 7. Quick reference

- Master prompt: [`newsletter/prompts/wdiwf-master-daily.md`](../newsletter/prompts/wdiwf-master-daily.md)  
- Substack / email body: [`newsletter/template-substack-daily.md`](../newsletter/template-substack-daily.md)  
- Enforcement: [`newsletter/style/enforcement.md`](../newsletter/style/enforcement.md)
