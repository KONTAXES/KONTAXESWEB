import React, { useEffect, useState } from 'react';
import {
  CalculatorIcon, CheckCircleIcon, AlertCircleIcon, ArrowRightIcon,
  DownloadIcon, MessageCircleIcon, MailIcon, ChevronRightIcon, UserIcon,
} from 'lucide-react';
import { calculateQuotation, QuotationData, QuotationResult } from '../utils/quotationLogic';
import { generateQuotationPDF } from '../utils/pdfGenerator';

const WA_NUMBER = '50235174713';

/* ─── helpers ─────────────────────────────────────── */
function pill(active: boolean, accent: 'purple' | 'emerald' | 'sky' = 'purple') {
  const map = {
    purple: 'bg-purple-500/20 border-purple-500/60 text-purple-300 shadow-purple-500/10',
    emerald: 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300',
    sky: 'bg-sky-500/20 border-sky-500/60 text-sky-300',
  };
  return `w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
    active
      ? `${map[accent]} shadow-lg ring-1 ring-inset ${accent === 'purple' ? 'ring-purple-500/20' : ''}`
      : 'bg-white/3 border-white/8 text-gray-400 hover:border-white/20 hover:bg-white/6 hover:text-gray-300'
  }`;
}

const Label = ({ n, children }: { n: number; children: React.ReactNode }) => (
  <div className="flex items-center gap-2 mb-3">
    <span className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
      {n}
    </span>
    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{children}</label>
  </div>
);

function buildSummary(data: QuotationData): string[] {
  const lines: string[] = [];
  if (data.contribuyente === 'individual') lines.push('Empresa o persona individual');
  if (data.contribuyente === 'sociedad')  lines.push('Sociedad Anónima');
  if (data.regimen === 'pequeño')         lines.push('Régimen Pequeño Contribuyente (IVA 5%)');
  if (data.regimen === 'iva-isr-5-7')     lines.push('Régimen IVA 12% + ISR 5-7%');
  if (data.regimen === 'iva-isr-25-iso')  lines.push('Régimen IVA 12% + ISR 25% + ISO');
  if (data.activos === 'menor-25k')       lines.push('Activos hasta Q25,000');
  if (data.activos === 'mayor-25k')       lines.push('Activos mayores a Q25,000');
  if (data.contabilidadCompleta === 'si') lines.push('Contabilidad completa con sistema Odoo');
  const facMap: Record<string, string> = {
    '0-10': '0–10 facturas/mes', '11-50': '11–50 facturas/mes',
    '51-100': '51–100 facturas/mes', 'mas-100': 'Más de 100 facturas/mes',
  };
  if (data.facturacion && facMap[data.facturacion]) lines.push(`Facturación: ${facMap[data.facturacion]}`);
  if (data.tipoNegocio === 'servicios')    lines.push('Negocio de servicios');
  if (data.tipoNegocio === 'compra-venta') lines.push('Compra-venta de bienes (incluye inventarios)');
  if (data.certificador === 'si')          lines.push('Certificador FEL incluido');
  return lines;
}

function buildWAText(data: QuotationData, result: QuotationResult): string {
  const summary = buildSummary(data);
  const clientLine = data.nombre ? `*${data.nombre}*${data.empresa ? ` — ${data.empresa}` : ''}` : '';
  const lines = [
    `👋 Hola KONTAXES, acabo de generar mi cotización estimada:`,
    clientLine,
    '',
    '📋 *Servicios solicitados:*',
    ...summary.map(s => `• ${s}`),
    '',
    `💰 *Total mensual estimado: Q ${result.total.toLocaleString('es-GT')}.00*`,
    '',
    '¿Podemos agendar una llamada para confirmar los detalles?',
  ].filter(l => l !== undefined);
  return encodeURIComponent(lines.join('\n'));
}

function buildEmailBody(data: QuotationData, result: QuotationResult): string {
  const summary = buildSummary(data);
  const lines = [
    `Estimado equipo de KONTAXES,`,
    ``,
    `He generado la siguiente cotización estimada desde su sitio web:`,
    ``,
    `Datos del solicitante:`,
    data.nombre   ? `Nombre: ${data.nombre}`   : '',
    data.empresa  ? `Empresa: ${data.empresa}`  : '',
    data.whatsapp ? `WhatsApp: ${data.whatsapp}` : '',
    ``,
    `Servicios:`,
    ...summary.map(s => `• ${s}`),
    ``,
    `Total mensual estimado: Q ${result.total.toLocaleString('es-GT')}.00`,
    ``,
    `Quedo a la espera de su contacto.`,
    data.nombre || '',
  ].filter(l => l !== undefined);
  return encodeURIComponent(lines.join('\n'));
}

