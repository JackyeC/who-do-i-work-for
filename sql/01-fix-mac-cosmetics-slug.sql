-- Fix slug typo: mac-costmetics → mac-cosmetics
-- Run in Supabase SQL Editor
-- Note: If any external links use the old slug, consider adding a redirect or alias.

UPDATE public.companies
SET slug = 'mac-cosmetics',
    updated_at = now()
WHERE slug = 'mac-costmetics';
