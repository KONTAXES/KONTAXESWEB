import React from 'react';

/* ─── Shared style helpers ──────────────────────────────────────────────── */

const SG: React.CSSProperties = { fontFamily: "'Space Grotesk', sans-serif" };

const SLIDE_BG: React.CSSProperties = {
  width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
  background: '#07030f', display: 'flex', flexDirection: 'column',
  padding: 'clamp(1.2rem, 3vw, 2.5rem)',
};

const GRAD_BG: React.CSSProperties = {
  ...SLIDE_BG,
  background: 'linear-gradient(135deg, #0f0a1e 0%, #1e0a4a 40%, #2d1065 65%, #0f3460 100%)',
  alignItems: 'center', justifyContent: 'center', textAlign: 'center',
};

const GRID_DOT: React.CSSProperties = {
  position: 'absolute', inset: 0, opacity: 0.04,
  backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
  backgroundSize: '22px 22px', pointerEvents: 'none',
};

const badge = (color: string, bg: string, border: string) => ({
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '4px 14px', borderRadius: 999,
  background: bg, border: `1px solid ${border}`,
  color, fontSize: 11, fontWeight: 700, letterSpacing: '1.6px',
  textTransform: 'uppercase' as const,
});

const panel = (border: string, bg: string): React.CSSProperties => ({
  borderRadius: 14, border: `1px solid ${border}`,
  background: bg, padding: 'clamp(0.9rem, 2vw, 1.4rem)',
});

const accentBar: React.CSSProperties = {
  width: 5, borderRadius: 3, flexShrink: 0,
  background: 'linear-gradient(180deg, #9333ea, #10b981)',
  alignSelf: 'stretch',
};

function T(size: string, w = 800): React.CSSProperties {
  return { ...SG, fontSize: size, fontWeight: w, lineHeight: 1.15, color: '#fff' };
}

/* Monochromatic dot marker */
function Dot({ color = '#c084fc', size = 10 }: { color?: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, flexShrink: 0,
      marginTop: `${size * 0.55}px`,
    }} />
  );
}

/* Monochromatic number badge */
function Num({ n, color = '#9333ea' }: { n: number; color?: string }) {
  return (
    <div style={{
      color: '#fff', background: color, borderRadius: 8,
      width: 32, height: 32, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 14, fontWeight: 800, marginTop: 2,
    }}>{n}</div>
  );
}

/* Tag chip for card headers */
function Tag({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 800, letterSpacing: '1.5px',
      textTransform: 'uppercase' as const, color,
      paddingBottom: 4, borderBottom: `2px solid ${color}`,
      display: 'inline-block',
    }}>{label}</span>
  );
}

function BulletList({ items, color = '#c084fc' }: { items: string[]; color?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 1.8vw, 18px)' }}>
      {items.map((item, i) => (
        <div key={i} className={`ps-up ps-d${Math.min(i + 2, 9)}`}
          style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <Dot color={color} size={9} />
          <span style={{ color: '#cbd5e1', fontSize: 'clamp(1rem, 2.2vw, 1.3rem)', lineHeight: 1.55 }}>
            {item}
          </span>
        </div>
      ))}
    </div>
  );
}

function NumberedList({ items, color = '#9333ea' }: { items: string[]; color?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 1.8vw, 18px)' }}>
      {items.map((item, i) => (
        <div key={i} className={`ps-up ps-d${Math.min(i + 2, 9)}`}
          style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <Num n={i + 1} color={color} />
          <span style={{ color: '#cbd5e1', fontSize: 'clamp(1rem, 2.2vw, 1.3rem)', lineHeight: 1.55 }}>
            {item}
          </span>
        </div>
      ))}
    </div>
  );
}

