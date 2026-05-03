import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { imgUrl } from "@/lib/image";
import { isSafeUrl } from "@/lib/utils";

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

const BannerSlider = () => {
  const { data: banners } = useBanners();
  const now = new Date();

  const activeBanners = (banners || []).filter((b) => {
    if (!b.is_published) return false;
    if (b.starts_at && new Date(b.starts_at) > now) return false;
    if (b.ends_at && new Date(b.ends_at) < now) return false;
    return true;
  });

  if (activeBanners.length === 0) return null;

  if (activeBanners.length === 1) {
    const b = activeBanners[0];
    const img = (
      <img
        src={imgUrl(b.image_url, 1400)}
        alt="Banner"
        className="w-full h-auto object-contain"
        loading="eager"
        fetchPriority="high"
        decoding="async"
      />
    );
    return (
      <section className="w-full">
        {b.link_url ? (
          <a href={b.link_url} target="_blank" rel="noopener noreferrer">{img}</a>
        ) : img}
      </section>
    );
  }

  return (
    <section className="w-full">
      <Carousel
        opts={{ loop: true }}
        plugins={[Autoplay({ delay: 4000, stopOnInteraction: true })]}
        className="w-full"
      >
        <CarouselContent className="ml-0">
          {activeBanners.map((b, idx) => {
            const img = (
              <img
                src={imgUrl(b.image_url, 1400)}
                alt="Banner"
                className="w-full h-auto object-contain"
                loading={idx === 0 ? "eager" : "lazy"}
                fetchPriority={idx === 0 ? "high" : "auto"}
                decoding="async"
              />
            );
            return (
              <CarouselItem key={b.id} className="pl-0">
                {b.link_url ? (
                  <a href={b.link_url} target="_blank" rel="noopener noreferrer">{img}</a>
                ) : img}
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
    </section>
  );
};

export default BannerSlider;
