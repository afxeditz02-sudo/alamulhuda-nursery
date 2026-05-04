-- Add video upload support to live_streams
ALTER TABLE public.live_streams
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS media_type TEXT NOT NULL DEFAULT 'youtube';

-- Allow large video uploads in site-images bucket (set to 5GB)
UPDATE storage.buckets
SET file_size_limit = 5368709120,
    allowed_mime_types = NULL
WHERE id = 'site-images';