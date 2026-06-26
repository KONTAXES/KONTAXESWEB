import React, { useState } from 'react';
import {
  CalculatorIcon, CheckCircleIcon, AlertCircleIcon,
  DownloadIcon, MessageCircleIcon, MailIcon,
  ChevronRightIcon, UserIcon, PhoneIcon,
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

/* ── Helpers ──────────────────────────────────────────────────────────── */

function pill(active: boolean, accent: 'purple' | 'emerald' | 'sky' | 'amber' = 'purple') {
  const accent_classes = {
    purple: 'bg-purple-500/20 border-purple-500/60 text-purple-300 ring-purple-500/20',
    emerald: 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 ring-emerald-500/20',
    sky:    'bg-sky-500/20 border-sky-500/60 text-sky-300 ring-sky-500/20',
    amber:  'bg-amber-500/20 border-amber-500/60 text-amber-300 ring-amber-500/20',
  };
  return `w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
    active
      ? `${accent_classes[accent]} shadow-lg ring-1 ring-inset`
      : 'bg-white/3 border-white/8 text-gray-400 hover:border-white/20 hover:bg-white/6 hover:text-gray-300'
  }`;
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2 mb-4">
    <div className="h-px flex-1 bg-white/5" />
    <span className="text-xs font-bold uppercase tracking-widest text-purple-400 px-2">{children}</span>
    <div className="h-px flex-1 bg-white/5" />
  </div>
);

const StepCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white/3 border border-white/8 rounded-2xl p-6 animate-fade-in ${className}`}>
    {children}
  </div>
);

const StepTitle = ({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) => (
  <div className="flex items-start gap-3 mb-5">
    <span className="text-2xl">{icon}</span>
    <div>
      <p className="text-white font-bold text-sm">{title}</p>
      {subtitle && <p className="text-gray-500 text-xs mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

/* Badge for obligatoria notice */
const ObligatoriaNotice = ({ reason }: { reason: string }) => (
  <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-500/10 border border-purple-500/25">
    <CheckCircleIcon size={16} className="text-purple-400 flex-shrink-0 mt-0.5" />
    <div>
      <p className="text-purple-300 text-sm font-semibold">Contabilidad completa con FinanzIA — Obligatoria</p>
      <p className="text-purple-400/70 text-xs mt-1">{reason} · +Q500/mes</p>
    </div>
  </div>
);

/* Non-contable service contact card */
const ContactServiceCard = ({ serviceType }: { serviceType: ServiceType }) => {
  const info: Record<string, { icon: string; desc: string }> = {
    auditoria: {
      icon: '🔍',
      desc: 'Los servicios de auditoría requieren una evaluación personalizada de tus necesidades, alcance y documentación. Contáctanos para una propuesta a la medida.',
    },
    outsourcing: {
      icon: '🤝',
      desc: 'El outsourcing contable y administrativo se cotiza según el volumen de operaciones, cantidad de colaboradores y procesos a externalizar.',
    },
    'modulos-odoo': {
      icon: '🧩',
      desc: 'El costo de los módulos Odoo varía según los módulos requeridos, número de usuarios y configuraciones. Trabajamos con Odoo Community y Enterprise.',
    },
    'implementacion-odoo': {
      icon: '⚙️',
      desc: 'Ayudamos con la implementación de Odoo aunque no somos partners oficiales. La cotización depende del alcance, módulos y horas de consultoría requeridas.',
    },
  };
  const item = info[serviceType] ?? { icon: '📋', desc: 'Contáctanos para más información.' };

  return (
    <StepCard>
      <div className="text-center py-4">
        <span className="text-5xl mb-4 block">{item.icon}</span>
        <h3 className="text-white font-bold text-lg mb-2">{SERVICE_LABEL[serviceType]}</h3>
        <p className="text-gray-400 text-sm max-w-md mx-auto mb-6 leading-relaxed">{item.desc}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hola KONTAXES, me interesa cotizar: ${SERVICE_LABEL[serviceType]}`)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold rounded-xl hover:bg-emerald-500/25 transition-all text-sm"
          >
            <PhoneIcon size={15} /> Contactar por WhatsApp
          </a>
          <a
            href={`mailto:info@kontaxes.com?subject=${encodeURIComponent(`Cotización: ${SERVICE_LABEL[serviceType]}`)}`}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-500/15 border border-purple-500/30 text-purple-400 font-bold rounded-xl hover:bg-purple-500/25 transition-all text-sm"
          >
            <MailIcon size={15} /> Enviar correo
          </a>
        </div>
      </div>
    </StepCard>
  );
};

