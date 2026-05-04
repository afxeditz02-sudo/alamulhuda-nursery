import { useEffect, useState } from "react";
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

  // Consider a query "settled" if it has data, errored, or finished fetching.
  const settled = (q: { isLoading: boolean; isError: boolean; data: unknown }) =>
    !q.isLoading || q.isError || q.data !== undefined;

  const allSettled = settled(settings) && settled(banners) && settled(streams);

  // Hard cap: never block the page longer than 1.5s
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 1500);
    return () => clearTimeout(t);
  }, []);

  if (!allSettled && !timedOut) {
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
