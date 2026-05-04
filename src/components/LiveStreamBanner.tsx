import { useLiveStreams } from "@/hooks/useSiteData";
import { Radio } from "lucide-react";
import { imgUrl } from "@/lib/image";
import CustomVideoPlayer from "@/components/CustomVideoPlayer";

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
  const now = new Date();

  const activeStreams = (streams || []).filter((s: any) => {
    if (!s.is_published) return false;
    if (s.is_live) return true;
    if (s.scheduled_at && new Date(s.scheduled_at) <= now && (!s.ends_at || new Date(s.ends_at) >= now)) return true;
    return false;
  });

  if (activeStreams.length === 0) return null;

  return (
    <section id="live-stream" className="bg-background py-4">
      <div className="container mx-auto px-4 space-y-6">
        {activeStreams.map((stream: any) => {
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
            <div key={stream.id} className="max-w-3xl mx-auto">
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
              </div>

              <div className="mt-3">
                <h3 className="font-semibold text-base md:text-lg text-foreground flex items-center gap-2">
                  <Radio className="h-4 w-4 text-destructive" />
                  {stream.title}
                </h3>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default LiveStreamBanner;
