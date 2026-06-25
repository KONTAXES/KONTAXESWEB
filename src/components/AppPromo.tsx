import React from 'react';
import { FileTextIcon, ImageIcon, DownloadIcon, ZapIcon, ClockIcon, CheckCircleIcon } from 'lucide-react';

export function AppPromo() {
  const features = [
    { icon: FileTextIcon, title: 'Extracción de PDFs', desc: 'Extrae datos de facturas, estados de cuenta y documentos contables en formato PDF' },
    { icon: ImageIcon, title: 'Procesamiento de Imágenes', desc: 'Convierte imágenes de documentos en datos estructurados listos para usar' },
    { icon: DownloadIcon, title: 'Exportación CSV/Excel', desc: 'Descarga los datos extraídos en formatos compatibles con tus sistemas contables' },
  ];
  const benefits = [
    { icon: ZapIcon, text: 'Reduce el tiempo de captura de datos en un 90%' },
    { icon: CheckCircleIcon, text: 'Minimiza errores de transcripción manual' },
    { icon: ClockIcon, text: 'Procesa múltiples documentos simultáneamente' },
    { icon: CheckCircleIcon, text: 'Integración directa con sistemas contables' },
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-gray-950">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/15 via-transparent to-violet-600/10 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-purple-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 reveal">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-sm font-semibold mb-4">
            🚀 Nueva Herramienta
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Aplicación Web de<br />
            <span className="bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">Extracción de Datos</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Agiliza tu trabajo contable extrayendo información de PDFs e imágenes con eficiencia
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4 reveal">
            {features.map((f, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-xl bg-white/3 border border-white/8 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-purple-500/15 border border-purple-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <f.icon className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm mb-1">{f.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="reveal reveal-delay-1 p-6 rounded-2xl bg-white/3 border border-white/10 hover:border-purple-500/30 transition-all">
            <h3 className="text-xl font-bold text-white mb-5">Beneficios</h3>
            <ul className="space-y-3 mb-8">
              {benefits.map((b, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center flex-shrink-0">
                    <b.icon className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-gray-300 text-sm">{b.text}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-white/5 pt-6">
              <a href="https://app.kontaxes.com" target="_blank" rel="noopener noreferrer"
                className="block w-full py-3.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold text-center rounded-xl hover:from-purple-500 hover:to-violet-500 transition-all hover:-translate-y-0.5 shadow-lg">
                Acceder a la Aplicación →
              </a>
              <p className="text-center text-gray-500 text-xs mt-3">💡 Disponible para todos los clientes de KONTAXES</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
