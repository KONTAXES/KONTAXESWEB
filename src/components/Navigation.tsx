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
    { label: 'Equipo', id: 'equipo' },
    { label: 'Clientes', id: 'clientes' },
    { label: 'Alianzas', id: 'alianzas' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled
        ? `${isDark ? 'bg-gray-950/90' : 'bg-white/95'} backdrop-blur-xl border-b ${isDark ? 'border-white/5 shadow-black/20' : 'border-black/6 shadow-black/8'} shadow-2xl`
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="#" className="flex-shrink-0">
            <img src="/K_white.png" alt="KONTAXES" className="logo-dark h-10 w-auto" />
            <img src="/K_black.png" alt="KONTAXES" className="logo-light h-10 w-auto" />
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-black/5'}`}
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
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${isDark ? 'bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white' : 'bg-black/5 border border-black/10 hover:bg-black/10 text-gray-600 hover:text-gray-900'}`}>
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
        <div className={`md:hidden backdrop-blur-xl border-t ${isDark ? 'bg-gray-950/95 border-white/5' : 'bg-white/98 border-black/6'}`}>
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
