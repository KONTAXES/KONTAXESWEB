import React from 'react';
import { Link } from 'react-router-dom';

interface Course {
  num: string;
  title: string;
  subtitle: string;
  pages: number;
  cover: string;
  href: string;
}

const courses: Course[] = [
  {
    num: '01',
    title: 'Introducción a Odoo',
    subtitle: 'Interfaz, vistas, búsqueda, formularios y actividades',
    pages: 21,
    cover: '/capacitaciones/odoo/portada-guia-1-01.png',
    href: '/capacitaciones/odoo/guias-usuario',
  },
  {
    num: '02',
    title: 'Ventas en Odoo',
    subtitle: 'CRM · Ventas · Suscripciones · Alquiler',
    pages: 18,
    cover: '/capacitaciones/odoo/portada-guia-2-01.png',
    href: '/capacitaciones/odoo/guias-usuario',
  },
];

const OCTA = 'polygon(29% 0,71% 0,100% 29%,100% 71%,71% 100%,29% 100%,0 71%,0 29%)';

export function Capacitaciones() {
  return (
    <section id="capacitaciones" className="py-24 bg-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none grid-bg opacity-30" />
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-14 reveal">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 mb-5">
            <span className="text-blue-400 text-xs font-bold tracking-widest uppercase">KTX LAB</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
            Capacitaciones Odoo 19
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-base leading-relaxed">
            Guías visuales elaboradas por KTX LAB para aprender a usar Odoo paso a paso.
            Cada pantalla, ícono y botón explicado con imágenes señaladas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto reveal">
          {courses.map((c) => (
            <Link
              key={c.num}
              to={c.href}
              className="group block rounded-xl overflow-hidden border border-white/10 bg-gray-800/60 hover:border-blue-500/40 hover:bg-gray-800 transition-all duration-200 no-underline"
            >
              {/* Cover image */}
              <div className="relative overflow-hidden" style={{ height: 160 }}>
                <img
                  src={c.cover}
                  alt={`Portada Guía ${c.num}: ${c.title}`}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-95 transition-opacity duration-200"
                />
                {/* Number badge */}
                <div
                  style={{ clipPath: OCTA, background: '#111316' }}
                  className="absolute bottom-3 left-4 w-9 h-9 flex items-center justify-center"
                >
                  <span className="text-white font-extrabold text-xs">{c.num}</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5">
                <h3 className="text-white font-bold text-base mb-1 group-hover:text-blue-300 transition-colors">
                  {c.title}
                </h3>
                <p className="text-gray-400 text-sm mb-3 leading-snug">{c.subtitle}</p>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-xs">{c.pages} páginas · PDF</span>
                  <span className="text-blue-400 text-sm font-semibold group-hover:underline">Ver guía →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* KTX LAB attribution */}
        <div className="mt-10 flex items-center justify-center gap-2.5 reveal">
          <img
            src="/capacitaciones/odoo/ktxlab-simbolo-blanco.png"
            alt="Símbolo KTX LAB"
            className="h-5 w-5 object-contain opacity-60"
          />
          <span className="text-gray-500 text-sm">Material elaborado y patrocinado por KTX LAB</span>
        </div>
      </div>
    </section>
  );
}