/* ─── Main component ──────────────────────────────── */
export function QuotationCalculator() {
  const [form, setForm] = useState<QuotationData>({
    contribuyente: '', regimen: '', activos: '', contabilidadCompleta: '',
    facturacion: '', tipoNegocio: '', certificador: '',
    nombre: '', empresa: '', whatsapp: '', correo: '',
  });
  const [result, setResult]     = useState<QuotationResult | null>(null);
  const [error, setError]       = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

  const set = (f: keyof QuotationData, v: string) => {
    setForm(p => ({ ...p, [f]: v }));
    setError('');
  };

  const needsFullAcc = (form.regimen === 'iva-isr-5-7' || form.regimen === 'iva-isr-25-iso') && form.activos === 'mayor-25k';

  useEffect(() => {
    if (needsFullAcc) setForm(p => ({ ...p, contabilidadCompleta: 'si' }));
  }, [form.regimen, form.activos]);

  const completed = [
    !!form.contribuyente, !!form.regimen, !!form.activos,
    needsFullAcc || !!form.contabilidadCompleta,
    !!form.facturacion, !!form.tipoNegocio, !!form.certificador,
  ];
  const doneCount  = completed.filter(Boolean).length;
  const totalSteps = 7;
  const progress   = Math.round((doneCount / totalSteps) * 100);

  const handleCalculate = () => {
    const missing = !form.contribuyente || !form.regimen || !form.activos ||
      (!needsFullAcc && !form.contabilidadCompleta) || !form.facturacion ||
      !form.tipoNegocio || !form.certificador;
    if (missing) { setError('Completa todos los campos para obtener tu cotización.'); return; }
    setResult(calculateQuotation(form));
  };

  const handleDownloadPDF = async () => {
    if (!result) return;
    setPdfLoading(true);
    try {
      await generateQuotationPDF({
        nombre: form.nombre, empresa: form.empresa,
        whatsapp: form.whatsapp, correo: form.correo,
        breakdown: result.breakdown, total: result.total,
        warnings: result.warnings,
        date: new Date().toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric' }),
        formSummary: buildSummary(form),
      });
    } finally {
      setPdfLoading(false);
    }
  };

  const handleWA = async () => {
    if (!result) return;
    await handleDownloadPDF();
    setTimeout(() => {
      window.open(`https://wa.me/${WA_NUMBER}?text=${buildWAText(form, result)}`, '_blank');
    }, 400);
  };

  const handleEmail = async () => {
    if (!result) return;
    await handleDownloadPDF();
    setTimeout(() => {
      window.open(
        `mailto:info@kontaxes.com?subject=${encodeURIComponent('Cotización KONTAXES')}&body=${buildEmailBody(form, result)}`,
        '_blank'
      );
    }, 400);
  };

  return (
    <section id="cotizador" className="py-24 bg-gray-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/8 to-transparent pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none grid-bg opacity-25" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-purple-700/6 rounded-full blur-3xl orb-float pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-56 h-56 bg-violet-700/5 rounded-full blur-3xl orb-float-reverse pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative">

        {/* Header */}
        <div className="text-center mb-12 reveal">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-purple-400 mb-3">Precios Personalizados</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Cotizador
          </h2>
          <p className="text-gray-400 text-lg">Obtén tu estimación de precio en segundos</p>
        </div>

        <div className="reveal space-y-6">

          {/* Progress bar */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Progreso</span>
              <span className="text-xs font-bold text-purple-400">{doneCount}/{totalSteps} completados</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-violet-400 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex gap-1.5 mt-3">
              {completed.map((done, i) => (
                <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${done ? 'bg-purple-500' : 'bg-white/10'}`} />
              ))}
            </div>
          </div>

          {/* Form card */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6 md:p-8 space-y-8">

            {/* Step header */}
            <div className="flex items-center gap-3 pb-5 border-b border-white/5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center">
                <CalculatorIcon className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Calculadora de Servicios</p>
                <p className="text-gray-500 text-xs">Selecciona tu situación — los precios son en GTQ/mes</p>
              </div>
            </div>

            {/* 1. Tipo contribuyente */}
            <div>
              <Label n={1}>Tipo de contribuyente</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: 'individual', label: 'Empresa o persona individual', icon: '🏢' },
                  { val: 'sociedad',   label: 'Sociedad Anónima (S.A.)',       icon: '🏛️' },
                ].map(o => (
                  <button key={o.val} onClick={() => set('contribuyente', o.val)} className={pill(form.contribuyente === o.val)}>
                    <span className="text-lg mb-1 block">{o.icon}</span>
                    <span className="block font-semibold text-xs leading-snug">{o.label}</span>
                    {form.contribuyente === o.val && <CheckCircleIcon size={12} className="mt-1 text-purple-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Régimen */}
            <div>
              <Label n={2}>Régimen de impuestos</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { val: 'pequeño',       label: 'Pequeño Contribuyente', sub: 'IVA 5%' },
                  { val: 'iva-isr-5-7',   label: 'IVA 12% + ISR 5-7%',   sub: 'Régimen opcional' },
                  { val: 'iva-isr-25-iso',label: 'IVA 12% + ISR 25%',    sub: '+ ISO (régimen general)' },
                ].map(o => (
                  <button key={o.val} onClick={() => set('regimen', o.val)} className={pill(form.regimen === o.val)}>
                    <span className="block font-semibold text-xs leading-snug">{o.label}</span>
                    <span className="block text-xs opacity-50 mt-0.5">{o.sub}</span>
                    {form.regimen === o.val && <CheckCircleIcon size={12} className="mt-1 text-purple-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Activos */}
            <div>
              <Label n={3}>Monto de activos</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: 'menor-25k', label: 'Activos de Q0 a Q25,000',     sub: 'No requiere contabilidad completa' },
                  { val: 'mayor-25k', label: 'Activos mayores a Q25,000',   sub: 'Requiere contabilidad completa' },
                ].map(o => (
                  <button key={o.val} onClick={() => set('activos', o.val)} className={pill(form.activos === o.val)}>
                    <span className="block font-semibold text-xs">{o.label}</span>
                    <span className="block text-xs opacity-50 mt-0.5">{o.sub}</span>
                    {form.activos === o.val && <CheckCircleIcon size={12} className="mt-1 text-purple-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Contabilidad completa (conditional) */}
            {!needsFullAcc && form.activos && (
              <div>
                <Label n={4}>¿Desea contabilidad completa con Odoo?</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: 'si', label: 'Sí, con sistema Odoo', icon: '✅' },
                    { val: 'no', label: 'No por ahora',          icon: '⏩' },
                  ].map(o => (
                    <button key={o.val} onClick={() => set('contabilidadCompleta', o.val)} className={pill(form.contabilidadCompleta === o.val)}>
                      <span className="text-lg mb-1 block">{o.icon}</span>
                      <span className="block font-semibold text-xs">{o.label}</span>
                      {form.contabilidadCompleta === o.val && <CheckCircleIcon size={12} className="mt-1 text-purple-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {needsFullAcc && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs">
                <CheckCircleIcon size={14} className="flex-shrink-0" />
                Contabilidad completa con Odoo es <strong className="mx-1">obligatoria por ley</strong> para tu situación.
              </div>
            )}

            {/* 5. Facturación */}
            <div>
              <Label n={5}>Facturas emitidas al mes</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { val: '0-10',    label: '0 – 10',        icon: '📄' },
                  { val: '11-50',   label: '11 – 50',       icon: '📋' },
                  { val: '51-100',  label: '51 – 100',      icon: '📁' },
                  { val: 'mas-100', label: '100+',          icon: '🗂️' },
                ].map(o => (
                  <button key={o.val} onClick={() => set('facturacion', o.val)} className={pill(form.facturacion === o.val)}>
                    <span className="text-xl mb-1 block">{o.icon}</span>
                    <span className="block font-bold">{o.label}</span>
                    {form.facturacion === o.val && <CheckCircleIcon size={12} className="mt-1 text-purple-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Tipo de negocio */}
            <div>
              <Label n={6}>Tipo de negocio</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: 'servicios',    label: 'Servicios técnicos, profesionales o en general', icon: '💼' },
                  { val: 'compra-venta', label: 'Compra-venta de bienes',                          icon: '🛒' },
                ].map(o => (
                  <button key={o.val} onClick={() => set('tipoNegocio', o.val)} className={pill(form.tipoNegocio === o.val)}>
                    <span className="text-2xl mb-1 block">{o.icon}</span>
                    <span className="block font-semibold text-xs leading-snug">{o.label}</span>
                    {form.tipoNegocio === o.val && <CheckCircleIcon size={12} className="mt-1 text-purple-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 7. Certificador FEL */}
            <div>
              <Label n={7}>¿Necesitas certificador FEL (Factura Electrónica)?</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: 'si', label: 'Sí, necesito FEL',            icon: '🧾' },
                  { val: 'no', label: 'No por ahora',                  icon: '⏩' },
                ].map(o => (
                  <button key={o.val} onClick={() => set('certificador', o.val)} className={pill(form.certificador === o.val)}>
                    <span className="text-2xl mb-1 block">{o.icon}</span>
                    <span className="block font-semibold text-xs">{o.label}</span>
                    {form.certificador === o.val && <CheckCircleIcon size={12} className="mt-1 text-purple-400" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Optional contact info */}
          <div className="bg-white/2 border border-white/6 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <UserIcon size={16} className="text-purple-400" />
              <span className="text-sm font-semibold text-gray-300">Tus datos <span className="text-gray-600 font-normal">(opcional — para incluir en la cotización)</span></span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {([
                { key: 'nombre',   placeholder: 'Nombre completo',   type: 'text' },
                { key: 'empresa',  placeholder: 'Nombre de empresa', type: 'text' },
                { key: 'whatsapp', placeholder: 'WhatsApp (+502...)', type: 'tel'  },
                { key: 'correo',   placeholder: 'Correo electrónico', type: 'email'},
              ] as const).map(f => (
                <input
                  key={f.key}
                  type={f.type}
                  placeholder={f.placeholder}
                  value={form[f.key] || ''}
                  onChange={e => set(f.key, e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-white/4 border border-white/8 text-gray-300 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/6 transition-all"
                />
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircleIcon size={16} className="flex-shrink-0" /> {error}
            </div>
          )}

          {/* CTA */}
          {!result && (
            <button
              onClick={handleCalculate}
              disabled={doneCount < totalSteps}
              className={`w-full py-4 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-base ${
                doneCount === totalSteps
                  ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5 hover:from-purple-500 hover:to-violet-500 cursor-pointer'
                  : 'bg-white/5 border border-white/8 text-gray-600 cursor-not-allowed'
              }`}
            >
              <CalculatorIcon size={20} />
              {doneCount < totalSteps ? `Completa ${totalSteps - doneCount} campo(s) más` : 'Calcular mi cotización →'}
            </button>
          )}

          {/* Result */}
          {result && (
            <div className="border border-purple-500/30 rounded-2xl overflow-hidden animate-fade-in">

              {/* Total header */}
              <div className="bg-gradient-to-r from-purple-900/60 to-violet-900/40 p-6 border-b border-purple-500/20">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-1">Tu Cotización Estimada</p>
                    <p className="text-gray-400 text-sm">Servicios contables mensuales en GTQ</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Total mensual</p>
                    <p className="text-4xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Q {result.total.toLocaleString('es-GT')}
                      <span className="text-gray-500 text-lg font-normal">.00</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Summary list (no prices) */}
              <div className="p-6 bg-white/2 border-b border-white/5">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Servicios incluidos</p>
                <div className="space-y-2">
                  {buildSummary(form).map((line, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                      <CheckCircleIcon size={15} className="text-purple-400 flex-shrink-0" />
                      {line}
                    </div>
                  ))}
                </div>
              </div>

              {/* Warnings */}
              {result.warnings.length > 0 && (
                <div className="p-4 bg-yellow-500/5 border-b border-yellow-500/10 space-y-2">
                  {result.warnings.map((w, i) => (
                    <div key={i} className="flex gap-2 text-xs text-yellow-300">
                      <AlertCircleIcon size={13} className="flex-shrink-0 mt-0.5" /> {w}
                    </div>
                  ))}
                </div>
              )}

              {/* Disclaimer */}
              <div className="px-6 py-3 bg-blue-500/5 border-b border-blue-500/10">
                <p className="text-xs text-blue-300">
                  ℹ Esta es una <strong>estimación</strong>. La cotización formal se enviará al formalizar el servicio.
                </p>
              </div>

              {/* Action buttons */}
              <div className="p-6 grid sm:grid-cols-3 gap-3">
                <button
                  onClick={handleDownloadPDF}
                  disabled={pdfLoading}
                  className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold rounded-xl hover:from-purple-500 hover:to-violet-500 transition-all hover:-translate-y-0.5 shadow-lg text-sm"
                >
                  <DownloadIcon size={15} />
                  {pdfLoading ? 'Generando...' : 'Descargar PDF'}
                </button>

                <button
                  onClick={handleWA}
                  className="flex items-center justify-center gap-2 py-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold rounded-xl hover:bg-emerald-500/25 transition-all text-sm"
                >
                  <MessageCircleIcon size={15} />
                  WhatsApp
                </button>

                <button
                  onClick={handleEmail}
                  className="flex items-center justify-center gap-2 py-3 bg-purple-500/15 border border-purple-500/30 text-purple-400 font-bold rounded-xl hover:bg-purple-500/25 transition-all text-sm"
                >
                  <MailIcon size={15} />
                  Correo
                </button>
              </div>

              {/* Recalculate */}
              <div className="px-6 pb-5 text-center">
                <button
                  onClick={() => setResult(null)}
                  className="text-xs text-gray-600 hover:text-gray-400 transition-colors flex items-center gap-1 mx-auto"
                >
                  <ChevronRightIcon size={11} className="rotate-180" /> Modificar cotización
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
