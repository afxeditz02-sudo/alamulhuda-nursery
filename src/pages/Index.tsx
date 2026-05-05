import { useEffect } from "react";
import Header from "@/components/Header";
import LiveStreamBanner from "@/components/LiveStreamBanner";
import BannerSlider from "@/components/BannerSlider";
import FeaturesSection from "@/components/FeaturesSection";
import AdmissionSlider from "@/components/AdmissionSlider";
import AnalysisSection from "@/components/AnalysisSection";
import ProgrammesSection from "@/components/ProgrammesSection";
import Footer from "@/components/Footer";
import { useSiteSettings, useSliderImages } from "@/hooks/useSiteData";

const Index = () => {
  const settings = useSiteSettings();
  const slider = useSliderImages();
  const ready = !settings.isLoading && !slider.isLoading;

  useEffect(() => {
    if (!ready) return;
    const el = document.getElementById("initial-loader");
    if (el) el.remove();
  }, [ready]);

  return (
    <div className="min-h-screen" style={{ visibility: ready ? "visible" : "hidden" }}>
      <Header />
      <BannerSlider />
      <LiveStreamBanner />
      <FeaturesSection />
      <AdmissionSlider />
      <AnalysisSection />
      <ProgrammesSection />
      <Footer />
    </div>
  );
};

export default Index;
