# Friday outputs — weekly newsletter run

Each Friday automation writes a **timestamped folder**:

```
run-20260404T1600Z/
  newsletter.md
  subject-lines.txt
  preview-text.txt
  promo-post.txt
  site-version.md
  RUN_META.md
```

## Inputs

The Friday agent reads:

- This week’s `newsletter/outputs/live/run-*/` (site-update, socials, meta)  
- `newsletter/inputs/live/` (anything not yet archived)  
- Source-of-truth docs listed in `automations/FRIDAY_NEWSLETTER.md` (**FRIDAY NEWSLETTER ENGINE**)

## Handoff

Same delivery doc: `newsletter/delivery/PUBLISHING.md`.
