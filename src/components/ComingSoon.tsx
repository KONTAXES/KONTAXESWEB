import React from 'react';
import { ClipboardCheckIcon, FileTextIcon, UsersIcon, ScaleIcon } from 'lucide-react';
import { Icon3D } from './Icon3D';

const upcomingServices = [
  { title: 'Servicios de Auditoría', description: 'Auditorías financieras, operativas y de cumplimiento para garantizar la transparencia de tu empresa.', icon: ClipboardCheckIcon },
  { title: 'Diferentes Tipos de Trámites', description: 'Gestión de trámites ante SAT, IGSS, Ministerio de Trabajo y otras entidades gubernamentales.', icon: FileTextIcon },
  { title: 'Colaboraciones con Oficinas Contables', description: 'Red de colaboración con otras oficinas contables para servicios especializados.', icon: UsersIcon },
  { title: 'Colaboraciones con Firmas de Abogados', description: 'Alianzas estratégicas con oficinas jurídicas para servicios legales complementarios.', icon: ScaleIcon },
];

export function ComingSoon() {
  return (
    <section id="proximamente" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-purple-900/80 to-gray-950" />
      <div className="absolute inset-0 pointer-events-none grid-bg opacity-15" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none orb-float-slow" />
      <div className="absolute top-10 left-10 w-64 h-64 bg-violet-500/8 rounded-full blur-3xl pointer-events-none orb-float" />
      <div className="absolute bottom-10 right-10 w-56 h-56 bg-pink-600/6 rounded-full blur-3xl pointer-events-none orb-float-reverse" />
      <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-purple-400/8 rounded-full blur-2xl pointer-events-none orb-float" style={{ animationDelay: '4s' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 reveal">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-purple-300 mb-3">Expansión</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Próximamente
          </h2>
          <p className="text-lg text-purple-200">Expandiendo nuestros servicios para servirte mejor</p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 mb-14">
          {upcomingServices.map((service, i) => (
            <div key={i} className={`reveal reveal-delay-${i + 1} group p-6 rounded-2xl bg-white/8 backdrop-blur-sm border border-white/15 hover:bg-white/15 transition-all duration-300 hover:-translate-y-1`}>
              <Icon3D className="mb-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-500/15">
                  <service.icon className="w-7 h-7 text-purple-300" />
                </div>
              </Icon3D>
              <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
              <p className="text-purple-100/70 text-sm leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>

        <div className="reveal text-center">
          <div className="inline-block p-8 rounded-2xl bg-white/8 backdrop-blur-sm border border-white/15">
            <p className="text-white text-lg mb-5">¿Interesado en alguno de estos servicios?</p>
            <a href="https://wa.me/50236387717" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-purple-900 font-bold rounded-xl hover:bg-purple-50 transition-all hover:-translate-y-0.5 shadow-xl">
              💬 Contáctanos por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
