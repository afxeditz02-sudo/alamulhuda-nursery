import { useState } from "react";
import { useSiteSettings, useNavMenuItems } from "@/hooks/useSiteData";
import { GraduationCap, Menu, X } from "lucide-react";

const Header = () => {
  const { data: settings } = useSiteSettings();
  const { data: navItems } = useNavMenuItems();
  const [menuOpen, setMenuOpen] = useState(false);

  const visibleItems = (navItems || []).filter((item) => item.is_visible);

  return (
    <header className="bg-primary text-primary-foreground shadow-lg relative">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 justify-center md:justify-start">
          {settings?.logo_url ? (
            <img src={settings.logo_url} alt="School Logo" className="h-14 w-14 rounded-full object-cover" />
          ) : (
            <div className="h-14 w-14 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <GraduationCap className="h-7 w-7" />
            </div>
          )}
          <h1 className="text-base md:text-2xl lg:text-3xl font-bold leading-tight">
            {settings?.school_name || "ALAMUL HUDA ENGLISH MEDIUM NURSERY SCHOOL"}
          </h1>
        </div>

        {visibleItems.length > 0 && (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-md hover:bg-primary-foreground/20 transition ml-2"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        )}
      </div>

      {/* Mobile/Hamburger dropdown */}
      {menuOpen && visibleItems.length > 0 && (
        <nav className="absolute top-full left-0 right-0 bg-primary border-t border-primary-foreground/20 shadow-lg z-50">
          <ul className="container mx-auto py-2">
            {visibleItems.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block px-6 py-3 hover:bg-primary-foreground/10 transition text-primary-foreground font-medium"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Header;
