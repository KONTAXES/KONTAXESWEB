import React, { useState, useEffect, useRef } from 'react';
import { CheckIcon, ChevronRightIcon, ZapIcon, BarChart3Icon, FileCheckIcon } from 'lucide-react';

const cards = [
  {
    id: 'ktx',
    name: 'Odoo + IA + Módulos KTX',
    short: 'Stack Principal',
    emoji: '⚡',
    color: 'purple',
    border: 'border-purple-500/40',
    bg: 'bg-purple-500/8',
    glow: 'bg-purple-600/25',
    glow2: 'bg-violet-600/15',
    text: 'text-purple-400',
    badge: 'bg-purple-500/15 border-purple-500/30 text-purple-300',
    ring: 'ring-purple-500/30',
    activeBg: 'from-purple-900/40 to-violet-900/30',
    icon: ZapIcon,
    tagline: 'ERP · Inteligencia Artificial · Guatemala',
    description:
      'La combinación más potente para contabilidad moderna: Odoo 19 como ERP base, Claude AI para análisis inteligente, y nuestros módulos desarrollados exclusivamente para el mercado guatemalteco (SAT, FEL, RTU).',
    features: [
      'Odoo 19 — ERP líder mundial',
      'Claude AI para clasificación y análisis',
      'Módulos SAT & FEL Guatemala nativos',
      'Libros de IVA y reportes locales automáticos',
      'Multi-empresa · Multi-moneda GTQ',
    ],
  },
  {
    id: 'finanzIA',
    name: 'FinanzIA',
    short: 'Finanzas con IA',
    emoji: '📈',
    color: 'emerald',
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-500/8',
    glow: 'bg-emerald-600/20',
    glow2: 'bg-teal-600/12',
    text: 'text-emerald-400',
    badge: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
    ring: 'ring-emerald-500/30',
    activeBg: 'from-emerald-900/30 to-teal-900/20',
    icon: BarChart3Icon,
    tagline: 'Dashboards · Proyecciones · Alertas',
    description:
      'Nuestra plataforma propia de inteligencia financiera. Analiza los datos de tu empresa en tiempo real, proyecta flujos de caja y envía alertas automáticas cuando algo requiere tu atención.',
    features: [
      'Dashboards ejecutivos en tiempo real',
      'Proyección de flujo de caja con IA',
      'Alertas de riesgo financiero',
      'Comparativos mensuales y anuales',
      'Reportes PDF/Excel automáticos',
    ],
  },
  {
    id: 'felsimple',
    name: 'FELSimple',
    short: 'Factura Electrónica',
    emoji: '🧾',
    color: 'sky',
    border: 'border-sky-500/40',
    bg: 'bg-sky-500/8',
    glow: 'bg-sky-600/20',
    glow2: 'bg-cyan-600/12',
    text: 'text-sky-400',
    badge: 'bg-sky-500/15 border-sky-500/30 text-sky-300',
    ring: 'ring-sky-500/30',
    activeBg: 'from-sky-900/30 to-cyan-900/20',
    icon: FileCheckIcon,
    tagline: 'FEL · SAT · Certificador',
    description:
      'Emisión de Facturas Electrónicas en Línea (FEL) simplificada para Guatemala. Conectado directamente al SAT, genera XMLs válidos, descarga PDFs y registra cada documento en tu contabilidad automáticamente.',
    features: [
      'Emisión FEL certificada ante SAT',
      'Generación XML & PDF automática',
      'Anulación y notas de crédito/débito',
      'Integración directa con Odoo',
      'Historial y trazabilidad completa',
    ],
  },
];

function useLocalReveal(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.05 }
    );
    el.querySelectorAll('.reveal').forEach((node) => obs.observe(node));
    return () => obs.disconnect();
  }, []);
}

export function TechStack() {
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  useLocalReveal(sectionRef);

  const card = cards[active];

  return (
    <section ref={sectionRef} id="herramientas" className="py-20 bg-gray-950 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-800/8 rounded-full blur-3xl orb-float" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-emerald-800/8 rounded-full blur-3xl orb-float-reverse" />
        <div className="absolute top-10 right-10 w-48 h-48 bg-sky-800/6 rounded-full blur-3xl orb-float" style={{ animationDelay: '3s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-14 reveal">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">
            <ZapIcon size={11} className="text-yellow-400" />
            Plataforma Tecnológica
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Herramientas que{' '}
            <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-emerald-400 bg-clip-text text-transparent">
              nos diferencian
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Stack propio diseñado para contabilidad de siguiente nivel en Guatemala.
          </p>
        </div>

        {/* Selector tabs */}
        <div className="reveal flex flex-col sm:flex-row justify-center gap-3 mb-10">
          {cards.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setActive(i)}
              className={`group flex items-center gap-3 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300 border ${
                active === i
                  ? `${c.bg} ${c.border} ${c.text} shadow-lg ring-1 ${c.ring} scale-[1.02]`
                  : 'bg-white/3 border-white/8 text-gray-500 hover:text-gray-300 hover:bg-white/6 hover:border-white/15'
              }`}
            >
              <span className="text-lg">{c.emoji}</span>
              <span>{c.name}</span>
              {active === i && <ChevronRightIcon size={14} className="ml-auto" />}
            </button>
          ))}
        </div>

        {/* Detail Panel */}
        <div className="reveal">
          <div className={`relative rounded-2xl border ${card.border} overflow-hidden`}>
            {/* Gradient background of active card */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.activeBg} pointer-events-none`} />
            <div className={`absolute -top-16 -right-16 w-64 h-64 ${card.glow} rounded-full blur-3xl pointer-events-none`} />
            <div className={`absolute -bottom-16 -left-16 w-48 h-48 ${card.glow2} rounded-full blur-3xl pointer-events-none`} />

            <div className="relative p-8 md:p-10 grid md:grid-cols-2 gap-10 items-start">
              {/* Left */}
              <div>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider mb-5 ${card.badge}`}>
                  <span>{card.emoji}</span>
                  {card.tagline}
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {card.name}
                </h3>
                <p className="text-gray-300 text-base leading-relaxed">
                  {card.description}
                </p>
              </div>

              {/* Right — Features */}
              <div className="space-y-2.5">
                <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${card.text}`}>Incluye</p>
                {card.features.map((feat, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-black/20 border border-white/5 hover:border-white/10 transition-all"
                  >
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${card.bg} border ${card.border}`}>
                      <CheckIcon size={12} className={card.text} />
                    </div>
                    <span className="text-gray-300 text-sm">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom dots navigation */}
            <div className="relative px-8 pb-6 flex items-center gap-2">
              {cards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`transition-all duration-300 rounded-full ${
                    active === i ? `w-6 h-2 ${card.bg} border ${card.border}` : 'w-2 h-2 bg-white/15 hover:bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
