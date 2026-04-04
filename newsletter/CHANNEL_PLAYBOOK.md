# WDIWF Channel Playbook — daily web, Substack, social, Friday email, LinkedIn

All distribution should **reinforce one brand graph**: **work & labor news → Jackye Clayton → WDIWF**. CTAs can rotate, but **every surface** should make it obvious who is accountable and where to go deeper.

**Primary URLs (keep consistent)**

| Role | URL |
|------|-----|
| Product / home | `https://wdiwf.jackyeclayton.com` |
| Jackye (hub) | `https://jackyeclayton.com` |
| LinkedIn | `https://www.linkedin.com/in/jackyeclayton/` |
| Substack | `{{SUBSTACK_URL}}` (set when live) |
| Speaking | `https://jackyeclayton.com/speaking` |

---

## Weekly rhythm

| Day | Website | Substack | Social (X, etc.) | LinkedIn “tickle” | Email |
|-----|---------|----------|------------------|-------------------|--------|
| Mon–Thu | **Update daily** with day’s briefing / news feed | **Newsletter edition** (Substack-native formatting) | **Burst** when the daily drops (see template) | **Short hook** + link to site or Substack | Optional transactional only |
| Friday | **Update** + reflect personalized signals | Optional digest post or free preview | **1–2 posts** teasing the Friday mail | **Tickle** aimed at professionals (see template) | **Hyper-personalized Friday mail**: top items from **user’s dashboard** + **Friday tips** |

---

## Monday–Thursday: daily pipeline

1. **Editorial:** Produce the day’s core story set per `WDIWF_NEWS_CHARTER.md` and **`docs/SIGNAL_CHECK_FRAMEWORK.md`** (**Signal Check™**: fixed section order, Cursor prompt §4, **decision impact** line; source map outside the block; no invented gaps or counts).  
2. **Website:** Publish/update the live briefing or news module (source of truth for links and timestamps).  
3. **Substack:** Ship the **newsletter-only** version (`template-substack-daily.md`) — can omit deep internal-only notes; keep Source map and DEVELOPING labels.  
4. **Social burst:** Generate from `template-social-daily-bundle.md` — same day as publish; every post points back to **WDIWF** and/or **Jackye** (see CTA rules below).  
5. **LinkedIn tickle:** Same news cycle, **shorter** — curiosity + authority; CTA to full piece on WDIWF or Substack (`template-linkedin-tickle.md`).

---

## Friday: email (hyper-personalized)

**Audience:** Logged-in users (or full list segment with dashboard data).

**Content blocks (order)**

1. **Opening:** “Your week in work & labor” + first name if available.  
2. **Top for you:** Pull **highest-ranked items** for this user from product logic (e.g. `get_personalized_news`, tracked companies, recent alerts). If the RPC returns nothing, fall back to **trending verified** stories from the charter — never an empty email.  
3. **Friday tips:** Actionable, short — comp prep, 1:1 prompts, compliance calendar reminders, union-news “what to watch,” etc. Tied to **their** industries or tracked employers when data exists.  
4. **Jackye forward:** One line on why this matters + link to **Jackye’s LinkedIn** or **latest WDIWF analysis**.  
5. **Footer:** Unsubscribe, address, link to **WDIWF**.

Use structure in `template-friday-briefing-email.md`.  
**Implementation note:** Wire this ESP to the same backend fields the dashboard uses (`personalized_news`, `tracked_companies`, `user_alerts`) so email and app stay aligned.

---

## CTA rules (“all roads lead to Jackye”)

- **Primary CTA:** Read on **WDIWF** (specific article or day’s briefing URL).  
- **Secondary:** Follow **Jackye on LinkedIn** for commentary; **Subscribe** on Substack.  
- **Tertiary:** **Speaking / press** on `jackyeclayton.com` when the story is about expertise or booking Jackye.  
- Avoid dead-end posts: **every** social asset has **one clear next click**.

---

## Substack vs site

| Substack | Site |
|----------|------|
| Subscriber growth, archive, shareable issue URLs | Product depth, dashboard, tools, personalization |
| Slightly more “letter from the desk” OK | Must carry Source map + DEVELOPING badges for news |

Do not **contradict** facts between channels; if one updates, sync the other or add “Updated” note.

---

## Optional context to plug in later

- Exact **ESP** (Resend, Beehiiv, Customer.io, etc.) for Friday sends.  
- **Substack URL** and whether paywalled analysis lives there vs WDIWF.  
- **Utm parameters** per channel (`utm_source=linkedin`, etc.) for attribution.
