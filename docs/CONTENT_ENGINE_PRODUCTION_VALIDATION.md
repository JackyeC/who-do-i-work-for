# WDIWF Content Engine — production validation (pre-automation)

**Status:** Gate before enabling Cursor Automations. This is a **production** content engine, not a demo.

**Do not enable** **BI-HOURLY CONTENT ENGINE** or **FRIDAY NEWSLETTER ENGINE** in Cursor until every item in **§ Operator checklist** is satisfied.

**Final rule:** **MESSAGE > VOICE > DESIGN** — if content is not strong, **do not publish**. **Skipping is better than weak output.**

---

## 1. Input source is defined

| Item | Production contract |
|------|---------------------|
| **Folder path** | `newsletter/inputs/live/` |
| **Formats** | `signals.json` (array of stories **or** `{ "items": [] }`), `notes.md`, `urls.txt`, `feed-snapshot.md` |
| **How files appear** | Document **your** lane: manual drop, Zapier → commit, webhook → write file, internal API, etc. |

**If no new inputs exist:** **do not** generate content. Script/agent must surface:

**`No new signals. Skipping run.`**

(`prepare-run.sh` writes `RUN_BLOCKERS.md` and exits non-zero when the folder has no ingestible files.)

---

## 2. Deduplication is active

Before generating:

- Read **`newsletter/outputs/live/run-*/`** — at minimum the last **3** runs’ `site-update.md`, `RUN_META.md`, and primary URLs/headlines from inputs logged there.  
- **Do not** repeat the same **story** or **angle** unless **new information** exists (follow-up, correction, new outlet).  
- If duplicate only: **skip** or **reframe** with a genuinely new angle; if you cannot, **skip**.

---

## 3. Signal quality filter

Do not generate for weak inputs. Proceed only if:

- There is a **real** signal (specific event, filing, shift, not “work is changing”).  
- It has meaning **beyond** surface-level news (stakes for workers/leaders — per **MESSAGE_SYSTEM.md**).  
- It passes the **message gate** (truth / why it matters / what people are missing — not generic).

If weak: **skip** — do not pad.

---

## 4. Output completeness

### Minimum required (every **completed** run)

| File | Required |
|------|----------|
| `linkedin.txt` | Yes |
| `bluesky.txt` | Yes |
| `site-update.md` | Yes |

### Optional (only when justified)

| File | Rule |
|------|------|
| `poster-prompt.md` | Only if story earns a poster; else `SKIP — no poster this run.` |
| `youtube-short.md` | Only if story fits Shorts; else `SKIP — not a Shorts story this run.` |

### Full channel pack (this repo)

When the run **completes**, also emit **`instagram.txt`** and **`facebook.txt`** at production quality. If you cannot meet **required** three **plus** voice bar, **skip the entire run** (see §6).

---

## 5. Voice + message enforcement

Before saving outputs:

- Apply **`newsletter/style/jackye-voice.md`**  
- Apply **`newsletter/style/enforcement.md`**  
- Apply **`docs/MESSAGE_SYSTEM.md`**  
- For news copy: **`newsletter/WDIWF_NEWS_CHARTER.md`** + **`docs/SIGNAL_CHECK_FRAMEWORK.md`** (**Signal Check™**: §4 prompt for flagship items; **decision impact** line; source map outside block; real counts only; no fabricated gaps)

**Reject and rewrite** until pass:

- Generic summaries  
- Corporate tone  
- Vague insights  
- Polished emptiness  

---

## 6. Failure / empty state handling

If **any** of:

- No new inputs  
- No strong signals  
- Duplicate-only / no new angle  
- Cannot produce strong required outputs  

Then:

- **Do not** ship publish-ready channel files with filler.  
- Log clearly:

**`Run skipped — no strong signals`**

(or **`No new signals. Skipping run.`** when inputs are empty).

**Skipped run folder:** Write / update **`RUN_META.md`** with `## Generation status: skipped`, reason, timestamp, inputs considered. **Do not** write `linkedin.txt`, `bluesky.txt`, or `site-update.md` for that run (or delete them if started by mistake). Optional: keep `RUN_BLOCKERS.md` if blocked before agent work.

**Note:** `LATEST_RUN.txt` may still point at the folder created by `prepare-run.sh`; operators must read **`RUN_META.md` → Generation status** before publishing.

---

## 7. Delivery handoff ready

When status is **`completed`**:

- Files are **clean** and **publish-ready**  
- **No** `{{placeholders}}`**,** no `TODO`**,** no meta commentary** (“as an AI…”)  
- **No** broken Markdown / obvious formatting errors  

Outputs must be usable **without editing** for a normal post (links and UTMs real).

---

## 8. Logging (every run)

Each run’s **`RUN_META.md`** must include:

| Field | Content |
|-------|---------|
| **Timestamp** | UTC ISO from run |
| **Inputs used** | Paths + short summary (e.g. URLs/headlines ingested) |
| **Outputs created** | List of filenames **or** “none — skipped” |
| **Generation status** | `completed` \| `skipped` |
| **Dedup check** | What prior runs were compared; duplicate? Y/N |
| **Delivery status** | Checklist / blockers for site, social, email |

---

## Operator checklist (before turning on automation)

- [ ] Input path + ingest method documented (who drops files / what webhook).  
- [ ] Tested **empty** `inputs/live/` → **no** fabricated posts; blocker file present.  
- [ ] Tested **duplicate** signal → skip or new angle, not rewrite.  
- [ ] Tested **weak** signal → skip with log line.  
- [ ] Tested **happy path** → three required files + voice pass + no placeholders.  
- [ ] Team knows to read **`RUN_META.md`** before copy-paste publishing.

Only after all boxes are checked: enable **BI-HOURLY CONTENT ENGINE** (`HOT_SIGNAL_ENGINE`) and **FRIDAY NEWSLETTER ENGINE** (`FRIDAY_NEWSLETTER`) per [`automations/AUTOMATIONS_REGISTRY.md`](../automations/AUTOMATIONS_REGISTRY.md).

---

## Related

- Bi-hourly procedure: `automations/HOT_SIGNAL_ENGINE.md` (`HOT_SIGNAL_ENGINE`)  
- Friday procedure: `automations/FRIDAY_NEWSLETTER.md` (`FRIDAY_NEWSLETTER`)  
- Registry: `automations/AUTOMATIONS_REGISTRY.md`  
- Full layer doc: `docs/WDIWF_CONTENT_ENGINE_AUTOMATION_LAYER.md`  
- Prepare script: `scripts/content-engine/prepare-run.sh`
