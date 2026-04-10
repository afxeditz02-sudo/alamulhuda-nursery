import { useState, useEffect, useCallback } from "react";
import { useSiteSettings, useSliderImages } from "@/hooks/useSiteData";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const AdmissionSlider = () => {
  const { data: settings } = useSiteSettings();
  const { data: slides } = useSliderImages();
  const [current, setCurrent] = useState(0);

  const hasSlides = slides && slides.length > 0;

  const next = useCallback(() => {
    if (hasSlides) setCurrent((c) => (c + 1) % slides!.length);
  }, [hasSlides, slides]);

  const prev = useCallback(() => {
    if (hasSlides) setCurrent((c) => (c - 1 + slides!.length) % slides!.length);
  }, [hasSlides, slides]);

  useEffect(() => {
    if (!hasSlides) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next, hasSlides]);

  return (
    <section className="py-16 bg-primary/5">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-8">
          {settings?.admission_heading || "ADMISSION"}
        </h2>

        {hasSlides ? (
          <div className="relative max-w-4xl mx-auto overflow-hidden rounded-2xl shadow-xl">
            <div
              className="flex transition-transform duration-500"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {slides!.map((slide) => (
                <div key={slide.id} className="min-w-full">
                  <img
                    src={slide.image_url}
                    alt={slide.heading || "Admission"}
                    className="w-full h-64 md:h-96 object-cover"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-primary/80 text-primary-foreground rounded-full p-2 hover:bg-primary transition"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary/80 text-primary-foreground rounded-full p-2 hover:bg-primary transition"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {slides!.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2.5 w-2.5 rounded-full transition ${i === current ? "bg-primary" : "bg-primary/30"}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-dashed border-primary/30 h-64 md:h-96 flex items-center justify-center">
            <p className="text-muted-foreground">No slider images yet. Admin can add them.</p>
          </div>
        )}

        <p className="text-lg text-muted-foreground mt-8">
          {settings?.admission_text || "to get more info and admission"}
        </p>
        <Button size="lg" className="mt-4 text-lg px-8 font-bold">
          {settings?.admission_button_text || "CLICK HERE"}
        </Button>
      </div>
    </section>
  );
};

export default AdmissionSlider;
