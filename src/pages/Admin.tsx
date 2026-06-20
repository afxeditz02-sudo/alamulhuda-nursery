import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useSiteSettings, useFeatures, useSliderImages, useAnalysisData, useProgrammes, useFooterLogos } from "@/hooks/useSiteData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { LogOut, Plus, Trash2, Save, ArrowUpRight, ChevronLeft, Settings as SettingsIcon, ShieldCheck, ListChecks, School, Newspaper, GalleryHorizontalEnd, Radio, AppWindow, PanelBottom } from "lucide-react";
import ProgrammesTab from "@/components/admin/ProgrammesTab";
import BannersTab from "@/components/admin/BannersTab";
import TabsPagesTab from "@/components/admin/TabsPagesTab";
import UsersTab from "@/components/admin/UsersTab";
import LiveStreamsTab from "@/components/admin/LiveStreamsTab";
import { useConfirm } from "@/hooks/useConfirm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const generateYears = () => {
  const years = [];
  for (let y = 2025; y <= 2035; y++) years.push(`${y}-${String(y + 1).slice(2)}`);
  return years;
};

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [removedPopup, setRemovedPopup] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirm();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }
    if (!loading && user) {
      supabase
        .from("profiles")
        .select("is_removed")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error) {
            console.error("Profile check error:", error);
            if (!isAdmin) navigate("/auth");
            return;
          }
          if (data?.is_removed) {
            setRemovedPopup(true);
          } else if (!isAdmin) {
            navigate("/auth");
          }
        });
    }
  }, [user, isAdmin, loading, navigate]);

  const handleSignOut = async () => {
    // Sign-out should NOT delete the user's profile or roles.
    // Removing roles here would let the sole admin permanently lock themselves out.
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (removedPopup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <AlertDialog open={true}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Access Revoked</AlertDialogTitle>
              <AlertDialogDescription>
                You are removed by Admin — if you want to enter, sign in and wait for admin approval.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogAction
              onClick={async () => {
                await signOut();
                navigate("/auth");
              }}
            >
              Sign Out & Go to Sign In
            </AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  const sections: { key: string; label: string; icon: any; render: () => JSX.Element }[] = [
    { key: "settings", label: "Settings", icon: SettingsIcon, render: () => <SiteSettingsTab /> },
    { key: "users", label: "Users", icon: ShieldCheck, render: () => <UsersTab /> },
    { key: "features", label: "Features", icon: ListChecks, render: () => <FeaturesTab /> },
    { key: "admission", label: "Addmission & calculation", icon: School, render: () => (
      <div className="space-y-6"><SliderTab /><AnalysisTab /></div>
    )},
    { key: "news", label: "News", icon: Newspaper, render: () => <ProgrammesTab /> },
    { key: "banner", label: "Banner", icon: GalleryHorizontalEnd, render: () => <BannersTab /> },
    { key: "live", label: "Live", icon: Radio, render: () => <LiveStreamsTab /> },
    { key: "tabs", label: "Tabs", icon: AppWindow, render: () => <TabsPagesTab /> },
    { key: "footer", label: "Footer", icon: PanelBottom, render: () => <FooterLogosTab /> },
  ];

  const active = sections.find((s) => s.key === activeSection);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/60 to-white">
      <header className="bg-primary text-primary-foreground px-5 py-4 flex items-center justify-between rounded-b-2xl shadow-md">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-6 w-6" />
          <h1 className="text-xl font-bold tracking-wide">Admin Panel</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            aria-label="View Site"
            className="hover:opacity-80 transition"
          >
            <ArrowUpRight className="h-6 w-6" />
          </button>
          <div className="h-6 w-px bg-primary-foreground/40" />
          <button
            onClick={() => confirm("Are you sure you want to sign out?", handleSignOut)}
            aria-label="Sign Out"
            className="hover:opacity-80 transition"
          >
            <LogOut className="h-6 w-6" />
          </button>
        </div>
      </header>
      <ConfirmDialog />
      <div className="container mx-auto p-4 max-w-5xl">
        {!active ? (
          <div className="grid grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-10 lg:grid-cols-4">
            {sections.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className="aspect-square bg-white rounded-3xl shadow-[0_4px_20px_-6px_rgba(37,99,235,0.18)] flex flex-col items-center justify-center gap-2 sm:gap-3 p-3 hover:shadow-[0_8px_28px_-6px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 transition-all active:scale-95"
              >
                <Icon className="h-9 w-9 sm:h-11 sm:w-11 text-primary" strokeWidth={2.2} />
                <span className="text-primary font-bold text-xs sm:text-sm text-center leading-tight">
                  {label}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <button
              onClick={() => setActiveSection(null)}
              className="flex items-center gap-1 text-primary font-semibold mb-4 hover:opacity-80 transition"
            >
              <ChevronLeft className="h-5 w-5" /> Back
            </button>
            <h2 className="text-2xl font-bold text-primary mb-4">{active.label}</h2>
            {active.render()}
          </div>
        )}
      </div>
    </div>
  );
};

const SiteSettingsTab = () => {
  const { data: settings } = useSiteSettings();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings) {
      const { id, updated_at, ...rest } = settings;
      setForm(rest as Record<string, string>);
    }
  }, [settings]);

  const handleSave = async () => {
    if (!settings?.id) return;
    const { error } = await supabase.from("site_settings").update(form as any).eq("id", settings.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Settings saved!");
    queryClient.invalidateQueries({ queryKey: ["site_settings"] });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !settings?.id) return;
    const ext = file.name.split(".").pop();
    const path = `logo/logo.${ext}`;
    const { error: uploadError } = await supabase.storage.from("site-images").upload(path, file, { upsert: true });
    if (uploadError) { toast.error(uploadError.message); return; }
    const { data: { publicUrl } } = supabase.storage.from("site-images").getPublicUrl(path);
    setForm((f) => ({ ...f, logo_url: publicUrl }));
    toast.success("Logo uploaded!");
  };

  const fields = [
    { key: "school_name", label: "School Name" },
    { key: "tagline", label: "Tagline" },
    { key: "features_heading", label: "Features Heading" },
    { key: "admission_heading", label: "Admission Heading" },
    { key: "admission_text", label: "Admission Text" },
    { key: "admission_button_text", label: "Admission Button Text" },
    { key: "analysis_heading", label: "Analysis Heading" },
    { key: "programmes_heading", label: "Programmes Heading" },
    { key: "footer_copyright", label: "Footer Copyright" },
    { key: "footer_managed_by", label: "Footer Managed By" },
    { key: "footer_estd", label: "Footer Estd" },
    { key: "footer_reg", label: "Footer Reg & Phone" },
    { key: "footer_under", label: "Footer Under" },
    { key: "footer_run_by", label: "Footer Run By" },
  ];

  return (
    <Card>
      <CardHeader><CardTitle>Site Settings</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">School Logo</label>
          <Input type="file" accept="image/*" onChange={handleLogoUpload} />
          {form.logo_url && <img src={form.logo_url} alt="Logo" className="h-16 mt-2 rounded" />}
        </div>
        {fields.map((f) => (
          <div key={f.key}>
            <label className="text-sm font-medium">{f.label}</label>
            <Input
              value={form[f.key] || ""}
              onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
            />
          </div>
        ))}
        <Button onClick={handleSave}><Save className="h-4 w-4 mr-1" /> Save Settings</Button>
      </CardContent>
    </Card>
  );
};

