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
const A = { blue: '#2563EB', sky: '#38bdf8', teal: '#0d9488', emerald: '#10b981', amber: '#f59e0b', rose: '#f43f5e', violet: '#8b5cf6' };

/* ── Shared style constants ──────────────────────────────────────────────── */
const SG: React.CSSProperties = { fontFamily: "'Space Grotesk', sans-serif" };
const BASE: React.CSSProperties = {
  width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
  display: 'flex', flexDirection: 'column',
  padding: 'clamp(1.2rem, 3vw, 2.5rem)',
};
const COVER_BG: React.CSSProperties = {
  ...BASE,
  background: 'linear-gradient(135deg, #050c1a 0%, #0a1838 45%, #0d2456 70%, #071426 100%)',
  alignItems: 'center', justifyContent: 'center', textAlign: 'center',
};
const GRID: React.CSSProperties = {
  position: 'absolute', inset: 0, opacity: 0.04,
  backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
  backgroundSize: '22px 22px', pointerEvents: 'none',
};
const OCTA = 'polygon(29% 0,71% 0,100% 29%,100% 71%,71% 100%,29% 100%,0 71%,0 29%)';

function badge(color: string, bg: string, border: string): React.CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '4px 14px', borderRadius: 999,
    background: bg, border: `1px solid ${border}`,
    color, fontSize: 11, fontWeight: 700, letterSpacing: '1.6px',
    textTransform: 'uppercase',
  };
}
function panel(border: string, bg: string): React.CSSProperties {
  return { borderRadius: 14, border: `1px solid ${border}`, background: bg, padding: 'clamp(0.9rem,2vw,1.4rem)' };
}
const accentBar: React.CSSProperties = {
  width: 5, borderRadius: 3, flexShrink: 0,
  background: `linear-gradient(180deg, ${A.blue}, ${A.teal})`, alignSelf: 'stretch',
};
function TW(size: string, w = 800): React.CSSProperties {
  return { ...SG, fontSize: size, fontWeight: w, lineHeight: 1.15, color: '#fff' };
}
function Tag({ label, color }: { label: string; color: string }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', color, paddingBottom: 4, borderBottom: `2px solid ${color}`, display: 'inline-block' }}>
      {label}
    </span>
  );
}
function Dot({ color = A.blue, size = 10 }: { color?: string; size?: number }) {
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
function Bullets({ items, color = A.blue }: { items: string[]; color?: string }) {
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
function makeSec(num: string, title: string, sub?: string): React.FC {
  return function SecSlide() {
    return (
      <div style={COVER_BG}>
        <div style={GRID} />
        <div style={{ position: 'absolute', ...SG, fontSize: 'clamp(9rem,30vw,22rem)', fontWeight: 900, color: 'rgba(255,255,255,0.03)', lineHeight: 1, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', userSelect: 'none' }}>{num}</div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="ps-up" style={badge('#7dd3fc', 'rgba(37,99,235,0.15)', 'rgba(37,99,235,0.3)')}>Sección {num}</div>
          <h2 className="ps-up ps-d2" style={{ ...TW('clamp(2.5rem,7.5vw,5.5rem)'), marginTop: '1rem', textWrap: 'balance' as 'balance' }}>{title}</h2>
          {sub && <p className="ps-up ps-d3" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(1rem,2.2vw,1.3rem)', marginTop: '0.75rem' }}>{sub}</p>}
          <div className="ps-up ps-d4" style={{ width: 64, height: 4, borderRadius: 2, margin: '1.5rem auto 0', background: `linear-gradient(90deg, ${A.blue}, ${A.teal})` }} />
        </div>
      </div>
    );
  };
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* SLIDE 01 · COVER                                                           */
/* ═══════════════════════════════════════════════════════════════════════════ */
const Slide01Cover: React.FC = () => (
  <div style={COVER_BG}>
    <div style={GRID} />
    <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', top: '-160px', right: '-100px', background: 'radial-gradient(circle, rgba(37,99,235,0.18), transparent 70%)', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', width: 320, height: 320, borderRadius: '50%', bottom: '-80px', left: '15%', background: 'radial-gradient(circle, rgba(13,148,136,0.14), transparent 70%)', pointerEvents: 'none' }} />
    {/* KTX LAB octagon mark */}
    <div style={{ position: 'absolute', top: 'clamp(1rem,3vw,2rem)', left: 'clamp(1rem,3vw,2rem)', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 32, height: 32, clipPath: OCTA, background: A.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#fff', fontWeight: 900, fontSize: 12 }}>K</span>
      </div>
      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em' }}>KTX LAB</span>
    </div>
    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 860 }}>
      <div className="ps-up ps-d1" style={badge(A.sky, 'rgba(37,99,235,0.12)', 'rgba(37,99,235,0.3)')}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: A.sky }} />
        Guía para Usuarios · Odoo 19 · KTX LAB
      </div>
      <h1 className="ps-up ps-d2" style={{ ...TW('clamp(2.5rem,8vw,6rem)', 900), margin: 'clamp(1rem,2.5vw,1.5rem) 0 clamp(0.5rem,1.5vw,1rem)', textWrap: 'balance' as 'balance' }}>
        Introducción a{' '}
        <span style={{ background: `linear-gradient(90deg, ${A.blue}, ${A.sky}, ${A.teal})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Odoo 19
        </span>
      </h1>
      <p className="ps-up ps-d3" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 'clamp(1rem,2.2vw,1.3rem)', marginBottom: '1.5rem', maxWidth: 600 }}>
        Interfaz, vistas, búsqueda, formularios y actividades
      </p>
      <div className="ps-up ps-d4" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'clamp(0.75rem,2vw,1.5rem)', color: 'rgba(255,255,255,0.4)', fontSize: 'clamp(0.9rem,1.8vw,1.05rem)', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.2rem' }}>
        <span>2 horas</span><span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
        <span>Nivel principiante</span><span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
        <span>Para usuarios, no administradores</span>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════ */
/* SLIDE 02 · AGENDA                                                          */
/* ═══════════════════════════════════════════════════════════════════════════ */
const Slide02Agenda: React.FC = () => {
  const t = useT();
  const items = [
    ['01', '¿Qué es Odoo?', 'ERP modular en la nube'],
    ['02', 'La interfaz', 'Menú, barra superior y navegación'],
    ['03', 'Tipos de vistas', 'Kanban, lista, formulario, calendario, gráfico'],
    ['04', 'Búsqueda y filtros', 'Encontrar cualquier registro rápido'],
    ['05', 'Formularios', 'Crear, editar y guardar registros'],
    ['06', 'Chatter y actividades', 'Mensajes, notas internas y tareas'],
  ];
  return (
    <div style={{ ...BASE, background: t.bg }}>
      <SlideTitle>¿Qué veremos hoy?</SlideTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(260px,42%,400px),1fr))', gap: 10, flex: 1 }}>
        {items.map(([num, title, desc], i) => (
          <div key={num} className={`ps-up ps-d${Math.min(i+1,9)}`} style={{ ...panel(t.s07, t.s03), display: 'flex', gap: 14, alignItems: 'center' }}>
            <span style={{ ...SG, fontSize: 'clamp(1.4rem,3vw,2.2rem)', fontWeight: 900, color: `rgba(37,99,235,0.5)`, flexShrink: 0, lineHeight: 1, minWidth: 36 }}>{num}</span>
            <div>
              <div style={{ color: t.t1, fontWeight: 700, fontSize: 'clamp(0.9rem,1.9vw,1.1rem)' }}>{title}</div>
              <div style={{ color: t.a38, fontSize: 'clamp(0.82rem,1.6vw,0.96rem)', marginTop: 3 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="ps-up ps-d9" style={{ marginTop: 14, ...panel(`rgba(13,148,136,0.3)`, `rgba(13,148,136,0.07)`), display: 'flex', alignItems: 'center', gap: 12 }}>
        <Dot color={A.teal} size={10} />
        <span style={{ color: A.teal, fontWeight: 700, fontSize: 'clamp(0.9rem,1.9vw,1.1rem)' }}>
          Al finalizar podrás navegar Odoo con confianza sin depender de soporte técnico
        </span>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════ */
const Slide03S1 = makeSec('01', '¿Qué es Odoo?', 'El sistema ERP que usas en tu empresa');

/* ═══════════════════════════════════════════════════════════════════════════ */
/* SLIDE 04 · QUÉ ES ODOO                                                     */
/* ═══════════════════════════════════════════════════════════════════════════ */
const Slide04QueEsOdoo: React.FC = () => {
  const t = useT();
  const modules = [
    { color: A.blue,    label: 'CRM',           desc: 'Clientes y oportunidades' },
    { color: A.sky,     label: 'Ventas',         desc: 'Cotizaciones y pedidos' },
    { color: A.teal,    label: 'Inventario',     desc: 'Productos y stock' },
    { color: A.emerald, label: 'Contabilidad',   desc: 'Facturas y pagos' },
    { color: A.violet,  label: 'RRHH',           desc: 'Empleados y nómina' },
    { color: A.amber,   label: 'Suscripciones',  desc: 'Contratos recurrentes' },
    { color: A.rose,    label: 'Alquiler',        desc: 'Reservas y devoluciones' },
    { color: '#6366f1', label: 'Y más…',          desc: '+80 módulos disponibles' },
  ];
  return (
    <div style={{ ...BASE, background: t.bg }}>
      <SlideTitle>Odoo — un ERP, muchos módulos</SlideTitle>
      <div className="ps-up ps-d1" style={{ ...panel(`rgba(37,99,235,0.35)`, `rgba(37,99,235,0.08)`), marginBottom: 'clamp(0.8rem,2vw,1.2rem)', borderLeft: '5px solid #2563EB', borderRadius: '0 12px 12px 0' }}>
        <p style={{ color: t.t2, fontSize: 'clamp(1.05rem,2.3vw,1.4rem)', lineHeight: 1.65, margin: 0 }}>
          <strong style={{ color: A.sky }}>Odoo</strong> es un sistema ERP (Planificación de Recursos Empresariales) que centraliza todos los procesos de tu empresa en <strong style={{ color: A.sky }}>una sola plataforma</strong>. Cada área tiene su módulo, pero todos comparten la misma base de datos.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, flex: 1 }}>
        {modules.map((m, i) => (
          <div key={i} className={`ps-up ps-d${Math.min(i+2,9)}`} style={{ ...panel(t.s06, t.s025), display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', justifyContent: 'center', textAlign: 'center', borderTop: `3px solid ${m.color}` }}>
            <div style={{ width: 36, height: 36, clipPath: OCTA, background: m.color, opacity: 0.15, position: 'absolute' }} />
            <span style={{ color: m.color, fontWeight: 800, fontSize: 'clamp(0.95rem,2vw,1.2rem)' }}>{m.label}</span>
            <span style={{ color: t.a45, fontSize: 'clamp(0.78rem,1.6vw,0.9rem)' }}>{m.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════ */
const Slide05S2 = makeSec('02', 'La Interfaz de Odoo', 'Conoce cada elemento de la pantalla');

/* ═══════════════════════════════════════════════════════════════════════════ */
/* SLIDE 06 · LA PANTALLA PRINCIPAL                                           */
/* ═══════════════════════════════════════════════════════════════════════════ */
const Slide06Interfaz: React.FC = () => {
  const t = useT();
  const areas = [
    { color: A.blue,    tag: 'Barra superior', title: 'Navegación global', desc: 'Menú de aplicaciones (waffle ⊞), nombre del módulo activo, barra de búsqueda global, mensajes, actividades y menú de usuario.' },
    { color: A.sky,     tag: 'Panel izquierdo', title: 'Menú del módulo', desc: 'Lista de secciones y opciones dentro del módulo activo. Aparece en módulos como Ventas, Inventario, Contabilidad, etc.' },
    { color: A.teal,    tag: 'Área principal', title: 'Contenido central', desc: 'Aquí se muestra el contenido: listas de registros, formularios de edición, tableros kanban, gráficos y calendarios.' },
    { color: A.emerald, tag: 'Breadcrumbs', title: 'Ruta de navegación', desc: 'Barra en la parte superior del área principal. Te muestra dónde estás y te permite regresar con un clic.' },
  ];
  return (
    <div style={{ ...BASE, background: t.bg }}>
      <SlideTitle>Las 4 zonas de la pantalla</SlideTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1 }}>
        {areas.map((a, i) => (
          <div key={i} className={`ps-up ps-d${i+1}`} style={{ ...panel(t.s07, t.s03), display: 'flex', flexDirection: 'column', gap: 10, borderTop: `3px solid ${a.color}` }}>
            <Tag label={a.tag} color={a.color} />
            <div style={{ color: a.color, fontWeight: 700, fontSize: 'clamp(1.05rem,2.3vw,1.4rem)' }}>{a.title}</div>
            <p style={{ color: t.a50, fontSize: 'clamp(0.92rem,2vw,1.15rem)', lineHeight: 1.6, margin: 0 }}>{a.desc}</p>
          </div>
        ))}
      </div>
      <div className="ps-up ps-d6" style={{ marginTop: 12, ...panel(`rgba(37,99,235,0.3)`, `rgba(37,99,235,0.07)`), display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <Dot color={A.blue} size={9} />
        <p style={{ color: A.sky, fontSize: 'clamp(0.95rem,2vw,1.2rem)', margin: 0 }}>
          <strong>Consejo:</strong> El ícono ⊞ (waffle) arriba a la izquierda siempre te lleva al menú principal de aplicaciones. Es tu "casa" en Odoo.
        </p>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/* SLIDE 07 · TIPOS DE VISTAS                                                 */
/* ═══════════════════════════════════════════════════════════════════════════ */
const Slide07Vistas: React.FC = () => {
  const t = useT();
  const vistas = [
    { color: A.blue,    icon: '⊞', name: 'Kanban',     desc: 'Tarjetas visuales agrupadas por etapa. Ideal para CRM y tareas. Drag & drop.' },
    { color: A.sky,     icon: '≡', name: 'Lista',       desc: 'Tabla con columnas. Perfecta para ver muchos registros a la vez.' },
    { color: A.teal,    icon: '⬜', name: 'Formulario',  desc: 'Ficha completa de un registro. Aquí creas y editas la información.' },
    { color: A.emerald, icon: '📅', name: 'Calendario',  desc: 'Vista de días/semanas/meses. Útil para actividades y citas.' },
    { color: A.amber,   icon: '📊', name: 'Gráfico',     desc: 'Barras, líneas y torta. Para analizar datos visualmente.' },
    { color: A.violet,  icon: '⊞', name: 'Pivote',      desc: 'Tabla dinámica estilo Excel. Agrupa y cruza datos para reportes.' },
  ];
  return (
    <div style={{ ...BASE, background: t.bg }}>
      <SlideTitle>Los 6 tipos de vista en Odoo</SlideTitle>
      <p className="ps-up ps-d1" style={{ color: t.a50, fontSize: 'clamp(0.95rem,2vw,1.15rem)', marginBottom: 'clamp(0.8rem,1.5vw,1.2rem)' }}>
        Cada módulo puede mostrar la misma información de 6 maneras diferentes. Los íconos de vista están siempre en la esquina superior derecha.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, flex: 1 }}>
        {vistas.map((v, i) => (
          <div key={i} className={`ps-up ps-d${i+2}`} style={{ ...panel(t.s07, t.s03), display: 'flex', flexDirection: 'column', gap: 8, borderLeft: `4px solid ${v.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 'clamp(1.2rem,2.5vw,1.8rem)' }}>{v.icon}</span>
              <span style={{ color: v.color, fontWeight: 800, fontSize: 'clamp(1rem,2.2vw,1.3rem)' }}>{v.name}</span>
            </div>
            <p style={{ color: t.a50, fontSize: 'clamp(0.88rem,1.9vw,1.1rem)', lineHeight: 1.55, margin: 0 }}>{v.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════ */
const Slide08S3 = makeSec('03', 'Búsqueda y Filtros', 'Encuentra cualquier registro en segundos');

/* ═══════════════════════════════════════════════════════════════════════════ */
/* SLIDE 09 · BÚSQUEDA                                                        */
/* ═══════════════════════════════════════════════════════════════════════════ */
const Slide09Busqueda: React.FC = () => {
  const t = useT();
  return (
    <div style={{ ...BASE, background: t.bg }}>
      <SlideTitle>Búsqueda, filtros y agrupamiento</SlideTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="ps-up ps-d1" style={{ ...panel(`rgba(37,99,235,0.3)`, `rgba(37,99,235,0.07)`), borderTop: `3px solid ${A.blue}` }}>
            <Tag label="Búsqueda básica" color={A.blue} />
            <p style={{ color: t.a55, fontSize: 'clamp(0.95rem,2vw,1.15rem)', margin: '10px 0 12px' }}>
              Escribe en la barra de búsqueda y presiona Enter. Odoo busca en el campo principal del registro (nombre, número, etc.).
            </p>
            <Bullets color={A.blue} items={['Busca por nombre de cliente', 'Busca por número de factura', 'Busca en cualquier módulo']} />
          </div>
          <div className="ps-up ps-d2" style={{ ...panel(`rgba(13,148,136,0.3)`, `rgba(13,148,136,0.07)`), borderTop: `3px solid ${A.teal}` }}>
            <Tag label="Búsqueda avanzada" color={A.teal} />
            <p style={{ color: t.a55, fontSize: 'clamp(0.95rem,2vw,1.15rem)', margin: '10px 0 12px' }}>
              Haz clic en la flecha ▼ de la barra de búsqueda para ver sugerencias de campos específicos por donde buscar.
            </p>
            <Bullets color={A.teal} items={['Buscar por campo exacto', 'Combinar varios criterios', 'Buscar por responsable, fecha, estado']} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="ps-up ps-d3" style={{ ...panel(`rgba(139,92,246,0.3)`, `rgba(139,92,246,0.07)`), borderTop: `3px solid ${A.violet}` }}>
            <Tag label="Filtros" color={A.violet} />
            <p style={{ color: t.a55, fontSize: 'clamp(0.95rem,2vw,1.15rem)', margin: '10px 0 0' }}>
              Muestran solo los registros que cumplen una condición: "Mis ventas", "Este mes", "Confirmadas", "Vencidas". Se activan con un clic.
            </p>
          </div>
          <div className="ps-up ps-d4" style={{ ...panel(`rgba(245,158,11,0.3)`, `rgba(245,158,11,0.07)`), borderTop: `3px solid ${A.amber}` }}>
            <Tag label="Agrupar por" color={A.amber} />
            <p style={{ color: t.a55, fontSize: 'clamp(0.95rem,2vw,1.15rem)', margin: '10px 0 0' }}>
              Agrupa la lista por vendedor, cliente, mes, estado o cualquier campo. Cada grupo muestra cuántos registros contiene y puede desplegarse.
            </p>
          </div>
        </div>
        <div className="ps-up ps-d5" style={{ ...panel(`rgba(37,99,235,0.25)`, `rgba(37,99,235,0.06)`), display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <Dot color={A.blue} size={9} />
          <p style={{ color: A.sky, fontSize: 'clamp(0.95rem,2vw,1.2rem)', margin: 0 }}>
            <strong>Favoritos:</strong> Guarda tu búsqueda favorita con el ícono ☆ para aplicarla con un clic la próxima vez. Puedes compartirla con el equipo.
          </p>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════ */
const Slide10S4 = makeSec('04', 'Formularios', 'Crear, editar y guardar registros');

/* ═══════════════════════════════════════════════════════════════════════════ */
/* SLIDE 11 · FORMULARIOS                                                     */
/* ═══════════════════════════════════════════════════════════════════════════ */
const Slide11Formularios: React.FC = () => {
  const t = useT();
  const campos = [
    ['Texto', A.blue,    'Nombre, descripción, notas. Se escribe directamente.'],
    ['Fecha',  A.sky,    'Clic abre calendario. Elige día y hora.'],
    ['Selección', A.teal,'Lista desplegable con opciones fijas (estado, tipo…).'],
    ['Relación', A.violet,'Enlaza a otro registro: cliente, producto, usuario.'],
    ['Monetario', A.amber,'Monto con moneda. Calcula automáticamente en totales.'],
    ['Adjunto', A.rose,  'Sube PDF, imagen u otro archivo al registro.'],
  ];
  return (
    <div style={{ ...BASE, background: t.bg }}>
      <SlideTitle>Trabajar con formularios</SlideTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="ps-up ps-d1" style={{ ...panel(`rgba(37,99,235,0.3)`, `rgba(37,99,235,0.07)`) }}>
            <Tag label="Para crear" color={A.blue} />
            <div style={{ marginTop: 10 }}>
              <Bullets color={A.blue} items={['Clic en "Nuevo" (botón azul, esquina superior izquierda)', 'Llena los campos requeridos (señalados con *)', 'Clic en "Guardar" o presiona el ícono de nube 💾']} />
            </div>
          </div>
          <div className="ps-up ps-d2" style={{ ...panel(`rgba(13,148,136,0.3)`, `rgba(13,148,136,0.07)`) }}>
            <Tag label="Para editar" color={A.teal} />
            <div style={{ marginTop: 10 }}>
              <Bullets color={A.teal} items={['Odoo 19 entra en modo edición con solo hacer clic en un campo', 'El botón "Guardar" aparece en la barra de estado', 'Para cancelar cambios: clic en "Descartar"']} />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="ps-up ps-d3" style={{ ...panel(t.s07, t.s03), marginBottom: 4 }}>
            <Tag label="Tipos de campo" color={t.t2} />
          </div>
          {campos.map(([tipo, color, desc], i) => (
            <div key={i} className={`ps-up ps-d${i+4}`} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ background: color, color: '#fff', fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 6, flexShrink: 0, marginTop: 2 }}>{tipo}</div>
              <span style={{ color: t.a50, fontSize: 'clamp(0.88rem,1.9vw,1.1rem)', lineHeight: 1.5 }}>{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════ */
const Slide12S5 = makeSec('05', 'Chatter y Actividades', 'Comunicación y seguimiento dentro de Odoo');

/* ═══════════════════════════════════════════════════════════════════════════ */
/* SLIDE 13 · CHATTER                                                         */
/* ═══════════════════════════════════════════════════════════════════════════ */
const Slide13Chatter: React.FC = () => {
  const t = useT();
  return (
    <div style={{ ...BASE, background: t.bg }}>
      <SlideTitle>El Chatter — historial de cada registro</SlideTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        <div className="ps-up ps-d1" style={{ ...panel(`rgba(37,99,235,0.3)`, `rgba(37,99,235,0.08)`), borderLeft: '5px solid #2563EB', borderRadius: '0 12px 12px 0' }}>
          <p style={{ color: t.t2, fontSize: 'clamp(1.05rem,2.3vw,1.4rem)', lineHeight: 1.65, margin: 0 }}>
            El <strong style={{ color: A.sky }}>Chatter</strong> aparece en la parte inferior de cada formulario. Es el <strong style={{ color: A.sky }}>historial completo</strong> del registro: mensajes, cambios, emails y actividades, todo en orden cronológico.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, flex: 1 }}>
          {[
            { color: A.blue,    tag: 'Mensaje', title: 'Enviar un mensaje', desc: 'Escribe y envía mensajes a seguidores del registro. Pueden contestar por email o desde Odoo. Queda registrado con hora y usuario.' },
            { color: A.violet,  tag: 'Nota interna', title: 'Notas internas', desc: 'Mensajes visibles solo para tu equipo (fondo amarillo). No se envían al cliente. Perfectas para observaciones privadas.' },
            { color: A.emerald, tag: 'Actividad', title: 'Programar actividad', desc: 'Crea una tarea futura: llamar, enviar email, reunión. Asigna responsable y fecha límite. Aparece en el calendario.' },
          ].map((item, i) => (
            <div key={i} className={`ps-up ps-d${i+2}`} style={{ ...panel(t.s07, t.s03), display: 'flex', flexDirection: 'column', gap: 10, borderTop: `3px solid ${item.color}` }}>
              <Tag label={item.tag} color={item.color} />
              <div style={{ color: item.color, fontWeight: 700, fontSize: 'clamp(1rem,2.1vw,1.3rem)' }}>{item.title}</div>
              <p style={{ color: t.a50, fontSize: 'clamp(0.9rem,1.9vw,1.1rem)', lineHeight: 1.55, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="ps-up ps-d6" style={{ ...panel(`rgba(13,148,136,0.3)`, `rgba(13,148,136,0.07)`), display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <Dot color={A.teal} size={9} />
          <p style={{ color: A.teal, fontSize: 'clamp(0.95rem,2vw,1.2rem)', margin: 0 }}>
            <strong>Seguidores:</strong> Odoo notifica automáticamente a los seguidores del registro cuando hay cambios. Puedes agregar o quitar seguidores desde el Chatter.
          </p>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/* SLIDE 14 · ACTIVIDADES                                                     */
/* ═══════════════════════════════════════════════════════════════════════════ */
const Slide14Actividades: React.FC = () => {
  const t = useT();
  const tipos = [
    { color: A.blue,   label: '📧 Email',       desc: 'Recordatorio para enviar un correo.' },
    { color: A.sky,    label: '📞 Llamada',      desc: 'Agendar una llamada de seguimiento.' },
    { color: A.violet, label: '📅 Reunión',      desc: 'Crea evento en el calendario.' },
    { color: A.amber,  label: '📋 Por hacer',    desc: 'Tarea general de seguimiento.' },
    { color: A.rose,   label: '📁 Subir doc.',   desc: 'Recordatorio para adjuntar un archivo.' },
    { color: A.teal,   label: '⚙️ Personaliz.', desc: 'Tipos creados por el administrador.' },
  ];
  return (
    <div style={{ ...BASE, background: t.bg }}>
      <SlideTitle>Actividades — seguimiento proactivo</SlideTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="ps-up ps-d1" style={{ ...panel(`rgba(37,99,235,0.3)`, `rgba(37,99,235,0.07)`) }}>
            <Tag label="¿Qué es una actividad?" color={A.blue} />
            <p style={{ color: t.a55, fontSize: 'clamp(0.95rem,2vw,1.2rem)', margin: '10px 0 0', lineHeight: 1.6 }}>
              Una actividad es una <strong style={{ color: A.sky }}>tarea futura</strong> asociada a un registro específico. Tiene tipo, fecha límite y responsable. Aparece en tu bandeja de actividades y en el calendario.
            </p>
          </div>
          <div className="ps-up ps-d2" style={{ ...panel(`rgba(13,148,136,0.3)`, `rgba(13,148,136,0.07)`) }}>
            <Tag label="¿Cómo crear una?" color={A.teal} />
            <div style={{ marginTop: 10 }}>
              <Bullets color={A.teal} items={['Abre el registro (cliente, venta, etc.)', 'Clic en "Actividades" en el Chatter', 'Elige el tipo, fecha y responsable', 'Clic en "Programar"']} />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="ps-up ps-d3" style={{ ...panel(t.s07, t.s03), marginBottom: 4 }}>
            <Tag label="Tipos de actividad" color={t.t2} />
          </div>
          {tipos.map((tp, i) => (
            <div key={i} className={`ps-up ps-d${i+4}`} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ color: tp.color, fontWeight: 700, fontSize: 'clamp(0.9rem,1.9vw,1.1rem)', minWidth: 110 }}>{tp.label}</div>
              <span style={{ color: t.a45, fontSize: 'clamp(0.85rem,1.8vw,1rem)' }}>{tp.desc}</span>
            </div>
          ))}
          <div className="ps-up ps-d9" style={{ marginTop: 8, ...panel(`rgba(37,99,235,0.25)`, `rgba(37,99,235,0.06)`), display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Dot color={A.blue} size={8} />
            <span style={{ color: A.sky, fontSize: 'clamp(0.88rem,1.8vw,1rem)' }}>El ícono de reloj 🕐 en la vista lista o kanban muestra el estado de la próxima actividad de cada registro.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/* SLIDE 15 · RESUMEN                                                         */
/* ═══════════════════════════════════════════════════════════════════════════ */
const Slide15Resumen: React.FC = () => {
  const t = useT();
  const puntos = [
    [A.blue,    'Odoo es modular',         'Un sistema, muchos módulos. Cada área de tu empresa tiene el suyo, todos comparten datos.'],
    [A.sky,     'La interfaz es consistente','Barra superior, menú lateral, área principal y breadcrumbs son iguales en todos los módulos.'],
    [A.teal,    '6 tipos de vista',        'Kanban, Lista, Formulario, Calendario, Gráfico y Pivote. Úsalos según lo que necesitas ver.'],
    [A.emerald, 'Búsqueda poderosa',       'Busca, filtra, agrupa y guarda favoritos. Usa la flecha ▼ para búsqueda avanzada.'],
    [A.violet,  'Formularios en modo vivo','Clic en el campo para editar. Guardar con el botón azul o la nube 💾. Descartar para cancelar.'],
    [A.amber,   'Chatter = memoria',       'Cada registro tiene su historial. Mensajes, notas, emails, cambios y actividades.'],
    [A.rose,    'Actividades = disciplina','Programa la próxima acción. Nunca dejes un cliente sin una actividad pendiente.'],
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

/* ═══════════════════════════════════════════════════════════════════════════ */
/* SLIDE 16 · CIERRE                                                          */
/* ═══════════════════════════════════════════════════════════════════════════ */
const Slide16Cierre: React.FC = () => (
  <div style={COVER_BG}>
    <div style={GRID} />
    <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', bottom: '-80px', right: '-60px', background: 'radial-gradient(circle, rgba(13,148,136,0.16), transparent 70%)', pointerEvents: 'none' }} />
    <div style={{ position: 'relative', zIndex: 1, maxWidth: 680, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: 56, height: 56, clipPath: OCTA, background: A.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <span style={{ color: '#fff', fontWeight: 900, fontSize: 22 }}>K</span>
      </div>
      <div className="ps-up ps-d1" style={badge('#7dd3fc', 'rgba(37,99,235,0.15)', 'rgba(37,99,235,0.3)')}>KTX LAB · Guía de Usuario Odoo 19</div>
      <h2 className="ps-up ps-d2" style={{ ...TW('clamp(3rem,9vw,7rem)', 900), margin: '1rem 0 0.5rem' }}>¡Listo!</h2>
      <p className="ps-up ps-d3" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(1rem,2.2vw,1.3rem)', fontStyle: 'italic', marginBottom: '1.8rem', textAlign: 'center' }}>
        "Odoo se aprende usándolo.<br />La mejor práctica es hacerlo real en tu día a día."
      </p>
      <div className="ps-up ps-d4" style={{ ...panel('rgba(255,255,255,0.1)', 'rgba(255,255,255,0.04)'), display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', padding: '14px 28px' }}>
        {['info@kontaxes.com', '+502 3517-4713', 'kontaxes.com'].map(v => (
          <span key={v} style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(0.9rem,1.9vw,1.1rem)' }}>{v}</span>
        ))}
      </div>
      <p className="ps-up ps-d5" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 'clamp(0.82rem,1.6vw,0.95rem)', marginTop: '1.2rem' }}>
        Material elaborado por KTX LAB · Continúa con Guía 02: Ventas, CRM, Suscripciones y Alquiler
      </p>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════ */
/* EXPORT                                                                      */
/* ═══════════════════════════════════════════════════════════════════════════ */
export const OdooIntroduccionSlides: React.FC[] = [
  Slide01Cover, Slide02Agenda,
  Slide03S1, Slide04QueEsOdoo,
  Slide05S2, Slide06Interfaz, Slide07Vistas,
  Slide08S3, Slide09Busqueda,
  Slide10S4, Slide11Formularios,
  Slide12S5, Slide13Chatter, Slide14Actividades,
  Slide15Resumen, Slide16Cierre,
];
