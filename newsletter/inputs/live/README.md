# Live inputs — bi-hourly content engine

Drop **new** material here before each run (or configure an ingest job that writes here).

## Accepted formats

| File | Purpose |
|------|---------|
| `signals.json` | **Preferred:** JSON **array** of stories: `[{ "headline", "source", "url", "category", "heat_level", "notes" }]`. **Also valid:** `{ "generated_at", "items": [ … ] }`. See `signals.example.json`. |
| `urls.txt` | One URL per line; agent fetches context only if MCP/browser available — otherwise treat as stubs and **block** or note in RUN_BLOCKERS |
| `notes.md` | Freeform editorial notes, Slack exports, voice memo transcripts |
| `feed-snapshot.md` | Paste from RSS reader or internal digest |

## Rules

- **Do not** commit secrets. Redact API keys if pasting logs.  
- After a run **consumes** an input, move processed files to `newsletter/inputs/live/processed/YYYY-MM-DD/` (create as needed) so the next run does not duplicate work — or delete if you prefer stateless ingest.

## Empty folder

If there is nothing to process, the prepare script writes **RUN_BLOCKERS.md** in the new output run folder and the agent must **not** invent news.

See `automations/HOT_SIGNAL_ENGINE.md` (**BI-HOURLY CONTENT ENGINE**).
