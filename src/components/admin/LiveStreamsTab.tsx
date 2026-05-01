import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useLiveStreams } from "@/hooks/useSiteData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, Radio, Video, Upload } from "lucide-react";
import { useConfirm } from "@/hooks/useConfirm";

const extractYouTubeId = (url: string): string | null => {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/live\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
};
const extractIdFromEmbed = (embed: string): string | null => {
  if (!embed) return null;
  const m = embed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
};

const LiveStreamsTab = () => {
  const { data: streams } = useLiveStreams();
  const queryClient = useQueryClient();
  const { confirm, ConfirmDialog } = useConfirm();

  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [embedCode, setEmbedCode] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [uploading, setUploading] = useState(false);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["live_streams"] });

  const uploadThumbnail = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `live-thumbnails/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("site-assets").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
      setThumbnailUrl(data.publicUrl);
      toast.success("Thumbnail uploaded");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const addStream = async () => {
    if (!title.trim()) { toast.error("Title required"); return; }
    const idFromUrl = extractYouTubeId(youtubeUrl);
    const idFromEmbed = extractIdFromEmbed(embedCode);
    if (!idFromUrl && !idFromEmbed) {
      toast.error("Provide a valid YouTube URL or embed code");
      return;
    }
    const finalUrl = youtubeUrl || (idFromEmbed ? `https://www.youtube.com/watch?v=${idFromEmbed}` : "");
    const { error } = await supabase.from("live_streams").insert({
      title,
      youtube_url: finalUrl,
      embed_code: embedCode || null,
      thumbnail_url: thumbnailUrl || null,
      scheduled_at: scheduledAt || null,
      ends_at: endsAt || null,
      is_live: false,
      sort_order: (streams?.length || 0) + 1,
    } as any);
    if (error) { toast.error(error.message); return; }
    setTitle(""); setYoutubeUrl(""); setEmbedCode(""); setThumbnailUrl(""); setScheduledAt(""); setEndsAt("");
    toast.success("Live stream added!");
    refresh();
  };

  const toggleLive = async (id: string, current: boolean) => {
    const { error } = await supabase.from("live_streams").update({ is_live: !current }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(!current ? "Set to LIVE" : "Set to offline");
    refresh();
  };
  const togglePublished = async (id: string, current: boolean) => {
    const { error } = await supabase.from("live_streams").update({ is_published: !current }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    refresh();
  };
  const deleteStream = async (id: string) => {
    await supabase.from("live_streams").delete().eq("id", id);
    toast.success("Deleted");
    refresh();
  };

  return (
    <>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Video className="h-5 w-5" /> Live Streams</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {(streams || []).map((s: any) => {
            const videoId = extractYouTubeId(s.youtube_url) || extractIdFromEmbed(s.embed_code || "");
            const thumb = s.thumbnail_url || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null);
            return (
              <div key={s.id} className="p-3 border rounded-lg space-y-3">
                <div className="flex items-start gap-3">
                  {thumb && <img src={thumb} alt={s.title} className="w-32 h-20 object-cover rounded border" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {s.is_live && <span className="flex items-center gap-1 text-xs font-bold text-destructive-foreground bg-destructive px-2 py-0.5 rounded-full"><Radio className="h-3 w-3 animate-pulse" />LIVE</span>}
                      <p className="font-medium">{s.title}</p>
                    </div>
                    {s.youtube_url && <p className="text-xs text-muted-foreground break-all mt-1">{s.youtube_url}</p>}
                    {s.scheduled_at && <p className="text-xs text-muted-foreground">Starts: {new Date(s.scheduled_at).toLocaleString()}</p>}
                    {s.ends_at && <p className="text-xs text-muted-foreground">Ends: {new Date(s.ends_at).toLocaleString()}</p>}
                  </div>
                  <Button variant="destructive" size="icon" onClick={() => confirm("Delete this live stream?", () => deleteStream(s.id))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-sm flex-wrap">
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

          <div className="border-t pt-4 space-y-3">
            <h4 className="font-semibold text-sm">Add New Live Stream</h4>
            <Input placeholder="Stream title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input placeholder="YouTube Live URL (e.g. https://youtube.com/live/...)" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} />
            <Textarea
              placeholder='Or paste YouTube embed code: <iframe src="https://www.youtube.com/embed/..."></iframe>'
              value={embedCode}
              onChange={(e) => setEmbedCode(e.target.value)}
              rows={3}
            />
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Custom Thumbnail (optional — overrides YouTube thumbnail)</label>
              <div className="flex items-center gap-2">
                <Input placeholder="Thumbnail image URL" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} />
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && uploadThumbnail(e.target.files[0])}
                  />
                  <Button asChild variant="outline" size="icon" disabled={uploading}>
                    <span><Upload className="h-4 w-4" /></span>
                  </Button>
                </label>
              </div>
              {thumbnailUrl && <img src={thumbnailUrl} alt="preview" className="w-32 h-20 object-cover rounded border" />}
            </div>
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
