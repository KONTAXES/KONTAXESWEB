import React from 'react';

const team = [
  {
    name: 'Carlos Roberto Xot',
    role: 'Socio Mayor',
    experience: 'Master en análisis financiero y crediticio.',
    skills: 'Análisis Financiero · Análisis Crediticio',
    education: 'Lic. Contador Público y Auditor · Maestría en Administración Financiera',
    initials: 'CX',
    color: 'from-purple-600 to-violet-600',
  },
  {
    name: 'Kevin Santos',
    role: 'Socio Mayor',
    experience: 'Contador general con experiencia en empresas de compra-venta, servicios, finanzas, presupuestos, desarrollo inmobiliario e impuestos.',
    skills: 'Odoo · Advantage · Excel',
    education: 'Estudios universitarios avanzados de CPA',
    initials: 'KS',
    color: 'from-violet-600 to-indigo-600',
  },
  {
    name: 'Jorge Antuche',
    role: 'Socio Mayor',
    experience: 'Contador general con larga trayectoria profesional y amplio conocimiento en impuestos, consultoría financiera y fiscal.',
    skills: 'Odoo · Excel',
    education: 'Pensum cerrado de CPA',
    initials: 'JA',
    color: 'from-indigo-600 to-blue-600',
  },
  {
    name: 'Cristian Maldonado',
    role: 'Socio Medio',
    experience: 'Contador junior con experiencia en compra-venta de bienes, servicios, finanzas, presupuestos, desarrollo inmobiliario y constructoras.',
    skills: 'Odoo · SAP · Excel',
    education: 'Estudios avanzados de CPA',
    initials: 'CM',
    color: 'from-blue-600 to-cyan-600',
  },
  {
    name: 'Amilcar Cun',
    role: 'Socio Junior',
    experience: 'Estudiante de Administración con gran potencial de desarrollo.',
    skills: 'En formación',
    education: 'Estudiante de Administración',
    initials: 'AC',
    color: 'from-purple-500 to-pink-500',
  },
  {
    name: 'Alexis Juárez',
    role: 'Socio Junior',
    experience: 'Estudiante de Administración con gran potencial de desarrollo.',
    skills: 'En formación',
    education: 'Estudiante de Administración',
    initials: 'AJ',
    color: 'from-pink-500 to-rose-500',
  },
];

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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {team.map((member, index) => (
            <div key={index}
              className={`reveal reveal-delay-${Math.min(index + 1, 5)} group relative rounded-2xl bg-white/3 border border-white/8 p-6 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all duration-400 hover:-translate-y-1`}>
              <div className="flex items-center gap-4 mb-5">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${member.color} flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0`}>
                  {member.initials}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base leading-tight">{member.name}</h3>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 bg-gradient-to-r ${member.color} text-white`}>
                    {member.role}
                  </span>
                </div>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed mb-4">{member.experience}</p>
              <div className="space-y-1.5 border-t border-white/5 pt-3">
                <p className="text-xs text-gray-500"><span className="text-purple-400 font-semibold">Habilidades:</span> {member.skills}</p>
                <p className="text-xs text-gray-500"><span className="text-purple-400 font-semibold">Educación:</span> {member.education}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
