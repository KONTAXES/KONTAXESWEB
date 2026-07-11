import React from 'react';

/* ─── Shared style helpers ──────────────────────────────────────────────── */

const SG: React.CSSProperties = { fontFamily: "'Space Grotesk', sans-serif" };

const SLIDE_BG: React.CSSProperties = {
  width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
  background: '#07030f', display: 'flex', flexDirection: 'column',
  padding: 'clamp(1.5rem, 4vw, 3.5rem)',
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
  padding: '4px 12px', borderRadius: 999,
  background: bg, border: `1px solid ${border}`,
  color, fontSize: 10, fontWeight: 700, letterSpacing: '1.8px',
  textTransform: 'uppercase' as const,
});

const panel = (border: string, bg: string): React.CSSProperties => ({
  borderRadius: 12, border: `1px solid ${border}`,
  background: bg, padding: 'clamp(0.8rem, 2vw, 1.2rem)',
});

const accentBar: React.CSSProperties = {
  width: 4, borderRadius: 2, flexShrink: 0,
  background: 'linear-gradient(180deg, #9333ea, #10b981)',
  alignSelf: 'stretch',
};

function T(size: string, w = 800): React.CSSProperties {
  return { ...SG, fontSize: size, fontWeight: w, lineHeight: 1.15, color: '#fff' };
}

function BulletList({ items, color = '#c084fc' }: { items: string[]; color?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item, i) => (
        <div key={i} className={`ps-up ps-d${Math.min(i + 2, 9)}`}
          style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <span style={{ color, fontSize: 16, lineHeight: 1.6, flexShrink: 0 }}>✦</span>
          <span style={{ color: '#cbd5e1', fontSize: 'clamp(0.82rem, 1.7vw, 1rem)', lineHeight: 1.6 }}>
            {item}
          </span>
        </div>
      ))}
    </div>
  );
}

function NumberedList({ items, color = '#9333ea' }: { items: string[]; color?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((item, i) => (
        <div key={i} className={`ps-up ps-d${Math.min(i + 2, 9)}`}
          style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <span style={{
            color: '#fff', background: color, borderRadius: 6,
            width: 24, height: 24, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, marginTop: 1,
          }}>{i + 1}</span>
          <span style={{ color: '#cbd5e1', fontSize: 'clamp(0.82rem, 1.7vw, 1rem)', lineHeight: 1.6 }}>
            {item}
          </span>
        </div>
      ))}
    </div>
  );
}

