# Cursor Automations — WDIWF registry

**Platform:** Cursor **Settings → Automations** (cloud agent + schedule). This file is the single map of **display names**, **execution ids**, **schedules**, **procedure files**, and **output paths**.

---

## Enablement rule (both automations)

**Do not enable** either automation until **`docs/CONTENT_ENGINE_PRODUCTION_VALIDATION.md`** checklist passes (inputs contract, dedup, skip behavior, `RUN_META.md` **`Generation status`**, no placeholders in publish-ready files).

---

## 1. BI-HOURLY CONTENT ENGINE

| Field | Value |
|--------|--------|
| **Cursor automation name** | `BI-HOURLY CONTENT ENGINE` |
| **Execution id** | `HOT_SIGNAL_ENGINE` |
| **Procedure file** | [`HOT_SIGNAL_ENGINE.md`](HOT_SIGNAL_ENGINE.md) |
| **Schedule** | `0 */2 * * *` (every 2 hours; timezone in Cursor) |
| **Output directory** | `newsletter/outputs/live/` (`run-*` folders) |
| **Validation** | Same as production doc + rules in `HOT_SIGNAL_ENGINE.md` |

**Instructions field:** paste the **entire** body of **`automations/HOT_SIGNAL_ENGINE.md`**.

---

## 2. FRIDAY NEWSLETTER ENGINE

| Field | Value |
|--------|--------|
| **Cursor automation name** | `FRIDAY NEWSLETTER ENGINE` |
| **Execution id** | `FRIDAY_NEWSLETTER` |
| **Procedure file** | [`FRIDAY_NEWSLETTER.md`](FRIDAY_NEWSLETTER.md) |
| **Schedule** | Weekly **Friday morning** (e.g. **10:00 AM** your timezone) |
| **Output directory** | `newsletter/outputs/friday/` (`run-*` folders) |
| **Inputs scope** | Full **week**: all `newsletter/outputs/live/run-*` from the last **7 days** plus any unarchived `newsletter/inputs/live/` |
| **Validation** | Same as production doc + rules in `FRIDAY_NEWSLETTER.md` |

**Instructions field:** paste the **entire** body of **`automations/FRIDAY_NEWSLETTER.md`**.

---

## Related

- Dashboard walkthrough: [`CURSOR_DASHBOARD_SETUP.md`](CURSOR_DASHBOARD_SETUP.md)
- Legacy pointer files (optional): [`bi-hourly-agent-instructions.md`](bi-hourly-agent-instructions.md), [`friday-agent-instructions.md`](friday-agent-instructions.md)
