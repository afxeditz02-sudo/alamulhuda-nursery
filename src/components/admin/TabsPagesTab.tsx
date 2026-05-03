import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Settings, Star, Image, BarChart3, BookOpen, ImageIcon, Layout, Menu, Plus, Trash2, GripVertical } from "lucide-react";
import { useNavMenuItems } from "@/hooks/useSiteData";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const availablePages = [
  { label: "Home", href: "/" },
  { label: "Features", href: "#features" },
  { label: "Admission", href: "#admission" },
  { label: "Analysis", href: "#analysis" },
  { label: "Programmes", href: "#programmes" },
  { label: "Contact", href: "#footer" },
  { label: "Admin", href: "/admin" },
  { label: "Auth", href: "/auth" },
];

const adminTabs = [
  { id: "settings", label: "Settings", icon: Settings, description: "School name, tagline, logo, admission text, footer text fields" },
  { id: "features", label: "Features", icon: Star, description: "School feature cards displayed on the homepage" },
  { id: "slider", label: "Slider", icon: Image, description: "Admission slider images for the hero carousel" },
  { id: "analysis", label: "Analysis", icon: BarChart3, description: "Yearly statistics — students, teachers, buses, etc." },
  { id: "programmes", label: "Programmes", icon: BookOpen, description: "Programmes/news with media, scheduling & publishing" },
  { id: "footer", label: "Footer Logos", icon: ImageIcon, description: "Auto-scrolling partner/sponsor logos in the footer" },
];

const TabsPagesTab = () => {
  const { data: navItems } = useNavMenuItems();
  const queryClient = useQueryClient();
  const [customLabel, setCustomLabel] = useState("");
  const [customHref, setCustomHref] = useState("");

  const addNavItem = async (label: string, href: string) => {
    const { error } = await supabase.from("nav_menu_items").insert({
      label,
      href,
      sort_order: (navItems?.length || 0) + 1,
      is_visible: true,
    });
    if (error) { toast.error(error.message); return; }
    toast.success(`"${label}" added to navigation`);
    queryClient.invalidateQueries({ queryKey: ["nav_menu_items"] });
  };

  const removeNavItem = async (id: string) => {
    const { error } = await supabase.from("nav_menu_items").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Removed from navigation");
    queryClient.invalidateQueries({ queryKey: ["nav_menu_items"] });
  };

  const toggleVisibility = async (id: string, current: boolean) => {
    const { error } = await supabase.from("nav_menu_items").update({ is_visible: !current }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    queryClient.invalidateQueries({ queryKey: ["nav_menu_items"] });
  };

  const addCustom = async () => {
    if (!customLabel.trim() || !customHref.trim()) return;
    const href = customHref.trim();
    const isRelative = /^(\/|#)/.test(href);
    const isAbsolute = /^https?:\/\//i.test(href);
    if (!isRelative && !isAbsolute) {
      toast.error("URL must start with /, #, http:// or https://");
      return;
    }
    await addNavItem(customLabel.trim(), href);
    setCustomLabel("");
    setCustomHref("");
  };

  const existingHrefs = new Set((navItems || []).map((i) => i.href));

  return (
    <div className="space-y-6">
      {/* Current Nav Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Menu className="h-5 w-5" /> Navigation Menu Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(navItems || []).length === 0 && (
            <p className="text-sm text-muted-foreground">No navigation items yet. Add from the list below.</p>
          )}
          {(navItems || []).map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground font-mono">{item.href}</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={item.is_visible ?? true}
                  onCheckedChange={() => toggleVisibility(item.id, item.is_visible ?? true)}
                />
                <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => removeNavItem(item.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Add from available pages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5" /> Add Page to Navigation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {availablePages.filter((p) => !existingHrefs.has(p.href)).map((page) => (
              <Button
                key={page.href}
                variant="outline"
                className="justify-start h-auto py-2 px-3"
                onClick={() => addNavItem(page.label, page.href)}
              >
                <Plus className="h-3 w-3 mr-2 shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium">{page.label}</p>
                  <p className="text-xs text-muted-foreground font-mono">{page.href}</p>
                </div>
              </Button>
            ))}
          </div>
          {availablePages.filter((p) => !existingHrefs.has(p.href)).length === 0 && (
            <p className="text-sm text-muted-foreground">All available pages have been added.</p>
          )}

          <div className="border-t pt-4 space-y-2">
            <p className="text-sm font-medium">Or add a custom link:</p>
            <Input placeholder="Label (e.g. Gallery)" value={customLabel} onChange={(e) => setCustomLabel(e.target.value)} />
            <Input placeholder="URL (e.g. /gallery or #section)" value={customHref} onChange={(e) => setCustomHref(e.target.value)} />
            <Button onClick={addCustom} disabled={!customLabel.trim() || !customHref.trim()}>
              <Plus className="h-4 w-4 mr-1" /> Add Custom Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Admin Tabs reference */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> Admin Tabs</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {adminTabs.map((tab) => (
            <div key={tab.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <tab.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{tab.label}</p>
                <p className="text-sm text-muted-foreground">{tab.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default TabsPagesTab;
