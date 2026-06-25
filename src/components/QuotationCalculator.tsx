import React, { useEffect, useState } from 'react';
import { CalculatorIcon, CheckCircleIcon, AlertCircleIcon, ArrowRightIcon } from 'lucide-react';
import { calculateQuotation, QuotationData, QuotationResult } from '../utils/quotationLogic';

export function QuotationCalculator() {
  const [formData, setFormData] = useState<QuotationData>({
    contribuyente: '', regimen: '', activos: '', contabilidadCompleta: '',
    facturacion: '', tipoNegocio: '', certificador: '',
    nombre: '', empresa: '', whatsapp: '', correo: '',
  });
  const [result, setResult] = useState<QuotationResult | null>(null);
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    const needsFull = (formData.regimen === 'iva-isr-5-7' || formData.regimen === 'iva-isr-25-iso') && formData.activos === 'mayor-25k';
    if (needsFull) setFormData((p) => ({ ...p, contabilidadCompleta: 'si' }));
  }, [formData.regimen, formData.activos]);

  const set = (field: keyof QuotationData, value: string) =>
    setFormData((p) => ({ ...p, [field]: value }));

  const handleCalculate = () => {
    if (!formData.contribuyente || !formData.regimen || !formData.activos ||
        !formData.facturacion || !formData.tipoNegocio || !formData.certificador) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }
    setResult(calculateQuotation(formData));
  };

  const needsFullAcc = (formData.regimen === 'iva-isr-5-7' || formData.regimen === 'iva-isr-25-iso') && formData.activos === 'mayor-25k';

  const selectCls = (active: boolean, accent = 'purple') =>
    `w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
      active
        ? accent === 'emerald'
          ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
          : 'bg-purple-500/15 border-purple-500/50 text-purple-300'
        : 'bg-white/3 border-white/8 text-gray-400 hover:border-white/20 hover:bg-white/5'
    }`;

  const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{children}</label>
  );

  return (
    <section id="cotizador" className="py-24 bg-gray-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent pointer-events-none" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">

        <div className="text-center mb-14 reveal">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-purple-400 mb-3">Precios Transparentes</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Cotizador Interactivo
          </h2>
          <p className="text-gray-400 text-lg">Obtén una estimación de precio personalizada al instante</p>
        </div>

        <div className="reveal bg-white/3 border border-white/8 rounded-2xl p-6 md:p-8 space-y-8">
          <div className="flex items-center gap-3 pb-5 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center">
              <CalculatorIcon className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Calculadora de Servicios</p>
              <p className="text-gray-500 text-xs">Precios en Quetzales (GTQ) / mes</p>
            </div>
          </div>

          {/* Tipo de contribuyente */}
          <div>
            <FieldLabel>1. Tipo de contribuyente</FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              {[{ val: 'individual', label: 'Empresa o persona individual', sub: 'Q 250 base' },
                { val: 'sociedad', label: 'Sociedad Anónima', sub: 'Q 500 base' }].map((o) => (
                <button key={o.val} onClick={() => set('contribuyente', o.val)} className={selectCls(formData.contribuyente === o.val)}>
                  <span className="block font-semibold">{o.label}</span>
                  <span className="text-xs opacity-60 mt-0.5 block">{o.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Régimen */}
          <div>
            <FieldLabel>2. Régimen de impuestos</FieldLabel>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[{ val: 'pequeño', label: 'Pequeño Contribuyente', sub: 'IVA 5%', add: '+Q 0' },
                { val: 'iva-isr-5-7', label: 'IVA 12% + ISR 5-7%', sub: 'Régimen opcional', add: '+Q 150' },
                { val: 'iva-isr-25-iso', label: 'IVA 12% + ISR 25% + ISO', sub: 'Régimen general', add: '+Q 250' }].map((o) => (
                <button key={o.val} onClick={() => set('regimen', o.val)} className={selectCls(formData.regimen === o.val)}>
                  <span className="block font-semibold text-xs">{o.label}</span>
                  <span className="text-xs opacity-50 block mt-0.5">{o.sub}</span>
                  <span className="text-xs text-emerald-400 font-bold mt-1 block">{o.add}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Activos */}
          <div>
            <FieldLabel>3. Monto de activos</FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              {[{ val: 'menor-25k', label: 'Activos de Q0 a Q25,000', sub: 'No requiere contabilidad completa' },
                { val: 'mayor-25k', label: 'Activos mayores a Q25,000', sub: 'Requiere contabilidad completa' }].map((o) => (
                <button key={o.val} onClick={() => set('activos', o.val)} className={selectCls(formData.activos === o.val)}>
                  <span className="block font-semibold">{o.label}</span>
                  <span className="text-xs opacity-60 mt-0.5 block">{o.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Contabilidad completa */}
          {!needsFullAcc && formData.activos && (
            <div>
              <FieldLabel>4. ¿Desea contabilidad completa?</FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                {[{ val: 'si', label: 'Sí — con Odoo', sub: '+Q 250' },
                  { val: 'no', label: 'No por ahora', sub: '+Q 0' }].map((o) => (
                  <button key={o.val} onClick={() => set('contabilidadCompleta', o.val)} className={selectCls(formData.contabilidadCompleta === o.val)}>
                    <span className="block font-semibold">{o.label}</span>
                    <span className="text-xs text-emerald-400 font-bold mt-0.5 block">{o.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {needsFullAcc && (
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs flex items-center gap-2">
              <CheckCircleIcon size={14} /> Contabilidad completa obligatoria por ley — incluye sistema Odoo (+Q 250)
            </div>
          )}

          {/* Facturación */}
          <div>
            <FieldLabel>5. Cantidad de facturación mensual</FieldLabel>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[{ val: '0-10', label: '0 – 10', sub: '+Q 0' },
                { val: '11-50', label: '11 – 50', sub: '+Q 100' },
                { val: '51-100', label: '51 – 100', sub: '+Q 200' },
                { val: 'mas-100', label: 'Más de 100', sub: '+Q 300 mín.' }].map((o) => (
                <button key={o.val} onClick={() => set('facturacion', o.val)} className={selectCls(formData.facturacion === o.val)}>
                  <span className="block font-bold text-base">{o.label}</span>
                  <span className="text-xs text-emerald-400 font-bold">{o.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tipo de negocio */}
          <div>
            <FieldLabel>6. Tipo de negocio</FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              {[{ val: 'servicios', label: 'Servicios técnicos, profesionales o en general', sub: '+Q 0' },
                { val: 'compra-venta', label: 'Compra-venta de bienes', sub: '+Q 250 (inventarios)' }].map((o) => (
                <button key={o.val} onClick={() => set('tipoNegocio', o.val)} className={selectCls(formData.tipoNegocio === o.val)}>
                  <span className="block font-semibold text-xs">{o.label}</span>
                  <span className="text-xs text-emerald-400 font-bold mt-1 block">{o.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Certificador */}
          <div>
            <FieldLabel>7. ¿Necesitas certificador (FEL)?</FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              {[{ val: 'si', label: 'Sí, necesito FEL', sub: 'Q 375 implementación + Q 0.20/DTE' },
                { val: 'no', label: 'No por ahora', sub: 'Se puede implementar después' }].map((o) => (
                <button key={o.val} onClick={() => set('certificador', o.val)} className={selectCls(formData.certificador === o.val)}>
                  <span className="block font-semibold">{o.label}</span>
                  <span className="text-xs opacity-60 mt-0.5 block">{o.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Calculate Button */}
          <button onClick={handleCalculate}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold rounded-xl hover:from-purple-500 hover:to-violet-500 transition-all duration-300 shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-2 text-base">
            <CalculatorIcon size={20} /> Calcular mi cotización
          </button>

          {/* Result */}
          {result && (
            <div className="border border-purple-500/30 rounded-2xl p-6 bg-purple-500/5 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold text-lg">Tu Cotización</h3>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Total mensual estimado</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Q {result.total.toLocaleString()}.00
                  </p>
                </div>
              </div>

              <div className="divide-y divide-white/5">
                {result.breakdown.map((item, i) => (
                  <div key={i} className="flex justify-between items-start py-2.5">
                    <div>
                      <p className="text-gray-300 text-sm">{item.item}</p>
                      {item.note && <p className="text-xs text-gray-500 mt-0.5">{item.note}</p>}
                    </div>
                    <span className={`text-sm font-semibold ml-4 flex-shrink-0 ${item.cost > 0 ? 'text-purple-400' : 'text-gray-500'}`}>
                      Q {item.cost.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {result.warnings.length > 0 && (
                <div className="space-y-2">
                  {result.warnings.map((w, i) => (
                    <div key={i} className="flex gap-2 p-3 rounded-lg bg-yellow-500/8 border border-yellow-500/20 text-yellow-300 text-xs">
                      <AlertCircleIcon size={14} className="flex-shrink-0 mt-0.5" /> {w}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a href="https://wa.me/50236387717" target="_blank" rel="noopener noreferrer"
                  className="flex-1 py-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold rounded-xl text-center text-sm hover:bg-emerald-500/25 transition-all flex items-center justify-center gap-2">
                  💬 Confirmar por WhatsApp <ArrowRightIcon size={14} />
                </a>
                <a href="mailto:info@kontaxes.com"
                  className="flex-1 py-3 bg-purple-500/15 border border-purple-500/30 text-purple-400 font-bold rounded-xl text-center text-sm hover:bg-purple-500/25 transition-all flex items-center justify-center gap-2">
                  ✉ Enviar por correo <ArrowRightIcon size={14} />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
