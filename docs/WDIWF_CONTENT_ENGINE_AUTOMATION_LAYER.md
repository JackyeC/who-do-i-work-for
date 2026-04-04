# WDIWF Content Engine — complete automation layer

Single canonical doc for **generation + handoff + delivery**. Everything else (`automations/*`, `newsletter/delivery/PUBLISHING.md`) nests under this.

**Before enabling automation in production:** [`CONTENT_ENGINE_PRODUCTION_VALIDATION.md`](CONTENT_ENGINE_PRODUCTION_VALIDATION.md)

**Priority:** MESSAGE > VOICE > DESIGN.

---

## Part 1 — Source-of-truth files (what the automation reads first)

These files **enforce Jackye’s voice and standards at machine speed**. The agent must open them **before** drafting any output.

| File | Role | Status |
|------|------|--------|
| `newsletter/style/jackye-voice.md` | Mission-anchored tone, radical inclusion, mirror reader, honest customization | 🟢 **Required** |
| `newsletter/style/enforcement.md` | Pre-flight + final QA checklist | 🟢 **Required** |
| `docs/MESSAGE_SYSTEM.md` | Message before design; who we mirror; values fit | 🟢 **Required** |
| `docs/VIRAL_POSTER_IMAGE_SPEC.md` | Poster path; safe prompts; anchor images `anchor-01`…`09` | 🟢 **Required** (when `poster-prompt.md` is in scope) |
| `docs/BUILD_BIBLE.md` | Product truth — no false feature claims | 🟢 **Required** |
| `newsletter/WDIWF_NEWS_CHARTER.md` | Sourcing, bias labels, 4-outlet vs DEVELOPING | 🟢 **Required** |
| `docs/SIGNAL_CHECK_FRAMEWORK.md` | **Signal Check™** block + Cursor prompt §4; decision impact; no links inside block | 🟢 **Required** (news/editorial) |
| `docs/visual-references/README.md` | Composition only — not ideology | 🟡 **Required for poster / visual prompts** |
| `newsletter/CHANNEL_PLAYBOOK.md` | CTAs, Friday vs daily, URLs | 🟡 **Friday + routing** |
| `automations/HOT_SIGNAL_ENGINE.md` | Bi-hourly procedure (`HOT_SIGNAL_ENGINE` / **BI-HOURLY CONTENT ENGINE**) | 🟢 **Automation body** |
| `automations/FRIDAY_NEWSLETTER.md` | Friday procedure (`FRIDAY_NEWSLETTER` / **FRIDAY NEWSLETTER ENGINE**) | 🟢 **Automation body** |
| `automations/AUTOMATIONS_REGISTRY.md` | Names, schedules, outputs, enablement rule | 🟢 **Operator map** |

**Legend:** 🟢 always read for that run type · 🟡 read when the deliverable needs it.

If any **required** file is missing from the checkout, the run must **stop** and record a blocker — never hallucinate policy.

---

## Part 2 — Folder structure

| Path | Role |
|------|------|
| `newsletter/inputs/live/` | **Drop zone** — `signals.json`, `notes.md`, `urls.txt`, `feed-snapshot.md` |
| `newsletter/inputs/live/processed/YYYY-MM-DD/` | Optional archive after a run consumes inputs |
| `newsletter/outputs/live/run-<UTC>/` | **Bi-hourly** artifacts — **nothing overwrites**; each run is a new folder |
| `newsletter/outputs/friday/run-<UTC>/` | **Friday** artifacts |
| `newsletter/outputs/live/LATEST_RUN.txt` | Pointer to last successful prepare (live) |
| `newsletter/outputs/friday/LATEST_RUN.txt` | Pointer (Friday) |
| `newsletter/delivery/PUBLISHING.md` | Delivery connectors detail |
| `scripts/content-engine/prepare-run.sh` | Creates `run-*`, blocks bi-hourly if inputs empty |
| `scripts/content-engine/archive-runs.sh` | Prune old `run-*` folders (default 30 days) |

### Bi-hourly output files (per `run-*`)

| File | Purpose |
|------|---------|
| `linkedin.txt` | LinkedIn-ready copy |
| `bluesky.txt` | Bluesky-ready copy |
| `instagram.txt` | IG caption + hashtags + CTA (link in bio) |
| `facebook.txt` | Page post copy + UTM link |
| `youtube-short.md` | Shorts **script / beat sheet** (≤60s, 9:16) or `SKIP` |
| `site-update.md` | Site-ready Markdown |
| `poster-prompt.md` | Full image prompt **or** `SKIP — no poster this run.` |
| `RUN_META.md` | Run id, inputs used, delivery blockers, charter notes |
| `RUN_BLOCKERS.md` | Present only if run aborted (e.g. no inputs) |

### Friday output files (per `run-*`)

