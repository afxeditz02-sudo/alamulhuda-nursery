import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useLiveStreams } from "@/hooks/useSiteData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, Save, Radio, Video } from "lucide-react";
import { useConfirm } from "@/hooks/useConfirm";

const extractYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/live\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const match = url.match(p);
    if (match) return match[1];
  }
  return null;
};

const LiveStreamsTab = () => {
  const { data: streams } = useLiveStreams();
  const queryClient = useQueryClient();
  const { confirm, ConfirmDialog } = useConfirm();

  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  const addStream = async () => {
    if (!title.trim() || !youtubeUrl.trim()) {
      toast.error("Title and YouTube URL are required");
      return;
    }
    if (!extractYouTubeId(youtubeUrl)) {
      toast.error("Invalid YouTube URL");
      return;
    }
    const { error } = await supabase.from("live_streams").insert({
      title,
      youtube_url: youtubeUrl,
      scheduled_at: scheduledAt || null,
      ends_at: endsAt || null,
      is_live: false,
      sort_order: (streams?.length || 0) + 1,
    });
    if (error) { toast.error(error.message); return; }
    setTitle(""); setYoutubeUrl(""); setScheduledAt(""); setEndsAt("");
    toast.success("Live stream added!");
    queryClient.invalidateQueries({ queryKey: ["live_streams"] });
  };

  const toggleLive = async (id: string, currentLive: boolean) => {
    const { error } = await supabase.from("live_streams").update({ is_live: !currentLive }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(!currentLive ? "Stream set to LIVE!" : "Stream set to offline");
    queryClient.invalidateQueries({ queryKey: ["live_streams"] });
  };

  const togglePublished = async (id: string, current: boolean) => {
    const { error } = await supabase.from("live_streams").update({ is_published: !current }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(!current ? "Published" : "Unpublished");
    queryClient.invalidateQueries({ queryKey: ["live_streams"] });
  };

  const deleteStream = async (id: string) => {
    await supabase.from("live_streams").delete().eq("id", id);
    toast.success("Deleted");
    queryClient.invalidateQueries({ queryKey: ["live_streams"] });
  };

  return (
    <>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Video className="h-5 w-5" /> Live Streams</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {(streams || []).map((s) => {
            const videoId = extractYouTubeId(s.youtube_url);
            return (
              <div key={s.id} className="p-3 border rounded space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {s.is_live && <span className="flex items-center gap-1 text-xs font-bold text-destructive-foreground bg-destructive px-2 py-0.5 rounded-full"><Radio className="h-3 w-3 animate-pulse" />LIVE</span>}
                      <p className="font-medium">{s.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground break-all mt-1">{s.youtube_url}</p>
                    {s.scheduled_at && <p className="text-xs text-muted-foreground">Starts: {new Date(s.scheduled_at).toLocaleString()}</p>}
                    {s.ends_at && <p className="text-xs text-muted-foreground">Ends: {new Date(s.ends_at).toLocaleString()}</p>}
                  </div>
                  <Button variant="destructive" size="icon" onClick={() => confirm("Delete this live stream?", () => deleteStream(s.id))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {videoId && (
                  <div className="aspect-video w-full max-w-sm rounded overflow-hidden border">
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
                <div className="flex items-center gap-4 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Switch checked={s.is_live} onCheckedChange={() => toggleLive(s.id, s.is_live)} />
                    <span>Live Now</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Switch checked={s.is_published ?? true} onCheckedChange={() => togglePublished(s.id, s.is_published ?? true)} />
                    <span>Published</span>
                  </label>
                </div>
              </div>
            );
          })}

          <div className="border-t pt-4 space-y-2">
            <Input placeholder="Stream title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input placeholder="YouTube Live URL (e.g. https://youtube.com/live/...)" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Scheduled start (optional)</label>
                <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Scheduled end (optional)</label>
                <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
              </div>
            </div>
            <Button onClick={addStream}><Plus className="h-4 w-4 mr-1" /> Add Live Stream</Button>
          </div>
        </CardContent>
      </Card>
      <ConfirmDialog />
    </>
  );
};

export default LiveStreamsTab;
