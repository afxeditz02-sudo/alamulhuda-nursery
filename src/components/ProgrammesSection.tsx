import { useState, useEffect } from "react";
import { useSiteSettings, useProgrammes } from "@/hooks/useSiteData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageIcon, FileText, Film } from "lucide-react";

const generateYears = () => {
  const years = [];
  for (let y = 2025; y <= 2035; y++) {
    years.push(`${y}-${String(y + 1).slice(2)}`);
  }
  return years;
};

type MediaItem = { url: string; type: "image" | "video" | "file"; name: string };

const ProgrammesSection = () => {
  const { data: settings } = useSiteSettings();
  const allYears = generateYears();
  const primaryYear = (settings as any)?.primary_programmes_year || "2025-26";
  const [selectedYear, setSelectedYear] = useState(primaryYear);
  const { data: programmes } = useProgrammes(selectedYear);

  useEffect(() => {
    if ((settings as any)?.primary_programmes_year) {
      setSelectedYear((settings as any).primary_programmes_year);
    }
  }, [(settings as any)?.primary_programmes_year]);

  const now = new Date();
  const visibleProgrammes = (programmes || []).filter((p) => {
    if (p.is_published === false) return false;
    if (p.scheduled_at && new Date(p.scheduled_at) > now) return false;
    return true;
  });

  return (
    <section id="programmes" className="py-16 bg-primary/5">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">
          {settings?.programmes_heading || "PROGRAMMES"}
        </h2>
        <div className="flex justify-center mb-10">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allYears.map((y) => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {visibleProgrammes.map((prog) => {
            const media: MediaItem[] = Array.isArray(prog.media) ? (prog.media as any) : [];

            return (
              <Card key={prog.id} className="overflow-hidden hover:shadow-lg transition-shadow text-left">
                {prog.image_url ? (
                  <img src={prog.image_url} alt={prog.title} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-muted flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{prog.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {prog.description && (
                    <CardDescription className="mb-3">{prog.description}</CardDescription>
                  )}
                  {/* Media files */}
                  {media.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {media.filter(m => m.type !== "image").map((m, i) => (
                        <a key={i} href={m.url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs border rounded px-2 py-1 hover:bg-muted transition">
                          {m.type === "video" ? <Film className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                          {m.name}
                        </a>
                      ))}
                    </div>
                  )}
                  {/* Inline videos */}
                  {media.filter(m => m.type === "video").map((m, i) => (
                    <video key={i} controls className="w-full rounded mb-2" preload="metadata">
                      <source src={m.url} />
                    </video>
                  ))}
                  {prog.see_more_url && (
                    <Button variant="link" className="p-0" asChild>
                      <a href={prog.see_more_url} target="_blank" rel="noopener noreferrer">
                        See more →
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
          {visibleProgrammes.length === 0 && (
            <div className="col-span-full text-muted-foreground py-8">
              No programmes available for {selectedYear}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProgrammesSection;