/* ── Fresh state ─────────────────────────────────────────────────────── */

const EMPTY: QuotationData = {
  serviceType: '', contribuyente: '', regimen: '',
  activosMayor25k: null, alcance: '', contabilidadCompleta: null,
  presentacionImpuestos: null, certFEL: '', whatsappFEL: null,
  nombre: '', empresa: '', whatsapp: '', correo: '',
};

/* ── Main component ──────────────────────────────────────────────────── */

export function QuotationCalculator() {
  const [form, setForm] = useState<QuotationData>(EMPTY);
  const [result, setResult] = useState<QuotationResult | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  /* --- Setters with cascade reset --- */
  const setServiceType = (v: ServiceType) => {
    setForm({ ...EMPTY, serviceType: v, nombre: form.nombre, empresa: form.empresa, whatsapp: form.whatsapp, correo: form.correo });
    setResult(null);
  };

  const setContribuyente = (v: Contribuyente) => {
    setForm(p => ({ ...p, contribuyente: v, regimen: '', activosMayor25k: null, alcance: '', contabilidadCompleta: null, presentacionImpuestos: null, certFEL: '', whatsappFEL: null }));
    setResult(null);
  };

  const setRegimen = (v: Regimen) => {
    setForm(p => ({ ...p, regimen: v, activosMayor25k: null, alcance: '', contabilidadCompleta: null, presentacionImpuestos: null, certFEL: '', whatsappFEL: null }));
    setResult(null);
  };

  const setActivosMayor25k = (v: boolean) => {
    setForm(p => ({ ...p, activosMayor25k: v, alcance: '', contabilidadCompleta: null, presentacionImpuestos: null, certFEL: '', whatsappFEL: null }));
    setResult(null);
  };

  const setAlcance = (v: Alcance) => {
    setForm(p => ({ ...p, alcance: v, contabilidadCompleta: null, presentacionImpuestos: null, certFEL: '', whatsappFEL: null }));
    setResult(null);
  };

  const setContabilidadCompleta = (v: boolean) => {
    setForm(p => ({ ...p, contabilidadCompleta: v, presentacionImpuestos: null, certFEL: '', whatsappFEL: null }));
    setResult(null);
  };

  const setPresentacionImpuestos = (v: boolean) => {
    setForm(p => ({ ...p, presentacionImpuestos: v, certFEL: '', whatsappFEL: null }));
    setResult(null);
  };

  const setCertFEL = (v: CertFEL) => {
    setForm(p => ({ ...p, certFEL: v, whatsappFEL: null }));
    setResult(null);
  };

  const setWhatsappFEL = (v: boolean) => {
    setForm(p => ({ ...p, whatsappFEL: v }));
    setResult(null);
  };

  const setContact = (key: 'nombre' | 'empresa' | 'whatsapp' | 'correo', v: string) => {
    setForm(p => ({ ...p, [key]: v }));
  };

  /* --- Computed state --- */
  const obligatoria  = isContabilidadObligatoria(form);
  const needsActivos = needsActivosQuestion(form);
  const isContable   = form.serviceType === 'contable';

  const activosAnswered = !needsActivos || form.activosMayor25k !== null;
  const contabilidadDetermined = obligatoria || form.contabilidadCompleta !== null;

  // Visibility of each step
  const showContrib    = isContable;
  const showRegimen    = showContrib && !!form.contribuyente;
  const showActivos    = showRegimen && !!form.regimen && needsActivos;
  const showAlcance    = showRegimen && !!form.regimen && activosAnswered;
  const showContab     = showAlcance && !!form.alcance;
  const showImpuestos  = showContab && contabilidadDetermined;
  const showFEL        = showImpuestos && form.presentacionImpuestos !== null;
  const showWAFel      = showFEL && !!form.certFEL;
  const showContact    = showWAFel && form.whatsappFEL !== null;
  const canCalculate   = showContact;

  /* --- Handlers --- */
  const handleCalculate = () => {
    if (!canCalculate) return;
    setResult(calculateQuotation(form));
    setTimeout(() => document.getElementById('cotizador-result')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleDownloadPDF = async () => {
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

  /* --- Preview total (live) --- */
  const liveTotal = canCalculate || (showContab && contabilidadDetermined)
    ? calculateQuotation(form).total
    : null;

  /* ── Render ─────────────────────────────────────────────────────── */
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
          <p className="text-gray-400 text-lg">Obtén tu estimación en segundos</p>
        </div>

        <div className="reveal space-y-5">

          {/* ── Paso 0: Tipo de servicio ─────────────────────────────── */}
          <StepCard>
            <StepTitle icon="🎯" title="¿Qué servicio necesitas?" subtitle="Selecciona el tipo de servicio para comenzar" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.entries(SERVICE_LABEL) as [ServiceType, string][]).map(([val, label]) => {
                const icons: Record<ServiceType, string> = {
                  contable: '📊', auditoria: '🔍', outsourcing: '🤝',
                  'modulos-odoo': '🧩', 'implementacion-odoo': '⚙️',
                };
                const subtitles: Record<ServiceType, string> = {
                  contable: 'Contabilidad, impuestos y asesoría',
                  auditoria: 'Revisión y certificación de estados',
                  outsourcing: 'Externalización de procesos',
                  'modulos-odoo': 'Módulos personalizados para Odoo',
                  'implementacion-odoo': 'Ayudamos con tu implementación',
                };
                return (
                  <button key={val} onClick={() => setServiceType(val)} className={pill(form.serviceType === val)}>
                    <span className="text-xl mb-1 block">{icons[val]}</span>
                    <span className="block font-semibold text-xs leading-snug">{label}</span>
                    <span className="block text-xs opacity-50 mt-0.5">{subtitles[val]}</span>
                    {form.serviceType === val && <CheckCircleIcon size={12} className="mt-1.5 text-purple-400" />}
                  </button>
                );
              })}
            </div>
          </StepCard>

          {/* No-contable: card de contacto */}
          {form.serviceType && form.serviceType !== 'contable' && (
            <ContactServiceCard serviceType={form.serviceType as ServiceType} />
          )}

          {/* ── Flujo contable ──────────────────────────────────────── */}
          {isContable && (
            <>
              {/* Paso 1: Tipo de contribuyente */}
              <StepCard>
                <StepTitle icon="🏢" title="Tipo de contribuyente" subtitle="¿Quién asume la responsabilidad legal del negocio?" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(Object.entries(CONTRIB_LABEL) as [Contribuyente, string][]).map(([val, label]) => {
                    const subs: Record<Contribuyente, string> = {
                      individual: 'La responsabilidad recae en una persona natural',
                      sociedad: 'La responsabilidad recae en una persona jurídica (S.A.)',
                    };
                    const icons = { individual: '👤', sociedad: '🏛️' };
                    return (
                      <button key={val} onClick={() => setContribuyente(val)} className={pill(form.contribuyente === val)}>
                        <span className="text-xl mb-1 block">{icons[val]}</span>
                        <span className="block font-semibold text-xs leading-snug">{label}</span>
                        <span className="block text-xs opacity-50 mt-0.5">{subs[val]}</span>
                        {form.contribuyente === val && <CheckCircleIcon size={12} className="mt-1.5 text-purple-400" />}
                      </button>
                    );
                  })}
                </div>
              </StepCard>

              {/* Paso 2: Régimen fiscal */}
              {showRegimen && (
                <StepCard>
                  <StepTitle icon="📋" title="Régimen fiscal" subtitle="¿Bajo qué régimen tributa tu negocio?" />
                  <div className="grid grid-cols-1 gap-3">
                    {(Object.entries(REGIMEN_LABEL) as [Regimen, string][]).map(([val, label]) => {
                      const prices = { pequeño: 250, opcional: 450, general: 550 };
                      const base = prices[val];
                      const societyExtra = form.contribuyente === 'sociedad' ? 500 : 0;
                      const totalBase = base + societyExtra;
                      const descs: Record<Regimen, string> = {
                        pequeño: 'Aplica para negocios con ingresos anuales menores a Q150,000',
                        opcional: 'Pagos trimestrales del ISR; el más utilizado por PYMEs',
                        general:  'Para empresas con operaciones más complejas; ISR sobre utilidades netas',
                      };
                      const formCount = FORMS[val];
                      return (
                        <button key={val} onClick={() => setRegimen(val)} className={`${pill(form.regimen === val)} flex items-start justify-between gap-3`}>
                          <div className="flex-1 text-left">
                            <span className="block font-semibold text-sm leading-snug">{label}</span>
                            <span className="block text-xs opacity-50 mt-0.5">{descs[val]}</span>
                            <span className="block text-xs opacity-40 mt-0.5">{formCount} {formCount === 1 ? 'formulario' : 'formularios'} de impuestos</span>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-xs font-bold text-purple-300 block">desde Q{totalBase}</span>
                            <span className="text-xs text-gray-600">/mes</span>
                          </div>
                          {form.regimen === val && <CheckCircleIcon size={12} className="mt-1 text-purple-400 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </StepCard>
              )}

              {/* Paso 2b: Activos (solo sociedad + pequeño) */}
              {showActivos && (
                <StepCard>
                  <StepTitle icon="💰" title="¿Tus activos totales superan Q25,000?" subtitle="Determina si la contabilidad completa es legalmente obligatoria" />
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { val: true,  icon: '✅', label: 'Sí, superan Q25,000', sub: 'Contabilidad completa será obligatoria por ley' },
                      { val: false, icon: '❌', label: 'No, son Q25,000 o menos', sub: 'Contabilidad completa es opcional' },
                    ].map(o => (
                      <button key={String(o.val)} onClick={() => setActivosMayor25k(o.val)} className={pill(form.activosMayor25k === o.val, o.val ? 'amber' : 'sky')}>
                        <span className="text-xl mb-1 block">{o.icon}</span>
                        <span className="block font-semibold text-xs leading-snug">{o.label}</span>
                        <span className="block text-xs opacity-50 mt-0.5">{o.sub}</span>
                        {form.activosMayor25k === o.val && <CheckCircleIcon size={12} className="mt-1.5 text-purple-400" />}
                      </button>
                    ))}
                  </div>
                </StepCard>
              )}

              {/* Paso 3: Alcance del servicio */}
              {showAlcance && (
                <StepCard>
                  <StepTitle icon="🧭" title="Alcance del negocio" subtitle="¿A qué se dedica principalmente tu empresa?" />
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { val: 'servicios' as Alcance,    icon: '💼', label: 'Servicios', sub: 'Técnicos, profesionales, consultoría, etc.' },
                      { val: 'compra-venta' as Alcance, icon: '🛒', label: 'Compra-venta de bienes', sub: 'Requiere control de inventarios y costo de ventas (+Q500)' },
                    ].map(o => (
                      <button key={o.val} onClick={() => setAlcance(o.val)} className={pill(form.alcance === o.val, o.val === 'compra-venta' ? 'emerald' : 'purple')}>
                        <span className="text-2xl mb-1 block">{o.icon}</span>
                        <span className="block font-semibold text-xs leading-snug">{o.label}</span>
                        <span className="block text-xs opacity-50 mt-0.5">{o.sub}</span>
                        {form.alcance === o.val && <CheckCircleIcon size={12} className="mt-1.5 text-purple-400" />}
                      </button>
                    ))}
                  </div>
                </StepCard>
              )}

              {/* Paso 4: Contabilidad completa */}
              {showContab && (
                <StepCard>
                  <StepTitle
                    icon="📒"
                    title="Contabilidad completa con FinanzIA"
                    subtitle="Catálogo de cuentas, asientos contables y estados financieros — +Q500/mes"
                  />
                  {obligatoria ? (
                    <ObligatoriaNotice
                      reason={
                        form.contribuyente === 'sociedad' && form.regimen !== 'pequeño'
                          ? `Las sociedades bajo ${REGIMEN_LABEL[form.regimen as Regimen]} están obligadas a llevar contabilidad completa`
                          : 'Tu sociedad tiene activos mayores a Q25,000, por lo que la ley exige contabilidad completa'
                      }
                    />
                  ) : (
                    <div className="space-y-3">
                      <p className="text-gray-500 text-xs mb-3">
                        No es fiscalmente obligatorio, pero es <span className="text-gray-300">recomendado financieramente</span> para una gestión sólida.
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { val: true,  icon: '📊', label: 'Sí, quiero contabilidad completa', sub: '+Q500/mes · Plataforma FinanzIA' },
                          { val: false, icon: '⏩', label: 'No por ahora', sub: 'Solo contabilidad básica' },
                        ].map(o => (
                          <button key={String(o.val)} onClick={() => setContabilidadCompleta(o.val)} className={pill(form.contabilidadCompleta === o.val)}>
                            <span className="text-xl mb-1 block">{o.icon}</span>
                            <span className="block font-semibold text-xs leading-snug">{o.label}</span>
                            <span className="block text-xs opacity-50 mt-0.5">{o.sub}</span>
                            {form.contabilidadCompleta === o.val && <CheckCircleIcon size={12} className="mt-1.5 text-purple-400" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </StepCard>
              )}

              {/* Paso 5: Presentación de impuestos */}
              {showImpuestos && (
                <StepCard>
                  {(() => {
                    const reg = form.regimen as Regimen;
                    const numForms = FORMS[reg];
                    const cost = numForms * 100;
                    return (
                      <>
                        <StepTitle
                          icon="🧾"
                          title="¿Incluir presentación de impuestos?"
                          subtitle={`${numForms} ${numForms === 1 ? 'formulario' : 'formularios'} · +Q${cost}/mes si seleccionas Sí`}
                        />
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { val: true,  icon: '✅', label: `Sí (+Q${cost}/mes)`, sub: `KONTAXES presenta tus ${numForms === 1 ? 'impuesto' : 'impuestos'} ante la SAT` },
                            { val: false, icon: '⏩', label: 'No, lo hago yo mismo', sub: 'Tú o tu equipo presentan los formularios' },
                          ].map(o => (
                            <button key={String(o.val)} onClick={() => setPresentacionImpuestos(o.val)} className={pill(form.presentacionImpuestos === o.val, o.val ? 'emerald' : 'purple')}>
                              <span className="text-xl mb-1 block">{o.icon}</span>
                              <span className="block font-semibold text-xs leading-snug">{o.label}</span>
                              <span className="block text-xs opacity-50 mt-0.5">{o.sub}</span>
                              {form.presentacionImpuestos === o.val && <CheckCircleIcon size={12} className="mt-1.5 text-purple-400" />}
                            </button>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </StepCard>
              )}

              {/* Paso 6: Certificador FEL */}
              {showFEL && (
                <StepCard>
                  <StepTitle
                    icon="🧾"
                    title="Certificador FEL — Factura Electrónica"
                    subtitle="¿Necesitas emitir Facturas Electrónicas en Línea (FEL) certificadas por la SAT?"
                  />
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      {
                        val: 'ninguno' as CertFEL,
                        icon: '⏩',
                        label: 'No necesito por ahora',
                        sub: 'Puedes agregarlo después cuando lo necesites',
                        badge: '',
                      },
                      {
                        val: 'odoo' as CertFEL,
                        icon: '🟣',
                        label: 'Vía Odoo (CORPOSISTEMAS, S.A.)',
                        sub: 'Q375 implementación (cobro único) + Q0.20/DTE emitido',
                        badge: 'popular',
                      },
                      {
                        val: 'finanz-ia' as CertFEL,
                        icon: '🟢',
                        label: 'Vía FinanzIA',
                        sub: 'Sin costo de implementación · Q0.20/DTE emitido',
                        badge: '',
                      },
                    ].map(o => (
                      <button key={o.val} onClick={() => setCertFEL(o.val)} className={`${pill(form.certFEL === o.val)} flex items-center justify-between gap-3`}>
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-xl flex-shrink-0">{o.icon}</span>
                          <div className="text-left">
                            <span className="block font-semibold text-xs leading-snug">{o.label}</span>
                            <span className="block text-xs opacity-50 mt-0.5">{o.sub}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {o.badge === 'popular' && (
                            <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full">popular</span>
                          )}
                          {form.certFEL === o.val && <CheckCircleIcon size={14} className="text-purple-400" />}
                        </div>
                      </button>
                    ))}
                  </div>
                  {(form.certFEL === 'odoo' || form.certFEL === 'finanz-ia') && (
                    <p className="text-xs text-amber-400/70 mt-3 flex items-start gap-1.5">
                      <AlertCircleIcon size={13} className="flex-shrink-0 mt-0.5" />
                      El costo por DTE emitido (Q0.20) es variable y se factura mensualmente por separado según el volumen de facturas. No se incluye en el total mensual.
                    </p>
                  )}
                </StepCard>
              )}

              {/* Paso 7: WhatsApp FEL (FELSimple) */}
              {showWAFel && (
                <StepCard>
                  <StepTitle
                    icon="📱"
                    title="¿Facturas por WhatsApp? (FELSimple)"
                    subtitle="Emite facturas electrónicas certificadas directamente desde WhatsApp — +Q50/mes"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { val: true,  icon: '💬', label: 'Sí, quiero FELSimple', sub: '+Q50/mes · Facturas desde WhatsApp en segundos' },
                      { val: false, icon: '⏩', label: 'No por ahora', sub: 'Puedes activarlo después' },
                    ].map(o => (
                      <button key={String(o.val)} onClick={() => setWhatsappFEL(o.val)} className={pill(form.whatsappFEL === o.val, o.val ? 'emerald' : 'purple')}>
                        <span className="text-xl mb-1 block">{o.icon}</span>
                        <span className="block font-semibold text-xs leading-snug">{o.label}</span>
                        <span className="block text-xs opacity-50 mt-0.5">{o.sub}</span>
                        {form.whatsappFEL === o.val && <CheckCircleIcon size={12} className="mt-1.5 text-purple-400" />}
                      </button>
                    ))}
                  </div>
                </StepCard>
              )}

              {/* Datos de contacto (opcionales) */}
              {showContact && (
                <StepCard>
                  <div className="flex items-center gap-2 mb-5">
                    <UserIcon size={16} className="text-purple-400" />
                    <span className="text-sm font-semibold text-gray-300">
                      Tus datos <span className="text-gray-600 font-normal">(opcional — para incluir en la cotización)</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { key: 'nombre'   as const, placeholder: 'Nombre completo',    type: 'text'  },
                      { key: 'empresa'  as const, placeholder: 'Nombre de empresa',  type: 'text'  },
                      { key: 'whatsapp' as const, placeholder: 'WhatsApp (+502…)',    type: 'tel'   },
                      { key: 'correo'   as const, placeholder: 'Correo electrónico', type: 'email' },
                    ]).map(f => (
                      <input
                        key={f.key}
                        type={f.type}
                        placeholder={f.placeholder}
                        value={form[f.key] || ''}
                        onChange={e => setContact(f.key, e.target.value)}
                        className="px-4 py-2.5 rounded-xl bg-white/4 border border-white/8 text-gray-300 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/6 transition-all"
                      />
                    ))}
                  </div>

                  {/* Live preview total */}
                  {liveTotal !== null && liveTotal > 0 && (
                    <div className="mt-5 p-4 rounded-xl bg-purple-500/8 border border-purple-500/15 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Estimado preliminar</span>
                      <span className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        Q {liveTotal.toLocaleString('es-GT')}<span className="text-gray-500 text-base font-normal">.00/mes</span>
                      </span>
                    </div>
                  )}
                </StepCard>
              )}

              {/* CTA */}
              {showContact && (
                <button
                  onClick={handleCalculate}
                  className="w-full py-4 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-base bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5 hover:from-purple-500 hover:to-violet-500 cursor-pointer"
                >
                  <CalculatorIcon size={20} />
                  Ver mi cotización detallada →
                </button>
              )}
            </>
          )}

          {/* ── Resultado ────────────────────────────────────────────── */}
          {result && (
            <div id="cotizador-result" className="border border-purple-500/30 rounded-2xl overflow-hidden animate-fade-in">

              {/* Total header */}
              <div className="bg-gradient-to-r from-purple-900/60 to-violet-900/40 p-6 border-b border-purple-500/20">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-1">Cotización Estimada</p>
                    <p className="text-gray-400 text-sm">Servicios contables mensuales · IVA incluido</p>
                    {form.nombre && (
                      <p className="text-white font-semibold text-sm mt-2">{form.nombre}{form.empresa ? ` — ${form.empresa}` : ''}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-500 mb-1">Total mensual</p>
                    <p className="text-4xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Q {result.total.toLocaleString('es-GT')}
                      <span className="text-gray-500 text-lg font-normal">.00</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Breakdown */}
              <div className="p-6 bg-white/2 border-b border-white/5">
                <SectionLabel>Desglose de servicios</SectionLabel>
                <div className="space-y-3">
                  {result.breakdown.map((item, i) => (
                    <div key={i} className="flex items-start justify-between gap-4 py-2 border-b border-white/5 last:border-0">
                      <div className="flex-1">
                        <p className="text-sm text-gray-200 font-medium">{item.item}</p>
                        {item.note && <p className="text-xs text-gray-500 mt-0.5">{item.note}</p>}
                      </div>
                      <p className="text-sm font-bold text-purple-300 flex-shrink-0">Q {item.cost.toLocaleString('es-GT')}</p>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-sm font-bold text-white uppercase tracking-wide">Total mensual</p>
                    <p className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Q {result.total.toLocaleString('es-GT')}
                    </p>
                  </div>
                </div>
              </div>

              {/* FEL notes */}
              {result.notes.length > 0 && (
                <div className="p-4 bg-amber-500/5 border-b border-amber-500/10 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">Costos variables adicionales</p>
                  {result.notes.map((n, i) => (
                    <div key={i} className="flex gap-2 text-xs text-amber-300/80">
                      <AlertCircleIcon size={13} className="flex-shrink-0 mt-0.5" /> {n}
                    </div>
                  ))}
                </div>
              )}

              {/* Disclaimer */}
              <div className="px-6 py-3 bg-blue-500/5 border-b border-blue-500/10">
                <p className="text-xs text-blue-300">
                  ℹ Esta es una <strong>estimación</strong>. La cotización formal y contrato se enviarán al formalizar el servicio.
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
                  {pdfLoading ? 'Generando…' : 'Descargar PDF'}
                </button>
                <button
                  onClick={handleWA}
                  className="flex items-center justify-center gap-2 py-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold rounded-xl hover:bg-emerald-500/25 transition-all text-sm"
                >
                  <MessageCircleIcon size={15} /> WhatsApp
                </button>
                <button
                  onClick={handleEmail}
                  className="flex items-center justify-center gap-2 py-3 bg-purple-500/15 border border-purple-500/30 text-purple-400 font-bold rounded-xl hover:bg-purple-500/25 transition-all text-sm"
                >
                  <MailIcon size={15} /> Correo
                </button>
              </div>

              {/* Recalculate */}
              <div className="px-6 pb-5 text-center">
                <button
                  onClick={() => { setResult(null); setForm(EMPTY); }}
                  className="text-xs text-gray-600 hover:text-gray-400 transition-colors flex items-center gap-1 mx-auto"
                >
                  <ChevronRightIcon size={11} className="rotate-180" /> Nueva cotización
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
