import { useSiteSettings, useFooterLogos } from "@/hooks/useSiteData";
import { imgUrl } from "@/lib/image";

const Footer = () => {
  const { data: settings } = useSiteSettings();
  const { data: logos } = useFooterLogos();

  return (
    <footer id="footer" className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-6 py-12 max-w-3xl">
        {/* School name */}
        <div className="text-center mb-10">
          <h2 className="text-base sm:text-lg font-semibold tracking-wide leading-snug">
            {settings?.footer_copyright || "© ALAMUL HUDA ENGLISH MEDIUM NURSERY SCHOOL, Vettupara"}
          </h2>
        </div>

        {/* Managed by + logos */}
        {logos && logos.length > 0 && (
          <div className="mb-10">
            <p className="text-center text-xs uppercase tracking-[0.2em] text-primary-foreground/60 mb-5">
              {settings?.footer_managed_by || "managed by"}
            </p>
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

        {/* Info */}
        <div className="text-center space-y-1.5 text-xs sm:text-sm text-primary-foreground/75">
          <p>
            <span className="text-primary-foreground/90 font-medium">{settings?.footer_estd || "Estd. 2006"}</span>
            <span className="mx-2 text-primary-foreground/40">·</span>
            <span>{settings?.footer_reg || "Reg: 2010APS137"}</span>
            <span className="mx-2 text-primary-foreground/40">·</span>
            <span>Ph: 8606791846</span>
          </p>
          <p>{settings?.footer_under || "Under: Association of Samastha Minority Institution (ASMI)"}</p>
          <p className="text-primary-foreground/90 pt-2">
            {settings?.footer_run_by || "Run by Alamul Huda Madrasa Committee, Vettupara"}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
