import React from 'react';
import { SlideThemeContext } from './PequenioContribuyenteSlides';

/* ── Theme tokens ─────────────────────────────────────────────────────────── */
interface Tok {
  isDark: boolean; bg: string;
  t1: string; t2: string; t3: string;
  a65: string; a55: string; a50: string; a45: string; a40: string; a38: string;
  s1: string; s08: string; s07: string; s06: string; s05: string; s03: string; s025: string;
  divider: string;
}
const DK: Tok = {
  isDark: true, bg: '#06080f',
  t1: '#f0f4ff', t2: '#dde5ff', t3: '#b8c7ee',
  a65: 'rgba(255,255,255,0.65)', a55: 'rgba(255,255,255,0.55)', a50: 'rgba(255,255,255,0.50)',
  a45: 'rgba(255,255,255,0.45)', a40: 'rgba(255,255,255,0.40)', a38: 'rgba(255,255,255,0.38)',
  s1: 'rgba(255,255,255,0.10)', s08: 'rgba(255,255,255,0.08)', s07: 'rgba(255,255,255,0.07)',
  s06: 'rgba(255,255,255,0.06)', s05: 'rgba(255,255,255,0.05)', s03: 'rgba(255,255,255,0.03)',
  s025: 'rgba(255,255,255,0.025)', divider: 'rgba(255,255,255,0.06)',
};
const LT: Tok = {
  isDark: false, bg: '#f8faff',
  t1: '#0a0f1e', t2: '#1a2540', t3: '#2d3a5e',
  a65: 'rgba(10,15,30,0.70)', a55: 'rgba(10,15,30,0.62)', a50: 'rgba(10,15,30,0.55)',
  a45: 'rgba(10,15,30,0.50)', a40: 'rgba(10,15,30,0.45)', a38: 'rgba(10,15,30,0.42)',
  s1: 'rgba(0,0,0,0.08)', s08: 'rgba(0,0,0,0.07)', s07: 'rgba(0,0,0,0.08)',
  s06: 'rgba(0,0,0,0.05)', s05: 'rgba(0,0,0,0.04)', s03: 'rgba(0,0,0,0.03)',
  s025: 'rgba(0,0,0,0.025)', divider: 'rgba(0,0,0,0.07)',
};
function useT() { return React.useContext(SlideThemeContext) ? DK : LT; }

/* ── Accent palette ───────────────────────────────────────────────────────── */
const A = { blue: '#2563EB', sky: '#38bdf8', teal: '#0d9488', emerald: '#10b981', amber: '#f59e0b', rose: '#f43f5e', violet: '#8b5cf6', indigo: '#6366f1' };

/* ── Style helpers ────────────────────────────────────────────────────────── */
const SG: React.CSSProperties = { fontFamily: "'Space Grotesk', sans-serif" };
const BASE: React.CSSProperties = { width: '100%', height: '100%', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 'clamp(1.2rem,3vw,2.5rem)' };
const COVER_BG: React.CSSProperties = { ...BASE, background: 'linear-gradient(135deg, #060a0f 0%, #091520 40%, #0d2236 70%, #060c18 100%)', alignItems: 'center', justifyContent: 'center', textAlign: 'center' };
const GRID: React.CSSProperties = { position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '22px 22px', pointerEvents: 'none' };
const OCTA = 'polygon(29% 0,71% 0,100% 29%,100% 71%,71% 100%,29% 100%,0 71%,0 29%)';

