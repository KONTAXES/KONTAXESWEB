import React, { Suspense, lazy, useEffect, useRef } from 'react';

const Office3DHero = lazy(() => import('./Office3DHero'));

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const phase1Ref = useRef<HTMLDivElement>(null);
  const phase2Ref = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const setOfficeProgress = useRef<((p: number) => void) | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // progress 0→1 over the first 100vh of scroll within this 200vh section
      const p = Math.min(1, Math.max(0, -rect.top / vh));

      // feed progress into 3D scene
      if (setOfficeProgress.current) setOfficeProgress.current(p);

      // phase 1: "no solo son / números" — visible 0→0.38, fades 0.38→0.55
      const p1 = p < 0.38 ? 1 : p < 0.55 ? 1 - (p - 0.38) / 0.17 : 0;
      if (phase1Ref.current) {
        phase1Ref.current.style.opacity = String(p1);
        phase1Ref.current.style.transform = `translateY(${(1 - p1) * 20}px)`;
      }

      // phase 2: "sino, / decisiones" — fades in 0.5→0.68
      const p2 = p < 0.50 ? 0 : p < 0.68 ? (p - 0.50) / 0.18 : 1;
      if (phase2Ref.current) {
        phase2Ref.current.style.opacity = String(p2);
        phase2Ref.current.style.transform = `translateY(${(1 - p2) * 24}px)`;
      }

      // scroll indicator: fade out at start of scroll
      const si = p < 0.08 ? 1 - p / 0.08 : 0;
      if (scrollIndicatorRef.current) scrollIndicatorRef.current.style.opacity = String(si);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      style={{ height: '200vh', position: 'relative' }}
    >
      {/* Sticky viewport — fills 100vh, stays pinned while scrolling through 200vh */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center bg-[#0d0620]">

        {/* Fondo 3D interactivo — se carga en segundo plano para no bloquear el render inicial */}
        <Suspense fallback={null}>
          <Office3DHero
            className="absolute inset-0"
            style={{ zIndex: 0 }}
            onSetProgress={(fn) => { setOfficeProgress.current = fn; }}
          />
        </Suspense>

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

          {/* Titles — stacked with absolute overlap */}
          <div className="relative">
            {/* Phase 1: "no solo son / números" */}
            <div ref={phase1Ref} style={{ willChange: 'opacity, transform' }}>
              <h1
                className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-5 leading-[1.08]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                no solo son
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-purple-400 bg-clip-text text-transparent">
                  números
                </span>
              </h1>
              <p className="text-base md:text-lg text-gray-400 mb-9 max-w-md leading-relaxed">
                Contabilidad · Impuestos · Asesoría · Consultoría
              </p>
            </div>

            {/* Phase 2: "sino, / decisiones" — overlaps phase 1, initially hidden */}
            <div
              ref={phase2Ref}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, opacity: 0, willChange: 'opacity, transform' }}
            >
              <h1
                className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-5 leading-[1.08]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                sino,
                <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                  decisiones
                </span>
              </h1>
              <p className="text-base md:text-lg text-gray-400 mb-9 max-w-md leading-relaxed">
                Contabilidad · Impuestos · Asesoría · Consultoría
              </p>
            </div>
          </div>

          {/* CTAs */}
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
          ref={scrollIndicatorRef}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
          style={{ zIndex: 20 }}
        >
          <div className="w-5 h-8 border border-white/15 rounded-full flex justify-center pt-1.5">
            <div className="w-0.5 h-2 bg-purple-400 rounded-full animate-bounce" />
          </div>
        </div>

      </div>
    </section>
  );
}