function SlideTitle({ children, delay = '' }: { children: React.ReactNode; delay?: string }) {
  return (
    <div className={`ps-up ${delay}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 'clamp(1rem, 2.5vw, 1.8rem)' }}>
      <div style={accentBar} />
      <h2 style={{ ...T('clamp(1.7rem, 3.8vw, 3rem)'), lineHeight: 1.2, color: '#f1f5f9' }}>
        {children}
      </h2>
    </div>
  );
}

/* ─── Section divider factory ───────────────────────────────────────────── */

function makeSectionSlide(num: string, title: string, subtitle?: string): React.FC {
  return function SectionSlide() {
    return (
      <div style={GRAD_BG}>
        <div style={GRID_DOT} />
        <div style={{
          position: 'absolute', ...SG,
          fontSize: 'clamp(9rem, 30vw, 22rem)', fontWeight: 900,
          color: 'rgba(255,255,255,0.038)', lineHeight: 1,
          top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          userSelect: 'none', pointerEvents: 'none',
        }}>{num}</div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="ps-up" style={badge('#a78bfa', 'rgba(139,92,246,0.15)', 'rgba(139,92,246,0.3)')}>
            Sección {num}
          </div>
          <h2 className="ps-up ps-d2" style={{ ...T('clamp(2.5rem, 7.5vw, 5.5rem)'), marginTop: '1rem', textWrap: 'balance' } as React.CSSProperties}>
            {title}
          </h2>
          {subtitle && (
            <p className="ps-up ps-d3" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(1rem, 2.2vw, 1.3rem)', marginTop: '0.75rem' }}>
              {subtitle}
            </p>
          )}
          <div className="ps-up ps-d4" style={{ width: 64, height: 4, borderRadius: 2, margin: '1.5rem auto 0', background: 'linear-gradient(90deg, #9333ea, #10b981)' }} />
        </div>
      </div>
    );
  };
}

/* ─── Slide 01 · Cover ──────────────────────────────────────────────────── */

const Slide01Cover: React.FC = () => (
  <div style={GRAD_BG}>
    <div style={GRID_DOT} />
    <div style={{ position: 'absolute', width: 420, height: 420, borderRadius: '50%', top: '-120px', right: '-80px', background: 'radial-gradient(circle, rgba(147,51,234,0.18), transparent 70%)', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', bottom: '-60px', left: '20%', background: 'radial-gradient(circle, rgba(16,185,129,0.12), transparent 70%)', pointerEvents: 'none' }} />

    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 820 }}>
      <img src="/K_white.png" alt="KONTAXES" className="ps-up"
        style={{ height: 'clamp(3rem, 7vw, 5rem)', width: 'auto', marginBottom: 'clamp(1rem, 3vw, 2rem)', filter: 'drop-shadow(0 0 32px rgba(147,51,234,0.8))' }} />
      <div className="ps-up ps-d1" style={badge('#6ee7b7', 'rgba(16,185,129,0.12)', 'rgba(16,185,129,0.3)')}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />
        Apoyo Social · Entidades Educativas · Perito Contador
      </div>
      <h1 className="ps-up ps-d2" style={{
        ...T('clamp(2.2rem, 7vw, 5.5rem)', 900), margin: 'clamp(1rem, 2.5vw, 1.5rem) 0 clamp(0.5rem, 1.5vw, 1rem)',
        textWrap: 'balance' as 'balance',
      }}>
        Declaración de Impuestos:
        <br />
        <span style={{ background: 'linear-gradient(90deg, #c084fc, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Pequeño Contribuyente
        </span>
      </h1>
      <div className="ps-up ps-d3" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'clamp(0.75rem, 2vw, 1.5rem)', marginTop: '1rem', color: 'rgba(255,255,255,0.45)', fontSize: 'clamp(0.9rem, 1.8vw, 1.05rem)', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.2rem' }}>
        <span>1 hora de exposición</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
        <span>30 min caso práctico</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
        <span>Taller gratuito</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
        <span>Guatemala</span>
      </div>
    </div>
  </div>
);

/* ─── Slide 02 · Agenda ─────────────────────────────────────────────────── */

const Slide02Agenda: React.FC = () => {
  const topics = [
    ['01', 'Generalidades', 'Qué es y para quién aplica'],
    ['02', 'Límite anual', '~Q 500,000 por año (Dto. 31-2024)'],
    ['03', 'Marco legal', 'Leyes que lo regulan'],
    ['04', 'Cálculo', 'La fórmula del 5% con ejemplos'],
    ['05', 'Formulario SAT-2046', 'Cómo declarar paso a paso'],
    ['06', 'Libros contables', 'Excel y LET — Libro Electrónico'],
    ['07', 'Omisos y multas', 'Qué pasa si no declaras'],
    ['08', 'Agencia Virtual', 'Consulta tus formularios en SAT'],
  ];
  return (
    <div style={SLIDE_BG}>
      <SlideTitle>Agenda del taller</SlideTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(260px, 42%, 400px), 1fr))', gap: 10, flex: 1 }}>
        {topics.map(([num, title, desc], i) => (
          <div key={num} className={`ps-up ps-d${Math.min(i + 1, 9)}`}
            style={{ ...panel('rgba(255,255,255,0.07)', 'rgba(255,255,255,0.03)'), display: 'flex', gap: 14, alignItems: 'center' }}>
            <span style={{ ...SG, fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', fontWeight: 900, color: 'rgba(147,51,234,0.5)', flexShrink: 0, lineHeight: 1, minWidth: 36 }}>
              {num}
            </span>
            <div>
              <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 'clamp(0.9rem, 1.9vw, 1.1rem)' }}>{title}</div>
              <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 'clamp(0.82rem, 1.6vw, 0.96rem)', marginTop: 3 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="ps-up ps-d9" style={{ marginTop: 14, ...panel('rgba(16,185,129,0.3)', 'rgba(16,185,129,0.07)'), display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
        <span style={{ color: '#6ee7b7', fontWeight: 700, fontSize: 'clamp(0.9rem, 1.9vw, 1.1rem)' }}>
          30 minutos finales — Caso práctico y preguntas
        </span>
      </div>
    </div>
  );
};

/* ─── Slide 03 — Section 01 Generalidades ───────────────────────────────── */
const Slide03S1 = makeSectionSlide('01', 'Generalidades', 'El régimen simplificado del IVA en Guatemala');

/* ─── Slide 04 · ¿Qué es Pequeño Contribuyente? ──────────────────────── */
const Slide04Definicion: React.FC = () => {
  const features = [
    { color: '#c084fc', border: 'rgba(192,132,252,0.3)', bg: 'rgba(192,132,252,0.06)', tag: 'Tasa', title: '5% sobre lo que vendes', desc: 'Cada mes calculas el 5% del total de tus ventas. Eso es todo lo que pagas de IVA.' },
    { color: '#6ee7b7', border: 'rgba(110,231,183,0.3)', bg: 'rgba(110,231,183,0.06)', tag: 'Declaración', title: 'Formulario mensual', desc: 'Una vez al mes llenas el formulario SAT-2046 y pagas. Proceso sencillo y digital.' },
    { color: '#60a5fa', border: 'rgba(96,165,250,0.3)', bg: 'rgba(96,165,250,0.06)', tag: 'Facturación', title: 'Facturas electrónicas FEL', desc: 'Cada venta debe tener su factura electrónica. Se emite desde el sistema SAT o un certificador.' },
    { color: '#fbbf24', border: 'rgba(251,191,36,0.3)', bg: 'rgba(251,191,36,0.06)', tag: 'Límite', title: '~Q 500,000 al año', desc: 'Si ganas más de eso en el año, te debes cambiar a otro régimen tributario.' },
  ];
  return (
    <div style={SLIDE_BG}>
      <SlideTitle>¿Qué es el Pequeño Contribuyente?</SlideTitle>
      <div className="ps-up ps-d1" style={{ ...panel('rgba(147,51,234,0.35)', 'rgba(147,51,234,0.1)'), marginBottom: 'clamp(0.8rem, 2vw, 1.4rem)', borderLeft: '5px solid #9333ea', borderRadius: '0 12px 12px 0' }}>
        <p style={{ color: '#e2e8f0', fontSize: 'clamp(1.05rem, 2.3vw, 1.4rem)', lineHeight: 1.65, margin: 0 }}>
          Es un <strong style={{ color: '#c084fc' }}>régimen simplificado del IVA</strong> para negocios pequeños. En vez de llevar toda la contabilidad compleja que llevan las empresas grandes, solo calculas el <strong style={{ color: '#c084fc' }}>5% de tus ventas</strong> y lo pagas cada mes.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, flex: 1 }}>
        {features.map((f, i) => (
          <div key={i} className={`ps-up ps-d${Math.min(i + 2, 9)}`}
            style={{ ...panel(f.border, f.bg), display: 'flex', flexDirection: 'column', gap: 10, borderTop: `3px solid ${f.color}` }}>
            <Tag label={f.tag} color={f.color} />
            <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 'clamp(1.05rem, 2.3vw, 1.4rem)', lineHeight: 1.3 }}>{f.title}</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(0.9rem, 2vw, 1.15rem)', lineHeight: 1.55 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Slide 05 · Comparación de regímenes ───────────────────────────────── */
const Slide05Comparacion: React.FC = () => {
  const rows = [
    ['¿Cuánto pago?',     '5% sobre el total vendido',           '12% − lo que compraste (crédito fiscal)'],
    ['¿Crédito fiscal?',  'No — no se descuenta nada',           'Sí — se descuentan tus compras con factura'],
    ['¿Cómo declaro?',    'Mensual · Formulario SAT-2046',        'Mensual · Formulario SAT-2237 y más'],
    ['¿Límite de ventas?','~Q 500,000 al año',                   'Sin límite'],
    ['¿Qué tan difícil?', 'Fácil — ideal para aprender',         'Más complejo — requiere contador'],
    ['¿Para quién?',      'Pequeños negocios y emprendedores',    'Negocios medianos y grandes'],
  ];
  return (
    <div style={SLIDE_BG}>
      <SlideTitle>¿Cuándo conviene el Pequeño Contribuyente?</SlideTitle>
      <div className="ps-up ps-d1" style={{ flex: 1, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'clamp(0.9rem, 2vw, 1.15rem)' }}>
          <thead>
            <tr style={{ background: 'linear-gradient(90deg, #6d28d9, #5b21b6)' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#e2e8f0', fontWeight: 700, fontSize: 'clamp(0.82rem, 1.7vw, 1rem)' }}>Aspecto</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#c084fc', fontWeight: 700, fontSize: 'clamp(0.82rem, 1.7vw, 1rem)' }}>Pequeño Contribuyente</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#93c5fd', fontWeight: 700, fontSize: 'clamp(0.82rem, 1.7vw, 1rem)' }}>Régimen General / Opcional</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([asp, pc, rg], i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.025)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{asp}</td>
                <td style={{ padding: '12px 16px', color: '#c084fc', fontWeight: 600 }}>{pc}</td>
                <td style={{ padding: '12px 16px', color: '#93c5fd' }}>{rg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="ps-up ps-d8" style={{ marginTop: 12, ...panel('rgba(16,185,129,0.3)', 'rgba(16,185,129,0.07)') }}>
        <p style={{ color: '#6ee7b7', fontSize: 'clamp(0.95rem, 2vw, 1.2rem)', fontWeight: 600, margin: 0 }}>
          El Pequeño Contribuyente es la puerta de entrada al sistema tributario formal en Guatemala.
        </p>
      </div>
    </div>
  );
};

/* ─── Slide 06 — Section 02 Límite ─────────────────────────────────────── */
const Slide06S2 = makeSectionSlide('02', 'Límite Anual', '¿Cuánto puedo vender en este régimen?');

/* ─── Slide 07 · El Límite ──────────────────────────────────────────────── */
const Slide07Limite: React.FC = () => (
  <div style={SLIDE_BG}>
    <SlideTitle>¿Cuánto puedo vender al año?</SlideTitle>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
      {/* Big number */}
      <div className="ps-up ps-d1" style={{ textAlign: 'center', padding: 'clamp(1rem, 3vw, 2rem)', borderRadius: 16, background: 'linear-gradient(135deg, rgba(147,51,234,0.18), rgba(109,40,217,0.1))', border: '1px solid rgba(147,51,234,0.35)' }}>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(0.85rem, 1.8vw, 1rem)', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
          Límite máximo de ingresos anuales
        </div>
        <div style={{ ...SG, fontSize: 'clamp(3.5rem, 11vw, 7.5rem)', fontWeight: 900, color: '#c084fc', lineHeight: 1 }}>
          ~Q 500,000
        </div>
        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 'clamp(0.85rem, 1.8vw, 1rem)', marginTop: 10 }}>
          Equivale a 125 salarios mínimos anuales · Decreto 31-2024 (vigente 2026)
        </div>
      </div>
      {/* Two panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1 }}>
        <div className="ps-up ps-d2" style={{ ...panel('rgba(16,185,129,0.3)', 'rgba(16,185,129,0.07)') }}>
          <div style={{ marginBottom: 12 }}>
            <Tag label="Si no superas el límite" color="#6ee7b7" />
          </div>
          <BulletList color="#6ee7b7" items={[
            'Sigues pagando el 5% mensual',
            'El proceso no cambia',
            'No hay que notificarle nada a SAT',
          ]} />
        </div>
        <div className="ps-up ps-d3" style={{ ...panel('rgba(239,68,68,0.3)', 'rgba(239,68,68,0.07)') }}>
          <div style={{ marginBottom: 12 }}>
            <Tag label="Si superas el límite" color="#fca5a5" />
          </div>
          <BulletList color="#fca5a5" items={[
            'Debes cambiarte al régimen general',
            'Notifica a SAT dentro del mes',
            'El cambio aplica desde ese período',
          ]} />
        </div>
      </div>
      {/* Example */}
      <div className="ps-up ps-d5" style={{ ...panel('rgba(245,158,11,0.3)', 'rgba(245,158,11,0.07)'), display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fbbf24', flexShrink: 0, marginTop: 6 }} />
        <span style={{ color: '#fcd34d', fontSize: 'clamp(0.95rem, 2vw, 1.2rem)' }}>
          <strong>Ejemplo:</strong> Si vendes Q 45,000 por mes, en 11 meses llevas Q 495,000 — cerca del límite. En el mes 12 ya lo superas. ¡Ojo con el acumulado!
        </span>
      </div>
    </div>
  </div>
);

/* ─── Slide 08 — Section 03 Marco Legal ────────────────────────────────── */
const Slide08S3 = makeSectionSlide('03', 'Marco Legal', 'Las leyes que rigen el régimen');

/* ─── Slide 09 · Leyes y Reglamentos ───────────────────────────────────── */
const Slide09Leyes: React.FC = () => {
  const leyes = [
    {
      color: '#c084fc', border: 'rgba(192,132,252,0.3)', bg: 'rgba(192,132,252,0.07)',
      tag: 'Ley principal',
      titulo: 'Decreto 27-92 — Ley del IVA',
      desc: 'Aquí está todo. Los Artículos 45 al 50 explican quiénes son Pequeños Contribuyentes, cuánto pagan (5%) y cómo deben declarar.',
    },
    {
      color: '#6ee7b7', border: 'rgba(110,231,183,0.3)', bg: 'rgba(110,231,183,0.07)',
      tag: 'Reforma 2024',
      titulo: 'Decreto 31-2024 — Reforma al IVA',
      desc: 'Aprobado el 19 de noviembre de 2024. Cambió el límite de ingresos: ya no es una cantidad fija, ahora se calcula con base en 125 salarios mínimos anuales (~Q 500,000 para 2026).',
    },
    {
      color: '#60a5fa', border: 'rgba(96,165,250,0.3)', bg: 'rgba(96,165,250,0.07)',
      tag: 'Código Tributario',
      titulo: 'Decreto 6-91 — Código Tributario',
      desc: 'Regula las sanciones. Si no declaras, aquí están las multas (Art. 94), los intereses (Art. 58) y la mora (Art. 92).',
    },
    {
      color: '#fbbf24', border: 'rgba(251,191,36,0.3)', bg: 'rgba(251,191,36,0.07)',
      tag: 'Facturación',
      titulo: 'Resolución SAT — Sistema FEL',
      desc: 'Todas las facturas deben ser electrónicas. SAT puede ver en tiempo real cuánto estás vendiendo, así que los datos deben coincidir con tu declaración.',
    },
  ];
  return (
    <div style={SLIDE_BG}>
      <SlideTitle>Base legal del régimen</SlideTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, flex: 1 }}>
        {leyes.map((l, i) => (
          <div key={i} className={`ps-up ps-d${i + 1}`}
            style={{ ...panel(l.border, l.bg), borderTop: `3px solid ${l.color}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Tag label={l.tag} color={l.color} />
            <div style={{ color: l.color, fontWeight: 700, fontSize: 'clamp(1rem, 2.2vw, 1.3rem)', lineHeight: 1.3 }}>
              {l.titulo}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'clamp(0.92rem, 2vw, 1.15rem)', lineHeight: 1.6, margin: 0 }}>
              {l.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Slide 10 — Section 04 Cálculo ────────────────────────────────────── */
const Slide10S4 = makeSectionSlide('04', 'Cálculo del Impuesto', 'La fórmula del 5%');

/* ─── Slide 11 · La Fórmula ────────────────────────────────────────────── */
const Slide11Formula: React.FC = () => (
  <div style={SLIDE_BG}>
    <SlideTitle>¿Cómo calculo cuánto debo pagar?</SlideTitle>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
      {/* Formula box */}
      <div className="ps-up ps-d1" style={{ textAlign: 'center', padding: 'clamp(1.4rem, 3.5vw, 2.5rem)', borderRadius: 16, background: 'rgba(147,51,234,0.12)', border: '1px solid rgba(147,51,234,0.35)' }}>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 'clamp(0.85rem, 1.7vw, 1rem)', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
          Fórmula del impuesto
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(0.5rem, 2vw, 1.5rem)', flexWrap: 'wrap' }}>
          <span style={{ ...SG, fontSize: 'clamp(1.8rem, 5vw, 3.8rem)', fontWeight: 900, color: '#c084fc' }}>IVA</span>
          <span style={{ ...SG, fontSize: 'clamp(1.8rem, 5vw, 3.8rem)', fontWeight: 300, color: 'rgba(255,255,255,0.4)' }}>=</span>
          <span style={{ ...SG, fontSize: 'clamp(1.8rem, 5vw, 3.8rem)', fontWeight: 700, color: '#e2e8f0' }}>Total Ventas del Mes</span>
          <span style={{ ...SG, fontSize: 'clamp(1.8rem, 5vw, 3.8rem)', fontWeight: 300, color: 'rgba(255,255,255,0.4)' }}>×</span>
          <span style={{ ...SG, fontSize: 'clamp(1.8rem, 5vw, 3.8rem)', fontWeight: 900, color: '#10b981' }}>5%</span>
        </div>
      </div>
      {/* Two panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1 }}>
        <div className="ps-up ps-d2" style={{ ...panel('rgba(239,68,68,0.3)', 'rgba(239,68,68,0.06)') }}>
          <div style={{ marginBottom: 12 }}>
            <Tag label="NO se incluye" color="#fca5a5" />
          </div>
          <BulletList color="#fca5a5" items={['Tus compras del mes', 'Tus gastos operativos', 'Costo de lo que vendiste']} />
        </div>
        <div className="ps-up ps-d3" style={{ ...panel('rgba(16,185,129,0.3)', 'rgba(16,185,129,0.06)') }}>
          <div style={{ marginBottom: 12 }}>
            <Tag label="SÍ se declara" color="#6ee7b7" />
          </div>
          <BulletList color="#6ee7b7" items={['Todas las ventas del mes', 'Servicios prestados', 'Total emitido en facturas FEL']} />
        </div>
      </div>
      {/* Deadline */}
      <div className="ps-up ps-d5" style={{ ...panel('rgba(245,158,11,0.3)', 'rgba(245,158,11,0.07)'), display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fbbf24', flexShrink: 0, marginTop: 6 }} />
        <span style={{ color: '#fcd34d', fontSize: 'clamp(0.95rem, 2vw, 1.2rem)' }}>
          <strong>Plazo de pago:</strong> Hasta el último día calendario del mes siguiente.
          Ejemplo: el IVA de abril se paga hasta el <strong>31 de mayo</strong>.
        </span>
      </div>
    </div>
  </div>
);

/* ─── Slide 12 · Ejemplo de Cálculo ──────────────────────────────────── */
const Slide12Ejemplo: React.FC = () => {
  const filas = [
    ['001', '05/oct', 'Venta de artículos varios',   'Q 2,400.00'],
    ['002', '10/oct', 'Prestación de servicios',     'Q 5,750.00'],
    ['003', '18/oct', 'Venta al por mayor',           'Q 1,100.00'],
    ['004', '27/oct', 'Servicios de consultoría',    'Q 3,900.00'],
  ];
  return (
    <div style={SLIDE_BG}>
      <SlideTitle>Ejemplo — Octubre 2024</SlideTitle>
      <div className="ps-up ps-d1" style={{ overflowX: 'auto', marginBottom: 14 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'clamp(0.9rem, 2vw, 1.15rem)' }}>
          <thead>
            <tr style={{ background: 'linear-gradient(90deg, #6d28d9, #5b21b6)' }}>
              {['No. Factura', 'Fecha', 'Descripción', 'Monto'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#fff', fontWeight: 700, fontSize: 'clamp(0.85rem, 1.7vw, 1rem)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map(([num, fecha, desc, monto], i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: i % 2 === 0 ? 'rgba(255,255,255,0.025)' : 'transparent' }}>
                <td style={{ padding: '10px 14px', color: '#c084fc', fontWeight: 700 }}>{num}</td>
                <td style={{ padding: '10px 14px', color: 'rgba(255,255,255,0.55)' }}>{fecha}</td>
                <td style={{ padding: '10px 14px', color: '#e2e8f0' }}>{desc}</td>
                <td style={{ padding: '10px 14px', color: '#e2e8f0', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{monto}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          ['Total facturado', 'Q 13,150.00', '#e2e8f0', 'rgba(255,255,255,0.08)'],
          ['Tasa aplicable', '× 5%', '#fbbf24', 'rgba(245,158,11,0.1)'],
          ['IVA A PAGAR', 'Q 657.50', '#10b981', 'rgba(16,185,129,0.12)'],
        ].map(([label, value, color, bg], i) => (
          <div key={i} className={`ps-up ps-d${i + 3}`}
            style={{ ...panel(`${color}4d`, bg), textAlign: 'center' }}>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 'clamp(0.78rem, 1.6vw, 0.9rem)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>{label}</div>
            <div style={{ ...SG, fontSize: 'clamp(1.6rem, 4.5vw, 3rem)', fontWeight: 900, color }}>{value}</div>
          </div>
        ))}
      </div>
      <div className="ps-up ps-d7" style={{ marginTop: 14, ...panel('rgba(147,51,234,0.25)', 'rgba(147,51,234,0.06)') }}>
        <p style={{ color: '#c084fc', fontSize: 'clamp(0.95rem, 2vw, 1.2rem)', margin: 0 }}>
          <strong>Plazo:</strong> Este IVA debe pagarse hasta el 30 de noviembre (último día del mes siguiente).
        </p>
      </div>
    </div>
  );
};

/* ─── Slide 13 — Section 05 Formulario ──────────────────────────────────── */
const Slide13S5 = makeSectionSlide('05', 'Formulario SAT-2046', 'El trámite mensual en Agencia Virtual');

/* ─── Slide 14 · Pasos para Declarar ───────────────────────────────────── */
const Slide14Pasos: React.FC = () => (
  <div style={SLIDE_BG}>
    <SlideTitle>Cómo declarar — paso a paso</SlideTitle>
    <NumberedList items={[
      'Entra a portal.sat.gob.gt e inicia sesión con tu NIT y contraseña de Agencia Virtual.',
      'Ve a "Declaraciones en línea" → "IVA Pequeño Contribuyente" → Formulario SAT-2046.',
      'Selecciona el mes y año que estás declarando y escribe el total de tus ventas.',
      'El sistema calcula solo el 5%. Verifica que el número esté correcto.',
      'Genera el formulario y anota o guarda el número de acceso.',
      'Paga en BancaSAT o en un banco habilitado. Guarda siempre la constancia.',
    ]} />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 16 }}>
      {[
        ['#fbbf24', 'Plazo', 'Hasta el último día del mes siguiente'],
        ['#60a5fa', 'Pago', 'BancaSAT · Bancos habilitados · En línea'],
        ['#c084fc', 'Constancia', 'Guárdala siempre — es tu prueba de pago'],
      ].map(([color, label, desc], i) => (
        <div key={i} className={`ps-up ps-d${i + 7}`}
          style={{ ...panel('rgba(255,255,255,0.07)', 'rgba(255,255,255,0.03)'), textAlign: 'center', borderTop: `3px solid ${color}` }}>
          <div style={{ color, fontWeight: 700, fontSize: 'clamp(0.95rem, 2vw, 1.2rem)', marginTop: 8, marginBottom: 6 }}>{label}</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(0.85rem, 1.7vw, 1rem)' }}>{desc}</div>
        </div>
      ))}
    </div>
  </div>
);

/* ─── Slide 15 — Section 06 Libros ─────────────────────────────────────── */
const Slide15S6 = makeSectionSlide('06', 'Libros Contables', 'Libro de Ventas y LET mensual');

/* ─── Slide 16 · Libros ─────────────────────────────────────────────────── */
const Slide16Libros: React.FC = () => (
  <div style={SLIDE_BG}>
    <SlideTitle>Libro de Ventas y LET — Libro Electrónico Tributario</SlideTitle>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, flex: 1 }}>
      <div className="ps-up ps-d1" style={{ ...panel('rgba(16,185,129,0.35)', 'rgba(16,185,129,0.07)'), display: 'flex', flexDirection: 'column', gap: 14, borderTop: '3px solid #10b981' }}>
        <Tag label="Libro de Ventas — Excel" color="#6ee7b7" />
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 'clamp(0.95rem, 2vw, 1.2rem)', margin: 0 }}>
          Registro mensual de todas tus ventas. Lo llevas tú en Excel o en tu sistema contable.
        </p>
        <div style={{ borderTop: '1px solid rgba(16,185,129,0.2)', paddingTop: 12 }}>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)', marginBottom: 10 }}>Columnas básicas:</div>
          <BulletList color="#6ee7b7" items={[
            'Correlativo y fecha',
            'Número de factura FEL',
            'Nombre/NIT del cliente',
            'Monto total',
          ]} />
        </div>
      </div>
      <div className="ps-up ps-d2" style={{ ...panel('rgba(147,51,234,0.35)', 'rgba(147,51,234,0.07)'), display: 'flex', flexDirection: 'column', gap: 14, borderTop: '3px solid #9333ea' }}>
        <Tag label="LET — Libro Electrónico" color="#c084fc" />
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 'clamp(0.95rem, 2vw, 1.2rem)', margin: 0 }}>
          Es tu libro de ventas en formato oficial de SAT. Lo subes a la Agencia Virtual cada mes.
        </p>
        <div style={{ borderTop: '1px solid rgba(147,51,234,0.2)', paddingTop: 12 }}>
          <BulletList color="#c084fc" items={[
            'Formato Excel oficial de SAT',
            'Se descarga en Agencia Virtual',
            'Se presenta con la declaración',
            'Reemplaza el libro físico',
          ]} />
        </div>
      </div>
    </div>
    <div className="ps-up ps-d5" style={{ marginTop: 14, ...panel('rgba(245,158,11,0.3)', 'rgba(245,158,11,0.07)'), display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fbbf24', flexShrink: 0, marginTop: 6 }} />
      <p style={{ color: '#fcd34d', fontSize: 'clamp(0.95rem, 2vw, 1.2rem)', margin: 0 }}>
        <strong>¡Importante!</strong> Si no presentas el LET, SAT puede sancionarte aunque hayas pagado el impuesto a tiempo.
      </p>
    </div>
  </div>
);

/* ─── Slide 17 — Section 07 Omisos ─────────────────────────────────────── */
const Slide17S7 = makeSectionSlide('07', 'Omisos y Multas', '¿Qué pasa si no declaras?');

/* ─── Slide 18 · Multas e Intereses ────────────────────────────────────── */
const Slide18Sanciones: React.FC = () => (
  <div style={SLIDE_BG}>
    <SlideTitle>Consecuencias de no declarar a tiempo</SlideTitle>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
      <div className="ps-up ps-d1" style={{ ...panel('rgba(239,68,68,0.3)', 'rgba(239,68,68,0.06)'), borderLeft: '5px solid #ef4444', borderRadius: '0 12px 12px 0' }}>
        <p style={{ color: '#fca5a5', fontWeight: 700, fontSize: 'clamp(1.05rem, 2.3vw, 1.4rem)', margin: '0 0 6px' }}>
          OMISO = no presentaste tu declaración en el plazo legal
        </p>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(0.95rem, 2vw, 1.2rem)', margin: 0 }}>
          SAT cruza datos con tus facturas FEL y sabe cuánto vendiste. Si no declaras, generás cargos automáticos por cada día que pasa.
        </p>
      </div>
      <div className="ps-up ps-d2" style={{ overflowX: 'auto', flex: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'clamp(0.95rem, 2.1vw, 1.2rem)' }}>
          <thead>
            <tr style={{ background: 'linear-gradient(90deg, #991b1b, #7f1d1d)' }}>
              {['Cargo', 'Cuánto pagas', 'Base legal'].map(h => (
                <th key={h} style={{ padding: '11px 14px', textAlign: 'left', color: '#fca5a5', fontWeight: 700, fontSize: 'clamp(0.85rem, 1.8vw, 1rem)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['Omiso (por día)', 'Q 7.50 por cada día de atraso · máximo Q 150 por declaración', 'Art. 94 Cód. Tributario'],
              ['Interés resarcitorio', 'Calculado sobre el impuesto no pagado según tasa legal vigente', 'Art. 58 Cód. Tributario'],
              ['Mora / Recargo', 'Cargo adicional por el tiempo de retraso en el pago', 'Art. 92 Cód. Tributario'],
            ].map(([cargo, calc, base], i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: i % 2 === 0 ? 'rgba(255,255,255,0.025)' : 'transparent' }}>
                <td style={{ padding: '11px 14px', color: '#fca5a5', fontWeight: 700 }}>{cargo}</td>
                <td style={{ padding: '11px 14px', color: '#e2e8f0' }}>{calc}</td>
                <td style={{ padding: '11px 14px', color: 'rgba(255,255,255,0.4)', fontSize: 'clamp(0.82rem, 1.6vw, 0.95rem)' }}>{base}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="ps-up ps-d5" style={{ ...panel('rgba(245,158,11,0.3)', 'rgba(245,158,11,0.07)'), display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fbbf24', flexShrink: 0, marginTop: 6 }} />
        <p style={{ color: '#fcd34d', fontSize: 'clamp(0.95rem, 2vw, 1.2rem)', margin: 0 }}>
          <strong>Rectificación:</strong> Si declaraste con datos equivocados, presentás una declaración rectificativa en Agencia Virtual. El costo de rectificar es <strong>Q 15.00</strong>. Aún así, pagarás intereses sobre la diferencia no pagada a tiempo.
        </p>
      </div>
    </div>
  </div>
);

/* ─── Slide 19 · Ejemplo con Multas ────────────────────────────────────── */
const Slide19EjemploMulta: React.FC = () => (
  <div style={SLIDE_BG}>
    <SlideTitle>¿Cuánto más caro sale no declarar?</SlideTitle>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
      <div className="ps-up ps-d1" style={{ ...panel('rgba(255,255,255,0.07)', 'rgba(255,255,255,0.03)') }}>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 'clamp(1rem, 2.2vw, 1.3rem)', margin: 0 }}>
          <strong style={{ color: '#e2e8f0' }}>Situación:</strong> No declaraste el IVA de agosto (ventas: Q 8,000) y lo pagas 2 meses tarde.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1 }}>
        <div className="ps-up ps-d2" style={{ ...panel('rgba(147,51,234,0.3)', 'rgba(147,51,234,0.07)'), display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Tag label="Lo que debías pagar" color="#c084fc" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 'clamp(1rem, 2.2vw, 1.3rem)', fontVariantNumeric: 'tabular-nums' }}>
            {[
              ['Ventas del mes', 'Q 8,000.00', '#e2e8f0'],
              ['IVA correcto (5%)', 'Q 400.00', '#c084fc'],
            ].map(([label, val, color]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: 8 }}>
                <span style={{ color: 'rgba(255,255,255,0.55)' }}>{label}</span>
                <span style={{ color, fontWeight: 700 }}>{val}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 'auto', padding: '10px 14px', borderRadius: 10, background: 'rgba(147,51,234,0.12)', border: '1px solid rgba(147,51,234,0.25)', textAlign: 'center' }}>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 'clamp(0.85rem, 1.7vw, 1rem)', marginBottom: 4 }}>Si pagas a tiempo</div>
            <div style={{ ...SG, fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 900, color: '#c084fc' }}>Q 400.00</div>
          </div>
        </div>
        <div className="ps-up ps-d3" style={{ ...panel('rgba(239,68,68,0.3)', 'rgba(239,68,68,0.07)'), display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Tag label="Lo que pagas tarde (20 días de atraso)" color="#fca5a5" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 'clamp(1rem, 2.2vw, 1.3rem)', fontVariantNumeric: 'tabular-nums' }}>
            {[
              ['IVA original', 'Q 400.00', '#e2e8f0'],
              ['Omiso (20 días × Q 7.50)', 'Q 150.00 (máx)', '#fca5a5'],
              ['Intereses (aprox.)', '~Q 8.00', '#f87171'],
              ['Mora (aprox.)', '~Q 12.00', '#f87171'],
            ].map(([label, val, color]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: 8 }}>
                <span style={{ color: 'rgba(255,255,255,0.55)' }}>{label}</span>
                <span style={{ color, fontWeight: 700 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="ps-up ps-d5" style={{ ...panel('rgba(239,68,68,0.5)', 'rgba(239,68,68,0.1)'), textAlign: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)', marginBottom: 8 }}>TOTAL A PAGAR (impuesto + cargos)</div>
        <div style={{ ...SG, fontSize: 'clamp(2.5rem, 7vw, 5rem)', fontWeight: 900, color: '#fca5a5' }}>Q 570.00</div>
        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)', marginTop: 8 }}>
          vs. Q 400.00 si hubieras pagado a tiempo — <strong style={{ color: '#fca5a5' }}>Q 170 extra que podías ahorrarte</strong>
        </div>
      </div>
    </div>
  </div>
);

/* ─── Slide 20 — Section 08 Agencia Virtual ────────────────────────────── */
const Slide20S8 = makeSectionSlide('08', 'Agencia Virtual SAT', 'Consulta y descarga tus formularios');

/* ─── Slide 21 · Agencia Virtual ───────────────────────────────────────── */
const Slide21AgenciaVirtual: React.FC = () => (
  <div style={SLIDE_BG}>
    <SlideTitle>Cómo buscar tus formularios en SAT</SlideTitle>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, flex: 1 }}>
      {[
        { color: '#60a5fa', tag: 'Paso 1', title: 'Entrar al portal', desc: 'Ve a portal.sat.gob.gt → Agencia Virtual → ingresa con tu NIT y contraseña.' },
        { color: '#c084fc', tag: 'Paso 2', title: 'Buscar declaraciones', desc: 'En el menú elige "Declaraciones" → "Consultar declaraciones presentadas".' },
        { color: '#6ee7b7', tag: 'Paso 3', title: 'Filtrar por período', desc: 'Selecciona el tipo de impuesto (IVA) y el mes/año que quieres consultar.' },
        { color: '#fbbf24', tag: 'Paso 4', title: 'Revisar el estado', desc: 'GENERADO = llenaste pero no pagaste · PAGADO = todo correcto · OMISO = no presentaste.' },
        { color: '#a78bfa', tag: 'Paso 5', title: 'Descargar constancia', desc: 'Presiona "Imprimir" o "Descargar PDF" en el formulario PAGADO. Esa es tu prueba oficial.' },
        { color: '#f87171', tag: 'Si hay error', title: 'Llamar a SAT', desc: 'Marca al 1544 o visita el Módulo del Contribuyente. Nunca modifiques los archivos descargados.' },
      ].map((item, i) => (
        <div key={i} className={`ps-up ps-d${Math.min(i + 1, 9)}`}
          style={{ ...panel('rgba(255,255,255,0.07)', 'rgba(255,255,255,0.025)'), display: 'flex', flexDirection: 'column', gap: 8, borderTop: `3px solid ${item.color}` }}>
          <Tag label={item.tag} color={item.color} />
          <div style={{ color: item.color, fontWeight: 700, fontSize: 'clamp(1rem, 2.1vw, 1.25rem)' }}>{item.title}</div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(0.9rem, 1.9vw, 1.1rem)', lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

/* ─── Slide 22 · Resumen General ──────────────────────────────────────── */
const Slide22Resumen: React.FC = () => {
  const puntos = [
    ['#c084fc', 'Pequeño Contribuyente', 'Pagas solo el 5% de lo que vendiste en el mes. Sin deducciones complicadas.'],
    ['#60a5fa', 'Límite anual', '125 salarios mínimos ≈ Q 500,285/año (Decreto 31-2024). Si lo superas, cambias de régimen.'],
    ['#a78bfa', 'Base legal', 'Decreto 27-92 Arts. 45-50 + Decreto 31-2024 (reforma 2024).'],
    ['#6ee7b7', 'Cálculo', 'IVA = Ventas del mes × 5%. Se paga hasta el último día del mes siguiente.'],
    ['#fbbf24', 'Formulario SAT-2046', 'Se llena en línea en portal.sat.gob.gt. Guarda siempre la constancia de pago.'],
    ['#f9a8d4', 'LET obligatorio', 'El libro electrónico de ventas se presenta mensualmente en Agencia Virtual.'],
    ['#fca5a5', 'Omisos y multas', 'Q 7.50/día · máx Q 150 por declaración · Rectificación Q 15. Declarar a tiempo siempre es más barato.'],
    ['#67e8f9', 'Agencia Virtual', 'portal.sat.gob.gt — consulta, descarga y verifica todos tus formularios pagados.'],
  ];
  return (
    <div style={SLIDE_BG}>
      <SlideTitle>Lo más importante que llevas hoy</SlideTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, flex: 1 }}>
        {puntos.map(([color, title, desc], i) => (
          <div key={i} className={`ps-up ps-d${Math.min(i + 1, 9)}`}
            style={{ ...panel('rgba(255,255,255,0.07)', 'rgba(255,255,255,0.025)'), display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Dot color={color as string} size={10} />
            <div>
              <div style={{ color, fontWeight: 700, fontSize: 'clamp(0.95rem, 2vw, 1.2rem)', marginBottom: 4 }}>{title}</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 'clamp(0.88rem, 1.8vw, 1.05rem)', lineHeight: 1.5 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Slide 23 · Caso Práctico ─────────────────────────────────────────── */
const Slide23CasoPractico: React.FC = () => (
  <div style={SLIDE_BG}>
    <SlideTitle>Caso Práctico — 30 minutos</SlideTitle>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, flex: 1 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="ps-up ps-d1" style={{ ...panel('rgba(147,51,234,0.3)', 'rgba(147,51,234,0.07)') }}>
          <div style={{ marginBottom: 12 }}>
            <Tag label="Datos del ejercicio" color="#c084fc" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 'clamp(0.95rem, 2vw, 1.15rem)' }}>
            {[
              ['Contribuyente', 'Comercial San José'],
              ['NIT', '7654321-K'],
              ['Régimen', 'Pequeño Contribuyente'],
              ['Período', 'Noviembre 2024'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>
                <span style={{ color: 'rgba(255,255,255,0.45)' }}>{k}</span>
                <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="ps-up ps-d2" style={{ ...panel('rgba(255,255,255,0.07)', 'rgba(255,255,255,0.025)') }}>
          <div style={{ marginBottom: 12 }}>
            <Tag label="Facturas del mes" color="#e2e8f0" />
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', fontVariantNumeric: 'tabular-nums' }}>
            <tbody>
              {[['F-101', 'Q 3,200.00'], ['F-102', 'Q 7,400.00'], ['F-103', 'Q 1,850.00'], ['F-104', 'Q 4,550.00'], ['F-105', 'Q 2,100.00']].map(([f, m]) => (
                <tr key={f} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '7px 0', color: '#c084fc', fontWeight: 600 }}>{f}</td>
                  <td style={{ padding: '7px 0', color: '#e2e8f0', textAlign: 'right' }}>{m}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="ps-up ps-d3" style={{ ...panel('rgba(16,185,129,0.3)', 'rgba(16,185,129,0.07)'), flex: 1 }}>
          <div style={{ marginBottom: 14 }}>
            <Tag label="Lo que debes resolver" color="#6ee7b7" />
          </div>
          <NumberedList color="#10b981" items={[
            'Suma todas las facturas. ¿Cuánto es el total de ventas?',
            'Aplica el 5%. ¿Cuánto es el IVA a pagar?',
            'Llena el libro de ventas en Excel con los 5 registros.',
            'Completa el Formulario SAT-2046 con el total calculado.',
            'Si pagas el 20 de diciembre, ¿hay multa? ¿Por qué?',
          ]} />
        </div>
        <div className="ps-up ps-d8" style={{ ...panel('rgba(245,158,11,0.3)', 'rgba(245,158,11,0.07)'), display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fbbf24', flexShrink: 0, marginTop: 6 }} />
          <p style={{ color: '#fcd34d', fontSize: 'clamp(0.95rem, 2vw, 1.2rem)', margin: 0, fontWeight: 600 }}>
            El plazo para el IVA de noviembre vence el 31 de diciembre (último día del mes siguiente).
          </p>
        </div>
      </div>
    </div>
  </div>
);

/* ─── Slide 24 · Cierre ─────────────────────────────────────────────────── */
const Slide24Cierre: React.FC = () => (
  <div style={GRAD_BG}>
    <div style={GRID_DOT} />
    <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', bottom: '-100px', right: '-80px', background: 'radial-gradient(circle, rgba(16,185,129,0.14), transparent 70%)', pointerEvents: 'none' }} />
    <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <img src="/K_white.png" alt="KONTAXES" className="ps-up"
        style={{ height: 'clamp(2.5rem, 6vw, 4.5rem)', marginBottom: '1.5rem', filter: 'drop-shadow(0 0 28px rgba(147,51,234,0.75))' }} />
      <div className="ps-up ps-d1" style={badge('#a78bfa', 'rgba(139,92,246,0.15)', 'rgba(139,92,246,0.3)')}>
        Taller · Apoyo Social · Gratuito
      </div>
      <h2 className="ps-up ps-d2" style={{ ...T('clamp(3rem, 9vw, 7rem)', 900), margin: '1rem 0 0.5rem' }}>
        ¡Gracias!
      </h2>
      <p className="ps-up ps-d3" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(1rem, 2.2vw, 1.3rem)', fontStyle: 'italic', marginBottom: '1.8rem', textAlign: 'center' }}>
        "Cada número que entiendes hoy<br />es una decisión que tomarás bien mañana."
      </p>
      <div className="ps-up ps-d4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{ ...panel('rgba(255,255,255,0.1)', 'rgba(255,255,255,0.04)'), display: 'flex', gap: 28, flexWrap: 'wrap', justifyContent: 'center', padding: '14px 28px' }}>
          {[['info@kontaxes.com'], ['+502 3517-4713'], ['kontaxes.com']].map(([val]) => (
            <span key={val} style={{ color: 'rgba(255,255,255,0.55)', fontSize: 'clamp(0.9rem, 1.9vw, 1.1rem)' }}>{val}</span>
          ))}
        </div>
      </div>
      <div className="ps-up ps-d5" style={{ marginTop: '1.8rem' }}>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 'clamp(1rem, 2vw, 1.2rem)' }}>
          ¿Preguntas?
        </span>
      </div>
    </div>
  </div>
);

/* ─── Export ────────────────────────────────────────────────────────────── */

export const PequenioContribuyenteSlides: React.FC[] = [
  Slide01Cover,
  Slide02Agenda,
  Slide03S1,
  Slide04Definicion,
  Slide05Comparacion,
  Slide06S2,
  Slide07Limite,
  Slide08S3,
  Slide09Leyes,
  Slide10S4,
  Slide11Formula,
  Slide12Ejemplo,
  Slide13S5,
  Slide14Pasos,
  Slide15S6,
  Slide16Libros,
  Slide17S7,
  Slide18Sanciones,
  Slide19EjemploMulta,
  Slide20S8,
  Slide21AgenciaVirtual,
  Slide22Resumen,
  Slide23CasoPractico,
  Slide24Cierre,
];

export const presentationMeta = {
  id: 'pequeno-contribuyente',
  title: 'Pequeño Contribuyente — Declaración de IVA',
  subtitle: 'Apoyo Social · Colegios e Institutos',
  totalSlides: PequenioContribuyenteSlides.length,
  duration: '1h 30min',
};
