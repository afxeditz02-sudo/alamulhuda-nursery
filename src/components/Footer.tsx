import { useSiteSettings, useFooterLogos } from "@/hooks/useSiteData";

const Footer = () => {
  const { data: settings } = useSiteSettings();
  const { data: logos } = useFooterLogos();

  return (
    <footer className="bg-primary text-primary-foreground py-10">
      <div className="container mx-auto px-4 text-center space-y-4">
        <p className="text-lg font-bold">
          {settings?.footer_copyright || "© ALAMUL HUDA ENGLISH MEDIUM NURSERY SCHOOL, Vettupara"}
        </p>

        <p className="text-primary-foreground/80">
          {settings?.footer_managed_by || "managed by"}
        </p>

        {logos && logos.length > 0 && (
          <div className="overflow-hidden py-4">
            <div className="flex animate-marquee gap-12 items-center w-max">
              {[...logos, ...logos].map((logo, i) => (
                <img
                  key={`${logo.id}-${i}`}
                  src={logo.image_url}
                  alt={logo.name || "Partner"}
                  className="h-12 w-auto object-contain brightness-0 invert opacity-80"
                />
              ))}
            </div>
          </div>
        )}

        <p className="text-primary-foreground/90 font-semibold">
          {settings?.footer_estd || "estd :2006"}
        </p>
        <p className="text-primary-foreground/80">
          {settings?.footer_reg || "Reg:2010APS137 and ph:8606791846"}
        </p>
        <p className="text-primary-foreground/80">
          {settings?.footer_under || "in under: Association of samastha minority institution(ASMI)"}
        </p>
        <p className="text-primary-foreground/90 font-semibold">
          {settings?.footer_run_by || "run by : ALAMUL HUDA MADRASA COMMITTEE, VETTUPARA"}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
