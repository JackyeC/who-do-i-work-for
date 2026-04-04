# Cursor Automations — dashboard setup (WDIWF)

Cursor schedules **cloud agents** from the product UI (not from a `cron` file in this repo). Follow these steps **in order**.

## Prerequisites

- [ ] Repo connected to Cursor (GitHub/GitLab) with Automations **enabled**.  
- [ ] **`docs/CONTENT_ENGINE_PRODUCTION_VALIDATION.md`** read and operator checklist passed (inputs, dedup, skip behavior, `RUN_META` status).  
- [ ] **Do not enable** automations until that checklist passes.  
- [ ] Branch policy: automation targets **`main`** or a dedicated branch — note it in the automation description.  
- [ ] **Never** put API keys inside `signals.json` or commits — use Cursor automation secrets when you wire delivery.

**Registry:** [`automations/AUTOMATIONS_REGISTRY.md`](AUTOMATIONS_REGISTRY.md) — names, schedules, procedure files, output paths.

---

## Step 1 — Open Automations

In **Cursor**: **top menu → Settings → Automations → New Automation**.

(If your Cursor build uses a slightly different path, use the in-app **Settings** search for **Automations**.)

---

## Step 2 — Create the bi-hourly automation (`HOT_SIGNAL_ENGINE`)

Fill in **exactly**:

| Field | Value |
|--------|--------|
| **Name** | `BI-HOURLY CONTENT ENGINE` |
| **Schedule** | `0 */2 * * *` (every 2 hours) |
| **Instructions** | Open `automations/HOT_SIGNAL_ENGINE.md` → copy the **entire** body → paste into the automation **Instructions** field |
| **Permissions** | Grant **repo write** access (or your preferred PR workflow if Cursor offers it) |
| **MCP tools** | Add any **browser / fetch** tool only if you want the agent to pull from `urls.txt`. If **not**, skip MCP and rely on **`signals.json`** (and `notes.md`) only |

**Do not enable** until **`docs/CONTENT_ENGINE_PRODUCTION_VALIDATION.md`** passes.

---

## Step 3 — Create the Friday automation (`FRIDAY_NEWSLETTER`)

Fill in **exactly**:

| Field | Value |
|--------|--------|
| **Name** | `FRIDAY NEWSLETTER ENGINE` |
| **Schedule** | **Weekly**, **Friday**, **10:00 AM** in **your timezone** |
| **Instructions** | Open `automations/FRIDAY_NEWSLETTER.md` → copy the **entire** body → paste |
| **Permissions** | Same **repo write** access as the bi-hourly job |

**Do not enable** until **`docs/CONTENT_ENGINE_PRODUCTION_VALIDATION.md`** passes.

---

## Step 4 — Feed it its first signal

Create in the repo:

`newsletter/inputs/live/signals.json`

Use **either** format:

**Preferred (array of stories):**

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

**Also valid (wrapped):**

```json
{
  "generated_at": "2026-04-04T12:00:00Z",
  "items": [
    {
      "headline": "…",
      "source": "…",
      "url": "…",
      "category": "regulation",
      "heat_level": "medium",
      "notes": "…"
    }
  ]
}
```

See `newsletter/inputs/live/signals.example.json`.

---

## Step 5 — Trigger a test run

- Either **wait** for the next 2-hour window, or **manually trigger** the bi-hourly automation in the Cursor UI.  
- Then open:

  **`newsletter/outputs/live/LATEST_RUN.txt`**

  That file contains the path to the latest **successful** `prepare-run` output folder. Open that folder and check **`linkedin.txt`**, **`poster-prompt.md`**, and **`site-update.md`**. If they read in Jackye’s voice and pass the charter, you’re **live** on the generation layer.

---

## What won’t publish yet (until credentials)

**Nothing auto-publishes** to Substack, LinkedIn, or Bluesky until you add the delivery layer (API keys, OAuth, app passwords, or Zapier/Make). The run should **still complete** and write **all output files** — you can **manually paste** them in the meantime.

**Where to wire delivery:** `newsletter/delivery/PUBLISHING.md` (Substack, Beehiiv, LinkedIn, Bluesky, site, Supabase, GitHub Actions).

---

## What Cursor may not support out of the box

- **Every 2 hours** depends on your Cursor plan’s scheduling options; if only hourly/daily, pick the closest and note it in `RUN_META.md`.  
- **No** native “post to Substack” without your API key + a small script or Zapier.

---

## Verification checklist

- [ ] `LATEST_RUN.txt` points to a `run-*` folder with the expected files.  
- [ ] Empty `inputs/live/` produced **only** `RUN_BLOCKERS.md` (no fake news).  
- [ ] Friday automation read prior `outputs/live/run-*` folders.
