import React, { useState, useEffect, useRef } from 'react';
import { BrainCircuitIcon, PackageIcon, TrendingUpIcon, ZapIcon, ArrowRightIcon, CheckIcon } from 'lucide-react';

const OdooIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
    <circle cx="20" cy="20" r="18" fill="#714B67" />
    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="sans-serif">Odoo</text>
  </svg>
);

const ClaudeIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
    <circle cx="20" cy="20" r="18" fill="#CC785C" />
    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="sans-serif">Claude</text>
  </svg>
);

const techs = [
  {
    id: 'odoo',
    name: 'Odoo',
    tagline: 'ERP #1 del Mundo',
    icon: OdooIcon,
    color: 'purple',
    borderColor: 'border-purple-500/40',
    bgColor: 'bg-purple-500/8',
    glowColor: 'bg-purple-600/20',
    textColor: 'text-purple-400',
    badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    description: 'Plataforma ERP integral que gestiona contabilidad, facturación, inventario y más en un solo sistema. Trabajamos con Odoo 19.',
    features: ['Contabilidad en tiempo real', 'Facturación electrónica SAT', 'Reportes financieros', 'Multi-empresa & Multi-moneda'],
  },
  {
    id: 'claude',
    name: 'IA · Claude',
    tagline: 'Inteligencia Artificial',
    icon: ClaudeIcon,
    color: 'orange',
    borderColor: 'border-orange-500/40',
    bgColor: 'bg-orange-500/8',
    glowColor: 'bg-orange-600/20',
    textColor: 'text-orange-400',
    badgeColor: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    description: 'Integramos Claude de Anthropic para análisis financiero inteligente, automatización de procesos contables y asistencia experta 24/7.',
    features: ['Análisis financiero automático', 'Clasificación de transacciones', 'Asistente contable IA', 'Detección de anomalías'],
  },
  {
    id: 'modules',
    name: 'Módulos Propios',
    tagline: 'Desarrollo Personalizado',
    icon: PackageIcon,
    color: 'violet',
    borderColor: 'border-violet-500/40',
    bgColor: 'bg-violet-500/8',
    glowColor: 'bg-violet-600/20',
    textColor: 'text-violet-400',
    badgeColor: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    description: 'Módulos desarrollados a medida para el mercado guatemalteco: cumplimiento SAT, libros de IVA, RTU y reportes locales.',
    features: ['Cumplimiento SAT Guatemala', 'Libros de IVA automatizados', 'Integración RTU', 'Reportes contables locales'],
  },
  {
    id: 'finanzIA',
    name: 'FinanzIA',
    tagline: 'Finanzas Inteligentes',
    icon: TrendingUpIcon,
    color: 'emerald',
    borderColor: 'border-emerald-500/40',
    bgColor: 'bg-emerald-500/8',
    glowColor: 'bg-emerald-600/20',
    textColor: 'text-emerald-400',
    badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    description: 'Nuestra plataforma propia de análisis financiero con IA: dashboards predictivos, proyecciones de flujo de caja y alertas inteligentes.',
    features: ['Dashboards predictivos', 'Proyección de flujo de caja', 'Alertas de riesgo financiero', 'Reportes ejecutivos automáticos'],
  },
];

function ConnectionLine({ active }: { active: boolean }) {
  return (
    <div className={`hidden lg:flex items-center justify-center w-8 flex-shrink-0 transition-all duration-500 ${active ? 'opacity-100' : 'opacity-30'}`}>
      <div className="relative w-full h-px">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/60 to-violet-500/60" />
        <div className={`absolute inset-0 bg-gradient-to-r from-purple-400 to-violet-400 transition-all duration-700 ${active ? 'opacity-100' : 'opacity-0'}`}
          style={{ animation: active ? 'pulse 1.5s ease-in-out infinite' : 'none' }} />
      </div>
    </div>
  );
}

