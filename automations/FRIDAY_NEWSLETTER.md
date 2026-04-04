# FRIDAY_NEWSLETTER

**Execution id:** `FRIDAY_NEWSLETTER`  
**Cursor automation display name:** **`FRIDAY NEWSLETTER ENGINE`**  
**Schedule:** Weekly **Friday morning** (e.g. **10:00 AM** in your timezone)  
**Output root:** `newsletter/outputs/friday/` (timestamped `run-*` folders)  
**Inputs:** Full **week** — all `newsletter/outputs/live/run-*` from the last **7 days** plus any unarchived `newsletter/inputs/live/`  
**Cursor UI path:** **Settings → Automations → New Automation**

**Do not enable this automation until** **`docs/CONTENT_ENGINE_PRODUCTION_VALIDATION.md`** checklist passes.

**Precedence:** **MESSAGE > VOICE > DESIGN**

**Production:** `docs/CONTENT_ENGINE_PRODUCTION_VALIDATION.md` — no placeholders; **`RUN_META.md`** with **`Generation status`**.

---

## Before you write anything

1. **Read:** `docs/MESSAGE_SYSTEM.md`, `newsletter/style/jackye-voice.md`, `newsletter/style/enforcement.md`, `newsletter/WDIWF_NEWS_CHARTER.md`, `newsletter/CHANNEL_PLAYBOOK.md`, `newsletter/template-friday-briefing-email.md`, `newsletter/template-substack-daily.md` (if needed), `docs/BUILD_BIBLE.md`

2. **Prepare output folder:**
   ```bash
   ./scripts/content-engine/prepare-run.sh friday
   ```

3. **Review the week:**
   - All **`newsletter/outputs/live/run-*/`** from the last 7 days (`site-update.md`, `linkedin.txt`, `RUN_META.md` — prefer **`Generation status: completed`** runs)
   - Any remaining **`newsletter/inputs/live/`** not archived
   - **3–5 patterns** that mattered (themes, not random headlines)

---

## Message gate

Open on **why this week was different** — not a generic welcome.

If insufficient history: **`RUN_BLOCKERS.md`** explaining gap; **`RUN_META.md`** → **`Generation status: skipped`**.

---

## Deliverables

Into `newsletter/outputs/friday/run-*/`:

| File | Content |
|------|---------|
| `newsletter.md` | Full body; source maps + bias; Jackye voice; DEVELOPING per charter |
| `subject-lines.txt` | **Exactly 3** subject lines (numbered) |
| `preview-text.txt` | Preheader + which subject # |
| `promo-post.txt` | LinkedIn / multi-platform promo |
| `site-version.md` | On-site version + WDIWF links |

**`RUN_META.md`:** **`Generation status`**, timestamp, **live runs consumed**, outputs list, delivery blockers, **patterns** chosen.

---

## Personalization

Without dashboard data (`get_personalized_news`, etc.): editorial week-in-review only; note in `RUN_META.md`: `Personalization: not connected`. Do not fake merge fields.

---

## Enforcement

No generic voice; no invented facts; **MESSAGE > VOICE > DESIGN**.

---

## Publishing

`newsletter/delivery/PUBLISHING.md`
