import { useSiteSettings, useFooterLogos } from "@/hooks/useSiteData";
import { imgUrl } from "@/lib/image";

const Footer = () => {
  const { data: settings } = useSiteSettings();
  const { data: logos } = useFooterLogos();
  const s = settings as any;

  return (
    <footer id="footer" className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-6 py-12 max-w-3xl">
        {/* School name / copyright */}
        <div className="text-center mb-10">
          <h2 className="text-base sm:text-lg font-semibold tracking-wide leading-snug">
            {s?.footer_copyright || "© ALAMUL HUDA ENGLISH MEDIUM NURSERY SCHOOL, Vettupara"}
          </h2>
        </div>

        {/* Logos */}
        {logos && logos.length > 0 && (
          <div className="mb-10">
            <div className="overflow-hidden">
              <div className="flex animate-marquee gap-10 items-center w-max">
                {[...logos, ...logos].map((logo, i) => (
                  <img
                    key={`${logo.id}-${i}`}
                    src={imgUrl(logo.image_url, 120)}
                    alt={logo.name || "Partner"}
                    width={40}
                    height={40}
                    loading="lazy"
                    decoding="async"
                    className="h-10 w-auto object-contain brightness-0 invert opacity-70"
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-primary-foreground/15 mb-8" />

        {/* Description paragraph */}
        {s?.footer_description && (
          <div className="text-center text-xs sm:text-sm text-primary-foreground/80 whitespace-pre-line leading-relaxed">
            {s.footer_description}
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
