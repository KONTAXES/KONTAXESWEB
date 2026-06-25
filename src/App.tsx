import React, { useEffect } from 'react';
import { useTheme } from './hooks/useTheme';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { QuotationCalculator } from './components/QuotationCalculator';
import { Tools } from './components/Tools';
import { Team } from './components/Team';
import { Clients } from './components/Clients';
import { ComingSoon } from './components/ComingSoon';
import { AppPromo } from './components/AppPromo';
import { Footer } from './components/Footer';

export function App() {
  const { isDark, toggleTheme } = useTheme();

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

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 transition-colors duration-300">
      <Navigation isDark={isDark} toggleTheme={toggleTheme} />
      <Hero />
      <Services />
      <QuotationCalculator />
      <Tools />
      <AppPromo />
      <Team />
      <Clients />
      <ComingSoon />
      <Footer />
    </div>
  );
}
