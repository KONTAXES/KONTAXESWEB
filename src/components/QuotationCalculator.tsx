import React, { useState } from 'react';
import {
  CheckCircleIcon, AlertCircleIcon,
  DownloadIcon, MessageCircleIcon,
  ChevronLeftIcon, PhoneIcon, MailIcon,
} from 'lucide-react';
import {
  QuotationData, QuotationResult, ServiceType, Contribuyente,
  Regimen, Alcance, CertFEL,
  calculateQuotation, buildFormSummary, buildWAText, buildEmailBody,
  isContabilidadObligatoria, needsActivosQuestion,
  SERVICE_LABEL, FORMS,
} from '../utils/quotationLogic';
import { generateQuotationPDF } from '../utils/pdfGenerator';

const WA_NUMBER = '50235174713';

type StepId =
  | 'service-type' | 'contribuyente' | 'regimen' | 'activos'
  | 'alcance' | 'contabilidad' | 'impuestos' | 'cert-fel'
  | 'wa-fel' | 'contact' | 'contact-service';

function getActiveSteps(form: QuotationData): StepId[] {
  const s: StepId[] = ['service-type'];
  if (!form.serviceType) return s;
  if (form.serviceType !== 'contable') { s.push('contact-service'); return s; }
  s.push('contribuyente');
  if (!form.contribuyente) return s;
  s.push('regimen');
  if (!form.regimen) return s;
  if (needsActivosQuestion(form)) {
    s.push('activos');
    if (form.activosMayor25k === null) return s;
  }
  s.push('alcance');
  if (!form.alcance) return s;
  if (!isContabilidadObligatoria(form)) {
    s.push('contabilidad');
    if (form.contabilidadCompleta === null) return s;
  }
  s.push('impuestos');
  if (form.presentacionImpuestos === null) return s;
  s.push('cert-fel');
  if (!form.certFEL) return s;
  s.push('wa-fel');
  if (form.whatsappFEL === null) return s;
  s.push('contact');
  return s;
}

function getFullStepList(form: QuotationData): StepId[] {
  if (!form.serviceType) return ['service-type'];
  if (form.serviceType !== 'contable') return ['service-type', 'contact-service'];
  const s: StepId[] = ['service-type', 'contribuyente', 'regimen'];
  const maybeActivos =
    !form.contribuyente ||
    (form.contribuyente === 'sociedad' && (!form.regimen || form.regimen === 'pequeño'));
  if (maybeActivos) s.push('activos');
  s.push('alcance');
  if (!isContabilidadObligatoria(form)) s.push('contabilidad');
  s.push('impuestos', 'cert-fel', 'wa-fel', 'contact');
  return s;
}

/* ── Carousel option card ───────────────────────────────────────── */
const Card = ({
  label, selected, onClick, delay = 0,
}: {
  label: string; selected: boolean; onClick: () => void; delay?: number;
}) => (
  <button
    onClick={onClick}
    style={{ animationDelay: `${delay}ms` }}
    className={`animate-opt-in w-full text-left px-8 py-5 rounded-2xl font-bold text-lg transition-all duration-300 relative overflow-hidden group ${
      selected
        ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-2xl shadow-purple-500/40 border border-purple-400/40 scale-[1.02]'
        : 'bg-white/4 border border-white/10 text-gray-200 hover:border-purple-500/50 hover:text-white hover:scale-[1.015] hover:bg-white/7'
    }`}
  >
    {/* Shimmer sweep on hover */}
    {!selected && (
      <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/4 to-transparent pointer-events-none" />
    )}
    {selected && (
      <span className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none rounded-2xl" />
    )}
    <span className="relative flex items-center gap-3">
      {selected && (
        <span className="inline-flex w-2 h-2 rounded-full bg-white shadow-lg shadow-white/50 flex-shrink-0" />
      )}
      {label}
    </span>
  </button>
);

/* ── Question header ────────────────────────────────────────────── */
const Q = ({ question, hint }: { question: string; hint?: string }) => (
  <div className="mb-8">
    <h3
      className="text-3xl md:text-4xl font-bold text-white leading-tight mb-2"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      {question}
    </h3>
    {hint && <p className="text-gray-500 text-sm mt-1">{hint}</p>}
  </div>
);

