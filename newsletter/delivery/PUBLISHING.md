# Publishing & delivery — content engine handoff

Generated artifacts are **stable files** under `newsletter/outputs/`. This doc lists **connectors** to go from files → live channels.

## Outputs → channels

| Channel | Source file(s) | Typical integration |
|---------|----------------|---------------------|
| **Site** | `site-update.md`, Friday `site-version.md` | **Primary (Phase 1):** POST to Edge **`publish-desk-publication`** (sets `publish_status`, enforces `published_to_site` contract). **`/newsletter`** uses RPC **`wdiwf_latest_live_desk_publication()`**. Ops: **`desk-publication-health`** (same Bearer secret) → last N runs + `newest_live`. See **`docs/CONTENT_ENGINE_LIVE_DELIVERY.md`**, **`scripts/content-engine/publish-desk-publication.example.sh`**. |
| **Email / newsletter** | Friday `newsletter.md`, `subject-lines.txt`, `preview-text.txt` | **Substack** (API / publishing workflow per Substack docs), **Beehiiv** REST API, **Resend** + React email, **Customer.io**, **Buttondown**, Zapier “upload draft” |
| **LinkedIn** | `linkedin.txt`, `promo-post.txt` | **Zapier/Make** (scheduled post), **LinkedIn API** (org UGC — needs OAuth), **MCP** if your Cursor stack exposes a poster tool (manual copy fallback) |
| **Bluesky** | `bluesky.txt` | **AT Protocol** (session app password), Zapier, manual |
| **X** | extend bi-hourly outputs if needed | API v2 (paid tier), Zapier, manual |
| **Instagram** | `instagram.txt` (+ creative from `poster-prompt.md` if you shoot/design a Reel) | **Manual** paste in app; **Meta Graph API** (Instagram Business + Facebook Page linked); **Zapier/Make** (Meta modules); schedulers (Buffer, Later — check Meta approval) |
| **Facebook Page** | `facebook.txt` | Same Meta ecosystem: **Graph API** `/{page-id}/feed`, Composer manual, or Zapier |
| **YouTube Shorts** | `youtube-short.md` | **Manual:** film/edit in CapCut / Descript / phone — follow beat sheet. **YouTube Data API v3** `videos.insert` with `short` category (needs OAuth + quota). No auto-render in repo |
| **Image / poster** | `poster-prompt.md` | Human runs Midjourney/DALL-E → upload; reuse still for IG carousel / FB / Shorts cover |

---

## Meta (Instagram + Facebook) — what you need

| Item | Why |
|------|-----|
| **Meta Business Portfolio** | Owns Page + IG professional account |
| **Facebook Page** | Required to use Instagram Graph API for posting |
| **Instagram Business or Creator** | Connected to the Page |
| **System User or User token** with `instagram_basic`, `instagram_content_publish`, `pages_manage_posts`, `pages_read_engagement` (exact scopes drift — check [Meta docs](https://developers.facebook.com/docs/instagram-api)) | Programmatic post (Reels have extra requirements vs feed photo) |
| **App in developers.facebook.com** | Live mode + app review for some permissions |

**Reality check:** Auto-posting **Reels** via API is stricter than single-image feed posts. Many teams use **manual paste** of `instagram.txt` + upload video until automation is worth the Meta app review.

---

## YouTube Shorts — what you need

| Item | Why |
|------|-----|
| **Google Cloud project + YouTube Data API v3** | Uploads, metadata |
| **OAuth consent** for the channel owner | `videos.insert` |
| **Quota** | Default daily quota; uploads cost units |
| **Or: manual** | Copy `youtube-short.md` into teleprompter / bullet list; export 9:16 ≤60s; paste title/description in Studio |

The repo **generates the plan** (hook, beats, CTA). It does **not** render video files.

---

## Credentials & secrets (inventory)

| Item | Needed for | Where to store |
|------|------------|----------------|
| **Substack API / auth** | Publish or draft posts on Substack | Cursor automation secrets + CI env (follow current Substack developer docs) |
| **Beehiiv API key** | Alternative: create/send drafts or posts | Cursor automation secrets + CI env |
| **Beehiiv publication ID** | API paths | Env var `BEEHIIV_PUBLICATION_ID` |
| **Resend / SendGrid API** | Transactional Friday mail | Env |
| **Supabase service role** | Optional: push `site-update` into `work_news` or a `content_drafts` table | **Never** in repo; Vercel/Supabase secrets only |
| **LinkedIn OAuth** | Automated LinkedIn posts | App in LinkedIn Developer Portal; refresh token in secrets |
| **Bluesky app password** | Bluesky bot | App password per account |
| **CMS webhook URL + HMAC secret** | Generic “new content” POST | Your CMS docs |
| **Zapier/Make webhook** | Catch-all “new run” trigger | Zapier webhook URL |
| **Meta app + long-lived token** | IG + FB programmatic post | Meta Developer + Business settings |
| **YouTube OAuth client + refresh token** | Shorts upload via API | Google Cloud Console |

**Missing any of the above** → automation should write **blockers** in `RUN_META.md` and skip that channel.

**Practical default:** Ship **files** every run (`instagram.txt`, `facebook.txt`, `youtube-short.md`) → **paste or schedule manually** until Meta/YouTube automation is configured.

---

## Suggested CI pattern (optional)

1. **Trigger:** Push to branch `content-outputs` or `workflow_dispatch`.  
2. **Step:** Detect newest `newsletter/outputs/live/run-*` / Friday run.  
3. **Step:** Call Beehiiv + Bluesky + CMS webhooks with file contents.  
4. **Step:** Open GitHub issue on failure (delivery log).

This repo does **not** ship those workflows until you add `.github/workflows/content-delivery.yml` and secrets.

---

## MCP

- **Browser MCP:** useful only if automations can drive browser (often not in cloud sandbox). Prefer **structured inputs** in `inputs/live/`.  
- **Custom webhook MCP:** if you add one, document URL + payload schema here.

---

## Single system

**Generation** (Cursor Automation → files) and **delivery** (CI/webhook/API) are one pipeline: file paths are the **contract** between them.