const FeaturesTab = () => {
  const { data: features } = useFeatures();
  const queryClient = useQueryClient();
  const { confirm, ConfirmDialog } = useConfirm();
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const addFeature = async () => {
    if (!newTitle.trim()) return;
    const { error } = await supabase.from("features").insert({
      title: newTitle, description: newDesc || null, sort_order: (features?.length || 0) + 1,
    });
    if (error) { toast.error(error.message); return; }
    setNewTitle(""); setNewDesc("");
    toast.success("Feature added!");
    queryClient.invalidateQueries({ queryKey: ["features"] });
  };

  const deleteFeature = async (id: string) => {
    await supabase.from("features").delete().eq("id", id);
    toast.success("Feature deleted");
    queryClient.invalidateQueries({ queryKey: ["features"] });
  };

  return (
    <>
      <Card>
        <CardHeader><CardTitle>Features</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {(features || []).map((f) => (
            <FeatureRow key={f.id} feature={f} onDelete={() => confirm("Delete this feature?", () => deleteFeature(f.id))} />
          ))}
          <div className="border-t pt-4 space-y-2">
            <Input placeholder="Feature title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            <Input placeholder="Description (optional)" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
            <Button onClick={addFeature}><Plus className="h-4 w-4 mr-1" /> Add Feature</Button>
          </div>
        </CardContent>
      </Card>
      <ConfirmDialog />
    </>
  );
};

