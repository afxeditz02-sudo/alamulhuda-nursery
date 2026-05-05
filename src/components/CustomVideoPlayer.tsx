import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize2, Loader2 } from "lucide-react";

interface CustomVideoPlayerProps {
  src: string;
  type: "video" | "youtube";
  poster?: string;
  title?: string;
  autoPlay?: boolean;
}

const fmt = (s: number) => {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, "0")}`;
};

const extractYouTubeId = (url: string): string | null => {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/live\/|youtube\.com\/embed\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
};

const CustomVideoPlayer = ({ src, type, poster, title, autoPlay = false }: CustomVideoPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const ytPlayerRef = useRef<any>(null);

  const [started, setStarted] = useState(autoPlay);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffering, setBuffering] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef<number | null>(null);

  const youtubeId = type === "youtube" ? extractYouTubeId(src) : null;

  // ===== YouTube IFrame API setup =====
  useEffect(() => {
    if (type !== "youtube" || !started || !youtubeId) return;

    const loadAPI = () =>
      new Promise<void>((resolve) => {
        if ((window as any).YT && (window as any).YT.Player) return resolve();
        const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
        if (!existing) {
          const tag = document.createElement("script");
          tag.src = "https://www.youtube.com/iframe_api";
          document.body.appendChild(tag);
        }
        const prev = (window as any).onYouTubeIframeAPIReady;
        (window as any).onYouTubeIframeAPIReady = () => {
          prev?.();
          resolve();
        };
        // Poll fallback in case callback already fired
        const i = setInterval(() => {
          if ((window as any).YT && (window as any).YT.Player) {
            clearInterval(i);
            resolve();
          }
        }, 100);
      });

    let interval: number | null = null;
    let cancelled = false;

    loadAPI().then(() => {
      if (cancelled || !iframeRef.current) return;
      ytPlayerRef.current = new (window as any).YT.Player(iframeRef.current, {
        events: {
          onReady: (e: any) => {
            setDuration(e.target.getDuration() || 0);
            e.target.playVideo();
            setPlaying(true);
          },
          onStateChange: (e: any) => {
            const YT = (window as any).YT;
            if (e.data === YT.PlayerState.PLAYING) { setPlaying(true); setBuffering(false); }
            else if (e.data === YT.PlayerState.PAUSED) setPlaying(false);
            else if (e.data === YT.PlayerState.BUFFERING) setBuffering(true);
            else if (e.data === YT.PlayerState.ENDED) setPlaying(false);
          },
        },
      });

      interval = window.setInterval(() => {
        const p = ytPlayerRef.current;
        if (p && p.getCurrentTime) {
          setCurrent(p.getCurrentTime() || 0);
          if (!duration) setDuration(p.getDuration() || 0);
        }
      }, 500);
    });

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
      try { ytPlayerRef.current?.destroy(); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, youtubeId, type]);

  // ===== HTML5 video listeners =====
  useEffect(() => {
    if (type !== "video") return;
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => setCurrent(v.currentTime);
    const onMeta = () => setDuration(v.duration || 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onWait = () => setBuffering(true);
    const onPlaying = () => setBuffering(false);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("waiting", onWait);
    v.addEventListener("playing", onPlaying);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("waiting", onWait);
      v.removeEventListener("playing", onPlaying);
    };
  }, [type, started]);

  const togglePlay = useCallback(() => {
    if (!started) { setStarted(true); return; }
    if (type === "video") {
      const v = videoRef.current; if (!v) return;
      if (v.paused) v.play(); else v.pause();
    } else {
      const p = ytPlayerRef.current; if (!p) return;
      if (playing) p.pauseVideo(); else p.playVideo();
    }
  }, [started, type, playing]);

  const toggleMute = useCallback(() => {
    if (type === "video") {
      const v = videoRef.current; if (!v) return;
      v.muted = !v.muted; setMuted(v.muted);
    } else {
      const p = ytPlayerRef.current; if (!p) return;
      if (p.isMuted()) { p.unMute(); setMuted(false); } else { p.mute(); setMuted(true); }
    }
  }, [type]);

  const seek = useCallback((t: number) => {
    if (type === "video") {
      const v = videoRef.current; if (!v) return;
      v.currentTime = t; setCurrent(t);
    } else {
      const p = ytPlayerRef.current; if (!p) return;
      p.seekTo(t, true); setCurrent(t);
    }
  }, [type]);

  const goFullscreen = () => {
    const el = containerRef.current; if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  };

  const showAndAutoHide = () => {
    setShowControls(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (playing) setShowControls(false);
    }, 2500);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black group"
      onMouseMove={showAndAutoHide}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      {/* Media */}
      {!started ? (
        <button
          onClick={() => setStarted(true)}
          className="absolute inset-0 w-full h-full flex items-center justify-center bg-black"
          aria-label={`Play ${title || "video"}`}
        >
          {poster && <img src={poster} alt={title || ""} className="absolute inset-0 w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative h-20 w-20 rounded-full bg-primary/95 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
            <Play className="h-9 w-9 text-primary-foreground fill-current ml-1" />
          </div>
        </button>
      ) : type === "video" ? (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay
          playsInline
          className="w-full h-full object-contain bg-black"
          onClick={togglePlay}
          controlsList="nodownload"
        />
      ) : (
        youtubeId && (
          <iframe
            ref={iframeRef}
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`}
            className="w-full h-full"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen={false}
            title={title || "Live stream"}
          />
        )
      )}

      {/* Buffer indicator */}
      {started && buffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Loader2 className="h-10 w-10 text-white animate-spin" />
        </div>
      )}

      {/* Overlays to hide YouTube branding (title bar top, logo bottom-right, watermark) */}
      {started && type === "youtube" && (
        <>
          {/* Top bar covering title + share */}
          <div
            className="absolute top-0 left-0 right-0 h-16 bg-transparent cursor-pointer"
            onClick={togglePlay}
          />
          {/* Bottom-right YouTube logo cover */}
          <div
            className="absolute bottom-0 right-0 h-12 w-28 bg-black cursor-pointer"
            onClick={togglePlay}
          />
          {/* Center click area */}
          <div
            className="absolute top-16 left-0 right-0 bottom-12 bg-transparent cursor-pointer"
            onClick={togglePlay}
          />
        </>
      )}

      {/* Custom controls */}
      {started && (
        <div
          className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pt-8 pb-2 transition-opacity ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Progress */}
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={current}
            onChange={(e) => seek(parseFloat(e.target.value))}
            className="w-full h-1 accent-primary cursor-pointer"
            aria-label="Seek"
          />
          <div className="flex items-center gap-3 mt-1.5 text-white">
            <button onClick={togglePlay} aria-label={playing ? "Pause" : "Play"} className="hover:text-primary transition">
              {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
            </button>
            <button onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"} className="hover:text-primary transition">
              {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            <span className="text-xs tabular-nums">
              {fmt(current)} / {fmt(duration)}
            </span>
            <div className="flex-1" />
            <button onClick={goFullscreen} aria-label="Fullscreen" className="hover:text-primary transition">
              <Maximize2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomVideoPlayer;
