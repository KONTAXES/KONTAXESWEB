import React, { useEffect, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from 'lucide-react';

const clients = [
  { name: 'RADICALIDÁ', initials: 'RA', color: 'from-purple-600 to-violet-600' },
  { name: 'ESTUDIO LA', initials: 'EL', color: 'from-indigo-600 to-blue-600' },
  { name: 'ARIV HOME', initials: 'AH', color: 'from-blue-600 to-cyan-600' },
  { name: 'PREMO', initials: 'PR', color: 'from-violet-600 to-purple-600' },
];

const testimonials = [
  { client: 'RADICALIDÁ', text: 'KONTAXES ha transformado completamente nuestra gestión contable. Su profesionalismo y uso de tecnología Odoo nos permite tener información financiera en tiempo real.', author: 'Director General' },
  { client: 'ESTUDIO LA', text: 'La asesoría fiscal de KONTAXES es excepcional. Nos han ayudado a optimizar nuestros procesos y cumplir con todas las obligaciones tributarias sin complicaciones.', author: 'Gerente Financiero' },
  { client: 'ARIV HOME', text: 'Trabajar con KONTAXES ha sido una excelente decisión. Su equipo es altamente capacitado y siempre está disponible para resolver nuestras dudas.', author: 'Propietario' },
  { client: 'PREMO', text: 'La implementación de Odoo por parte de KONTAXES ha mejorado significativamente nuestra eficiencia operativa. Recomendamos sus servicios ampliamente.', author: 'CEO' },
];

export function Clients() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setCurrent((p) => (p + 1) % clients.length), 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="clientes" className="py-24 bg-gray-950 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-emerald-900/8 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16 reveal">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-purple-400 mb-3">Clientes</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Empresas que confían en nosotros
          </h2>
        </div>

        {/* Client logos */}
        <div className="relative mb-16 reveal">
          <div className="flex items-center justify-center gap-4 md:gap-8">
            <button onClick={() => setCurrent((p) => (p - 1 + clients.length) % clients.length)}
              className="w-10 h-10 rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-400 hover:bg-purple-600/40 transition-all flex items-center justify-center flex-shrink-0">
              <ChevronLeftIcon size={18} />
            </button>
            <div className="flex items-center gap-4 md:gap-6">
              {clients.map((client, i) => (
                <div key={i} onClick={() => setCurrent(i)} className={`cursor-pointer transition-all duration-500 ${i === current ? 'scale-110 opacity-100' : 'scale-90 opacity-30'}`}>
                  <div className={`w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br ${client.color} flex flex-col items-center justify-center shadow-lg`}>
                    <span className="text-white font-bold text-lg md:text-xl">{client.initials}</span>
                    <span className="text-white/70 text-xs mt-1">{client.name}</span>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setCurrent((p) => (p + 1) % clients.length)}
              className="w-10 h-10 rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-400 hover:bg-purple-600/40 transition-all flex items-center justify-center flex-shrink-0">
              <ChevronRightIcon size={18} />
            </button>
          </div>
          <div className="flex justify-center gap-2 mt-5">
            {clients.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${i === current ? 'w-8 bg-purple-500' : 'w-1.5 bg-white/20'}`} />
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-2 gap-5">
          {testimonials.map((t, i) => (
            <div key={i} className={`reveal reveal-delay-${i + 1} group p-6 rounded-2xl bg-white/3 border border-white/8 hover:border-purple-500/30 hover:bg-purple-500/3 transition-all duration-300`}>
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, s) => <StarIcon key={s} size={14} className="text-yellow-400 fill-yellow-400" />)}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
              <div className="border-t border-white/5 pt-4 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${clients[i]?.color || 'from-purple-600 to-violet-600'} flex items-center justify-center text-white text-xs font-bold`}>
                  {clients[i]?.initials}
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{t.client}</p>
                  <p className="text-xs text-gray-500">{t.author}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
