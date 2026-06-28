import React, { useState } from 'react';

const team = [
  { name: 'Carlos Roberto Xot',  role: 'Socio Mayor', slug: 'carlos-xot',        color: 'from-purple-600 to-violet-600',  initials: 'CX' },
  { name: 'Jorge Mario Antuche', role: 'Socio Mayor', slug: 'jorge-antuche',      color: 'from-violet-600 to-indigo-600',  initials: 'JA' },
  { name: 'Kevin A. Santos C.',  role: 'Socio Mayor', slug: 'kevin-santos',       color: 'from-indigo-600 to-blue-600',    initials: 'KS' },
  { name: 'Cristian Maldonado',  role: 'Socio Mayor', slug: 'cristian-maldonado', color: 'from-blue-600 to-cyan-600',      initials: 'CM' },
  { name: 'Amilcar Cun',         role: 'Socio',       slug: 'amilcar-cun',        color: 'from-purple-500 to-pink-500',    initials: 'AC' },
];

function MemberCard({ member, index }: { member: typeof team[0]; index: number }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`reveal reveal-delay-${Math.min(index + 1, 5)} group relative flex items-stretch rounded-2xl overflow-hidden border border-white/8 bg-white/3 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all duration-400 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-purple-900/20`}
      style={{ minHeight: '110px' }}
    >
      {/* Left: text content */}
      <div className="flex flex-col justify-center px-6 py-5 flex-1 min-w-0 z-10">
        <h3
          className="font-bold text-white text-base leading-tight mb-2"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {member.name}
        </h3>
        <span
          className={`inline-block self-start px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${member.color} text-white shadow-sm`}
        >
          {member.role}
        </span>
      </div>

      {/* Right: photo */}
      <div className="relative flex-shrink-0 w-28 sm:w-32 overflow-hidden">
        {/* gradient fade from left */}
        <div className="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-gray-950/90 to-transparent z-10 pointer-events-none group-hover:from-purple-950/70 transition-all duration-400" />

        {!imgError ? (
          <img
            src={`/socios/${member.slug}.png`}
            alt={member.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          /* Fallback avatar */
          <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${member.color}`}>
            <span className="text-white font-bold text-2xl select-none">{member.initials}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function Team() {
  return (
    <section id="equipo" className="py-24 bg-gray-950 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none grid-bg opacity-20" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[400px] bg-purple-900/8 rounded-full blur-3xl pointer-events-none orb-float-slow" />
      <div className="absolute top-16 right-0 w-80 h-80 bg-violet-900/6 rounded-full blur-3xl pointer-events-none orb-float-reverse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-900/4 rounded-full blur-3xl pointer-events-none orb-float" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16 reveal">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-purple-400 mb-3">Nuestro Equipo</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Profesionales comprometidos
          </h2>
          <p className="text-lg text-gray-400">con tu éxito financiero</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.map((member, index) => (
            <MemberCard key={member.slug} member={member} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
