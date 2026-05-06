import { useEffect } from "react";
import { useLiveStreams } from "@/hooks/useSiteData";
import { Radio, Eye, Users } from "lucide-react";
import { imgUrl } from "@/lib/image";
import CustomVideoPlayer from "@/components/CustomVideoPlayer";
import { useStreamStats } from "@/hooks/useStreamStats";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const formatCount = (n: number) => {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10000 ? 1 : 0)}K`;
  return `${(n / 1_000_000).toFixed(1)}M`;
};

const StreamCard = ({ stream }: { stream: any }) => {
  const { viewers } = useStreamStats(stream.id);
  const hasVideo = !!stream.video_url;
  const videoId = hasVideo ? null : (extractYouTubeId(stream.youtube_url || "") || extractIdFromEmbed(stream.embed_code || ""));
  const playerSrc = hasVideo
    ? stream.video_url
    : (videoId ? `https://www.youtube.com/watch?v=${videoId}` : "");
  const poster =
    (stream.thumbnail_url && imgUrl(stream.thumbnail_url, 1000)) ||
    (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : undefined);

  if (!hasVideo && !videoId) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black aspect-video">
        <CustomVideoPlayer
          src={playerSrc}
          type={hasVideo ? "video" : "youtube"}
          poster={poster}
          title={stream.title}
        />

        {/* LIVE NOW badge */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-background/95 backdrop-blur px-3 py-1.5 rounded-full shadow-lg pointer-events-none">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive"></span>
          </span>
          <span className="text-xs font-bold tracking-wider text-foreground">LIVE NOW</span>
        </div>

        {/* Watching now (real-time presence) */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-black/70 backdrop-blur px-2.5 py-1 rounded-full text-white pointer-events-none">
          <Users className="h-3.5 w-3.5" />
          <span className="text-xs font-semibold tabular-nums">{formatCount(viewers)} watching</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
        <h3 className="font-semibold text-base md:text-lg text-foreground flex items-center gap-2">
          <Radio className="h-4 w-4 text-destructive" />
          {stream.title}
        </h3>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Eye className="h-4 w-4" />
          <span className="tabular-nums font-medium">{formatCount(stream.total_views || 0)} views</span>
        </div>
      </div>
    </div>
  );
};

const extractYouTubeId = (url: string): string | null => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/live\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
};

const extractIdFromEmbed = (embed: string): string | null => {
  if (!embed) return null;
  const match = embed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
};

const LiveStreamBanner = () => {
  const { data: streams } = useLiveStreams();
  const queryClient = useQueryClient();
  const now = new Date();

  const activeStreams = (streams || []).filter((s: any) => {
    if (!s.is_published) return false;
    if (s.is_live) return true;
    if (s.scheduled_at && new Date(s.scheduled_at) <= now && (!s.ends_at || new Date(s.ends_at) >= now)) return true;
    return false;
  });

  useEffect(() => {
    if (activeStreams.length === 0) return;
    const channel = supabase
      .channel("live_streams_views")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "live_streams" }, () => {
        queryClient.invalidateQueries({ queryKey: ["live_streams"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeStreams.length, queryClient]);

  if (activeStreams.length === 0) return null;

  return (
    <section id="live-stream" className="bg-background py-4">
      <div className="container mx-auto px-4 space-y-6">
        {activeStreams.map((stream: any) => (
          <StreamCard key={stream.id} stream={stream} />
        ))}
      </div>
    </section>
  );
};

export default LiveStreamBanner;
