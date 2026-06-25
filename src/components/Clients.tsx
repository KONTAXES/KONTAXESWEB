import React, { useState } from 'react';
import { StarIcon } from 'lucide-react';

const clients = [
  { name: 'STAYTE MANAGEMENT', slug: 'stayte',      initials: 'SM', color: 'from-slate-600 to-slate-700',    glow: 'shadow-slate-500/20',   border: 'border-slate-500/25' },
  { name: 'CLEANBNB',          slug: 'cleanbnb',    initials: 'CB', color: 'from-sky-500 to-cyan-600',       glow: 'shadow-sky-500/20',     border: 'border-sky-500/25' },
  { name: 'LA BURGUERÍA',      slug: 'laburgueria', initials: 'LB', color: 'from-amber-500 to-orange-600',   glow: 'shadow-amber-500/20',   border: 'border-amber-500/25' },
  { name: 'ESTUDIO LA',        slug: 'estudiola',   initials: 'EL', color: 'from-indigo-500 to-blue-600',    glow: 'shadow-indigo-500/20',  border: 'border-indigo-500/25' },
  { name: 'GU TRUST',          slug: 'gutrust',     initials: 'GT', color: 'from-emerald-500 to-teal-600',   glow: 'shadow-emerald-500/20', border: 'border-emerald-500/25' },
  { name: 'RADICALIDÁ',        slug: 'radicalida',  initials: 'RA', color: 'from-purple-500 to-violet-600',  glow: 'shadow-purple-500/20',  border: 'border-purple-500/25' },
  { name: 'PREMO',             slug: 'premo',       initials: 'PR', color: 'from-rose-500 to-pink-600',      glow: 'shadow-rose-500/20',    border: 'border-rose-500/25' },
];

function ClientCard({ client }: { client: typeof clients[0] }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <div className="flex-shrink-0 flex flex-col items-center gap-3 px-5 group cursor-default select-none">
      <div
        className={`relative w-36 h-20 rounded-2xl border ${client.border} bg-white/3 group-hover:bg-white/6 group-hover:border-purple-500/40 group-hover:shadow-lg ${client.glow} transition-all duration-300 flex items-center justify-center overflow-hidden`}
      >
        {!imgErr ? (
          <img
            src={`/clients/${client.slug}.png`}
            alt={client.name}
            onError={() => setImgErr(true)}
            className="max-w-[80%] max-h-[70%] object-contain opacity-75 group-hover:opacity-100 transition-opacity duration-300"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${client.color} flex items-center justify-center opacity-70 group-hover:opacity-90 transition-opacity duration-300`}>
            <span className="text-white font-bold text-2xl tracking-tight">{client.initials}</span>
          </div>
        )}
      </div>
      <span className="text-[11px] font-bold text-gray-600 group-hover:text-gray-300 transition-colors duration-300 tracking-widest text-center whitespace-nowrap uppercase">
        {client.name}
      </span>
    </div>
  );
}

export function Clients() {
  const row = [...clients, ...clients, ...clients];

  return (
    <section id="clientes" className="py-24 bg-gray-950 relative overflow-hidden">

      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none grid-bg opacity-20" />
      <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-emerald-900/8 rounded-full blur-3xl pointer-events-none orb-float" />
      <div className="absolute bottom-0 left-1/4 w-96 h-80 bg-purple-900/6 rounded-full blur-3xl pointer-events-none orb-float-reverse" />
      <div className="absolute top-1/2 left-10 w-56 h-56 bg-teal-900/5 rounded-full blur-3xl pointer-events-none orb-float-slow" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

        {/* Header */}
        <div className="text-center mb-16 reveal">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="w-10 h-px bg-gradient-to-r from-transparent to-purple-400/60" />
            <span className="text-xs font-bold tracking-widest uppercase text-purple-400">Clientes</span>
            <span className="w-10 h-px bg-gradient-to-l from-transparent to-purple-400/60" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Empresas que confían{' '}
            <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-emerald-400 bg-clip-text text-transparent">
              en nosotros
            </span>
          </h2>
          <p className="text-gray-400 max-w-md mx-auto">
            Empresas guatemaltecas que eligieron KONTAXES para llevar su contabilidad con tecnología de siguiente nivel.
          </p>
        </div>
      </div>

      {/* ── Infinite marquee ── */}
      <div className="relative mb-16">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-gray-950 via-gray-950/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-gray-950 via-gray-950/80 to-transparent z-10 pointer-events-none" />

        <div className="overflow-hidden">
          <div className="marquee-track flex py-4" style={{ width: 'max-content' }}>
            {row.map((client, i) => (
              <ClientCard key={`${client.slug}-${i}`} client={client} />
            ))}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="reveal flex justify-center">
          <div className="inline-flex flex-wrap justify-center items-center gap-0 rounded-2xl bg-white/3 border border-white/8 overflow-hidden">
            {[
              { value: `${clients.length}`, label: 'Empresas activas', color: 'text-white' },
              { value: '100%', label: 'Satisfacción', color: 'text-purple-400' },
              { value: 'GT', label: 'Guatemala', color: 'text-emerald-400' },
              { value: 'FEL', label: 'Certificadas SAT', color: 'text-sky-400' },
            ].map((stat, i) => (
              <React.Fragment key={i}>
                {i > 0 && <div className="w-px h-12 bg-white/8" />}
                <div className="px-8 py-4 text-center">
                  <p className={`text-2xl font-bold mb-0.5 ${stat.color}`}>{stat.value}</p>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">{stat.label}</p>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}