function badge(color: string, bg: string, border: string): React.CSSProperties {
  return { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 999, background: bg, border: `1px solid ${border}`, color, fontSize: 11, fontWeight: 700, letterSpacing: '1.6px', textTransform: 'uppercase' };
}
function panel(border: string, bg: string): React.CSSProperties {
  return { borderRadius: 14, border: `1px solid ${border}`, background: bg, padding: 'clamp(0.9rem,2vw,1.4rem)' };
}
const accentBar: React.CSSProperties = { width: 5, borderRadius: 3, flexShrink: 0, background: `linear-gradient(180deg, ${A.teal}, ${A.emerald})`, alignSelf: 'stretch' };
function TW(size: string, w = 800): React.CSSProperties { return { ...SG, fontSize: size, fontWeight: w, lineHeight: 1.15, color: '#fff' }; }
function Tag({ label, color }: { label: string; color: string }) {
  return <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', color, paddingBottom: 4, borderBottom: `2px solid ${color}`, display: 'inline-block' }}>{label}</span>;
}
function Dot({ color = A.teal, size = 10 }: { color?: string; size?: number }) {
  return <div style={{ width: size, height: size, borderRadius: '50%', background: color, flexShrink: 0, marginTop: `${size * 0.55}px` }} />;
}
function SlideTitle({ children }: { children: React.ReactNode }) {
  const t = useT();
  return (
    <div className="ps-up" style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 'clamp(1rem,2.5vw,1.8rem)' }}>
      <div style={accentBar} />
      <h2 style={{ ...SG, fontSize: 'clamp(1.7rem,3.8vw,3rem)', fontWeight: 800, lineHeight: 1.2, color: t.t1 }}>{children}</h2>
    </div>
  );
}
function Bullets({ items, color = A.teal }: { items: string[]; color?: string }) {
  const t = useT();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px,1.8vw,18px)' }}>
      {items.map((it, i) => (
        <div key={i} className={`ps-up ps-d${Math.min(i+2,9)}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <Dot color={color} size={9} />
          <span style={{ color: t.t3, fontSize: 'clamp(1rem,2.2vw,1.3rem)', lineHeight: 1.55 }}>{it}</span>
        </div>
      ))}
    </div>
  );
}
function makeSec(num: string, title: string, sub?: string, accent = A.teal): React.FC {
  return function SecSlide() {
    return (
      <div style={COVER_BG}>
        <div style={GRID} />
        <div style={{ position: 'absolute', ...SG, fontSize: 'clamp(9rem,30vw,22rem)', fontWeight: 900, color: 'rgba(255,255,255,0.03)', lineHeight: 1, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', userSelect: 'none' }}>{num}</div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="ps-up" style={badge('#7dd3fc', 'rgba(13,148,136,0.15)', 'rgba(13,148,136,0.3)')}>Módulo {num}</div>
          <h2 className="ps-up ps-d2" style={{ ...TW('clamp(2.5rem,7.5vw,5.5rem)'), marginTop: '1rem', textWrap: 'balance' as 'balance' }}>{title}</h2>
          {sub && <p className="ps-up ps-d3" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(1rem,2.2vw,1.3rem)', marginTop: '0.75rem' }}>{sub}</p>}
          <div className="ps-up ps-d4" style={{ width: 64, height: 4, borderRadius: 2, margin: '1.5rem auto 0', background: `linear-gradient(90deg, ${accent}, ${A.emerald})` }} />
        </div>
      </div>
    );
  };
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* SLIDE 01 · COVER                                                           */
/* ══════════════════════════════════════════════════════════════════════════ */
const Slide01Cover: React.FC = () => (
  <div style={COVER_BG}>
    <div style={GRID} />
    <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', top: '-180px', right: '-100px', background: 'radial-gradient(circle, rgba(13,148,136,0.2), transparent 70%)', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', width: 340, height: 340, borderRadius: '50%', bottom: '-80px', left: '10%', background: 'radial-gradient(circle, rgba(16,185,129,0.14), transparent 70%)', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', top: 'clamp(1rem,3vw,2rem)', left: 'clamp(1rem,3vw,2rem)', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 32, height: 32, clipPath: OCTA, background: A.teal, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#fff', fontWeight: 900, fontSize: 12 }}>K</span>
      </div>
      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em' }}>KTX LAB</span>
    </div>
    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 900 }}>
      <div className="ps-up ps-d1" style={badge('#5eead4', 'rgba(13,148,136,0.12)', 'rgba(13,148,136,0.3)')}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: A.teal }} />
        Guía para Usuarios · Odoo 19 · KTX LAB
      </div>
      <h1 className="ps-up ps-d2" style={{ ...TW('clamp(2.2rem,7vw,5.5rem)', 900), margin: 'clamp(1rem,2.5vw,1.5rem) 0 clamp(0.5rem,1.5vw,1rem)', textWrap: 'balance' as 'balance' }}>
        <span style={{ background: `linear-gradient(90deg, ${A.teal}, ${A.emerald})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          CRM · Ventas
        </span>
        {' '}· Suscripciones · Alquiler
      </h1>
      <p className="ps-up ps-d3" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 'clamp(1rem,2.2vw,1.3rem)', marginBottom: '1.5rem', maxWidth: 680 }}>
        Los módulos comerciales de Odoo 19 explicados para usuarios, paso a paso
      </p>
      <div className="ps-up ps-d4" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'clamp(0.75rem,2vw,1.5rem)', color: 'rgba(255,255,255,0.4)', fontSize: 'clamp(0.9rem,1.8vw,1.05rem)', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.2rem' }}>
        <span>5 horas</span><span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
        <span>Nivel principiante</span><span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
        <span>Para usuarios, no administradores</span>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════ */
/* SLIDE 02 · AGENDA                                                          */
/* ══════════════════════════════════════════════════════════════════════════ */
const Slide02Agenda: React.FC = () => {
  const t = useT();
  const modulos = [
    ['01', 'CRM', 'Pipeline, oportunidades y seguimiento de clientes'],
    ['02', 'Ventas', 'Cotizaciones, pedidos y facturación'],
    ['03', 'Suscripciones', 'Contratos recurrentes y renovaciones'],
    ['04', 'Alquiler', 'Reservas, entregas y devoluciones'],
  ];
  return (
    <div style={{ ...BASE, background: t.bg }}>
      <SlideTitle>Los 4 módulos de esta guía</SlideTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, flex: 1 }}>
        {modulos.map(([num, title, desc], i) => {
          const colors = [A.teal, A.blue, A.violet, A.amber];
          return (
            <div key={num} className={`ps-up ps-d${i+1}`} style={{ ...panel(t.s07, t.s03), display: 'flex', gap: 18, alignItems: 'center', borderLeft: `5px solid ${colors[i]}` }}>
              <span style={{ ...SG, fontSize: 'clamp(2.5rem,6vw,4rem)', fontWeight: 900, color: `${colors[i]}33`, lineHeight: 1, flexShrink: 0 }}>{num}</span>
              <div>
                <div style={{ color: colors[i], fontWeight: 800, fontSize: 'clamp(1.1rem,2.4vw,1.5rem)', marginBottom: 6 }}>{title}</div>
                <div style={{ color: t.a45, fontSize: 'clamp(0.9rem,1.9vw,1.1rem)', lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="ps-up ps-d6" style={{ marginTop: 14, ...panel('rgba(13,148,136,0.3)', 'rgba(13,148,136,0.07)'), display: 'flex', alignItems: 'center', gap: 12 }}>
        <Dot color={A.emerald} size={10} />
        <span style={{ color: A.emerald, fontWeight: 700, fontSize: 'clamp(0.9rem,1.9vw,1.1rem)' }}>
          Prerrequisito: haber visto la Guía 01 — Introducción a Odoo (interfaz, vistas, búsqueda, formularios)
        </span>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════ */
const Slide03S1 = makeSec('01', 'CRM', 'Gestión de clientes y oportunidades', A.teal);

/* ══════════════════════════════════════════════════════════════════════════ */
/* SLIDE 04 · QUÉ ES EL CRM                                                   */
/* ══════════════════════════════════════════════════════════════════════════ */
const Slide04CrmIntro: React.FC = () => {
  const t = useT();
  return (
    <div style={{ ...BASE, background: t.bg }}>
      <SlideTitle>¿Qué es el CRM de Odoo?</SlideTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
        <div className="ps-up ps-d1" style={{ ...panel('rgba(13,148,136,0.35)', 'rgba(13,148,136,0.08)'), borderLeft: '5px solid #0d9488', borderRadius: '0 12px 12px 0' }}>
          <p style={{ color: t.t2, fontSize: 'clamp(1.05rem,2.3vw,1.4rem)', lineHeight: 1.65, margin: 0 }}>
            El <strong style={{ color: '#5eead4' }}>CRM (Customer Relationship Management)</strong> es el módulo donde gestionas tus relaciones con clientes potenciales. Organiza todas tus oportunidades de venta en un tablero visual llamado <strong style={{ color: '#5eead4' }}>pipeline</strong>.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, flex: 1 }}>
          {[
            { color: A.teal,    tag: 'Lead',          title: 'Contacto inicial', desc: 'Alguien que mostró interés pero aún no está calificado. Puede venir de un formulario web, llamada o email.' },
            { color: A.emerald, tag: 'Oportunidad',   title: 'Posible venta', desc: 'Un lead calificado que tiene potencial real de convertirse en venta. Entra al pipeline y se le da seguimiento.' },
            { color: A.blue,    tag: 'Cliente',       title: 'Venta cerrada', desc: 'Oportunidad ganada. Se convierte en cliente y puede generar un pedido de venta directamente desde el CRM.' },
          ].map((item, i) => (
            <div key={i} className={`ps-up ps-d${i+2}`} style={{ ...panel(t.s07, t.s03), display: 'flex', flexDirection: 'column', gap: 10, borderTop: `3px solid ${item.color}` }}>
              <Tag label={item.tag} color={item.color} />
              <div style={{ color: item.color, fontWeight: 700, fontSize: 'clamp(1.05rem,2.3vw,1.4rem)' }}>{item.title}</div>
              <p style={{ color: t.a50, fontSize: 'clamp(0.92rem,2vw,1.15rem)', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════ */
/* SLIDE 05 · EL PIPELINE                                                     */
/* ══════════════════════════════════════════════════════════════════════════ */
const Slide05Pipeline: React.FC = () => {
  const t = useT();
  const etapas = [
    { color: A.sky,     label: 'Nuevo',        pct: '100%', desc: 'Oportunidad recién creada o importada.' },
    { color: A.blue,    label: 'Calificado',   pct: '40%',  desc: 'Confirmamos que hay interés real.' },
    { color: A.violet,  label: 'Propuesta',    pct: '60%',  desc: 'Enviamos cotización o propuesta.' },
    { color: A.amber,   label: 'Negociación',  pct: '80%',  desc: 'Estamos cerrando condiciones.' },
    { color: A.emerald, label: 'Ganado ✓',     pct: '100%', desc: 'Venta cerrada exitosamente.' },
    { color: A.rose,    label: 'Perdido ✕',    pct: '0%',   desc: 'No se concretó — registramos el motivo.' },
  ];
  return (
    <div style={{ ...BASE, background: t.bg }}>
      <SlideTitle>El Pipeline — tu embudo de ventas visual</SlideTitle>
      <p className="ps-up ps-d1" style={{ color: t.a50, fontSize: 'clamp(0.95rem,2vw,1.15rem)', marginBottom: 'clamp(0.8rem,1.5vw,1.2rem)' }}>
        El pipeline es un tablero kanban donde cada columna es una etapa del proceso de venta. Las tarjetas se arrastran de columna en columna conforme avanza la oportunidad.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, flex: 1 }}>
        {etapas.map((e, i) => (
          <div key={i} className={`ps-up ps-d${i+2}`} style={{ ...panel(t.s07, t.s025), display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Tag label={e.label} color={e.color} />
              <span style={{ ...SG, color: e.color, fontWeight: 900, fontSize: 'clamp(1.2rem,2.5vw,1.6rem)' }}>{e.pct}</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: t.s07, overflow: 'hidden', marginTop: 4 }}>
              <div style={{ height: '100%', width: e.pct, background: e.color, borderRadius: 3, transition: 'width 0.5s' }} />
            </div>
            <p style={{ color: t.a45, fontSize: 'clamp(0.88rem,1.9vw,1.1rem)', margin: 0, lineHeight: 1.5 }}>{e.desc}</p>
          </div>
        ))}
      </div>
      <div className="ps-up ps-d9" style={{ marginTop: 12, ...panel('rgba(13,148,136,0.3)', 'rgba(13,148,136,0.07)'), display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <Dot color={A.teal} size={9} />
        <p style={{ color: '#5eead4', fontSize: 'clamp(0.95rem,2vw,1.2rem)', margin: 0 }}>
          <strong>Probabilidad:</strong> Cada etapa tiene un porcentaje de probabilidad de cierre. Odoo la usa para calcular el ingreso esperado en el dashboard.
        </p>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════ */
/* SLIDE 06 · GESTIONAR UNA OPORTUNIDAD                                       */
/* ══════════════════════════════════════════════════════════════════════════ */
const Slide06Oportunidad: React.FC = () => {
  const t = useT();
  return (
    <div style={{ ...BASE, background: t.bg }}>
      <SlideTitle>Cómo trabajar una oportunidad</SlideTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="ps-up ps-d1" style={{ ...panel('rgba(13,148,136,0.3)', 'rgba(13,148,136,0.07)') }}>
            <Tag label="Datos clave del formulario" color={A.teal} />
            <div style={{ marginTop: 12 }}>
              <Bullets color={A.teal} items={[
                'Contacto / empresa del cliente',
                'Ingresos esperados (importe)',
                'Fecha de cierre estimada',
                'Responsable (vendedor asignado)',
                'Etapa actual del pipeline',
              ]} />
            </div>
          </div>
          <div className="ps-up ps-d2" style={{ ...panel('rgba(37,99,235,0.3)', 'rgba(37,99,235,0.07)') }}>
            <Tag label="Acciones desde la oportunidad" color={A.blue} />
            <div style={{ marginTop: 12 }}>
              <Bullets color={A.blue} items={[
                'Crear cotización con un clic',
                'Enviar email directo al cliente',
                'Registrar una llamada',
                'Programar actividades de seguimiento',
              ]} />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="ps-up ps-d3" style={{ ...panel('rgba(16,185,129,0.3)', 'rgba(16,185,129,0.07)') }}>
            <Tag label="Marcar como Ganada" color={A.emerald} />
            <p style={{ color: t.a55, fontSize: 'clamp(0.95rem,2vw,1.2rem)', margin: '10px 0 0', lineHeight: 1.6 }}>
              Clic en el botón "Ganado" (verde). Odoo registra la fecha de cierre, actualiza el reporte de ventas y puede crear automáticamente el pedido de venta.
            </p>
          </div>
          <div className="ps-up ps-d4" style={{ ...panel('rgba(244,63,94,0.3)', 'rgba(244,63,94,0.07)') }}>
            <Tag label="Marcar como Perdida" color={A.rose} />
            <p style={{ color: t.a55, fontSize: 'clamp(0.95rem,2vw,1.2rem)', margin: '10px 0 0', lineHeight: 1.6 }}>
              Clic en "Perdido". Odoo pide el <strong style={{ color: '#fda4af' }}>motivo de pérdida</strong>. Esta información es clave para análisis y mejorar el proceso de ventas.
            </p>
          </div>
          <div className="ps-up ps-d5" style={{ ...panel(t.s07, t.s025) }}>
            <Tag label="Chatter en el CRM" color={t.t2} />
            <p style={{ color: t.a45, fontSize: 'clamp(0.9rem,1.9vw,1.1rem)', margin: '10px 0 0', lineHeight: 1.5 }}>
              Todo el historial de comunicación con el cliente queda en el Chatter de la oportunidad. Emails enviados, notas del equipo y actividades completadas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════ */
const Slide07S2 = makeSec('02', 'Ventas', 'De la cotización al pedido y la factura', A.blue);

/* ══════════════════════════════════════════════════════════════════════════ */
/* SLIDE 08 · FLUJO DE VENTAS                                                 */
/* ══════════════════════════════════════════════════════════════════════════ */
const Slide08FlujoVentas: React.FC = () => {
  const t = useT();
  const pasos = [
    { color: A.sky,     n: '1', title: 'Cotización',       desc: 'Documento con productos, cantidades y precios propuestos al cliente. Aún no es una venta.' },
    { color: A.blue,    n: '2', title: 'Pedido de venta',  desc: 'La cotización confirmada. El cliente aceptó. Se genera el pedido (SO) y puede disparar el stock.' },
    { color: A.violet,  n: '3', title: 'Entrega',          desc: 'Si hay productos físicos, se genera una orden de entrega vinculada al pedido.' },
    { color: A.emerald, n: '4', title: 'Factura',          desc: 'Desde el pedido se crea la factura. Se envía al cliente y se registra el cobro.' },
    { color: A.amber,   n: '5', title: 'Pago',             desc: 'El cliente paga. Se registra en Contabilidad y el pedido queda cerrado.' },
  ];
  return (
    <div style={{ ...BASE, background: t.bg }}>
      <SlideTitle>El flujo de una venta en Odoo</SlideTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {pasos.map((p, i) => (
          <div key={i} className={`ps-up ps-d${i+1}`} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: p.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16, flexShrink: 0 }}>{p.n}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                <span style={{ color: p.color, fontWeight: 800, fontSize: 'clamp(1rem,2.2vw,1.3rem)' }}>{p.title}</span>
                {i < pasos.length - 1 && <span style={{ color: t.a38, fontSize: 11 }}>→</span>}
              </div>
              <p style={{ color: t.a50, fontSize: 'clamp(0.9rem,1.9vw,1.15rem)', margin: 0, lineHeight: 1.5 }}>{p.desc}</p>
            </div>
            <div style={{ width: '28%', height: 6, borderRadius: 3, alignSelf: 'center', background: p.color, opacity: 0.2 + i * 0.15 }} />
          </div>
        ))}
      </div>
      <div className="ps-up ps-d7" style={{ marginTop: 14, ...panel('rgba(37,99,235,0.3)', 'rgba(37,99,235,0.07)'), display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <Dot color={A.blue} size={9} />
        <p style={{ color: '#93c5fd', fontSize: 'clamp(0.95rem,2vw,1.2rem)', margin: 0 }}>
          <strong>Acceso rápido:</strong> Desde cada pedido puedes ver la entrega y la factura relacionadas usando los "botones inteligentes" (íconos en la parte superior del formulario).
        </p>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════ */
/* SLIDE 09 · CREAR UNA COTIZACIÓN                                            */
/* ══════════════════════════════════════════════════════════════════════════ */
const Slide09Cotizacion: React.FC = () => {
  const t = useT();
  return (
    <div style={{ ...BASE, background: t.bg }}>
      <SlideTitle>Crear una cotización paso a paso</SlideTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="ps-up ps-d1" style={{ ...panel('rgba(37,99,235,0.3)', 'rgba(37,99,235,0.07)') }}>
            <Tag label="Encabezado" color={A.blue} />
            <div style={{ marginTop: 10 }}>
              <Bullets color={A.blue} items={[
                'Cliente (busca por nombre o NIT)',
                'Fecha de expiración de la oferta',
                'Lista de precios (si aplica)',
                'Condiciones de pago',
                'Vendedor responsable',
              ]} />
            </div>
          </div>
          <div className="ps-up ps-d2" style={{ ...panel('rgba(13,148,136,0.3)', 'rgba(13,148,136,0.07)') }}>
            <Tag label="Líneas de producto" color={A.teal} />
            <div style={{ marginTop: 10 }}>
              <Bullets color={A.teal} items={[
                'Busca el producto en el campo "Producto"',
                'Ajusta cantidad y precio unitario',
                'El descuento se aplica por línea',
                'Los impuestos se calculan automáticamente',
              ]} />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="ps-up ps-d3" style={{ ...panel('rgba(139,92,246,0.3)', 'rgba(139,92,246,0.07)') }}>
            <Tag label="Enviar al cliente" color={A.violet} />
            <p style={{ color: t.a55, fontSize: 'clamp(0.95rem,2vw,1.2rem)', margin: '10px 0 0', lineHeight: 1.6 }}>
              Clic en <strong style={{ color: '#c4b5fd' }}>"Enviar por correo"</strong>. Odoo genera un PDF y abre un email prellenado. El cliente puede firmar y confirmar la cotización en línea con el Portal de Clientes.
            </p>
          </div>
          <div className="ps-up ps-d4" style={{ ...panel('rgba(16,185,129,0.3)', 'rgba(16,185,129,0.07)') }}>
            <Tag label="Confirmar internamente" color={A.emerald} />
            <p style={{ color: t.a55, fontSize: 'clamp(0.95rem,2vw,1.2rem)', margin: '10px 0 0', lineHeight: 1.6 }}>
              Clic en <strong style={{ color: '#6ee7b7' }}>"Confirmar"</strong>. La cotización se convierte en Pedido de Venta (número SO-XXXX). A partir de aquí ya no se puede editar fácilmente.
            </p>
          </div>
          <div className="ps-up ps-d5" style={{ ...panel('rgba(245,158,11,0.3)', 'rgba(245,158,11,0.07)') }}>
            <Tag label="Totales" color={A.amber} />
            <p style={{ color: t.a55, fontSize: 'clamp(0.9rem,1.9vw,1.1rem)', margin: '10px 0 0', lineHeight: 1.5 }}>
              Subtotal, impuestos y total general se calculan automáticamente en la parte inferior del formulario, en tiempo real.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════ */
/* SLIDE 10 · FACTURACIÓN DESDE VENTAS                                        */
/* ══════════════════════════════════════════════════════════════════════════ */
const Slide10Factura: React.FC = () => {
  const t = useT();
  const rows = [
    ['¿Desde dónde?', 'Desde el Pedido de Venta confirmado', 'Clic en "Crear factura"'],
    ['¿Qué se factura?', 'Cantidades ordenadas o entregadas', 'Depende de la configuración del producto'],
    ['¿Borrador o publicada?', 'Primero queda en borrador', 'Revisa y presiona "Confirmar"'],
    ['¿Cómo se envía?', 'Clic en "Enviar e imprimir"', 'Genera PDF y envía por email'],
    ['¿Cómo se cobra?', 'Clic en "Registrar pago"', 'Selecciona método y fecha'],
  ];
  return (
    <div style={{ ...BASE, background: t.bg }}>
      <SlideTitle>De pedido a factura — en 3 clics</SlideTitle>
      <div className="ps-up ps-d1" style={{ flex: 1, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'clamp(0.9rem,2vw,1.15rem)' }}>
          <thead>
            <tr style={{ background: `linear-gradient(90deg, #064e3b, #065f46)` }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#6ee7b7', fontWeight: 700, fontSize: 'clamp(0.82rem,1.7vw,1rem)' }}>Paso</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#e2e8f0', fontWeight: 700 }}>Detalle</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#5eead4', fontWeight: 700 }}>Cómo hacerlo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([paso, detalle, como], i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${t.divider}`, background: i % 2 === 0 ? t.s025 : 'transparent' }}>
                <td style={{ padding: '12px 16px', color: A.teal, fontWeight: 700 }}>{paso}</td>
                <td style={{ padding: '12px 16px', color: t.t2 }}>{detalle}</td>
                <td style={{ padding: '12px 16px', color: A.emerald }}>{como}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="ps-up ps-d7" style={{ marginTop: 14, ...panel('rgba(13,148,136,0.3)', 'rgba(13,148,136,0.07)'), display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <Dot color={A.teal} size={9} />
        <p style={{ color: '#5eead4', fontSize: 'clamp(0.95rem,2vw,1.2rem)', margin: 0 }}>
          <strong>Botones inteligentes:</strong> En el pedido aparecen contadores (Facturas: 1, Entregas: 1). Haz clic en ellos para ver los documentos vinculados directamente.
        </p>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════ */
const Slide11S3 = makeSec('03', 'Suscripciones', 'Contratos de facturación recurrente', A.violet);

/* ══════════════════════════════════════════════════════════════════════════ */
/* SLIDE 12 · SUSCRIPCIONES INTRO                                             */
/* ══════════════════════════════════════════════════════════════════════════ */
const Slide12SuscIntro: React.FC = () => {
  const t = useT();
  return (
    <div style={{ ...BASE, background: t.bg }}>
      <SlideTitle>¿Qué es una Suscripción en Odoo?</SlideTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
        <div className="ps-up ps-d1" style={{ ...panel('rgba(139,92,246,0.35)', 'rgba(139,92,246,0.08)'), borderLeft: '5px solid #8b5cf6', borderRadius: '0 12px 12px 0' }}>
          <p style={{ color: t.t2, fontSize: 'clamp(1.05rem,2.3vw,1.4rem)', lineHeight: 1.65, margin: 0 }}>
            Una <strong style={{ color: '#c4b5fd' }}>Suscripción</strong> es un contrato recurrente donde el cliente paga regularmente (mensual, trimestral, anual) por un producto o servicio. Odoo genera la factura automáticamente en cada período.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, flex: 1 }}>
          {[
            { color: A.violet, tag: 'Plan de suscripción', title: 'La plantilla', desc: 'Define el precio, la frecuencia (mensual, anual) y los productos incluidos. El administrador lo configura.' },
            { color: A.blue,   tag: 'Contrato',            title: 'El acuerdo con el cliente', desc: 'Se crea desde el módulo Suscripciones. Tiene fecha de inicio, productos, precio y estado (Activo, En pausa, Cerrado).' },
            { color: A.emerald,tag: 'Renovación',          title: 'Aviso antes de vencer', desc: 'Odoo alerta cuando un contrato está próximo a vencer. Puedes renovarlo con un clic o enviar la propuesta al cliente.' },
          ].map((item, i) => (
            <div key={i} className={`ps-up ps-d${i+2}`} style={{ ...panel(t.s07, t.s03), display: 'flex', flexDirection: 'column', gap: 10, borderTop: `3px solid ${item.color}` }}>
              <Tag label={item.tag} color={item.color} />
              <div style={{ color: item.color, fontWeight: 700, fontSize: 'clamp(1.05rem,2.3vw,1.4rem)' }}>{item.title}</div>
              <p style={{ color: t.a50, fontSize: 'clamp(0.92rem,2vw,1.15rem)', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="ps-up ps-d6" style={{ ...panel('rgba(139,92,246,0.25)', 'rgba(139,92,246,0.06)'), display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <Dot color={A.violet} size={9} />
          <p style={{ color: '#c4b5fd', fontSize: 'clamp(0.95rem,2vw,1.2rem)', margin: 0 }}>
            <strong>Ejemplo de uso:</strong> Software mensual, servicio de mantenimiento, membresía de club, alquiler de equipo de largo plazo.
          </p>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════ */
/* SLIDE 13 · GESTIONAR UNA SUSCRIPCIÓN                                       */
/* ══════════════════════════════════════════════════════════════════════════ */
const Slide13GestionSusc: React.FC = () => {
  const t = useT();
  return (
    <div style={{ ...BASE, background: t.bg }}>
      <SlideTitle>Gestionar el ciclo de vida de una suscripción</SlideTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="ps-up ps-d1" style={{ ...panel('rgba(139,92,246,0.3)', 'rgba(139,92,246,0.07)') }}>
            <Tag label="Crear suscripción" color={A.violet} />
            <div style={{ marginTop: 10 }}>
              <Bullets color={A.violet} items={[
                'Ve a Suscripciones → Suscripciones → Nuevo',
                'Elige el cliente y el plan de suscripción',
                'Verifica los productos y el precio',
                'Confirma — la suscripción queda "En progreso"',
              ]} />
            </div>
          </div>
          <div className="ps-up ps-d2" style={{ ...panel('rgba(37,99,235,0.3)', 'rgba(37,99,235,0.07)') }}>
            <Tag label="Generar factura manual" color={A.blue} />
            <p style={{ color: t.a55, fontSize: 'clamp(0.95rem,2vw,1.2rem)', margin: '10px 0 0', lineHeight: 1.6 }}>
              En Suscripciones hay un botón <strong style={{ color: '#93c5fd' }}>"Generar facturas"</strong> que crea las facturas de todos los contratos vencidos en ese período. También puede configurarse para ser automático.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { color: A.emerald, tag: 'Activo', desc: 'El contrato está vigente y generando facturas según la frecuencia acordada.' },
            { color: A.amber,   tag: 'En pausa', desc: 'Se suspende temporalmente. No se factura mientras está en pausa. Útil para vacaciones o acuerdos especiales.' },
            { color: A.rose,    tag: 'Cerrado', desc: 'Contrato terminado. Ya no genera facturas. Queda como historial en el sistema.' },
          ].map((item, i) => (
            <div key={i} className={`ps-up ps-d${i+3}`} style={{ ...panel(t.s07, t.s025), display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ background: item.color, color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 20, flexShrink: 0, marginTop: 2 }}>{item.tag}</div>
              <p style={{ color: t.a50, fontSize: 'clamp(0.9rem,1.9vw,1.1rem)', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
            </div>
          ))}
          <div className="ps-up ps-d7" style={{ ...panel('rgba(139,92,246,0.25)', 'rgba(139,92,246,0.06)'), display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Dot color={A.violet} size={8} />
            <span style={{ color: '#c4b5fd', fontSize: 'clamp(0.88rem,1.8vw,1rem)' }}>El MRR (Monthly Recurring Revenue) en el dashboard de suscripciones te muestra el ingreso recurrente mensual total.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════ */
const Slide14S4 = makeSec('04', 'Alquiler', 'Reservas, entregas y devoluciones', A.amber);

/* ══════════════════════════════════════════════════════════════════════════ */
/* SLIDE 15 · ALQUILER INTRO                                                  */
/* ══════════════════════════════════════════════════════════════════════════ */
const Slide15AlquilerIntro: React.FC = () => {
  const t = useT();
  return (
    <div style={{ ...BASE, background: t.bg }}>
      <SlideTitle>¿Qué es el módulo Alquiler de Odoo?</SlideTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
        <div className="ps-up ps-d1" style={{ ...panel('rgba(245,158,11,0.35)', 'rgba(245,158,11,0.08)'), borderLeft: '5px solid #f59e0b', borderRadius: '0 12px 12px 0' }}>
          <p style={{ color: t.t2, fontSize: 'clamp(1.05rem,2.3vw,1.4rem)', lineHeight: 1.65, margin: 0 }}>
            El módulo de <strong style={{ color: '#fcd34d' }}>Alquiler</strong> gestiona el préstamo o renta de productos físicos por un período determinado. Controla la disponibilidad, entrega y devolución de cada artículo.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, flex: 1 }}>
          {[
            { color: A.amber,   tag: '¿Para qué sirve?',    desc: 'Alquilar equipos, maquinaria, autos, salas, herramientas o cualquier artículo que sale y debe volver.' },
            { color: A.sky,     tag: 'Orden de alquiler',   desc: 'Documento que registra qué se alquila, a quién, desde cuándo hasta cuándo, y el precio por período.' },
            { color: A.emerald, tag: 'Recogida (entrega)',  desc: 'Cuando el cliente recibe el artículo. Se registra en el sistema para marcar la salida del producto.' },
            { color: A.rose,    tag: 'Devolución',          desc: 'Cuando el cliente regresa el artículo. Se verifica el estado y se cierra el período de alquiler.' },
          ].map((item, i) => (
            <div key={i} className={`ps-up ps-d${i+2}`} style={{ ...panel(t.s07, t.s03), display: 'flex', flexDirection: 'column', gap: 10, borderTop: `3px solid ${item.color}` }}>
              <Tag label={item.tag} color={item.color} />
              <p style={{ color: t.a50, fontSize: 'clamp(0.92rem,2vw,1.15rem)', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="ps-up ps-d7" style={{ ...panel('rgba(245,158,11,0.25)', 'rgba(245,158,11,0.06)'), display: 'flex', gap: 12 }}>
          <Dot color={A.amber} size={9} />
          <p style={{ color: '#fcd34d', fontSize: 'clamp(0.95rem,2vw,1.2rem)', margin: 0 }}>
            <strong>Disponibilidad en tiempo real:</strong> El calendario del módulo muestra qué artículos están disponibles en cada fecha, evitando conflictos de reserva.
          </p>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════ */
/* SLIDE 16 · FLUJO DE ALQUILER                                               */
/* ══════════════════════════════════════════════════════════════════════════ */
const Slide16FlujoAlquiler: React.FC = () => {
  const t = useT();
  return (
    <div style={{ ...BASE, background: t.bg }}>
      <SlideTitle>Flujo completo de un alquiler</SlideTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {[
          { color: A.sky,     n: '1', title: 'Nueva orden de alquiler',    desc: 'Ve a Alquiler → Nuevo. Selecciona el cliente, el producto a alquilar, fecha de inicio y fecha de fin. El precio se calcula automáticamente.' },
          { color: A.blue,    n: '2', title: 'Confirmar la reserva',        desc: 'Clic en "Confirmar". El producto queda reservado para esas fechas. No puede asignarse a otro cliente en el mismo período.' },
          { color: A.amber,   n: '3', title: 'Registrar la recogida',       desc: 'Cuando el cliente lleva el artículo, clic en "Registrar recogida". Odoo marca el producto como "Alquilado" y registra la fecha exacta.' },
          { color: A.violet,  n: '4', title: 'Facturar el período',         desc: 'Desde la orden puedes generar la factura del período de alquiler, igual que en Ventas.' },
          { color: A.emerald, n: '5', title: 'Registrar devolución',        desc: 'Cuando el cliente devuelve, clic en "Devolver". El artículo vuelve a estar disponible. Puedes registrar si hubo daños.' },
        ].map((p, i) => (
          <div key={i} className={`ps-up ps-d${i+1}`} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', ...panel(t.s06, t.s025), padding: 'clamp(0.6rem,1.5vw,1rem) clamp(0.8rem,2vw,1.2rem)' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: p.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14, flexShrink: 0 }}>{p.n}</div>
            <div>
              <div style={{ color: p.color, fontWeight: 800, fontSize: 'clamp(0.95rem,2vw,1.2rem)', marginBottom: 3 }}>{p.title}</div>
              <p style={{ color: t.a45, fontSize: 'clamp(0.88rem,1.8vw,1.05rem)', margin: 0, lineHeight: 1.5 }}>{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════ */
/* SLIDE 17 · RESUMEN                                                         */
/* ══════════════════════════════════════════════════════════════════════════ */
const Slide17Resumen: React.FC = () => {
  const t = useT();
  const puntos = [
    [A.teal,    'CRM → Pipeline',        'Gestiona oportunidades por etapas. Cada tarjeta es una posible venta. Arrastra, gana o pierde con motivo.'],
    [A.sky,     'CRM → Seguimiento',     'Programa actividades en cada oportunidad. El chatter guarda todo el historial de comunicación.'],
    [A.blue,    'Ventas → Cotización',   'Crea cotización → envía al cliente → confirma → genera Pedido de Venta (SO-XXXX).'],
    [A.indigo,  'Ventas → Factura',      'Desde el pedido: "Crear factura" → Confirmar → Enviar → Registrar pago. Todo en cadena.'],
    [A.violet,  'Suscripciones',         'Contratos recurrentes con facturación automática. Estados: Activo / En pausa / Cerrado.'],
    [A.amber,   'Alquiler',              'Reserva → Confirma → Recogida → Factura → Devolución. Disponibilidad en tiempo real.'],
  ];
  return (
    <div style={{ ...BASE, background: t.bg }}>
      <SlideTitle>Lo que llevas de esta guía</SlideTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, flex: 1 }}>
        {puntos.map(([color, title, desc], i) => (
          <div key={i} className={`ps-up ps-d${Math.min(i+1,9)}`} style={{ ...panel(t.s07, t.s025), display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Dot color={color as string} size={10} />
            <div>
              <div style={{ color: color as string, fontWeight: 700, fontSize: 'clamp(0.95rem,2vw,1.2rem)', marginBottom: 4 }}>{title}</div>
              <div style={{ color: t.a45, fontSize: 'clamp(0.88rem,1.8vw,1.05rem)', lineHeight: 1.5 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════ */
/* SLIDE 18 · CIERRE                                                          */
/* ══════════════════════════════════════════════════════════════════════════ */
const Slide18Cierre: React.FC = () => (
  <div style={COVER_BG}>
    <div style={GRID} />
    <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', bottom: '-80px', right: '-60px', background: 'radial-gradient(circle, rgba(16,185,129,0.16), transparent 70%)', pointerEvents: 'none' }} />
    <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: 56, height: 56, clipPath: OCTA, background: A.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <span style={{ color: '#fff', fontWeight: 900, fontSize: 22 }}>K</span>
      </div>
      <div className="ps-up ps-d1" style={badge('#5eead4', 'rgba(13,148,136,0.15)', 'rgba(13,148,136,0.3)')}>KTX LAB · Guía de Usuario Odoo 19</div>
      <h2 className="ps-up ps-d2" style={{ ...TW('clamp(3rem,9vw,7rem)', 900), margin: '1rem 0 0.5rem' }}>¡Listos!</h2>
      <p className="ps-up ps-d3" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(1rem,2.2vw,1.3rem)', fontStyle: 'italic', marginBottom: '1.8rem', textAlign: 'center' }}>
        "La herramienta más poderosa es la que usas todos los días.<br />Convierte Odoo en tu rutina."
      </p>
      <div className="ps-up ps-d4" style={{ borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', padding: '14px 28px' }}>
        {['info@kontaxes.com', '+502 3517-4713', 'kontaxes.com'].map(v => (
          <span key={v} style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(0.9rem,1.9vw,1.1rem)' }}>{v}</span>
        ))}
      </div>
      <p className="ps-up ps-d5" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 'clamp(0.82rem,1.6vw,0.95rem)', marginTop: '1.2rem' }}>
        Material elaborado por KTX LAB · Guía 02 de la serie Odoo 19 para Usuarios
      </p>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════ */
/* EXPORT                                                                      */
/* ══════════════════════════════════════════════════════════════════════════ */
export const OdooVentasSlides: React.FC[] = [
  Slide01Cover, Slide02Agenda,
  Slide03S1, Slide04CrmIntro, Slide05Pipeline, Slide06Oportunidad,
  Slide07S2, Slide08FlujoVentas, Slide09Cotizacion, Slide10Factura,
  Slide11S3, Slide12SuscIntro, Slide13GestionSusc,
  Slide14S4, Slide15AlquilerIntro, Slide16FlujoAlquiler,
  Slide17Resumen, Slide18Cierre,
];
