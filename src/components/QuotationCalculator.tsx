import React, { useState } from 'react';
import {
  CalculatorIcon, CheckCircleIcon, AlertCircleIcon,
  DownloadIcon, MessageCircleIcon,
  ChevronLeftIcon, ArrowRightIcon, PhoneIcon, MailIcon,
} from 'lucide-react';
import {
  QuotationData, QuotationResult, ServiceType, Contribuyente,
  Regimen, Alcance, CertFEL,
  calculateQuotation, buildFormSummary, buildWAText, buildEmailBody,
  isContabilidadObligatoria, needsActivosQuestion,
  REGIMEN_LABEL, CONTRIB_LABEL, SERVICE_LABEL, FORMS,
} from '../utils/quotationLogic';
import { generateQuotationPDF } from '../utils/pdfGenerator';

const WA_NUMBER = '50235174713';

type StepId =
  | 'service-type' | 'contribuyente' | 'regimen' | 'activos'
  | 'alcance' | 'contabilidad' | 'impuestos' | 'cert-fel'
  | 'wa-fel' | 'contact' | 'contact-service';

/* Returns only steps up to the next unanswered one — used for rendering */
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

/* Returns the FULL expected path — used for progress bar denominator */
function getFullStepList(form: QuotationData): StepId[] {
  if (!form.serviceType) return ['service-type'];
  if (form.serviceType !== 'contable') return ['service-type', 'contact-service'];

  const s: StepId[] = ['service-type', 'contribuyente', 'regimen'];

  // Include activos if sociedad is selected or contribuyente not yet known
  const maybeActivos =
    !form.contribuyente ||
    (form.contribuyente === 'sociedad' && (!form.regimen || form.regimen === 'pequeño'));
  if (maybeActivos) s.push('activos');

  s.push('alcance');
  if (!isContabilidadObligatoria(form)) s.push('contabilidad');
  s.push('impuestos', 'cert-fel', 'wa-fel', 'contact');
  return s;
}