export function TechStack() {
  const [active, setActive] = useState<string>('odoo');
  const [animating, setAnimating] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cycleNext = () => {
    setAnimating(true);
    setTimeout(() => {
      setActive(prev => {
        const idx = techs.findIndex(t => t.id === prev);
        return techs[(idx + 1) % techs.length].id;
      });
      setAnimating(false);
    }, 200);
  };

  useEffect(() => {
    intervalRef.current = setInterval(cycleNext, 4000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const handleSelect = (id: string) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setAnimating(true);
    setTimeout(() => { setActive(id); setAnimating(false); }, 150);
    intervalRef.current = setInterval(cycleNext, 4000);
  };

  const activeTech = techs.find(t => t.id === active)!;

  return (
    <section id="techstack" className="py-20 bg-gray-950 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-purple-900/10 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-900/8 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-14 reveal">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
            <ZapIcon size={12} className="text-yellow-400" />
            Stack Tecnológico
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            En KONTAXES usamos{' '}
            <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-emerald-400 bg-clip-text text-transparent">
              lo mejor
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Una combinación única de{' '}
            <span className="text-purple-400 font-semibold">Odoo</span>,{' '}
            <span className="text-orange-400 font-semibold">IA (Claude)</span>,{' '}
            <span className="text-violet-400 font-semibold">Módulos Propios</span> y{' '}
            <span className="text-emerald-400 font-semibold">FinanzIA</span>{' '}
            para darte contabilidad de siguiente nivel.
          </p>
        </div>

        {/* Tech Selector Pills */}
        <div className="reveal flex flex-wrap justify-center items-center gap-3 mb-12">
          {techs.map((tech, i) => (
            <React.Fragment key={tech.id}>
              <button
                onClick={() => handleSelect(tech.id)}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 border ${
                  active === tech.id
                    ? `${tech.bgColor} ${tech.borderColor} ${tech.textColor} shadow-lg scale-105`
                    : 'bg-white/3 border-white/8 text-gray-500 hover:text-gray-300 hover:bg-white/6'
                }`}
              >
                <tech.icon />
                <span>{tech.name}</span>
                {active === tech.id && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
              </button>
              {i < techs.length - 1 && (
                <ConnectionLine active={active === tech.id || active === techs[i + 1]?.id} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Active Tech Detail */}
        <div className={`reveal transition-all duration-300 ${animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
          <div className={`relative rounded-2xl border ${activeTech.borderColor} ${activeTech.bgColor} p-8 md:p-10 overflow-hidden`}>
            {/* Glow */}
            <div className={`absolute -top-10 -right-10 w-48 h-48 ${activeTech.glowColor} rounded-full blur-3xl pointer-events-none`} />
            <div className={`absolute -bottom-10 -left-10 w-32 h-32 ${activeTech.glowColor} rounded-full blur-3xl pointer-events-none opacity-60`} />

            <div className="relative grid md:grid-cols-2 gap-10 items-center">
              {/* Left */}
              <div>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider mb-5 ${activeTech.badgeColor}`}>
                  <activeTech.icon />
                  {activeTech.tagline}
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {activeTech.name}
                </h3>
                <p className="text-gray-300 text-base leading-relaxed mb-6">
                  {activeTech.description}
                </p>
                <a href="#servicios"
                  className={`inline-flex items-center gap-2 font-semibold text-sm ${activeTech.textColor} hover:gap-3 transition-all`}>
                  Ver cómo lo usamos <ArrowRightIcon size={14} />
                </a>
              </div>

              {/* Right — Features */}
              <div className="space-y-3">
                {activeTech.features.map((feat, i) => (
                  <div key={i}
                    className={`flex items-center gap-3 p-4 rounded-xl bg-white/4 border border-white/6 hover:border-current hover:${activeTech.bgColor} transition-all group cursor-default`}
                    style={{ transitionDelay: `${i * 50}ms` }}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${activeTech.bgColor} border ${activeTech.borderColor}`}>
                      <CheckIcon size={13} className={activeTech.textColor} />
                    </div>
                    <span className="text-gray-300 text-sm font-medium">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Summary Row */}
        <div className="reveal mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {techs.map((tech) => (
            <button key={tech.id} onClick={() => handleSelect(tech.id)}
              className={`p-5 rounded-xl border text-left transition-all duration-300 group ${
                active === tech.id
                  ? `${tech.bgColor} ${tech.borderColor}`
                  : 'bg-white/2 border-white/6 hover:bg-white/5 hover:border-white/12'
              }`}>
              <tech.icon />
              <p className={`font-bold text-sm mt-2 mb-0.5 ${active === tech.id ? tech.textColor : 'text-white'}`}>{tech.name}</p>
              <p className="text-gray-500 text-xs">{tech.tagline}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
