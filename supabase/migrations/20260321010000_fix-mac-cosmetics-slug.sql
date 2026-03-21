-- Fix slug typo: mac-costmetics → mac-cosmetics
-- Run in Supabase SQL Editor as a standalone migration.
-- NOTE: If external links reference the old slug, consider adding a redirect
-- in your routing layer (e.g. React Router redirect from /dossier/mac-costmetics).

UPDATE public.companies
SET slug = 'mac-cosmetics',
    updated_at = now()
WHERE slug = 'mac-costmetics';
