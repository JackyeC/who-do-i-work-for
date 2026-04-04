# HOT_SIGNAL_ENGINE

**Execution id:** `HOT_SIGNAL_ENGINE`  
**Cursor automation display name:** **`BI-HOURLY CONTENT ENGINE`**  
**Schedule:** `0 */2 * * *` (every 2 hours)  
**Output root:** `newsletter/outputs/live/` (timestamped `run-*` folders)  
**Cursor UI path:** **Settings → Automations → New Automation**

**Do not enable this automation until** **`docs/CONTENT_ENGINE_PRODUCTION_VALIDATION.md`** checklist passes.

**Production gate:** Same doc + **`MESSAGE > VOICE > DESIGN`** — skipping beats weak output.

---

## Phase 0 — Source-of-truth reads (before any generation)

1. `docs/CONTENT_ENGINE_PRODUCTION_VALIDATION.md`  
2. `docs/MESSAGE_SYSTEM.md`  
3. `newsletter/style/jackye-voice.md`  
4. `newsletter/style/enforcement.md`  
5. `newsletter/WDIWF_NEWS_CHARTER.md`  
6. `docs/SIGNAL_CHECK_FRAMEWORK.md`  
7. `docs/BUILD_BIBLE.md`  
8. `docs/visual-references/README.md` + **`anchor-01.png`…`anchor-09.png`** (posters only)  
9. `docs/VIRAL_POSTER_IMAGE_SPEC.md` (posters / `poster-prompt.md` only)

---

## 1. Input source (must be defined)

| Item | Contract |
|------|----------|
| **Path** | `newsletter/inputs/live/` |
| **Formats** | `signals.json` (array **or** `{ "items": [] }`), `notes.md`, `urls.txt`, `feed-snapshot.md` |
| **Appearance** | Manual, Zapier, webhook, or API — **document in RUN_META** under “Ingest method” |

**Run prepare:**

```bash
./scripts/content-engine/prepare-run.sh bi-hourly
```

- If **exit non-zero** / **`RUN_BLOCKERS.md`** present: stop. Output **`No new signals. Skipping run.`** Do not generate content.

---

## 2. Deduplication (active)

Before writing channel files:

- Open the last **3** `newsletter/outputs/live/run-*/` folders (newest first). Read **`RUN_META.md`** and **`site-update.md`** (or `linkedin.txt` hook).  
- Compare **URLs** and **headlines** to current signal(s).  
- Same story, **no new information** → **`Run skipped — no new angle (duplicate)`** in **`RUN_META.md`**; do not emit duplicate angles.  
- **New** facts → ok; state what’s new under **Dedup** in `RUN_META.md`.

---

## 3. Signal quality filter

Proceed only if: **real** signal; **meaning** beyond headline reword; passes **MESSAGE_SYSTEM** (truth, stakes, gap, mirror, values).

If **weak:** **`## Generation status: skipped`** + **`Run skipped — no strong signals`**. Do **not** write `linkedin.txt`, `bluesky.txt`, `site-update.md`.

---

## 4. Output completeness

### Required when `completed`

| File | Required |
|------|----------|
| `linkedin.txt` | Yes |
| `bluesky.txt` | Yes |
| `site-update.md` | Yes |

### Optional

| File | Rule |
|------|------|
| `poster-prompt.md` | Else: `SKIP — no poster this run.` |
| `youtube-short.md` | Else: `SKIP — not a Shorts story this run.` |

### Full channel pack (when `completed`)

| File | Required |
|------|----------|
| `instagram.txt` | Yes |
| `facebook.txt` | Yes |

Cannot meet bar → **skip entire run** (§3).

---

## 5. Voice + message enforcement

Apply **jackye-voice**, **enforcement**, **MESSAGE_SYSTEM**. For any news-style item in **`site-update.md`** (or cross-channel copy), apply **`WDIWF_NEWS_CHARTER.md`** + **`docs/SIGNAL_CHECK_FRAMEWORK.md`**: for flagship stories, use the **§4 Cursor prompt** verbatim for the **Signal Check™** block (no links inside it; **decision impact** line required); cluster same-story coverage in the source map; no invented counts or gaps. Reject generic / corporate / vague — rewrite or skip.

---

## 6. Failure / empty states

| Condition | Log |
|-----------|-----|
| No inputs | **`No new signals. Skipping run.`** (prepare script) |
| Duplicate / weak / incomplete | **`Run skipped — no strong signals`** or duplicate note |

**Skipped runs:** only **`RUN_META.md`** (+ blockers if any) — no publish-ready channel files.

---

## 7. Delivery handoff (publish-ready)

When **`Generation status: completed`:** no `{{placeholders}}`, TODO, or model meta; links real; Markdown valid.

---

## 8. Logging — `RUN_META.md`

Set **`Generation status`:** `completed` | `skipped`. Include: **Timestamp (UTC)**, **Inputs used**, **Outputs created**, **Dedup check**, **Delivery status** (see production validation doc).

---

## Message gate (internal)

**Truth** / **why it matters** / **what people are missing** — one sentence each. If any line fits any generic outlet, rewrite or skip.

---

## Ingest detail

**`signals.json`:** array of `{ headline, source, url, category, heat_level, notes, … }` **or** `{ items, generated_at }`. Without browser MCP, **`urls.txt` alone** → note blocker if unverified.

---

## Deliverables (`run-*` folder only when `completed`)

`site-update.md`, `linkedin.txt`, `bluesky.txt`, `instagram.txt`, `facebook.txt`, `poster-prompt.md` (or SKIP), `youtube-short.md` (or SKIP).

---

## After `completed` run

Archive inputs to `newsletter/inputs/live/processed/YYYY-MM-DD/` **or** log in `RUN_META.md`.

---

## Publishing

`newsletter/delivery/PUBLISHING.md`
