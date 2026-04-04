# Interactive Card System — WDIWF (Who Do I Work For)

**Subtitle:** Vote · Sources with context · This or that debate · Share that leads back to Jackye

**Mission:** Every share is an image **and** a story **and** a referral to **Jackye Clayton**.

**Brand:** Creative may show **DIWF**; product and production URLs should use **WDIWF** and **`https://wdiwf.jackyeclayton.com`** (update if the spec said `whodoiworkfor.com`).

**Source snapshot:** Design doc (uploaded image). This file is the **maintained product + editorial spec** for builders and content automation.

---

## North star

Story cards are **not** optional engagement layers — the **four systems below are the product**. Newsletter, Substack, LinkedIn, and Friday email should **describe the same behaviors** readers see on-site (or clearly label “coming soon” if shipping in phases).

---

## The four systems (every story card)

| # | System | What it does |
|---|--------|----------------|
| 1 | **Reddit-style upvote** | Up/down vote on every card; **live percentage**; **persisted per user**. Signals what workers actually care about (editorial + product analytics). |
| 2 | **Sources with explanation** | More than a link: **tier dot**, source name, **plain-English why it matters**, **bias** of the outlet, direct link. Aligns with `WDIWF_NEWS_CHARTER.md` and Ground News–style literacy. |
| 3 | **This or that debate** | **Image-based** binary poll on a world-of-work question; **live percentages** with **animated bars**; two illustrated options. |
| 4 | **Share system** | Every path ships **poster image** + story + **attribution to Jackye** + link back to WDIWF. Platforms: **LinkedIn**, **X**, **save poster**, **copy link**. |

---

## System 1 — Reddit-style upvote (detail)

- One vote per user per card (or per story id); allow change or not — **pick in UX spec** (Reddit allows flip; locking reduces brigading).
- Aggregate counts drive **“workers care about this % positive”** (or separate up vs down).
- Expose aggregates to **editorial** (what to push in Friday mail) and optionally to **trending** on homepage.

---

## System 2 — Sources with explanation (detail)

For **each** source row:

- **Tier dot** — trust / verification tier (align with charter: wire, national, trade, op-ed, etc. — define enum in schema).
- **Name** — publication or agency.
- **Why it matters** — one sentence, non-jargony.
- **Bias** — Left · Lean left · Center · Lean right · Right (same vocabulary as `newsletter/WDIWF_NEWS_CHARTER.md`).
- **Link** — outbound URL.

**Data model sketch:** `work_news` (or child table `work_news_sources`) supports **N sources** per story; UI renders a stack, not a single `source_url`.

---

## System 3 — This or that debate (detail)

- **Prompt** copy is world-of-work scoped (labor, RTO, AI, pay, union, DEI policy, etc.).
- **Assets** — two option images (consistent aspect ratio for social crop).
- **State** — vote counts + optional “you voted A/B” persistence.
- **Accessibility** — keyboard + screen reader labels for both choices.

---

## System 4 — Share system (detail)

- **Poster** — OG-style card: headline (short), WDIWF mark, “Jackye Clayton / Who Do I Work For”, QR or short URL. **Creative direction** for viral stills: see **`docs/VIRAL_POSTER_IMAGE_SPEC.md`** (mid-century ad parody system).
- **LinkedIn / X** — open share intent with **prefilled text** + link; text must not exceed platform limits (variants).
- **Save poster** — download PNG/WebP (client-side canvas or pre-rendered asset per story).
- **Copy link** — canonical story URL with UTM (`utm_source=share`, `utm_medium=…`).

All paths must resolve to **WDIWF** (and **Jackye** attribution in creative), per `newsletter/CHANNEL_PLAYBOOK.md`.

---

## Implementation status vs this repo (2026-04-04)

| System | In production (React app) | Notes |
|--------|---------------------------|--------|
| 1 Upvote | **Not on `work_news` cards** | Voting exists elsewhere: **`bracket_votes`** (`BracketMatchupCard`) for Brand Madness — pattern to reuse. |
| 2 Multi-source + tier + explainer | **Partial** | `Newsletter.tsx` **`StoryCard`**: single `source_name` / `source_url` + bias coloring via **`getSourceProfile`**; no tier dot, no per-source paragraph, no multi-row source map. **`WorkNewsRepository`** similar. **`LiveIntelligenceTicker`** shows bias badges. |
| 3 This or that | **Not in app router** | **`public/the-receipts.html`** includes a **Debate** block with live votes + poster-style cards — likely prototype; not wired to main `Newsletter` page. |
| 4 Share poster + 4 paths | **Partial / unclear** | Receipts HTML has poster + share overlay; main **`StoryCard`** has no share sheet. |

**Conclusion:** Spec is **ahead of** the primary `/newsletter` experience. Treat this doc as the **target**; track incremental ships in the table above.

---

## Related docs

- `docs/BUILD_BIBLE.md` — Lovable merge / feature baseline  
- `newsletter/WDIWF_NEWS_CHARTER.md` — bias vocabulary + 4-outlet rule  
- `newsletter/CHANNEL_PLAYBOOK.md` — Substack, social, Friday email, LinkedIn  
- `src/lib/source-bias-map.ts` — current bias labels for outlets (extend with tier + explainer copy)

---

## Optional next engineering tickets (for automation)

1. Schema: `work_news_card_votes` (user_id, article_id, direction, created_at).  
2. Schema: `work_news_sources` (article_id, tier, label, why_matters, bias, url, sort_order).  
3. Schema: `work_news_debates` (article_id, prompt, option_a_label, option_b_label, image_a, image_b) + `work_news_debate_votes`.  
4. API route or edge function: generate **OG image** / poster from story id.  
5. Component: **`InteractiveStoryCard`** composing 1–4, used on `/newsletter` and embeddable in email “read on site” CTAs.

---

## Continuation

The source image indicates **“System 1 — Reddit-Style Upvote”** continues with more granular UX. When you have the next page(s), append sections **System 1 (cont.)** through **System 4 (cont.)** here or drop files into `docs/import/` and link them.
