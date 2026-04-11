
ALTER TABLE public.programmes
ADD COLUMN media jsonb DEFAULT '[]'::jsonb,
ADD COLUMN scheduled_at timestamp with time zone DEFAULT null,
ADD COLUMN is_published boolean DEFAULT true;
