import { Hero } from "../components/home/Hero";
import { WhyDubai } from "../components/home/WhyDubai";
import { FeaturedProjects } from "../components/home/FeaturedProjects";
import { AboutTeaser } from "../components/home/AboutTeaser";
import { ServicesSection } from "../components/home/ServicesSection";
import { StatsSection } from "../components/home/StatsSection";
import { PartnersMarquee } from "../components/home/PartnersMarquee";
import { InvestmentCalculator } from "../components/home/InvestmentCalculator";
import { TestimonialsSection } from "../components/home/TestimonialsSection";
import { FinalCta } from "../components/home/FinalCta";

export default function Home() {
  return (
    <>
      <Hero />
      <WhyDubai />
      <FeaturedProjects />
      <AboutTeaser />
      <ServicesSection />
      <StatsSection />
      <PartnersMarquee />
      <InvestmentCalculator />
      <TestimonialsSection />
      <FinalCta />
    </>
  );
}