| File | Purpose |
|------|---------|
| `newsletter.md` | Full newsletter body |
| `subject-lines.txt` | Exactly **3** subject lines |
| `preview-text.txt` | Preheader aligned to chosen subject |
| `promo-post.txt` | LinkedIn (or multi-platform) promo |
| `site-version.md` | On-site version of the issue |
| `RUN_META.md` | Patterns synthesized, runs consumed, blockers |

**Traceability:** Every artifact lives under a timestamped `run-*` directory — audit trail by design.

---

## Part 3 — The two Cursor Automations

Configured in **Cursor → Settings → Automations**. Paste procedure bodies from `automations/HOT_SIGNAL_ENGINE.md` and `automations/FRIDAY_NEWSLETTER.md`. See `automations/CURSOR_DASHBOARD_SETUP.md` and `automations/AUTOMATIONS_REGISTRY.md`. **Do not enable** until `CONTENT_ENGINE_PRODUCTION_VALIDATION.md` passes.

### A. Bi-hourly engine (`HOT_SIGNAL_ENGINE`)

| Setting | Value |
|---------|--------|
| **Name** | `BI-HOURLY CONTENT ENGINE` |
| **Schedule** | `0 */2 * * *` (every 2 hours; timezone per Cursor UI) |
| **Instructions** | Full body of `automations/HOT_SIGNAL_ENGINE.md` |

**Step order (agent)**

1. Read **Part 1** source-of-truth files (required set for this run).  
2. Run `./scripts/content-engine/prepare-run.sh bi-hourly` from repo root.  
3. If exit **≠ 0** → read `RUN_BLOCKERS.md` in the new folder → **stop** (no fabricated news).  
4. Ingest `newsletter/inputs/live/*` (exclude README, examples, `.gitkeep`).  
5. Apply **MESSAGE_SYSTEM** gate (truth, stakes, gap, mirror, values, customization).  
6. Apply **charter** (verified vs DEVELOPING, bias labels, no invented facts).  
7. Apply **voice + enforcement**; rewrite generic or corporate copy.  
8. Write `site-update.md`, `linkedin.txt`, `bluesky.txt`, `instagram.txt`, `facebook.txt`, `youtube-short.md` (or SKIP), `poster-prompt.md` (or SKIP), update `RUN_META.md`.  
9. Move consumed inputs to `processed/YYYY-MM-DD/` **or** document what was consumed in `RUN_META.md`.  
10. Append **delivery blockers** to `RUN_META.md` for any channel without credentials.

### B. Friday newsletter engine (`FRIDAY_NEWSLETTER`)

| Setting | Value |
|---------|--------|
| **Name** | `FRIDAY NEWSLETTER ENGINE` |
| **Schedule** | Weekly **Friday** **10:00 AM** (your timezone in Cursor) |
| **Instructions** | Full body of `automations/FRIDAY_NEWSLETTER.md` |

**Step order (agent)**

1. Read **Part 1** files + `CHANNEL_PLAYBOOK.md` + Friday templates.  
2. Run `./scripts/content-engine/prepare-run.sh friday`.  
3. Read all `newsletter/outputs/live/run-*` from the last **7 days** + any unprocessed `inputs/live`.  
4. Extract **3–5 patterns** that mattered (themes, not random headlines).  
5. If insufficient history → write `RUN_BLOCKERS.md` and stop.  
6. Draft `newsletter.md` in Jackye voice; `subject-lines.txt` (3); `preview-text.txt`; `promo-post.txt`; `site-version.md`.  
7. If personalization API unavailable → state in `RUN_META.md` (aggregate only).  
8. Record delivery blockers per channel.

---

## Part 4 — Scripts (`package.json`)

| Command | What it does | When |
|---------|----------------|------|
| `npm run content:prepare` | `prepare-run.sh bi-hourly` — creates `outputs/live/run-*`; **fails** if `inputs/live` empty | Before bi-hourly agent writes files (or let agent run it) |
| `npm run content:prepare:friday` | `prepare-run.sh friday` — creates `outputs/friday/run-*` | Before Friday agent |
| `npm run content:archive` | `archive-runs.sh` — deletes `run-*` older than **30 days** (`CONTENT_ENGINE_RETENTION_DAYS` overrides) | Weekly maintenance; use `DRY_RUN=1` first |

---

## Part 5 — Delivery credentials (what’s usually still missing)

These **five** unlock full hands-off delivery. Until present, the engine **still generates files** and lists blockers in `RUN_META.md`.

| # | Credential | Used for |
|---|----------------|----------|
| 1 | **Substack API key** (or session approach per Substack docs) + publication | Email / newsletter on Substack |
| 1b | **Beehiiv API key** + **publication ID** | Alternative to Substack |
| 2 | **LinkedIn OAuth** tokens (org posting) | Automated LinkedIn |
| 3 | **Bluesky app password** | AT Protocol posting |
| 4 | **Supabase service role** (optional) | Ingest `site-update.md` into DB / `work_news` / drafts table — **never commit** |
| 5 | **GitHub Actions** (optional) | Workflow reading `run-*` and calling APIs/webhooks |

