ALTER TABLE public.live_streams 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS embed_code TEXT;