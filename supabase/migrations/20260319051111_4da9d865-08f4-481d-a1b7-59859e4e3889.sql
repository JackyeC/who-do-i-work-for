
UPDATE public.company_executives 
SET departed_at = '2025-03-01', verification_status = 'verified'
WHERE id = '63ac4147-b82b-4daf-baa3-a1679165debd';

INSERT INTO public.company_executives (company_id, name, title, verification_status)
SELECT id, 'Cathy Smith', 'Chief Financial Officer', 'verified'
FROM public.companies WHERE slug = 'starbucks';
