import Header from "@/components/Header";
import FeaturesSection from "@/components/FeaturesSection";
import AdmissionSlider from "@/components/AdmissionSlider";
import AnalysisSection from "@/components/AnalysisSection";
import ProgrammesSection from "@/components/ProgrammesSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <FeaturesSection />
      <AdmissionSlider />
      <AnalysisSection />
      <ProgrammesSection />
      <Footer />
    </div>
  );
};

export default Index;
