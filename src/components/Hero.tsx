import React from 'react';
import Office3DHero from './Office3DHero';

export function Hero() {
  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden flex items-center">

      {/* Fondo 3D interactivo */}
      <Office3DHero className="absolute inset-0" style={{ zIndex: 0 }} />

      {/* Gradiente izquierdo para legibilidad del texto */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 5,
          background:
            'linear-gradient(108deg, rgba(13,6,32,0.97) 0%, rgba(13,6,32,0.82) 34%, rgba(13,6,32,0.18) 58%, transparent 100%)',
        }}
      />

      {/* Fade inferior */}
      <div
        className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
        style={{
          zIndex: 5,
          background: 'linear-gradient(to top, #0d0620 0%, transparent 100%)',
        }}
      />

      {/* Contenido del hero — encima del 3D */}
      <div
        className="relative px-8 md:px-14 lg:px-20 max-w-[44rem] pointer-events-none"
        style={{ zIndex: 20 }}
      >
        {/* Logo */}
        <div className="mb-7">
          <img
            src="/K_white.png"
            alt="KONTAXES"
            className="h-16 w-auto drop-shadow-[0_0_36px_rgba(147,51,234,0.7)]"
          />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-semibold tracking-widest uppercase mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Consultores Financieros &amp; Fiscales
        </div>

        {/* Título */}
        <h1
          className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-5 leading-[1.08]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          de{' '}
          <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-purple-400 bg-clip-text text-transparent">
            números
          </span>
          <br />
          a{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
            decisiones
          </span>
        </h1>

        {/* Subtítulo */}
        <p className="text-base md:text-lg text-gray-400 mb-9 max-w-md leading-relaxed">
          Contabilidad · Impuestos · Asesoría · Consultoría
        </p>

        {/* CTAs — pointer-events-auto para que sean clickeables */}
        <div className="flex flex-wrap gap-3 pointer-events-auto">
          <button
            onClick={() =>
              document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })
            }
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold rounded-xl text-sm
              hover:from-purple-500 hover:to-violet-500 transition-all duration-200
              shadow-lg shadow-purple-900/40 hover:-translate-y-0.5 hover:shadow-purple-500/30"
          >
            Ver Servicios
          </button>
          <button
            onClick={() =>
              document.getElementById('cotizador')?.scrollIntoView({ behavior: 'smooth' })
            }
            className="px-6 py-3 bg-white/8 border border-white/15 backdrop-blur-sm text-white font-bold
              rounded-xl text-sm hover:bg-white/14 hover:border-white/25 transition-all duration-200 hover:-translate-y-0.5"
          >
            Cotizar Ahora
          </button>
        </div>
      </div>

      {/* Indicador de scroll */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
        style={{ zIndex: 20 }}
      >
        <div className="w-5 h-8 border border-white/15 rounded-full flex justify-center pt-1.5">
          <div className="w-0.5 h-2 bg-purple-400 rounded-full animate-bounce" />
        </div>
      </div>

    </section>
  );
}
