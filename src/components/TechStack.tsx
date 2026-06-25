import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  CheckIcon, ChevronRightIcon, ZapIcon, BarChart3Icon, FileCheckIcon,
  DatabaseIcon, TrendingUpIcon, FileTextIcon, BrainCircuitIcon,
  ShieldCheckIcon, MessageSquareIcon,
} from 'lucide-react';

/* ─── Data ─────────────────────────────────────────── */
const cards = [
  {
    id: 'ktx',
    name: 'Odoo + IA + Módulos KTX',
    short: 'Stack Principal',
    emoji: '⚡',
    border: 'border-purple-500/40',
    bg: 'bg-purple-500/8',
    glow: 'bg-purple-600/25',
    glow2: 'bg-violet-600/15',
    text: 'text-purple-400',
    badge: 'bg-purple-500/15 border-purple-500/30 text-purple-300',
    ring: 'ring-purple-500/30',
    activeBg: 'from-purple-900/40 to-violet-900/30',
    icon: ZapIcon,
    tagline: 'ERP · Inteligencia Artificial · Guatemala',
    description:
      'La combinación más potente para contabilidad moderna: Odoo 19 como ERP base, Claude AI para análisis inteligente, y nuestros módulos desarrollados exclusivamente para el mercado guatemalteco (SAT, FEL, RTU).',
    features: [
      'Odoo 19 — ERP líder mundial',
      'Claude AI para clasificación y análisis',
      'Módulos SAT & FEL Guatemala nativos',
      'Libros de IVA y reportes locales automáticos',
      'Multi-empresa · Multi-moneda GTQ',
    ],
  },
  {
    id: 'finanzIA',
    name: 'FinanzIA',
    short: 'Plataforma de terceros',
    emoji: '📈',
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-500/8',
    glow: 'bg-emerald-600/20',
    glow2: 'bg-teal-600/12',
    text: 'text-emerald-400',
    badge: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
    ring: 'ring-emerald-500/30',
    activeBg: 'from-emerald-900/30 to-teal-900/20',
    icon: BarChart3Icon,
    tagline: 'finanzia.gt · Software contable con IA',
    description:
      'FinanzIA es una plataforma de terceros (finanzia.gt) que integramos en nuestras operaciones. Automatiza la contabilidad con IA para Guatemala: clasifica documentos, genera libros contables y detecta riesgos fiscales — para contadores y empresas.',
    features: [
      'Clasificación automática de documentos con IA',
      'Generación de libros contables automatizada',
      'Detección de riesgos fiscales',
      'Software contable diseñado para Guatemala',
      'Plataforma externa — finanzia.gt',
    ],
  },
  {
    id: 'felsimple',
    name: 'FELSimple',
    short: 'Convenio de colaboración',
    emoji: '🧾',
    border: 'border-sky-500/40',
    bg: 'bg-sky-500/8',
    glow: 'bg-sky-600/20',
    glow2: 'bg-cyan-600/12',
    text: 'text-sky-400',
    badge: 'bg-sky-500/15 border-sky-500/30 text-sky-300',
    ring: 'ring-sky-500/30',
    activeBg: 'from-sky-900/30 to-cyan-900/20',
    icon: FileCheckIcon,
    tagline: 'felsimple.com · Facturá desde WhatsApp',
    description:
      'FELSimple (felsimple.com) es una plataforma de terceros con la que KONTAXES tiene convenio de colaboración. Permite emitir facturas FEL certificadas por la SAT directamente desde WhatsApp en 15 segundos — sin apps, sin portales, para pequeños contribuyentes.',
    features: [
      'FEL certificada por SAT desde WhatsApp',
      'Factura emitida en menos de 15 segundos',
      'Sin apps ni portales adicionales',
      'Recordatorios de declaración SAT-2046',
      'Validación de NIT en tiempo real',
    ],
  },
];

const odooFeatures = [
  {
    title: 'En KONTAXES, trabajamos con Odoo',
    description: 'Una potente plataforma de gestión empresarial que nos permite llevar cada contabilidad con precisión, eficiencia y transparencia.',
    icon: DatabaseIcon,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  },
  {
    title: 'Información confiable y actualizada',
    description: 'Esto nos permite ofrecerte información financiera confiable, actualizada y accesible, facilitando la toma de decisiones estratégicas.',
    icon: TrendingUpIcon,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    title: 'Enfócate en crecer',
    description: 'Tú te concentras en hacer crecer tu empresa, y nosotros nos encargamos de que tus números siempre estén al día.',
    icon: FileTextIcon,
    color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  },
];

