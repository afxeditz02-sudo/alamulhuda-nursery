
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS admission_button_link text,
  ADD COLUMN IF NOT EXISTS footer_description text;

UPDATE public.site_settings
SET footer_description = COALESCE(footer_description,
  concat_ws(E'\n',
    NULLIF(footer_managed_by, ''),
    NULLIF(footer_estd, ''),
    NULLIF(footer_reg, ''),
    NULLIF(footer_under, ''),
    NULLIF(footer_run_by, '')
  ))
WHERE footer_description IS NULL;

ALTER TABLE public.site_settings
  DROP COLUMN IF EXISTS footer_managed_by,
  DROP COLUMN IF EXISTS footer_estd,
  DROP COLUMN IF EXISTS footer_reg,
  DROP COLUMN IF EXISTS footer_under,
  DROP COLUMN IF EXISTS footer_run_by;