/* ── Empty form ─────────────────────────────────────────────────── */
const EMPTY: QuotationData = {
  serviceType: '', contribuyente: '', regimen: '',
  activosMayor25k: null, alcance: '', contabilidadCompleta: null,
  presentacionImpuestos: null, certFEL: '', whatsappFEL: null,
  nombre: '', empresa: '', whatsapp: '', correo: '',
};

/* ── Main ───────────────────────────────────────────────────────── */
export function QuotationCalculator() {
  const [form, setForm]       = useState<QuotationData>(EMPTY);
  const [idx, setIdx]         = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [back, setBack]       = useState(false);
  const [result, setResult]   = useState<QuotationResult | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const steps     = getActiveSteps(form);
  const fullSteps = getFullStepList(form);
  const stepId    = steps[Math.min(idx, steps.length - 1)];
  const prog      = fullSteps.length > 1 ? Math.round((idx / (fullSteps.length - 1)) * 100) : 0;
  const stepLabel = `${idx + 1} / ${fullSteps.length}`;

  const advance = () => { setBack(false); setAnimKey(k => k + 1); setIdx(i => i + 1); };
  const retreat = () => {
    if (idx === 0) return;
    setResult(null); setBack(true); setAnimKey(k => k + 1); setIdx(i => i - 1);
  };
  const pick = (setter: () => void) => { setter(); setTimeout(advance, 260); };

  const sServiceType   = (v: ServiceType)   => setForm({ ...EMPTY, serviceType: v, nombre: form.nombre, empresa: form.empresa, whatsapp: form.whatsapp, correo: form.correo });
  const sContribuyente = (v: Contribuyente) => setForm(p => ({ ...p, contribuyente: v, regimen: '', activosMayor25k: null, alcance: '', contabilidadCompleta: null, presentacionImpuestos: null, certFEL: '', whatsappFEL: null }));
  const sRegimen       = (v: Regimen)       => setForm(p => ({ ...p, regimen: v, activosMayor25k: null, alcance: '', contabilidadCompleta: null, presentacionImpuestos: null, certFEL: '', whatsappFEL: null }));
  const sActivos       = (v: boolean)       => setForm(p => ({ ...p, activosMayor25k: v, alcance: '', contabilidadCompleta: null, presentacionImpuestos: null, certFEL: '', whatsappFEL: null }));
  const sAlcance       = (v: Alcance) => {
    const ob = isContabilidadObligatoria(form);
    setForm(p => ({ ...p, alcance: v, contabilidadCompleta: ob ? true : null, presentacionImpuestos: null, certFEL: '', whatsappFEL: null }));
  };
  const sContabilidad  = (v: boolean) => setForm(p => ({ ...p, contabilidadCompleta: v, presentacionImpuestos: null, certFEL: '', whatsappFEL: null }));
  const sImpuestos     = (v: boolean) => setForm(p => ({ ...p, presentacionImpuestos: v, certFEL: '', whatsappFEL: null }));
  const sCertFEL       = (v: CertFEL) => setForm(p => ({ ...p, certFEL: v, whatsappFEL: null }));
  const sWhatsappFEL   = (v: boolean) => setForm(p => ({ ...p, whatsappFEL: v }));
  const sContact       = (k: 'nombre' | 'empresa' | 'whatsapp' | 'correo', v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleCalc = () => setResult(calculateQuotation(form));

  const handlePDF = async () => {
    if (!result) return;
    setPdfLoading(true);
    try {
      await generateQuotationPDF({
        nombre: form.nombre, empresa: form.empresa,
        whatsapp: form.whatsapp, correo: form.correo,
        breakdown: result.breakdown, total: result.total,
        warnings: result.notes,
        date: new Date().toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric' }),
        formSummary: buildFormSummary(form),
      });
    } finally { setPdfLoading(false); }
  };

  const handleWA = () => {
    if (!result) return;
    window.open(`https://wa.me/${WA_NUMBER}?text=${buildWAText(form, result)}`, '_blank');
  };

  const handleEmail = () => {
    if (!result) return;
    window.open(`mailto:info@kontaxes.com?subject=${encodeURIComponent('Cotización KONTAXES')}&body=${buildEmailBody(form, result)}`, '_blank');
  };

  const handleReset = () => { setForm(EMPTY); setIdx(0); setAnimKey(k => k + 1); setBack(false); setResult(null); };

  /* ── Step renderers ─────────────────────────────────────────────── */

  const stepServiceType = () => (
    <>
      <Q question="¿Qué servicio necesitas?" />
      <div className="space-y-3">
        {([
          ['contable',           'Servicios Contables'],
          ['auditoria',          'Auditoría'],
          ['outsourcing',        'Outsourcing'],
          ['modulos-odoo',       'Módulos Odoo'],
          ['implementacion-odoo','Implementación Odoo'],
        ] as [ServiceType, string][]).map(([v, label], i) => (
          <Card key={v} label={label} delay={i * 70}
            selected={form.serviceType === v}
            onClick={() => pick(() => sServiceType(v))} />
        ))}
      </div>
    </>
  );

  const stepContactService = () => {
    const label = SERVICE_LABEL[form.serviceType as ServiceType] ?? '';
    return (
      <div className="py-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/15 border border-purple-500/25 mb-6">
          <span className="text-3xl">✉️</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {label}
        </h3>
        <p className="text-gray-400 text-sm max-w-xs mx-auto mb-8 leading-relaxed">
          Este servicio requiere una propuesta personalizada. Contáctanos para coordinar.
        </p>
        <div className="space-y-3 max-w-xs mx-auto">
          <a href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hola KONTAXES, me interesa cotizar: ${label}`)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold rounded-2xl hover:bg-emerald-500/25 transition-all w-full">
            <PhoneIcon size={15} /> Contactar por WhatsApp
          </a>
          <a href={`mailto:info@kontaxes.com?subject=${encodeURIComponent(`Cotización: ${label}`)}`}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-white/4 border border-white/10 text-gray-300 font-bold rounded-2xl hover:bg-white/8 transition-all w-full">
            <MailIcon size={15} /> Enviar correo
          </a>
        </div>
      </div>
    );
  };

  const stepContribuyente = () => (
    <>
      <Q question="¿Quién es el contribuyente?" />
      <div className="space-y-3">
        <Card label="Persona / Comerciante Individual" delay={0}
          selected={form.contribuyente === 'individual'}
          onClick={() => pick(() => sContribuyente('individual'))} />
        <Card label="Sociedad / Empresa" delay={70}
          selected={form.contribuyente === 'sociedad'}
          onClick={() => pick(() => sContribuyente('sociedad'))} />
      </div>
    </>
  );

  const stepRegimen = () => (
    <>
      <Q question="¿Cuál es tu régimen fiscal?" />
      <div className="space-y-3">
        {([
          ['pequeño',  'Pequeño Contribuyente'],
          ['opcional', 'Régimen Opcional (IVA 12% + ISR 5–7%)'],
          ['general',  'Régimen General (IVA 12% + ISR 25%)'],
        ] as [Regimen, string][]).map(([v, label], i) => (
          <Card key={v} label={label} delay={i * 70}
            selected={form.regimen === v}
            onClick={() => pick(() => sRegimen(v))} />
        ))}
      </div>
    </>
  );

  const stepActivos = () => (
    <>
      <Q question="¿Tus activos superan Q25,000?" />
      <div className="space-y-3">
        <Card label="Sí, superan Q25,000" delay={0}
          selected={form.activosMayor25k === true}
          onClick={() => pick(() => sActivos(true))} />
        <Card label="No, son Q25,000 o menos" delay={70}
          selected={form.activosMayor25k === false}
          onClick={() => pick(() => sActivos(false))} />
      </div>
    </>
  );

  const stepAlcance = () => (
    <>
      <Q question="¿A qué se dedica tu negocio?" />
      <div className="space-y-3">
        <Card label="Prestación de servicios" delay={0}
          selected={form.alcance === 'servicios'}
          onClick={() => pick(() => sAlcance('servicios'))} />
        <Card label="Compra-venta de bienes" delay={70}
          selected={form.alcance === 'compra-venta'}
          onClick={() => pick(() => sAlcance('compra-venta'))} />
      </div>
    </>
  );

  const stepContabilidad = () => (
    <>
      <Q question="¿Deseas contabilidad completa?" hint="Recomendado para una gestión financiera sólida" />
      <div className="space-y-3">
        <Card label="Sí, con contabilidad completa" delay={0}
          selected={form.contabilidadCompleta === true}
          onClick={() => pick(() => sContabilidad(true))} />
        <Card label="No por ahora" delay={70}
          selected={form.contabilidadCompleta === false}
          onClick={() => pick(() => sContabilidad(false))} />
      </div>
    </>
  );

  const stepImpuestos = () => {
    const reg = form.regimen as Regimen;
    const n = FORMS[reg];
    const obligatoria = isContabilidadObligatoria(form);
    return (
      <>
        {obligatoria && (
          <div className="flex items-start gap-2 mb-5 px-4 py-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <CheckCircleIcon size={14} className="text-purple-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-purple-300 leading-relaxed">
              Contabilidad completa incluida automáticamente — obligatoria por ley para tu perfil.
            </p>
          </div>
        )}
        <Q question="¿Presentamos tus impuestos?" hint={`${n} formulario${n > 1 ? 's' : ''} ante la SAT`} />
        <div className="space-y-3">
          <Card label="Sí, que KONTAXES los presente" delay={0}
            selected={form.presentacionImpuestos === true}
            onClick={() => pick(() => sImpuestos(true))} />
          <Card label="No, los gestiono yo" delay={70}
            selected={form.presentacionImpuestos === false}
            onClick={() => pick(() => sImpuestos(false))} />
        </div>
      </>
    );
  };

  const stepCertFEL = () => {
    // Odoo only when full accounting + inventory/cost system
    const needsOdoo = form.alcance === 'compra-venta' && form.contabilidadCompleta === true;
    return needsOdoo ? (
      <>
        <Q question="¿Necesitas certificador FEL?"
          hint="Sistema ERP con Odoo — CORPOSISTEMAS, S.A." />
        <div className="space-y-3">
          <Card label="No por ahora" delay={0}
            selected={form.certFEL === 'ninguno'}
            onClick={() => pick(() => sCertFEL('ninguno'))} />
          <Card label="Sí — Q375 implementación + Q0.20 por DTE" delay={70}
            selected={form.certFEL === 'odoo'}
            onClick={() => pick(() => sCertFEL('odoo'))} />
        </div>
      </>
    ) : (
      <>
        <Q question="¿Necesitas certificador FEL?"
          hint="Factura Electrónica en Línea certificada por la SAT — vía FinanzIA" />
        <div className="space-y-3">
          <Card label="No por ahora" delay={0}
            selected={form.certFEL === 'ninguno'}
            onClick={() => pick(() => sCertFEL('ninguno'))} />
          <Card label="Sí — Q0.20 por DTE" delay={70}
            selected={form.certFEL === 'finanz-ia'}
            onClick={() => pick(() => sCertFEL('finanz-ia'))} />
        </div>
      </>
    );
  };

  const stepWAFel = () => (
    <>
      <Q question="¿Facturas por WhatsApp?" hint="FELSimple — emisión de facturas certificadas desde WhatsApp" />
      <div className="space-y-3">
        <Card label="Sí, quiero FELSimple" delay={0}
          selected={form.whatsappFEL === true}
          onClick={() => pick(() => sWhatsappFEL(true))} />
        <Card label="No por ahora" delay={70}
          selected={form.whatsappFEL === false}
          onClick={() => pick(() => sWhatsappFEL(false))} />
      </div>
    </>
  );

  const stepContact = () => {
    const preview = calculateQuotation(form);
    return (
      <>
        <Q question="¿Tus datos de contacto?" hint="Opcional — para personalizar tu cotización y PDF" />
        <div className="grid grid-cols-2 gap-3 mb-6">
          {([
            { k: 'nombre'   as const, p: 'Nombre completo',   t: 'text'  },
            { k: 'empresa'  as const, p: 'Empresa',           t: 'text'  },
            { k: 'whatsapp' as const, p: 'WhatsApp',          t: 'tel'   },
            { k: 'correo'   as const, p: 'Correo electrónico',t: 'email' },
          ]).map(f => (
            <input key={f.k} type={f.t} placeholder={f.p}
              value={form[f.k] || ''}
              onChange={e => sContact(f.k, e.target.value)}
              className="px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/8 transition-all" />
          ))}
        </div>
        {preview.total > 0 && (
          <div className="flex items-center justify-between px-5 py-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-violet-500/10 border border-purple-500/20 mb-5">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400">Estimado</span>
            <span className="text-3xl font-bold text-white tabular-nums" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Q {preview.total.toLocaleString('es-GT')}
              <span className="text-gray-500 text-base font-normal ml-1">/mes</span>
            </span>
          </div>
        )}
        <button onClick={handleCalc}
          className="w-full py-4 font-bold rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5 hover:from-purple-500 hover:to-violet-500 transition-all text-base relative overflow-hidden group">
          <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <span className="relative">Ver mi cotización →</span>
        </button>
      </>
    );
  };

  const renderStep = () => {
    switch (stepId) {
      case 'service-type':    return stepServiceType();
      case 'contact-service': return stepContactService();
      case 'contribuyente':   return stepContribuyente();
      case 'regimen':         return stepRegimen();
      case 'activos':         return stepActivos();
      case 'alcance':         return stepAlcance();
      case 'contabilidad':    return stepContabilidad();
      case 'impuestos':       return stepImpuestos();
      case 'cert-fel':        return stepCertFEL();
      case 'wa-fel':          return stepWAFel();
      case 'contact':         return stepContact();
      default: return null;
    }
  };

  /* ── Result screen ──────────────────────────────────────────────── */
  const renderResult = () => {
    const summary = buildFormSummary(form);
    return (
      <div className="animate-fade-in">

        {/* Hero total */}
        <div className="relative overflow-hidden px-8 py-10 border-b border-white/8">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-950/60 via-violet-950/40 to-transparent pointer-events-none" />
          <div className="absolute -top-8 -right-8 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative text-center">
            <p className="text-xs font-bold uppercase tracking-[3px] text-purple-400 mb-4">Cotización Estimada</p>
            <p className="text-7xl font-black text-white tabular-nums mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Q {result!.total.toLocaleString('es-GT')}
            </p>
            <p className="text-gray-500 text-sm">por mes · IVA incluido</p>
            {form.nombre && (
              <p className="text-purple-300 text-sm font-medium mt-3">
                {form.nombre}{form.empresa ? ` · ${form.empresa}` : ''}
              </p>
            )}
          </div>
        </div>

        {/* What was selected */}
        {summary.length > 0 && (
          <div className="px-8 py-6 border-b border-white/6">
            <p className="text-xs font-bold uppercase tracking-[2px] text-gray-500 mb-4">Servicios seleccionados</p>
            <div className="space-y-2">
              {summary.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircleIcon size={14} className="text-purple-400 flex-shrink-0" />
                  <span className="text-sm text-gray-300">{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cost breakdown */}
        <div className="px-8 py-6 border-b border-white/6">
          <p className="text-xs font-bold uppercase tracking-[2px] text-gray-500 mb-4">Desglose de costos</p>
          <div className="space-y-3">
            {result!.breakdown.map((item, i) => (
              <div key={i} className="flex items-baseline justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-300 leading-snug">{item.item}</p>
                  {item.note && <p className="text-xs text-gray-600 mt-0.5">{item.note}</p>}
                </div>
                <p className="text-sm font-bold text-purple-300 tabular-nums flex-shrink-0">
                  Q {item.cost.toLocaleString('es-GT')}
                </p>
              </div>
            ))}
            <div className="flex items-center justify-between pt-3 border-t border-white/8 mt-1">
              <p className="text-sm font-bold text-white">Total mensual</p>
              <p className="text-xl font-black text-white tabular-nums" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Q {result!.total.toLocaleString('es-GT')}
              </p>
            </div>
          </div>
        </div>

        {/* Variable notes */}
        {result!.notes.length > 0 && (
          <div className="px-8 py-4 bg-amber-500/5 border-b border-amber-500/10">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-400/80 mb-2">Costos adicionales variables</p>
            {result!.notes.map((n, i) => (
              <div key={i} className="flex gap-2 mt-1">
                <AlertCircleIcon size={13} className="text-amber-400/70 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-300/70 leading-relaxed">{n}</p>
              </div>
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <div className="px-8 py-3 border-b border-white/5">
          <p className="text-xs text-gray-600">
            Esta es una estimación. La cotización formal y contrato se enviarán al confirmar el servicio.
          </p>
        </div>

        {/* Actions */}
        <div className="px-8 py-6 grid sm:grid-cols-2 gap-3">
          <button onClick={handlePDF} disabled={pdfLoading}
            className="relative overflow-hidden group flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold rounded-2xl hover:from-purple-500 hover:to-violet-500 transition-all hover:-translate-y-0.5 shadow-xl shadow-purple-500/20 text-sm">
            <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            <DownloadIcon size={15} />
            <span className="relative">{pdfLoading ? 'Generando…' : 'Descargar PDF'}</span>
          </button>
          <button onClick={handleWA}
            className="relative overflow-hidden group flex items-center justify-center gap-2 py-4 bg-emerald-500/12 border border-emerald-500/30 text-emerald-400 font-bold rounded-2xl hover:bg-emerald-500/20 hover:-translate-y-0.5 transition-all shadow-lg text-sm">
            <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent" />
            <MessageCircleIcon size={15} />
            <span className="relative">Enviar por WhatsApp</span>
          </button>
        </div>

        <div className="px-8 pb-6 text-center">
          <button onClick={handleReset} className="text-xs text-gray-700 hover:text-gray-400 transition-colors">
            ← Nueva cotización
          </button>
        </div>
      </div>
    );
  };

  /* ── Layout ─────────────────────────────────────────────────────── */
  return (
    <section id="cotizador" className="py-24 relative overflow-hidden bg-gray-950">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent pointer-events-none" />
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
      <div className="absolute top-24 right-0 w-96 h-96 bg-purple-700/8 rounded-full blur-3xl orb-float pointer-events-none" />
      <div className="absolute bottom-24 left-0 w-80 h-80 bg-violet-700/6 rounded-full blur-3xl orb-float-reverse pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-900/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 relative">

        {/* Header */}
        <div className="text-center mb-12 reveal">
          <span className="inline-block text-xs font-bold tracking-[3px] uppercase text-purple-400 mb-3">
            Precios Personalizados
          </span>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-3"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Cotizador
          </h2>
          <p className="text-gray-500">Responde las preguntas y obtén tu precio al instante</p>
        </div>

        {/* Wizard card */}
        <div className="reveal relative">
          {/* Card glow border */}
          <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-purple-500/20 via-transparent to-violet-500/10 pointer-events-none" />

          <div className="relative bg-gray-900/80 backdrop-blur-xl border border-white/8 rounded-3xl overflow-hidden shadow-2xl shadow-purple-950/50">
            {result ? renderResult() : (
              <>
                {/* Progress bar */}
                <div className="flex items-center gap-3 px-6 pt-5 pb-4">
                  <button onClick={retreat} disabled={idx === 0}
                    className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all flex-shrink-0 ${
                      idx > 0
                        ? 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer'
                        : 'opacity-0 pointer-events-none'
                    }`}>
                    <ChevronLeftIcon size={16} />
                  </button>

                  <div className="flex-1 h-1 bg-white/6 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${Math.max(prog, 3)}%`,
                        background: 'linear-gradient(90deg, #7c3aed, #a855f7, #7c3aed)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmerBar 2.5s linear infinite',
                      }}
                    />
                  </div>

                  <span className="text-xs text-gray-600 tabular-nums flex-shrink-0 w-12 text-right font-medium">
                    {stepLabel}
                  </span>
                </div>

                {/* Animated slide content */}
                <div
                  key={animKey}
                  className={back ? 'animate-slide-in-back' : 'animate-slide-in'}
                >
                  <div className="px-8 pt-6 pb-8 min-h-[460px] flex flex-col">
                    <div className="flex-1">
                      {renderStep()}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