/* ─── Simulation: Odoo ──────────────────────────────── */
function OdooSim() {
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState('');
  const vendor = 'DISTRIBUIDORA CENTRAL S.A.';

  useEffect(() => {
    if (step === 0) {
      let i = 0;
      const t = setInterval(() => {
        setTyped(vendor.slice(0, ++i));
        if (i >= vendor.length) { clearInterval(t); setTimeout(() => setStep(1), 500); }
      }, 55);
      return () => clearInterval(t);
    }
    if (step >= 1 && step < 4) {
      const delay = step === 1 ? 900 : 1100;
      const t = setTimeout(() => setStep(s => s + 1), delay);
      return () => clearTimeout(t);
    }
  }, [step]);

  const progress = [
    { label: 'Datos ingresados', done: step >= 1 },
    { label: 'Asientos generados', done: step >= 2 },
    { label: 'FEL verificada', done: step >= 3 },
    { label: 'Contabilizado', done: step >= 4 },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
          <DatabaseIcon size={14} className="text-purple-400" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Odoo 19 — Contabilidad</h3>
          <p className="text-xs text-gray-500">Módulo Cuentas por Pagar · Ingreso de factura</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">En vivo</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3 mb-4">
        {[
          {
            label: 'Proveedor',
            value: typed,
            active: step === 0,
            ready: step >= 1,
            color: 'border-purple-500/30 text-white',
            cursor: true,
          },
          {
            label: 'No. Factura',
            value: step >= 1 ? 'SER-A  No. 15284' : '…',
            active: false,
            ready: step >= 1,
            color: 'border-sky-500/30 text-sky-300',
            cursor: false,
          },
          {
            label: 'Monto Total',
            value: step >= 1 ? 'Q 3,750.00' : '…',
            active: false,
            ready: step >= 1,
            color: 'border-emerald-500/30 text-emerald-400 font-semibold',
            cursor: false,
          },
          {
            label: 'NIT Proveedor',
            value: step >= 1 ? '5839201-K  ✓ RTU Válido' : '…',
            active: false,
            ready: step >= 1,
            color: 'border-teal-500/30 text-teal-300',
            cursor: false,
          },
        ].map((f, i) => (
          <div key={i}>
            <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
            <div className={`px-3 py-2 rounded-lg bg-black/30 border text-sm transition-all duration-500 flex items-center min-h-[36px] ${
              f.ready ? f.color : 'border-white/10 text-gray-500'
            }`}>
              {f.value}
              {f.cursor && step === 0 && (
                <span className="inline-block w-0.5 h-4 bg-purple-400 ml-0.5 animate-pulse" />
              )}
            </div>
          </div>
        ))}
      </div>

      {step >= 2 && (
        <div className="mb-4 rounded-xl bg-purple-500/5 border border-purple-500/15 overflow-hidden">
          <div className="px-4 py-2 bg-purple-500/10 border-b border-purple-500/15 flex items-center gap-2">
            <ZapIcon size={11} className="text-purple-400" />
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Asientos generados automáticamente</span>
          </div>
          <div className="grid grid-cols-3 px-4 py-1.5 border-b border-white/5">
            {['Cuenta', 'Debe', 'Haber'].map(h => (
              <span key={h} className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{h}</span>
            ))}
          </div>
          {[
            { cuenta: '2100 — Cuentas por Pagar', debe: '—', haber: 'Q 3,750.00', hc: 'text-red-400' },
            { cuenta: '6200 — Compras Locales',   debe: 'Q 3,482.14', haber: '—', dc: 'text-emerald-400' },
            { cuenta: '2210 — IVA Acreditable',   debe: 'Q 267.86', haber: '—', dc: 'text-sky-400' },
          ].map((row, i) => (
            <div key={i} className="grid grid-cols-3 px-4 py-2.5 border-b border-white/5 last:border-0 text-xs hover:bg-white/3 transition-colors">
              <span className="text-gray-300">{row.cuenta}</span>
              <span className={row.dc || 'text-gray-600'}>{row.debe}</span>
              <span className={row.hc || 'text-gray-600'}>{row.haber}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-3">
        {progress.map((s, i) => (
          <React.Fragment key={i}>
            <div className="flex items-center gap-1.5">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-500 ${s.done ? 'bg-purple-500' : 'bg-white/10'}`}>
                {s.done && <CheckIcon size={9} className="text-white" />}
              </div>
              <span className={`text-xs transition-colors duration-300 ${s.done ? 'text-gray-300' : 'text-gray-600'}`}>{s.label}</span>
            </div>
            {i < 3 && <div className={`h-px w-5 transition-colors duration-500 ${progress[i].done && progress[i+1]?.done ? 'bg-purple-500/50' : 'bg-white/10'}`} />}
          </React.Fragment>
        ))}
      </div>

      {step >= 4 && (
        <div className="p-3.5 rounded-xl bg-emerald-500/8 border border-emerald-500/20 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <CheckIcon size={14} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-400">Factura contabilizada exitosamente</p>
            <p className="text-xs text-gray-400">Libro IVA Compras actualizado · Ref: JE/2025/00847</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Simulation: Claude IA ─────────────────────────── */
function ClaudeSim() {
  const [step, setStep] = useState(0);
  const [bar, setBar] = useState(0);

  useEffect(() => {
    if (step === 0) {
      const t = setTimeout(() => setStep(1), 800);
      return () => clearTimeout(t);
    }
    if (step === 1) {
      let v = 0;
      const t = setInterval(() => {
        v += Math.random() * 8 + 4;
        setBar(Math.min(v, 100));
        if (v >= 100) { clearInterval(t); setTimeout(() => setStep(2), 300); }
      }, 80);
      return () => clearInterval(t);
    }
    if (step >= 2 && step < 4) {
      const t = setTimeout(() => setStep(s => s + 1), 1200);
      return () => clearTimeout(t);
    }
  }, [step]);

  const docLines = [
    'FACTURA DE COMPRA — SERIE A No. 00847',
    'Emisor: Ferretería Los Ángeles, NIT 1234567-8',
    'Concepto: Materiales de construcción mixtos',
    'Subtotal: Q 892.86  IVA: Q 107.14  Total: Q 1,000.00',
    'Fecha: 25/06/2025  UUID: A4F9-2B3C-...',
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
          <BrainCircuitIcon size={14} className="text-violet-400" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Claude AI — Análisis de documentos</h3>
          <p className="text-xs text-gray-500">Clasificación inteligente de facturas</p>
        </div>
        {step >= 2 && (
          <div className="ml-auto px-2.5 py-1 rounded-full bg-violet-500/15 border border-violet-500/25 text-xs font-bold text-violet-300">
            98% confianza
          </div>
        )}
      </div>

      {/* Document scan area */}
      <div className="relative mb-5 p-4 rounded-xl bg-black/40 border border-white/8 overflow-hidden">
        {step === 0 && (
          <div className="absolute inset-0 flex flex-col gap-1 p-4 opacity-30">
            {docLines.map((l, i) => (
              <div key={i} className="h-2.5 rounded bg-gray-600" style={{ width: `${60 + Math.random() * 30}%` }} />
            ))}
          </div>
        )}

        {step >= 1 && (
          <div className="space-y-1.5">
            {docLines.map((line, i) => (
              <p
                key={i}
                className="text-xs text-gray-300 font-mono transition-all duration-300"
                style={{ opacity: step >= 1 ? 1 : 0, transitionDelay: `${i * 60}ms` }}
              >
                {line}
              </p>
            ))}
          </div>
        )}

        {/* Scanning line */}
        {step === 1 && (
          <div
            className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-violet-400 to-transparent pointer-events-none"
            style={{ top: `${bar}%`, transition: 'top 0.08s linear', boxShadow: '0 0 8px rgba(139,92,246,0.8)' }}
          />
        )}
      </div>

      {/* AI analysis progress */}
      {step >= 1 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>{step === 1 ? 'Analizando documento…' : 'Análisis completado'}</span>
            <span>{Math.round(bar)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-600 to-purple-400 transition-all duration-100"
              style={{ width: `${bar}%` }}
            />
          </div>
        </div>
      )}

      {/* Classification result */}
      {step >= 2 && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: 'Tipo documento',    value: 'Factura de Compra FEL',       color: 'text-violet-300' },
            { label: 'Cuenta sugerida',   value: '6200 — Compras Locales',      color: 'text-purple-300' },
            { label: 'Categoría',         value: 'Materiales / Construcción',   color: 'text-sky-300' },
            { label: 'Período fiscal',    value: 'Junio 2025 — IT-1',           color: 'text-emerald-300' },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/15">
              <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
              <p className={`text-sm font-semibold ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {step >= 3 && (
        <div className="p-3.5 rounded-xl bg-violet-500/8 border border-violet-500/20 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
            <BrainCircuitIcon size={14} className="text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-violet-300">Registrado automáticamente en Odoo</p>
            <p className="text-xs text-gray-400">Asientos creados · Libro IVA actualizado · Sin intervención manual</p>
          </div>
        </div>
      )}

      {step < 3 && step === 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-3 h-3 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
          Preparando análisis…
        </div>
      )}
    </div>
  );
}

/* ─── Simulation: Módulos KTX ───────────────────────── */
function KtxSim() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step < 5) {
      const delays = [600, 1000, 1200, 1100, 1000];
      const t = setTimeout(() => setStep(s => s + 1), delays[step] ?? 1000);
      return () => clearTimeout(t);
    }
  }, [step]);

  const flow = [
    { id: 0, icon: '🔎', label: 'Validando NIT', detail: '5839201-K', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
    { id: 1, icon: '📋', label: 'Consulta RTU-SAT', detail: 'Contribuyente activo', color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' },
    { id: 2, icon: '🔗', label: 'Conectando certificador', detail: 'CORPOSISTEMAS, S. A.', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    { id: 3, icon: '✍️', label: 'Firmando documento', detail: 'Firma electrónica', color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
    { id: 4, icon: '🛡️', label: 'FEL certificada', detail: 'UUID generado', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
          <ShieldCheckIcon size={14} className="text-purple-400" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Módulos KTX — Cumplimiento SAT</h3>
          <p className="text-xs text-gray-500">Emisión de Factura Electrónica en Línea (FEL)</p>
        </div>
        {step >= 5 && (
          <div className="ml-auto px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-xs font-bold text-emerald-400">
            Certificada ✓
          </div>
        )}
      </div>

      {/* Document being built */}
      <div className="mb-5 p-4 rounded-xl bg-black/40 border border-white/8 font-mono text-xs">
        <p className="text-gray-500 mb-2">{/* FEL Document */}</p>
        <div className="space-y-1">
          <p className={`transition-colors duration-500 ${step >= 0 ? 'text-sky-300' : 'text-gray-700'}`}>&lt;dte:DTE&gt;</p>
          <p className={`pl-4 transition-colors duration-500 ${step >= 1 ? 'text-teal-300' : 'text-gray-700'}`}>&lt;NIT&gt;5839201-K&lt;/NIT&gt; <span className={step >= 1 ? 'text-emerald-400' : 'text-gray-700'}>✓ RTU válido</span></p>
          <p className={`pl-4 transition-colors duration-500 ${step >= 2 ? 'text-purple-300' : 'text-gray-700'}`}>&lt;Certificador&gt;CORPOSISTEMAS&lt;/Certificador&gt;</p>
          <p className={`pl-4 transition-colors duration-500 ${step >= 3 ? 'text-violet-300' : 'text-gray-700'}`}>&lt;FirmaElectronica&gt;MIGf...&lt;/FirmaElectronica&gt;</p>
          <p className={`pl-4 transition-colors duration-500 ${step >= 4 ? 'text-emerald-300 font-bold' : 'text-gray-700'}`}>&lt;UUID&gt;{step >= 4 ? 'A4F9-2B3C-E158-9D20' : '…generando…'}&lt;/UUID&gt;</p>
          <p className={`transition-colors duration-500 ${step >= 4 ? 'text-sky-300' : 'text-gray-700'}`}>&lt;/dte:DTE&gt;</p>
        </div>
      </div>

      {/* Flow steps */}
      <div className="space-y-2 mb-4">
        {flow.map((f) => {
          const done = step > f.id;
          const active = step === f.id;
          return (
            <div
              key={f.id}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-500 ${
                done ? f.color : active ? 'border-white/15 bg-white/5' : 'border-white/5 bg-transparent opacity-40'
              }`}
            >
              <span className="text-base">{f.icon}</span>
              <span className={`text-sm font-medium flex-1 transition-colors ${done ? f.color.split(' ')[0] : active ? 'text-white' : 'text-gray-600'}`}>
                {f.label}
              </span>
              {active && <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin opacity-70" />}
              {done && (
                <span className={`text-xs font-semibold ${f.color.split(' ')[0]}`}>{f.detail}</span>
              )}
              {done && <CheckIcon size={13} className={f.color.split(' ')[0]} />}
            </div>
          );
        })}
      </div>

      {step >= 5 && (
        <div className="p-3.5 rounded-xl bg-emerald-500/8 border border-emerald-500/20 flex items-center gap-3">
          <span className="text-2xl">🛡️</span>
          <div>
            <p className="text-sm font-bold text-emerald-400">FEL emitida y certificada por la SAT</p>
            <p className="text-xs text-gray-400">UUID: A4F9-2B3C-E158-9D20 · Libro IVA Ventas actualizado</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Simulation: FinanzIA ──────────────────────────── */
function FinanzIASim() {
  const [step, setStep] = useState(0);
  const [scanPct, setScanPct] = useState(0);

  useEffect(() => {
    if (step === 0) {
      let v = 0;
      const t = setInterval(() => {
        v += 3 + Math.random() * 4;
        setScanPct(Math.min(v, 100));
        if (v >= 100) { clearInterval(t); setTimeout(() => setStep(1), 300); }
      }, 60);
      return () => clearInterval(t);
    }
    if (step >= 1 && step < 4) {
      const t = setTimeout(() => setStep(s => s + 1), 1100);
      return () => clearTimeout(t);
    }
  }, [step]);

  const txns = [
    { date: '23/06', desc: 'Compra proveedor A', amount: 'Q 1,250.00', flag: false },
    { date: '23/06', desc: 'Retiro banco GTQ',   amount: 'Q 5,000.00', flag: true },
    { date: '24/06', desc: 'Venta cliente B',    amount: 'Q 2,800.00', flag: false },
    { date: '24/06', desc: 'Compra sin factura', amount: 'Q 640.00',   flag: true },
    { date: '25/06', desc: 'Depósito ingreso',   amount: 'Q 4,100.00', flag: false },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
          <BarChart3Icon size={14} className="text-emerald-400" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">FinanzIA — Detección de riesgos fiscales</h3>
          <p className="text-xs text-gray-500">finanzia.gt · Análisis inteligente de movimientos</p>
        </div>
        {step >= 2 && (
          <div className="ml-auto px-2.5 py-1 rounded-full bg-yellow-500/15 border border-yellow-500/25 text-xs font-bold text-yellow-400">
            2 alertas
          </div>
        )}
      </div>

      {/* Scan bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>{step === 0 ? 'Escaneando movimientos del período…' : 'Escaneo completado — Junio 2025'}</span>
          <span>{Math.round(scanPct)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-100"
            style={{ width: `${scanPct}%` }}
          />
        </div>
      </div>

      {/* Transactions */}
      {step >= 0 && (
        <div className="mb-4 rounded-xl overflow-hidden border border-white/8">
          <div className="px-4 py-2 bg-emerald-500/8 border-b border-emerald-500/15 flex items-center gap-2">
            <TrendingUpIcon size={11} className="text-emerald-400" />
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Movimientos detectados</span>
          </div>
          <div className="divide-y divide-white/5">
            {txns.map((tx, i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-2.5 text-xs transition-all duration-500 ${
                step >= 2 && tx.flag ? 'bg-yellow-500/5' : ''
              }`}>
                <span className="text-gray-600 w-12">{tx.date}</span>
                <span className="text-gray-300 flex-1">{tx.desc}</span>
                <span className="text-emerald-400 font-semibold">{tx.amount}</span>
                {step >= 2 && tx.flag && (
                  <span className="px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 font-bold text-[10px]">⚠ Riesgo</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk details */}
      {step >= 2 && (
        <div className="grid md:grid-cols-2 gap-3 mb-4">
          {[
            { title: '⚠ Retiro sin justificación',  detail: 'Q 5,000 · Solicitar comprobante', color: 'bg-yellow-500/8 border-yellow-500/20 text-yellow-400' },
            { title: '⚠ Compra sin factura FEL',     detail: 'Q 640 · No deducible SAT',        color: 'bg-orange-500/8 border-orange-500/20 text-orange-400' },
          ].map((r, i) => (
            <div key={i} className={`p-3 rounded-xl border ${r.color}`}>
              <p className="text-xs font-bold mb-0.5">{r.title}</p>
              <p className="text-xs opacity-70">{r.detail}</p>
            </div>
          ))}
        </div>
      )}

      {/* Book generation */}
      {step >= 3 && (
        <div className="mb-3 flex items-center gap-3 p-3 rounded-xl bg-teal-500/8 border border-teal-500/20">
          <FileTextIcon size={14} className="text-teal-400 flex-shrink-0" />
          <p className="text-xs text-teal-300 font-medium">Libro contable Junio 2025 generado automáticamente</p>
        </div>
      )}

      {step >= 4 && (
        <div className="p-3.5 rounded-xl bg-emerald-500/8 border border-emerald-500/20 flex items-center gap-3">
          <span className="text-2xl">📊</span>
          <div>
            <p className="text-sm font-bold text-emerald-400">Reporte SAT-2046 listo para declaración</p>
            <p className="text-xs text-gray-400">2 correcciones recomendadas · Descarga disponible en finanzia.gt</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Simulation: FELSimple ─────────────────────────── */
function FelSim() {
  const [visible, setVisible] = useState(0);

  const messages: { from: 'user' | 'bot'; text: string; time: string }[] = [
    { from: 'user', text: 'Hola, necesito emitir una factura 🧾', time: '10:02' },
    { from: 'bot',  text: '¡Hola! Soy FELSimple 🤖\nEscribí el NIT del cliente:', time: '10:02' },
    { from: 'user', text: '1234567-8', time: '10:02' },
    { from: 'bot',  text: '✅ NIT válido — *Comercio Los Pinos*\n¿Cuánto es el monto total (Q)?', time: '10:02' },
    { from: 'user', text: '850', time: '10:02' },
    { from: 'bot',  text: '📋 Confirmá la factura:\n• Cliente: Comercio Los Pinos\n• Total: Q 850.00\n• IVA: Q 107.14\n\nRespondé *SI* para emitir', time: '10:02' },
    { from: 'user', text: 'SI', time: '10:03' },
    { from: 'bot',  text: '⚡ Emitiendo FEL con la SAT…', time: '10:03' },
    { from: 'bot',  text: '🎉 ¡Factura certificada!\n• UUID: A4F9-2B3C-E158\n• Serie: A  No. 00849\n• Tiempo: *12 segundos*\n\nPDF adjunto 👆', time: '10:03' },
  ];

  useEffect(() => {
    if (visible < messages.length) {
      const delays = [600, 900, 700, 1000, 700, 1100, 600, 800, 1400];
      const t = setTimeout(() => setVisible(v => v + 1), delays[visible] ?? 900);
      return () => clearTimeout(t);
    }
  }, [visible]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
          <MessageSquareIcon size={14} className="text-sky-400" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">FELSimple — Facturá desde WhatsApp</h3>
          <p className="text-xs text-gray-500">felsimple.com · FEL certificada en 15 segundos</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">WhatsApp</span>
        </div>
      </div>

      {/* WhatsApp-style chat */}
      <div className="rounded-2xl overflow-hidden border border-white/8 bg-black/30" style={{ maxHeight: 380 }}>
        {/* Chat header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-[#075e54]/80 border-b border-white/10">
          <div className="w-8 h-8 rounded-full bg-emerald-500/40 flex items-center justify-center text-sm">🤖</div>
          <div>
            <p className="text-sm font-semibold text-white">FELSimple Bot</p>
            <p className="text-xs text-emerald-300/80">en línea</p>
          </div>
        </div>

        {/* Messages */}
        <div className="p-3 space-y-1.5 overflow-y-auto" style={{ maxHeight: 300, background: 'rgba(0,0,0,0.2)' }}>
          {messages.slice(0, visible).map((msg, i) => (
            <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[78%] px-3 py-2 rounded-2xl text-xs leading-relaxed shadow ${
                  msg.from === 'user'
                    ? 'bg-[#dcf8c6]/15 border border-[#dcf8c6]/20 text-gray-200 rounded-tr-sm'
                    : 'bg-white/8 border border-white/10 text-gray-200 rounded-tl-sm'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>
                <p className="text-right text-[10px] text-gray-500 mt-0.5">{msg.time}</p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {visible < messages.length && visible % 2 === 0 && (
            <div className="flex justify-start">
              <div className="px-3 py-2 rounded-2xl bg-white/8 border border-white/10 flex items-center gap-1">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {visible >= messages.length && (
        <div className="mt-3 p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20 flex items-center gap-3">
          <span className="text-2xl">⚡</span>
          <div>
            <p className="text-sm font-bold text-emerald-400">FEL emitida en 12 segundos desde WhatsApp</p>
            <p className="text-xs text-gray-400">Sin apps · Sin portales · Directo desde tu celular</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Odoo 3D Sphere ────────────────────────────────── */
function OdooSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.parentElement?.clientWidth || 400;
    const H = canvas.parentElement?.clientHeight || 400;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
    camera.position.z = 7;
    const sphereMat = new THREE.MeshBasicMaterial({ color: 0x9333ea, wireframe: true, transparent: true, opacity: 0.2 });
    const sphere = new THREE.Mesh(new THREE.IcosahedronGeometry(3, 2), sphereMat);
    scene.add(sphere);
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(2.2, 32, 32), new THREE.MeshBasicMaterial({ color: 0x1a0533, transparent: true, opacity: 0.8 })));
    const dotCount = 120;
    const dp = new Float32Array(dotCount * 3);
    const dc = new Float32Array(dotCount * 3);
    for (let i = 0; i < dotCount; i++) {
      const r = 3 + Math.random() * 0.6;
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      dp[i*3] = r * Math.sin(phi) * Math.cos(theta);
      dp[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      dp[i*3+2] = r * Math.cos(phi);
      const e = Math.random() > 0.7;
      dc[i*3] = e ? 0.06 : 0.58; dc[i*3+1] = e ? 0.73 : 0.20; dc[i*3+2] = e ? 0.51 : 0.92;
    }
    const dg = new THREE.BufferGeometry();
    dg.setAttribute('position', new THREE.Float32BufferAttribute(dp, 3));
    dg.setAttribute('color', new THREE.Float32BufferAttribute(dc, 3));
    const dots = new THREE.Points(dg, new THREE.PointsMaterial({ size: 0.07, vertexColors: true }));
    scene.add(dots);
    ['📊', '💼', '🖨️', '📋', '🔄', '📈'].forEach((emoji, i) => {
      const c = document.createElement('canvas'); c.width = c.height = 64;
      const ctx = c.getContext('2d')!;
      ctx.font = '36px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(emoji, 32, 32);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true }));
      sprite.scale.set(0.7, 0.7, 1);
      const angle = (i / 6) * Math.PI * 2;
      sprite.position.set(4 * Math.cos(angle), (Math.random() - 0.5) * 2.5, 4 * Math.sin(angle));
      scene.add(sprite);
    });
    let t = 0; let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate); t += 0.005;
      sphere.rotation.y = t * 0.4; sphere.rotation.x = t * 0.12;
      dots.rotation.y = t * 0.55;
      renderer.render(scene, camera);
    };
    animate();
    const ro = new ResizeObserver(() => {
      const w = canvas.parentElement?.clientWidth || 400;
      const h = canvas.parentElement?.clientHeight || 400;
      camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h);
    });
    ro.observe(canvas.parentElement!);
    return () => { cancelAnimationFrame(animId); renderer.dispose(); ro.disconnect(); };
  }, []);
  return <canvas ref={canvasRef} className="w-full h-full" />;
}

/* ─── Local reveal hook ─────────────────────────────── */
function useLocalReveal(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.05 }
    );
    el.querySelectorAll('.reveal').forEach((node) => obs.observe(node));
    return () => obs.disconnect();
  }, []);
}

/* ─── Simulation tabs config ────────────────────────── */
const sims = [
  { id: 'odoo',     label: 'Odoo',          icon: DatabaseIcon,      color: 'from-purple-600 to-violet-600',  shadow: 'shadow-purple-500/20' },
  { id: 'claude',   label: 'Claude IA',     icon: BrainCircuitIcon,  color: 'from-violet-600 to-purple-700',  shadow: 'shadow-violet-500/20' },
  { id: 'ktx',      label: 'Módulos KTX',   icon: ShieldCheckIcon,   color: 'from-purple-700 to-indigo-600',  shadow: 'shadow-indigo-500/20' },
  { id: 'finanzIA', label: 'FinanzIA',       icon: BarChart3Icon,     color: 'from-emerald-600 to-teal-600',   shadow: 'shadow-emerald-500/20' },
  { id: 'felsimple',label: 'FELSimple',      icon: MessageSquareIcon, color: 'from-sky-600 to-cyan-600',       shadow: 'shadow-sky-500/20' },
];

/* ─── Main component ────────────────────────────────── */
export function TechStack() {
  const [active, setActive]       = useState(0);
  const [activeSim, setActiveSim] = useState('odoo');
  const sectionRef = useRef<HTMLElement>(null);
  useLocalReveal(sectionRef);

  const card = cards[active];

  return (
    <section ref={sectionRef} id="herramientas" className="py-20 bg-gray-950 relative overflow-hidden">

      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-800/8 rounded-full blur-3xl orb-float" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-emerald-800/8 rounded-full blur-3xl orb-float-reverse" />
        <div className="absolute top-10 right-10 w-48 h-48 bg-sky-800/6 rounded-full blur-3xl orb-float" style={{ animationDelay: '3s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

        {/* ── Section header ── */}
        <div className="text-center mb-14 reveal">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">
            <ZapIcon size={11} className="text-yellow-400" />
            Plataforma Tecnológica
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Herramientas que{' '}
            <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-emerald-400 bg-clip-text text-transparent">
              nos diferencian
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Stack propio diseñado para contabilidad de siguiente nivel en Guatemala.
          </p>
        </div>

        {/* ── 3 Interactive cards ── */}
        <div className="reveal flex flex-col sm:flex-row justify-center gap-3 mb-10">
          {cards.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setActive(i)}
              className={`group flex items-center gap-3 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300 border ${
                active === i
                  ? `${c.bg} ${c.border} ${c.text} shadow-lg ring-1 ${c.ring} scale-[1.02]`
                  : 'bg-white/3 border-white/8 text-gray-500 hover:text-gray-300 hover:bg-white/6 hover:border-white/15'
              }`}
            >
              <span className="text-lg">{c.emoji}</span>
              <span>{c.name}</span>
              {active === i && <ChevronRightIcon size={14} className="ml-auto" />}
            </button>
          ))}
        </div>

        {/* Detail Panel */}
        <div className="reveal mb-20">
          <div className={`relative rounded-2xl border ${card.border} overflow-hidden`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${card.activeBg} pointer-events-none`} />
            <div className={`absolute -top-16 -right-16 w-64 h-64 ${card.glow} rounded-full blur-3xl pointer-events-none`} />
            <div className={`absolute -bottom-16 -left-16 w-48 h-48 ${card.glow2} rounded-full blur-3xl pointer-events-none`} />

            <div className="relative p-8 md:p-10 grid md:grid-cols-2 gap-10 items-start">
              <div>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider mb-5 ${card.badge}`}>
                  <span>{card.emoji}</span>
                  {card.tagline}
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {card.name}
                </h3>
                <p className="text-gray-300 text-base leading-relaxed">{card.description}</p>
              </div>

              <div className="space-y-2.5">
                <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${card.text}`}>Incluye</p>
                {card.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-black/20 border border-white/5 hover:border-white/10 transition-all">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${card.bg} border ${card.border}`}>
                      <CheckIcon size={12} className={card.text} />
                    </div>
                    <span className="text-gray-300 text-sm">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative px-8 pb-6 flex items-center gap-2">
              {cards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`transition-all duration-300 rounded-full ${
                    active === i ? `w-6 h-2 ${card.bg} border ${card.border}` : 'w-2 h-2 bg-white/15 hover:bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="reveal flex items-center gap-4 mb-14">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
            <DatabaseIcon size={13} className="text-purple-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400">Odoo en acción</span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
        </div>

        {/* ── Odoo sphere + features ── */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div className="reveal order-2 lg:order-1 h-80 lg:h-[450px] relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-transparent rounded-3xl" />
            <OdooSphere />
          </div>

          <div className="reveal reveal-delay-1 order-1 lg:order-2">
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-purple-400 mb-3">Tecnología</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Herramientas<br />
              <span className="bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">Odoo</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8">Tecnología de clase mundial para tu contabilidad</p>
            <div className="space-y-4">
              {odooFeatures.map((f, i) => (
                <div key={i} className={`flex gap-4 p-4 rounded-xl border ${f.color} transition-all hover:scale-[1.01]`}>
                  <f.icon className={`w-8 h-8 flex-shrink-0 ${f.color.split(' ')[0]}`} />
                  <div>
                    <h3 className="font-semibold text-white text-sm mb-1">{f.title}</h3>
                    <p className="text-gray-400 text-xs leading-relaxed">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Animated Simulations ── (desactivado temporalmente) */}

      </div>
    </section>
  );
}
