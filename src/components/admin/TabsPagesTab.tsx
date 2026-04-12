import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Star, Image, BarChart3, BookOpen, ImageIcon, Layout } from "lucide-react";

const adminTabs = [
  { id: "settings", label: "Settings", icon: Settings, description: "School name, tagline, logo, admission text, footer text fields" },
  { id: "features", label: "Features", icon: Star, description: "School feature cards displayed on the homepage" },
  { id: "slider", label: "Slider", icon: Image, description: "Admission slider images for the hero carousel" },
  { id: "analysis", label: "Analysis", icon: BarChart3, description: "Yearly statistics — students, teachers, buses, etc." },
  { id: "programmes", label: "Programmes", icon: BookOpen, description: "Programmes/news with media, scheduling & publishing" },
  { id: "footer", label: "Footer Logos", icon: ImageIcon, description: "Auto-scrolling partner/sponsor logos in the footer" },
];

const sitePages = [
  { path: "/", label: "Home", description: "Main landing page with all sections" },
  { path: "/auth", label: "Auth", description: "Admin Google Sign-in page" },
  { path: "/admin", label: "Admin Panel", description: "Content management dashboard (admin only)" },
];

const TabsPagesTab = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Layout className="h-5 w-5" /> Site Pages</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {sitePages.map((page) => (
            <div key={page.path} className="flex items-center gap-3 p-3 border rounded-lg">
              <Badge variant="outline" className="font-mono text-xs shrink-0">{page.path}</Badge>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{page.label}</p>
                <p className="text-sm text-muted-foreground">{page.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

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
