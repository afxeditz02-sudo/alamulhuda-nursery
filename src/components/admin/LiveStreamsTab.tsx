import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useLiveStreams } from "@/hooks/useSiteData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Trash2, Radio, Pencil, Upload, Video as VideoIcon, FileVideo, Eye } from "lucide-react";
import { useConfirm } from "@/hooks/useConfirm";
import { isSafeUrl } from "@/lib/utils";

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

interface FormState {
  id?: string;
  title: string;
  source: "youtube" | "upload";
  youtubeUrl: string;
  embedCode: string;
  videoUrl: string;
  thumbnailUrl: string;
  scheduledAt: string;
  endsAt: string;
}

const emptyForm: FormState = {
  title: "",
  source: "youtube",
  youtubeUrl: "",
  embedCode: "",
  videoUrl: "",
  thumbnailUrl: "",
  scheduledAt: "",
  endsAt: "",
};

const LiveStreamsTab = () => {
  const { data: streams } = useLiveStreams();
  const queryClient = useQueryClient();
  const { confirm, ConfirmDialog } = useConfirm();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["live_streams"] });

  const update = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  const uploadFile = async (file: File, prefix: string): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from("site-images")
      .upload(path, file, { upsert: true, contentType: file.type || undefined });
    if (error) throw error;
    const { data } = supabase.storage.from("site-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleThumb = async (file: File) => {
    setUploadingThumb(true);
    try {
      const url = await uploadFile(file, "live-thumbnails");
      update({ thumbnailUrl: url });
      toast.success("Thumbnail uploaded");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploadingThumb(false);
    }
  };

  const handleVideo = async (file: File) => {
    setUploadingVideo(true);
    setVideoProgress(0);
    // Fake progress (Supabase JS client doesn't expose progress events)
    const t = setInterval(() => setVideoProgress((p) => (p < 90 ? p + 2 : p)), 200);
    try {
      const url = await uploadFile(file, "live-videos");
      update({ videoUrl: url });
      setVideoProgress(100);
      toast.success("Video uploaded");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      clearInterval(t);
      setUploadingVideo(false);
      setTimeout(() => setVideoProgress(0), 800);
    }
  };

  const openCreate = () => {
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (s: any) => {
    setForm({
      id: s.id,
      title: s.title || "",
      source: s.video_url ? "upload" : "youtube",
      youtubeUrl: s.youtube_url || "",
      embedCode: s.embed_code || "",
      videoUrl: s.video_url || "",
      thumbnailUrl: s.thumbnail_url || "",
      scheduledAt: s.scheduled_at ? new Date(s.scheduled_at).toISOString().slice(0, 16) : "",
      endsAt: s.ends_at ? new Date(s.ends_at).toISOString().slice(0, 16) : "",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) { toast.error("Title required"); return; }

    let payload: any = {
      title: form.title,
      thumbnail_url: form.thumbnailUrl || null,
      scheduled_at: form.scheduledAt || null,
      ends_at: form.endsAt || null,
    };

    if (form.source === "upload") {
      if (!form.videoUrl) { toast.error("Upload a video file"); return; }
      payload.video_url = form.videoUrl;
      payload.media_type = "video";
      payload.youtube_url = "";
      payload.embed_code = null;
    } else {
      if (form.youtubeUrl && !isSafeUrl(form.youtubeUrl)) {
        toast.error("YouTube URL must start with http:// or https://"); return;
      }
      const idFromUrl = extractYouTubeId(form.youtubeUrl);
      const idFromEmbed = extractIdFromEmbed(form.embedCode);
      if (!idFromUrl && !idFromEmbed) {
        toast.error("Provide a valid YouTube URL or embed code"); return;
      }
      payload.youtube_url = form.youtubeUrl || (idFromEmbed ? `https://www.youtube.com/watch?v=${idFromEmbed}` : "");
      payload.embed_code = form.embedCode || null;
      payload.video_url = null;
      payload.media_type = "youtube";
    }

    if (form.thumbnailUrl && !isSafeUrl(form.thumbnailUrl)) {
      toast.error("Thumbnail URL must start with http:// or https://"); return;
    }

    if (form.id) {
      const { error } = await supabase.from("live_streams").update(payload).eq("id", form.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Live stream updated");
    } else {
      payload.is_live = false;
      payload.sort_order = (streams?.length || 0) + 1;
      const { error } = await supabase.from("live_streams").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Live stream added!");
    }
    setOpen(false);
    setForm(emptyForm);
    refresh();
  };

  const toggleLive = async (id: string, current: boolean) => {
    const { error } = await supabase.from("live_streams").update({ is_live: !current }).eq("id", id);
    if (error) { toast.error(error.message); return; }
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
      {/* Header row: Live > and Create button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-foreground">Live</h2>
          <VideoIcon className="h-5 w-5 text-primary" />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="gap-1.5 rounded-full shadow-md">
              <Plus className="h-4 w-4" /> Create
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{form.id ? "Edit Live Stream" : "Add New Live Stream"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Stream title</label>
                <Input placeholder="Stream title" value={form.title} onChange={(e) => update({ title: e.target.value })} />
              </div>

              <Tabs value={form.source} onValueChange={(v) => update({ source: v as any })}>
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="youtube">YouTube link</TabsTrigger>
                  <TabsTrigger value="upload">Upload video</TabsTrigger>
                </TabsList>

                <TabsContent value="youtube" className="space-y-3 pt-3">
                  <Input
                    placeholder="YouTube Live URL (e.g. https://youtube.com/live/...)"
                    value={form.youtubeUrl}
                    onChange={(e) => update({ youtubeUrl: e.target.value })}
                  />
                  <Textarea
                    placeholder='Or paste embed code: <iframe src="https://www.youtube.com/embed/..."></iframe>'
                    value={form.embedCode}
                    onChange={(e) => update({ embedCode: e.target.value })}
                    rows={3}
                  />
                </TabsContent>

                <TabsContent value="upload" className="space-y-3 pt-3">
                  <label className="block">
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleVideo(e.target.files[0])}
                    />
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition">
                      <FileVideo className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">{uploadingVideo ? "Uploading..." : "Click to upload video"}</p>
                      <p className="text-xs text-muted-foreground mt-1">Any format · original quality preserved</p>
                    </div>
                  </label>
                  {uploadingVideo && (
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-primary transition-all" style={{ width: `${videoProgress}%` }} />
                    </div>
                  )}
                  {form.videoUrl && (
                    <video src={form.videoUrl} controls className="w-full rounded-lg max-h-48 bg-black" />
                  )}
                </TabsContent>
              </Tabs>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Custom Thumbnail (optional)</label>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Thumbnail image URL"
                    value={form.thumbnailUrl}
                    onChange={(e) => update({ thumbnailUrl: e.target.value })}
                  />
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleThumb(e.target.files[0])}
                    />
                    <Button asChild variant="outline" size="icon" disabled={uploadingThumb}>
                      <span><Upload className="h-4 w-4" /></span>
                    </Button>
                  </label>
                </div>
                {form.thumbnailUrl && (
                  <img src={form.thumbnailUrl} alt="preview" className="w-32 h-20 object-cover rounded border mt-2" />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Scheduled start (optional)</label>
                  <Input type="datetime-local" value={form.scheduledAt} onChange={(e) => update({ scheduledAt: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Scheduled end (optional)</label>
                  <Input type="datetime-local" value={form.endsAt} onChange={(e) => update({ endsAt: e.target.value })} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save} className="gap-1.5">
                <Plus className="h-4 w-4" />
                {form.id ? "Save Changes" : "Add Live Stream"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {(streams || []).map((s: any) => {
          const videoId = extractYouTubeId(s.youtube_url || "") || extractIdFromEmbed(s.embed_code || "");
          const thumb = s.thumbnail_url || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null);
          return (
            <Card key={s.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {thumb ? (
                    <img src={thumb} alt={s.title} className="w-32 h-20 object-cover rounded-lg border flex-shrink-0" />
                  ) : (
                    <div className="w-32 h-20 rounded-lg border bg-muted flex items-center justify-center flex-shrink-0">
                      <FileVideo className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {s.is_live && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-destructive-foreground bg-destructive px-2 py-0.5 rounded-full mb-1">
                        <Radio className="h-3 w-3 animate-pulse" />LIVE
                      </span>
                    )}
                    <p className="font-semibold truncate">{s.title}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <Eye className="h-3.5 w-3.5" />
                      <span className="font-medium tabular-nums">{(s.total_views || 0).toLocaleString()} total views</span>
                    </div>
                    {s.video_url && <p className="text-xs text-muted-foreground mt-1">📁 Uploaded video</p>}
                    {s.youtube_url && !s.video_url && (
                      <p className="text-xs text-muted-foreground break-all mt-1 line-clamp-2">{s.youtube_url}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Button size="icon" onClick={() => openEdit(s)} className="h-9 w-9">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => confirm("Delete this live stream?", () => deleteStream(s.id))}
                      className="h-9 w-9"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-6 mt-3 pt-3 border-t text-sm flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Switch checked={s.is_live} onCheckedChange={() => toggleLive(s.id, s.is_live)} />
                    <span>Live Now</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Switch checked={s.is_published ?? true} onCheckedChange={() => togglePublished(s.id, s.is_published ?? true)} />
                    <span>Published</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {(!streams || streams.length === 0) && (
          <div className="text-center py-12 text-muted-foreground">
            <VideoIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No live streams yet. Click <strong>Create</strong> to add one.</p>
          </div>
        )}
      </div>

      <ConfirmDialog />
    </>
  );
};

export default LiveStreamsTab;