**Until these exist:** runs still **write all files** under `newsletter/outputs/**`; you **manually paste** into Substack, LinkedIn, and Bluesky (~2 min each) while delivery is wired.

**Three delivery paths per channel** (pick one per maturity stage):

| Path | Site | Email | LinkedIn | Bluesky |
|------|------|-------|----------|---------|
| **A — Zapier / Make** | Webhook to CMS | Substack / Beehiiv module | Scheduled post module | Bluesky module |
| **B — GitHub Actions** | Commit + deploy, or POST webhook | `curl` Substack/Beehiiv API with secrets | API if token in secrets | `curl` ATProto |
| **C — Manual** | Paste `site-update.md` (~2 min) | Paste newsletter + subjects | Paste `linkedin.txt` | Paste `bluesky.txt` |

Detail: `newsletter/delivery/PUBLISHING.md`.

---

## Part 6 — How Jackye feeds it

### `signals.json` (structured)

Drop at `newsletter/inputs/live/signals.json`. See `signals.example.json`.

**Preferred shape** (array of stories — easy for Zapier to append):

```json
[
  {
    "headline": "your headline here",
    "source": "source name",
    "url": "direct link",
    "category": "daily_grind",
    "heat_level": "high",
    "notes": "anything Jackye wants to add"
  }
]
```

**Optional fields:** `geo_hint`, `audience_hint` (for mirror / customization).

**Legacy wrap** (still supported): `{ "generated_at": "…", "items": [ … ] }`.

**Example (labor signal):**

```json
[
  {
    "headline": "Texas reports uptick in continued unemployment claims in Dallas metro",
    "source": "State labor market publication",
    "url": "https://www.example-state-agency.gov/labor/releases/2026-04-03-claims",
    "category": "daily_grind",
    "heat_level": "high",
    "notes": "Charter: corroborate before verified; mirror DFW job seekers.",
    "geo_hint": "Dallas-Fort Worth, TX",
    "audience_hint": "job_seekers, hourly_workers"
  }
]
```

### `notes.md` (freeform)

Paste Slack threads, voice transcripts, “what I’m watching,” editorial intent. The agent treats this as **primary intent** alongside `signals.json`.

### Automating ingest (Zapier / Make)

| Source | Pattern |
|--------|---------|
| **Google Alerts** | Email trigger → Parser → Write row to Google Sheet **or** append to `notes.md` via GitHub “create file” / API |
| **RSS** | RSS trigger → Format → POST to webhook that appends JSON items to `signals.json` **or** drops a new file `feed-snapshot-2026-04-04.md` |
| **Slack** | Star message / emoji reaction → Zapier → same as above |
| **Email** | Forward-to-Zapier inbox → strip body → `notes.md` or `signals.json` |

**Recommendation:** Start with **daily Zapier → append `notes.md`** or **one JSON file per alert batch** to avoid merge conflicts on a single `signals.json` if multiple Zaps write concurrently.

---

## Part 7 — `poster-prompt.md` — what it contains + full example

**Purpose:** One file the human (or a future image pipeline) can paste into Midjourney / DALL-E / Firefly **without re-deriving** creative decisions.

**Sections inside `poster-prompt.md` (template)**

1. **Story ID / headline** (internal)  
2. **Message** (truth, stakes, gap — one line each)  
3. **Archetype** (which layout pattern: collage / interrogative / authority-subverted / triptych panel / Line B digital — per `VIRAL_POSTER_IMAGE_SPEC.md`)  
4. **Casting brief** — inclusive, dignified; punch up at systems  
5. **Background / palette** — hex if triptych or brand peach/magenta for Line B  
6. **Headline overlay** (exact words on image)  
7. **Full generator prompt** (single paste block)  
8. **Negative prompt** (what to ban)  
9. **Aspect ratio / platform** (e.g. 4:5 IG, 16:9 OG)

### Example output — Dallas unemployment / labor market signal (fictional URLs illustrative only)

```markdown
# Poster prompt — run-20260404T1600Z

## Message (MESSAGE > VOICE > DESIGN)
- **Truth:** Continued claims ticked up in the Dallas metro — the squeeze is measurable, not vibes.
- **Stakes:** People deciding whether to leave, stay, or take the next offer need receipts, not optimism theater.
- **Gap:** Local headlines bury the chart; national takes ignore your metro.

## Archetype
Authority-subverted + warm period palette (see VIRAL_POSTER_IMAGE_SPEC — Variant “Authority subverted”).

## Casting brief
- Diverse adults in work-adjacent setting (training room or job center lobby — dignified, not poverty porn).
- No real government seals or logos; generic “Labor Data” clipboard aesthetic.
- Expressions: focused, not mocked.

## Background / palette
- Flat warm cream field `#f4f1ea`, accent deep teal `#1a5f7a` for type bars (not a real agency brand).

