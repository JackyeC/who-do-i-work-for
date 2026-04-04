# Viral Image Spec — WDIWF: The Poster System

**Prerequisite:** [`MESSAGE_SYSTEM.md`](MESSAGE_SYSTEM.md) — pick layout **after** truth / stakes / gap are clear. Precedence: **MESSAGE > VOICE > DESIGN**.

**Addendum to:** Newsletter / social / share pipeline (pairs with `INTERACTIVE_CARD_SYSTEM.md` **System 4 — Share**).

**Tagline:** Every image ironic. Every image shareable. Every image makes you say *omg Jackye.*

**Source snapshot:** April 2025 (design doc image). **Maintained** copy lives here.

**Brand:** Creative may show **DIWF** + crown; shipped assets should still resolve to **Who Do I Work For** and **Jackye Clayton**, with URLs at **`https://wdiwf.jackyeclayton.com`**.

**Style anchors:** Use only **`docs/visual-references/anchor-01.png` … `anchor-09.png`** plus [`visual-references/README.md`](visual-references/README.md). **Do not** name or reverse-engineer original campaigns in public copy.

---

## The one-line brief

**Core directive:** Every poster on WDIWF should look like **polished mid-century American consumer print** (1950s–60s magazine / trade advertising confidence) — and say something that would get that ad **killed in legal review today**.

**How the humor works**

- The visual is **completely sincere**: cheerful, aspirational, **Mad Men–era** confidence.
- The **copy / product** is a **brutal modern workplace truth** (the thing workers actually feel).
- The **implied agency** behind the campaign is **Jackye** (satirical voice, not a fake real company).

**What this is not**

- Not generic “retro” for vibes.
- Not a lazy vintage filter dump.
- Not meme-template clipart or rage-comic energy.

**World-building**

- All posters live in one **locked satirical campaign system**.
- The **advertiser** is always **Corporate America** (abstract, not a real trademark attack ad unless legally cleared).
- The **product** is always something **no worker would willingly buy** — “mandatory fun,” invisible labor, surveillance-as-career, etc.

---

## Part 1 — The concept (reference world)

**Visual language:** Mid-century American advertising at its **most confident and unhinged**.

**Reference buckets** (composition only — **no** specific campaign names in outward-facing materials)

- **Period consumer print**: authoritative layouts, testimonials-as-type, “survey says” blocks — reusable **shapes** for **source literacy** and satire, not for harmful products.
- Household and **industrial lifestyle** campaigns.
- Golden-age **print**: technicolor or muted **magazine** palettes; professional **illustration or photography** of the era.

**Twist layer**

- Headline / subhead / fake product name states the **modern labor truth**.
- Optional small print: policy-speak, HR euphemisms, or “engagement” language — still period-typed.

---

## Safety, rights, and satire guardrails

- **Do not** generate imagery that glamorizes **smoking**, alcohol abuse, or self-harm. Use **period style** without encouraging harmful behavior. Borrow **layout and type** only; avoid packs, smoke trails, or “doctor says” health hoaxes.
- **No** real corporate logos or trademarked mascots unless you have rights.
- **No** punching down at protected groups; the target is **systems and absurd workplace norms**, not marginalized workers.
- Satire should be **legible**: if the joke needs a paragraph to explain, simplify.

---

## Production checklist (every poster)

- [ ] Reads as **1950s–60s high-end ad** at thumbnail size.  
- [ ] **One** clear headline (8 words or fewer on-image when possible).  
- [ ] **WDIWF** or crown mark in safe zone (corner lockup — match brand kit when exists).  
- [ ] **Alt text** for social + site: describe visual + joke for accessibility.  
- [ ] Export: **1080×1350** (IG), **1200×630** (OG), **1080×1920** (Stories) as needed from a master.

---

## Image-generator prompt template (copy/paste)

Use as a **system** block + **user** story line. Replace `{{WORKPLACE_TRUTH}}` and `{{FAKE_PRODUCT_NAME}}`.

**System-style instructions**

> Generate a single poster image: 1950s–1960s American **consumer print advertising** aesthetic — confident art direction, period typography, technicolor or muted magazine palette, professional illustration or staged photo look. Cheerful, aspirational composition. **No** real company logos. **No** glamorized smoking, alcohol, or harmful products. The ad promotes a **fake satirical product** `{{FAKE_PRODUCT_NAME}}` about `{{WORKPLACE_TRUTH}}`. The tone is sincere vintage ad; the message is modern labor satire. Include subtle footer text: “Who Do I Work For” and “Jackye Clayton” as fictional campaign credit. High resolution, clean edges, print-quality.

**User line example**

> Fake product: “Synergy Saturday™ — Mandatory Weekend Fun.” Scene: diverse coworkers in unnaturally bright smiles at a rope course. Headline: “You’ll Thank Us Monday.”

---

## Part 2 — Reference gallery (getting the pictures right)

