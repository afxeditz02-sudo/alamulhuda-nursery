import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useProgrammes } from "@/hooks/useSiteData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, Save, Edit2, X, FileText, Film, Image as ImageIcon, CalendarClock, Upload, Replace } from "lucide-react";

const generateYears = () => {
  const years = [];
  for (let y = 2025; y <= 2035; y++) years.push(`${y}-${String(y + 1).slice(2)}`);
  return years;
};

type MediaItem = { url: string; type: "image" | "video" | "file"; name: string };

const MAX_MEDIA = 5;

const ProgrammesTab = () => {
  const allYears = generateYears();
  const [selectedYear, setSelectedYear] = useState("2025-26");
  const { data: programmes } = useProgrammes(selectedYear);
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [seeMore, setSeeMore] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [newMedia, setNewMedia] = useState<File[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string; description: string; see_more_url: string;
    scheduled_at: string; is_published: boolean;
  }>({ title: "", description: "", see_more_url: "", scheduled_at: "", is_published: true });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["programmes", selectedYear] });

  const uploadFiles = async (files: File[]): Promise<MediaItem[]> => {
    const items: MediaItem[] = [];
    for (const file of files) {
      const path = `programmes/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("site-images").upload(path, file);
      if (error) { toast.error(`Upload failed: ${file.name}`); continue; }
      const { data: { publicUrl } } = supabase.storage.from("site-images").getPublicUrl(path);
      const type = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "file";
      items.push({ url: publicUrl, type, name: file.name });
    }
    return items;
  };

  const addProgramme = async () => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (newMedia.length > MAX_MEDIA) { toast.error(`Max ${MAX_MEDIA} files allowed`); return; }

    const media = newMedia.length > 0 ? await uploadFiles(newMedia) : [];
    const imageUrl = media.find(m => m.type === "image")?.url || null;

    const { error } = await supabase.from("programmes").insert({
      year: selectedYear, title, description: desc || null,
      image_url: imageUrl, see_more_url: seeMore || null,
      sort_order: (programmes?.length || 0) + 1,
      media: media as any,
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      is_published: isPublished,
    });
    if (error) { toast.error(error.message); return; }
    setTitle(""); setDesc(""); setSeeMore(""); setScheduledAt(""); setIsPublished(true); setNewMedia([]);
    toast.success("Programme added!");
    invalidate();
  };

  const deleteProgramme = async (id: string) => {
    await supabase.from("programmes").delete().eq("id", id);
    toast.success("Deleted");
    invalidate();
  };

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setEditForm({
      title: p.title, description: p.description || "",
      see_more_url: p.see_more_url || "",
      scheduled_at: p.scheduled_at ? new Date(p.scheduled_at).toISOString().slice(0, 16) : "",
      is_published: p.is_published ?? true,
    });
  };

  const saveEdit = async (id: string) => {
    const { error } = await supabase.from("programmes").update({
      title: editForm.title,
      description: editForm.description || null,
      see_more_url: editForm.see_more_url || null,
      scheduled_at: editForm.scheduled_at ? new Date(editForm.scheduled_at).toISOString() : null,
      is_published: editForm.is_published,
    }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setEditingId(null);
    toast.success("Programme updated!");
    invalidate();
  };

  const replaceMedia = async (id: string, files: FileList | null, existingMedia: MediaItem[]) => {
    if (!files || files.length === 0) return;
    const fileArr = Array.from(files);
    if (fileArr.length > MAX_MEDIA) { toast.error(`Max ${MAX_MEDIA} files`); return; }
    const media = await uploadFiles(fileArr);
    const imageUrl = media.find(m => m.type === "image")?.url || null;
    const { error } = await supabase.from("programmes").update({
      media: media as any,
      image_url: imageUrl,
    }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Media replaced!");
    invalidate();
  };

  const removeMediaItem = async (id: string, media: MediaItem[], index: number) => {
    const updated = media.filter((_, i) => i !== index);
    const imageUrl = updated.find(m => m.type === "image")?.url || null;
    const { error } = await supabase.from("programmes").update({
      media: updated as any,
      image_url: imageUrl,
    }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("File removed");
    invalidate();
  };

  const addMediaToExisting = async (id: string, files: FileList | null, existingMedia: MediaItem[]) => {
    if (!files || files.length === 0) return;
    const fileArr = Array.from(files);
    const total = existingMedia.length + fileArr.length;
    if (total > MAX_MEDIA) { toast.error(`Max ${MAX_MEDIA} files. Currently ${existingMedia.length}.`); return; }
    const newItems = await uploadFiles(fileArr);
    const allMedia = [...existingMedia, ...newItems];
    const imageUrl = allMedia.find(m => m.type === "image")?.url || null;
    const { error } = await supabase.from("programmes").update({
      media: allMedia as any,
      image_url: imageUrl,
    }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Media added!");
    invalidate();
  };

  const getMediaIcon = (type: string) => {
    if (type === "image") return <ImageIcon className="h-4 w-4" />;
    if (type === "video") return <Film className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Programmes</CardTitle>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              {allYears.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {(programmes || []).map((p) => {
          const media: MediaItem[] = Array.isArray(p.media) ? (p.media as any) : [];
          const isEditing = editingId === p.id;

          return (
            <div key={p.id} className="p-4 border rounded-lg space-y-3">
              {isEditing ? (
                <div className="space-y-3">
                  <Input value={editForm.title} onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))} placeholder="Title" />
                  <Textarea value={editForm.description} onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" />
                  <Input value={editForm.see_more_url} onChange={(e) => setEditForm(f => ({ ...f, see_more_url: e.target.value }))} placeholder="See More URL" />
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground flex items-center gap-1"><CalendarClock className="h-3 w-3" /> Schedule</label>
                      <Input type="datetime-local" value={editForm.scheduled_at} onChange={(e) => setEditForm(f => ({ ...f, scheduled_at: e.target.value }))} />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-muted-foreground">Published</label>
                      <Switch checked={editForm.is_published} onCheckedChange={(v) => setEditForm(f => ({ ...f, is_published: v }))} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => saveEdit(p.id)}><Save className="h-4 w-4 mr-1" /> Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}><X className="h-4 w-4 mr-1" /> Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  {p.image_url && <img src={p.image_url} alt="" className="w-16 h-16 object-cover rounded" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{p.title}</p>
                    {p.description && <p className="text-sm text-muted-foreground truncate">{p.description}</p>}
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {!p.is_published && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Draft</span>}
                      {p.scheduled_at && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded flex items-center gap-1"><CalendarClock className="h-3 w-3" />{new Date(p.scheduled_at).toLocaleString()}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" onClick={() => startEdit(p)}><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="destructive" size="icon" onClick={() => deleteProgramme(p.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              )}

              <div className="border-t pt-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">Media ({media.length}/{MAX_MEDIA})</p>
                {media.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {media.map((m, i) => (
                      <div key={i} className="relative group border rounded p-1 flex items-center gap-1 text-xs bg-muted/50 pr-6">
                        {getMediaIcon(m.type)}
                        <a href={m.url} target="_blank" rel="noopener noreferrer" className="hover:underline max-w-[120px] truncate">{m.name}</a>
                        <button
                          onClick={() => removeMediaItem(p.id, media, i)}
                          className="absolute right-1 top-1/2 -translate-y-1/2 text-destructive opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 flex-wrap">
                  {media.length < MAX_MEDIA && (
                    <label className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild>
                        <span><Upload className="h-3 w-3 mr-1" /> Add Files</span>
                      </Button>
                      <input type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx" className="hidden"
                        onChange={(e) => addMediaToExisting(p.id, e.target.files, media)} />
                    </label>
                  )}
                  <label className="cursor-pointer">
                    <Button variant="outline" size="sm" asChild>
                      <span><Replace className="h-3 w-3 mr-1" /> Replace All</span>
                    </Button>
                    <input type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx" className="hidden"
                      onChange={(e) => replaceMedia(p.id, e.target.files, media)} />
                  </label>
                </div>
              </div>
            </div>
          );
        })}

        <div className="border-t pt-4 space-y-3">
          <p className="font-medium text-sm">Add New Programme</p>
          <Input placeholder="Title *" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea placeholder="Description (optional)" value={desc} onChange={(e) => setDesc(e.target.value)} />
          <Input placeholder="See More URL (optional)" value={seeMore} onChange={(e) => setSeeMore(e.target.value)} />
          
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><CalendarClock className="h-3 w-3" /> Schedule (optional)</label>
              <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
            </div>
            <div className="flex items-center gap-2 pt-4">
              <label className="text-xs text-muted-foreground">Published</label>
              <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Media (images, videos, files — max {MAX_MEDIA})</label>
            <Input type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
              onChange={(e) => {
                const files = e.target.files ? Array.from(e.target.files) : [];
                if (files.length > MAX_MEDIA) { toast.error(`Max ${MAX_MEDIA} files`); return; }
                setNewMedia(files);
              }} />
            {newMedia.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">{newMedia.length} file(s) selected</p>
            )}
          </div>

          <Button onClick={addProgramme}><Plus className="h-4 w-4 mr-1" /> Add Programme</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgrammesTab;
