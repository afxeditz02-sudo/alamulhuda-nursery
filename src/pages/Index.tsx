import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import LiveStreamBanner from "@/components/LiveStreamBanner";
import BannerSlider from "@/components/BannerSlider";
import FeaturesSection from "@/components/FeaturesSection";
import AdmissionSlider from "@/components/AdmissionSlider";
import AnalysisSection from "@/components/AnalysisSection";
import ProgrammesSection from "@/components/ProgrammesSection";
import Footer from "@/components/Footer";
import { useSiteSettings, useLiveStreams } from "@/hooks/useSiteData";
import { GraduationCap } from "lucide-react";

const useBannersForGate = () =>
  useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const { data, error } = await supabase.from("banners").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

const Index = () => {
  const settings = useSiteSettings();
  const banners = useBannersForGate();
  const streams = useLiveStreams();

  const isInitialLoading =
    settings.isLoading || banners.isLoading || streams.isLoading;

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
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
