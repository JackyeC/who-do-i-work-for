-- Optional per-row transparency: desk override, multi-source map, DEVELOPING label
ALTER TABLE public.work_news
  ADD COLUMN IF NOT EXISTS source_bias_override text,
  ADD COLUMN IF NOT EXISTS source_map_json jsonb,
  ADD COLUMN IF NOT EXISTS developing_label text;

COMMENT ON COLUMN public.work_news.source_bias_override IS
  'Charter bias label override for this row (Left, Lean Left, Center, Lean Right, Right).';

COMMENT ON COLUMN public.work_news.source_map_json IS
  'Optional array of { name, url?, bias } for multi-outlet context on the wire.';

COMMENT ON COLUMN public.work_news.developing_label IS
  'e.g. DEVELOPING + independent source count per news charter.';