/* ── Option button ──────────────────────────────────────────────── */
const Opt = ({
  icon, label, sub, selected, badge, accent = 'purple', onClick,
}: {
  icon: string; label: string; sub?: string; selected: boolean;
  badge?: string; accent?: 'purple' | 'emerald' | 'sky' | 'amber';
  onClick: () => void;
}) => {
  const ring: Record<string, string> = {
    purple: 'border-purple-500/70 bg-purple-500/15 shadow-purple-500/10',
    emerald: 'border-emerald-500/70 bg-emerald-500/15',
    sky:    'border-sky-500/70 bg-sky-500/15',
    amber:  'border-amber-500/70 bg-amber-500/15',
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
      <span className="text-2xl flex-shrink-0 leading-none">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm leading-snug ${selected ? 'text-white' : 'text-gray-200'}`}>{label}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5 leading-snug">{sub}</p>}
      </div>
      {badge && (
        <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full flex-shrink-0">
          {badge}
        </span>
      )}
      {selected
        ? <CheckCircleIcon size={18} className={`flex-shrink-0 ${check[accent]}`} />
        : <div className="w-5 h-5 rounded-full border-2 border-white/15 flex-shrink-0" />
      }
    </button>
  );
};

/* ── Question header ────────────────────────────────────────────── */
const Q = ({ icon, question, hint }: { icon: string; question: string; hint?: string }) => (
  <div className="mb-7">
    <span className="text-5xl mb-5 block leading-none">{icon}</span>
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
  const stepLabel = `${idx + 1} de ${fullSteps.length}`;

  const advance = () => { setBack(false); setAnimKey(k => k + 1); setIdx(i => i + 1); };
  const retreat = () => {
    if (idx === 0) return;
    setResult(null); setBack(true); setAnimKey(k => k + 1); setIdx(i => i - 1);
  };
  const pick = (setter: () => void) => { setter(); setTimeout(advance, 280); };

  /* Cascade-reset setters */
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

  /* Whether the current step already has a value (allow skip-forward) */
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

  /* ── Step renderers ─────────────────────────────────────────────── */

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
      <div className="text-center py-4">
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
    const bases: Record<Regimen, number> = { pequeño: 250, opcional: 450, general: 550 };
    const extra = form.contribuyente === 'sociedad' ? 500 : 0;
    return (
      <>
        <Q icon="📋" question="¿Cuál es tu régimen fiscal?" hint="¿Bajo qué régimen tributas actualmente?" />
        <div className="space-y-3">
          {([
            ['pequeño', 'Pequeño Contribuyente', 'IVA 5% · 1 formulario · Ingresos < Q150,000/año'],
            ['opcional', 'Régimen Opcional (IVA 12% + ISR 5–7%)', 'IVA mensual + ISR trimestral · 2 formularios'],
            ['general',  'Régimen General (IVA 12% + ISR 25%)',   'IVA mensual + ISR sobre utilidades · 4 formularios'],
          ] as [Regimen, string, string][]).map(([v, label, sub]) => (
            <button key={v} onClick={() => pick(() => sRegimen(v))}
              className={`w-full text-left flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border-2 transition-all duration-200 ${
                form.regimen === v
                  ? 'border-purple-500/70 bg-purple-500/15 shadow-lg'
                  : 'border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/6'
              }`}>
              <div className="flex-1">
                <p className={`font-semibold text-sm ${form.regimen === v ? 'text-white' : 'text-gray-200'}`}>{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
              </div>
              <div className="text-right flex-shrink-0 mr-2">
                <p className="text-sm font-bold text-purple-300">desde Q{bases[v] + extra}</p>
                <p className="text-xs text-gray-600">/mes</p>
              </div>
              {form.regimen === v
                ? <CheckCircleIcon size={18} className="text-purple-400 flex-shrink-0" />
                : <div className="w-5 h-5 rounded-full border-2 border-white/15 flex-shrink-0" />
              }
            </button>
          ))}
        </div>
      </>
    );
  };

  const stepActivos = () => (
    <>
      <Q icon="💰" question="¿Tus activos superan Q25,000?" hint="Determina si la contabilidad completa es legalmente obligatoria para tu sociedad." />
      <div className="space-y-3">
        <Opt icon="✅" label="Sí, superan Q25,000" sub="Contabilidad completa obligatoria por ley · +Q500/mes"
          selected={form.activosMayor25k === true} accent="amber"
          onClick={() => pick(() => sActivos(true))} />
        <Opt icon="❌" label="No, son Q25,000 o menos" sub="Contabilidad completa opcional"
          selected={form.activosMayor25k === false} accent="sky"
          onClick={() => pick(() => sActivos(false))} />
      </div>
    </>
  );

  const stepAlcance = () => (
    <>
      <Q icon="🧭" question="¿A qué se dedica tu negocio?" hint="Define el alcance principal de tus actividades." />
      <div className="space-y-3">
        <Opt icon="💼" label="Servicios" sub="Técnicos, profesionales, consultoría, etc."
          selected={form.alcance === 'servicios'}
          onClick={() => pick(() => sAlcance('servicios'))} />
        <Opt icon="🛒" label="Compra-venta de bienes" sub="Sistema de inventarios y costo de ventas · +Q500/mes"
          selected={form.alcance === 'compra-venta'} accent="emerald"
          onClick={() => pick(() => sAlcance('compra-venta'))} />
      </div>
    </>
  );

  const stepContabilidad = () => (
    <>
      <Q icon="📒" question="¿Deseas contabilidad completa?" hint="No es fiscalmente obligatorio, pero es recomendado financieramente para una gestión sólida." />
      <div className="space-y-3">
        <Opt icon="📊" label="Sí, con FinanzIA (+Q500/mes)" sub="Catálogo de cuentas, asientos y estados financieros en FinanzIA"
          selected={form.contabilidadCompleta === true}
          onClick={() => pick(() => sContabilidad(true))} />
        <Opt icon="⏩" label="No por ahora" sub="Solo contabilidad básica sin registro completo"
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
    const formDesc: Record<Regimen, string> = {
      pequeño:  'Declaración IVA 5% (Form. 2046)',
      opcional: 'IVA mensual (F2000) + ISR trimestral (F2189)',
      general:  'IVA mensual + ISR + ISO + cierre anual',
    };
    return (
      <>
        {obligatoria && (
          <div className="flex items-start gap-2 mb-5 px-4 py-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <CheckCircleIcon size={14} className="text-purple-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-purple-300 leading-relaxed">
              <strong>Contabilidad completa con FinanzIA incluida automáticamente</strong> — obligatoria por ley para tu perfil.
            </p>
          </div>
        )}
        <Q icon="🧾" question="¿Presentamos tus impuestos?"
          hint={`${n} ${n === 1 ? 'formulario' : 'formularios'} — ${formDesc[reg]} · +Q${cost}/mes si Sí`} />
        <div className="space-y-3">
          <Opt icon="✅" label={`Sí (+Q${cost}/mes)`}
            sub={`KONTAXES presenta ${n === 1 ? 'tu formulario' : 'tus formularios'} ante la SAT`}
            selected={form.presentacionImpuestos === true} accent="emerald"
            onClick={() => pick(() => sImpuestos(true))} />
          <Opt icon="⏩" label="No, lo gestiono yo" sub="Presentas tus formularios directamente"
            selected={form.presentacionImpuestos === false}
            onClick={() => pick(() => sImpuestos(false))} />
        </div>
      </>
    );
  };

  const stepCertFEL = () => (
    <>
      <Q icon="📄" question="¿Necesitas certificador FEL?" hint="Factura Electrónica en Línea certificada por la SAT." />
      <div className="space-y-3">
        <Opt icon="⏩" label="No necesito por ahora" sub="Puedes activarlo en cualquier momento"
          selected={form.certFEL === 'ninguno'}
          onClick={() => pick(() => sCertFEL('ninguno'))} />
        <Opt icon="🟣" label="Vía Odoo (CORPOSISTEMAS, S.A.)" sub="Q375 implementación (único) + Q0.20 por DTE emitido"
          badge="popular" selected={form.certFEL === 'odoo'}
          onClick={() => pick(() => sCertFEL('odoo'))} />
        <Opt icon="🟢" label="Vía FinanzIA" sub="Sin implementación · Q0.20 por DTE emitido"
          selected={form.certFEL === 'finanz-ia'} accent="emerald"
          onClick={() => pick(() => sCertFEL('finanz-ia'))} />
      </div>
      {(form.certFEL === 'odoo' || form.certFEL === 'finanz-ia') && (
        <p className="flex items-start gap-1.5 text-xs text-amber-400/70 mt-4">
          <AlertCircleIcon size={13} className="flex-shrink-0 mt-0.5" />
          El Q0.20/DTE es variable y se factura mensualmente por separado.
        </p>
      )}
    </>
  );

  const stepWAFel = () => (
    <>
      <Q icon="📱" question="¿Facturas por WhatsApp?" hint="FELSimple — Emite facturas electrónicas certificadas directo desde WhatsApp en segundos." />
      <div className="space-y-3">
        <Opt icon="💬" label="Sí, quiero FELSimple (+Q50/mes)" sub="Factura desde WhatsApp, certifica con la SAT al instante"
          selected={form.whatsappFEL === true} accent="emerald"
          onClick={() => pick(() => sWhatsappFEL(true))} />
        <Opt icon="⏩" label="No por ahora" sub="Puedes activarlo después"
          selected={form.whatsappFEL === false}
          onClick={() => pick(() => sWhatsappFEL(false))} />
      </div>
    </>
  );

  const stepContact = () => {
    const preview = calculateQuotation(form);
    return (
      <>
        <Q icon="👤" question="¿Tus datos de contacto?" hint="Opcional — los incluimos en tu cotización y PDF." />
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
        {preview.total > 0 && (
          <div className="flex items-center justify-between px-5 py-3.5 rounded-2xl bg-purple-500/8 border border-purple-500/15 mb-5">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Estimado preliminar</span>
            <span className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Q {preview.total.toLocaleString('es-GT')}<span className="text-gray-500 text-sm font-normal">/mes</span>
            </span>
          </div>
        )}
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

  /* ── Result screen ──────────────────────────────────────────────── */
  const renderResult = () => {
    const summary = buildFormSummary(form);
    return (
      <div className="animate-fade-in">
        {/* Total header */}
        <div className="bg-gradient-to-r from-purple-900/70 to-violet-900/50 px-8 py-7 border-b border-purple-500/20">
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

        {/* Summary of what was chosen */}
        {summary.length > 0 && (
          <div className="px-8 py-5 border-b border-white/5 bg-white/2">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Lo que seleccionaste</p>
            <div className="flex flex-wrap gap-2">
              {summary.map((s, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300">
                  <CheckCircleIcon size={11} className="text-purple-400 flex-shrink-0" />
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Cost breakdown */}
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
              <p className="text-sm font-bold text-white uppercase tracking-wide">Total mensual</p>
              <p className="text-2xl font-bold text-white tabular-nums" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Q {result!.total.toLocaleString('es-GT')}
              </p>
            </div>
          </div>
        </div>

        {/* Variable cost notes */}
        {result!.notes.length > 0 && (
          <div className="px-8 py-4 border-b border-amber-500/10 bg-amber-500/5">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">Costos variables adicionales (no incluidos en el total)</p>
            {result!.notes.map((n, i) => (
              <div key={i} className="flex gap-2 text-xs text-amber-300/80 leading-relaxed mt-1">
                <AlertCircleIcon size={13} className="flex-shrink-0 mt-0.5" /> {n}
              </div>
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <div className="px-8 py-3 bg-blue-500/5 border-b border-blue-500/10">
          <p className="text-xs text-blue-300">
            ℹ Esta es una <strong>estimación</strong>. La cotización formal y contrato se enviarán al formalizar el servicio.
          </p>
        </div>

        {/* Action buttons */}
        <div className="px-8 py-6 grid sm:grid-cols-2 gap-3">
          <button onClick={handlePDF} disabled={pdfLoading}
            className="flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold rounded-2xl hover:from-purple-500 hover:to-violet-500 transition-all hover:-translate-y-0.5 shadow-lg text-sm">
            <DownloadIcon size={15} /> {pdfLoading ? 'Generando…' : 'Descargar PDF'}
          </button>
          <button onClick={handleWA}
            className="flex items-center justify-center gap-2 py-3.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold rounded-2xl hover:bg-emerald-500/25 transition-all text-sm">
            <MessageCircleIcon size={15} /> Enviar por WhatsApp
          </button>
        </div>

        <div className="px-8 pb-6 text-center">
          <button onClick={handleReset} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
            ← Nueva cotización
          </button>
        </div>
      </div>
    );
  };

  /* ── Layout ─────────────────────────────────────────────────────── */
  return (
    <section id="cotizador" className="py-24 bg-gray-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/8 to-transparent pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none grid-bg opacity-25" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-purple-700/6 rounded-full blur-3xl orb-float pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-56 h-56 bg-violet-700/5 rounded-full blur-3xl orb-float-reverse pointer-events-none" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 relative">

        {/* Section header */}
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

        {/* Card */}
        <div className="reveal bg-white/3 border border-white/8 rounded-3xl overflow-hidden shadow-2xl">
          {result ? renderResult() : (
            <>
              {/* Progress bar row */}
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
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-violet-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(prog, 4)}%` }}
                  />
                </div>

                <span className="text-xs text-gray-600 tabular-nums flex-shrink-0 w-12 text-right">
                  {stepLabel}
                </span>
              </div>

              {/* Animated slide */}
              <div key={animKey} className={back ? 'animate-slide-in-back' : 'animate-slide-in'}>
                <div className="px-8 pt-8 pb-8 min-h-[420px] flex flex-col">
                  <div className="flex-1">
                    {renderStep()}
                  </div>

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
