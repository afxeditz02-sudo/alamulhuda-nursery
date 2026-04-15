import { useLiveStreams } from "@/hooks/useSiteData";
import { Radio } from "lucide-react";

const extractYouTubeId = (url: string): string | null => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/live\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
};

const LiveStreamBanner = () => {
  const { data: streams } = useLiveStreams();
  const now = new Date();

  const activeStreams = (streams || []).filter((s) => {
    if (!s.is_published) return false;
    if (!s.is_live) {
      // Check if scheduled and within time window
      if (s.scheduled_at && new Date(s.scheduled_at) <= now) {
        if (!s.ends_at || new Date(s.ends_at) >= now) return true;
      }
      return false;
    }
    return true;
  });

  if (activeStreams.length === 0) return null;

  return (
    <div id="live-stream" className="bg-destructive text-destructive-foreground">
      {activeStreams.map((stream) => {
        const videoId = extractYouTubeId(stream.youtube_url);
        return (
          <div key={stream.id} className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <Radio className="h-4 w-4 animate-pulse" />
              <span className="font-bold text-sm uppercase">Live Now</span>
              <span className="text-sm font-medium">— {stream.title}</span>
            </div>
            {videoId && (
              <div className="aspect-video w-full max-w-3xl mx-auto rounded-lg overflow-hidden shadow-lg">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LiveStreamBanner;
