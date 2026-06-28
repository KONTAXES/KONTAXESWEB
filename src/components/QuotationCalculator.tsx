import React, { useState } from 'react';
import {
  CalculatorIcon, CheckCircleIcon, AlertCircleIcon,
  DownloadIcon, MessageCircleIcon, MailIcon,
  ChevronLeftIcon, ArrowRightIcon, PhoneIcon,
} from 'lucide-react';
import {
  QuotationData, QuotationResult, ServiceType, Contribuyente,
  Regimen, Alcance, CertFEL,
  calculateQuotation, buildFormSummary, buildWAText, buildEmailBody,
  isContabilidadObligatoria, needsActivosQuestion,
  REGIMEN_LABEL, CONTRIB_LABEL, SERVICE_LABEL, FORMS,
} from '../utils/quotationLogic';
import { generateQuotationPDF } from '../utils/pdfGenerator';

const WA_NUMBER = '50236387717';

/* ── Step IDs ───────────────────────────────────────────────────── */
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

function getTotalSteps(form: QuotationData): number {
  if (!form.serviceType) return 2;
  if (form.serviceType !== 'contable') return 2;
  let n = 6; // service-type, contribuyente, regimen, alcance, impuestos, cert-fel, wa-fel, contact
  const maybeActivos = !form.contribuyente || (form.contribuyente === 'sociedad' && (!form.regimen || form.regimen === 'pequeño'));
  if (maybeActivos) n++;
  if (!isContabilidadObligatoria(form)) n++;
  return n + 2; // cert-fel, wa-fel, contact
}

/* ── Sub-components ─────────────────────────────────────────────── */

const Opt = ({
  label, sub, selected, accent = 'purple', onClick,
}: {
  icon?: string; label: string; sub?: string; selected: boolean;
  badge?: string; accent?: 'purple' | 'emerald' | 'sky' | 'amber';
  onClick: () => void;
}) => {
  const ring: Record<string, string> = {
    purple: 'border-purple-500/60 bg-purple-500/15 shadow-purple-500/10',
    emerald: 'border-emerald-500/60 bg-emerald-500/15',
    sky:    'border-sky-500/60 bg-sky-500/15',
    amber:  'border-amber-500/60 bg-amber-500/15',
  };
  const check: Record<string, string> = {
    purple: 'text-purple-400', emerald: 'text-emerald-400',
    sky: 'text-sky-400', amber: 'text-amber-400',
  };
  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all duration-200 ${
        selected
          ? `${ring[accent]} shadow-lg`
          : 'border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/6'
      }`}
    >
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm leading-snug ${selected ? 'text-white' : 'text-gray-200'}`}>{label}</p>
      </div>
      {selected
        ? <CheckCircleIcon size={18} className={`flex-shrink-0 ${check[accent]}`} />
        : <div className="w-5 h-5 rounded-full border-2 border-white/15 flex-shrink-0" />
      }
    </button>
  );
};

const Q = ({ question, hint }: { icon?: string; question: string; hint?: string }) => (
  <div className="mb-7">
    <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-2"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {question}
    </h3>
    {hint && <p className="text-gray-400 text-sm leading-relaxed">{hint}</p>}
  </div>
);

/* ── Empty form ─────────────────────────────────────────────────── */
const EMPTY: QuotationData = {
  serviceType: '', contribuyente: '', regimen: '',
  activosMayor25k: null, alcance: '', contabilidadCompleta: null,
  presentacionImpuestos: null, certFEL: '', whatsappFEL: null,
  nombre: '', empresa: '', whatsapp: '', correo: '',
};

