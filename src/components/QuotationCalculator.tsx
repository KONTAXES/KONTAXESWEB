import React, { useState } from 'react';
import {
  CalculatorIcon, CheckCircleIcon, AlertCircleIcon,
  DownloadIcon, MessageCircleIcon,
  ChevronLeftIcon, ArrowRightIcon, PhoneIcon, ExternalLinkIcon,
  PlusIcon, MinusIcon,
} from 'lucide-react';
import {
  QuotationData, QuotationResult,
  ServiceType, Contribuyente, Regimen, Alcance, CertFEL,
  OdooSubtype, OutsourcingRole, AccesoPlan,
  AdminSubService, ConsultoriaSubService, PaginasWebSub,
  calculateQuotation, calculateOutsourcingQuotation, calculateAccesoQuotation,
  buildFormSummary, buildWAText,
  isContabilidadObligatoria, needsActivosQuestion,
  REGIMEN_LABEL, SERVICE_LABEL, FORMS,
  OUTSOURCING_ROLE_LABEL, ACCESO_PLANS, PRICE_USUARIO_ADICIONAL, KTX_MODULES,
  ADMIN_SUB_LABEL, CONSULTORIA_SUB_LABEL, PAGINAS_WEB_SUB_LABEL,
} from '../utils/quotationLogic';
import { sendQuotationEmail } from '../utils/emailService';

const WA_NUMBER  = '50235174713';
const LEXUM_WA   = '50232406009';

/* ── Step IDs ───────────────────────────────────────────────────── */
type StepId =
  | 'service-type'
  | 'contribuyente' | 'regimen' | 'activos'
  | 'alcance' | 'contabilidad' | 'planilla' | 'impuestos'
  | 'cert-fel' | 'wa-fel'
  | 'outsourcing-role'
  | 'admin-sub' | 'consultoria-sub'
  | 'odoo-subtype' | 'odoo-modulos'
  | 'implementacion'
  | 'acceso-plan' | 'acceso-usuarios'
  | 'paginas-web-sub'
  | 'contact' | 'contact-service';