Local copies: **`docs/visual-references/anchor-01.png` … `anchor-09.png`**. See [`visual-references/README.md`](visual-references/README.md) for abstract “steal / avoid” — **no** provenance table in public-facing channels.

### A. Historical print (composition only)

Match **layout, type hierarchy, and confidence** — not harmful claims or third-party brands.

| Pattern | Borrow for WDIWF |
|--------|-------------------|
| **Collage + corner vignettes** | Multi-bullet “receipts” carousels; one hero + three corner callouts |
| **Large interrogative headline** | Daily hook in the same **shape** (e.g. bias literacy) — write **original** words |
| **Authority + statistic** | Subvert into **source literacy**: “four outlets — here’s who leans where” |
| **Magazine spread** | Long-form hero: masthead rhythm, two columns, drop cap — **your** story only |
| **Domestic / workplace problem–solution** | Satire where the “product” is **wellbeing theater** or **always-on chat** — not harmful goods |

### B. Native satire (north star)

| Anchor IDs | Why they work |
|-------------|----------------|
| **07** | Period office + euphemistic copy + **dissonance** between face and object |
| **09** | Triptych for **spectrum** coverage; hex anchors **#2b547e**, **#9e2a2b**, **#4f5d2f** |

**Logo rule:** If a study image showed real tech marks, **never** reproduce them in generated output — fictional strips only.

### C. Line B — modular social (modern)

**08** — header band, body, quote, disclaimer, URL, tagline. Fast daily when you are not rendering full vintage illustration.

**Modular fields (for Figma or code):**

1. `KICKER` (all caps)  
2. `EMOJI` (optional)  
3. `TITLE` (display)  
4. `SUBTITLE` (outline or contrast)  
5. `QUOTE` (italic)  
6. `DISCLAIMER` (small italic)  
7. `URL` + footer tagline  

---

## Prompt variants (match the reference pattern)

**Variant — Collage poster (safe subject matter)**  
> 1950s American magazine **collage** ad layout: central cheerful illustrated figure in dynamic pose, **three corner** mini-scenes with short rhyme-style captions, bold script headline, primary red/blue/cream palette. **No** tobacco, alcohol, or harmful products. The ad sells a fake office product: `{{PRODUCT}}`. Fine print in period type. Footer: Who Do I Work For · Jackye Clayton.

**Variant — Provocative question**  
> 1930s–40s vertical print ad: **enormous** all-caps question headline at top, flat color field, elegant serif subhead, illustrated figures in period dress, **no** harmful products. Body columns about `{{TOPIC}}` as satirical copy. **No** real brands.

**Variant — Authority subverted (source literacy)**  
> Mid-century **red background** poster: illustrated expert in lab coat holding **clipboard and magnifying glass** (neutral props — not harmful goods). Giant headline: `{{HEADLINE}}` about **news sources and bias**. Small asterisk: “Figures verified by **your own reading**.” Footer satire line. Faux vintage print texture optional.

**Variant — Triptych (three framings)**  
> Three vertical panels side by side, **grainy newsprint**: (1) blue `{{PANEL_A}}` (2) red `{{PANEL_B}}` (3) olive green `{{PANEL_C}}`. Each: italic serif header, mid-century illustration, sans-serif footer banner with one line of copy. Theme: `{{LABOR_OR_POLICY_STORY}}`. **No** logos.

**Variant — Line B tickle (flat digital)**  
> Clean social graphic: rounded header “JACKYE CLAYTON x WDIWF PRESENTS”, contrasting body field, bold display title `{{TITLE}}`, small emoji, white italic quote `{{QUOTE}}`, footer `wdiwf.jackyeclayton.com` and tagline about career intelligence. **Not** vintage; **not** photorealistic.

---

## Inclusive AF + shock humor

**Copy on the poster** should **mirror worker stakes** (the thing people actually navigate) and stay **mission-aligned** — career intelligence, asymmetry, dignity — not clever emptiness. Visual style is secondary to **who the line is for** and **what truth it holds**.

- Prefer **punching up** at employers, systems, and euphemisms — not workers or medically exploitative angles for edginess.  
- **Anchor-06** is for **texture + lockup** study only; do **not** revive harmful historical shock tropes in new WDIWF work — keep satire on **work**.  
- Cast **diverse** people in **power** (managers delivering absurd lines) and **diverse** workers with **dignity** — the joke is the **message**, not the person.

---

## Related docs

- `docs/INTERACTIVE_CARD_SYSTEM.md` — **Share system** (poster + LinkedIn + X + save + copy link)  
- `newsletter/CHANNEL_PLAYBOOK.md` — UTMs and CTA routing  
- `newsletter/WDIWF_NEWS_CHARTER.md` — voice must still be **inclusive**; posters are **satire**, not cruelty  

---

## Continuation

Typography grids, exact Figma components, and motion specs can ship as **Part 3**. Style anchors live in **`docs/visual-references/`** (`anchor-NN.png` only).
