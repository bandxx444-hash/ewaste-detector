import Navbar from "@/components/Navbar";
import BackgroundOrbs from "@/components/BackgroundOrbs";
import HeroSection from "@/components/HeroSection";
import EWasteCrisisSection from "@/components/EWasteCrisisSection";

const Index = () => (
  <div className="min-h-screen relative">
    <BackgroundOrbs />
    <Navbar />
    <main className="container mx-auto px-4 max-w-5xl relative z-10">
      <HeroSection />
      <EWasteCrisisSection />
      <div className="h-20" />
    </main>
  </div>
);

export default Index;
