
ALTER TABLE public.site_settings
ADD COLUMN primary_analysis_year text DEFAULT '2025-26',
ADD COLUMN primary_programmes_year text DEFAULT '2025-26';
