ALTER TABLE public.live_streams ADD COLUMN IF NOT EXISTS total_views integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.increment_live_stream_views(_stream_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.live_streams
  SET total_views = total_views + 1
  WHERE id = _stream_id AND is_published = true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_live_stream_views(uuid) TO anon, authenticated;

ALTER PUBLICATION supabase_realtime ADD TABLE public.live_streams;
ALTER TABLE public.live_streams REPLICA IDENTITY FULL;