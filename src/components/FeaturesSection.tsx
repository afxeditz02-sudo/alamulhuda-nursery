import { useSiteSettings, useFeatures } from "@/hooks/useSiteData";
import { CheckCircle } from "lucide-react";

const FeaturesSection = () => {
  const { data: settings } = useSiteSettings();
  const { data: features } = useFeatures();

  return (
    <section id="features" className="py-16 bg-background">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">
          {settings?.features_heading || "ALAMUL HUDA"}
        </h2>
        <p className="text-muted-foreground text-lg italic mb-10">
          {settings?.tagline || "knowledge enlivens the soul"}
        </p>
        <div className="max-w-2xl mx-auto space-y-4">
          {(features || []).map((feature) => (
            <div
              key={feature.id}
              className="flex items-start gap-3 text-left p-4 rounded-lg bg-card border shadow-sm hover:shadow-md transition-shadow"
            >
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-card-foreground">{feature.title}</p>
                {feature.description && (
                  <p className="text-muted-foreground text-sm mt-1">{feature.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