function getActiveSteps(form: QuotationData): StepId[] {
  const s: StepId[] = ['service-type'];
  if (!form.serviceType) return s;

  /* ── Contact-only services ── */
  if (['auditoria', 'legales'].includes(form.serviceType)) {
    s.push('contact-service');
    return s;
  }

  /* ── Páginas Web ── */
  if (form.serviceType === 'paginas-web') {
    s.push('paginas-web-sub');
    if (!form.paginasWebSub) return s;
    s.push('contact-service');
    return s;
  }

  if (form.serviceType === 'admin-financiero') {
    s.push('admin-sub');
    if (!form.adminSubService) return s;
    s.push('contact-service');
    return s;
  }

  if (form.serviceType === 'consultoria-fiscal') {
    s.push('consultoria-sub');
    if (!form.consultoriaSubService) return s;
    s.push('contact-service');
    return s;
  }

  /* ── Odoo ── */
  if (form.serviceType === 'odoo') {
    s.push('odoo-subtype');
    if (!form.odooSubtype) return s;
    if (form.odooSubtype === 'modulos-ktx') { s.push('odoo-modulos'); return s; }
    if (form.odooSubtype === 'implementacion') {
      s.push('implementacion');
      if (!form.implementacionChoice) return s;
      if (form.implementacionChoice === 'partner') { s.push('contact-service'); return s; }
      // implementacion → acceso flow
    }
    // acceso (directo o desde implementacion)
    s.push('acceso-plan');
    if (!form.accesoPlan) return s;
    s.push('acceso-usuarios');
    if (form.accesoUsuariosAdicionales === -1) return s;
    s.push('contact');
    return s;
  }

  /* ── Outsourcing ── */
  if (form.serviceType === 'outsourcing') {
    s.push('outsourcing-role');
    if (!form.outsourcingRole) return s;
  }

  /* ── Contable + Outsourcing shared flow ── */
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

  const incluyeContabilidad = isContabilidadObligatoria(form) || form.contabilidadCompleta === true;
  if (incluyeContabilidad) {
    s.push('planilla');
    if (form.planillaIGSS === null) return s;
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
  if (['auditoria', 'legales'].includes(form.serviceType)) return 2;
  if (form.serviceType === 'paginas-web') return 3;
  if (form.serviceType === 'admin-financiero' || form.serviceType === 'consultoria-fiscal') return 3;
  if (form.serviceType === 'odoo') {
    if (form.odooSubtype === 'modulos-ktx') return 3;
    return 5; // subtype + plan + usuarios + contact (+implementacion optional)
  }
  let n = form.serviceType === 'outsourcing' ? 7 : 6;
  const maybeActivos = !form.contribuyente || (form.contribuyente === 'sociedad' && (!form.regimen || form.regimen === 'pequeño'));
  if (maybeActivos) n++;
  if (!isContabilidadObligatoria(form)) n++;
  const maybeContab = !form.contabilidadCompleta || form.contabilidadCompleta === true || isContabilidadObligatoria(form);
  if (maybeContab) n++;
  return n + 2;
}

/* ── Sub-components ─────────────────────────────────────────────── */

const Opt = ({
  label, selected, accent = 'purple', onClick,
}: {
  label: string; selected: boolean;
  accent?: 'purple' | 'emerald' | 'sky' | 'amber';
  onClick: () => void;
}) => {
  const ring: Record<string, string> = {
    purple:  'border-purple-500/60 bg-purple-500/15 shadow-purple-500/10',
    emerald: 'border-emerald-500/60 bg-emerald-500/15',
    sky:     'border-sky-500/60 bg-sky-500/15',
    amber:   'border-amber-500/60 bg-amber-500/15',
  };
  const check: Record<string, string> = {
    purple: 'text-purple-400', emerald: 'text-emerald-400',
    sky: 'text-sky-400',       amber:   'text-amber-400',
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

const Q = ({ question, hint }: { question: string; hint?: string }) => (
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
  serviceType: '',
  contribuyente: '', regimen: '', activosMayor25k: null,
  alcance: '', contabilidadCompleta: null, planillaIGSS: null,
  presentacionImpuestos: null, certFEL: '', whatsappFEL: null,
  outsourcingRole: '',
  paginasWebSub: '',
  adminSubService: '', consultoriaSubService: '',
  odooSubtype: '', implementacionChoice: '', accesoPlan: '', accesoUsuariosAdicionales: -1,
  nombre: '', empresa: '', whatsapp: '', correo: '',
};

/* ── Main component ─────────────────────────────────────────────── */
export function QuotationCalculator() {
  const [form, setForm]           = useState<QuotationData>(EMPTY);
  const [idx, setIdx]             = useState(0);
  const [key, setKey]             = useState(0);
  const [back, setBack]           = useState(false);
  const [result, setResult]       = useState<QuotationResult | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [contactError, setContactError] = useState(false);

  const steps     = getActiveSteps(form);
  const stepId    = steps[Math.min(idx, steps.length - 1)];
  const totalSteps = getTotalSteps(form);
  const prog      = Math.round(((idx + 1) / totalSteps) * 100);

  /* navigation */
  const advance = () => { setBack(false); setKey(k => k + 1); setIdx(i => i + 1); };
  const retreat = () => {
    if (idx === 0) return;
    setResult(null); setBack(true); setKey(k => k + 1); setIdx(i => i - 1);
  };
  const pick = (setter: () => void) => { setter(); setTimeout(advance, 300); };

  /* setters */
  const sServiceType   = (v: ServiceType)   => setForm({ ...EMPTY, serviceType: v, nombre: form.nombre, empresa: form.empresa, whatsapp: form.whatsapp, correo: form.correo });
  const sContribuyente = (v: Contribuyente) => setForm(p => ({ ...p, contribuyente: v, regimen: '', activosMayor25k: null, alcance: '', contabilidadCompleta: null, planillaIGSS: null, presentacionImpuestos: null, certFEL: '', whatsappFEL: null }));
  const sRegimen       = (v: Regimen)       => setForm(p => ({ ...p, regimen: v, activosMayor25k: null, alcance: '', contabilidadCompleta: null, planillaIGSS: null, presentacionImpuestos: null, certFEL: '', whatsappFEL: null }));
  const sActivos       = (v: boolean)       => setForm(p => ({ ...p, activosMayor25k: v, alcance: '', contabilidadCompleta: null, planillaIGSS: null, presentacionImpuestos: null, certFEL: '', whatsappFEL: null }));
  const sAlcance       = (v: Alcance)       => {
    const ob = isContabilidadObligatoria(form);
    setForm(p => ({ ...p, alcance: v, contabilidadCompleta: ob ? true : null, planillaIGSS: null, presentacionImpuestos: null, certFEL: '', whatsappFEL: null }));
  };
  const sContabilidad  = (v: boolean)  => setForm(p => ({ ...p, contabilidadCompleta: v, planillaIGSS: null, presentacionImpuestos: null, certFEL: '', whatsappFEL: null }));
  const sPlanillaIGSS  = (v: boolean)  => setForm(p => ({ ...p, planillaIGSS: v, presentacionImpuestos: null, certFEL: '', whatsappFEL: null }));
  const sImpuestos     = (v: boolean)  => setForm(p => ({ ...p, presentacionImpuestos: v, certFEL: '', whatsappFEL: null }));
  const sCertFEL       = (v: CertFEL)  => setForm(p => ({ ...p, certFEL: v, whatsappFEL: null }));
  const sWhatsappFEL   = (v: boolean)  => setForm(p => ({ ...p, whatsappFEL: v }));
  const sOutsourcingRole = (v: OutsourcingRole) => setForm(p => ({ ...p, outsourcingRole: v }));
  const sAdminSubService = (v: AdminSubService) => setForm(p => ({ ...p, adminSubService: v }));
  const sConsultoriaSubService = (v: ConsultoriaSubService) => setForm(p => ({ ...p, consultoriaSubService: v }));
  const sPaginasWebSub = (v: PaginasWebSub) => setForm(p => ({ ...p, paginasWebSub: v }));
  const sOdooSubtype   = (v: OdooSubtype) => setForm(p => ({ ...p, odooSubtype: v, implementacionChoice: '', accesoPlan: '', accesoUsuariosAdicionales: -1 }));
  const sImplementacionChoice = (v: 'acceso' | 'partner') => setForm(p => ({ ...p, implementacionChoice: v, accesoPlan: '', accesoUsuariosAdicionales: -1 }));
  const sAccesoPlan    = (v: AccesoPlan) => setForm(p => ({ ...p, accesoPlan: v, accesoUsuariosAdicionales: 0 }));
  const sContact       = (k: 'nombre' | 'empresa' | 'whatsapp' | 'correo', v: string) => setForm(p => ({ ...p, [k]: v }));

  /* calc + PDF */
  const handleCalc = () => {
    const ok = !!(form.nombre?.trim() && form.empresa?.trim() && form.whatsapp?.trim() && form.correo?.trim());
    if (!ok) { setContactError(true); return; }
    setContactError(false);
    let r: QuotationResult;
    if (form.serviceType === 'outsourcing') {
      r = calculateOutsourcingQuotation(form);
    } else if (form.serviceType === 'odoo') {
      r = calculateAccesoQuotation(form);
    } else {
      r = calculateQuotation(form);
    }
    setResult(r);
  };

  const getPdfVariant = (): 'contable' | 'saas' | 'outsourcing' => {
    if (form.serviceType === 'outsourcing') return 'outsourcing';
    if (form.serviceType === 'odoo') return 'saas';
    return 'contable';
  };

  const buildPDFParams = () => ({
    nombre: form.nombre, empresa: form.empresa,
    whatsapp: form.whatsapp, correo: form.correo,
    breakdown: result!.breakdown, total: result!.total,
    warnings: result!.notes,
    date: new Date().toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric' }),
    pdfVariant: getPdfVariant(),
  });

  const handlePDF = async () => {
    if (!result) return;
    setPdfLoading(true);
    try {
      const { generateQuotationPDF } = await import('../utils/pdfGenerator');
      const { blob, filename, quoteNumber } = await generateQuotationPDF(buildPDFParams());
      // Fire-and-forget email in background
      sendQuotationEmail({
        nombre: form.nombre, empresa: form.empresa,
        whatsapp: form.whatsapp, correo: form.correo,
        total: result.total, breakdown: result.breakdown,
        quoteNumber, date: buildPDFParams().date,
        blob, filename,
      });
    } finally { setPdfLoading(false); }
  };

  const handleWA = async () => {
    if (!result) return;
    setPdfLoading(true);
    try {
      const { generateQuotationPDF } = await import('../utils/pdfGenerator');
      const { blob, filename, quoteNumber } = await generateQuotationPDF(buildPDFParams());
      sendQuotationEmail({
        nombre: form.nombre, empresa: form.empresa,
        whatsapp: form.whatsapp, correo: form.correo,
        total: result.total, breakdown: result.breakdown,
        quoteNumber, date: buildPDFParams().date,
        blob, filename,
      });
    } finally { setPdfLoading(false); }
    // Open WhatsApp after a short delay so the download dialog doesn't block
    setTimeout(() => window.open(`https://wa.me/${WA_NUMBER}?text=${buildWAText(form, result!)}`, '_blank'), 600);
  };

  const handleReset = () => { setForm(EMPTY); setIdx(0); setKey(k => k + 1); setBack(false); setResult(null); setContactError(false); };

  const currentVal = (() => {
    switch (stepId) {
      case 'service-type':    return form.serviceType;
      case 'contribuyente':   return form.contribuyente;
      case 'regimen':         return form.regimen;
      case 'activos':         return form.activosMayor25k;
      case 'alcance':         return form.alcance;
      case 'contabilidad':    return form.contabilidadCompleta;
      case 'planilla':        return form.planillaIGSS;
      case 'impuestos':       return form.presentacionImpuestos;
      case 'cert-fel':        return form.certFEL;
      case 'wa-fel':          return form.whatsappFEL;
      case 'outsourcing-role': return form.outsourcingRole;
      case 'admin-sub':        return form.adminSubService;
      case 'consultoria-sub':  return form.consultoriaSubService;
      case 'odoo-subtype':    return form.odooSubtype;
      case 'implementacion':  return form.implementacionChoice;
      case 'acceso-plan':     return form.accesoPlan;
      case 'paginas-web-sub': return form.paginasWebSub;
      default: return null;
    }
  })();
  const hasVal = currentVal !== null && currentVal !== '';
  const canContinue = hasVal && stepId !== 'contact' && stepId !== 'contact-service' && stepId !== 'odoo-modulos' && stepId !== 'paginas-web-sub' && idx < steps.length - 1;

  /* ── Step renderers ───────────────────────────────────────────── */

  const stepServiceType = () => (
    <>
      <Q question="¿Qué servicio necesitas?" hint="Selecciona el tipo para comenzar tu cotización." />
      <div className="space-y-2">
        {([
          ['contable',            'Servicios Contables'],
          ['admin-financiero',    'Servicios Administrativos-Financieros'],
          ['auditoria',           'Auditoría'],
          ['consultoria-fiscal',  'Consultoría y Asesoría Fiscal'],
          ['outsourcing',         'Outsourcing'],
          ['odoo',                'Odoo'],
          ['legales',             'Servicios Legales'],
          ['paginas-web',         'Páginas Web'],
        ] as [ServiceType, string][]).map(([v, label]) => (
          <Opt key={v} label={label}
            selected={form.serviceType === v}
            onClick={() => pick(() => sServiceType(v))} />
        ))}
      </div>
    </>
  );

  const stepContactService = () => {
    const svc = form.serviceType as ServiceType;

    /* Servicios Legales → LEXUM */
    if (svc === 'legales') {
      return (
        <div className="text-center py-4">
          <p className="text-gray-300 text-sm mb-2 font-semibold">Servicios Legales</p>
          <p className="text-gray-400 text-sm max-w-xs mx-auto mb-6 leading-relaxed">
            Para servicios legales te referimos al <strong className="text-white">Bufete Jurídico LEXUM</strong>,
            nuestra alianza estratégica en asesoría legal empresarial.
          </p>
          <a href={`https://wa.me/${LEXUM_WA}?text=${encodeURIComponent('Hola LEXUM, me refirió KONTAXES y necesito asesoría legal.')}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold rounded-2xl hover:bg-emerald-500/25 transition-all text-sm w-full mb-2">
            <PhoneIcon size={15} /> Contactar a LEXUM por WhatsApp
          </a>
          <p className="text-xs text-gray-600 mt-4">📞 3240-6009 · 5179-1610</p>
        </div>
      );
    }

    /* Páginas Web → WhatsApp */
    if (svc === 'paginas-web') {
      const subLabel = form.paginasWebSub ? PAGINAS_WEB_SUB_LABEL[form.paginasWebSub as PaginasWebSub] : 'Páginas Web';
      return (
        <div>
          <p className="text-gray-300 text-sm font-semibold mb-1">Páginas Web</p>
          <p className="text-purple-300 text-base font-bold mb-4">{subLabel}</p>
          <p className="text-gray-500 text-xs mb-5">Cada proyecto es único. Cuéntanos tu idea y te preparamos una propuesta personalizada.</p>
          <a href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hola KONTAXES, me interesa cotizar: ${subLabel}`)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold rounded-2xl hover:bg-emerald-500/25 transition-all text-sm w-full">
            <PhoneIcon size={15} /> Contactar por WhatsApp
          </a>
        </div>
      );
    }

    /* Implementación Odoo → partner oficial */
    if (svc === 'odoo' && form.implementacionChoice === 'partner') {
      return (
        <div className="py-2">
          <p className="text-gray-300 text-sm font-semibold mb-2">Partner Oficial de Odoo</p>
          <div className="px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-5">
            <p className="text-xs text-amber-300 leading-relaxed">
              <strong>Nota:</strong> KONTAXES CONSULTORES, S.A. no es un partner oficial de Odoo.
              Te referiremos a un partner certificado para tu implementación.
            </p>
          </div>
          <a href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hola KONTAXES, necesito que me refieran a un partner oficial de Odoo para una implementación.')}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold rounded-2xl hover:bg-emerald-500/25 transition-all text-sm w-full">
            <PhoneIcon size={15} /> Solicitar referido por WhatsApp
          </a>
        </div>
      );
    }

    /* Determine title based on service + sub-selection */
    let title = SERVICE_LABEL[svc];
    let subtitle = '';
    if (svc === 'admin-financiero' && form.adminSubService) {
      subtitle = ADMIN_SUB_LABEL[form.adminSubService as AdminSubService];
    } else if (svc === 'consultoria-fiscal' && form.consultoriaSubService) {
      subtitle = CONSULTORIA_SUB_LABEL[form.consultoriaSubService as ConsultoriaSubService];
    } else if (svc === 'auditoria') {
      title = 'Auditoría';
    }

    return (
      <div>
        <p className="text-gray-300 text-sm font-semibold mb-1">{title}</p>
        {subtitle && (
          <p className="text-purple-300 text-base font-bold mb-4">{subtitle}</p>
        )}
        <p className="text-gray-500 text-xs mb-5">Requiere evaluación personalizada. Contáctanos para una propuesta a la medida.</p>
        <a href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hola KONTAXES, me interesa cotizar: ${subtitle || title}`)}`}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold rounded-2xl hover:bg-emerald-500/25 transition-all text-sm w-full">
          <PhoneIcon size={15} /> Contactar por WhatsApp
        </a>
      </div>
    );
  };

  /* ── Outsourcing role ── */
  const stepOutsourcingRole = () => (
    <>
      <Q question="¿Qué perfil necesitas?" hint="Selecciona el nivel del profesional que externalizarás." />
      <div className="space-y-3">
        {(Object.entries(OUTSOURCING_ROLE_LABEL) as [OutsourcingRole, string][]).map(([v, label]) => (
          <Opt key={v} label={label}
            selected={form.outsourcingRole === v}
            onClick={() => pick(() => sOutsourcingRole(v))} />
        ))}
      </div>
    </>
  );

  /* ── Páginas Web sub-type ── */
  const stepPaginasWebSub = () => (
    <>
      <Q question="¿Qué tipo de desarrollo necesitas?" hint="Selecciona la categoría más cercana a tu proyecto." />
      <div className="space-y-2">
        {(Object.entries(PAGINAS_WEB_SUB_LABEL) as [PaginasWebSub, string][]).map(([v, label]) => (
          <Opt key={v} label={label}
            selected={form.paginasWebSub === v}
            onClick={() => pick(() => sPaginasWebSub(v))} />
        ))}
      </div>
    </>
  );

  /* ── Odoo sub-type ── */
  const stepOdooSubtype = () => (
    <>
      <Q question="¿Qué necesitas de Odoo?" />
      <div className="space-y-3">
        <Opt label="Módulos KTX — desarrollos propios para Guatemala"
          selected={form.odooSubtype === 'modulos-ktx'} accent="sky"
          onClick={() => pick(() => sOdooSubtype('modulos-ktx'))} />
        <Opt label="Acceso a nuestro sistema SaaS"
          selected={form.odooSubtype === 'acceso'} accent="emerald"
          onClick={() => pick(() => sOdooSubtype('acceso'))} />
        <Opt label="Implementación"
          selected={form.odooSubtype === 'implementacion'}
          onClick={() => pick(() => sOdooSubtype('implementacion'))} />
      </div>
    </>
  );

  /* ── Módulos KTX display ── */
  const stepOdooModulos = () => (
    <>
      <Q question="Módulos KTX para Odoo 19" hint="Desarrollos propios disponibles en el marketplace oficial de Odoo." />
      <div className="space-y-2">
        {KTX_MODULES.map((mod, i) => (
          <a key={i} href={mod.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white/3 border border-white/8 hover:bg-sky-500/10 hover:border-sky-500/30 transition-all group">
            <span className="text-sm text-gray-200 group-hover:text-white transition-colors font-medium">{mod.name}</span>
            <ExternalLinkIcon size={13} className="text-gray-600 group-hover:text-sky-400 flex-shrink-0 transition-colors" />
          </a>
        ))}
      </div>
      <p className="text-xs text-gray-600 mt-4 text-center">Haz clic para comprar y descargar en el marketplace oficial de Odoo.</p>
    </>
  );

  /* ── Implementación choice ── */
  const stepImplementacion = () => (
    <>
      <Q question="¿Cómo quieres implementar Odoo?" />
      <div className="space-y-3">
        <Opt label="Acceder a nuestro sistema SaaS" accent="emerald"
          selected={form.implementacionChoice === 'acceso'}
          onClick={() => pick(() => sImplementacionChoice('acceso'))} />
        <Opt label="Contactar a un partner oficial de Odoo"
          selected={form.implementacionChoice === 'partner'}
          onClick={() => pick(() => sImplementacionChoice('partner'))} />
      </div>
      <div className="mt-4 px-4 py-3 rounded-xl bg-amber-500/8 border border-amber-500/15">
        <p className="text-xs text-amber-400/80 leading-relaxed">
          KONTAXES CONSULTORES, S.A. no es un partner oficial de Odoo.
          Si requieres implementación propia, te referiremos a nuestro partner certificado.
        </p>
      </div>
    </>
  );

  /* ── Acceso plan ── */
  const stepAccesoPlan = () => (
    <>
      <Q question="¿Qué plan necesitas?" hint="Acceso a Odoo V19 Enterprise en nuestra base de datos. Q150 por cada usuario adicional." />
      <div className="space-y-3">
        {(Object.entries(ACCESO_PLANS) as [AccesoPlan, { label: string; total: number }][]).map(([v, plan]) => (
          <Opt key={v} label={plan.label}
            selected={form.accesoPlan === v} accent="emerald"
            onClick={() => pick(() => sAccesoPlan(v))} />
        ))}
      </div>
    </>
  );

  /* ── Acceso usuarios adicionales ── */
  const stepAccesoUsuarios = () => {
    const count = Math.max(0, form.accesoUsuariosAdicionales === -1 ? 0 : form.accesoUsuariosAdicionales);
    const changeCount = (delta: number) => {
      const next = Math.max(0, count + delta);
      setForm(p => ({ ...p, accesoUsuariosAdicionales: next }));
    };
    return (
      <>
        <Q question="¿Usuarios adicionales?" hint={`Q${PRICE_USUARIO_ADICIONAL}/usuario adicional al mes.`} />
        <div className="flex items-center justify-center gap-6 py-6">
          <button onClick={() => changeCount(-1)} disabled={count === 0}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:bg-white/10 disabled:opacity-30 transition-all">
            <MinusIcon size={18} />
          </button>
          <div className="text-center">
            <p className="text-5xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{count}</p>
            <p className="text-xs text-gray-500 mt-1">usuarios adicionales</p>
          </div>
          <button onClick={() => changeCount(1)}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:bg-white/10 transition-all">
            <PlusIcon size={18} />
          </button>
        </div>
        {count > 0 && (
          <p className="text-center text-sm text-emerald-400 mb-2">
            +Q{(count * PRICE_USUARIO_ADICIONAL).toLocaleString('es-GT')}/mes
          </p>
        )}
        <button onClick={() => { setForm(p => ({ ...p, accesoUsuariosAdicionales: count })); setTimeout(advance, 100); }}
          className="w-full mt-2 py-3.5 font-bold rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm flex items-center justify-center gap-2">
          Continuar <ArrowRightIcon size={14} />
        </button>
      </>
    );
  };

  /* ── Admin Financiero sub-service ── */
  const stepAdminSub = () => (
    <>
      <Q question="¿Qué servicio administrativo necesitas?" hint="Selecciona el área específica en la que necesitas apoyo." />
      <div className="space-y-2">
        {(Object.entries(ADMIN_SUB_LABEL) as [AdminSubService, string][]).map(([v, label]) => (
          <Opt key={v} label={label}
            selected={form.adminSubService === v}
            onClick={() => pick(() => sAdminSubService(v))} />
        ))}
      </div>
    </>
  );

  /* ── Consultoría Fiscal sub-service ── */
  const stepConsultoriaSub = () => (
    <>
      <Q question="¿Qué tipo de consultoría necesitas?" hint="Selecciona el tema fiscal sobre el que necesitas asesoría." />
      <div className="space-y-2">
        {(Object.entries(CONSULTORIA_SUB_LABEL) as [ConsultoriaSubService, string][]).map(([v, label]) => (
          <Opt key={v} label={label}
            selected={form.consultoriaSubService === v}
            onClick={() => pick(() => sConsultoriaSubService(v))} />
        ))}
      </div>
    </>
  );

  /* ── Contable shared steps ── */
  const stepContribuyente = () => (
    <>
      <Q question="¿Quién es el contribuyente?" hint="¿La responsabilidad legal recae en una persona natural o jurídica?" />
      <div className="space-y-3">
        <Opt label="Persona / Comerciante Individual"
          selected={form.contribuyente === 'individual'}
          onClick={() => pick(() => sContribuyente('individual'))} />
        <Opt label="Sociedad / Empresa (Persona Jurídica)"
          selected={form.contribuyente === 'sociedad'}
          onClick={() => pick(() => sContribuyente('sociedad'))} />
      </div>
    </>
  );

  const stepRegimen = () => (
    <>
      <Q question="¿Cuál es tu régimen fiscal?" hint="¿Bajo qué régimen tributas actualmente?" />
      <div className="space-y-3">
        {(['pequeño', 'opcional', 'general'] as Regimen[]).map(v => (
          <Opt key={v} label={REGIMEN_LABEL[v]}
            selected={form.regimen === v}
            onClick={() => pick(() => sRegimen(v))} />
        ))}
      </div>
    </>
  );

  const stepActivos = () => (
    <>
      <Q question="¿Tus activos superan Q25,000?" hint="Determina si la contabilidad completa es legalmente obligatoria para tu sociedad." />
      <div className="space-y-3">
        <Opt label="Sí, superan Q25,000" selected={form.activosMayor25k === true} accent="amber"
          onClick={() => pick(() => sActivos(true))} />
        <Opt label="No, son Q25,000 o menos" selected={form.activosMayor25k === false} accent="sky"
          onClick={() => pick(() => sActivos(false))} />
      </div>
    </>
  );

  const stepAlcance = () => (
    <>
      <Q question="¿A qué se dedica tu negocio?" hint="Define el alcance principal de tus actividades." />
      <div className="space-y-3">
        <Opt label="Servicios" selected={form.alcance === 'servicios'}
          onClick={() => pick(() => sAlcance('servicios'))} />
        <Opt label="Compra-venta de bienes" selected={form.alcance === 'compra-venta'} accent="emerald"
          onClick={() => pick(() => sAlcance('compra-venta'))} />
      </div>
    </>
  );

  const stepContabilidad = () => (
    <>
      <Q question="¿Deseas contabilidad completa?" hint="No es fiscalmente obligatorio, pero es recomendado financieramente para una gestión sólida." />
      <div className="space-y-3">
        <Opt label="Sí, contabilidad completa" selected={form.contabilidadCompleta === true}
          onClick={() => pick(() => sContabilidad(true))} />
        <Opt label="No por ahora" selected={form.contabilidadCompleta === false} accent="sky"
          onClick={() => pick(() => sContabilidad(false))} />
      </div>
    </>
  );

  const stepPlanilla = () => (
    <>
      <Q question="¿Requiere elaboración de planilla + IGSS?"
        hint="Control contable y generación de reportes SAT-IGSS. No incluye realizar los desembolsos." />
      <div className="space-y-3">
        <Opt label="Sí, incluir planilla e IGSS" selected={form.planillaIGSS === true} accent="emerald"
          onClick={() => pick(() => sPlanillaIGSS(true))} />
        <Opt label="No por ahora" selected={form.planillaIGSS === false}
          onClick={() => pick(() => sPlanillaIGSS(false))} />
      </div>
    </>
  );

  const stepImpuestos = () => {
    const reg = form.regimen as Regimen;
    const n   = FORMS[reg];
    const obligatoria = isContabilidadObligatoria(form);
    const hintMap: Record<Regimen, string> = {
      pequeño:  'IVA 5% mensual',
      opcional: 'IVA mensual · ISR mensual · ISR retenciones · ISR anual',
      general:  'IVA mensual · ISR trimestral · ISO trimestral · ISR anual · retenciones',
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
        <Q question="¿Presentamos tus impuestos?" hint={reg ? hintMap[reg] : ''} />
        <div className="space-y-3">
          <Opt label="Sí, KONTAXES presenta mis impuestos"
            selected={form.presentacionImpuestos === true} accent="emerald"
            onClick={() => pick(() => sImpuestos(true))} />
          <Opt label="No, lo gestiono yo"
            selected={form.presentacionImpuestos === false}
            onClick={() => pick(() => sImpuestos(false))} />
        </div>
        {form.serviceType === 'outsourcing' && (
          <p className="text-xs text-gray-500 mt-3">
            Para outsourcing, la presentación de impuestos añade horas al cálculo mensual.
          </p>
        )}
      </>
    );
  };

  const stepCertFEL = () => {
    const needsOdoo = form.contabilidadCompleta === true && form.alcance === 'compra-venta';
    const yesFELValue: CertFEL = needsOdoo ? 'odoo' : 'finanz-ia';
    return (
      <>
        <Q question="¿Necesitas certificador FEL?" hint="Factura Electrónica en Línea certificada por la SAT." />
        <div className="space-y-3">
          <Opt label="No por ahora" selected={form.certFEL === 'ninguno'}
            onClick={() => pick(() => sCertFEL('ninguno'))} />
          <Opt label="Sí, necesito certificador FEL" selected={form.certFEL === yesFELValue} accent="emerald"
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
      <Q question="¿Facturas por WhatsApp?" hint="Emite facturas electrónicas certificadas por la SAT directo desde WhatsApp." />
      <div className="space-y-3">
        <Opt label="Sí, solicitar facturas por WhatsApp" selected={form.whatsappFEL === true} accent="emerald"
          onClick={() => pick(() => sWhatsappFEL(true))} />
        <Opt label="No por ahora" selected={form.whatsappFEL === false}
          onClick={() => pick(() => sWhatsappFEL(false))} />
      </div>
    </>
  );

  const stepContact = () => {
    const fields: { k: 'nombre' | 'empresa' | 'whatsapp' | 'correo'; p: string; t: string }[] = [
      { k: 'nombre',   p: 'Nombre completo *',    t: 'text'  },
      { k: 'empresa',  p: 'Nombre de empresa *',  t: 'text'  },
      { k: 'whatsapp', p: 'WhatsApp (+502…) *',   t: 'tel'   },
      { k: 'correo',   p: 'Correo electrónico *', t: 'email' },
    ];
    return (
      <>
        <Q question="¿Tus datos?" hint="Requeridos para personalizar tu cotización." />
        <div className="grid grid-cols-2 gap-3 mb-3">
          {fields.map(f => {
            const empty = contactError && !form[f.k]?.trim();
            return (
              <input key={f.k} type={f.t} placeholder={f.p}
                value={form[f.k] || ''}
                onChange={e => { setContactError(false); sContact(f.k, e.target.value); }}
                className={`px-4 py-3 rounded-xl bg-white/5 border text-gray-300 text-sm placeholder-gray-600 focus:outline-none focus:bg-white/8 transition-all ${
                  empty ? 'border-red-500/60 focus:border-red-400' : 'border-white/10 focus:border-purple-500/50'
                }`} />
            );
          })}
        </div>
        {contactError && (
          <p className="text-xs text-red-400 mb-3 flex items-center gap-1.5">
            <AlertCircleIcon size={12} className="flex-shrink-0" />
            Por favor completa todos los campos para generar tu cotización.
          </p>
        )}
        <button onClick={handleCalc}
          className="w-full mt-2 py-4 font-bold rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5 hover:from-purple-500 hover:to-violet-500 transition-all text-base flex items-center justify-center gap-2">
          <CalculatorIcon size={20} /> Ver mi cotización →
        </button>
      </>
    );
  };

  const renderStep = () => {
    switch (stepId) {
      case 'service-type':    return stepServiceType();
      case 'contact-service': return stepContactService();
      case 'outsourcing-role':  return stepOutsourcingRole();
      case 'paginas-web-sub':   return stepPaginasWebSub();
      case 'admin-sub':         return stepAdminSub();
      case 'consultoria-sub':  return stepConsultoriaSub();
      case 'odoo-subtype':    return stepOdooSubtype();
      case 'odoo-modulos':    return stepOdooModulos();
      case 'implementacion':  return stepImplementacion();
      case 'acceso-plan':     return stepAccesoPlan();
      case 'acceso-usuarios': return stepAccesoUsuarios();
      case 'contribuyente':   return stepContribuyente();
      case 'regimen':         return stepRegimen();
      case 'activos':         return stepActivos();
      case 'alcance':         return stepAlcance();
      case 'contabilidad':    return stepContabilidad();
      case 'planilla':        return stepPlanilla();
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
            <p className="text-gray-400 text-sm">
              {form.serviceType === 'odoo' ? 'Acceso SaaS Odoo V19 Enterprise' : form.serviceType === 'outsourcing' ? 'Outsourcing mensual · incluye supervisión' : 'Servicios contables mensuales · IVA incluido'}
            </p>
            {form.nombre && (
              <p className="text-white font-semibold text-sm mt-2">
                {form.nombre}{form.empresa ? ` — ${form.empresa}` : ''}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-0.5">Desde</p>
            <p className="text-4xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Q {result!.total.toLocaleString('es-GT')}
              <span className="text-gray-500 text-lg font-normal">.00</span>
            </p>
            <p className="text-xs text-gray-500 mt-0.5">mensual estimado</p>
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
          <div className="flex items-start justify-between pt-2 gap-4">
            <div className="flex-1">
              <p className="text-sm font-bold text-white uppercase tracking-wide mb-1">Total estimado</p>
              <p className="text-xs text-gray-500 leading-snug">
                El monto puede variar según el volumen de operaciones: cantidad de facturas a procesar, movimientos bancarios a conciliar, entre otros.
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-gray-500 mb-0.5">Desde</p>
              <p className="text-2xl font-bold text-white tabular-nums" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Q {result!.total.toLocaleString('es-GT')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {result!.notes.length > 0 && (
        <div className="px-8 py-4 border-b border-orange-500/10 bg-orange-500/5">
          <p className="text-xs font-bold uppercase tracking-wider text-orange-500 mb-2">Notas importantes</p>
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

      <div className="px-8 py-6 grid grid-cols-2 gap-3">
        <button onClick={handlePDF} disabled={pdfLoading}
          className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold rounded-2xl hover:from-purple-500 hover:to-violet-500 transition-all hover:-translate-y-0.5 shadow-lg text-sm disabled:opacity-60">
          <DownloadIcon size={15} /> {pdfLoading ? 'Generando…' : 'Descargar PDF'}
        </button>
        <button onClick={handleWA} disabled={pdfLoading}
          className="flex items-center justify-center gap-2 py-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold rounded-2xl hover:bg-emerald-500/25 transition-all text-sm disabled:opacity-60">
          <MessageCircleIcon size={15} /> {pdfLoading ? 'Generando…' : 'WhatsApp'}
        </button>
      </div>
      <div className="px-8 pb-2">
        <p className="text-xs text-gray-600 text-center">
          Al hacer clic en WhatsApp, el PDF se descarga automáticamente — adjúntalo en la conversación.
        </p>
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

              <div key={key} className={back ? 'animate-slide-in-back' : 'animate-slide-in'}>
                <div className="px-8 pt-8 pb-8">
                  {renderStep()}

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