function SlideTitle({ children, delay = '' }: { children: React.ReactNode; delay?: string }) {
  return (
    <div className={`ps-up ${delay}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 'clamp(1rem, 2.5vw, 2rem)' }}>
      <div style={accentBar} />
      <h2 style={{ ...T('clamp(1.4rem, 3.2vw, 2.4rem)'), lineHeight: 1.2, color: '#f1f5f9' }}>
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
          <h2 className="ps-up ps-d2" style={{ ...T('clamp(2.2rem, 7vw, 5rem)'), marginTop: '1rem', textWrap: 'balance' } as React.CSSProperties}>
            {title}
          </h2>
          {subtitle && (
            <p className="ps-up ps-d3" style={{ color: 'rgba(255,255,255,0.45)', fontSize: 'clamp(0.9rem, 2vw, 1.15rem)', marginTop: '0.75rem' }}>
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
    {/* decorative circles */}
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
        ...T('clamp(2rem, 6.5vw, 5rem)', 900), margin: 'clamp(1rem, 2.5vw, 1.5rem) 0 clamp(0.5rem, 1.5vw, 1rem)',
        textWrap: 'balance' as 'balance',
      }}>
        Declaración de Impuestos:
        <br />
        <span style={{ background: 'linear-gradient(90deg, #c084fc, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Pequeño Contribuyente
        </span>
      </h1>
      <div className="ps-up ps-d3" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'clamp(0.75rem, 2vw, 1.5rem)', marginTop: '1rem', color: 'rgba(255,255,255,0.45)', fontSize: 'clamp(0.75rem, 1.5vw, 0.9rem)', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.2rem' }}>
        <span>⏱&nbsp;1 hora exposición</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
        <span>🧩&nbsp;30 min caso práctico</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
        <span>📚&nbsp;Taller gratuito</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
        <span>📍&nbsp;Guatemala</span>
      </div>
    </div>
  </div>
);

/* ─── Slide 02 · Agenda ─────────────────────────────────────────────────── */

const Slide02Agenda: React.FC = () => {
  const topics = [
    ['01', 'Generalidades', 'Qué es y para quién aplica este régimen'],
    ['02', 'Límite de facturación', 'El tope anual de Q500,000'],
    ['03', 'Marco legal', 'Leyes y reglamentos que lo rigen'],
    ['04', 'Cálculo de impuestos', 'La fórmula del 5% con ejemplos'],
    ['05', 'Formulario SAT-2046', 'Paso a paso para declarar'],
    ['06', 'Libros contables', 'Excel y LET — Libro Electrónico Tributario'],
    ['07', 'Omisos y rectificaciones', 'Multas, intereses y mora'],
    ['08', 'Agencia Virtual', 'Cómo buscar formularios generados y pagados'],
  ];
  return (
    <div style={SLIDE_BG}>
      <SlideTitle>Agenda del taller</SlideTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(240px, 40%, 380px), 1fr))', gap: 10, flex: 1 }}>
        {topics.map(([num, title, desc], i) => (
          <div key={num} className={`ps-up ps-d${Math.min(i + 1, 9)}`}
            style={{ ...panel('rgba(255,255,255,0.07)', 'rgba(255,255,255,0.03)'), display: 'flex', gap: 12 }}>
            <span style={{ ...SG, fontSize: 'clamp(1.1rem, 2.5vw, 1.6rem)', fontWeight: 900, color: 'rgba(147,51,234,0.45)', flexShrink: 0, lineHeight: 1 }}>
              {num}
            </span>
            <div>
              <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 'clamp(0.78rem, 1.5vw, 0.92rem)' }}>{title}</div>
              <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 'clamp(0.7rem, 1.3vw, 0.8rem)', marginTop: 3 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="ps-up ps-d9" style={{ marginTop: 14, ...panel('rgba(16,185,129,0.3)', 'rgba(16,185,129,0.07)'), display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 20 }}>🧩</span>
        <span style={{ color: '#6ee7b7', fontWeight: 700, fontSize: 'clamp(0.8rem, 1.6vw, 0.95rem)' }}>
          30 minutos finales — Caso práctico y preguntas
        </span>
      </div>
    </div>
  );
};

/* ─── Slide 03 — Section 01 Generalidades ───────────────────────────────── */
const Slide03S1 = makeSectionSlide('01', 'Generalidades', 'El régimen simplificado del IVA en Guatemala');

/* ─── Slide 04 · ¿Qué es Pequeño Contribuyente? ──────────────────────── */
const Slide04Definicion: React.FC = () => (
  <div style={SLIDE_BG}>
    <SlideTitle>¿Qué es el Pequeño Contribuyente?</SlideTitle>
    <div className="ps-up ps-d1" style={{ ...panel('rgba(147,51,234,0.35)', 'rgba(147,51,234,0.1)'), marginBottom: 'clamp(0.8rem, 2vw, 1.5rem)', borderLeft: '4px solid #9333ea', borderRadius: '0 10px 10px 0' }}>
      <p style={{ color: '#e2e8f0', fontSize: 'clamp(0.88rem, 1.8vw, 1.05rem)', lineHeight: 1.7 }}>
        Es un <strong style={{ color: '#c084fc' }}>régimen tributario simplificado del IVA</strong> dirigido a personas individuales o jurídicas con ingresos bajos, que sustituye el sistema general de débito/crédito fiscal por una tasa fija.
      </p>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(200px, 45%, 320px), 1fr))', gap: 10 }}>
      {[
        ['💜', '#c084fc', 'Tasa fija del 5%', 'Sobre el total facturado mensual, sin créditos ni deducciones'],
        ['📋', '#6ee7b7', 'Declaración mensual', 'Formulario SAT-2046 entre los días 1 y 10 de cada mes'],
        ['🚫', '#fbbf24', 'Sin crédito fiscal', 'No se restan las compras ni gastos del período'],
        ['📱', '#60a5fa', 'Factura electrónica', 'Obligatorio emitir facturas FEL por cada venta'],
        ['🏢', '#f87171', 'Límite de ingresos', 'No más de Q 500,000 anuales de facturación'],
        ['✅', '#86efac', 'Proceso sencillo', 'Ideal para pequeños negocios, emprendedores y comerciantes'],
      ].map(([icon, color, title, desc], i) => (
        <div key={i} className={`ps-up ps-d${Math.min(i + 2, 9)}`}
          style={{ ...panel('rgba(255,255,255,0.07)', 'rgba(255,255,255,0.025)'), display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', lineHeight: 1 }}>{icon}</span>
          <div>
            <div style={{ color, fontWeight: 700, fontSize: 'clamp(0.78rem, 1.5vw, 0.9rem)', marginBottom: 2 }}>{title}</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 'clamp(0.7rem, 1.3vw, 0.78rem)', lineHeight: 1.5 }}>{desc}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ─── Slide 05 · Comparación de regímenes ───────────────────────────────── */
const Slide05Comparacion: React.FC = () => {
  const rows = [
    ['Tasa del impuesto',   '5% sobre ventas brutas',            'Diferencia débito − crédito (12%)'],
    ['Crédito fiscal',      'No aplica',                         'Sí, por compras y gastos con factura'],
    ['Declaración',         'Mensual · Form. 2046',              'Mensual · Form. 2237 (ISR y otros)'],
    ['Límite de ingresos',  'Q 500,000 anuales',                 'Sin límite'],
    ['Complejidad',         '⭐ Baja',                           '⭐⭐⭐ Media - Alta'],
    ['Ideal para',          'Micro y pequeños negocios',         'Negocios medianos y grandes'],
  ];
  return (
    <div style={SLIDE_BG}>
      <SlideTitle>Comparación: ¿cuándo conviene?</SlideTitle>
      <div className="ps-up ps-d1" style={{ flex: 1, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'clamp(0.72rem, 1.5vw, 0.88rem)' }}>
          <thead>
            <tr style={{ background: 'linear-gradient(90deg, #6d28d9, #5b21b6)' }}>
              <th style={{ padding: '10px 14px', textAlign: 'left', color: '#fff', fontWeight: 700, fontSize: 'clamp(0.7rem, 1.4vw, 0.82rem)', letterSpacing: 1 }}>ASPECTO</th>
              <th style={{ padding: '10px 14px', textAlign: 'left', color: '#c084fc', fontWeight: 700, fontSize: 'clamp(0.7rem, 1.4vw, 0.82rem)', letterSpacing: 1 }}>PEQUEÑO CONTRIBUYENTE</th>
              <th style={{ padding: '10px 14px', textAlign: 'left', color: '#93c5fd', fontWeight: 700, fontSize: 'clamp(0.7rem, 1.4vw, 0.82rem)', letterSpacing: 1 }}>RÉGIMEN GENERAL / OPCIONAL</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([asp, pc, rg], i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.025)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <td style={{ padding: '10px 14px', color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>{asp}</td>
                <td style={{ padding: '10px 14px', color: '#c084fc', fontWeight: 600 }}>{pc}</td>
                <td style={{ padding: '10px 14px', color: '#93c5fd' }}>{rg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="ps-up ps-d8" style={{ marginTop: 12, ...panel('rgba(16,185,129,0.3)', 'rgba(16,185,129,0.07)') }}>
        <p style={{ color: '#6ee7b7', fontSize: 'clamp(0.78rem, 1.5vw, 0.88rem)', fontWeight: 600 }}>
          💡 El Pequeño Contribuyente es la puerta de entrada al sistema tributario formal en Guatemala.
        </p>
      </div>
    </div>
  );
};

/* ─── Slide 06 — Section 02 Límite ─────────────────────────────────────── */
const Slide06S2 = makeSectionSlide('02', 'Límite de Facturación', 'El tope que define el régimen');

/* ─── Slide 07 · El Límite Q500,000 ──────────────────────────────────── */
const Slide07Limite: React.FC = () => (
  <div style={SLIDE_BG}>
    <SlideTitle>El tope anual de facturación</SlideTitle>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="ps-up ps-d1" style={{ textAlign: 'center', padding: 'clamp(1rem, 3vw, 2rem)', borderRadius: 16, background: 'linear-gradient(135deg, rgba(147,51,234,0.18), rgba(109,40,217,0.1))', border: '1px solid rgba(147,51,234,0.35)' }}>
        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
          Límite máximo de ingresos anuales
        </div>
        <div style={{ ...SG, fontSize: 'clamp(3rem, 10vw, 7rem)', fontWeight: 900, color: '#c084fc', lineHeight: 1 }}>
          Q 500,000
        </div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 'clamp(0.78rem, 1.5vw, 0.88rem)', marginTop: 10 }}>
          ≈ Q 41,667 promedio mensual · Decreto 27-92 Art. 47
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="ps-up ps-d2" style={{ ...panel('rgba(16,185,129,0.3)', 'rgba(16,185,129,0.07)') }}>
          <div style={{ color: '#6ee7b7', fontWeight: 700, fontSize: 'clamp(0.78rem, 1.5vw, 0.88rem)', marginBottom: 8 }}>✅ Si mantienes el límite</div>
          <BulletList color="#6ee7b7" items={['Continúas declarando el 5% mensual', 'Proceso simple y predecible', 'Sin cambios en tu registro SAT']} />
        </div>
        <div className="ps-up ps-d3" style={{ ...panel('rgba(239,68,68,0.3)', 'rgba(239,68,68,0.07)') }}>
          <div style={{ color: '#fca5a5', fontWeight: 700, fontSize: 'clamp(0.78rem, 1.5vw, 0.88rem)', marginBottom: 8 }}>⚠️ Si superas Q 500,000</div>
          <BulletList color="#fca5a5" items={['Debes cambiar al régimen general', 'Notifica a SAT de inmediato', 'El cambio aplica desde ese período']} />
        </div>
      </div>
      <div className="ps-up ps-d5" style={{ ...panel('rgba(245,158,11,0.3)', 'rgba(245,158,11,0.07)'), display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 22 }}>📊</span>
        <span style={{ color: '#fcd34d', fontSize: 'clamp(0.78rem, 1.5vw, 0.88rem)' }}>
          <strong>Ejemplo:</strong> Si facturas Q 45,000 mensuales, en 11 meses llegarías a Q 495,000 — muy cerca del límite. En el mes 12 lo superas. ¡Monitorea tus ventas acumuladas!
        </span>
      </div>
    </div>
  </div>
);

/* ─── Slide 08 — Section 03 Marco Legal ────────────────────────────────── */
const Slide08S3 = makeSectionSlide('03', 'Marco Legal', 'Las leyes y reglamentos que rigen el régimen');

/* ─── Slide 09 · Leyes y Reglamentos ───────────────────────────────────── */
const Slide09Leyes: React.FC = () => {
  const leyes = [
    {
      color: '#c084fc', border: 'rgba(192,132,252,0.3)', bg: 'rgba(192,132,252,0.07)',
      titulo: 'Decreto 27-92 — Ley del IVA',
      desc: 'Ley principal del Impuesto al Valor Agregado. Los Artículos 47 y 48 establecen el Régimen de Pequeño Contribuyente, la tasa del 5% y los requisitos para inscribirse.',
    },
    {
      color: '#60a5fa', border: 'rgba(96,165,250,0.3)', bg: 'rgba(96,165,250,0.07)',
      titulo: 'Decreto 10-2012 — Ley de Actualización Tributaria',
      desc: 'Reforma fiscal que moderniza el sistema impositivo. Complementa y actualiza la Ley del IVA, definiendo tasas, procedimientos y plazos vigentes.',
    },
    {
      color: '#6ee7b7', border: 'rgba(110,231,183,0.3)', bg: 'rgba(110,231,183,0.07)',
      titulo: 'Reglamento de la Ley del IVA',
      desc: 'Detalla los procedimientos operativos: formularios, plazos, formas de pago, libros requeridos y el proceso de declaración mensual.',
    },
    {
      color: '#fbbf24', border: 'rgba(251,191,36,0.3)', bg: 'rgba(251,191,36,0.07)',
      titulo: 'Resoluciones SAT vigentes',
      desc: 'La Superintendencia de Administración Tributaria emite resoluciones que actualizan límites, procedimientos y requerimientos técnicos del régimen.',
    },
  ];
  return (
    <div style={SLIDE_BG}>
      <SlideTitle>Base legal del régimen</SlideTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(220px, 45%, 380px), 1fr))', gap: 12 }}>
        {leyes.map((l, i) => (
          <div key={i} className={`ps-up ps-d${i + 1}`}
            style={{ ...panel(l.border, l.bg), borderLeft: `4px solid ${l.color}`, borderRadius: '0 10px 10px 0' }}>
            <div style={{ color: l.color, fontWeight: 700, fontSize: 'clamp(0.78rem, 1.5vw, 0.9rem)', marginBottom: 6 }}>
              📜 {l.titulo}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 'clamp(0.7rem, 1.3vw, 0.8rem)', lineHeight: 1.6, margin: 0 }}>
              {l.desc}
            </p>
          </div>
        ))}
      </div>
      <div className="ps-up ps-d6" style={{ marginTop: 14, ...panel('rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)'), display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 18 }}>⚖️</span>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 'clamp(0.7rem, 1.4vw, 0.82rem)', margin: 0 }}>
          <strong style={{ color: 'rgba(255,255,255,0.65)' }}>Constitución (Art. 135 lit. d):</strong> El deber constitucional de contribuir a los gastos del Estado es la base de toda obligación tributaria en Guatemala.
        </p>
      </div>
    </div>
  );
};

/* ─── Slide 10 — Section 04 Cálculo ────────────────────────────────────── */
const Slide10S4 = makeSectionSlide('04', 'Cálculo del Impuesto', 'La fórmula del 5% aplicada al negocio');

/* ─── Slide 11 · La Fórmula ────────────────────────────────────────────── */
const Slide11Formula: React.FC = () => (
  <div style={SLIDE_BG}>
    <SlideTitle>¿Cómo se calcula el IVA?</SlideTitle>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="ps-up ps-d1" style={{ textAlign: 'center', padding: 'clamp(1.2rem, 3vw, 2rem)', borderRadius: 16, background: 'rgba(147,51,234,0.12)', border: '1px solid rgba(147,51,234,0.35)' }}>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 'clamp(0.72rem, 1.4vw, 0.82rem)', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
          Fórmula del impuesto
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(0.5rem, 2vw, 1.5rem)', flexWrap: 'wrap' }}>
          <span style={{ ...SG, fontSize: 'clamp(1.5rem, 4vw, 3rem)', fontWeight: 900, color: '#c084fc' }}>IVA</span>
          <span style={{ ...SG, fontSize: 'clamp(1.5rem, 4vw, 3rem)', fontWeight: 300, color: 'rgba(255,255,255,0.4)' }}>=</span>
          <span style={{ ...SG, fontSize: 'clamp(1.5rem, 4vw, 3rem)', fontWeight: 700, color: '#e2e8f0' }}>Total Ventas del Mes</span>
          <span style={{ ...SG, fontSize: 'clamp(1.5rem, 4vw, 3rem)', fontWeight: 300, color: 'rgba(255,255,255,0.4)' }}>×</span>
          <span style={{ ...SG, fontSize: 'clamp(1.5rem, 4vw, 3rem)', fontWeight: 900, color: '#10b981' }}>5%</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="ps-up ps-d2" style={{ ...panel('rgba(239,68,68,0.3)', 'rgba(239,68,68,0.06)') }}>
          <div style={{ color: '#fca5a5', fontWeight: 700, fontSize: 'clamp(0.78rem, 1.5vw, 0.88rem)', marginBottom: 8 }}>🚫 NO se incluye / descuenta</div>
          <BulletList color="#fca5a5" items={['Crédito fiscal de compras', 'Gastos operativos del mes', 'Costo de ventas', 'Devoluciones (declarar por separado)']} />
        </div>
        <div className="ps-up ps-d3" style={{ ...panel('rgba(16,185,129,0.3)', 'rgba(16,185,129,0.06)') }}>
          <div style={{ color: '#6ee7b7', fontWeight: 700, fontSize: 'clamp(0.78rem, 1.5vw, 0.88rem)', marginBottom: 8 }}>✅ SÍ se declara</div>
          <BulletList color="#6ee7b7" items={['Todas las ventas del mes', 'Ingresos por servicios prestados', 'Ventas al contado y al crédito', 'Total emitido en facturas FEL']} />
        </div>
      </div>
      <div className="ps-up ps-d5" style={{ ...panel('rgba(245,158,11,0.3)', 'rgba(245,158,11,0.07)'), display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 20 }}>📅</span>
        <span style={{ color: '#fcd34d', fontSize: 'clamp(0.78rem, 1.5vw, 0.88rem)' }}>
          <strong>Plazo de pago:</strong> Del día 1 al 10 del mes siguiente al período declarado. Ejemplo: el IVA de octubre se paga entre el 1 y el 10 de noviembre.
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
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'clamp(0.72rem, 1.5vw, 0.88rem)' }}>
          <thead>
            <tr style={{ background: 'linear-gradient(90deg, #6d28d9, #5b21b6)' }}>
              {['# Factura', 'Fecha', 'Descripción', 'Monto'].map(h => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#fff', fontWeight: 700, fontSize: 'clamp(0.68rem, 1.3vw, 0.8rem)', letterSpacing: 0.8 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map(([num, fecha, desc, monto], i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: i % 2 === 0 ? 'rgba(255,255,255,0.025)' : 'transparent' }}>
                <td style={{ padding: '8px 12px', color: '#c084fc', fontWeight: 700 }}>{num}</td>
                <td style={{ padding: '8px 12px', color: 'rgba(255,255,255,0.55)' }}>{fecha}</td>
                <td style={{ padding: '8px 12px', color: '#e2e8f0' }}>{desc}</td>
                <td style={{ padding: '8px 12px', color: '#e2e8f0', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{monto}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {[
          ['Total facturado', 'Q 13,150.00', '#e2e8f0', 'rgba(255,255,255,0.08)'],
          ['Tasa aplicable', '× 5%', '#fbbf24', 'rgba(245,158,11,0.1)'],
          ['IVA A PAGAR', 'Q 657.50', '#10b981', 'rgba(16,185,129,0.12)'],
        ].map(([label, value, color, bg], i) => (
          <div key={i} className={`ps-up ps-d${i + 3}`}
            style={{ ...panel(`${color}4d`, bg), textAlign: 'center' }}>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 'clamp(0.65rem, 1.3vw, 0.75rem)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
            <div style={{ ...SG, fontSize: 'clamp(1.3rem, 3.5vw, 2.5rem)', fontWeight: 900, color }}>{value}</div>
          </div>
        ))}
      </div>
      <div className="ps-up ps-d7" style={{ marginTop: 14, ...panel('rgba(147,51,234,0.25)', 'rgba(147,51,234,0.06)') }}>
        <p style={{ color: '#c084fc', fontSize: 'clamp(0.75rem, 1.4vw, 0.85rem)', margin: 0 }}>
          📌 <strong>Este IVA debe pagarse entre el 1 y el 10 de noviembre.</strong> La constancia de pago es tu comprobante de cumplimiento fiscal.
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
    <SlideTitle>Cómo declarar paso a paso</SlideTitle>
    <NumberedList items={[
      'Accede al portal en portal.sat.gob.gt → ingresa con tu NIT y contraseña de Agencia Virtual.',
      'Selecciona "Declaraciones en línea" → "Declaración de IVA Pequeño Contribuyente" → Formulario SAT-2046.',
      'Ingresa el período fiscal (mes y año) y el total de ventas brutas del mes.',
      'El sistema calcula automáticamente el 5% — verifica el monto y genera el formulario.',
      'Descarga o anota el número de acceso del formulario generado.',
      'Realiza el pago: BancaSAT, ventanilla bancaria habilitada o en línea. Guarda la constancia.',
    ]} />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 14 }}>
      {[
        ['🗓️', '#fbbf24', 'Plazo', 'Días 1 al 10 del mes siguiente'],
        ['🏦', '#60a5fa', 'Pago', 'BancaSAT · Bancos habilitados'],
        ['📄', '#c084fc', 'Constancia', 'Guárdala siempre como respaldo'],
      ].map(([icon, color, label, desc], i) => (
        <div key={i} className={`ps-up ps-d${i + 7}`}
          style={{ ...panel('rgba(255,255,255,0.07)', 'rgba(255,255,255,0.03)'), textAlign: 'center' }}>
          <div style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)' }}>{icon}</div>
          <div style={{ color, fontWeight: 700, fontSize: 'clamp(0.75rem, 1.4vw, 0.85rem)', marginTop: 6 }}>{label}</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 'clamp(0.65rem, 1.3vw, 0.75rem)', marginTop: 4 }}>{desc}</div>
        </div>
      ))}
    </div>
  </div>
);

/* ─── Slide 15 — Section 06 Libros ─────────────────────────────────────── */
const Slide15S6 = makeSectionSlide('06', 'Libros Contables', 'Registro de ventas y LET mensual');

/* ─── Slide 16 · Libros ─────────────────────────────────────────────────── */
const Slide16Libros: React.FC = () => (
  <div style={SLIDE_BG}>
    <SlideTitle>Libro de Ventas y Libro Electrónico Tributario</SlideTitle>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, flex: 1 }}>
      <div className="ps-up ps-d1" style={{ ...panel('rgba(16,185,129,0.35)', 'rgba(16,185,129,0.07)'), display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ color: '#6ee7b7', fontWeight: 700, fontSize: 'clamp(0.85rem, 1.7vw, 1rem)' }}>
          📊 Libro de Ventas (Excel)
        </div>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(0.7rem, 1.3vw, 0.8rem)', margin: 0 }}>
          Registro manual mensual de todas las ventas realizadas.
        </p>
        <div style={{ borderTop: '1px solid rgba(16,185,129,0.2)', paddingTop: 12 }}>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: 'clamp(0.68rem, 1.3vw, 0.78rem)', marginBottom: 6 }}>Columnas requeridas:</div>
          <BulletList color="#6ee7b7" items={['Correlativo', 'Fecha de emisión', 'Número de factura (FEL)', 'Nombre / NIT del cliente', 'Monto total de la factura']} />
        </div>
        <div style={{ ...panel('rgba(16,185,129,0.15)', 'transparent'), marginTop: 'auto' }}>
          <p style={{ color: '#6ee7b7', fontSize: 'clamp(0.68rem, 1.3vw, 0.78rem)', margin: 0 }}>
            ✅ Se puede llevar en Excel o en el sistema contable que uses.
          </p>
        </div>
      </div>
      <div className="ps-up ps-d2" style={{ ...panel('rgba(147,51,234,0.35)', 'rgba(147,51,234,0.07)'), display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ color: '#c084fc', fontWeight: 700, fontSize: 'clamp(0.85rem, 1.7vw, 1rem)' }}>
          🌐 LET — Libro Electrónico Tributario
        </div>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(0.7rem, 1.3vw, 0.8rem)', margin: 0 }}>
          Versión oficial digital del libro de ventas, enviada a SAT mensualmente.
        </p>
        <div style={{ borderTop: '1px solid rgba(147,51,234,0.2)', paddingTop: 12 }}>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: 'clamp(0.68rem, 1.3vw, 0.78rem)', marginBottom: 6 }}>Características:</div>
          <BulletList color="#c084fc" items={['Formato estándar definido por SAT', 'Se carga en la Agencia Virtual', 'Se presenta junto con la declaración', 'Reemplaza el libro físico de ventas', 'Obligatorio para todos los Pequeños Contribuyentes']} />
        </div>
      </div>
    </div>
    <div className="ps-up ps-d5" style={{ marginTop: 14, ...panel('rgba(245,158,11,0.3)', 'rgba(245,158,11,0.07)') }}>
      <p style={{ color: '#fcd34d', fontSize: 'clamp(0.75rem, 1.4vw, 0.85rem)', margin: 0 }}>
        ⚠️ <strong>¡Importante!</strong> No llevar el LET correctamente puede generar sanciones administrativas adicionales, aunque hayas pagado el impuesto a tiempo.
      </p>
    </div>
  </div>
);

/* ─── Slide 17 — Section 07 Omisos ─────────────────────────────────────── */
const Slide17S7 = makeSectionSlide('07', 'Omisos y Rectificaciones', '¿Qué pasa cuando no se declara correctamente?');

/* ─── Slide 18 · Multas e Intereses ────────────────────────────────────── */
const Slide18Sanciones: React.FC = () => (
  <div style={SLIDE_BG}>
    <SlideTitle>Consecuencias de no declarar a tiempo</SlideTitle>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="ps-up ps-d1" style={{ ...panel('rgba(239,68,68,0.3)', 'rgba(239,68,68,0.06)'), borderLeft: '4px solid #ef4444', borderRadius: '0 10px 10px 0' }}>
        <p style={{ color: '#fca5a5', fontWeight: 700, fontSize: 'clamp(0.78rem, 1.5vw, 0.9rem)', margin: '0 0 4px' }}>
          🔴 OMISO — Contribuyente que no presenta la declaración en el plazo legal
        </p>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 'clamp(0.7rem, 1.3vw, 0.8rem)', margin: 0 }}>
          Cada mes que no declaras acumula cargos. SAT puede emitir resolución de ajuste y ejecutar acciones de cobro.
        </p>
      </div>
      <div className="ps-up ps-d2" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'clamp(0.72rem, 1.5vw, 0.88rem)' }}>
          <thead>
            <tr style={{ background: 'linear-gradient(90deg, #991b1b, #7f1d1d)' }}>
              {['Cargo', 'Cálculo', 'Base legal'].map(h => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#fca5a5', fontWeight: 700, fontSize: 'clamp(0.68rem, 1.3vw, 0.78rem)', letterSpacing: 0.8 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['Multa', 'El mayor entre Q 1,000 o el 2% del impuesto omitido', 'Art. 94 Cód. Tributario'],
              ['Interés resarcitorio', '15% anual sobre el impuesto no pagado (compuesto mensualmente)', 'Art. 58 Cód. Tributario'],
              ['Mora / Recargo', 'Adicional por cada mes de retraso según tabla SAT vigente', 'Art. 92 Cód. Tributario'],
            ].map(([cargo, calc, base], i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: i % 2 === 0 ? 'rgba(255,255,255,0.025)' : 'transparent' }}>
                <td style={{ padding: '8px 12px', color: '#fca5a5', fontWeight: 700 }}>{cargo}</td>
                <td style={{ padding: '8px 12px', color: '#e2e8f0' }}>{calc}</td>
                <td style={{ padding: '8px 12px', color: 'rgba(255,255,255,0.4)', fontSize: 'clamp(0.65rem, 1.2vw, 0.75rem)' }}>{base}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="ps-up ps-d5" style={{ ...panel('rgba(245,158,11,0.3)', 'rgba(245,158,11,0.07)') }}>
        <p style={{ color: '#fcd34d', fontWeight: 700, fontSize: 'clamp(0.78rem, 1.5vw, 0.88rem)', margin: '0 0 6px' }}>📋 Rectificación</p>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 'clamp(0.7rem, 1.3vw, 0.8rem)', margin: 0 }}>
          Si declaraste con datos incorrectos, puedes presentar una declaración rectificativa. Sin embargo, igual generarás intereses sobre la diferencia no pagada y posiblemente multa.
          <strong style={{ color: '#fcd34d' }}> Mejor declarar correcto desde el inicio.</strong>
        </p>
      </div>
    </div>
  </div>
);

/* ─── Slide 19 · Ejemplo con Multas ────────────────────────────────────── */
const Slide19EjemploMulta: React.FC = () => (
  <div style={SLIDE_BG}>
    <SlideTitle>Ejemplo: costo de no declarar</SlideTitle>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="ps-up ps-d1" style={{ ...panel('rgba(255,255,255,0.07)', 'rgba(255,255,255,0.03)') }}>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'clamp(0.78rem, 1.5vw, 0.88rem)', margin: 0 }}>
          📌 <strong style={{ color: '#e2e8f0' }}>Situación:</strong> El contribuyente no declaró el IVA del mes de agosto (ventas: Q 8,000) y lo paga 2 meses tarde.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="ps-up ps-d2" style={{ ...panel('rgba(147,51,234,0.3)', 'rgba(147,51,234,0.07)') }}>
          <div style={{ color: '#c084fc', fontWeight: 700, fontSize: 'clamp(0.78rem, 1.5vw, 0.88rem)', marginBottom: 10 }}>📊 Cálculo del impuesto</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 'clamp(0.72rem, 1.4vw, 0.85rem)', fontVariantNumeric: 'tabular-nums' }}>
            {[
              ['Ventas del mes', 'Q 8,000.00', '#e2e8f0'],
              ['IVA (5%)', 'Q 400.00', '#c084fc'],
            ].map(([label, val, color]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', color }}>
                <span style={{ color: 'rgba(255,255,255,0.55)' }}>{label}</span>
                <span style={{ fontWeight: 700 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="ps-up ps-d3" style={{ ...panel('rgba(239,68,68,0.3)', 'rgba(239,68,68,0.07)') }}>
          <div style={{ color: '#fca5a5', fontWeight: 700, fontSize: 'clamp(0.78rem, 1.5vw, 0.88rem)', marginBottom: 10 }}>⚠️ Cargos por pagar tarde</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 'clamp(0.72rem, 1.4vw, 0.85rem)', fontVariantNumeric: 'tabular-nums' }}>
            {[
              ['Multa (MIN Q1,000)', 'Q 1,000.00', '#fca5a5'],
              ['Interés (2 meses)', '~Q 10.00', '#f87171'],
              ['Recargo mora', '~Q 15.00', '#f87171'],
            ].map(([label, val, color]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'rgba(255,255,255,0.55)' }}>{label}</span>
                <span style={{ color, fontWeight: 700 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="ps-up ps-d5" style={{ ...panel('rgba(239,68,68,0.5)', 'rgba(239,68,68,0.1)'), textAlign: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(0.7rem, 1.4vw, 0.8rem)', marginBottom: 8 }}>TOTAL A PAGAR (impuesto + cargos)</div>
        <div style={{ ...SG, fontSize: 'clamp(2rem, 6vw, 4rem)', fontWeight: 900, color: '#fca5a5' }}>Q 1,425.00</div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 'clamp(0.68rem, 1.3vw, 0.78rem)', marginTop: 8 }}>
          vs. Q 400.00 si hubieras pagado a tiempo → <strong style={{ color: '#fca5a5' }}>3.5× más caro</strong>
        </div>
      </div>
    </div>
  </div>
);

/* ─── Slide 20 — Section 08 Agencia Virtual ────────────────────────────── */
const Slide20S8 = makeSectionSlide('08', 'Agencia Virtual SAT', 'Cómo consultar tus formularios pagados');

/* ─── Slide 21 · Agencia Virtual — Cómo buscar ──────────────────────────── */
const Slide21AgenciaVirtual: React.FC = () => (
  <div style={SLIDE_BG}>
    <SlideTitle>Cómo encontrar tus formularios en SAT</SlideTitle>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(200px, 45%, 380px), 1fr))', gap: 12 }}>
      {[
        ['🌐', '#60a5fa', 'Accede', 'Ingresa a portal.sat.gob.gt → Agencia Virtual → autentícate con NIT y contraseña.'],
        ['📋', '#c084fc', 'Mis declaraciones', 'En el menú principal selecciona "Declaraciones" → "Consultar declaraciones presentadas".'],
        ['🔍', '#6ee7b7', 'Filtra por período', 'Usa los filtros de tipo de impuesto (IVA) y período fiscal (mes/año) para localizar rápidamente.'],
        ['📊', '#fbbf24', 'Estados del formulario', 'GENERADO = llenado sin pagar · PAGADO = correcto · OMISO = sin presentar.'],
        ['💾', '#a78bfa', 'Descarga tu constancia', '"Imprimir" o "Descargar PDF" en el formulario PAGADO. Esta es tu prueba oficial de cumplimiento.'],
        ['📞', '#f87171', 'Si hay errores', 'Llama a SAT: 1544 o visita el Módulo del Contribuyente. Nunca elimines ni modifiques los archivos descargados.'],
      ].map(([icon, color, title, desc], i) => (
        <div key={i} className={`ps-up ps-d${Math.min(i + 1, 9)}`}
          style={{ ...panel('rgba(255,255,255,0.07)', 'rgba(255,255,255,0.025)'), display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', flexShrink: 0, lineHeight: 1 }}>{icon}</span>
          <div>
            <div style={{ color, fontWeight: 700, fontSize: 'clamp(0.78rem, 1.5vw, 0.9rem)', marginBottom: 4 }}>{title}</div>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 'clamp(0.68rem, 1.3vw, 0.78rem)', lineHeight: 1.5, margin: 0 }}>{desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ─── Slide 22 · Resumen General ──────────────────────────────────────── */
const Slide22Resumen: React.FC = () => {
  const puntos = [
    ['💜', '#c084fc', 'Régimen simplificado', 'Solo pagas el 5% del total facturado. Sin crédito fiscal, sin deducciones.'],
    ['📊', '#60a5fa', 'Límite Q 500,000', 'Si superas este monto anual, debes cambiarte al régimen general.'],
    ['⚖️', '#a78bfa', 'Base legal', 'Decreto 27-92 Art. 47–48 y complementos del Decreto 10-2012.'],
    ['🧮', '#6ee7b7', 'Cálculo simple', 'IVA = Ventas del mes × 5%. Se paga del 1 al 10 del siguiente mes.'],
    ['📄', '#fbbf24', 'Formulario SAT-2046', 'Se llena en línea en portal.sat.gob.gt. Guarda siempre la constancia.'],
    ['📚', '#f9a8d4', 'LET obligatorio', 'El libro electrónico de ventas se presenta mensualmente junto con la declaración.'],
    ['🚨', '#fca5a5', 'No declarar = Q 1,000+', 'La multa mínima es Q 1,000 más intereses y recargo por mora.'],
    ['🌐', '#67e8f9', 'Agencia Virtual', 'En portal.sat.gob.gt puedes ver, descargar y verificar todos tus formularios.'],
  ];
  return (
    <div style={SLIDE_BG}>
      <SlideTitle>Lo más importante que llevas hoy</SlideTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(200px, 45%, 340px), 1fr))', gap: 10, flex: 1 }}>
        {puntos.map(([icon, color, title, desc], i) => (
          <div key={i} className={`ps-up ps-d${Math.min(i + 1, 9)}`}
            style={{ ...panel('rgba(255,255,255,0.07)', 'rgba(255,255,255,0.025)'), display: 'flex', gap: 10 }}>
            <span style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', flexShrink: 0 }}>{icon}</span>
            <div>
              <div style={{ color, fontWeight: 700, fontSize: 'clamp(0.75rem, 1.4vw, 0.85rem)' }}>{title}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 'clamp(0.65rem, 1.2vw, 0.76rem)', marginTop: 3, lineHeight: 1.5 }}>{desc}</div>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="ps-up ps-d1" style={{ ...panel('rgba(147,51,234,0.3)', 'rgba(147,51,234,0.07)') }}>
          <div style={{ color: '#c084fc', fontWeight: 700, fontSize: 'clamp(0.78rem, 1.5vw, 0.9rem)', marginBottom: 10 }}>📋 Datos del ejercicio</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 'clamp(0.72rem, 1.4vw, 0.85rem)' }}>
            {[
              ['Contribuyente', 'Comercial San José'],
              ['NIT', '7654321-K'],
              ['Régimen', 'Pequeño Contribuyente'],
              ['Período', 'Noviembre 2024'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 4 }}>
                <span style={{ color: 'rgba(255,255,255,0.45)' }}>{k}</span>
                <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="ps-up ps-d2" style={{ ...panel('rgba(255,255,255,0.07)', 'rgba(255,255,255,0.025)') }}>
          <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 'clamp(0.78rem, 1.5vw, 0.9rem)', marginBottom: 10 }}>🧾 Facturas del mes</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'clamp(0.7rem, 1.4vw, 0.82rem)', fontVariantNumeric: 'tabular-nums' }}>
            <tbody>
              {[['F-101', 'Q 3,200.00'], ['F-102', 'Q 7,400.00'], ['F-103', 'Q 1,850.00'], ['F-104', 'Q 4,550.00'], ['F-105', 'Q 2,100.00']].map(([f, m]) => (
                <tr key={f} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '5px 0', color: '#c084fc', fontWeight: 600 }}>{f}</td>
                  <td style={{ padding: '5px 0', color: '#e2e8f0', textAlign: 'right' }}>{m}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="ps-up ps-d3" style={{ ...panel('rgba(16,185,129,0.3)', 'rgba(16,185,129,0.07)') }}>
          <div style={{ color: '#6ee7b7', fontWeight: 700, fontSize: 'clamp(0.78rem, 1.5vw, 0.9rem)', marginBottom: 10 }}>✅ Actividades a realizar</div>
          <NumberedList color="#10b981" items={[
            'Calcular el total de ventas del mes.',
            'Aplicar la tasa del 5% para determinar el IVA a pagar.',
            'Llenar el libro de ventas en Excel con los 5 registros.',
            'Completar el Formulario SAT-2046 con los datos del mes.',
            'Calcular la multa si el pago se realizara el 20 de diciembre.',
          ]} />
        </div>
        <div className="ps-up ps-d8" style={{ ...panel('rgba(245,158,11,0.3)', 'rgba(245,158,11,0.07)') }}>
          <p style={{ color: '#fcd34d', fontSize: 'clamp(0.72rem, 1.4vw, 0.82rem)', margin: 0, fontWeight: 600 }}>
            💡 Recuerda: el plazo para pagar el IVA de noviembre vence el 10 de diciembre.
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
    <div style={{ position: 'relative', zIndex: 1, maxWidth: 620, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <img src="/K_white.png" alt="KONTAXES" className="ps-up"
        style={{ height: 'clamp(2.5rem, 6vw, 4.5rem)', marginBottom: '1.5rem', filter: 'drop-shadow(0 0 28px rgba(147,51,234,0.75))' }} />
      <div className="ps-up ps-d1" style={badge('#a78bfa', 'rgba(139,92,246,0.15)', 'rgba(139,92,246,0.3)')}>
        Taller · Apoyo Social · Gratuito
      </div>
      <h2 className="ps-up ps-d2" style={{ ...T('clamp(2.5rem, 8vw, 6rem)', 900), margin: '1rem 0 0.5rem' }}>
        ¡Gracias!
      </h2>
      <p className="ps-up ps-d3" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(0.85rem, 2vw, 1.1rem)', fontStyle: 'italic', marginBottom: '1.5rem', textAlign: 'center' }}>
        "Cada número que entiendes hoy<br />es una decisión que tomarás bien mañana."
      </p>
      <div className="ps-up ps-d4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{ ...panel('rgba(255,255,255,0.1)', 'rgba(255,255,255,0.04)'), display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', padding: '12px 24px' }}>
          {[['📧', 'info@kontaxes.com'], ['📞', '+502 3517-4713'], ['🌐', 'kontaxes.com']].map(([icon, val]) => (
            <div key={val} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.55)', fontSize: 'clamp(0.75rem, 1.5vw, 0.88rem)' }}>
              <span>{icon}</span><span>{val}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="ps-up ps-d5" style={{ marginTop: '1.5rem' }}>
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 'clamp(0.8rem, 1.8vw, 1rem)' }}>
          ¿Preguntas? 🙋
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
