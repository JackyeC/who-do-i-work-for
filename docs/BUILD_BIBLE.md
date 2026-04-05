# Complete Build Bible — Who Do I Work For (WDIWF)

**Motto:** One document. Every builder. Ship it.

**Creative / editorial operating model:** Message before design; **MESSAGE > VOICE > DESIGN**. Start with [`MESSAGE_SYSTEM.md`](MESSAGE_SYSTEM.md), then [`../newsletter/style/jackye-voice.md`](../newsletter/style/jackye-voice.md) and [`../newsletter/style/enforcement.md`](../newsletter/style/enforcement.md). **Before ship:** run user-facing copy through the pass/fail gate in [`JACKYE_VOICE_QA.md`](JACKYE_VOICE_QA.md). Visual work: [`VIRAL_POSTER_IMAGE_SPEC.md`](VIRAL_POSTER_IMAGE_SPEC.md) + [`visual-references/README.md`](visual-references/README.md).

**Automated content engine:** [`WDIWF_CONTENT_ENGINE_AUTOMATION_LAYER.md`](WDIWF_CONTENT_ENGINE_AUTOMATION_LAYER.md) · [`CONTENT_ENGINE.md`](CONTENT_ENGINE.md) · [`../automations/README.md`](../automations/README.md)

**Version:** 3 — Merged with Live Lovable Implementation (per source snapshot)

**Snapshot date (source doc):** April 4, 2025 — update this line when you re-baseline.

**Brand note:** Some creative uses **DIWF**; product and repo standard is **WDIWF** / **Who Do I Work For**.

**Original reference:** Design snapshot image (uploaded to Cursor project assets). This file is the **maintained, text-based** source of truth for builders and for tying **product facts** to **editorial automation** (newsletter, social, Substack).

---

## Feature status (from Build Bible v3)


| Feature                      | Status | Notes                                                                                                                                                                                   |
| ---------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mock Interview module        | Live   | Browser speech (`webkitSpeechRecognition`), voice + text fallback, `[MockInterview Voice]` console logging.                                                                             |
| Run My Free Scan + Try pills | Fixed  | Turnstile + scan recording non-blocking; pills (e.g. SpaceX, Amazon, Goldman Sachs, Meta) populate search.                                                                              |
| Homepage invisible sections  | Fixed  | “How It Works” uses `bg-muted/40`; “Platform features” uses `bg-card/80` + solid border.                                                                                                |
| Stripe pricing buttons       | Live   | Wired to Supabase Edge Function `create-checkout`; price IDs include `price_1TF2WU…` family; “Start Free” → `/login?tab=signup` (verify against current IA — homepage may use `/join`). |
| Ticker loop                  | Fixed  | Duration extended ~30%; fade-to-background gradients on edges to mask loop reset.                                                                                                       |


---

## Verification vs this repo (last checked: 2026-04-04)

Use this when automating copy or builder handoffs so you do not promise features that diverged.


| Bible claim                                                | Repo check                                                                                                                                                                                                                                                                                                           |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `**create-checkout`** + Stripe prices                      | **Confirmed.** See `supabase/functions/create-checkout/index.ts` — subscription set includes multiple `price_1TF2WU…` IDs plus other tiers (`price_1TEEvt…`, `price_1TF2Wd…`, etc.). Bible’s `price_1TIKsR` was **not** found in that file; may be outdated ID or another surface — grep before citing in marketing. |
| **Start Free** route                                       | **Partial.** Homepage “Start Free” in `src/pages/Index.tsx` navigates to `**/join`**, not `/login?tab=signup`. Pricing and other entry points may still use checkout/login — verify per CTA.                                                                                                                         |
| **Mock Interview + `webkitSpeechRecognition`**             | **Not found** on `src/pages/MockInterview.tsx` in a quick audit (flow uses `job-questions` + `ask-jackye-chat`). **Speech** appears in `src/components/negotiation/SimulatorChat.tsx`. Treat Bible “voice module” as **needs re-audit** or **Lovable-only** until confirmed.                                         |
| **Try pills (SpaceX, Amazon, Goldman, Meta)**              | **Partial.** Homepage featured slugs in `Index.tsx` are `meta`, `google`, `amazon`, `boeing`, `accenture`, `att` — not identical to Bible list. Pill behavior may live on **Browse/Check** flows; grep before claiming exact brands.                                                                                 |
| **Homepage sections “How It Works” / “Platform features”** | **Not matched verbatim** in `Index.tsx` section titles; layout uses different section names. Styling tokens `bg-muted/40` and `bg-card/80` **do appear** elsewhere (e.g. skeletons, cards). Treat section names as **marketing labels** — map to actual section IDs in code when automating.                         |
| **Ticker duration + loop**                                 | **Confirmed** dynamic duration in `LiveIntelligenceTicker.tsx` (`--ticker-duration` from content length). **Edge fade gradients** on the ticker container were **not** found in that component — may be missing or implemented only in Lovable; flag for UX polish.                                                  |
| **Turnstile non-blocking**                                 | **Confirmed pattern** on Browse, Check, Contact, etc. (`useTurnstile`). Map “Run My Free Scan” to the exact route you use in prod.                                                                                                                                                                                   |


**Action:** After each Lovable or major merge, update the table above in one pass (grep Stripe IDs, hero slugs, mock interview, ticker).

---

## Related specs

- **[Interactive Card System](INTERACTIVE_CARD_SYSTEM.md)** — vote, multi-source context, this-or-that debate, share-to-Jackye (product requirements + repo gap analysis).
- **[Viral Poster / Image Spec](VIRAL_POSTER_IMAGE_SPEC.md)** — mid-century print satire for shareable posters (newsletter + social). **Opaque anchors:** [`visual-references/README.md`](visual-references/README.md) (`anchor-01`…`anchor-09`).

## Editorial & automation (cross-links)

Newsletter, charter, and channel cadence live next to this doc conceptually:

- **[Jackye Voice QA (pass/fail)](JACKYE_VOICE_QA.md)** — ship gate for UI copy, Cursor/Lovable output, newsletter, dashboard; use before merge/publish  
- `newsletter/WDIWF_NEWS_CHARTER.md` — sourcing, bias labels, Jackye routing  
- `newsletter/CHANNEL_PLAYBOOK.md` — daily site, Substack, social, Friday email  
- `newsletter/prompts/wdiwf-master-daily.md` — LLM desk prompt

**Product tie-ins for “CNN of work” copy:** Homepage ticker reads `work_news` and already surfaces **source + bias** via `src/lib/source-bias-map.ts` — align newsletter “source map” language with that product behavior when possible.

---

## How to keep this automated

1. **Single owner file:** Treat **this markdown file** as canonical, not the PNG/PDF alone.
2. **PR discipline:** Any Lovable merge that touches Stripe, hero, ticker, or interview flow gets a **one-line update** in the verification table.
3. **Optional CI later:** A small script could grep for `price`_ IDs in `create-checkout` and diff against a list in this doc (say the word if you want that script).

---

## Image asset

If you want the design snapshot in-repo, copy the uploaded PNG into `docs/build-bible-v3-snapshot.png` and link it here.