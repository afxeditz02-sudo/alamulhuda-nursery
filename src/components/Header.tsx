import { useSiteSettings } from "@/hooks/useSiteData";
import { GraduationCap } from "lucide-react";

const Header = () => {
  const { data: settings } = useSiteSettings();

  return (
    <header className="bg-primary text-primary-foreground shadow-lg">
      <div className="container mx-auto px-4 py-4 flex items-center justify-center gap-4">
        {settings?.logo_url ? (
          <img src={settings.logo_url} alt="School Logo" className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <div className="h-16 w-16 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <GraduationCap className="h-8 w-8" />
          </div>
        )}
        <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-center leading-tight">
          {settings?.school_name || "ALAMUL HUDA ENGLISH MEDIUM NURSERY SCHOOL"}
        </h1>
      </div>
    </header>
  );
};

export default Header;
