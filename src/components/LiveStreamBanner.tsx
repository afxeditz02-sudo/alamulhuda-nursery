import { useState } from "react";
import { useLiveStreams } from "@/hooks/useSiteData";
import { Radio, Play, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { imgUrl } from "@/lib/image";

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
  const [playing, setPlaying] = useState<Record<string, boolean>>({});
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
          const videoId = extractYouTubeId(stream.youtube_url) || extractIdFromEmbed(stream.embed_code || "");
          const isPlaying = playing[stream.id];
          const watchUrl = stream.youtube_url || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : "#");

          return (
            <div key={stream.id} className="max-w-3xl mx-auto">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black aspect-video">
                {isPlaying && videoId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <>
                    {stream.thumbnail_url ? (
                      <img
                        src={imgUrl(stream.thumbnail_url, 1000)}
                        alt={stream.title}
                        className="w-full h-full object-cover"
                        loading="eager"
                        fetchPriority="high"
                        decoding="async"
                      />
                    ) : videoId ? (
                      <img
                        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                        alt={stream.title}
                        className="w-full h-full object-cover"
                        loading="eager"
                        fetchPriority="high"
                        decoding="async"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted" />
                    )}

                    {/* LIVE NOW badge */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-background/95 backdrop-blur px-3 py-1.5 rounded-full shadow-lg">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive"></span>
                      </span>
                      <span className="text-xs font-bold tracking-wider text-foreground">LIVE NOW</span>
                    </div>

                    {/* Play overlay */}
                    {videoId && (
                      <button
                        onClick={() => setPlaying((p) => ({ ...p, [stream.id]: true }))}
                        className="absolute inset-0 flex items-center justify-center group bg-black/20 hover:bg-black/30 transition"
                        aria-label="Play live stream"
                      >
                        <div className="h-16 w-16 rounded-full bg-destructive/90 group-hover:scale-110 transition flex items-center justify-center shadow-2xl">
                          <Play className="h-7 w-7 text-destructive-foreground fill-current ml-1" />
                        </div>
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Title + watch on YouTube */}
              <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
                <h3 className="font-semibold text-base md:text-lg text-foreground flex items-center gap-2">
                  <Radio className="h-4 w-4 text-destructive" />
                  {stream.title}
                </h3>
                <Button asChild variant="destructive" size="sm" className="gap-2">
                  <a href={watchUrl} target="_blank" rel="noopener noreferrer">
                    <Youtube className="h-4 w-4" />
                    Watch on YouTube
                  </a>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default LiveStreamBanner;
