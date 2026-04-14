import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2, CalendarClock } from "lucide-react";

const useBanners = () =>
  useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

const BannersTab = () => {
  const { data: banners } = useBanners();
  const queryClient = useQueryClient();
  const [linkUrl, setLinkUrl] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [newFile, setNewFile] = useState<File | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["banners"] });

  const addBanner = async () => {
    if (!newFile) {
      toast.error("Please select an image");
      return;
    }
    const safeName = newFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `banners/${Date.now()}-${safeName}`;
    toast.info("Uploading...");
    const { error: uploadErr } = await supabase.storage
      .from("site-images")
      .upload(path, newFile);
    if (uploadErr) {
      toast.error(`Upload failed: ${uploadErr.message}`);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("site-images").getPublicUrl(path);

    const { error } = await supabase.from("banners").insert({
      image_url: publicUrl,
      link_url: linkUrl || null,
      sort_order: (banners?.length || 0) + 1,
      starts_at: startsAt ? new Date(startsAt).toISOString() : null,
      ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      is_published: isPublished,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setNewFile(null);
    setLinkUrl("");
    setStartsAt("");
    setEndsAt("");
    setIsPublished(true);
    toast.success("Banner added!");
    invalidate();
  };

  const deleteBanner = async (id: string) => {
    await supabase.from("banners").delete().eq("id", id);
    toast.success("Deleted");
    invalidate();
  };

  const now = new Date();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Banners</CardTitle>
        <p className="text-xs text-muted-foreground">
          Images shown between the navigation bar and features section. Schedule when they appear and disappear.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {(banners || []).map((b) => {
          const isActive =
            b.is_published &&
            (!b.starts_at || new Date(b.starts_at) <= now) &&
            (!b.ends_at || new Date(b.ends_at) >= now);
          return (
            <div key={b.id} className="p-3 border rounded-lg flex items-start gap-3">
              <img src={b.image_url} alt="" className="w-24 h-14 object-cover rounded" />
              <div className="flex-1 min-w-0 space-y-1">
                {b.link_url && (
                  <a href={b.link_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate block">
                    {b.link_url}
                  </a>
                )}
                <div className="flex gap-2 flex-wrap text-xs">
                  {!b.is_published && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Draft</span>
                  )}
                  {isActive ? (
                    <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">Active</span>
                  ) : b.is_published ? (
                    <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded">Scheduled</span>
                  ) : null}
                </div>
                {(b.starts_at || b.ends_at) && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <CalendarClock className="h-3 w-3" />
                    {b.starts_at && `From: ${new Date(b.starts_at).toLocaleString()}`}
                    {b.starts_at && b.ends_at && " — "}
                    {b.ends_at && `To: ${new Date(b.ends_at).toLocaleString()}`}
                  </p>
                )}
              </div>
              <Button variant="destructive" size="icon" onClick={() => deleteBanner(b.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}

        <div className="border-t pt-4 space-y-3">
          <p className="font-medium text-sm">Add New Banner</p>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setNewFile(e.target.files?.[0] || null)}
          />
          <Input
            placeholder="Link URL (optional — opens when clicked)"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                <CalendarClock className="h-3 w-3" /> Show from (optional)
              </label>
              <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                <CalendarClock className="h-3 w-3" /> Show until (optional)
              </label>
              <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Published</label>
            <Switch checked={isPublished} onCheckedChange={setIsPublished} />
          </div>
          <Button onClick={addBanner}>
            <Plus className="h-4 w-4 mr-1" /> Add Banner
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BannersTab;
