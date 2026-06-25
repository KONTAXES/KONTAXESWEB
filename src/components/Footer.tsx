import React from 'react';
import { MailIcon, PhoneIcon, MapPinIcon } from 'lucide-react';

export function Footer() {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <footer className="bg-gray-950 border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <img src="/K_V4-2.png" alt="KONTAXES" className="h-14 w-auto mb-4" />
            <p className="text-gray-400 text-sm mb-2">Contabilidad · Impuestos · Asesoría Financiera · Consultoría</p>
            <p className="text-xs text-gray-600 italic">De números a decisiones</p>
            <div className="flex gap-3 mt-6">
              <a href="https://app.kontaxes.com" target="_blank" rel="noopener noreferrer"
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-lg text-xs hover:from-emerald-400 hover:to-teal-400 transition-all">
                APP
              </a>
              <a href="https://odoo.kontaxes.com" target="_blank" rel="noopener noreferrer"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold rounded-lg text-xs hover:from-purple-500 hover:to-violet-500 transition-all">
                ODOO
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold text-white mb-5 uppercase tracking-wider">Contacto</h3>
            <div className="space-y-3">
              <a href="mailto:info@kontaxes.com"
                className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors text-sm">
                <MailIcon size={15} className="flex-shrink-0" /> info@kontaxes.com
              </a>
              <a href="https://wa.me/50236387717" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors text-sm">
                <PhoneIcon size={15} className="flex-shrink-0" /> +502 3638-7717
              </a>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <MapPinIcon size={15} className="flex-shrink-0" /> Guatemala
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-bold text-white mb-5 uppercase tracking-wider">Navegación</h3>
            <ul className="space-y-2">
              {['servicios', 'cotizador', 'herramientas', 'equipo', 'clientes', 'proximamente'].map((id) => (
                <li key={id}>
                  <button onClick={() => scrollTo(id)}
                    className="text-gray-400 hover:text-purple-400 transition-colors text-sm capitalize">
                    {id === 'proximamente' ? 'Próximamente' : id.charAt(0).toUpperCase() + id.slice(1)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-gray-600 text-xs">© {new Date().getFullYear()} KONTAXES. Todos los derechos reservados.</p>
          <p className="text-gray-700 text-xs">Utilizando la tecnología y el profesionalismo</p>
        </div>
      </div>
    </footer>
  );
}
