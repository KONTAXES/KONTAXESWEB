import React, { useEffect, useState } from 'react';
import { useTheme } from './hooks/useTheme';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { QuotationCalculator } from './components/QuotationCalculator';
import { Team } from './components/Team';
import { Clients } from './components/Clients';
import { Alianzas } from './components/Alianzas';
import { Footer } from './components/Footer';
import { GlobalBackground } from './components/GlobalBackground';
import { Recursos } from './components/Recursos';
import { PresentationViewer } from './components/PresentationViewer';
import { PequenioContribuyenteSlides } from './components/slides/PequenioContribuyenteSlides';
import { generateWorkshopPDF } from './utils/workshopPDFGenerator';

const PRESENTATIONS: Record<string, { slides: React.FC[]; title: string; subtitle: string }> = {
  'pequeno-contribuyente': {
    slides: PequenioContribuyenteSlides,
    title: 'Declaración de Impuestos',
    subtitle: 'Pequeño Contribuyente',
  },
};

export function App() {
  const { isDark, toggleTheme } = useTheme();
  const [activePresentationId, setActivePresentationId] = useState<string | null>(null);

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('visible');
        });
      },
      { threshold: 0.08 }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const activePresentation = activePresentationId ? PRESENTATIONS[activePresentationId] : null;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-950 text-gray-100' : 'bg-slate-50 text-slate-900'}`}>
      <GlobalBackground />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navigation isDark={isDark} toggleTheme={toggleTheme} />
        <Hero />
        <Services />
        <QuotationCalculator />
        <Recursos isDark={isDark} onOpen={(id) => setActivePresentationId(id)} />
        <Team />
        <Clients />
        <Alianzas />
        <Footer />
      </div>

      {activePresentation && (
        <PresentationViewer
          slideComponents={activePresentation.slides}
          title={activePresentation.title}
          subtitle={activePresentation.subtitle}
          isDark={isDark}
          onClose={() => setActivePresentationId(null)}
          onDownloadPDF={generateWorkshopPDF}
        />
      )}
    </div>
  );
}
