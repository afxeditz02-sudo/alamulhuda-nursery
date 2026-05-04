import Header from "@/components/Header";
import LiveStreamBanner from "@/components/LiveStreamBanner";
import BannerSlider from "@/components/BannerSlider";
import FeaturesSection from "@/components/FeaturesSection";
import AdmissionSlider from "@/components/AdmissionSlider";
import AnalysisSection from "@/components/AnalysisSection";
import ProgrammesSection from "@/components/ProgrammesSection";
import Footer from "@/components/Footer";

const Index = () => {
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
