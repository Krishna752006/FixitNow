import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import ServicesSection from "@/components/ServicesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ProfessionalInvitationSection from "@/components/ProfessionalInvitationSection";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background w-full overflow-x-hidden">
      <Navigation />
      <main className="w-full">
        <HeroSection />
        <HowItWorksSection />
        <ServicesSection />
        <TestimonialsSection />
        <ProfessionalInvitationSection />
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