## Headline overlay (exact)
**YOUR METRO. YOUR NUMBERS.**
Sub: *Continued claims moved — here’s who should care.*

## Full prompt (Midjourney-style — paste as one job)
1950s-1960s American consumer print advertising aesthetic, sincere cheerful art direction, professional illustrated poster, diverse job seekers and career coach in bright modern training room, clipboard with simple line chart trending slightly up, bold sans headline "YOUR METRO. YOUR NUMBERS." subhead in smaller serif, cream and teal palette, no cigarettes no alcohol no government logos no real trademarks, footer small text "Who Do I Work For" and "Jackye Clayton", high detail, print grain subtle, 4:5 aspect ratio --style raw --v 6

## Negative prompt
smoking, alcohol, poverty exploitation, real agency seals, corporate logos, watermarks, distorted hands, extra fingers, gore, slurs, mockery of workers

## Platform targets
- Primary export: **1080×1350** (IG / LinkedIn feed)
- Secondary: **1200×630** OG if cropped from master
```

---

## Part 8 — What to do right now (10 steps)

| Step | Action |
|------|--------|
| 1 | **Cursor → top menu → Settings → Automations → New Automation** |
| 2 | **Bi-hourly:** Name **`BI-HOURLY CONTENT ENGINE`**, schedule **`0 */2 * * *`**, paste full **`automations/HOT_SIGNAL_ENGINE.md`** into Instructions, **repo write**, optional browser/fetch MCP for `urls.txt` else **`signals.json` only** — **do not enable** until production validation passes |
| 3 | **Friday:** Name **`FRIDAY NEWSLETTER ENGINE`**, **weekly Friday 10:00 AM** your timezone, paste **`automations/FRIDAY_NEWSLETTER.md`**, same repo write — **do not enable** until production validation passes |
| 4 | Create **`newsletter/inputs/live/signals.json`** with at least one story (array format: `headline`, `source`, `url`, `category`, `heat_level`, `notes`) — see Part 6 |
| 5 | Wait for the next 2-hour tick **or** **manually trigger** the bi-hourly automation in the Cursor UI |
| 6 | Open **`newsletter/outputs/live/LATEST_RUN.txt`** — it points to the latest run folder |
| 7 | Inspect **`linkedin.txt`**, **`instagram.txt`**, **`facebook.txt`**, **`youtube-short.md`**, **`poster-prompt.md`**, **`site-update.md`**, **`bluesky.txt`**, **`RUN_META.md`** — voice + charter check |
| 8 | If good, you’re **live** on generation; **delivery** still needs credentials (below) |
| 9 | **Delivery:** add **Substack API** (or Beehiiv), **LinkedIn** tokens, **Bluesky** app password per **`newsletter/delivery/PUBLISHING.md`** — until then, **manual paste** (~2 min per channel) |
| 10 | Paste **`poster-prompt.md`** into **Midjourney** (or your image tool) for the first visual test |

**Duplicate detail:** [`automations/CURSOR_DASHBOARD_SETUP.md`](../automations/CURSOR_DASHBOARD_SETUP.md) (Steps 1–5 + verification).

---

## Part 9 — Blockers the automation must never guess around

Hard stops — **document and exit**; **no** filler content.

| Blocker | Behavior |
|---------|----------|
| **Empty `inputs/live/`** (bi-hourly) | `prepare-run.sh` exits 1; `RUN_BLOCKERS.md` only |
| **Missing source-of-truth file** | Stop; list missing path in `RUN_META.md` |
| **Missing delivery credentials** | Still write content files; list channels blocked in `RUN_META.md` |
| **No browser / fetch MCP** | Do not pretend URLs in `urls.txt` were read — ingest text must be self-contained or blocker |
| **No personalization API** | Friday: no fake “your top stories” — aggregate week + note in `RUN_META.md` |
| **Charter conflict** (e.g. verified claim without 4 outlets) | Label **DEVELOPING** or downgrade prominence — do not assert verified |
| **Weak message** (generic week) | Rewrite per MESSAGE_SYSTEM before any design |

**Rule:** The machine **blocks and documents**. It does **not** hallucinate news, stats, or personalization.

---

## Related links

- Short index: [`CONTENT_ENGINE.md`](CONTENT_ENGINE.md)  
- Dashboard setup: [`../automations/CURSOR_DASHBOARD_SETUP.md`](../automations/CURSOR_DASHBOARD_SETUP.md)  
- Automations index: [`../automations/README.md`](../automations/README.md)
