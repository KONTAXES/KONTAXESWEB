import React, { useEffect, useState, useRef } from 'react';
import { MenuIcon, XIcon, SunIcon, MoonIcon } from 'lucide-react';

interface NavigationProps {
  isDark: boolean;
  toggleTheme: () => void;
}

const menuItems = [
  { label: 'Servicios',  id: 'servicios'  },
  { label: 'Cotizador',  id: 'cotizador'  },
  { label: 'Equipo',     id: 'equipo'     },
  { label: 'Clientes',   id: 'clientes'   },
  { label: 'Alianzas',   id: 'alianzas'   },
];

export function Navigation({ isDark, toggleTheme }: NavigationProps) {
  const [isScrolled,       setIsScrolled]       = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection,    setActiveSection]    = useState('');
  const [pill, setPill] = useState({ left: 0, width: 0, visible: false });

  const containerRef = useRef<HTMLDivElement>(null);
  const btnRefs      = useRef<Record<string, HTMLButtonElement | null>>({});

  /* ── Navbar background on scroll ─────────────────────────────── */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Scroll spy ───────────────────────────────────────────────── */
  useEffect(() => {
    const visible: Record<string, number> = {};

    const pick = () => {
      const best = Object.entries(visible).sort((a, b) => b[1] - a[1])[0];
      setActiveSection(best?.[0] ?? '');
    };

    const observers = menuItems.map(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) visible[id] = entry.intersectionRatio;
          else delete visible[id];
          pick();
        },
        { threshold: [0, 0.15, 0.4], rootMargin: '-72px 0px -40% 0px' },
      );
      obs.observe(el);
      return obs;
    });

    return () => observers.forEach(o => o?.disconnect());
  }, []);

  /* ── Pill position ────────────────────────────────────────────── */
  useEffect(() => {
    const btn  = btnRefs.current[activeSection];
    const wrap = containerRef.current;
    if (!btn || !wrap) { setPill(p => ({ ...p, visible: false })); return; }
    const wRect = wrap.getBoundingClientRect();
    const bRect = btn.getBoundingClientRect();
    setPill({ left: bRect.left - wRect.left, width: bRect.width, visible: true });
  }, [activeSection]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

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

          {/* Desktop menu */}
          <div ref={containerRef} className="hidden md:flex items-center gap-1 relative">

            {/* Sliding active pill */}
            <span
              aria-hidden
              className="absolute rounded-lg bg-gradient-to-r from-purple-600/25 to-violet-600/25 border border-purple-500/30 pointer-events-none"
              style={{
                left:    pill.left,
                width:   pill.width,
                top:     4,
                bottom:  4,
                opacity: pill.visible ? 1 : 0,
                transition: 'left 280ms cubic-bezier(.4,0,.2,1), width 280ms cubic-bezier(.4,0,.2,1), opacity 180ms ease',
              }}
            />

            {menuItems.map(({ label, id }) => {
              const active = activeSection === id;
              return (
                <button
                  key={id}
                  ref={el => { btnRefs.current[id] = el; }}
                  onClick={() => scrollTo(id)}
                  className={`
                    relative px-4 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200
                    hover:-translate-y-0.5
                    ${active
                      ? isDark ? 'text-white' : 'text-gray-900'
                      : isDark
                        ? 'text-gray-400 hover:text-white hover:bg-white/5'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-black/5'
                    }
                  `}
                >
                  {label}
                  {/* Hover glow dot */}
                  <span className={`
                    absolute bottom-1 left-1/2 -translate-x-1/2
                    w-1 h-1 rounded-full bg-purple-400
                    transition-all duration-200
                    ${active ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
                  `} />
                </button>
              );
            })}
          </div>

          {/* Right CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <a href="https://app.kontaxes.com" target="_blank" rel="noopener noreferrer"
              className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-lg text-sm hover:from-emerald-400 hover:to-teal-400 transition-all duration-200 shadow-lg hover:-translate-y-0.5 hover:shadow-emerald-500/25">
              APP
            </a>
            <a href="https://odoo.kontaxes.com" target="_blank" rel="noopener noreferrer"
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold rounded-lg text-sm hover:from-purple-500 hover:to-violet-500 transition-all duration-200 shadow-lg hover:-translate-y-0.5 hover:shadow-purple-500/25">
              ODOO
            </a>
            <button onClick={toggleTheme}
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 hover:-translate-y-0.5
                ${isDark
                  ? 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-gray-400 hover:text-white'
                  : 'bg-black/5 border border-black/10 hover:bg-black/10 hover:border-black/20 text-gray-600 hover:text-gray-900'
                }`}>
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
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all">
              {isMobileMenuOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className={`md:hidden backdrop-blur-xl border-t ${isDark ? 'bg-gray-950/95 border-white/5' : 'bg-white/98 border-black/6'}`}>
          <div className="px-4 py-4 space-y-1">
            {menuItems.map(({ label, id }) => {
              const active = activeSection === id;
              return (
                <button key={id} onClick={() => scrollTo(id)}
                  className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                    ${active
                      ? 'text-white bg-purple-600/20 border border-purple-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}>
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-200 ${active ? 'bg-purple-400 scale-100' : 'bg-gray-600 scale-75'}`} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
