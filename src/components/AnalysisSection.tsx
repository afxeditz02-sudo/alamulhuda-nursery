import { useState, useEffect, useRef } from "react";
import { useSiteSettings, useAnalysisData, useAnalysisYears } from "@/hooks/useSiteData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, GraduationCap, Bus, HeartHandshake } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  users: <Users className="h-10 w-10" />,
  "graduation-cap": <GraduationCap className="h-10 w-10" />,
  bus: <Bus className="h-10 w-10" />,
  "heart-handshake": <HeartHandshake className="h-10 w-10" />,
};

const Counter = ({ target }: { target: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const step = Math.max(1, Math.ceil(target / 60));
          const timer = setInterval(() => {
            start += step;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(start);
            }
          }, 20);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-4xl md:text-5xl font-bold text-primary">
      {count}+
    </div>
  );
};

const generateYears = () => {
  const years = [];
  for (let y = 2025; y <= 2035; y++) {
    years.push(`${y}-${String(y + 1).slice(2)}`);
  }
  return years;
};

const AnalysisSection = () => {
  const { data: settings } = useSiteSettings();
  const { data: dbYears } = useAnalysisYears();
  const allYears = generateYears();
  const [selectedYear, setSelectedYear] = useState("2025-26");
  const { data: analysisData } = useAnalysisData(selectedYear);

  return (
    <section id="analysis" className="py-16 bg-background">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">
          {settings?.analysis_heading || "ANALYSIS"}
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {(analysisData || []).map((item) => (
            <div
              key={item.id}
              className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow text-center"
            >
              <div className="flex justify-center mb-3 text-primary">
                {iconMap[item.icon || "users"] || <Users className="h-10 w-10" />}
              </div>
              <Counter target={item.value} />
              <p className="text-muted-foreground font-medium mt-2">{item.category}</p>
            </div>
          ))}
          {(!analysisData || analysisData.length === 0) && (
            <div className="col-span-full text-muted-foreground py-8">
              No data available for {selectedYear}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AnalysisSection;