const FeatureRow = ({ feature, onDelete }: { feature: { id: string; title: string; description: string | null }; onDelete: () => void }) => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(feature.title);
  const [desc, setDesc] = useState(feature.description || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim()) { toast.error("Title required"); return; }
    setSaving(true);
    const { error } = await supabase.from("features").update({ title, description: desc || null }).eq("id", feature.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Feature updated");
    queryClient.invalidateQueries({ queryKey: ["features"] });
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="space-y-2 p-3 border rounded">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
        <Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" />
        <div className="flex gap-2">
          <Button size="sm" onClick={save} disabled={saving}><Save className="h-4 w-4 mr-1" /> Save</Button>
          <Button size="sm" variant="outline" onClick={() => { setTitle(feature.title); setDesc(feature.description || ""); setEditing(false); }}>Cancel</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-3 border rounded">
      <div className="flex-1">
        <p className="font-medium">{feature.title}</p>
        {feature.description && <p className="text-sm text-muted-foreground">{feature.description}</p>}
      </div>
      <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Edit</Button>
      <Button variant="destructive" size="icon" onClick={onDelete}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

const SliderTab = () => {
  const { data: slides } = useSliderImages();
  const queryClient = useQueryClient();
  const { confirm, ConfirmDialog } = useConfirm();

  const uploadSlide = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const path = `slider/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("site-images").upload(path, file);
    if (uploadError) { toast.error(uploadError.message); return; }
    const { data: { publicUrl } } = supabase.storage.from("site-images").getPublicUrl(path);
    const { error } = await supabase.from("slider_images").insert({
      image_url: publicUrl, sort_order: (slides?.length || 0) + 1,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Slide added!");
    queryClient.invalidateQueries({ queryKey: ["slider_images"] });
  };

  const deleteSlide = async (id: string) => {
    await supabase.from("slider_images").delete().eq("id", id);
    toast.success("Slide deleted");
    queryClient.invalidateQueries({ queryKey: ["slider_images"] });
  };

  return (
    <>
      <Card>
        <CardHeader><CardTitle>Admission Slider Images</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(slides || []).map((s) => (
              <div key={s.id} className="relative group">
                <img src={s.image_url} alt="" className="w-full h-32 object-cover rounded border" />
                <Button
                  variant="destructive" size="icon"
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition h-7 w-7"
                  onClick={() => confirm("Delete this slide?", () => deleteSlide(s.id))}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
          <Input type="file" accept="image/*" onChange={uploadSlide} />
        </CardContent>
      </Card>
      <ConfirmDialog />
    </>
  );
};

const AnalysisTab = () => {
  const allYears = generateYears();
  const [selectedYear, setSelectedYear] = useState("2025-26");
  const { data: analysisData } = useAnalysisData(selectedYear);
  const { data: settings } = useSiteSettings();
  const queryClient = useQueryClient();
  const { confirm, ConfirmDialog } = useConfirm();
  const [newCat, setNewCat] = useState("");
  const [newVal, setNewVal] = useState("");
  const [newIcon, setNewIcon] = useState("users");

  const primaryYear = (settings as any)?.primary_analysis_year || "2025-26";

  const setPrimaryYear = async () => {
    if (!settings?.id) return;
    const { error } = await supabase.from("site_settings").update({
      primary_analysis_year: selectedYear,
    } as any).eq("id", settings.id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Primary year set to ${selectedYear}`);
    queryClient.invalidateQueries({ queryKey: ["site_settings"] });
  };

  const addData = async () => {
    if (!newCat.trim()) return;
    const { error } = await supabase.from("analysis_data").insert({
      year: selectedYear, category: newCat, value: parseInt(newVal) || 0,
      icon: newIcon, sort_order: (analysisData?.length || 0) + 1,
    });
    if (error) { toast.error(error.message); return; }
    setNewCat(""); setNewVal("");
    toast.success("Data added!");
    queryClient.invalidateQueries({ queryKey: ["analysis_data", selectedYear] });
  };

  const deleteData = async (id: string) => {
    await supabase.from("analysis_data").delete().eq("id", id);
    toast.success("Deleted");
    queryClient.invalidateQueries({ queryKey: ["analysis_data", selectedYear] });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle>Analysis Data</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {allYears.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button
                variant={selectedYear === primaryYear ? "secondary" : "outline"}
                size="sm"
                onClick={setPrimaryYear}
                disabled={selectedYear === primaryYear}
              >
                {selectedYear === primaryYear ? "★ Primary" : "Set Primary"}
              </Button>
            </div>
          </div>
          {primaryYear && (
            <p className="text-xs text-muted-foreground">Primary year (shown first to visitors): <strong>{primaryYear}</strong></p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {(analysisData || []).map((d) => (
            <div key={d.id} className="flex items-center gap-2 p-3 border rounded">
              <div className="flex-1">
                <p className="font-medium">{d.category}: {d.value}</p>
                <p className="text-xs text-muted-foreground">icon: {d.icon}</p>
              </div>
              <Button variant="destructive" size="icon" onClick={() => confirm("Delete this analysis data?", () => deleteData(d.id))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="border-t pt-4 space-y-2">
            <Input placeholder="Category (e.g. Students)" value={newCat} onChange={(e) => setNewCat(e.target.value)} />
            <Input type="number" placeholder="Value" value={newVal} onChange={(e) => setNewVal(e.target.value)} />
            <Select value={newIcon} onValueChange={setNewIcon}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="users">Users</SelectItem>
                <SelectItem value="graduation-cap">Graduation Cap</SelectItem>
                <SelectItem value="bus">Bus</SelectItem>
                <SelectItem value="heart-handshake">Heart Handshake</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addData}><Plus className="h-4 w-4 mr-1" /> Add Data</Button>
          </div>
        </CardContent>
      </Card>
      <ConfirmDialog />
    </>
  );
};

const FooterLogosTab = () => {
  const { data: logos } = useFooterLogos();
  const queryClient = useQueryClient();
  const { confirm, ConfirmDialog } = useConfirm();
  const [name, setName] = useState("");

  const uploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const path = `footer-logos/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("site-images").upload(path, file);
    if (uploadError) { toast.error(uploadError.message); return; }
    const { data: { publicUrl } } = supabase.storage.from("site-images").getPublicUrl(path);
    const { error } = await supabase.from("footer_logos").insert({
      image_url: publicUrl, name: name || null, sort_order: (logos?.length || 0) + 1,
    });
    if (error) { toast.error(error.message); return; }
    setName("");
    toast.success("Logo added!");
    queryClient.invalidateQueries({ queryKey: ["footer_logos"] });
  };

  const deleteLogo = async (id: string) => {
    await supabase.from("footer_logos").delete().eq("id", id);
    toast.success("Deleted");
    queryClient.invalidateQueries({ queryKey: ["footer_logos"] });
  };

  return (
    <>
      <Card>
        <CardHeader><CardTitle>Footer Logos (Auto-scrolling)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
            {(logos || []).map((l) => (
              <div key={l.id} className="relative group text-center">
                <img src={l.image_url} alt={l.name || ""} className="w-full h-16 object-contain border rounded p-1" />
                {l.name && <p className="text-xs mt-1">{l.name}</p>}
                <Button
                  variant="destructive" size="icon"
                  className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition h-6 w-6"
                  onClick={() => confirm("Delete this logo?", () => deleteLogo(l.id))}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 space-y-2">
            <Input placeholder="Logo name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
            <Input type="file" accept="image/*" onChange={uploadLogo} />
          </div>
        </CardContent>
      </Card>
      <ConfirmDialog />
    </>
  );
};

export default Admin;