/* ── Main component ─────────────────────────────────────────────── */
export function QuotationCalculator() {
  const [form, setForm]       = useState<QuotationData>(EMPTY);
  const [idx, setIdx]         = useState(0);
  const [key, setKey]         = useState(0);
  const [back, setBack]       = useState(false);
  const [result, setResult]   = useState<QuotationResult | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const steps  = getActiveSteps(form);
  const stepId = steps[Math.min(idx, steps.length - 1)];
  const totalSteps = getTotalSteps(form);
  const prog = Math.round(((idx + 1) / totalSteps) * 100);

  /* navigation */
  const advance = () => { setBack(false); setKey(k => k + 1); setIdx(i => i + 1); };
  const retreat = () => {
    if (idx === 0) return;
    setResult(null); setBack(true); setKey(k => k + 1); setIdx(i => i - 1);
  };
  const pick = (setter: () => void) => { setter(); setTimeout(advance, 300); };

  /* setters with cascade reset */
  const sServiceType      = (v: ServiceType)   => setForm({ ...EMPTY, serviceType: v, nombre: form.nombre, empresa: form.empresa, whatsapp: form.whatsapp, correo: form.correo });
  const sContribuyente    = (v: Contribuyente) => setForm(p => ({ ...p, contribuyente: v, regimen: '', activosMayor25k: null, alcance: '', contabilidadCompleta: null, presentacionImpuestos: null, certFEL: '', whatsappFEL: null }));
  const sRegimen          = (v: Regimen)       => setForm(p => ({ ...p, regimen: v, activosMayor25k: null, alcance: '', contabilidadCompleta: null, presentacionImpuestos: null, certFEL: '', whatsappFEL: null }));
  const sActivos          = (v: boolean)       => setForm(p => ({ ...p, activosMayor25k: v, alcance: '', contabilidadCompleta: null, presentacionImpuestos: null, certFEL: '', whatsappFEL: null }));
  const sAlcance          = (v: Alcance) => {
    const ob = isContabilidadObligatoria(form);
    setForm(p => ({ ...p, alcance: v, contabilidadCompleta: ob ? true : null, presentacionImpuestos: null, certFEL: '', whatsappFEL: null }));
  };
  const sContabilidad     = (v: boolean)  => setForm(p => ({ ...p, contabilidadCompleta: v, presentacionImpuestos: null, certFEL: '', whatsappFEL: null }));
  const sImpuestos        = (v: boolean)  => setForm(p => ({ ...p, presentacionImpuestos: v, certFEL: '', whatsappFEL: null }));
  const sCertFEL          = (v: CertFEL)  => setForm(p => ({ ...p, certFEL: v, whatsappFEL: null }));
  const sWhatsappFEL      = (v: boolean)  => setForm(p => ({ ...p, whatsappFEL: v }));
  const sContact          = (k: 'nombre' | 'empresa' | 'whatsapp' | 'correo', v: string) => setForm(p => ({ ...p, [k]: v }));

  /* PDF / share */
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

  const handleWA = async () => {
    if (!result) return;
    await handlePDF();
    setTimeout(() => window.open(`https://wa.me/${WA_NUMBER}?text=${buildWAText(form, result!)}`, '_blank'), 400);
  };

  const handleEmail = async () => {
    if (!result) return;
    await handlePDF();
    setTimeout(() => window.open(`mailto:info@kontaxes.com?subject=${encodeURIComponent('Cotización KONTAXES')}&body=${buildEmailBody(form, result)}`, '_blank'), 400);
  };

  const handleReset = () => { setForm(EMPTY); setIdx(0); setKey(k => k + 1); setBack(false); setResult(null); };

  /* step has a value already (show Continuar button when revisiting) */
  const currentVal = (() => {
    switch (stepId) {
      case 'service-type':  return form.serviceType;
      case 'contribuyente': return form.contribuyente;
      case 'regimen':       return form.regimen;
      case 'activos':       return form.activosMayor25k;
      case 'alcance':       return form.alcance;
      case 'contabilidad':  return form.contabilidadCompleta;
      case 'impuestos':     return form.presentacionImpuestos;
      case 'cert-fel':      return form.certFEL;
      case 'wa-fel':        return form.whatsappFEL;
      default: return null;
    }
  })();
  const hasVal = currentVal !== null && currentVal !== '';
  const canContinue = hasVal && stepId !== 'contact' && stepId !== 'contact-service' && idx < steps.length - 1;

  /* ── step renderers ───────────────────────────────────────────── */

  const stepServiceType = () => (
    <>
      <Q icon="🎯" question="¿Qué servicio necesitas?" hint="Selecciona el tipo para comenzar tu cotización." />
      <div className="space-y-3">
        {([
          ['contable',           '📊', 'Servicios Contables',        'Contabilidad mensual, impuestos y asesoría'],
          ['auditoria',          '🔍', 'Auditoría',                   'Revisión y certificación de estados financieros'],
          ['outsourcing',        '🤝', 'Outsourcing',                 'Externalización de procesos contables'],
          ['modulos-odoo',       '🧩', 'Módulos Odoo',                'Módulos personalizados para tu Odoo'],
          ['implementacion-odoo','⚙️', 'Implementación Odoo',         'Te ayudamos (no somos partners oficiales)'],
        ] as [ServiceType, string, string, string][]).map(([v, icon, label, sub]) => (
          <Opt key={v} icon={icon} label={label} sub={sub}
            selected={form.serviceType === v}
            onClick={() => pick(() => sServiceType(v))} />
        ))}
      </div>
    </>
  );

  const stepContactService = () => {
    const map: Record<string, [string, string]> = {
      auditoria:          ['🔍', 'Requiere evaluación personalizada del alcance, documentación y períodos a auditar. Contáctanos para una propuesta a la medida.'],
      outsourcing:        ['🤝', 'Se cotiza según volumen de operaciones, cantidad de colaboradores y procesos a externalizar. Hablemos.'],
      'modulos-odoo':     ['🧩', 'Depende de los módulos requeridos, número de usuarios y configuraciones. Trabajamos con Odoo Community y Enterprise.'],
      'implementacion-odoo': ['⚙️', 'Ayudamos con tu implementación de Odoo. La cotización depende del alcance y horas de consultoría.'],
    };
    const [icon, desc] = map[form.serviceType] ?? ['📋', 'Contáctanos para más información.'];
    const label = SERVICE_LABEL[form.serviceType as ServiceType] ?? '';
    return (
      <div className="text-center py-6">
        <span className="text-6xl mb-5 block">{icon}</span>
        <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{label}</h3>
        <p className="text-gray-400 text-sm max-w-xs mx-auto mb-8 leading-relaxed">{desc}</p>
        <div className="space-y-3 max-w-xs mx-auto">
          <a href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hola KONTAXES, me interesa cotizar: ${label}`)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold rounded-2xl hover:bg-emerald-500/25 transition-all text-sm w-full">
            <PhoneIcon size={15} /> Contactar por WhatsApp
          </a>
          <a href={`mailto:info@kontaxes.com?subject=${encodeURIComponent(`Cotización: ${label}`)}`}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-purple-500/15 border border-purple-500/30 text-purple-400 font-bold rounded-2xl hover:bg-purple-500/25 transition-all text-sm w-full">
            <MailIcon size={15} /> Enviar correo
          </a>
        </div>
      </div>
    );
  };

  const stepContribuyente = () => (
    <>
      <Q icon="🏢" question="¿Quién es el contribuyente?" hint="¿La responsabilidad legal recae en una persona natural o jurídica?" />
      <div className="space-y-3">
        {([
          ['individual', '👤', 'Persona / Comerciante Individual', 'Responsabilidad recae en una persona natural'],
          ['sociedad',   '🏛️', 'Sociedad / Empresa (S.A.)',        'Responsabilidad recae en una persona jurídica'],
        ] as [Contribuyente, string, string, string][]).map(([v, icon, label, sub]) => (
          <Opt key={v} icon={icon} label={label} sub={sub}
            selected={form.contribuyente === v}
            onClick={() => pick(() => sContribuyente(v))} />
        ))}
      </div>
    </>
  );

  const stepRegimen = () => {
    return (
      <>
        <Q icon="📋" question="¿Cuál es tu régimen fiscal?" hint="¿Bajo qué régimen tributas actualmente?" />
        <div className="space-y-3">
          {(['pequeño', 'opcional', 'general'] as Regimen[]).map(v => (
            <Opt key={v} label={REGIMEN_LABEL[v]}
              selected={form.regimen === v}
              onClick={() => pick(() => sRegimen(v))} />
          ))}
        </div>
      </>
    );
  };

  const stepActivos = () => (
    <>
      <Q icon="💰" question="¿Tus activos superan Q25,000?" hint="Determina si la contabilidad completa es legalmente obligatoria para tu sociedad." />
      <div className="space-y-3">
        <Opt label="Sí, superan Q25,000" sub="Contabilidad completa obligatoria por ley"
          selected={form.activosMayor25k === true} accent="amber"
          onClick={() => pick(() => sActivos(true))} />
        <Opt label="No, son Q25,000 o menos" sub="Contabilidad completa opcional"
          selected={form.activosMayor25k === false} accent="sky"
          onClick={() => pick(() => sActivos(false))} />
      </div>
    </>
  );

  const stepAlcance = () => (
    <>
      <Q icon="🧭" question="¿A qué se dedica tu negocio?" hint="Define el alcance principal de tus actividades." />
      <div className="space-y-3">
        <Opt label="Servicios" sub="Técnicos, profesionales, consultoría, etc."
          selected={form.alcance === 'servicios'}
          onClick={() => pick(() => sAlcance('servicios'))} />
        <Opt label="Compra-venta de bienes" sub="Sistema de inventarios y costo de ventas"
          selected={form.alcance === 'compra-venta'} accent="emerald"
          onClick={() => pick(() => sAlcance('compra-venta'))} />
      </div>
    </>
  );

  const stepContabilidad = () => (
    <>
      <Q icon="📒" question="¿Deseas contabilidad completa?" hint="No es fiscalmente obligatorio, pero es recomendado financieramente para una gestión sólida." />
      <div className="space-y-3">
        <Opt label="Sí, contabilidad completa" sub="Catálogo de cuentas, asientos contables y estados financieros"
          selected={form.contabilidadCompleta === true}
          onClick={() => pick(() => sContabilidad(true))} />
        <Opt label="No por ahora" sub="Solo contabilidad básica sin registro completo"
          selected={form.contabilidadCompleta === false} accent="sky"
          onClick={() => pick(() => sContabilidad(false))} />
      </div>
    </>
  );

  const stepImpuestos = () => {
    const reg = form.regimen as Regimen;
    const n = FORMS[reg];
    const cost = n * 100;
    const obligatoria = isContabilidadObligatoria(form);
    const hintMap: Record<Regimen, string> = {
      pequeño:  'IVA 5% mensual',
      opcional: 'IVA mensual · ISR mensual · ISR retenciones · ISR anual',
      general:  'IVA mensual · IVA trimestral · ISO trimestral · ISR anual · retenciones',
    };
    return (
      <>
        {obligatoria && (
          <div className="flex items-start gap-2 mb-6 px-4 py-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <CheckCircleIcon size={14} className="text-purple-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-purple-300 leading-relaxed">
              <strong>Contabilidad completa incluida automáticamente</strong> — obligatoria por ley para tu perfil.
            </p>
          </div>
        )}
        <Q icon="🧾" question="¿Presentamos tus impuestos?" hint={reg ? hintMap[reg] : ''} />
        <div className="space-y-3">
          <Opt label="Sí, KONTAXES presenta mis impuestos"
            sub={`KONTAXES presenta ${n === 1 ? 'tu formulario' : 'tus formularios'} ante la SAT`}
            selected={form.presentacionImpuestos === true} accent="emerald"
            onClick={() => pick(() => sImpuestos(true))} />
          <Opt label="No, lo gestiono yo" sub="Presentas tus formularios directamente"
            selected={form.presentacionImpuestos === false}
            onClick={() => pick(() => sImpuestos(false))} />
        </div>
      </>
    );
  };

  const stepCertFEL = () => {
    const needsOdoo = form.contabilidadCompleta === true && form.alcance === 'compra-venta';
    const yesFELValue: CertFEL = needsOdoo ? 'odoo' : 'finanz-ia';
    const yesFELLabel = needsOdoo
      ? 'Sí, vía CORPOSISTEMAS (Q375 implementación + Q0.20/DTE)'
      : 'Sí, vía FinanzIA (Q0.20/DTE)';
    return (
      <>
        <Q question="¿Necesitas certificador FEL?" hint="Factura Electrónica en Línea certificada por la SAT." />
        <div className="space-y-3">
          <Opt label="No por ahora"
            selected={form.certFEL === 'ninguno'}
            onClick={() => pick(() => sCertFEL('ninguno'))} />
          <Opt label={yesFELLabel}
            selected={form.certFEL === yesFELValue} accent="emerald"
            onClick={() => pick(() => sCertFEL(yesFELValue))} />
        </div>
        {(form.certFEL === 'odoo' || form.certFEL === 'finanz-ia') && (
          <p className="flex items-start gap-1.5 text-xs text-orange-500 mt-4">
            <AlertCircleIcon size={13} className="flex-shrink-0 mt-0.5" />
            El Q0.20/DTE es variable y se factura mensualmente por separado — no está incluido en el total mensual.
          </p>
        )}
      </>
    );
  };

  const stepWAFel = () => (
    <>
      <Q icon="📱" question="¿Facturas por WhatsApp?" hint="FELSimple — Emite facturas electrónicas certificadas directo desde WhatsApp en segundos." />
      <div className="space-y-3">
        <Opt label="Sí, quiero FELSimple" sub="Factura desde WhatsApp, certifica con la SAT al instante"
          selected={form.whatsappFEL === true} accent="emerald"
          onClick={() => pick(() => sWhatsappFEL(true))} />
        <Opt label="No por ahora" sub="Puedes activarlo después"
          selected={form.whatsappFEL === false}
          onClick={() => pick(() => sWhatsappFEL(false))} />
      </div>
    </>
  );

  const stepContact = () => {
    const preview = calculateQuotation(form);
    return (
      <>
        <Q icon="👤" question="¿Tus datos?" hint="Opcional — los incluimos en tu cotización y PDF." />
        <div className="grid grid-cols-2 gap-3 mb-6">
          {([
            { k: 'nombre'   as const, p: 'Nombre completo',    t: 'text'  },
            { k: 'empresa'  as const, p: 'Nombre de empresa',  t: 'text'  },
            { k: 'whatsapp' as const, p: 'WhatsApp (+502…)',    t: 'tel'   },
            { k: 'correo'   as const, p: 'Correo electrónico', t: 'email' },
          ]).map(f => (
            <input key={f.k} type={f.t} placeholder={f.p}
              value={form[f.k] || ''}
              onChange={e => sContact(f.k, e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/8 transition-all" />
          ))}
        </div>
        <button onClick={handleCalc}
          className="w-full py-4 font-bold rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5 hover:from-purple-500 hover:to-violet-500 transition-all text-base flex items-center justify-center gap-2">
          <CalculatorIcon size={20} /> Ver mi cotización →
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

  /* ── Result view ─────────────────────────────────────────────── */
  const renderResult = () => (
    <div className="animate-fade-in">
      <div className="bg-gradient-to-r from-purple-900/60 to-violet-900/40 px-8 py-7 border-b border-purple-500/20">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-1">Tu Cotización Estimada</p>
            <p className="text-gray-400 text-sm">Servicios contables mensuales · IVA incluido</p>
            {form.nombre && (
              <p className="text-white font-semibold text-sm mt-2">
                {form.nombre}{form.empresa ? ` — ${form.empresa}` : ''}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-0.5">Total mensual</p>
            <p className="text-4xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Q {result!.total.toLocaleString('es-GT')}
              <span className="text-gray-500 text-lg font-normal">.00</span>
            </p>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 border-b border-white/5">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Desglose de servicios</p>
        <div className="space-y-3">
          {result!.breakdown.map((item, i) => (
            <div key={i} className="flex items-start justify-between gap-4 pb-3 border-b border-white/5 last:border-0 last:pb-0">
              <div className="flex-1">
                <p className="text-sm text-gray-200 font-medium leading-snug">{item.item}</p>
                {item.note && <p className="text-xs text-gray-500 mt-0.5 leading-snug">{item.note}</p>}
              </div>
              <p className="text-sm font-bold text-purple-300 flex-shrink-0 tabular-nums">Q {item.cost.toLocaleString('es-GT')}</p>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm font-bold text-white uppercase tracking-wide">Total</p>
            <p className="text-2xl font-bold text-white tabular-nums" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Q {result!.total.toLocaleString('es-GT')}
            </p>
          </div>
        </div>
      </div>

      {result!.notes.length > 0 && (
        <div className="px-8 py-4 border-b border-orange-500/10 bg-orange-500/5">
          <p className="text-xs font-bold uppercase tracking-wider text-orange-500 mb-2">Costos variables adicionales (no incluidos)</p>
          {result!.notes.map((n, i) => (
            <div key={i} className="flex gap-2 text-xs text-orange-500/80 leading-relaxed">
              <AlertCircleIcon size={13} className="flex-shrink-0 mt-0.5" /> {n}
            </div>
          ))}
        </div>
      )}

      <div className="px-8 py-3 bg-blue-500/5 border-b border-blue-500/10">
        <p className="text-xs text-blue-300">
          ℹ Esta es una <strong>estimación</strong>. La cotización formal y contrato se enviarán al formalizar el servicio.
        </p>
      </div>

      <div className="px-8 py-6 grid sm:grid-cols-3 gap-3">
        <button onClick={handlePDF} disabled={pdfLoading}
          className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold rounded-2xl hover:from-purple-500 hover:to-violet-500 transition-all hover:-translate-y-0.5 shadow-lg text-sm">
          <DownloadIcon size={15} /> {pdfLoading ? 'Generando…' : 'Descargar PDF'}
        </button>
        <button onClick={handleWA}
          className="flex items-center justify-center gap-2 py-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold rounded-2xl hover:bg-emerald-500/25 transition-all text-sm">
          <MessageCircleIcon size={15} /> WhatsApp
        </button>
        <button onClick={handleEmail}
          className="flex items-center justify-center gap-2 py-3 bg-purple-500/15 border border-purple-500/30 text-purple-400 font-bold rounded-2xl hover:bg-purple-500/25 transition-all text-sm">
          <MailIcon size={15} /> Correo
        </button>
      </div>

      <div className="px-8 pb-6 text-center">
        <button onClick={handleReset} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
          ← Nueva cotización
        </button>
      </div>
    </div>
  );

  /* ── Layout ─────────────────────────────────────────────────── */
  return (
    <section id="cotizador" className="py-24 bg-gray-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/8 to-transparent pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none grid-bg opacity-25" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-purple-700/6 rounded-full blur-3xl orb-float pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-56 h-56 bg-violet-700/5 rounded-full blur-3xl orb-float-reverse pointer-events-none" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 relative">

        <div className="text-center mb-10 reveal">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-purple-400 mb-3">
            Precios Personalizados
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-3"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Cotizador
          </h2>
          <p className="text-gray-400 text-lg">Obtén tu estimación en segundos</p>
        </div>

        <div className="reveal bg-white/3 border border-white/8 rounded-3xl overflow-hidden shadow-2xl">
          {result ? renderResult() : (
            <>
              {/* Top bar */}
              <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-white/5">
                <button onClick={retreat} disabled={idx === 0}
                  className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all flex-shrink-0 ${
                    idx > 0
                      ? 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer'
                      : 'opacity-0 pointer-events-none'
                  }`}>
                  <ChevronLeftIcon size={16} />
                </button>

                <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-violet-400 rounded-full transition-all duration-500"
                    style={{ width: `${prog}%` }} />
                </div>

                <span className="text-xs text-gray-600 tabular-nums flex-shrink-0 w-10 text-right">
                  {idx + 1}/{steps.length}
                </span>
              </div>

              {/* Animated step */}
              <div key={key} className={back ? 'animate-slide-in-back' : 'animate-slide-in'}>
                <div className="px-8 pt-8 pb-8">
                  {renderStep()}

                  {/* Continuar (when revisiting a completed step) */}
                  {canContinue && (
                    <button onClick={advance}
                      className="w-full mt-5 py-3 text-sm font-medium text-gray-500 hover:text-gray-200 border border-white/8 hover:border-white/20 rounded-2xl transition-all flex items-center justify-center gap-2">
                      Continuar con esta selección <ArrowRightIcon size={14} />
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
