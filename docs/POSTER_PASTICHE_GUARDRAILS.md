# Newsletter share poster — content guardrails

Retro **magazine/ad pastiche** for social sharing: typography, faux masthead, absurd corporate-speak, and palette from `poster_data`. It must stay **safe and clearly satirical**.

## Do

- Lean on **layout, color, and copy** for the vintage ad *vibe*.
- Label assets **“Satire / pastiche”** and **“Not an advertisement”** (UI and export).
- Keep **contrast** readable on cream/colored backgrounds.

## People and faces (when visuals include humans)

Assets should be **inclusive by default**, not an afterthought.

- **Rotate representation** across the library of posters/illustrations: vary **age**, **race and ethnicity**, **gender presentation**, and **disability** (including visible and assistive tech — e.g. wheelchair, cane, hearing tech) in a **fair, non-tokenizing** way. No single story type should always map to the same “default” face.
- Portray people with **dignity and agency** in normal professional or everyday contexts that fit work/labor satire — never as the punchline because of who they are.
- **Avoid stereotypes** (e.g. tying specific roles only to one group), “inspiration porn,” or exoticizing. **Lighting, styling, and composition** should be as flattering and even across subjects as you would want for any demographic.
- When generating or commissioning art: use **explicit casting notes** in prompts (e.g. “mid-career Black woman engineer,” “older Asian man in a union hall,” “young Latine person using a mobility aid in an office”) and **track** what you have shipped recently so the next asset **round-robins** representation.
- **Faces are allowed** and encouraged when they serve the piece; combine with the safety rules below (still no harmful vintage tropes, no minors in inappropriate contexts, no exploitation).

## Do not (imagery & claims)

- **No** smoking, vaping, or tobacco motifs.
- **No** pregnancy, minors, or vulnerable-group exploitation as a visual hook.
- **No** medical or health **claims** (including alcohol-as-health or miracle cures).
- **No** shock imagery or harmful vintage tropes recreated literally.

## AI / generation (if extended)

- Use explicit **negative prompts** aligned with the “Do not” list above.
- **People / faces:** Follow the **People and faces** section: inclusive casting, round-robin diversity, dignified portrayal. Add negative prompts for stereotypes, caricature by ethnicity or disability, and uneven “beauty lighting” by group.
- **Typographic-only** posters remain valid when you want zero human subjects for a given story; when you **do** include people, apply the inclusion rules instead of defaulting to one look.

## Data source

`receipts_enriched.poster_data` is produced by `supabase/functions/jackyefy-news` and should follow the same editorial contract as Jackye copy: facts first, satirical framing second.
