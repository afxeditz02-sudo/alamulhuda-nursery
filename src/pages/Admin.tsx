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
import { LogOut, Plus, Trash2, Save, Home } from "lucide-react";
import ProgrammesTab from "@/components/admin/ProgrammesTab";
import TabsPagesTab from "@/components/admin/TabsPagesTab";
import UsersTab from "@/components/admin/UsersTab";
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

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }
    if (!loading && user) {
      // Check if user is removed
      supabase
        .from("profiles")
        .select("is_removed")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.is_removed) {
            setRemovedPopup(true);
          } else if (!isAdmin) {
            navigate("/auth");
          }
        });
    }
  }, [user, isAdmin, loading, navigate]);

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

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Admin Panel</h1>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigate("/")}>
            <Home className="h-4 w-4 mr-1" /> View Site
          </Button>
          <Button variant="secondary" size="sm" onClick={() => { signOut(); navigate("/"); }}>
            <LogOut className="h-4 w-4 mr-1" /> Sign Out
          </Button>
        </div>
      </header>
      <div className="container mx-auto p-4 max-w-5xl">
        <Tabs defaultValue="settings">
          <TabsList className="flex flex-wrap h-auto gap-1 mb-6">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="slider">Slider</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="programmes">Programmes</TabsTrigger>
            <TabsTrigger value="footer">Footer Logos</TabsTrigger>
            <TabsTrigger value="tabs-pages">Tabs/Pages</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="settings"><SiteSettingsTab /></TabsContent>
          <TabsContent value="features"><FeaturesTab /></TabsContent>
          <TabsContent value="slider"><SliderTab /></TabsContent>
          <TabsContent value="analysis"><AnalysisTab /></TabsContent>
          <TabsContent value="programmes"><ProgrammesTab /></TabsContent>
          <TabsContent value="footer"><FooterLogosTab /></TabsContent>
          <TabsContent value="tabs-pages"><TabsPagesTab /></TabsContent>
          <TabsContent value="users"><UsersTab /></TabsContent>
        </Tabs>
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
    <Card>
      <CardHeader><CardTitle>Features</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {(features || []).map((f) => (
          <div key={f.id} className="flex items-center gap-2 p-3 border rounded">
            <div className="flex-1">
              <p className="font-medium">{f.title}</p>
              {f.description && <p className="text-sm text-muted-foreground">{f.description}</p>}
            </div>
            <Button variant="destructive" size="icon" onClick={() => deleteFeature(f.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <div className="border-t pt-4 space-y-2">
          <Input placeholder="Feature title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
          <Input placeholder="Description (optional)" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
          <Button onClick={addFeature}><Plus className="h-4 w-4 mr-1" /> Add Feature</Button>
        </div>
      </CardContent>
    </Card>
  );
};

const SliderTab = () => {
  const { data: slides } = useSliderImages();
  const queryClient = useQueryClient();

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
                onClick={() => deleteSlide(s.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
        <Input type="file" accept="image/*" onChange={uploadSlide} />
      </CardContent>
    </Card>
  );
};

const AnalysisTab = () => {
  const allYears = generateYears();
  const [selectedYear, setSelectedYear] = useState("2025-26");
  const { data: analysisData } = useAnalysisData(selectedYear);
  const queryClient = useQueryClient();
  const [newCat, setNewCat] = useState("");
  const [newVal, setNewVal] = useState("");
  const [newIcon, setNewIcon] = useState("users");

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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Analysis Data</CardTitle>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              {allYears.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {(analysisData || []).map((d) => (
          <div key={d.id} className="flex items-center gap-2 p-3 border rounded">
            <div className="flex-1">
              <p className="font-medium">{d.category}: {d.value}</p>
              <p className="text-xs text-muted-foreground">icon: {d.icon}</p>
            </div>
            <Button variant="destructive" size="icon" onClick={() => deleteData(d.id)}>
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
  );
};

// ProgrammesTab moved to src/components/admin/ProgrammesTab.tsx

const FooterLogosTab = () => {
  const { data: logos } = useFooterLogos();
  const queryClient = useQueryClient();
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
                onClick={() => deleteLogo(l.id)}
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
  );
};

export default Admin;
