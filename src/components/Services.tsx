import React from 'react';
import { CheckCircleIcon, PlusCircleIcon, ArrowRightIcon } from 'lucide-react';

export function Services() {
  const basicServices = [
    'Registro de operaciones contables mensuales, trabajadas por mes vencido',
    'Elaboración y control de libros contables: compras, ventas, diario, mayor y balances',
    'Elaboración de estados financieros básicos (Balance General y Estado de Resultados)',
    'Conciliaciones bancarias',
    'Preparación de declaraciones tributarias',
    'Asesoría contable y fiscal básica relacionada con las operaciones de la empresa',
  ];

  const additionalServices = [
    'Reportería contable y financiera personalizada (solicitada con anticipación)',
    'Reportería para requerimientos de auditoría externa o de la SAT',
    'Contador o auxiliar contable dedicado físicamente en tu empresa',
  ];

  return (
    <section id="servicios" className="py-24 bg-gray-950 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16 reveal">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-purple-400 mb-3">Lo que hacemos</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Nuestros Servicios
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Soluciones contables y fiscales completas para tu empresa en Guatemala
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Basic Services */}
          <div className="reveal reveal-delay-1 group relative rounded-2xl bg-white/3 border border-white/8 p-8 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all duration-400">
            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-600/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-600/20 transition-all" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider mb-5">
                Servicios Contables Generales
              </div>
              <ul className="space-y-3">
                {basicServices.map((service, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm leading-relaxed">{service}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs text-gray-500 italic border-t border-white/5 pt-4">
                Si requieres algún servicio adicional, con gusto te atenderemos. El costo será consensuado por ambas partes.
              </p>
            </div>
          </div>

          {/* Additional Services */}
          <div className="reveal reveal-delay-2 group relative rounded-2xl bg-white/3 border border-white/8 p-8 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all duration-400">
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-600/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-600/20 transition-all" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-5">
                Servicios Adicionales
              </div>
              <ul className="space-y-4">
                {additionalServices.map((service, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <PlusCircleIcon className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm leading-relaxed">{service}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/15">
                <p className="text-sm text-gray-300 font-medium">
                  💡 Estos servicios tienen costos adicionales determinados según tus necesidades específicas.
                </p>
              </div>
              <div className="mt-6">
                <a href="https://wa.me/50236387717" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-emerald-400 text-sm font-semibold hover:text-emerald-300 transition-colors">
                  Consultar precio <ArrowRightIcon size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
