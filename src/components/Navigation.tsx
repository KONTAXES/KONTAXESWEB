import React, { useEffect, useState } from 'react';
import { MenuIcon, XIcon, SunIcon, MoonIcon } from 'lucide-react';

interface NavigationProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export function Navigation({ isDark, toggleTheme }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  const menuItems = [
    { label: 'Servicios', id: 'servicios' },
    { label: 'Cotizador', id: 'cotizador' },
    { label: 'Herramientas', id: 'herramientas' },
    { label: 'Equipo', id: 'equipo' },
    { label: 'Clientes', id: 'clientes' },
    { label: 'Próximamente', id: 'proximamente' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled ? 'bg-gray-950/90 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-black/20' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="#" className="flex-shrink-0">
            <img src="/K_V4-2.png" alt="KONTAXES" className="h-10 w-auto" />
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <a href="https://app.kontaxes.com" target="_blank" rel="noopener noreferrer"
              className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-lg text-sm hover:from-emerald-400 hover:to-teal-400 transition-all duration-200 shadow-lg hover:-translate-y-0.5">
              APP
            </a>
            <a href="https://odoo.kontaxes.com" target="_blank" rel="noopener noreferrer"
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold rounded-lg text-sm hover:from-purple-500 hover:to-violet-500 transition-all duration-200 shadow-lg hover:-translate-y-0.5">
              ODOO
            </a>
            <button onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-gray-400 hover:text-white">
              {isDark ? <SunIcon size={16} /> : <MoonIcon size={16} />}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <a href="https://app.kontaxes.com" target="_blank" rel="noopener noreferrer"
              className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-lg text-xs">APP</a>
            <a href="https://odoo.kontaxes.com" target="_blank" rel="noopener noreferrer"
              className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold rounded-lg text-xs">ODOO</a>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300">
              {isMobileMenuOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-950/95 backdrop-blur-xl border-t border-white/5">
          <div className="px-4 py-4 space-y-1">
            {menuItems.map((item) => (
              <button key={item.id} onClick={() => scrollToSection(item.id)}
                className="block w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
