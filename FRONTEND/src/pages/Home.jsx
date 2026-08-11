import React from 'react';
import TrustedBySection from '../components/home/TrustedBySection';
import AboutSection from '../components/home/AboutSection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import FlagshipModelsSection from '../components/home/FlagshipModelsSection';
import ServicesSection from '../components/home/ServicesSection';
import CtaSection from '../components/home/CtaSection';

export default function Home({ onOpenQuoteModal }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <TrustedBySection />
      <AboutSection />
      <TestimonialsSection />
      <FlagshipModelsSection onOpenQuoteModal={onOpenQuoteModal} />
      <ServicesSection />
      <CtaSection onOpenQuoteModal={onOpenQuoteModal} />
    </div>
  );
}
